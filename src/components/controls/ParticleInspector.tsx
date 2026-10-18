import React from 'react';
import { Particle, Vector2D } from '../../types/physics';
import { formatCharge } from '../../utils/units';

interface ParticleInspectorProps {
  particle: Particle | null;
  onUpdateCharge: (id: string, newCharge: number) => void;
  onRemove: (id: string) => void;
  onUpdatePosition?: (id: string, newPosition: Vector2D) => void;
}

export const ParticleInspector: React.FC<ParticleInspectorProps> = ({
  particle,
  onUpdateCharge,
  onRemove,
  onUpdatePosition,
}) => {
  if (!particle) {
    return (
      <div
        style={{
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '24px 18px',
          color: 'var(--text-muted)',
          fontSize: '0.8rem',
          textAlign: 'center',
          background: 'var(--bg-surface)',
        }}
      >
        Selecciona una partícula en el plano para calibrar sus atributos.
      </div>
    );
  }

  const pos = particle.position as Vector2D;
  const chargeMicroC = particle.charge * 1e6;
  const isPos = particle.charge >= 0;

  const posXcm = parseFloat((pos.x * 100).toFixed(1));
  const posYcm = parseFloat((pos.y * 100).toFixed(1));

  const handleXChange = (valStr: string) => {
    if (!onUpdatePosition) return;
    const val = parseFloat(valStr);
    if (!isNaN(val)) {
      // Limitar entre -14 cm y +14 cm
      const clamped = Math.max(-14, Math.min(14, val));
      onUpdatePosition(particle.id, { ...pos, x: clamped / 100 });
    }
  };

  const handleYChange = (valStr: string) => {
    if (!onUpdatePosition) return;
    const val = parseFloat(valStr);
    if (!isNaN(val)) {
      // Limitar entre -14 cm y +14 cm
      const clamped = Math.max(-14, Math.min(14, val));
      onUpdatePosition(particle.id, { ...pos, y: clamped / 100 });
    }
  };

  return (
    <div
      style={{
        border: '1px solid var(--border-medium)',
        borderRadius: '8px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        background: 'var(--bg-surface)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.72rem', color: isPos ? 'var(--charge-pos)' : 'var(--charge-neg)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {isPos ? 'Polaridad positiva' : 'Polaridad negativa'}
          </span>
          <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {particle.label}
          </div>
        </div>

        <button
          onClick={() => onRemove(particle.id)}
          className="btn btn-danger"
          style={{ padding: '4px 10px', fontSize: '0.72rem' }}
        >
          Eliminar
        </button>
      </div>

      {/* Posición en cm con campos de entrada manual */}
      <div style={{ background: 'var(--bg-surface-elevated)', padding: '12px 14px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Coordenadas cartesianas (cm)
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Rango: &plusmn;14 cm
          </span>
        </div>

        {onUpdatePosition ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                Eje X (cm)
              </label>
              <input
                type="number"
                step="0.5"
                min="-14"
                max="14"
                value={posXcm}
                onChange={(e) => handleXChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-medium)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                Eje Y (cm)
              </label>
              <input
                type="number"
                step="0.5"
                min="-14"
                max="14"
                value={posYcm}
                onChange={(e) => handleYChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-medium)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        ) : (
          <div className="font-mono" style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>
            x = {posXcm.toFixed(2)} cm &nbsp;&middot;&nbsp; y = {posYcm.toFixed(2)} cm
          </div>
        )}
      </div>

      {/* Control de Carga */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '8px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Magnitud de carga q</span>
          <span className="font-mono" style={{ fontWeight: 600, color: isPos ? 'var(--charge-pos)' : 'var(--charge-neg)' }}>
            {formatCharge(particle.charge)}
          </span>
        </div>

        <input
          type="range"
          min="-10"
          max="10"
          step="0.5"
          value={chargeMicroC}
          onChange={(e) => onUpdateCharge(particle.id, parseFloat(e.target.value) * 1e-6)}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
          <span>−10 µC</span>
          <span>0</span>
          <span>+10 µC</span>
        </div>
      </div>
    </div>
  );
};
