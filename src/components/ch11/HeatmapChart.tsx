import React, { useRef, useEffect, useState } from 'react';

interface HeatmapChartProps {
  paramXName: string;
  paramXValues: number[];
  paramYName: string;
  paramYValues: number[];
  matrixDb: number[][]; // [len(y), len(x)]
  matrixLinear?: number[][];
  matrixF2?: number[][];
}

export const HeatmapChart: React.FC<HeatmapChartProps> = ({
  paramXName,
  paramXValues,
  paramYName,
  paramYValues,
  matrixDb,
  matrixLinear,
  matrixF2,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredCell, setHoveredCell] = useState<{ i: number; j: number; valDb: number; valLinear?: number; valF2?: number; x: number; y: number } | null>(null);

  const nx = paramXValues.length;
  const ny = paramYValues.length;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || nx === 0 || ny === 0 || !matrixDb || matrixDb.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const cellW = w / nx;
    const cellH = h / ny;

    // Colormap de decibelios: de -40 dB (mora oscura/azul) a 0 dB (oro brillante)
    const minDb = -35.0;
    const maxDb = 0.0;

    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const val = matrixDb[j]?.[i] ?? minDb;
        const norm = Math.max(0.0, Math.min(1.0, (val - minDb) / (maxDb - minDb)));

        // Interpolación viridis / inferno dark
        const r = Math.round(15 + norm * 240);
        const g = Math.round(15 + Math.pow(norm, 1.8) * 160);
        const b = Math.round(35 + (1 - norm) * 180 + norm * 20);

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(i * cellW, (ny - 1 - j) * cellH, cellW, cellH);

        // Borde fino de celda
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.lineWidth = 1;
        ctx.strokeRect(i * cellW, (ny - 1 - j) * cellH, cellW, cellH);

        // Texto numérico si la celda es suficientemente grande
        if (cellW > 35 && cellH > 25) {
          ctx.fillStyle = norm > 0.5 ? '#030712' : '#f1f5f9';
          ctx.font = '10px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${val.toFixed(1)}`, (i + 0.5) * cellW, (ny - 1 - j + 0.5) * cellH);
        }
      }
    }
  }, [paramXValues, paramYValues, matrixDb, nx, ny]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || nx === 0 || ny === 0) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const i = Math.floor((x / rect.width) * nx);
    const jFromTop = Math.floor((y / rect.height) * ny);
    const j = ny - 1 - jFromTop;

    if (i >= 0 && i < nx && j >= 0 && j < ny) {
      setHoveredCell({
        i,
        j,
        valDb: matrixDb[j]?.[i] ?? 0,
        valLinear: matrixLinear?.[j]?.[i],
        valF2: matrixF2?.[j]?.[i],
        x: e.clientX,
        y: e.clientY,
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
  };

  if (nx === 0 || ny === 0 || !matrixDb || matrixDb.length === 0) {
    return (
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: '10px',
          padding: '24px',
          height: '280px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          color: 'var(--text-muted)',
          fontSize: '0.82rem',
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>🔥</span>
        <span>Ejecute el barrido 2D para generar el mapa de calor T(f₀; a, d).</span>
        <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
          Permite explorar visualmente el paisaje de la función objetivo sobre dos dimensiones continuas.
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderRadius: '10px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Mapa de Calor de Transmisión T(f₀) [dB]
          </h3>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            Eje X: {paramXName} &middot; Eje Y: {paramYName}
          </span>
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)' }}>
          f₀ = 10 GHz
        </span>
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {/* Eje Y Label */}
        <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          {paramYName} [mm]
        </div>

        {/* Canvas de Matriz */}
        <div style={{ flex: 1, position: 'relative' }}>
          <canvas
            ref={canvasRef}
            width={440}
            height={220}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '6px', cursor: 'crosshair' }}
          />

          {/* Tooltip flotante */}
          {hoveredCell && (
            <div
              style={{
                position: 'fixed',
                left: hoveredCell.x + 12,
                top: hoveredCell.y - 28,
                background: '#0b1120',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '0.72rem',
                color: '#f1f5f9',
                pointerEvents: 'none',
                zIndex: 1000,
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <div>{paramXName} = {paramXValues[hoveredCell.i]?.toFixed(1)} mm, {paramYName} = {paramYValues[hoveredCell.j]?.toFixed(1)} mm</div>
              <div style={{ color: '#06b6d4' }}>T(f₀) = {hoveredCell.valDb.toFixed(2)} dB {hoveredCell.valLinear !== undefined ? `(${hoveredCell.valLinear.toFixed(4)})` : ''}</div>
              {hoveredCell.valF2 !== undefined && (
                <div style={{ color: '#f59e0b' }}>F₂ Score = {hoveredCell.valF2.toFixed(4)}</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Eje X Label */}
      <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        {paramXName} [mm]
      </div>
    </div>
  );
};
