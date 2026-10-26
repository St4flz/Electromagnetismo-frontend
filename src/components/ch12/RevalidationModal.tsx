import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export interface RevalidationData {
  design_id: number;
  a_mm: number;
  d_mm: number;
  w_mm: number;
  periods: number;
  family: string;
  f0_ghz: number;
  dx_fast_mm: number;
  t_f0_fast: number;
  t_f0_fast_db: number;
  f2_fast: number;
  time_fast_s: number;
  dx_fine_mm: number;
  t_f0_fine: number;
  t_f0_fine_db: number;
  f2_fine: number;
  time_fine_s: number;
  delta_t_db: number;
  delta_t_linear: number;
  passed_tolerance: boolean;
  tolerance_threshold_db: number;
  freqs_ghz: number[];
  t_fast_spectrum: number[];
  t_fine_spectrum: number[];
  r_fast_spectrum: number[];
  r_fine_spectrum: number[];
}

interface RevalidationModalProps {
  data: RevalidationData | null;
  onClose: () => void;
}

export const RevalidationModal: React.FC<RevalidationModalProps> = ({ data, onClose }) => {
  if (!data) return null;

  const chartData = data.freqs_ghz.map((f, i) => ({
    freq: f,
    t_fast: data.t_fast_spectrum[i],
    t_fine: data.t_fine_spectrum[i],
    r_fast: data.r_fast_spectrum[i],
    r_fine: data.r_fine_spectrum[i],
  }));

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(2, 6, 23, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: '#0b1329',
          border: '1px solid #334155',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '850px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#f8fafc', fontWeight: 600 }}>
              🔬 Re-validación del Diseño Ganador en Malla Fina (Δx/2)
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Comprobación de invariancia de resolución física: Δx = 0.50 mm vs Δx = 0.25 mm
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Veredicto de Rigor Físico */}
        <div
          style={{
            background: data.passed_tolerance ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${data.passed_tolerance ? '#10b981' : '#ef4444'}`,
            borderRadius: '10px',
            padding: '14px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <strong
              style={{
                color: data.passed_tolerance ? '#10b981' : '#ef4444',
                fontSize: '1rem',
                display: 'block',
              }}
            >
              {data.passed_tolerance ? '✓ CRITERIO DE RIGOR CUMPLIDO: |ΔT(f₀)| < 2.0 dB' : '✗ DISCREPANCIA SUPERA EL LÍMITE'}
            </strong>
            <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
              La respuesta electromagnética del filtro metamaterial se conserva fielmente al duplicar la resolución.
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Discrepancia |ΔT(f₀)|</span>
            <strong
              style={{
                fontSize: '1.3rem',
                color: data.passed_tolerance ? '#10b981' : '#ef4444',
              }}
            >
              {data.delta_t_db.toFixed(2)} dB
            </strong>
          </div>
        </div>

        {/* Tabla comparativa de resoluciones */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div
            style={{
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              padding: '14px',
            }}
          >
            <div style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600, marginBottom: '8px' }}>
              Malla Rápida de Exploración (Δx = {data.dx_fast_mm} mm)
            </div>
            <div style={{ fontSize: '0.85rem', color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>Transmisión T(f₀): <strong>{(data.t_f0_fast * 100).toFixed(1)}%</strong> ({data.t_f0_fast_db.toFixed(1)} dB)</div>
              <div>Aptitud F₂: <strong>{data.f2_fast.toFixed(4)}</strong></div>
              <div>Tiempo de cómputo: <strong>{data.time_fast_s.toFixed(2)} s</strong></div>
            </div>
          </div>

          <div
            style={{
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              padding: '14px',
            }}
          >
            <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600, marginBottom: '8px' }}>
              Malla Fina de Validación (Δx = {data.dx_fine_mm} mm)
            </div>
            <div style={{ fontSize: '0.85rem', color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>Transmisión T(f₀): <strong>{(data.t_f0_fine * 100).toFixed(1)}%</strong> ({data.t_f0_fine_db.toFixed(1)} dB)</div>
              <div>Aptitud F₂: <strong>{data.f2_fine.toFixed(4)}</strong></div>
              <div>Tiempo de cómputo: <strong>{data.time_fine_s.toFixed(2)} s</strong></div>
            </div>
          </div>
        </div>

        {/* Gráfica de Superposición Espectral */}
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: '#f8fafc', fontWeight: 600 }}>
            Superposición de Espectros T(f) en Ambas Resoluciones
          </h4>
          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="freq"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  label={{ value: 'Frecuencia (GHz)', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 11 }}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  domain={[0, 1.05]}
                  label={{ value: 'Transmisión T(f)', angle: -90, position: 'insideLeft', offset: 15, fill: '#64748b', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                  }}
                  formatter={(val: any) => [Number(val).toFixed(4), '']}
                />
                <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: '0.8rem' }} />
                <Line
                  type="monotone"
                  dataKey="t_fast"
                  name="T(f) Malla Rápida (0.50 mm)"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="t_fine"
                  name="T(f) Malla Fina (0.25 mm)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px',
              background: '#334155',
              border: 'none',
              borderRadius: '8px',
              color: '#f8fafc',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Cerrar Reporte
          </button>
        </div>
      </div>
    </div>
  );
};
