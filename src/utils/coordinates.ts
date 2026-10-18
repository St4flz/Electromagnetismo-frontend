import { Vector2D } from '../types/physics';

/**
 * Utilidades de transformación de coordenadas:
 *
 * Mundo Físico:
 *   - Origen (0, 0) en el centro de la escena.
 *   - Eje X hacia la derecha, Eje Y hacia ARRIBA.
 *   - Unidades: metros [m].
 *
 * Canvas Pantalla:
 *   - Origen (0, 0) en la esquina superior izquierda.
 *   - Eje X hacia la derecha, Eje Y hacia ABAJO.
 *   - Unidades: píxeles [px].
 */

export interface ViewportTransform {
  width: number;       // Ancho del canvas en px
  height: number;      // Alto del canvas en px
  pixelsPerMeter: number; // Factor de escala (ej. 1 metro = 800 px)
}

/**
 * Convierte un punto físico (x, y en metros) a coordenadas de píxel en el canvas.
 */
export function physicsToCanvas(
  p: Vector2D,
  transform: ViewportTransform
): { px: number; py: number } {
  const cx = transform.width / 2;
  const cy = transform.height / 2;

  const px = cx + p.x * transform.pixelsPerMeter;
  const py = cy - p.y * transform.pixelsPerMeter; // Inversión de Y

  return { px, py };
}

/**
 * Convierte un punto de clic en el canvas a coordenadas físicas en metros.
 */
export function canvasToPhysics(
  px: number,
  py: number,
  transform: ViewportTransform
): Vector2D {
  const cx = transform.width / 2;
  const cy = transform.height / 2;

  const x = (px - cx) / transform.pixelsPerMeter;
  const y = (cy - py) / transform.pixelsPerMeter; // Inversión de Y

  return { x, y };
}
