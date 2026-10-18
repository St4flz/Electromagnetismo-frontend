import React, { useEffect, useRef, useState } from 'react';
import { ChapterLayout } from '../../components/layout/ChapterLayout';
import { ParticleInspector } from '../../components/controls/ParticleInspector';
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
  } = useParticles([
    { id: 'pos1', position: { x: -0.05, y: 0.0 }, charge: 3e-6, label: '+q₁' },
    { id: 'neg1', position: { x: 0.05, y: 0.0 }, charge: -3e-6, label: '−q₂' },
  ]);

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

  // Solicitar campo eléctrico vectorial al backend
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

  // Ajuste de tamaño responsive del canvas
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

    // Fondo oscuro
    ctx.fillStyle = '#060911';
    ctx.fillRect(0, 0, transform.width, transform.height);

    // 1. DIBUJAR VECTORES DE CAMPO ELÉCTRICO E(x, y)
    fieldPoints.forEach((fp) => {
      const { px, py } = physicsToCanvas(fp.point as Vector2D, transform);
      const eVec = fp.E as Vector2D;
      const mag = fp.magnitude;
      if (mag < 1e-6) return;

      const norm = Math.hypot(eVec.x, eVec.y) || 1;
      const dirX = eVec.x / norm;
      const dirY = -eVec.y / norm; // Inversión en canvas

      // Escala visual y de brillo según intensidad logarítmica
      const intensity = Math.min(Math.log10(Math.max(mag, 1)) / 7, 1);
      const arrowLength = 12 + intensity * 12;

      const endX = px + dirX * arrowLength;
      const endY = py + dirY * arrowLength;

      // Color graduado según intensidad del campo
      const alpha = Math.max(0.15, intensity);
      ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
      ctx.fillStyle = `rgba(56, 189, 248, ${alpha})`;
      ctx.lineWidth = 1 + intensity * 1.5;

      // Línea de la flecha
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Cabeza de flecha
      const head = 4 + intensity * 3;
      const angle = Math.atan2(endY - py, endX - px);
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(endX - head * Math.cos(angle - Math.PI / 6), endY - head * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(endX - head * Math.cos(angle + Math.PI / 6), endY - head * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
    });

    // 2. DIBUJAR PARTÍCULAS FUENTE
    particles.forEach((p) => {
      const { px, py } = physicsToCanvas(p.position as Vector2D, transform);
      const isPos = p.charge >= 0;
      const radius = 22;

      // Glow
      const glow = ctx.createRadialGradient(px, py, radius * 0.5, px, py, radius * 2.5);
      glow.addColorStop(0, isPos ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.5)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(px, py, radius * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // Círculo
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fillStyle = isPos ? '#ef4444' : '#3b82f6';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Signo
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isPos ? '+' : '−', px, py);
    });
  }, [fieldPoints, particles, transform]);

  // Arrastre de partículas
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const clicked = particles.find((p) => {
      const { px, py } = physicsToCanvas(p.position as Vector2D, transform);
      return Math.hypot(clickX - px, clickY - py) <= 30;
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '16px', flex: 1, minHeight: 0 }}>
        {/* Canvas de campo vectorial */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '0 8px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              🌊 <strong>Campo Vectorial E:</strong> Mueve las cargas para ver cómo se deforma el campo en tiempo real ({computeTimeMs.toFixed(1)} ms).
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Malla:</span>
              <input
                type="range"
                min="12"
                max="28"
                step="2"
                value={resolution}
                onChange={(e) => setResolution(parseInt(e.target.value))}
                style={{ width: '80px' }}
              />
              <span className="font-mono" style={{ fontSize: '0.75rem' }}>{resolution}×{resolution}</span>
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
                borderRadius: '12px',
              }}
            />
          </div>
        </div>

        {/* Panel lateral con fundamentos del Campo Eléctrico */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
          <div className="glass-panel-elevated" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              ⚡ Del Concepto de Fuerza al Campo E
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              En lugar de considerar la acción a distancia instantánea, postulamos que cada carga eléctrica perturba el espacio circundante creando un campo:
            </p>

            <EquationDisplay math="\vec{E} = \frac{\vec{F}}{q_0} = k_e \frac{q}{r^2} \hat{r} \quad \left[\frac{\text{V}}{\text{m}}\right]" />

            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#38bdf8', marginTop: '6px' }}>
              Principio de Superposición Lineal
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              El campo neto es la suma vectorial directa de todas las fuentes:
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
