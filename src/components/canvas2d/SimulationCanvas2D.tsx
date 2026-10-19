import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Particle, CoulombForce, Vector2D } from '../../types/physics';
import { physicsToCanvas, canvasToPhysics, ViewportTransform } from '../../utils/coordinates';
import { formatForce, formatDistance } from '../../utils/units';

interface SimulationCanvas2DProps {
  particles: Particle[];
  forces?: CoulombForce[];
  selectedParticleId: string | null;
  onSelectParticle: (id: string | null) => void;
  onMoveParticle: (id: string, newPos: Vector2D) => void;
  onAddParticle?: (pos: Vector2D) => void;
  showGrid?: boolean;
  showForces?: boolean;
  showDistance?: boolean;
}

export const SimulationCanvas2D: React.FC<SimulationCanvas2DProps> = ({
  particles,
  forces = [],
  selectedParticleId,
  onSelectParticle,
  onMoveParticle,
  onAddParticle,
  showGrid = true,
  showForces = true,
  showDistance = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Escala: 1 metro = 1200 px (o sea, 10 cm = 120 px, 1 cm = 12 px)
  const [transform, setTransform] = useState<ViewportTransform>({
    width: 800,
    height: 600,
    pixelsPerMeter: 1200,
  });

  // Ajuste de tamaño responsive
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

  // Función principal de renderizado en Canvas 2D
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Soporte HiDPI / Retina
    const dpr = window.devicePixelRatio || 1;
    canvas.width = transform.width * dpr;
    canvas.height = transform.height * dpr;
    ctx.scale(dpr, dpr);

    // Fondo
    ctx.fillStyle = '#070a11';
    ctx.fillRect(0, 0, transform.width, transform.height);

    const cx = transform.width / 2;
    const cy = transform.height / 2;

    // 1. REJILLA DE COORDENADAS FÍSICAS (cada 5 cm y 10 cm)
    if (showGrid) {
      const stepMeters = 0.05; // 5 cm
      const stepPx = stepMeters * transform.pixelsPerMeter;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;

      // Líneas verticales
      for (let x = cx % stepPx; x < transform.width; x += stepPx) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, transform.height);
        ctx.stroke();
      }
      // Líneas horizontales
      for (let y = cy % stepPx; y < transform.height; y += stepPx) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(transform.width, y);
        ctx.stroke();
      }

      // Ejes X e Y principales con alta transparencia y sutileza
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;

      // Eje X
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(transform.width, cy);
      ctx.stroke();

      // Eje Y
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, transform.height);
      ctx.stroke();
    }

    // 2. LÍNEA DE DISTANCIA ENTRE PARTÍCULAS
    if (showDistance && particles.length >= 2) {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const c1 = physicsToCanvas(p1.position as Vector2D, transform);
          const c2 = physicsToCanvas(p2.position as Vector2D, transform);

          const dx = (p2.position as Vector2D).x - (p1.position as Vector2D).x;
          const dy = (p2.position as Vector2D).y - (p1.position as Vector2D).y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Línea punteada
          ctx.beginPath();
          ctx.setLineDash([4, 6]);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = 1.5;
          ctx.moveTo(c1.px, c1.py);
          ctx.lineTo(c2.px, c2.py);
          ctx.stroke();
          ctx.setLineDash([]);

          // Etiqueta r = ... cm en el centro con desplazamiento perpendicular y pastilla oscura
          const midX = (c1.px + c2.px) / 2;
          const midY = (c1.py + c2.py) / 2;
          const normDist = dist || 1e-4;
          const perpX = -dy / normDist;
          const perpY = dx / normDist;
          const labelDistX = midX + perpX * 18;
          const labelDistY = midY - perpY * 18;

          const rText = `r = ${formatDistance(dist)}`;
          ctx.font = '500 11px "JetBrains Mono", monospace';
          const rMetrics = ctx.measureText(rText);
          const rW = rMetrics.width;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
          ctx.fillRect(labelDistX - rW / 2 - 4, labelDistY - 8, rW + 8, 16);

          ctx.fillStyle = '#94a3b8';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(rText, labelDistX, labelDistY);
        }
      }
    }

    // 3. VECTORES DE FUERZA (FLECHAS)
    if (showForces && forces.length > 0) {
      forces.forEach((f) => {
        const targetParticle = particles.find((p) => p.id === f.particleToId);
        if (!targetParticle) return;

        const origin = physicsToCanvas(targetParticle.position as Vector2D, transform);

        // Longitud visual de la flecha con escala logarítmica/proporcional calibrada
        // 1 N ~ 60 px con límites mínimo y máximo para claridad visual
        const baseLength = Math.min(Math.max(f.forceMagnitude * 60, 25), 140);
        const fVec = f.force as Vector2D;
        const norm = Math.hypot(fVec.x, fVec.y) || 1;
        const dirX = fVec.x / norm;
        const dirY = -fVec.y / norm; // Inversión de eje Y en canvas

        const endX = origin.px + dirX * baseLength;
        const endY = origin.py + dirY * baseLength;

        // Color según si es atracción (púrpura) o repulsión (amarillo-naranja)
        const arrowColor = f.isAttractive ? '#a855f7' : '#f59e0b';

        // Dibujar cuerpo de la flecha
        ctx.beginPath();
        ctx.moveTo(origin.px, origin.py);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = arrowColor;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Cabeza de la flecha
        const headLength = 12;
        const angle = Math.atan2(endY - origin.py, endX - origin.px);
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - headLength * Math.cos(angle - Math.PI / 6),
          endY - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          endX - headLength * Math.cos(angle + Math.PI / 6),
          endY - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = arrowColor;
        ctx.fill();

        // Etiqueta del vector |F| con pastilla protectora contra solapamiento
        const fText = `F = ${formatForce(f.forceMagnitude)}`;
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        const fMetrics = ctx.measureText(fText);
        const fW = fMetrics.width;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.fillRect(endX + 6, endY - 8, fW + 8, 17);

        ctx.fillStyle = arrowColor;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(fText, endX + 10, endY);
      });
    }

    // 4. PARTÍCULAS CARGADAS
    particles.forEach((p) => {
      const { px, py } = physicsToCanvas(p.position as Vector2D, transform);
      const isPos = p.charge >= 0;
      const isSelected = p.id === selectedParticleId;

      // Radio visual proporcional a la raíz cúbica de |q| (para no volverse gigante)
      const absChargeU = Math.abs(p.charge) * 1e6;
      const radius = Math.min(Math.max(16 + Math.cbrt(absChargeU) * 4, 18), 34);

      // Halo de selección
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(px, py, radius + 8, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Glow exterior
      const glowGrad = ctx.createRadialGradient(px, py, radius * 0.4, px, py, radius * 2);
      glowGrad.addColorStop(0, isPos ? 'rgba(14, 165, 233, 0.4)' : 'rgba(244, 63, 94, 0.4)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.beginPath();
      ctx.arc(px, py, radius * 2, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      // Esfera con gradiente 3D (Positivas AZULES, Negativas ROJAS)
      const grad = ctx.createRadialGradient(
        px - radius * 0.3,
        py - radius * 0.3,
        radius * 0.1,
        px,
        py,
        radius
      );
      if (isPos) {
        grad.addColorStop(0, '#7dd3fc');
        grad.addColorStop(0.5, '#0284c7');
        grad.addColorStop(1, '#075985');
      } else {
        grad.addColorStop(0, '#fda4af');
        grad.addColorStop(0.5, '#e11d48');
        grad.addColorStop(1, '#9f1239');
      }

      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Signo (+ o −)
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${radius > 24 ? 18 : 14}px "Plus Jakarta Sans", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isPos ? '+' : '−', px, py);

      // Label de la partícula dinámico con su carga en vivo y fondo protector
      const baseLabel = p.label ? p.label.split(' ')[0] : 'q';
      const chargeU = (p.charge * 1e6).toFixed(1);
      const signStr = p.charge >= 0 ? '+' : '';
      const displayLabel = `${baseLabel} (${signStr}${chargeU} µC)`;

      ctx.font = '600 11px "JetBrains Mono", monospace';
      const labelMetrics = ctx.measureText(displayLabel);
      const labelW = labelMetrics.width;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.fillRect(px - labelW / 2 - 6, py + radius + 10, labelW + 12, 18);

      ctx.fillStyle = isPos ? '#7dd3fc' : '#fda4af';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(displayLabel, px, py + radius + 19);
    });
  }, [particles, forces, selectedParticleId, transform, showGrid, showForces, showDistance]);

  // Manejo de eventos de Mouse / Arrastre
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Detectar si se hizo clic sobre una partícula
    const clickedParticle = particles.find((p) => {
      const { px, py } = physicsToCanvas(p.position as Vector2D, transform);
      const dist = Math.hypot(clickX - px, clickY - py);
      return dist <= 30; // Radio de hit
    });

    if (clickedParticle) {
      setIsDragging(true);
      setDraggedId(clickedParticle.id);
      onSelectParticle(clickedParticle.id);
    } else {
      onSelectParticle(null);
      // Si hay handler de añadir partícula al clic
      if (onAddParticle && e.shiftKey) {
        const physicalPos = canvasToPhysics(clickX, clickY, transform);
        onAddParticle(physicalPos);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !draggedId) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newPos = canvasToPhysics(mouseX, mouseY, transform);
    onMoveParticle(draggedId, newPos);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedId(null);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '400px' }}>
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
  );
};
