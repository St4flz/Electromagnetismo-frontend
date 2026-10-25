/**
 * Tipos e interfaces físicas sincronizadas con el backend FastAPI.
 *
 * Cubre los contratos exactos para los 9 capítulos del laboratorio:
 * - Capítulos 1 a 4: Cargas, Coulomb 2D/3D y Campo Eléctrico
 * - Capítulo 5: Cinemática, Velocity-Verlet y Deflexión de Thomson
 * - Capítulo 6: Ondas Magnéticas, Biot-Savart, Lorentz 2D y Ciclotrón
 * - Capítulo 7: Onda Electromagnética en Vacío 2D, Poynting y Equipartición
 * - Capítulo 8: Introducción a Metamateriales, Celda (a,d,w), Veselago DNG y TMM
 * - Capítulo 9: FDTD 2D, Rejilla Yee TM, Condición CFL y Espectro FFT
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

// ═══════════════════════════════════════════════════════════════════
// CAPÍTULO 5: DINÁMICA Y THOMSON
// ═══════════════════════════════════════════════════════════════════

export interface TrajectorySnapshot {
  time: number;
  position: Vector2D | Vector3D;
  velocity: Vector2D | Vector3D;
  acceleration: Vector2D | Vector3D;
  speed: number;
  kineticEnergy: number;
  potentialEnergy: number;
  totalEnergy: number;
}

export interface DynamicParticle {
  particle: Particle;
  mass: number;
  velocity: Vector2D | Vector3D;
}

export interface UniformField {
  fieldVector: Vector2D | Vector3D;
  xBounds?: [number, number];
  yBounds?: [number, number];
  zBounds?: [number, number];
}

export interface TrajectoryQuery {
  dynamicParticle: DynamicParticle;
  uniformFields?: UniformField[];
  totalTime: number;
  dt: number;
}

export interface ThomsonVerificationQuery {
  charge: number;
  mass: number;
  v0x: number;
  Ey: number;
  length: number;
  dt: number;
}

// ═══════════════════════════════════════════════════════════════════
// CAPÍTULO 6: MAGNETISMO, LORENTZ Y CICLOTRÓN
// ═══════════════════════════════════════════════════════════════════

export interface LorentzSnapshot {
  time: number;
  position: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
  speed: number;
  kineticEnergy: number;
  workDone: number;
}

export interface LorentzQuery {
  charge: number;
  mass: number;
  initialPos: Vector2D;
  initialVel: Vector2D;
  E: Vector2D;
  Bz: number;
  totalTime: number;
  dt: number;
}

export interface CyclotronVerificationQuery {
  mass: number;
  charge: number;
  speed: number;
  Bz: number;
  dt: number;
}

export interface WienFilterQuery {
  mass: number;
  charge: number;
  speed: number;
  Ey: number;
  Bz: number;
  length: number;
  dt: number;
}

// ═══════════════════════════════════════════════════════════════════
// CAPÍTULO 7: ONDA ELECTROMAGNÉTICA EN VACÍO 2D
// ═══════════════════════════════════════════════════════════════════

export interface EMWaveSnapshot {
  point: Vector2D;
  Ez: number;
  B: Vector2D;
  BMagnitude: number;
  poynting: Vector2D;
  poyntingMagnitude: number;
  energyDensityE: number;
  energyDensityB: number;
  totalEnergyDensity: number;
}

export interface EMWaveGridQuery {
  amplitudeE0: number;
  frequency: number;
  propagationAngleRad: number;
  time: number;
  resolution: number;
  xRange: [number, number];
  yRange: [number, number];
}

export interface EMWaveVerificationQuery {
  amplitudeE0: number;
  frequency: number;
  angleRad: number;
}

// ═══════════════════════════════════════════════════════════════════
// CAPÍTULO 8: METAMATERIALES
// ═══════════════════════════════════════════════════════════════════

export interface MetamaterialCell {
  a: number; // mm
  d: number; // mm
  w: number; // mm
  periods: number;
  lossFactor: number;
}

export interface SpectralPoint {
  frequencyGhz: number;
  transmission: number;
  reflection: number;
  absorption: number;
  transmissionDb: number;
  epsReal: number;
  epsImag: number;
  muReal: number;
  muImag: number;
  nReal: number;
  nImag: number;
  isLeftHanded: boolean;
}

export interface MetamaterialsQuery {
  cell: MetamaterialCell;
  freqMinGhz: number;
  freqMaxGhz: number;
  points: number;
}

// ═══════════════════════════════════════════════════════════════════
// CAPÍTULO 9: FDTD 2D
// ═══════════════════════════════════════════════════════════════════

export interface FDTDSimQuery {
  Nx: number;
  Ny: number;
  dx: number;
  courantFactor: number;
  sourceType: 'gaussian' | 'sine';
  sourceFreqGhz: number;
  steps: number;
  addSlab?: boolean;
  slabStart?: number;
  slabEnd?: number;
  slabEps?: number;
  addMetamaterial?: boolean;
  reset?: boolean;
}

// ═══════════════════════════════════════════════════════════════════
// PETICIONES Y RESPUESTAS UNIFICADAS
// ═══════════════════════════════════════════════════════════════════

export type PhysicsRequestType =
  | 'coulomb'
  | 'electric_field'
  | 'trajectory_sim'
  | 'ch5_thomson'
  | 'ch6_magnetic_sim'
  | 'ch6_cyclotron_verify'
  | 'ch6_wien_verify'
  | 'ch7_em_wave_grid'
  | 'ch7_em_verify'
  | 'ch8_metamaterials_spectrum'
  | 'ch8_metamaterials_verify'
  | 'ch9_fdtd_step'
  | 'ch9_fdtd_verify';

export interface PhysicsRequest {
  type: PhysicsRequestType;
  particles?: Particle[];
  dimensions?: 2 | 3;
  fieldQuery?: FieldGridQuery;
  trajectoryQuery?: TrajectoryQuery;
  thomsonQuery?: ThomsonVerificationQuery;
  lorentzQuery?: LorentzQuery;
  cyclotronQuery?: CyclotronVerificationQuery;
  wienQuery?: WienFilterQuery;
  emWaveQuery?: EMWaveGridQuery;
  emWaveVerifyQuery?: EMWaveVerificationQuery;
  metaQuery?: MetamaterialsQuery;
  fdtdQuery?: FDTDSimQuery;
}

export interface PhysicsResponse {
  type: string;
  forces?: CoulombForce[];
  field?: FieldPoint[];
  trajectory?: TrajectorySnapshot[];
  thomsonResult?: any;
  lorentzTrajectory?: LorentzSnapshot[];
  cyclotronResult?: any;
  wienResult?: any;
  emWaveGrid?: EMWaveSnapshot[];
  emWaveVerifyResult?: any;
  spectrum?: SpectralPoint[];
  metamaterialsVerifyResult?: any;
  fdtdGridEz?: number[][];
  fdtdTimeStep?: number;
  fdtdCurrentTime?: number;
  fdtdDt?: number;
  fdtdSpectrum?: any[];
  fdtdVerifyResult?: any;
  computeTimeMs: number;
  error?: string;
}
