import React, { useEffect, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { ChapterLayout } from '../../components/layout/ChapterLayout';
import { useParticles } from '../../hooks/useParticles';
import { usePhysicsSocket } from '../../hooks/usePhysicsSocket';
import { Particle, Vector3D, CoulombForce } from '../../types/physics';
import { formatForce, formatDistance, formatCharge } from '../../utils/units';

// Componente para una partícula 3D
const ParticleMesh3D: React.FC<{
  particle: Particle;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ particle, isSelected, onSelect }) => {
  const pos = particle.position as Vector3D;
  const isPos = particle.charge >= 0;
  const scale = 0.015 + Math.cbrt(Math.abs(particle.charge) * 1e6) * 0.005;

  return (
    <group position={[pos.x, pos.y, pos.z]} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
      <mesh>
        <sphereGeometry args={[scale, 32, 32]} />
        <meshStandardMaterial
          color={isPos ? '#ef4444' : '#3b82f6'}
          emissive={isPos ? '#7f1d1d' : '#1e3a8a'}
          roughness={0.2}
          metalness={0.4}
        />
      </mesh>

      {/* Halo de selección */}
      {isSelected && (
        <mesh>
          <sphereGeometry args={[scale * 1.3, 16, 16]} />
          <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.4} />
        </mesh>
      )}

      {/* Label de texto en el espacio */}
      <Text
        position={[0, scale + 0.02, 0]}
        fontSize={0.02}
        color={isPos ? '#fca5a5' : '#93c5fd'}
        anchorX="center"
        anchorY="middle"
      >
        {particle.label}
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

  // Escala visual
  const length = Math.min(Math.max(force.forceMagnitude * 0.06, 0.04), 0.15);
  const color = force.isAttractive ? '#a855f7' : '#f59e0b';

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
  } = useParticles([
    { id: 'q1', position: { x: -0.05, y: 0.02, z: 0.0 }, charge: 3e-6, label: 'q₁ (+3 µC)' },
    { id: 'q2', position: { x: 0.05, y: -0.02, z: 0.03 }, charge: -2e-6, label: 'q₂ (−2 µC)' },
  ]);

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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px', flex: 1, minHeight: 0 }}>
        {/* Escena WebGL con Three.js */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '0 8px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              🌐 <strong>Rotación 3D:</strong> Haz clic y arrastra con el ratón para orbitar. Rueda para zoom.
            </div>
            <div className="badge badge-live" style={{ fontSize: '0.75rem' }}>
              Three.js WebGL + Backend ({computeTimeMs.toFixed(1)} ms)
            </div>
          </div>

          <div style={{ flex: 1, minHeight: '450px', background: '#05070e', borderRadius: '12px', overflow: 'hidden' }}>
            <Canvas camera={{ position: [0.15, 0.15, 0.25], fov: 45 }}>
              <ambientLight intensity={0.6} />
              <pointLight position={[0.2, 0.3, 0.2]} intensity={1.5} />
              <gridHelper args={[0.4, 20, '#334155', '#1e293b']} />
              <axesHelper args={[0.1]} />

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
            <div className="glass-panel-elevated" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`badge ${selectedParticle.charge >= 0 ? 'badge-pos' : 'badge-neg'}`}>
                  {selectedParticle.label}
                </span>
                <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {formatCharge(selectedParticle.charge)}
                </span>
              </div>

              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Posición en Coordenadas Cartesianas (cm):
              </h4>

              {/* Slider X */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '2px' }}>
                  <span style={{ color: '#ef4444' }}>Eje X</span>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '2px' }}>
                  <span style={{ color: '#22c55e' }}>Eje Y</span>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '2px' }}>
                  <span style={{ color: '#3b82f6' }}>Eje Z</span>
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
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '2px' }}>
                  <span>Carga q</span>
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
            <div className="glass-panel" style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
              👉 Haz clic en una carga 3D para ajustar sus coordenadas espaciales $(x, y, z)$.
            </div>
          )}

          {/* Explicación Física de Vectores 3D */}
          <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              📐 Generalización al Espacio 3D (R³)
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              La ley de Coulomb mantiene su forma universal en 3 dimensiones:
            </p>
            <div className="font-mono" style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px', fontSize: '0.8rem', color: '#67e8f9' }}>
              r = √(Δx² + Δy² + Δz²)
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              El vector unitario r̂ = r / ||r|| distribuye la fuerza sobre los tres ejes coordenados de manera continua e isótropa.
            </p>
          </div>
        </div>
      </div>
    </ChapterLayout>
  );
};
