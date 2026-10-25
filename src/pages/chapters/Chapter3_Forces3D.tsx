import React, { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { ChapterLayout } from '../../components/layout/ChapterLayout';
import { ChapterAssumptions } from '../../components/educational/ChapterAssumptions';
import { useParticles } from '../../hooks/useParticles';
import { usePhysicsSocket } from '../../hooks/usePhysicsSocket';
import { Particle, Vector3D, CoulombForce } from '../../types/physics';
import { formatCharge } from '../../utils/units';

// Componente para una partícula 3D
const ParticleMesh3D: React.FC<{
  particle: Particle;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ particle, isSelected, onSelect }) => {
  const pos = particle.position as Vector3D;
  const isPos = particle.charge >= 0;
  // Escala calibrada y compacta para no saturar el espacio 3D
  const scale = 0.009 + Math.cbrt(Math.abs(particle.charge) * 1e6) * 0.0025;

  return (
    <group position={[pos.x, pos.y, pos.z]} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
      <mesh>
        <sphereGeometry args={[scale, 32, 32]} />
        <meshStandardMaterial
          color={isPos ? '#0284c7' : '#e11d48'}
          emissive={isPos ? '#075985' : '#881337'}
          roughness={0.25}
          metalness={0.3}
        />
      </mesh>

      {/* Halo de selección ceñido */}
      {isSelected && (
        <mesh>
          <sphereGeometry args={[scale * 1.25, 16, 16]} />
          <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.35} />
        </mesh>
      )}

      {/* Label de texto en el espacio proporcionado y cercano a la esfera */}
      <Text
        position={[0, scale + 0.016, 0]}
        fontSize={0.013}
        color={isPos ? '#7dd3fc' : '#fda4af'}
        anchorX="center"
        anchorY="bottom"
      >
        {`${particle.label.split(' ')[0]} (${particle.charge >= 0 ? '+' : ''}${(particle.charge * 1e6).toFixed(1)} µC)`}
      </Text>
    </group>
  );
};

// Componente para flechas de fuerza 3D
const ForceArrowMesh3D: React.FC<{
  target: Particle;
  force: CoulombForce;
}> = ({ target, force }) => {
  const origin = target.position as Vector3D;
  const fVec = force.force as Vector3D;
  const norm = Math.hypot(fVec.x, fVec.y, fVec.z) || 1;
  const dir = new THREE.Vector3(fVec.x / norm, fVec.y / norm, fVec.z / norm);

  const length = Math.min(Math.max(force.forceMagnitude * 0.06, 0.04), 0.15);
  const color = force.isAttractive ? '#c084fc' : '#f59e0b';

  return (
    <group position={[origin.x, origin.y, origin.z]}>
      <arrowHelper args={[dir, new THREE.Vector3(0, 0, 0), length, color, 0.02, 0.015]} />
    </group>
  );
};

