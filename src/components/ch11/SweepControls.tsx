import React from 'react';

export interface SweepConfig {
  parameterName: 'w_mm' | 'd_mm' | 'a_mm';
  base_a_mm: number;
  base_d_mm: number;
  base_w_mm: number;
  family: 'rod_array' | 'square_ring';
  periods: number;
  is_pec: boolean;
  relative_permittivity: number;
  f0_ghz: number;
  w1: number;
  w2: number;
  w3: number;
  dx_mm: number;
}

interface SweepControlsProps {
  config: SweepConfig;
  onChange: (cfg: SweepConfig) => void;
  onRun1DSweep: () => void;
  onRun2DSweep: () => void;
  onExportCsv: () => void;
  onRunRobustness: () => void;
  isLoading: boolean;
}

export const SweepControls: React.FC<SweepControlsProps> = ({
  config,
  onChange,
  onRun1DSweep,
  onRun2DSweep,
  onExportCsv,
  onRunRobustness,
  isLoading,
}) => {
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderRadius: '10px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Configuración del Barrido FDTD
        </h3>
        <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
          Filtro Notch f₀ = {config.f0_ghz.toFixed(1)} GHz
        </span>
      </div>

      {/* Selector de Parámetro a Barrer y Familia */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Parámetro a barrer (1D):
          </label>
          <select
            value={config.parameterName}
            onChange={(e) => onChange({ ...config, parameterName: e.target.value as any })}
            disabled={isLoading}
            style={{
              width: '100%',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
              padding: '6px 8px',
              borderRadius: '6px',
              fontSize: '0.78rem',
            }}
          >
            <option value="w_mm">Grosor de traza / pared (w)</option>
            <option value="d_mm">Dimensión exterior (d)</option>
            <option value="a_mm">Periodo de red (a)</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Topología del Metamaterial:
          </label>
          <select
            value={config.family}
            onChange={(e) => onChange({ ...config, family: e.target.value as any })}
            disabled={isLoading}
            style={{
              width: '100%',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
              padding: '6px 8px',
              borderRadius: '6px',
              fontSize: '0.78rem',
            }}
          >
            <option value="square_ring">Familia C: Anillos Concéntricos PEC</option>
            <option value="rod_array">Familia B: Arreglo de Varillas Cuadradas</option>
          </select>
        </div>
      </div>

      {/* Parámetros Base */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '0.74rem' }}>
        <div>
          <span style={{ color: 'var(--text-secondary)' }}>Periodo base (a):</span>
          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-cyan)' }}>
            {config.base_a_mm.toFixed(1)} mm
          </div>
        </div>
        <div>
          <span style={{ color: 'var(--text-secondary)' }}>Lado base (d):</span>
          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-gold)' }}>
            {config.base_d_mm.toFixed(1)} mm
          </div>
        </div>
        <div>
          <span style={{ color: 'var(--text-secondary)' }}>Grosor base (w):</span>
          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-emerald)' }}>
            {config.base_w_mm.toFixed(2)} mm
          </div>
        </div>
      </div>

      {/* Ponderaciones de la Función Objetivo F2 */}
      <div style={{ background: 'var(--bg-surface-elevated)', padding: '10px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Función Objetivo F₂: Selectividad de Banda</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)' }}>
            F₂ = {config.w1.toFixed(2)}·T(f₀) + {config.w2.toFixed(2)}·(1 - T_pasa) + {config.w3.toFixed(2)}·C
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.72rem' }}>
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Peso Rechazo f₀ (w₁):</span>
              <strong>{config.w1.toFixed(2)}</strong>
            </label>
            <input
              type="range"
              min={0.1}
              max={1.0}
              step={0.05}
              value={config.w1}
              onChange={(e) => onChange({ ...config, w1: parseFloat(e.target.value) })}
              disabled={isLoading}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Peso Banda de Paso (w₂):</span>
              <strong>{config.w2.toFixed(2)}</strong>
            </label>
            <input
              type="range"
              min={0.1}
              max={1.0}
              step={0.05}
              value={config.w2}
              onChange={(e) => onChange({ ...config, w2: parseFloat(e.target.value) })}
              disabled={isLoading}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
        <button
          onClick={onRun1DSweep}
          disabled={isLoading}
          style={{
            background: 'var(--accent-cyan)',
            color: '#030712',
            fontWeight: 600,
            fontSize: '0.76rem',
            padding: '8px 10px',
            borderRadius: '6px',
            border: 'none',
            cursor: isLoading ? 'wait' : 'pointer',
          }}
        >
          {isLoading ? 'Simulando...' : '▶ Barrido 1D (Curvas)'}
        </button>

        <button
          onClick={onRun2DSweep}
          disabled={isLoading}
          style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-primary)',
            fontWeight: 600,
            fontSize: '0.76rem',
            padding: '8px 10px',
            borderRadius: '6px',
            cursor: isLoading ? 'wait' : 'pointer',
          }}
        >
          🔥 Mapa de Calor 2D
        </button>

        <button
          onClick={onExportCsv}
          disabled={isLoading}
          style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            fontSize: '0.76rem',
            padding: '8px 10px',
            borderRadius: '6px',
            cursor: isLoading ? 'wait' : 'pointer',
          }}
        >
          📥 Exportar CSV
        </button>

        <button
          onClick={onRunRobustness}
          disabled={isLoading}
          style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--accent-gold)',
            fontSize: '0.76rem',
            padding: '8px 10px',
            borderRadius: '6px',
            cursor: isLoading ? 'wait' : 'pointer',
          }}
          title="Prueba formal: compara F2 en Δx y Δx/2 mediante correlación de Spearman"
        >
          ⚖ Robustez Spearman
        </button>
      </div>
    </div>
  );
};
