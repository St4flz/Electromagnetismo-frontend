import React from 'react';

interface PerformanceHUDProps {
  step: number;
  maxSteps: number;
  timeNs: number;
  energyRatio: number;
  computeTimeMs: number;
  fps: number;
  mcellsPerSec: number;
  isSimulating: boolean;
}

export const PerformanceHUD: React.FC<PerformanceHUDProps> = ({
  step,
  maxSteps,
  timeNs,
  energyRatio,
  computeTimeMs,
  fps,
  mcellsPerSec,
  isSimulating,
}) => {
  const progressPct = maxSteps > 0 ? Math.min(100, Math.round((step / maxSteps) * 100)) : 0;
  const energyPct = Math.max(0, Math.min(100, energyRatio * 100));

  return (
    <div
      style={{
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '10px 14px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '12px',
        fontSize: '0.74rem',
      }}
    >
      {/* Paso temporal */}
      <div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>Paso de Simulación</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
          n = {step} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/ {maxSteps}</span>
        </div>
        <div style={{ width: '100%', height: '3px', background: 'rgba(148, 163, 184, 0.1)', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--accent-cyan)', transition: 'width 0.1s linear' }} />
        </div>
      </div>

      {/* Tiempo Físico */}
      <div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>Tiempo Físico Acumulado</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-cyan)' }}>
          {timeNs.toFixed(3)} ns <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({(timeNs * 1000).toFixed(0)} ps)</span>
        </div>
      </div>

      {/* Rendimiento computacional */}
      <div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>Throughput Numérico</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: mcellsPerSec > 10 ? '#10b981' : 'var(--text-primary)' }}>
          {mcellsPerSec.toFixed(1)} Mceldas/s
        </div>
      </div>

      {/* Cadencia y Latencia */}
      <div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>Cadencia Render / Cómputo</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
          {fps.toFixed(0)} FPS <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({computeTimeMs.toFixed(1)} ms/frame)</span>
        </div>
      </div>

      {/* Energía electromagnética residual U(t) / U_max */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.68rem' }}>
          <span>Energía U(t) / U_max</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>{(energyRatio * 100).toFixed(2)}%</span>
        </div>
        <div style={{ width: '100%', height: '4px', background: 'rgba(148, 163, 184, 0.1)', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${energyPct}%`,
              height: '100%',
              background: energyRatio < 1e-3 ? '#10b981' : energyRatio < 0.1 ? 'var(--accent-gold)' : 'var(--accent-cyan)',
              transition: 'width 0.15s ease',
            }}
          />
        </div>
        <div style={{ fontSize: '0.65rem', color: energyRatio < 1e-4 ? '#10b981' : 'var(--text-muted)', marginTop: '2px' }}>
          {energyRatio < 1e-4 ? '✔ Decaimiento completado' : isSimulating ? 'Simulación en tránsito...' : 'En reposo'}
        </div>
      </div>
    </div>
  );
};
