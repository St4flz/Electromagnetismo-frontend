import React, { useEffect, useRef } from 'react';

export interface GridMetadata {
  Nx: number;
  Ny: number;
  dx: number;
  dy: number;
  dt_ps?: number;
  i_tfsf: number;
  x_refl: number;
  x_trans: number;
  pml_thickness?: number;
}

export interface UnitCellParams {
  a_mm: number;
  d_mm: number;
  w_mm: number;
  periods: number;
  family: 'rod_array' | 'square_ring';
  relative_permittivity: number;
  conductivity: number;
  is_pec: boolean;
}

interface FieldCanvasProps {
  fieldData: Float32Array | number[][] | null;
  rows: number;
  cols: number;
  scale: number;
  gridMeta: GridMetadata | null;
  geometry: UnitCellParams;
  mosaicReps?: number;
  showBoundaries?: boolean;
  colormap?: 'cyan-rose' | 'blue-red';
  width?: number;
  height?: number;
}

export const FieldCanvas: React.FC<FieldCanvasProps> = ({
  fieldData,
  rows,
  cols,
  scale,
  gridMeta,
  geometry,
  mosaicReps = 3,
  showBoundaries = true,
  colormap = 'cyan-rose',
  width = 820,
  height = 360,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Fondo oscuro de alta precisión
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, width, height);

    if (!fieldData || rows === 0 || cols === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = '13px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Esperando frames del motor FDTD v2...', width / 2, height / 2);
      return;
    }

    // Dibujar mapa de calor bidimensional con mosaico transversal y
    // rows = Nx (dirección x horizontal en pantalla)
    // cols = Ny (dirección y vertical en pantalla)
    const effectiveNy = cols * mosaicReps;
    const offscreen = document.createElement('canvas');
    offscreen.width = rows;
    offscreen.height = effectiveNy;
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return;

    const imgData = offCtx.createImageData(rows, effectiveNy);
    const data32 = new Uint32Array(imgData.data.buffer);

    // Escala máxima de normalización
    const s = Math.max(scale, 1e-6);

    for (let rep = 0; rep < mosaicReps; rep++) {
      for (let j = 0; j < cols; j++) {
        const yDest = rep * cols + j;
        for (let i = 0; i < rows; i++) {
          let val = 0;
          if (fieldData instanceof Float32Array) {
            // Flattened C-order: i * cols + j
            val = fieldData[i * cols + j] || 0;
          } else {
            val = fieldData[i]?.[j] || 0;
          }

          // Normalización simétrica [-1, 1]
          const norm = Math.max(-1.0, Math.min(1.0, val / s));
          let r = 8, g = 17, b = 32; // Base #081120

          if (colormap === 'cyan-rose') {
            if (norm > 0) {
              // Positivo: Cyan / Azul brillante
              const intensity = Math.pow(norm, 0.75);
              r = Math.round(8 + intensity * (6 - 8) + intensity * intensity * 50);
              g = Math.round(17 + intensity * (182 - 17));
              b = Math.round(32 + intensity * (212 - 32));
            } else if (norm < 0) {
              // Negativo: Fresa / Rosa cálido
              const intensity = Math.pow(-norm, 0.75);
              r = Math.round(8 + intensity * (244 - 8));
              g = Math.round(17 + intensity * (63 - 17));
              b = Math.round(32 + intensity * (94 - 32));
            }
          } else {
            // Clásico azul a rojo
            if (norm > 0) {
              const intensity = Math.pow(norm, 0.8);
              r = Math.round(15 + intensity * 240);
              g = Math.round(20 + intensity * 70);
              b = Math.round(30 + intensity * 60);
            } else {
              const intensity = Math.pow(-norm, 0.8);
              r = Math.round(15 + intensity * 50);
              g = Math.round(20 + intensity * 120);
              b = Math.round(30 + intensity * 225);
            }
          }

          // Formato Little-Endian ABGR para Uint32Array: (A << 24) | (B << 16) | (G << 8) | R
          data32[yDest * rows + i] = (255 << 24) | (b << 16) | (g << 8) | r;
        }
      }
    }

    offCtx.putImageData(imgData, 0, 0);

    // Suavizado bilineal al escalar a pantalla
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(offscreen, 0, 0, width, height);

    // ═════════════════════════════════════════════════════════════════
    // LÍNEAS DE CONTORNO DE FRONTERAS FÍSICAS Y MONITORES
    // ═════════════════════════════════════════════════════════════════
    if (showBoundaries && gridMeta) {
      const pml = gridMeta.pml_thickness || 16;
      const xToPx = (xCell: number) => (xCell / rows) * width;

      // 1. Capa Absorbente CPML Izquierda
      const pmlLeftW = xToPx(pml);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
      ctx.fillRect(0, 0, pmlLeftW, height);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(pmlLeftW, 0);
      ctx.lineTo(pmlLeftW, height);
      ctx.stroke();

      ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('CPML (Izquierda)', 6, 16);

      // 2. Capa Absorbente CPML Derecha
      const pmlRightX = xToPx(rows - pml);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
      ctx.fillRect(pmlRightX, 0, width - pmlRightX, height);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
      ctx.beginPath();
      ctx.moveTo(pmlRightX, 0);
      ctx.lineTo(pmlRightX, height);
      ctx.stroke();

      ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
      ctx.textAlign = 'right';
      ctx.fillText('CPML (Derecha)', width - 6, 16);

      // 3. Plano TF/SF (Inyección de onda incidente plana pura)
      const tfsfX = xToPx(gridMeta.i_tfsf);
      ctx.strokeStyle = '#38bdf8'; // Cyan
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 3]);
      ctx.beginPath();
      ctx.moveTo(tfsfX, 0);
      ctx.lineTo(tfsfX, height);
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'center';
      ctx.fillText('TF / SF (Fuente)', tfsfX, height - 8);

      // 4. Monitor de Reflexión (en región Dispersada SF)
      const reflX = xToPx(gridMeta.x_refl);
      ctx.strokeStyle = '#c084fc'; // Púrpura
      ctx.lineWidth = 1.2;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(reflX, 0);
      ctx.lineTo(reflX, height);
      ctx.stroke();

      ctx.fillStyle = '#c084fc';
      ctx.fillText('Plano R(f)', reflX, 16);

      // 5. Monitor de Transmisión (cerca de la PML derecha)
      const transX = xToPx(gridMeta.x_trans);
      ctx.strokeStyle = '#34d399'; // Esmeralda
      ctx.lineWidth = 1.2;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(transX, 0);
      ctx.lineTo(transX, height);
      ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.fillText('Plano T(f)', transX, 16);

      // 6. Contornos de la estructura de Metamaterial
      ctx.setLineDash([]);
      const dx_m = gridMeta.dx;
      const xStartCell = gridMeta.i_tfsf + 15;
      const cellLenCells = Math.round((geometry.a_mm * 1e-3) / dx_m);
      const structStartX = xToPx(xStartCell);

      for (let p = 0; p < geometry.periods; p++) {
        const pStartX = xToPx(xStartCell + p * cellLenCells);
        const pW = xToPx(cellLenCells);

        // Guía de celda unitaria
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.strokeRect(pStartX, 0, pW, height);

        // Dibujar el elemento físico replicado en cada celda del mosaico
        for (let rep = 0; rep < mosaicReps; rep++) {
          const repY = (rep / mosaicReps) * height;
          const repH = height / mosaicReps;

          const elemSideCells = Math.round((geometry.d_mm * 1e-3) / dx_m);
          const elemSidePx = (elemSideCells / rows) * width;
          const elemYPx = repY + (repH - elemSidePx) / 2;
          const elemXPx = pStartX + (pW - elemSidePx) / 2;

          if (geometry.family === 'rod_array') {
            if (geometry.is_pec) {
              ctx.fillStyle = 'rgba(245, 158, 11, 0.4)'; // Oro metálico
              ctx.strokeStyle = '#f59e0b';
            } else {
              ctx.fillStyle = 'rgba(56, 189, 248, 0.3)'; // Dieléctrico
              ctx.strokeStyle = '#38bdf8';
            }
            ctx.lineWidth = 1.5;
            ctx.fillRect(elemXPx, elemYPx, elemSidePx, elemSidePx);
            ctx.strokeRect(elemXPx, elemYPx, elemSidePx, elemSidePx);
          } else if (geometry.family === 'square_ring') {
            const wallCells = Math.max(1, Math.round((geometry.w_mm * 1e-3) / dx_m));
            const wallPx = (wallCells / rows) * width;
            const innerSidePx = Math.max(2, elemSidePx - 2 * wallPx);
            const innerXPx = elemXPx + wallPx;
            const innerYPx = elemYPx + wallPx;

            ctx.fillStyle = geometry.is_pec ? 'rgba(245, 158, 11, 0.4)' : 'rgba(56, 189, 248, 0.3)';
            ctx.strokeStyle = geometry.is_pec ? '#f59e0b' : '#38bdf8';
            ctx.lineWidth = 1.5;

            // Anillo exterior menos interior
            ctx.fillRect(elemXPx, elemYPx, elemSidePx, elemSidePx);
            ctx.clearRect(innerXPx, innerYPx, innerSidePx, innerSidePx);
            ctx.strokeRect(elemXPx, elemYPx, elemSidePx, elemSidePx);
            ctx.strokeRect(innerXPx, innerYPx, innerSidePx, innerSidePx);
          }
        }
      }

      // Etiqueta del material sobre la primera celda
      ctx.fillStyle = '#f1f5f9';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      const labelText = geometry.is_pec
        ? `PEC Metálico (${geometry.family === 'rod_array' ? 'Varillas' : 'Anillo'})`
        : `Dieléctrico ε_r = ${geometry.relative_permittivity.toFixed(1)}${geometry.conductivity > 0 ? ` (σ=${geometry.conductivity} S/m)` : ''}`;
      ctx.fillText(labelText, structStartX + xToPx(cellLenCells * geometry.periods) / 2, 28);

      // Barra de escala métrica en milímetros
      const scaleBarMm = 20; // 20 mm
      const scaleBarCells = Math.round((scaleBarMm * 1e-3) / dx_m);
      const scaleBarPx = xToPx(scaleBarCells);
      const sbX = width - scaleBarPx - 16;
      const sbY = height - 12;

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sbX, sbY);
      ctx.lineTo(sbX + scaleBarPx, sbY);
      ctx.moveTo(sbX, sbY - 4);
      ctx.lineTo(sbX, sbY + 4);
      ctx.moveTo(sbX + scaleBarPx, sbY - 4);
      ctx.lineTo(sbX + scaleBarPx, sbY + 4);
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${scaleBarMm} mm`, sbX + scaleBarPx / 2, sbY - 6);
    }
  }, [fieldData, rows, cols, scale, gridMeta, geometry, mosaicReps, showBoundaries, colormap, width, height]);

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-medium)', background: '#030712' }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: 'auto',
          aspectRatio: `${width} / ${height}`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '12px',
          background: 'rgba(3, 7, 18, 0.75)',
          backdropFilter: 'blur(6px)',
          border: '1px solid rgba(148, 163, 184, 0.15)',
          borderRadius: '6px',
          padding: '4px 10px',
          fontSize: '0.72rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#06b6d4' }} />
        <span>Campo TM: <strong>E_z(x, y, t)</strong></span>
        <span style={{ color: 'var(--text-muted)' }}>|</span>
        <span>Mosaico Floquet: <strong>{mosaicReps} celdas</strong></span>
      </div>
    </div>
  );
};
