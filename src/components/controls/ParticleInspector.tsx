import React from 'react';
import { Particle, Vector2D } from '../../types/physics';
import { formatCharge } from '../../utils/units';

interface ParticleInspectorProps {
  particle: Particle | null;
  onUpdateCharge: (id: string, newCharge: number) => void;
  onRemove: (id: string) => void;
}

export const ParticleInspector: React.FC<ParticleInspectorProps> = ({
  particle,
  onUpdateCharge,
  onRemove,
}) => {
  if (!particle) {
    return (
      <div className="glass-panel" style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
        👉 Haz clic en una carga para inspeccionar y modificar sus propiedades físicas.
      </div>
    );
  }

  const pos = particle.position as Vector2D;
  const chargeMicroC = particle.charge * 1e6;
  const isPos = particle.charge >= 0;

  return (
    <div className="glass-panel-elevated" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`badge ${isPos ? 'badge-pos' : 'badge-neg'}`}>
            {isPos ? '+ Carga Positiva' : '− Carga Negativa'}
          </span>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
            {particle.label}
          </span>
        </div>
        <button
          onClick={() => onRemove(particle.id)}
          className="btn btn-danger"
          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
        >
          Eliminar
        </button>
      </div>

      {/* Posición en cm */}
      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: '8px' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
          Vector de Posición r (x, y):
        </div>
        <div className="font-mono" style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>
          x = {(pos.x * 100).toFixed(2)} cm &nbsp;|&nbsp; y = {(pos.y * 100).toFixed(2)} cm
        </div>
      </div>

      {/* Control de Carga */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Magnitud de Carga q:</span>
          <span className="font-mono" style={{ fontWeight: 600, color: isPos ? '#fca5a5' : '#93c5fd' }}>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          <span>-10 µC</span>
          <span>0</span>
          <span>+10 µC</span>
        </div>
      </div>

      {/* Inversión rápida de signo */}
      <button
        onClick={() => onUpdateCharge(particle.id, -particle.charge)}
        className="btn btn-secondary"
        style={{ fontSize: '0.8rem', padding: '6px 12px' }}
      >
        Invertir Polaridad ({isPos ? 'Hacer Negativa −' : 'Hacer Positiva +'})
      </button>
    </div>
  );
};
