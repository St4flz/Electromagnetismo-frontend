/**
 * Formateo estricto de magnitudes físicas para la interfaz visual.
 * Muestra el rigor científico con notación limpia y unidades estándar del SI.
 */

export function formatCharge(coulombs: number): string {
  const abs = Math.abs(coulombs);
  const sign = coulombs >= 0 ? '+' : '−';

  if (abs >= 1e-3) {
    return `${sign}${(abs * 1e3).toFixed(2)} mC`;
  } else if (abs >= 1e-6) {
    return `${sign}${(abs * 1e6).toFixed(2)} µC`;
  } else if (abs >= 1e-9) {
    return `${sign}${(abs * 1e9).toFixed(2)} nC`;
  } else {
    return `${sign}${abs.toExponential(2)} C`;
  }
}

export function formatDistance(meters: number): string {
  const abs = Math.abs(meters);
  if (abs >= 1) {
    return `${abs.toFixed(3)} m`;
  } else if (abs >= 1e-2) {
    return `${(abs * 1e2).toFixed(2)} cm`;
  } else if (abs >= 1e-3) {
    return `${(abs * 1e3).toFixed(2)} mm`;
  } else {
    return `${abs.toExponential(2)} m`;
  }
}

export function formatForce(newtons: number): string {
  const abs = Math.abs(newtons);
  if (abs >= 1000) {
    return `${(newtons / 1000).toFixed(2)} kN`;
  } else if (abs >= 1) {
    return `${newtons.toFixed(3)} N`;
  } else if (abs >= 1e-3) {
    return `${(newtons * 1e3).toFixed(2)} mN`;
  } else if (abs >= 1e-6) {
    return `${(newtons * 1e6).toFixed(2)} µN`;
  } else {
    return `${newtons.toExponential(2)} N`;
  }
}

export function formatElectricField(voltsPerMeter: number): string {
  const abs = Math.abs(voltsPerMeter);
  if (abs >= 1e6) {
    return `${(voltsPerMeter / 1e6).toFixed(2)} MV/m`;
  } else if (abs >= 1e3) {
    return `${(voltsPerMeter / 1e3).toFixed(2)} kV/m`;
  } else {
    return `${voltsPerMeter.toFixed(1)} V/m`;
  }
}
