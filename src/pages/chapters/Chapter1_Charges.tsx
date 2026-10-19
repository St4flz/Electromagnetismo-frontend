import React, { useState, useRef, useEffect } from 'react';
import { ChapterLayout } from '../../components/layout/ChapterLayout';
import { SimulationCanvas2D } from '../../components/canvas2d/SimulationCanvas2D';
import { ParticleInspector } from '../../components/controls/ParticleInspector';
import { ChapterAssumptions } from '../../components/educational/ChapterAssumptions';
import { useParticles, MIN_PARTICLE_DISTANCE } from '../../hooks/useParticles';
import { EquationDisplay } from '../../components/educational/EquationDisplay';
import { Vector2D } from '../../types/physics';

export const Chapter1_Charges: React.FC = () => {
  const {
    particles,
    setParticles,
    selectedParticle,
    selectedParticleId,
    setSelectedParticleId,
    addParticle,
    updateParticlePosition,
    updateParticleCharge,
    removeParticle,
    clearParticles,
    isMaxReached,
    maxParticles,
  } = useParticles([
    { id: 'p1', position: { x: -0.05, y: 0.02 }, charge: 3e-6, label: 'q1' },
    { id: 'p2', position: { x: 0.05, y: -0.02 }, charge: -2e-6, label: 'q2' },
  ], 4);

  const [isPlaying, setIsPlaying] = useState(false);
  const animFrameRef = useRef<number | null>(null);

  // Animación física de interacción (atracción de signos opuestos / repulsión de signos iguales)
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let startTime = performance.now();
    const durationMs = 2800; // Duración de la demostración

    const step = (now: number) => {
      const elapsed = now - startTime;
      if (elapsed >= durationMs) {
        setIsPlaying(false);
        return;
      }

      setParticles((current) => {
        if (current.length < 2) return current;

        // Calcular desplazamiento paso a paso con física simplificada y amortiguamiento
        const dt = 0.016;
        const updated = current.map((p) => ({ ...p, position: { ...(p.position as Vector2D) } }));

        for (let i = 0; i < updated.length; i++) {
          for (let j = i + 1; j < updated.length; j++) {
            const p1 = updated[i];
            const p2 = updated[j];
            const pos1 = p1.position as Vector2D;
            const pos2 = p2.position as Vector2D;

            let dx = pos2.x - pos1.x;
            let dy = pos2.y - pos1.y;
            let dist = Math.hypot(dx, dy) || 1e-4;

            // Determinar si atrae (signos opuestos) o repele (signos iguales)
            const isAttractive = (p1.charge * p2.charge) < 0;
            const forceSign = isAttractive ? 1 : -1;

            // Velocidad suave de animación
            const speed = 0.015 * dt * forceSign;
            const nx = dx / dist;
            const ny = dy / dist;

            // Nueva distancia estimada
            const nextDist = dist - speed * 2;

            // Si es atracción, respetar la barrera de separación mínima infranqueable
            if (isAttractive && nextDist <= MIN_PARTICLE_DISTANCE) {
              continue;
            }

            // Si es repulsión, limitar el alcance dentro de la ventana [-0.14, 0.14]
            const nextX1 = pos1.x + nx * speed;
            const nextY1 = pos1.y + ny * speed;
            const nextX2 = pos2.x - nx * speed;
            const nextY2 = pos2.y - ny * speed;

            if (Math.abs(nextX1) < 0.45 && Math.abs(nextY1) < 0.45) {
              pos1.x = nextX1;
              pos1.y = nextY1;
            }
            if (Math.abs(nextX2) < 0.45 && Math.abs(nextY2) < 0.45) {
              pos2.x = nextX2;
              pos2.y = nextY2;
            }
          }
        }

        return updated;
      });

      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, setParticles]);

  const handlePlayAnimation = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleRemoveSelected = () => {
    if (selectedParticleId) {
      removeParticle(selectedParticleId);
    }
  };

  return (
    <ChapterLayout
      chapterNumber={1}
      chapterTitle="Partículas y la Naturaleza de la Carga Eléctrica"
      nextPath="/chapter/2-coulomb"
    >
      {/* Explicación de supuestos de la simulación */}
      <ChapterAssumptions
        systemRange="Espacio cartesiano 2D centrado en (0, 0), cuadrante de [-15 cm, +15 cm]"
        particleLimit={maxParticles}
        minSeparation="4.0 cm (límite físico estricto de acercamiento para estabilidad analítica)"
        chargeRange="±0.5 µC hasta ±10.0 µC (cuantización discreta experimental)"
        additionalDetails={[
          {
            label: 'Medio dieléctrico',
            value: 'Vacío / Aire (permitividad ε₀ = 8.854 × 10⁻¹² F/m)',
          },
          {
            label: 'Comportamiento dinámico',
            value: 'Electrostática pura (cargas cuasi-estáticas puntuales)',
          },
        ]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px', flex: 1, minHeight: 0 }}>
        {/* Canvas interactivo */}
        <div className="lab-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '0 4px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Arrastra las cargas en el plano. Mantén pulsado <code>Shift + Clic</code> para ubicar una nueva carga.
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {/* Botón de Demostración Animada (Play) */}
              <button
                onClick={handlePlayAnimation}
                className="btn btn-secondary"
                disabled={particles.length < 2}
                style={{
                  padding: '4px 12px',
                  fontSize: '0.74rem',
                  color: isPlaying ? '#38bdf8' : 'var(--text-primary)',
                  border: isPlaying ? '1px solid var(--accent-cyan)' : undefined,
                }}
                title="Demostrar interacción: signos opuestos se atraen y signos iguales se repelen"
              >
                {isPlaying ? 'Pausar animación' : 'Demostrar interacción'}
              </button>

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
              >
                Limpiar todo
              </button>
              <span className="badge" style={{ fontSize: '0.7rem' }}>
                {particles.length}/{maxParticles}
              </span>
            </div>
          </div>

          <div style={{ flex: 1, minHeight: '440px', position: 'relative' }}>
            <SimulationCanvas2D
              particles={particles}
              selectedParticleId={selectedParticleId}
              onSelectParticle={setSelectedParticleId}
              onMoveParticle={updateParticlePosition}
              onAddParticle={(pos) => !isMaxReached && addParticle(2e-6, pos)}
              showForces={false}
              showDistance={false}
            />
          </div>
        </div>

        {/* Panel lateral con Inspector y Fundamento Teórico */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
          <ParticleInspector
            particle={selectedParticle}
            onUpdateCharge={updateParticleCharge}
            onRemove={removeParticle}
            onUpdatePosition={updateParticlePosition}
          />

          <div className="lab-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Fundamento Físico: La Carga Elemental
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              La carga eléctrica es una propiedad intrínseca fundamental de la materia, responsable directa de toda interacción electromagnética.
            </p>

            <EquationDisplay math="q = \pm N \cdot e \quad (e \approx 1.602 \times 10^{-19} \text{ C})" />

            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginTop: '4px' }}>
              <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>
                  <strong style={{ color: 'var(--text-primary)' }}>Cuantización:</strong> Toda carga macroscópica transferible se compone de un múltiplo entero de la carga elemental e.
                </li>
                <li>
                  <strong style={{ color: 'var(--text-primary)' }}>Principio de Conservación:</strong> La suma algebraica neta de cargas de un sistema aislado permanece rigurosamente constante en el tiempo.
                </li>
                <li>
                  <strong style={{ color: 'var(--text-primary)' }}>Dualidad de Signos:</strong> Polaridades idénticas experimentan repulsión mutua, mientras que polaridades opuestas se atraen.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ChapterLayout>
  );
};
