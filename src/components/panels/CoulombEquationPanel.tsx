import React from 'react';
import { Particle, CoulombForce } from '../../types/physics';
import { EquationDisplay } from '../educational/EquationDisplay';
import { formatForce, formatDistance, formatCharge } from '../../utils/units';

interface CoulombEquationPanelProps {
  particles: Particle[];
  forces: CoulombForce[];
}

export const CoulombEquationPanel: React.FC<CoulombEquationPanelProps> = ({
  particles,
  forces,
}) => {
  if (particles.length < 2 || forces.length === 0) {
    return (
      <div className="lab-card" style={{ padding: '18px' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
          Formulación de Coulomb (1785)
        </h3>
        <EquationDisplay math="F_{12} = k_e \frac{q_1 q_2}{r^2} \hat{r}_{12}" />
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px' }}>
          Se requieren al menos 2 partículas para evaluar el tensor de interacción mutua.
        </p>
      </div>
    );
  }

  const p1 = particles[0];
  const p2 = particles[1];
  const force = forces[0];

  const q1C = p1.charge;
  const q2C = p2.charge;
  const r = force ? force.distance : 0.05;
  const fMag = force ? force.forceMagnitude : 0;
  const isAttr = force ? force.isAttractive : false;

  // Formato compacto y adaptativo para que quepa holgadamente sin desbordamiento
  const latexFormula = `F_{12} = k_e \\frac{|q_1| |q_2|}{r^2}`;
  const latexSubstituted = `F_{12} = (8.99 \\cdot 10^9) \\frac{(${Math.abs(q1C).toExponential(1)}) (${Math.abs(q2C).toExponential(1)})}{(${r.toFixed(3)})^2}`;
  const latexResult = `|F_{12}| = ${formatForce(fMag)}`;

  return (
    <div className="lab-card-elevated" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <h3 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Evaluación Numérica
        </h3>
        <span
          className="badge"
          style={{
            fontSize: '0.7rem',
            background: isAttr ? 'rgba(192, 132, 252, 0.12)' : 'rgba(245, 158, 11, 0.12)',
            color: isAttr ? '#d8b4fe' : '#fcd34d',
            border: isAttr ? '1px solid rgba(192, 132, 252, 0.25)' : '1px solid rgba(245, 158, 11, 0.25)',
          }}
        >
          {isAttr ? 'Atracción (Opuestos)' : 'Repulsión (Idénticos)'}
        </span>
      </div>

      <div
        style={{
          background: 'rgba(3, 7, 18, 0.55)',
          padding: '14px',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
          overflowX: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div style={{ fontSize: '0.95rem' }}>
          <EquationDisplay math={latexFormula} />
        </div>
        <div style={{ borderTop: '1px solid var(--border-subtle)' }} />
        <div style={{ fontSize: '0.88rem', overflowX: 'auto', paddingBottom: '2px' }}>
          <EquationDisplay math={latexSubstituted} />
        </div>
        <div style={{ borderTop: '1px solid var(--border-subtle)' }} />
        <div style={{ fontSize: '0.95rem', color: isAttr ? '#d8b4fe' : '#fcd34d' }}>
          <EquationDisplay math={latexResult} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '0.73rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ color: 'var(--text-muted)' }}>Carga q1</div>
          <div className="font-mono" style={{ fontWeight: 600, color: '#fda4af', marginTop: '2px' }}>{formatCharge(q1C)}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ color: 'var(--text-muted)' }}>Carga q2</div>
          <div className="font-mono" style={{ fontWeight: 600, color: '#7dd3fc', marginTop: '2px' }}>{formatCharge(q2C)}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ color: 'var(--text-muted)' }}>Distancia r</div>
          <div className="font-mono" style={{ fontWeight: 600, color: '#fcd34d', marginTop: '2px' }}>{formatDistance(r)}</div>
        </div>
      </div>
    </div>
  );
};
