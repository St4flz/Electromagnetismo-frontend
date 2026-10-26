import React, { useState, useEffect } from 'react';

export interface ValidationItem {
  caseId: string;
  name: string;
  description: string;
  measured: string;
  tolerance: string;
  isVerified: boolean;
  details?: Record<string, any>;
}

export const ValidationPanel: React.FC = () => {
  const [results, setResults] = useState<ValidationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastRunTime, setLastRunTime] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const runValidations = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/fdtd/validate');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const items: ValidationItem[] = [
        {
          caseId: 'V1',
          name: 'Vacío Puro: Transmisión Unitaria',
          description: 'Propagación sin medio dispersivo -> T(f) == 1.000',
          measured: `Error máx: ${data.V1?.max_error_percent ?? 0}%`,
          tolerance: '< 1.0% en 7-13 GHz',
          isVerified: Boolean(data.V1?.is_verified),
          details: data.V1,
        },
        {
          caseId: 'V2',
          name: 'Frontera CPML: Absorción Residual',
          description: 'Reflexión en extremo de la caja computacional -> R < -40 dB',
          measured: `Reflexión: ${data.V2?.max_reflection_db ?? 0} dB`,
          tolerance: '< -40 dB',
          isVerified: Boolean(data.V2?.is_verified),
          details: data.V2,
        },
        {
          caseId: 'V3',
          name: 'Fuente TF/SF: Supresión de Fuga',
          description: 'Campo residual espurio en región de campo dispersado (SF)',
          measured: `Fuga: ${data.V3?.leakage_db ?? -200} dB`,
          tolerance: '< -60 dB',
          isVerified: Boolean(data.V3?.is_verified),
          details: data.V3,
        },
        {
          caseId: 'V4',
          name: 'Velocidad de Fase y Dispersión Yee',
          description: 'Velocidad de propagación FDTD vs dispersión numérica teórica',
          measured: `Error vs Yee: ${data.V4?.error_vs_dispersion_percent ?? 0}%`,
          tolerance: '< 0.5% a 10 GHz',
          isVerified: Boolean(data.V4?.is_verified),
          details: data.V4,
        },
        {
          caseId: 'V5',
          name: 'Lámina Dieléctrica (Airy Fabry-Pérot)',
          description: 'Lámina ε_r = 4.0, L = 10 mm comparada contra fórmula analítica',
          measured: `RMS error: ${data.V5?.rms_error ?? 0}`,
          tolerance: 'RMS < 0.025',
          isVerified: Boolean(data.V5?.is_verified),
          details: data.V5,
        },
        {
          caseId: 'V6',
          name: 'Espejo de Bragg 1D (Matriz TMM)',
          description: 'Multicapa periódica de 4 pares comparada contra TMM exacto',
          measured: `RMS error: ${data.V6?.rms_error ?? 0}`,
          tolerance: 'RMS < 0.040',
          isVerified: Boolean(data.V6?.is_verified),
          details: data.V6,
        },
        {
          caseId: 'V7',
          name: 'Conservación Estricta de Energía',
          description: 'Arreglo sin pérdidas (Alúmina ε=9.8) con R y T independientes',
          measured: `Desv máx |R+T-1|: ${data.V7?.max_energy_deviation ?? 0}`,
          tolerance: '< 0.035 (3.5%)',
          isVerified: Boolean(data.V7?.is_verified),
          details: data.V7,
        },
        {
          caseId: 'V8',
          name: 'Pasividad en Medio Disipativo',
          description: 'Lámina conductora (σ > 0) -> A(f) = 1 - T - R > 0',
          measured: `Absorción media: ${data.V8?.mean_absorption ?? 0}`,
          tolerance: 'A ≥ 0 (termodinámica)',
          isVerified: Boolean(data.V8?.is_verified),
          details: data.V8,
        },
        {
          caseId: 'V9',
          name: 'Convergencia Espacial de Orden 2',
          description: 'Reducción de error al refinar la malla Δx, Δx/2',
          measured: `Ratio reducción: ${data.V9?.error_reduction_ratio ?? 0}`,
          tolerance: 'Orden efectivo > 1.4',
          isVerified: Boolean(data.V9?.is_verified),
          details: data.V9,
        },
        {
          caseId: 'V10',
          name: 'Teorema de Estabilidad CFL en 2D',
          description: 'Estable con S=0.70 (<1/√2 ≈ 0.7071) e inestable con S=1.05',
          measured: data.V10?.is_verified ? 'S=0.70 estable / S=1.05 explota' : 'Fallo',
          tolerance: 'Límite CFL = 0.7071',
          isVerified: Boolean(data.V10?.is_verified),
          details: data.V10,
        },
        {
          caseId: 'V11',
          name: 'Medio de Hilos PEC (Belov / Pendry)',
          description: 'Opaco para f < f_p (comportamiento de plasma ε_eff < 0)',
          measured: `T sub-plasma: ${data.V11?.mean_transmission_below_plasma ?? 0}`,
          tolerance: 'T < 0.15 por debajo de f_p',
          isVerified: Boolean(data.V11?.is_verified),
          details: data.V11,
        },
      ];

      setResults(items);
      setLastRunTime(new Date().toLocaleTimeString());
    } catch (err: any) {
      setErrorMsg(`Error al conectar con /api/fdtd/validate: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runValidations();
  }, []);

  const verifiedCount = results.filter((r) => r.isVerified).length;
  const allVerified = results.length > 0 && verifiedCount === results.length;

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderRadius: '10px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '0.96rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Batería de Validación Física y Matemática (V1 a V11)</span>
            {results.length > 0 && (
              <span
                style={{
                  background: allVerified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: allVerified ? '#10b981' : '#ef4444',
                  border: `1px solid ${allVerified ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {verifiedCount} / {results.length} Verificados
              </span>
            )}
          </h3>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Cada caso es una prueba física no tautológica con solución analítica contrastada contra el solver numérico.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {lastRunTime && (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Última ejecución: {lastRunTime}
            </span>
          )}
          <button
            onClick={runValidations}
            disabled={isLoading}
            style={{
              background: 'var(--accent-cyan)',
              color: '#030712',
              fontWeight: 600,
              fontSize: '0.76rem',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: isLoading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {isLoading ? 'Ejecutando batería FDTD...' : '▶ Re-ejecutar V1–V11'}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '10px', borderRadius: '6px', color: '#ef4444', fontSize: '0.76rem' }}>
          {errorMsg}
        </div>
      )}

      {/* Tabla de Resultados */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-medium)', textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={{ padding: '8px 6px', width: '50px' }}>Caso</th>
              <th style={{ padding: '8px 10px' }}>Prueba y Fundamento Físico</th>
              <th style={{ padding: '8px 10px' }}>Valor Medido FDTD</th>
              <th style={{ padding: '8px 10px' }}>Criterio de Tolerancia</th>
              <th style={{ padding: '8px 6px', textAlign: 'center', width: '90px' }}>Veredicto</th>
            </tr>
          </thead>
          <tbody>
            {results.map((item, idx) => (
              <tr
                key={item.caseId}
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  background: idx % 2 === 0 ? 'transparent' : 'rgba(148, 163, 184, 0.02)',
                }}
              >
                <td style={{ padding: '10px 6px', fontWeight: 600, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                  {item.caseId}
                </td>
                <td style={{ padding: '10px 10px' }}>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{item.description}</div>
                </td>
                <td style={{ padding: '10px 10px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                  {item.measured}
                </td>
                <td style={{ padding: '10px 10px', color: 'var(--text-secondary)' }}>
                  {item.tolerance}
                </td>
                <td style={{ padding: '10px 6px', textAlign: 'center' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      background: item.isVerified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: item.isVerified ? '#10b981' : '#ef4444',
                      border: `1px solid ${item.isVerified ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    }}
                  >
                    {item.isVerified ? '✔ PASA' : '✘ FALLO'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
