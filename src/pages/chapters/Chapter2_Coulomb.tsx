import React, { useEffect, useMemo } from 'react';
import { ChapterLayout } from '../../components/layout/ChapterLayout';
import { SimulationCanvas2D } from '../../components/canvas2d/SimulationCanvas2D';
import { ParticleInspector } from '../../components/controls/ParticleInspector';
import { CoulombEquationPanel } from '../../components/panels/CoulombEquationPanel';
import { useParticles } from '../../hooks/useParticles';
import { usePhysicsSocket } from '../../hooks/usePhysicsSocket';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Vector2D } from '../../types/physics';

export const Chapter2_Coulomb: React.FC = () => {
  const {
    particles,
    selectedParticle,
    selectedParticleId,
    setSelectedParticleId,
    updateParticlePosition,
    updateParticleCharge,
    removeParticle,
  } = useParticles([
    { id: 'q1', position: { x: -0.04, y: 0.0 }, charge: 3e-6, label: 'q₁ (+3 µC)' },
    { id: 'q2', position: { x: 0.04, y: 0.0 }, charge: -2e-6, label: 'q₂ (−2 µC)' },
  ]);

  const { sendPhysicsRequest, lastResponse, computeTimeMs } = usePhysicsSocket();

  // Enviar partículas al WebSocket del backend cada vez que cambien de posición o carga
  useEffect(() => {
    sendPhysicsRequest({
      type: 'coulomb',
      particles,
      dimensions: 2,
    });
  }, [particles, sendPhysicsRequest]);

  const forces = lastResponse?.type === 'coulomb_result' ? lastResponse.forces || [] : [];

  // Datos para la curva teórica F vs r (Ley del inverso al cuadrado)
  const chartData = useMemo(() => {
    if (particles.length < 2) return [];
    const p1 = particles[0];
    const p2 = particles[1];
    const k = 8.98755e9;
    const q1q2 = Math.abs(p1.charge * p2.charge);

    const points = [];
    for (let rCm = 2; rCm <= 20; rCm += 1) {
      const rM = rCm / 100;
      const forceN = (k * q1q2) / (rM * rM);
      points.push({
        distCm: rCm,
        fuerzaN: parseFloat(forceN.toFixed(2)),
      });
    }
    return points;
  }, [particles]);

  // Distancia actual en cm entre q1 y q2
  const currentDistanceCm = useMemo(() => {
    if (particles.length < 2) return 0;
    const p1 = particles[0].position as Vector2D;
    const p2 = particles[1].position as Vector2D;
    return Math.hypot(p2.x - p1.x, p2.y - p1.y) * 100;
  }, [particles]);

  return (
    <ChapterLayout
      chapterNumber={2}
      chapterTitle="La Ley de Coulomb y la Tercera Ley de Newton"
      prevPath="/chapter/1-charges"
      nextPath="/chapter/3-forces-3d"
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '16px', flex: 1, minHeight: 0 }}>
        {/* Canvas de simulación con vectores de fuerza */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '0 8px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              ⚡ <strong>Mueve cualquiera de las cargas:</strong> Las fuerzas se resuelven en el backend en {computeTimeMs.toFixed(1)} ms.
            </div>
            <div className="badge badge-live" style={{ fontSize: '0.75rem' }}>
              Tercera Ley: F₁₂ = −F₂₁
            </div>
          </div>

          <div style={{ flex: 1, minHeight: '450px', position: 'relative' }}>
            <SimulationCanvas2D
              particles={particles}
              forces={forces}
              selectedParticleId={selectedParticleId}
              onSelectParticle={setSelectedParticleId}
              onMoveParticle={updateParticlePosition}
              showForces={true}
              showDistance={true}
            />
          </div>
        </div>

        {/* Panel lateral con Ecuación en tiempo real, Gráfico 1/r² e Inspector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
          <CoulombEquationPanel particles={particles} forces={forces} />

          {/* Gráfico F vs r (Ley del inverso al cuadrado) */}
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Decaimiento Cuadrático Inverso (F ∝ 1/r²)
              </h4>
              <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--accent-primary)' }}>
                r actual: {currentDistanceCm.toFixed(1)} cm
              </span>
            </div>

            <div style={{ height: '140px', width: '100%', marginTop: '8px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="distCm" stroke="#64748b" tick={{ fontSize: 10 }} unit=" cm" />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} unit=" N" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                    itemStyle={{ color: '#f59e0b' }}
                  />
                  <Line type="monotone" dataKey="fuerzaN" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <ParticleInspector
            particle={selectedParticle}
            onUpdateCharge={updateParticleCharge}
            onRemove={removeParticle}
          />
        </div>
      </div>
    </ChapterLayout>
  );
};
