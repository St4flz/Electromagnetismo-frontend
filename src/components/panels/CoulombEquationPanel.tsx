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
      <div className="glass-panel" style={{ padding: '16px' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
          📐 Ley de Coulomb (1785)
        </h3>
        <EquationDisplay math="F_{12} = k_e \frac{q_1 q_2}{r^2} \hat{r}_{12}" />
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
          Se requieren al menos 2 cargas en el espacio para calcular la fuerza de interacción mutua.
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

  // Render LaTeX con sustitución exacta paso a paso
  const latexFormula = `F_{12} = k_e \\frac{|q_1| \\cdot |q_2|}{r^2}`;
  const latexSubstituted = `F_{12} = (8.99 \\times 10^9) \\frac{(${Math.abs(q1C).toExponential(2)}) \\cdot (${Math.abs(q2C).toExponential(2)})}{(${r.toFixed(3)})^2}`;
  const latexResult = `|F_{12}| = ${formatForce(fMag)} \\quad (${isAttr ? '\\text{Atracción}' : '\\text{Repulsión}'})`;

  return (
    <div className="glass-panel-elevated" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          📐 Ley de Coulomb — Cálculo en Tiempo Real
        </h3>
        <span className={`badge ${isAttr ? 'badge-neg' : 'badge-pos'}`}>
          {isAttr ? 'Atracción (Signos Opuestos)' : 'Repulsión (Mismo Signo)'}
        </span>
      </div>

      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '10px' }}>
        <EquationDisplay math={latexFormula} />
        <div style={{ margin: '8px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }} />
        <EquationDisplay math={latexSubstituted} />
        <div style={{ margin: '8px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }} />
        <EquationDisplay math={latexResult} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '0.75rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', padding: '8px', borderRadius: '6px' }}>
          <div style={{ color: 'var(--text-muted)' }}>Carga q₁</div>
          <div className="font-mono" style={{ fontWeight: 600, color: '#fca5a5' }}>{formatCharge(q1C)}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', padding: '8px', borderRadius: '6px' }}>
          <div style={{ color: 'var(--text-muted)' }}>Carga q₂</div>
          <div className="font-mono" style={{ fontWeight: 600, color: '#93c5fd' }}>{formatCharge(q2C)}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', padding: '8px', borderRadius: '6px' }}>
          <div style={{ color: 'var(--text-muted)' }}>Distancia r</div>
          <div className="font-mono" style={{ fontWeight: 600, color: '#67e8f9' }}>{formatDistance(r)}</div>
        </div>
      </div>
    </div>
  );
};
