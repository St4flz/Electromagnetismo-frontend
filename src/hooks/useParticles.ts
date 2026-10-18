import { useState, useCallback } from 'react';
import { Particle, Vector2D, Vector3D } from '../types/physics';

export function useParticles(initialParticles: Particle[] = []) {
  const [particles, setParticles] = useState<Particle[]>(initialParticles);
  const [selectedParticleId, setSelectedParticleId] = useState<string | null>(null);

  const addParticle = useCallback((charge: number, position: Vector2D | Vector3D, label?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newParticle: Particle = {
      id,
      position,
      charge,
      label: label || `q${particles.length + 1}`,
    };
    setParticles((prev) => [...prev, newParticle]);
    setSelectedParticleId(id);
    return id;
  }, [particles.length]);

  const updateParticlePosition = useCallback((id: string, newPosition: Vector2D | Vector3D) => {
    setParticles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, position: newPosition } : p))
    );
  }, []);

  const updateParticleCharge = useCallback((id: string, newCharge: number) => {
    setParticles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, charge: newCharge } : p))
    );
  }, []);

  const removeParticle = useCallback((id: string) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
    setSelectedParticleId((prev) => (prev === id ? null : prev));
  }, []);

  const clearParticles = useCallback(() => {
    setParticles([]);
    setSelectedParticleId(null);
  }, []);

  const selectedParticle = particles.find((p) => p.id === selectedParticleId) || null;

  return {
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
  };
}
