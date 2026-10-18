/**
 * Tipos e interfaces físicas compartidas con el backend FastAPI.
 *
 * Cada interfaz mapea directamente a un concepto de la física electrostática:
 * - Vector2D / Vector3D: Coordenadas espaciales [m] o vectores de fuerza [N] / campo [V/m]
 * - Particle: Carga puntual con posición [m] y carga eléctrica [C]
 * - CoulombForce: Fuerza electrostática F₁₂ con datos paso a paso
 * - FieldPoint: Punto en el espacio con vector de campo eléctrico E
 */

export interface Vector2D {
  x: number;
  y: number;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface Particle {
  id: string;
  position: Vector2D | Vector3D;
  charge: number; // en Coulombs [C] (ej. +3e-6 para +3 uC)
  label: string;
}

export interface CoulombForce {
  force: Vector2D | Vector3D;
  forceMagnitude: number;
  distance: number;
  unitVector: Vector2D | Vector3D;
  isAttractive: boolean;
  particleFromId: string;
  particleToId: string;
}

export interface FieldPoint {
  point: Vector2D | Vector3D;
  E: Vector2D | Vector3D;
  magnitude: number;
}

export interface FieldGridQuery {
  xRange: [number, number];
  yRange: [number, number];
  resolution: number;
}

export interface PhysicsRequest {
  type: 'coulomb' | 'electric_field';
  particles: Particle[];
  dimensions: 2 | 3;
  fieldQuery?: FieldGridQuery;
}

export interface PhysicsResponse {
  type: 'coulomb_result' | 'electric_field_result';
  forces?: CoulombForce[];
  field?: FieldPoint[];
  computeTimeMs: number;
  error?: string;
}
