import React, { useEffect, useRef, useState } from 'react';
import { ChapterLayout } from '../../components/layout/ChapterLayout';
import { ParticleInspector } from '../../components/controls/ParticleInspector';
import { ChapterAssumptions } from '../../components/educational/ChapterAssumptions';
import { EquationDisplay } from '../../components/educational/EquationDisplay';
import { useParticles } from '../../hooks/useParticles';
import { usePhysicsSocket } from '../../hooks/usePhysicsSocket';
import { FieldPoint, Vector2D } from '../../types/physics';
import { physicsToCanvas, canvasToPhysics, ViewportTransform } from '../../utils/coordinates';
import { formatElectricField } from '../../utils/units';

export const Chapter4_ElectricField: React.FC = () => {
  const {
    particles,
    selectedParticle,
    selectedParticleId,
    setSelectedParticleId,
    updateParticlePosition,
    updateParticleCharge,
    removeParticle,
    addParticle,
    isMaxReached,
    maxParticles,
  } = useParticles([
    { id: 'pos1', position: { x: -0.05, y: 0.0 }, charge: 3e-6, label: 'q1 (+3 µC)' },
    { id: 'neg1', position: { x: 0.05, y: 0.0 }, charge: -3e-6, label: 'q2 (−3 µC)' },
  ], 4);

  const [resolution, setResolution] = useState<number>(18);
  const { sendPhysicsRequest, lastResponse, computeTimeMs } = usePhysicsSocket();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [transform, setTransform] = useState<ViewportTransform>({
    width: 800,
    height: 600,
    pixelsPerMeter: 1200,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    sendPhysicsRequest({
      type: 'electric_field',
      particles,
      dimensions: 2,
      fieldQuery: {
        xRange: [-0.15, 0.15],
        yRange: [-0.15, 0.15],
        resolution: resolution,
      },
    });
  }, [particles, resolution, sendPhysicsRequest]);

  const fieldPoints: FieldPoint[] = lastResponse?.type === 'electric_field_result'
    ? lastResponse.field || []
    : [];

  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        const rect = canvasRef.current.parentElement.getBoundingClientRect();
        setTransform((prev) => ({
          ...prev,
          width: Math.floor(rect.width),
          height: Math.floor(rect.height),
        }));
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Render del campo vectorial en Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = transform.width * dpr;
    canvas.height = transform.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, transform.width, transform.height);

    // Malla de vectores E
    fieldPoints.forEach((fp) => {
      const { px, py } = physicsToCanvas(fp.point as Vector2D, transform);
      const eVec = fp.E as Vector2D;
      const mag = fp.magnitude;
      if (mag < 1e-6) return;

      const norm = Math.hypot(eVec.x, eVec.y) || 1;
      const dirX = eVec.x / norm;
      const dirY = -eVec.y / norm;

      const baseLength = Math.min(Math.max(Math.log10(mag + 1) * 4.5, 8), 24);
      const endX = px + dirX * baseLength;
      const endY = py + dirY * baseLength;

      const alpha = Math.min(Math.max(Math.log10(mag + 1) / 7, 0.2), 0.85);

      ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
      ctx.fillStyle = `rgba(56, 189, 248, ${alpha})`;
      ctx.lineWidth = 1.2;

      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      const headLen = 4;
      const angle = Math.atan2(endY - py, endX - px);
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(endX - headLen * Math.cos(angle - Math.PI / 6), endY - headLen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(endX - headLen * Math.cos(angle + Math.PI / 6), endY - headLen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
    });

    // Partículas
    particles.forEach((p) => {
      const { px, py } = physicsToCanvas(p.position as Vector2D, transform);
      const isPos = p.charge >= 0;
      const isSelected = p.id === selectedParticleId;

      const radius = 18;

      if (isSelected) {
        ctx.beginPath();
        ctx.arc(px, py, radius + 8, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fillStyle = isPos ? '#0284c7' : '#e11d48';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isPos ? '+' : '−', px, py);

      ctx.font = '500 11px "JetBrains Mono", monospace';
      ctx.fillStyle = isPos ? '#7dd3fc' : '#fda4af';
      ctx.fillText(p.label, px, py + radius + 18);
    });
  }, [fieldPoints, particles, selectedParticleId, transform]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const clicked = particles.find((p) => {
      const { px, py } = physicsToCanvas(p.position as Vector2D, transform);
      return Math.hypot(clickX - px, clickY - py) <= 25;
    });

    if (clicked) {
      setIsDragging(true);
      setDraggedId(clicked.id);
      setSelectedParticleId(clicked.id);
    } else {
      setSelectedParticleId(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !draggedId) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const newPos = canvasToPhysics(e.clientX - rect.left, e.clientY - rect.top, transform);
    updateParticlePosition(draggedId, newPos);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedId(null);
  };

  return (
    <ChapterLayout
      chapterNumber={4}
      chapterTitle="Campo Eléctrico Vectorial y Principio de Superposición"
      prevPath="/chapter/3-forces-3d"
    >
      {/* Explicación de supuestos de la simulación */}
      <ChapterAssumptions
        systemRange="Región de muestreo en plano 2D [-15 cm, +15 cm] para cálculo continuo de E"
        particleLimit={maxParticles}
        minSeparation="4.0 cm (frontera física de aproximación entre cargas fuente)"
        chargeRange="±0.5 µC a ±10.0 µC"
        additionalDetails={[
          {
            label: 'Vector de campo eléctrico',
            value: 'E = F / q0 [V/m] generado por fuentes puntuales',
          },
          {
            label: 'Malla de muestreo',
            value: `${resolution}×${resolution} puntos de evaluación simultáneos`,
          },
        ]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '16px', flex: 1, minHeight: 0 }}>
        {/* Canvas de campo vectorial */}
        <div className="lab-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '0 4px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Mueve las fuentes para recalcular el campo vectorial global en {computeTimeMs.toFixed(1)} ms.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => addParticle(2e-6, { x: (Math.random() - 0.5) * 0.1, y: (Math.random() - 0.5) * 0.1 })}
                className="btn btn-secondary"
                disabled={isMaxReached}
                style={{ padding: '3px 8px', fontSize: '0.72rem' }}
              >
                + Fuente
              </button>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Malla:</span>
              <input
                type="range"
                min="12"
                max="26"
                step="2"
                value={resolution}
                onChange={(e) => setResolution(parseInt(e.target.value))}
                style={{ width: '70px' }}
              />
              <span className="font-mono" style={{ fontSize: '0.72rem' }}>{resolution}×{resolution}</span>
            </div>
          </div>

          <div style={{ flex: 1, minHeight: '450px', position: 'relative' }}>
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{
                width: '100%',
                height: '100%',
                display: 'block',
                cursor: isDragging ? 'grabbing' : 'crosshair',
                borderRadius: '8px',
              }}
            />
          </div>
        </div>

        {/* Panel lateral */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
          <div className="lab-card-elevated" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Del Concepto de Fuerza al Campo E
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              En lugar de asumir una acción a distancia instantánea, postulamos que toda carga eléctrica altera localmente las propiedades del espacio continuo:
            </p>

            <EquationDisplay math="\vec{E} = \frac{\vec{F}}{q_0} = k_e \frac{q}{r^2} \hat{r} \quad \left[\frac{\text{V}}{\text{m}}\right]" />

            <h4 style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent-cyan)', marginTop: '4px' }}>
              Principio de Superposición Lineal
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              El campo total resultante es la suma vectorial independiente de las contribuciones individuales de cada fuente:
            </p>
            <EquationDisplay math="\vec{E}_{\text{total}}(\vec{r}) = \sum_{i=1}^N \vec{E}_i(\vec{r})" />
          </div>

          <ParticleInspector
            particle={selectedParticle}
            onUpdateCharge={updateParticleCharge}
            onRemove={removeParticle}
          />
        </div>
      </div>
    </ChapterLayout>
  );
};
