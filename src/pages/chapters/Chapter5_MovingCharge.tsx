import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ChapterLayout } from '../../components/layout/ChapterLayout';
import { ChapterAssumptions } from '../../components/educational/ChapterAssumptions';
import { EquationDisplay } from '../../components/educational/EquationDisplay';
import { usePhysicsSocket } from '../../hooks/usePhysicsSocket';
import { TrajectorySnapshot } from '../../types/physics';
import { physicsToCanvas, ViewportTransform } from '../../utils/coordinates';

export const Chapter5_MovingCharge: React.FC = () => {
  // Parámetros físicos interactivos
  const [chargeU, setChargeU] = useState<number>(-1.0); // Carga en micro-Coulombs [µC]
  const [massUg, setMassUg] = useState<number>(1.0);    // Masa en microgramos [µg] (1e-9 kg)
  const [v0x, setV0x] = useState<number>(200.0);        // Velocidad horizontal inicial [m/s]
  const [Ey, setEy] = useState<number>(800.0);          // Campo vertical deflector [V/m]
  const [platesLength, setPlatesLength] = useState<number>(0.12); // Longitud de placas [m] (12 cm)
  const [platesGap, setPlatesGap] = useState<number>(0.06);       // Separación de placas [m] (6 cm)

  // Estado de reproducción y animación fluida en pantalla
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [animSpeed, setAnimSpeed] = useState<number>(1.0); // 0.5x, 1x, 2x
  const [progress, setProgress] = useState<number>(0.0);   // τ ∈ [0.0, 1.0]
  const [snapshots, setSnapshots] = useState<TrajectorySnapshot[]>([]);

  // Estado del guión comprobable
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const { sendPhysicsRequest, lastResponse, computeTimeMs, isConnected } = usePhysicsSocket();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Escala del visor: 1 m = 1800 px => 10 cm = 180 px
  const transform: ViewportTransform = {
    width: 760,
    height: 480,
    pixelsPerMeter: 1800,
  };

  // Convertir a unidades SI estrictas
  const q_si = chargeU * 1e-6;
  const m_si = massUg * 1e-9;

  // Cañón en x = -0.09 m, Detector en x = +0.10 m (Distancia total = 0.19 m)
  const xEmitter = -0.09;
  const xDetector = 0.10;
  const totalDistance = xDetector - xEmitter;
  const totalFlightTime = totalDistance / Math.max(v0x, 10.0);

  // Solicitar simulación al backend cada vez que cambien los parámetros
  useEffect(() => {
    sendPhysicsRequest({
      type: 'trajectory_sim',
      trajectoryQuery: {
        dynamicParticle: {
          particle: {
            id: 'moving_charge',
            position: { x: xEmitter, y: 0.0 },
            charge: q_si,
            label: 'q',
          },
          mass: m_si,
          velocity: { x: v0x, y: 0.0 },
        },
        uniformFields: [
          {
            fieldVector: { x: 0.0, y: Ey },
            xBounds: [-platesLength / 2, platesLength / 2],
            yBounds: [-platesGap / 2, platesGap / 2],
          },
        ],
        totalTime: totalFlightTime * 1.05,
        dt: (totalFlightTime * 1.05) / 350,
      },
    });
  }, [chargeU, massUg, v0x, Ey, platesLength, platesGap, totalFlightTime, q_si, m_si, sendPhysicsRequest]);

  // Actualizar snapshots cuando llegue respuesta del WebSocket (¡SIN forzar progress a 0 para evitar parpadeos!)
  useEffect(() => {
    if (lastResponse?.type === 'trajectory_result' && lastResponse.trajectory) {
      setSnapshots(lastResponse.trajectory);
    } else if (lastResponse?.type === 'ch5_thomson_result' && lastResponse.thomsonResult) {
      setVerificationResult(lastResponse.thomsonResult);
      setIsVerifying(false);
    }
  }, [lastResponse]);

  // Bucle de animación continuo a 60 FPS con progreso normalizado
  useEffect(() => {
    if (!isPlaying) return;

    let lastTimestamp = performance.now();
    const screenCycleSeconds = 2.4; // Ciclo visual completo de vuelo en pantalla

    const loop = (now: number) => {
      const deltaSec = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      const deltaTau = (deltaSec * animSpeed) / screenCycleSeconds;
      setProgress((prev) => {
        const next = prev + deltaTau;
        return next >= 1.0 ? next % 1.0 : next;
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, animSpeed]);

  // Sub-step de interpolación continua entre snapshots
  const getInterpolatedState = useCallback(() => {
    if (snapshots.length === 0) {
      return {
        pos: { x: xEmitter, y: 0.0 },
        vel: { x: v0x, y: 0.0 },
        acc: { x: 0.0, y: 0.0 },
        speed: v0x,
        time: 0.0,
        ke: 0.5 * m_si * v0x * v0x,
        idx: 0,
      };
    }

    if (snapshots.length === 1) {
      const s = snapshots[0];
      return {
        pos: { x: (s.position as any).x, y: (s.position as any).y },
        vel: { x: (s.velocity as any).x, y: (s.velocity as any).y },
        acc: { x: (s.acceleration as any).x, y: (s.acceleration as any).y },
        speed: s.speed,
        time: s.time,
        ke: s.kineticEnergy,
        idx: 0,
      };
    }

    const N = snapshots.length;
    const floatIdx = Math.max(0, Math.min(progress * (N - 1), N - 1.0001));
    const idx = Math.floor(floatIdx);
    const alpha = floatIdx - idx;
    const s1 = snapshots[idx];
    const s2 = snapshots[idx + 1] || s1;

    const p1 = s1.position as any;
    const p2 = s2.position as any;
    const v1 = s1.velocity as any;
    const v2 = s2.velocity as any;
    const a1 = s1.acceleration as any;
    const a2 = s2.acceleration as any;

    const px = p1.x + alpha * (p2.x - p1.x);
    const py = p1.y + alpha * (p2.y - p1.y);
    const vx = v1.x + alpha * (v2.x - v1.x);
    const vy = v1.y + alpha * (v2.y - v1.y);
    const ax = a1.x + alpha * (a2.x - a1.x);
    const ay = a1.y + alpha * (a2.y - a1.y);
    const spd = Math.sqrt(vx * vx + vy * vy);
    const t = s1.time + alpha * (s2.time - s1.time);
    const ke = 0.5 * m_si * spd * spd;

    return {
      pos: { x: px, y: py },
      vel: { x: vx, y: vy },
      acc: { x: ax, y: ay },
      speed: spd,
      time: t,
      ke: ke,
      idx: idx,
    };
  }, [snapshots, progress, v0x, m_si]);

  const activeState = getInterpolatedState();

  // Renderizado en Canvas 2D
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = transform;
    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;

    // 1. Grilla milimétrica de laboratorio
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
    ctx.lineWidth = 1;
    const stepPx = 0.02 * transform.pixelsPerMeter; // Cada 2 cm

    for (let x = cx % stepPx; x < width; x += stepPx) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = cy % stepPx; y < height; y += stepPx) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Eje horizontal de referencia
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.stroke();

    // 2. Cañón de electrones (inyector) en la izquierda
    const pEmitter = physicsToCanvas({ x: xEmitter, y: 0.0 }, transform);
    ctx.fillStyle = '#334155';
    ctx.fillRect(pEmitter.px - 32, pEmitter.py - 12, 30, 24);
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.arc(pEmitter.px - 2, pEmitter.py, 6, -Math.PI / 2, Math.PI / 2);
    ctx.fill();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px monospace';
    ctx.fillText('INICIADOR', pEmitter.px - 44, pEmitter.py - 18);

    // 3. Placas deflectoras superior e inferior
    const xLeft = -platesLength / 2;
    const xRight = platesLength / 2;
    const yTop = platesGap / 2;
    const yBottom = -platesGap / 2;

    const pLeftTop = physicsToCanvas({ x: xLeft, y: yTop }, transform);
    const pRightTop = physicsToCanvas({ x: xRight, y: yTop }, transform);
    const pLeftBottom = physicsToCanvas({ x: xLeft, y: yBottom }, transform);
    const pRightBottom = physicsToCanvas({ x: xRight, y: yBottom }, transform);

    // Placa superior
    const topIsPos = Ey >= 0;
    ctx.fillStyle = topIsPos ? 'rgba(244, 63, 94, 0.15)' : 'rgba(14, 165, 233, 0.15)';
    ctx.fillRect(pLeftTop.px, pLeftTop.py - 8, pRightTop.px - pLeftTop.px, 8);
    ctx.strokeStyle = topIsPos ? '#f43f5e' : '#0ea5e9';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(pLeftTop.px, pLeftTop.py);
    ctx.lineTo(pRightTop.px, pRightTop.py);
    ctx.stroke();

    // Placa inferior
    ctx.fillStyle = topIsPos ? 'rgba(14, 165, 233, 0.15)' : 'rgba(244, 63, 94, 0.15)';
    ctx.fillRect(pLeftBottom.px, pLeftBottom.py, pRightBottom.px - pLeftBottom.px, 8);
    ctx.strokeStyle = topIsPos ? '#0ea5e9' : '#f43f5e';
    ctx.beginPath();
    ctx.moveTo(pLeftBottom.px, pLeftBottom.py);
    ctx.lineTo(pRightBottom.px, pRightBottom.py);
    ctx.stroke();

    // Rótulos de polaridad (+ / -)
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = topIsPos ? '#f43f5e' : '#0ea5e9';
    ctx.fillText(topIsPos ? '+ + +  PLACA SUPERIOR (+)  + + +' : '- - -  PLACA SUPERIOR (-)  - - -', pLeftTop.px + 10, pLeftTop.py - 12);
    ctx.fillStyle = topIsPos ? '#0ea5e9' : '#f43f5e';
    ctx.fillText(topIsPos ? '- - -  PLACA INFERIOR (-)  - - -' : '+ + +  PLACA INFERIOR (+)  + + +', pLeftBottom.px + 10, pLeftBottom.py + 22);

    // Flechas del campo uniforme Ey dentro de las placas
    if (Math.abs(Ey) > 1e-2) {
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
      ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
      ctx.lineWidth = 1;
      const numArrows = 7;
      const dxA = (xRight - xLeft) / (numArrows + 1);

      for (let i = 1; i <= numArrows; i++) {
        const ax = xLeft + i * dxA;
        const arrowStart = physicsToCanvas({ x: ax, y: Ey > 0 ? yBottom + 0.004 : yTop - 0.004 }, transform);
        const arrowEnd = physicsToCanvas({ x: ax, y: Ey > 0 ? yTop - 0.004 : yBottom + 0.004 }, transform);

        ctx.beginPath();
        ctx.moveTo(arrowStart.px, arrowStart.py);
        ctx.lineTo(arrowEnd.px, arrowEnd.py);
        ctx.stroke();

        const tipY = arrowEnd.py;
        const tipX = arrowEnd.px;
        const dir = Ey > 0 ? -1 : 1;
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(tipX - 3.5, tipY - dir * 7);
        ctx.lineTo(tipX + 3.5, tipY - dir * 7);
        ctx.closePath();
        ctx.fill();
      }
    }

    // 4. Pantalla fluorescente / Detector en la derecha
    const pDetector = physicsToCanvas({ x: xDetector, y: 0.0 }, transform);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(pDetector.px, pDetector.py - 110);
    ctx.lineTo(pDetector.px, pDetector.py + 110);
    ctx.stroke();

    // Graduaciones milimétricas en el detector
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
    ctx.fillStyle = 'rgba(16, 185, 129, 0.8)';
    ctx.font = '9px monospace';
    for (let gy = -0.06; gy <= 0.06; gy += 0.02) {
      const py = physicsToCanvas({ x: xDetector, y: gy }, transform).py;
      ctx.beginPath();
      ctx.moveTo(pDetector.px, py);
      ctx.lineTo(pDetector.px + 6, py);
      ctx.stroke();
      ctx.fillText(`${(gy * 100).toFixed(0)}cm`, pDetector.px + 9, py + 3);
    }
    ctx.fillText('DETECTOR', pDetector.px - 26, pDetector.py - 118);

    // 5. Trazo de la trayectoria completa con gradiente de velocidad
    if (snapshots.length > 1) {
      ctx.lineWidth = 2;
      for (let i = 0; i < snapshots.length - 1; i++) {
        const s1 = snapshots[i];
        const s2 = snapshots[i + 1];
        const pt1 = physicsToCanvas(s1.position as any, transform);
        const pt2 = physicsToCanvas(s2.position as any, transform);

        const ratio = Math.min(s1.speed / (v0x * 1.5 || 1), 1.0);
        ctx.strokeStyle = `hsla(${200 - ratio * 160}, 90%, 55%, 0.35)`;

        ctx.beginPath();
        ctx.moveTo(pt1.px, pt1.py);
        ctx.lineTo(pt2.px, pt2.py);
        ctx.stroke();
      }

      // Estela luminosa dinámica (Trail) detrás de la partícula actual
      const trailLength = 30;
      const startTrail = Math.max(0, activeState.idx - trailLength);
      for (let k = startTrail; k < activeState.idx; k++) {
        const tAlpha = (k - startTrail) / (activeState.idx - startTrail || 1);
        const pt1 = physicsToCanvas(snapshots[k].position as any, transform);
        const pt2 = physicsToCanvas(snapshots[k + 1].position as any, transform);

        ctx.lineWidth = 1 + tAlpha * 2.5;
        ctx.strokeStyle = chargeU >= 0
          ? `rgba(14, 165, 233, ${tAlpha * 0.9})`
          : `rgba(244, 63, 94, ${tAlpha * 0.9})`;

        ctx.beginPath();
        ctx.moveTo(pt1.px, pt1.py);
        ctx.lineTo(pt2.px, pt2.py);
        ctx.stroke();
      }
    }

    // 6. Partícula instantánea interpolada
    const pPos = physicsToCanvas(activeState.pos, transform);
    const isPos = chargeU >= 0;

    // Resplandor
    const glowGrad = ctx.createRadialGradient(pPos.px, pPos.py, 2, pPos.px, pPos.py, 18);
    glowGrad.addColorStop(0, isPos ? 'rgba(14, 165, 233, 0.9)' : 'rgba(244, 63, 94, 0.9)');
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(pPos.px, pPos.py, 18, 0, Math.PI * 2);
    ctx.fill();

    // Núcleo
    ctx.fillStyle = isPos ? '#0ea5e9' : '#f43f5e';
    ctx.beginPath();
    ctx.arc(pPos.px, pPos.py, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Símbolo dentro de la partícula (+ / -)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isPos ? '+' : '−', pPos.px, pPos.py);
    ctx.textAlign = 'start';
    ctx.textBaseline = 'alphabetic';

    // Vector de velocidad instantánea v (verde)
    const vScale = 0.0003 * transform.pixelsPerMeter;
    const vEndX = pPos.px + activeState.vel.x * vScale;
    const vEndY = pPos.py - activeState.vel.y * vScale;

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pPos.px, pPos.py);
    ctx.lineTo(vEndX, vEndY);
    ctx.stroke();

    // Vector de aceleración ay (amarillo oro)
    if (Math.abs(activeState.acc.y) > 1e4) {
      const aScale = 0.00000005 * transform.pixelsPerMeter;
      const aEndY = pPos.py - activeState.acc.y * aScale;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pPos.px, pPos.py);
      ctx.lineTo(pPos.px, aEndY);
      ctx.stroke();
    }
  }, [snapshots, activeState, Ey, platesLength, platesGap, chargeU, v0x, transform]);

  // Ejecutar el guión de comprobación física de Thomson
  const runThomsonVerification = useCallback(() => {
    setIsVerifying(true);
    sendPhysicsRequest({
      type: 'ch5_thomson',
      thomsonQuery: {
        charge: q_si,
        mass: m_si,
        v0x: v0x,
        Ey: Ey,
        length: platesLength,
        dt: 0.00002,
      },
    });
  }, [q_si, m_si, v0x, Ey, platesLength, sendPhysicsRequest]);

  return (
    <ChapterLayout
      chapterNumber={5}
      chapterTitle="Campo Eléctrico en Movimiento: Cinemática y Deflexión Balística"
      prevPath="/chapter/4-electric-field"
      nextPath="/chapter/6-magnetic-field"
    >
      <ChapterAssumptions
        systemRange="Región de vuelo 2D de [-20 cm, +20 cm] en vacío (ke = 8.988×10⁹ N·m²/C²)"
        particleLimit={1}
        minSeparation="N/A (Campo uniforme generado por placas paralelas ideales de longitud L)"
        chargeRange="±0.1 µC a ±10.0 µC (Masa regulable de 0.1 µg a 10.0 µg)"
        additionalDetails={[
          { label: 'Integrador numérico', value: 'Velocity-Verlet de 2º orden simpléctico' },
          { label: 'Ecuación rectora', value: 'a = (q/m) · E  =>  y(x) = (q·Ey / 2m·v₀x²) · x²' },
        ]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '20px', flex: 1, minHeight: 0 }}>
        {/* Lienzo y controles de visualización */}
        <div className="lab-card" style={{ display: 'flex', flexDirection: 'column', padding: '16px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Tubo deflector de Thomson 2D &middot; Placas paralelas activas
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {/* Controles de reproducción */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="btn btn-secondary"
                style={{ padding: '4px 12px', fontSize: '0.74rem' }}
              >
                {isPlaying ? '⏸ Pausar' : '▶ Reanudar'}
              </button>
              <button
                onClick={() => setProgress(0.0)}
                className="btn btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                title="Reiniciar disparo desde el cañón"
              >
                ↺ Reiniciar
              </button>

              {/* Selector de velocidad */}
              <div style={{ display: 'flex', background: 'var(--bg-surface-elevated)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                {[0.5, 1.0, 2.0].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setAnimSpeed(spd)}
                    style={{
                      background: animSpeed === spd ? 'var(--accent-primary)' : 'transparent',
                      color: animSpeed === spd ? '#ffffff' : 'var(--text-secondary)',
                      border: 'none',
                      padding: '3px 8px',
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                    }}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              <span className="badge badge-live" style={{ fontSize: '0.7rem' }}>
                {isConnected ? `WS ${computeTimeMs.toFixed(1)} ms` : 'Offline'}
              </span>
            </div>
          </div>

          {/* Canvas */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-deep)', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
            <canvas ref={canvasRef} width={transform.width} height={transform.height} style={{ maxWidth: '100%', maxHeight: '100%' }} />
          </div>

          {/* Línea de tiempo interactiva (Scrubber) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', padding: '0 4px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', minWidth: '60px' }}>
              Avance {(progress * 100).toFixed(0)}%
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.002"
              value={progress}
              onChange={(e) => {
                setIsPlaying(false);
                setProgress(parseFloat(e.target.value));
              }}
              style={{ flex: 1 }}
            />
            <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              {(activeState.time * 1e3).toFixed(3)} ms
            </span>
          </div>

          {/* Barra de telemetría cinemática */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginTop: '10px', background: 'var(--bg-surface-elevated)', padding: '10px 14px', borderRadius: '6px', fontSize: '0.76rem' }}>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Tiempo (t)</div>
              <div className="font-mono" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                {(activeState.time * 1e3).toFixed(2)} ms
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Posición (x, y)</div>
              <div className="font-mono" style={{ color: 'var(--text-primary)' }}>
                {(activeState.pos.x * 100).toFixed(1)}, {(activeState.pos.y * 100).toFixed(1)} cm
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Rapidez ||v||</div>
              <div className="font-mono" style={{ color: '#10b981', fontWeight: 600 }}>
                {activeState.speed.toFixed(1)} m/s
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Aceleración ay</div>
              <div className="font-mono" style={{ color: 'var(--accent-gold)' }}>
                {activeState.acc.y.toExponential(2)} m/s²
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Energía K</div>
              <div className="font-mono" style={{ color: 'var(--accent-cyan)' }}>
                {(activeState.ke * 1e6).toFixed(3)} µJ
              </div>
            </div>
          </div>
        </div>

        {/* Panel lateral: Controles físicos y Guión Comprobable */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
          {/* Controles de parámetros */}
          <div className="lab-card" style={{ padding: '16px' }}>
            <h2 style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Parámetros del Laboratorio
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Carga (q):</span>
                  <span className="font-mono" style={{ color: chargeU >= 0 ? 'var(--charge-pos)' : 'var(--charge-neg)' }}>
                    {chargeU > 0 ? `+${chargeU}` : chargeU} µC
                  </span>
                </div>
                <input
                  type="range"
                  min="-5"
                  max="5"
                  step="0.2"
                  value={chargeU}
                  onChange={(e) => setChargeU(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Masa inercial (m):</span>
                  <span className="font-mono">{massUg.toFixed(1)} µg</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="5.0"
                  step="0.1"
                  value={massUg}
                  onChange={(e) => setMassUg(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Velocidad horizontal (v₀x):</span>
                  <span className="font-mono" style={{ color: '#10b981' }}>{v0x.toFixed(0)} m/s</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="10"
                  value={v0x}
                  onChange={(e) => setV0x(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Campo deflector (Ey):</span>
                  <span className="font-mono" style={{ color: 'var(--accent-gold)' }}>{Ey.toFixed(0)} V/m</span>
                </div>
                <input
                  type="range"
                  min="-2000"
                  max="2000"
                  step="50"
                  value={Ey}
                  onChange={(e) => setEy(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Longitud de placas (L):</span>
                  <span className="font-mono">{(platesLength * 100).toFixed(0)} cm</span>
                </div>
                <input
                  type="range"
                  min="0.04"
                  max="0.16"
                  step="0.01"
                  value={platesLength}
                  onChange={(e) => setPlatesLength(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* GUIÓN DE COMPROBACIÓN FÍSICA RIGUROSA */}
          <div className="lab-card" style={{ padding: '16px', border: '1px solid var(--border-active)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                Guión Comprobable 05
              </span>
              <button
                onClick={runThomsonVerification}
                disabled={isVerifying}
                className="btn btn-primary"
                style={{ padding: '4px 12px', fontSize: '0.74rem' }}
              >
                {isVerifying ? 'Verificando...' : 'Verificar Física'}
              </button>
            </div>

            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '12px' }}>
              Compara la deflexión balística calculada numéricamente paso a paso por <strong>Velocity-Verlet</strong> en el backend contra la fórmula analítica exacta de Thomson:
            </p>

            <EquationDisplay math="y(L) = \frac{q E_y L^2}{2 m v_{0x}^2}" block={false} />

            {verificationResult && (
              <div style={{ marginTop: '14px', background: 'var(--bg-surface-elevated)', padding: '12px', borderRadius: '6px', fontSize: '0.76rem', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Deflexión teórica:</span>
                  <span className="font-mono" style={{ color: 'var(--text-primary)' }}>
                    {(verificationResult.theoretical.y_deflection * 1e3).toFixed(3)} mm
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Deflexión numérica Verlet:</span>
                  <span className="font-mono" style={{ color: 'var(--text-primary)' }}>
                    {(verificationResult.numerical_y * 1e3).toFixed(3)} mm
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Ángulo de salida (θ):</span>
                  <span className="font-mono" style={{ color: 'var(--accent-gold)' }}>
                    {verificationResult.theoretical.deflection_angle_deg.toFixed(2)}°
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Error relativo:</span>
                  <span className="font-mono" style={{ color: verificationResult.relative_error_percent < 0.5 ? '#10b981' : '#f43f5e', fontWeight: 600 }}>
                    {verificationResult.relative_error_percent.toFixed(4)}%
                  </span>
                </div>

                <div style={{ padding: '6px 10px', borderRadius: '4px', background: verificationResult.is_verified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)', color: verificationResult.is_verified ? '#10b981' : '#f43f5e', textAlign: 'center', fontWeight: 600, fontSize: '0.72rem' }}>
                  {verificationResult.is_verified ? '✓ VERIFICACIÓN ANALÍTICA EXITOSA (Error < 0.5%)' : '✗ DISCREPANCIA DETECTADA'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ChapterLayout>
  );
};
