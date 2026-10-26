import React from 'react';

interface ObjectiveComparisonCardProps {
  bestF1?: { design_id: number; a_mm: number; d_mm: number; w_mm: number; t_f0: number; t_pass_mean: number; f2_score: number };
  bestF2?: { design_id: number; a_mm: number; d_mm: number; w_mm: number; t_f0: number; t_pass_mean: number; f2_score: number };
}

export const ObjectiveComparisonCard: React.FC<ObjectiveComparisonCardProps> = ({ bestF1, bestF2 }) => {
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderRadius: '10px',
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '1.2rem' }}>⚠️</span>
        <h3 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Rigor en la Formulación: La Trampa Física de F₁ vs la Selectividad de F₂
        </h3>
      </div>

      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.55' }}>
        <p>
          En polarización TM con conductores perfectos (PEC), minimizar puramente la transmisión en la frecuencia central{' '}
          <strong style={{ color: 'var(--accent-cyan)' }}>F₁(p) = T(f₀)</strong> conduce a una{' '}
          <strong style={{ color: '#ef4444' }}>solución trivial y errónea</strong>: cerrar los huecos de la celda y formar una pared metálica continua. Dicha pared tiene{' '}
          <code style={{ color: '#ef4444' }}>T ≈ 0</code> en <em>todas</em> las frecuencias, careciendo de cualquier utilidad como filtro.
        </p>
        <p style={{ marginTop: '6px' }}>
          Para que el diseño y la optimización tengan sentido físico, la función objetivo debe exigir{' '}
          <strong style={{ color: '#10b981' }}>selectividad espectral</strong> mediante un filtro rechaza-banda (Notch Filter):
        </p>
      </div>

      <div style={{ background: '#030712', padding: '10px 14px', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: '#f1f5f9' }}>
        F₂(p) = w₁·T(f₀) + w₂·[ 1 - T_pasa ] + w₃·C(p)
      </div>

      {bestF1 && bestF2 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '4px' }}>
          {/* Tarjeta F1 */}
          <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontSize: '0.76rem', fontWeight: 600, color: '#ef4444' }}>
              Ganador con F₁ (Minimización pura T(f₀))
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Diseño #{bestF1.design_id}</div>
            <div style={{ marginTop: '8px', fontSize: '0.72rem', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div>T(f₀): <strong style={{ color: '#10b981' }}>{bestF1.t_f0.toFixed(4)}</strong> (Opaco)</div>
              <div>Transmisión banda paso (T_pasa): <strong style={{ color: '#ef4444' }}>{bestF1.t_pass_mean.toFixed(4)}</strong> (Bloqueado)</div>
              <div style={{ color: '#ef4444', fontSize: '0.68rem', marginTop: '4px' }}>
                ✘ Comportamiento de pared opaca: sin selectividad.
              </div>
            </div>
          </div>

          {/* Tarjeta F2 */}
          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontSize: '0.76rem', fontWeight: 600, color: '#10b981' }}>
              Ganador con F₂ (Filtro Selectivo Rechaza-Banda)
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Diseño #{bestF2.design_id}</div>
            <div style={{ marginTop: '8px', fontSize: '0.72rem', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div>T(f₀): <strong style={{ color: '#10b981' }}>{bestF2.t_f0.toFixed(4)}</strong> (Rechazo profundo)</div>
              <div>Transmisión banda paso (T_pasa): <strong style={{ color: '#10b981' }}>{bestF2.t_pass_mean.toFixed(4)}</strong> (Alta transparencia)</div>
              <div style={{ color: '#10b981', fontSize: '0.68rem', marginTop: '4px' }}>
                ✔ Filtro Notch resonante verdadero en banda X (10 GHz).
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
