import { useState, useCallback } from 'react';
import { Particle, Vector2D, Vector3D } from '../types/physics';

const MAX_PARTICLES_DEFAULT = 4;
// Límite de distancia mínima física: 0.04 metros (4.0 cm) para evitar que se junten demasiado
export const MIN_PARTICLE_DISTANCE = 0.04;

export function useParticles(
  initialParticles: Particle[] = [],
  maxParticles: number = MAX_PARTICLES_DEFAULT
) {
  const [particles, setParticles] = useState<Particle[]>(initialParticles);
  const [selectedParticleId, setSelectedParticleId] = useState<string | null>(null);

  const addParticle = useCallback(
    (charge: number, position: Vector2D | Vector3D, label?: string) => {
      let createdId: string | null = null;
      setParticles((prev) => {
        if (prev.length >= maxParticles) {
          return prev;
        }

        // Verificar que no se coloque encima de otra partícula existente
        const isTooClose = prev.some((other) => {
          if ('z' in position && 'z' in other.position) {
            const dx = (position as Vector3D).x - (other.position as Vector3D).x;
            const dy = (position as Vector3D).y - (other.position as Vector3D).y;
            const dz = (position as Vector3D).z - (other.position as Vector3D).z;
            return Math.hypot(dx, dy, dz) < MIN_PARTICLE_DISTANCE;
          } else {
            const dx = (position as Vector2D).x - (other.position as Vector2D).x;
            const dy = (position as Vector2D).y - (other.position as Vector2D).y;
            return Math.hypot(dx, dy) < MIN_PARTICLE_DISTANCE;
          }
        });

        if (isTooClose) {
          return prev;
        }

        const id = Math.random().toString(36).substring(2, 9);
        createdId = id;
        const newParticle: Particle = {
          id,
          position,
          charge,
          label: label || `q${prev.length + 1}`,
        };
        return [...prev, newParticle];
      });

      if (createdId) {
        setSelectedParticleId(createdId);
      }
      return createdId;
    },
    [maxParticles]
  );

  const updateParticlePosition = useCallback(
    (id: string, proposedPos: Vector2D | Vector3D) => {
      setParticles((prev) => {
        const target = prev.find((p) => p.id === id);
        if (!target) return prev;

        let safePos = { ...proposedPos };

        // Proyección de esfera dura / barrera de repulsión de colisión
        // Si la posición propuesta queda a menos de MIN_PARTICLE_DISTANCE de cualquier otra partícula,
        // se ajusta para que se mantenga exactamente en la frontera de separación mínima.
        for (const other of prev) {
          if (other.id === id) continue;

          if ('z' in safePos && 'z' in other.position) {
            const pSafe = safePos as Vector3D;
            const pOther = other.position as Vector3D;
            let dx = pSafe.x - pOther.x;
            let dy = pSafe.y - pOther.y;
            let dz = pSafe.z - pOther.z;
            let dist = Math.hypot(dx, dy, dz);

            if (dist < MIN_PARTICLE_DISTANCE) {
              if (dist < 1e-5) {
                dx = MIN_PARTICLE_DISTANCE;
                dy = 0;
                dz = 0;
                dist = MIN_PARTICLE_DISTANCE;
              }
              const factor = MIN_PARTICLE_DISTANCE / dist;
              safePos = {
                x: pOther.x + dx * factor,
                y: pOther.y + dy * factor,
                z: pOther.z + dz * factor,
              } as Vector3D;
            }
          } else {
            const pSafe = safePos as Vector2D;
            const pOther = other.position as Vector2D;
            let dx = pSafe.x - pOther.x;
            let dy = pSafe.y - pOther.y;
            let dist = Math.hypot(dx, dy);

            if (dist < MIN_PARTICLE_DISTANCE) {
              if (dist < 1e-5) {
                dx = MIN_PARTICLE_DISTANCE;
                dy = 0;
                dist = MIN_PARTICLE_DISTANCE;
              }
              const factor = MIN_PARTICLE_DISTANCE / dist;
              safePos = {
                x: pOther.x + dx * factor,
                y: pOther.y + dy * factor,
              } as Vector2D;
            }
          }
        }

        return prev.map((p) => (p.id === id ? { ...p, position: safePos } : p));
      });
    },
    []
  );

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
    maxParticles,
    isMaxReached: particles.length >= maxParticles,
  };
}
