import React from 'react';
import { ChapterLayout } from '../../components/layout/ChapterLayout';
import { SimulationCanvas2D } from '../../components/canvas2d/SimulationCanvas2D';
import { ParticleInspector } from '../../components/controls/ParticleInspector';
import { useParticles } from '../../hooks/useParticles';
import { EquationDisplay } from '../../components/educational/EquationDisplay';

export const Chapter1_Charges: React.FC = () => {
  const {
    particles,
    selectedParticle,
    selectedParticleId,
    setSelectedParticleId,
    addParticle,
    updateParticlePosition,
    updateParticleCharge,
    removeParticle,
    clearParticles,
  } = useParticles([
    { id: 'p1', position: { x: -0.05, y: 0.02 }, charge: 3e-6, label: 'q₁ (+3 µC)' },
    { id: 'p2', position: { x: 0.05, y: -0.02 }, charge: -2e-6, label: 'q₂ (−2 µC)' },
  ]);

  return (
    <ChapterLayout
      chapterNumber={1}
      chapterTitle="Partículas y la Naturaleza de la Carga Eléctrica"
      nextPath="/chapter/2-coulomb"
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px', flex: 1, minHeight: 0 }}>
        {/* Canvas interactivo */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '0 8px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              🎯 Arrastra las partículas en el plano. Mantén <code>Shift + Clic</code> para crear una carga.
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => addParticle(2e-6, { x: (Math.random() - 0.5) * 0.1, y: (Math.random() - 0.5) * 0.1 })}
                className="btn btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.75rem', color: '#fca5a5' }}
              >
                + Añadir Carga (+)
              </button>
              <button
                onClick={() => addParticle(-2e-6, { x: (Math.random() - 0.5) * 0.1, y: (Math.random() - 0.5) * 0.1 })}
                className="btn btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.75rem', color: '#93c5fd' }}
              >
                − Añadir Carga (−)
              </button>
              <button
                onClick={clearParticles}
                className="btn btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              >
                Limpiar
              </button>
            </div>
          </div>

          <div style={{ flex: 1, minHeight: '450px', position: 'relative' }}>
            <SimulationCanvas2D
              particles={particles}
              selectedParticleId={selectedParticleId}
              onSelectParticle={setSelectedParticleId}
              onMoveParticle={updateParticlePosition}
              onAddParticle={(pos) => addParticle(2e-6, pos)}
              showForces={false}
              showDistance={false}
            />
          </div>
        </div>

        {/* Panel lateral con Inspector y Explicación Física */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
          <ParticleInspector
            particle={selectedParticle}
            onUpdateCharge={updateParticleCharge}
            onRemove={removeParticle}
          />

          <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              📚 Fundamento Físico: La Carga $q$
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              La <strong>carga eléctrica</strong> es una propiedad intrínseca fundamental de la materia, responsable de todas las interacciones electromagnéticas.
            </p>

            <EquationDisplay math="q = \pm N \cdot e \quad (e \approx 1.602 \times 10^{-19} \text{ C})" />

            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '4px' }}>
              <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li><strong>Cuantización:</strong> Toda carga macroscópica es múltiplo de la carga elemental $e$.</li>
                <li><strong>Conservación:</strong> La carga total neta de un sistema aislado se mantiene rigurosamente constante.</li>
                <li><strong>Dualidad de signos:</strong> Benjamín Franklin asignó las polaridades positiva (+) y negativa (−).</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ChapterLayout>
  );
};
