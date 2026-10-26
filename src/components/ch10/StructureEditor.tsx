import React from 'react';
import { UnitCellParams } from './FieldCanvas';

interface StructureEditorProps {
  geometry: UnitCellParams;
  onChange: (updated: UnitCellParams) => void;
  dxMm: number;
  onDxChange: (dx: number) => void;
  isSimulating: boolean;
}

export const StructureEditor: React.FC<StructureEditorProps> = ({
  geometry,
  onChange,
  dxMm,
  onDxChange,
  isSimulating,
}) => {
  const applyPreset = (presetName: string) => {
    switch (presetName) {
      case 'vacuum':
        onChange({
          a_mm: 10.0,
          d_mm: 0.0,
          w_mm: 0.0,
          periods: 1,
          family: 'rod_array',
          relative_permittivity: 1.0,
          conductivity: 0.0,
          is_pec: false,
        });
        break;
      case 'slab_airy':
        onChange({
          a_mm: 10.0,
          d_mm: 10.0,
          w_mm: 10.0,
          periods: 1,
          family: 'rod_array',
          relative_permittivity: 4.0,
          conductivity: 0.0,
          is_pec: false,
        });
        break;
      case 'rods_alumina':
        onChange({
          a_mm: 10.0,
          d_mm: 3.5,
          w_mm: 3.5,
          periods: 3,
          family: 'rod_array',
          relative_permittivity: 9.8,
          conductivity: 0.0,
          is_pec: false,
        });
        break;
      case 'square_ring_pec':
        onChange({
          a_mm: 10.0,
          d_mm: 6.0,
          w_mm: 1.0,
          periods: 3,
          family: 'square_ring',
          relative_permittivity: 1.0,
          conductivity: 0.0,
          is_pec: true,
        });
        break;
      case 'wire_plasma':
        onChange({
          a_mm: 10.0,
          d_mm: 1.0,
          w_mm: 1.0,
          periods: 3,
          family: 'rod_array',
          relative_permittivity: 1.0,
          conductivity: 0.0,
          is_pec: true,
        });
        break;
    }
  };

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
          Parámetros de la Celda Unitaria
        </h3>
        <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
          Banda X: 5 a 15 GHz
        </span>
      </div>

      {/* Selector de Presets Físicos */}
      <div>
        <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
          Presets Físicos de Referencia (README Casos 1–3 y Benchmarks):
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '6px' }}>
          {[
            { id: 'vacuum', label: '1. Vacío Puro (V1)' },
            { id: 'slab_airy', label: '2. Lámina Airy (V5)' },
            { id: 'rods_alumina', label: '3. Varillas Alúmina' },
            { id: 'square_ring_pec', label: '4. Anillos PEC (Filtro)' },
            { id: 'wire_plasma', label: '5. Hilos Plasma (V11)' },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.id)}
              disabled={isSimulating}
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontSize: '0.72rem',
                padding: '6px 8px',
                borderRadius: '6px',
                cursor: isSimulating ? 'not-allowed' : 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isSimulating) {
                  e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSimulating) {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Familia Topológica */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Familia Topológica:
          </label>
          <select
            value={geometry.family}
            onChange={(e) => onChange({ ...geometry, family: e.target.value as any })}
            disabled={isSimulating}
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
            <option value="rod_array">Familia B: Varillas Cuadradas</option>
            <option value="square_ring">Familia C: Anillos Concéntricos</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Naturaleza del Material:
          </label>
          <select
            value={geometry.is_pec ? 'pec' : 'dielectric'}
            onChange={(e) => onChange({ ...geometry, is_pec: e.target.value === 'pec' })}
            disabled={isSimulating}
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
            <option value="dielectric">Dieléctrico (Permitividad ε_r)</option>
            <option value="pec">Metal Conductor Perfecto (PEC)</option>
          </select>
        </div>
      </div>

      {/* Sliders Geométricos: a, d, w, periodos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {/* Periodo a */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '2px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Periodo transversal (a):</span>
            <strong style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{geometry.a_mm.toFixed(1)} mm</strong>
          </div>
          <input
            type="range"
            min={4.0}
            max={20.0}
            step={0.5}
            value={geometry.a_mm}
            onChange={(e) => {
              const newA = parseFloat(e.target.value);
              const newW = Math.min(geometry.w_mm, newA);
              const newD = Math.min(geometry.d_mm, newA);
              onChange({ ...geometry, a_mm: newA, w_mm: newW, d_mm: newD });
            }}
            disabled={isSimulating}
            style={{ width: '100%' }}
          />
        </div>

        {/* Separación / Lado d */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '2px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              {geometry.family === 'square_ring' ? 'Margen exterior (d):' : 'Separación longitudinal (d):'}
            </span>
            <strong style={{ color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)' }}>{geometry.d_mm.toFixed(1)} mm</strong>
          </div>
          <input
            type="range"
            min={0.0}
            max={Math.min(geometry.a_mm, 18.0)}
            step={0.25}
            value={geometry.d_mm}
            onChange={(e) => {
              const newD = parseFloat(e.target.value);
              let newW = geometry.w_mm;
              if (geometry.family === 'square_ring' && (geometry.a_mm - newD) <= 2 * newW) {
                newW = Math.max(0.25, (geometry.a_mm - newD - 0.5) / 2.0);
              }
              onChange({ ...geometry, d_mm: newD, w_mm: newW });
            }}
            disabled={isSimulating}
            style={{ width: '100%' }}
          />
        </div>

        {/* Grosor de elemento w (aplica a ambas familias) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '2px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              {geometry.family === 'square_ring' ? 'Grosor traza (w):' : 'Lado varilla / Espesor (w):'}
            </span>
            <strong style={{ color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>{geometry.w_mm.toFixed(2)} mm</strong>
          </div>
          <input
            type="range"
            min={geometry.family === 'square_ring' ? 0.25 : 0.0}
            max={
              geometry.family === 'square_ring'
                ? Math.max(0.25, (geometry.a_mm - geometry.d_mm) / 2.0 - 0.25)
                : geometry.a_mm
            }
            step={0.25}
            value={geometry.w_mm}
            onChange={(e) => onChange({ ...geometry, w_mm: parseFloat(e.target.value) })}
            disabled={isSimulating}
            style={{ width: '100%' }}
          />
        </div>

        {/* Repeticiones longitudinales */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '2px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Periodos en x:</span>
            <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{geometry.periods} capas</strong>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={geometry.periods}
            onChange={(e) => onChange({ ...geometry, periods: parseInt(e.target.value, 10) })}
            disabled={isSimulating}
            style={{ width: '100%' }}
          />
        </div>

        {/* Permitividad ε_r (si es dieléctrico) */}
        {!geometry.is_pec && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '2px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Permitividad relativa (ε_r):</span>
              <strong style={{ color: 'var(--accent-purple)', fontFamily: 'var(--font-mono)' }}>{geometry.relative_permittivity.toFixed(1)}</strong>
            </div>
            <input
              type="range"
              min={1.0}
              max={16.0}
              step={0.2}
              value={geometry.relative_permittivity}
              onChange={(e) => onChange({ ...geometry, relative_permittivity: parseFloat(e.target.value) })}
              disabled={isSimulating}
              style={{ width: '100%' }}
            />
          </div>
        )}

        {/* Modo de resolución espacial dx */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '2px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Malla (Δx = Δy):</span>
            <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{dxMm.toFixed(2)} mm</strong>
          </div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
            <button
              onClick={() => onDxChange(0.5)}
              disabled={isSimulating}
              style={{
                flex: 1,
                padding: '4px',
                borderRadius: '4px',
                fontSize: '0.72rem',
                background: dxMm === 0.5 ? 'var(--accent-cyan)' : 'var(--bg-surface-elevated)',
                color: dxMm === 0.5 ? '#030712' : 'var(--text-secondary)',
                fontWeight: dxMm === 0.5 ? 600 : 400,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Rápido (0.5 mm)
            </button>
            <button
              onClick={() => onDxChange(0.25)}
              disabled={isSimulating}
              style={{
                flex: 1,
                padding: '4px',
                borderRadius: '4px',
                fontSize: '0.72rem',
                background: dxMm === 0.25 ? 'var(--accent-cyan)' : 'var(--bg-surface-elevated)',
                color: dxMm === 0.25 ? '#030712' : 'var(--text-secondary)',
                fontWeight: dxMm === 0.25 ? 600 : 400,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Fino (0.25 mm)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
