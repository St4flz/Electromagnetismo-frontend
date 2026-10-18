import React, { useEffect } from 'react';
import { ChapterLayout } from '../../components/layout/ChapterLayout';
import { SimulationCanvas2D } from '../../components/canvas2d/SimulationCanvas2D';
import { ParticleInspector } from '../../components/controls/ParticleInspector';
import { CoulombEquationPanel } from '../../components/panels/CoulombEquationPanel';
import { ChapterAssumptions } from '../../components/educational/ChapterAssumptions';
import { useParticles } from '../../hooks/useParticles';
import { usePhysicsSocket } from '../../hooks/usePhysicsSocket';

export const Chapter2_Coulomb: React.FC = () => {
  const {
    particles,
    selectedParticle,
    selectedParticleId,
    setSelectedParticleId,
    updateParticlePosition,
    updateParticleCharge,
    removeParticle,
    clearParticles,
    addParticle,
    isMaxReached,
    maxParticles,
  } = useParticles([
    { id: 'q1', position: { x: -0.04, y: 0.0 }, charge: 3e-6, label: 'q1 (+3 µC)' },
    { id: 'q2', position: { x: 0.04, y: 0.0 }, charge: -2e-6, label: 'q2 (−2 µC)' },
  ], 4);

  const { sendPhysicsRequest, lastResponse, computeTimeMs } = usePhysicsSocket();

  useEffect(() => {
    sendPhysicsRequest({
      type: 'coulomb',
      particles,
      dimensions: 2,
    });
  }, [particles, sendPhysicsRequest]);

  const forces = lastResponse?.type === 'coulomb_result' ? lastResponse.forces || [] : [];

  return (
    <ChapterLayout
      chapterNumber={2}
      chapterTitle="La Ley de Coulomb y la Tercera Ley de Newton"
      prevPath="/chapter/1-charges"
      nextPath="/chapter/3-forces-3d"
    >
      {/* Explicación de supuestos de la simulación */}
      <ChapterAssumptions
        systemRange="Coordenadas cartesianas 2D centrado en (0, 0), ventana efectiva de [-15 cm, +15 cm]"
        particleLimit={maxParticles}
        minSeparation="4.0 cm (frontera física de aproximación para evitar singularidades asintóticas en 1/r²)"
        chargeRange="±0.5 µC a ±10.0 µC"
        additionalDetails={[
          {
            label: 'Constante electrostática',
            value: 'ke = 8.98755 × 10⁹ N·m²/C²',
          },
          {
            label: 'Principio de acción y reacción',
            value: 'Fuerzas colineales de igual magnitud y sentido opuesto (F₁₂ = −F₂₁)',
          },
        ]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '20px', flex: 1, minHeight: 0 }}>
        {/* Canvas de simulación con vectores de fuerza */}
        <div className="lab-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '0 4px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Desplaza cualquiera de las cargas en el plano para examinar las líneas de acción de fuerza.
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => addParticle(2e-6, { x: (Math.random() - 0.5) * 0.1, y: (Math.random() - 0.5) * 0.1 })}
                className="btn btn-secondary"
                disabled={isMaxReached}
                style={{ padding: '4px 12px', fontSize: '0.74rem' }}
              >
                + Añadir Carga
              </button>

              <button
                onClick={clearParticles}
                className="btn btn-secondary"
                disabled={particles.length === 0}
                style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                title="Eliminar todas las partículas"
              >
                Limpiar todo
              </button>

              <span className="badge" style={{ fontSize: '0.7rem' }}>
                {particles.length}/{maxParticles}
              </span>
              <span className="badge badge-live" style={{ fontSize: '0.7rem' }}>
                Resuelto en {computeTimeMs.toFixed(1)} ms
              </span>
            </div>
          </div>

          <div style={{ flex: 1, minHeight: '450px', position: 'relative' }}>
            <SimulationCanvas2D
              particles={particles}
              forces={forces}
              selectedParticleId={selectedParticleId}
              onSelectParticle={setSelectedParticleId}
              onMoveParticle={updateParticlePosition}
              onAddParticle={(pos) => !isMaxReached && addParticle(2e-6, pos)}
              showForces={true}
              showDistance={true}
            />
          </div>
        </div>

        {/* Panel lateral: Inspector de carga seleccionada primero, y Ecuación de Coulomb debajo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
          <ParticleInspector
            particle={selectedParticle}
            onUpdateCharge={updateParticleCharge}
            onRemove={removeParticle}
            onUpdatePosition={updateParticlePosition}
          />

          <CoulombEquationPanel particles={particles} forces={forces} />
        </div>
      </div>
    </ChapterLayout>
  );
};