export const Chapter3_Forces3D: React.FC = () => {
  const {
    particles,
    selectedParticle,
    selectedParticleId,
    setSelectedParticleId,
    updateParticlePosition,
    updateParticleCharge,
    addParticle,
    isMaxReached,
    maxParticles,
  } = useParticles([
    { id: 'q1', position: { x: -0.05, y: 0.02, z: 0.0 }, charge: 3e-6, label: 'q1' },
    { id: 'q2', position: { x: 0.05, y: -0.02, z: 0.03 }, charge: -2e-6, label: 'q2' },
  ], 4);

  const { sendPhysicsRequest, lastResponse, computeTimeMs } = usePhysicsSocket();

  useEffect(() => {
    sendPhysicsRequest({
      type: 'coulomb',
      particles,
      dimensions: 3,
    });
  }, [particles, sendPhysicsRequest]);

  const forces = lastResponse?.type === 'coulomb_result' ? lastResponse.forces || [] : [];
  const selectedPos = selectedParticle ? (selectedParticle.position as Vector3D) : null;

  return (
    <ChapterLayout
      chapterNumber={3}
      chapterTitle="Interacción Electrostática en el Espacio Tridimensional"
      prevPath="/chapter/2-coulomb"
      nextPath="/chapter/4-electric-field"
    >
      {/* Explicación de supuestos de la simulación */}
      <ChapterAssumptions
        systemRange="Espacio euclidiano 3D [-10 cm, +10 cm] en ejes X, Y y Z"
        particleLimit={maxParticles}
        minSeparation="4.0 cm (distancia mínima de separación tridimensional para estabilidad analítica)"
        chargeRange="±0.5 µC a ±10.0 µC"
        additionalDetails={[
          {
            label: 'Vector tridimensional',
            value: 'r = (x, y, z) con norma euclidiana ||r|| = √(x² + y² + z²)',
          },
          {
            label: 'Cámara orbital WebGL',
            value: 'Rotación con botón primario, paneo con secundario y zoom con rueda',
          },
        ]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px', flex: 1, minHeight: 0 }}>
        {/* Escena WebGL con Three.js */}
        <div className="lab-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '0 4px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Rotación 3D: Clic y arrastra para orbitar. Rueda para zoom. Clic sobre una esfera para seleccionarla.
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => addParticle(2e-6, { x: (Math.random() - 0.5) * 0.08, y: (Math.random() - 0.5) * 0.08, z: (Math.random() - 0.5) * 0.08 })}
                className="btn btn-secondary"
                disabled={isMaxReached}
                style={{ padding: '4px 10px', fontSize: '0.74rem' }}
              >
                + Añadir Carga 3D
              </button>
              <div className="badge badge-live" style={{ fontSize: '0.7rem' }}>
                Three.js ({computeTimeMs.toFixed(1)} ms)
              </div>
            </div>
          </div>

          <div style={{ flex: 1, minHeight: '450px', background: '#02050e', borderRadius: '10px', overflow: 'hidden' }} onWheelCapture={(e) => e.stopPropagation()}>
            <Canvas camera={{ position: [0.15, 0.15, 0.25], fov: 45 }} style={{ touchAction: "none" }}>
              <ambientLight intensity={0.7} />
              <pointLight position={[0.2, 0.3, 0.2]} intensity={1.5} />
              <gridHelper args={[0.4, 20, '#1e293b', '#0f172a']} />
              <axesHelper args={[0.08]} />

              <OrbitControls enableDamping dampingFactor={0.05} />

              {/* Render de Partículas */}
              {particles.map((p) => (
                <ParticleMesh3D
                  key={p.id}
                  particle={p}
                  isSelected={p.id === selectedParticleId}
                  onSelect={() => setSelectedParticleId(p.id)}
                />
              ))}

              {/* Render de Flechas de Fuerza */}
              {forces.map((f, idx) => {
                const target = particles.find((p) => p.id === f.particleToId);
                return target ? <ForceArrowMesh3D key={idx} target={target} force={f} /> : null;
              })}
            </Canvas>
          </div>
        </div>

        {/* Panel lateral con Controles de Posición 3D */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
          {selectedParticle && selectedPos ? (
            <div className="lab-card-elevated" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`badge ${selectedParticle.charge >= 0 ? 'badge-pos' : 'badge-neg'}`}>
                  {selectedParticle.label}
                </span>
                <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {formatCharge(selectedParticle.charge)}
                </span>
              </div>

              <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Coordenadas Cartesianas (cm):
              </h4>

              {/* Slider X */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '2px' }}>
                  <span style={{ color: '#f43f5e' }}>Eje X</span>
                  <span className="font-mono">{(selectedPos.x * 100).toFixed(1)} cm</span>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="10"
                  step="0.5"
                  value={selectedPos.x * 100}
                  onChange={(e) => updateParticlePosition(selectedParticle.id, { ...selectedPos, x: parseFloat(e.target.value) / 100 })}
                />
              </div>

              {/* Slider Y */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '2px' }}>
                  <span style={{ color: '#10b981' }}>Eje Y</span>
                  <span className="font-mono">{(selectedPos.y * 100).toFixed(1)} cm</span>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="10"
                  step="0.5"
                  value={selectedPos.y * 100}
                  onChange={(e) => updateParticlePosition(selectedParticle.id, { ...selectedPos, y: parseFloat(e.target.value) / 100 })}
                />
              </div>

              {/* Slider Z */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '2px' }}>
                  <span style={{ color: '#38bdf8' }}>Eje Z</span>
                  <span className="font-mono">{(selectedPos.z * 100).toFixed(1)} cm</span>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="10"
                  step="0.5"
                  value={selectedPos.z * 100}
                  onChange={(e) => updateParticlePosition(selectedParticle.id, { ...selectedPos, z: parseFloat(e.target.value) / 100 })}
                />
              </div>

              {/* Control de carga */}
              <div style={{ marginTop: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '2px' }}>
                  <span>Magnitud de carga q</span>
                  <span className="font-mono">{(selectedParticle.charge * 1e6).toFixed(1)} µC</span>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="10"
                  step="0.5"
                  value={selectedParticle.charge * 1e6}
                  onChange={(e) => updateParticleCharge(selectedParticle.id, parseFloat(e.target.value) * 1e-6)}
                />
              </div>
            </div>
          ) : (
            <div className="lab-card" style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center' }}>
              Selecciona una partícula en el espacio 3D para calibrar sus coordenadas cartesianas (x, y, z).
            </div>
          )}

          {/* Explicación Física de Vectores 3D */}
          <div className="lab-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h4 style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Generalización al Espacio Tridimensional
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              La ley de Coulomb opera de forma isótropa en el espacio euclidiano continuo:
            </p>
            <div className="font-mono" style={{ background: 'rgba(3,7,18,0.5)', padding: '8px', borderRadius: '6px', fontSize: '0.75rem', color: '#38bdf8', border: '1px solid var(--border-subtle)' }}>
              r = √(Δx² + Δy² + Δz²)
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
              El versor unitario r̂ = r / ||r|| descompone vectorialmente la interacción sobre los tres ejes coordenados independientes.
            </p>
          </div>
        </div>
      </div>
    </ChapterLayout>
  );
};

