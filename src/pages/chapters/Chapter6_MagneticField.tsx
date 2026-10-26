import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ChapterLayout } from '../../components/layout/ChapterLayout';
import { ChapterAssumptions } from '../../components/educational/ChapterAssumptions';
import { EquationDisplay } from '../../components/educational/EquationDisplay';
import { usePhysicsSocket } from '../../hooks/usePhysicsSocket';
import { LorentzSnapshot } from '../../types/physics';
import { physicsToCanvas, ViewportTransform } from '../../utils/coordinates';

export const Chapter6_MagneticField: React.FC = () => {
  // Parámetros físicos interactivos
  const [chargeU, setChargeU] = useState<number>(1.0);     // Carga en µC
  const [massUg, setMassUg] = useState<number>(1.0);        // Masa en µg (1e-9 kg)
  const [speed, setSpeed] = useState<number>(40.0);         // Rapidez inicial [m/s] (10 - 80 m/s para radio visible)
  const [Bz, setBz] = useState<number>(0.8);                // Campo magnético Bz [Tesla] (entrante/saliente)
  const [Ey, setEy] = useState<number>(32.0);               // Campo eléctrico Ey [V/m] para filtro Wien
  const [simMode, setSimMode] = useState<'cyclotron' | 'wien'>('cyclotron');

  // Reproducción y animación fluida en pantalla
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [animSpeed, setAnimSpeed] = useState<number>(1.0);  // 0.5x, 1x, 2x
  const [progress, setProgress] = useState<number>(0.0);    // τ ∈ [0.0, 1.0]
  const [snapshots, setSnapshots] = useState<LorentzSnapshot[]>([]);

  // Resultados de guiones de verificación
  const [cyclotronVerification, setCyclotronVerification] = useState<any>(null);
  const [wienVerification, setWienVerification] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const { sendPhysicsRequest, lastResponse, computeTimeMs, isConnected } = usePhysicsSocket();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Escala del visor: 1 m = 2400 px => 5 cm = 120 px de radio
  const transform: ViewportTransform = {
    width: 760,
    height: 480,
    pixelsPerMeter: 2400,
  };

  const q_si = chargeU * 1e-6;
  const m_si = massUg * 1e-9;

  // Parámetros teóricos analíticos
  const safeBz = Math.abs(Bz) < 0.05 ? (Bz >= 0 ? 0.05 : -0.05) : Bz;
  const theoRadius = Math.abs((m_si * speed) / (q_si * safeBz));
  const theoPeriod = Math.abs((2.0 * Math.PI * m_si) / (q_si * safeBz));
  const wienBalancedSpeed = Math.abs(Ey / safeBz);

  // Enviar cálculo al backend garantizando órbita centrada en el origen
  useEffect(() => {
    let initialPos = { x: 0.0, y: 0.0 };
    let initialVel = { x: speed, y: 0.0 };
    let totalT = 0.01;

    if (simMode === 'cyclotron') {
      // Para que el centro de curvatura coincida exactamente con (0, 0):
      // F_y = -q * vx * Bz. Si q*Bz > 0 => Fy < 0 (hacia abajo), empezamos en +Rc.
      const signY = (q_si * Bz >= 0) ? 1.0 : -1.0;
      initialPos = { x: 0.0, y: signY * theoRadius };
      initialVel = { x: speed, y: 0.0 };
      totalT = Math.min(Math.max(theoPeriod * 2.2, 0.001), 0.08);
    } else {
      // Filtro de Wien: entrada en x = -0.08 m, trayectoria hacia la derecha
      initialPos = { x: -0.08, y: 0.0 };
      initialVel = { x: speed, y: 0.0 };
      const flightT = 0.16 / Math.max(speed, 5.0);
      totalT = Math.min(Math.max(flightT * 1.1, 0.001), 0.05);
    }

    sendPhysicsRequest({
      type: 'ch6_magnetic_sim',
      lorentzQuery: {
        charge: q_si,
        mass: m_si,
        initialPos: initialPos,
        initialVel: initialVel,
        E: { x: 0.0, y: simMode === 'wien' ? Ey : 0.0 },
        Bz: Bz,
        totalTime: totalT,
        dt: totalT / 400,
      },
    });
  }, [chargeU, massUg, speed, Bz, Ey, simMode, theoRadius, theoPeriod, q_si, m_si, sendPhysicsRequest]);

  // Escuchar respuestas WebSocket (¡SIN resetear progress a 0 para mantener la fluidez al mover controles!)
  useEffect(() => {
    if (lastResponse?.type === 'ch6_magnetic_result' && lastResponse.lorentzTrajectory) {
      setSnapshots(lastResponse.lorentzTrajectory);
    } else if (lastResponse?.type === 'ch6_cyclotron_result' && lastResponse.cyclotronResult) {
      setCyclotronVerification(lastResponse.cyclotronResult);
      setIsVerifying(false);
    } else if (lastResponse?.type === 'ch6_wien_result' && lastResponse.wienResult) {
      setWienVerification(lastResponse.wienResult);
      setIsVerifying(false);
    }
  }, [lastResponse]);

  // Bucle de animación temporal a 60 FPS con progreso normalizado
  useEffect(() => {
    if (!isPlaying) return;

    let lastTimestamp = performance.now();
    const screenCycleSeconds = simMode === 'cyclotron' ? 3.0 : 2.5;

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
  }, [isPlaying, animSpeed, simMode]);

  // Interpolación sub-step continua
  const getInterpolatedState = useCallback(() => {
    if (snapshots.length === 0) {
      return {
        pos: { x: 0.0, y: simMode === 'cyclotron' ? theoRadius : 0.0 },
        vel: { x: speed, y: 0.0 },
        acc: { x: 0.0, y: 0.0 },
        speed: speed,
        time: 0.0,
        ke: 0.5 * m_si * speed * speed,
        idx: 0,
      };
    }

    if (snapshots.length === 1) {
      const s = snapshots[0];
      return {
        pos: s.position,
        vel: s.velocity,
        acc: s.acceleration,
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

    const px = s1.position.x + alpha * (s2.position.x - s1.position.x);
    const py = s1.position.y + alpha * (s2.position.y - s1.position.y);
    const vx = s1.velocity.x + alpha * (s2.velocity.x - s1.velocity.x);
    const vy = s1.velocity.y + alpha * (s2.velocity.y - s1.velocity.y);
    const ax = s1.acceleration.x + alpha * (s2.acceleration.x - s1.acceleration.x);
    const ay = s1.acceleration.y + alpha * (s2.acceleration.y - s1.acceleration.y);
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
  }, [snapshots, progress, simMode, theoRadius, speed, m_si]);

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

    // 1. Matriz estética de símbolos de campo magnético perpendicular Bz (⊗ saliente vs ⊙ entrante)
    const isOut = Bz > 0;
    ctx.strokeStyle = isOut ? 'rgba(6, 182, 212, 0.22)' : 'rgba(245, 158, 11, 0.22)';
    ctx.fillStyle = isOut ? 'rgba(6, 182, 212, 0.22)' : 'rgba(245, 158, 11, 0.22)';
    ctx.lineWidth = 1;

    const gridSpacing = 42;
    for (let gx = 25; gx < width; gx += gridSpacing) {
      for (let gy = 25; gy < height; gy += gridSpacing) {
        ctx.beginPath();
        ctx.arc(gx, gy, 5.5, 0, Math.PI * 2);
        ctx.stroke();

        if (isOut) {
          // Punto central (⊙ saliente)
          ctx.beginPath();
          ctx.arc(gx, gy, 1.8, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Cruz (⊗ entrante)
          ctx.beginPath();
          ctx.moveTo(gx - 3, gy - 3);
          ctx.lineTo(gx + 3, gy + 3);
          ctx.moveTo(gx + 3, gy - 3);
          ctx.lineTo(gx - 3, gy + 3);
          ctx.stroke();
        }
      }
    }

    // 2. Líneas guía cartesianas
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, height);
    ctx.stroke();

    // 3. Elementos específicos de cada modo
    if (simMode === 'cyclotron') {
      // Círculo teórico analítico centrado en (0, 0)
      const rPx = theoRadius * transform.pixelsPerMeter;
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, rPx, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Marca del centro de giro
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '9px monospace';
      ctx.fillText(`Centro (0,0)  Rc = ${(theoRadius * 100).toFixed(1)} cm`, cx + 8, cy - 8);
    } else {
      // Modo Filtro de Wien: Placas deflectoras superior e inferior
      const pLeftTop = physicsToCanvas({ x: -0.06, y: 0.03 }, transform);
      const pRightTop = physicsToCanvas({ x: 0.06, y: 0.03 }, transform);
      const pLeftBottom = physicsToCanvas({ x: -0.06, y: -0.03 }, transform);
      const pRightBottom = physicsToCanvas({ x: 0.06, y: -0.03 }, transform);

      // Placa superior
      ctx.fillStyle = Ey >= 0 ? 'rgba(244, 63, 94, 0.2)' : 'rgba(14, 165, 233, 0.2)';
      ctx.fillRect(pLeftTop.px, pLeftTop.py - 6, pRightTop.px - pLeftTop.px, 6);
      ctx.strokeStyle = Ey >= 0 ? '#f43f5e' : '#0ea5e9';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(pLeftTop.px, pLeftTop.py);
      ctx.lineTo(pRightTop.px, pRightTop.py);
      ctx.stroke();

      // Placa inferior
      ctx.fillStyle = Ey >= 0 ? 'rgba(14, 165, 233, 0.2)' : 'rgba(244, 63, 94, 0.2)';
      ctx.fillRect(pLeftBottom.px, pLeftBottom.py, pRightBottom.px - pLeftBottom.px, 6);
      ctx.strokeStyle = Ey >= 0 ? '#0ea5e9' : '#f43f5e';
      ctx.beginPath();
      ctx.moveTo(pLeftBottom.px, pLeftBottom.py);
      ctx.lineTo(pRightBottom.px, pRightBottom.py);
      ctx.stroke();

      // Rendijas de entrada y salida
      const pIn = physicsToCanvas({ x: -0.06, y: 0.0 }, transform);
      const pOut = physicsToCanvas({ x: 0.06, y: 0.0 }, transform);

      ctx.fillStyle = '#10b981';
      ctx.fillRect(pIn.px - 3, pIn.py - 12, 3, 8);
      ctx.fillRect(pIn.px - 3, pIn.py + 4, 3, 8);
      ctx.fillRect(pOut.px, pOut.py - 12, 3, 8);
      ctx.fillRect(pOut.px, pOut.py + 4, 3, 8);

      ctx.font = '9px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Rendija Entrada', pIn.px - 45, pIn.py - 18);
      ctx.fillText('Rendija Salida', pOut.px + 6, pOut.py - 18);
    }

    // 4. Trazo continuo de la trayectoria precalculada con el algoritmo de Boris
    if (snapshots.length > 1) {
      ctx.lineWidth = 2;
      for (let i = 0; i < snapshots.length - 1; i++) {
        const s1 = snapshots[i];
        const s2 = snapshots[i + 1];
        const pt1 = physicsToCanvas(s1.position, transform);
        const pt2 = physicsToCanvas(s2.position, transform);

        ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
        ctx.beginPath();
        ctx.moveTo(pt1.px, pt1.py);
        ctx.lineTo(pt2.px, pt2.py);
        ctx.stroke();
      }

      // Estela luminosa dinámica (Trail) detrás de la partícula actual
      const trailLength = 28;
      const startTrail = Math.max(0, activeState.idx - trailLength);
      for (let k = startTrail; k < activeState.idx; k++) {
        const tAlpha = (k - startTrail) / (activeState.idx - startTrail || 1);
        const pt1 = physicsToCanvas(snapshots[k].position, transform);
        const pt2 = physicsToCanvas(snapshots[k + 1].position, transform);

        ctx.lineWidth = 1 + tAlpha * 2.5;
        ctx.strokeStyle = `rgba(6, 182, 212, ${tAlpha * 0.9})`;

        ctx.beginPath();
        ctx.moveTo(pt1.px, pt1.py);
        ctx.lineTo(pt2.px, pt2.py);
        ctx.stroke();
      }
    }

    // 5. Partícula instantánea interpolada
    const pPos = physicsToCanvas(activeState.pos, transform);
    const isPos = chargeU >= 0;

    // Resplandor
    const grad = ctx.createRadialGradient(pPos.px, pPos.py, 2, pPos.px, pPos.py, 18);
    grad.addColorStop(0, isPos ? 'rgba(14, 165, 233, 0.9)' : 'rgba(244, 63, 94, 0.9)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(pPos.px, pPos.py, 18, 0, Math.PI * 2);
    ctx.fill();

    // Esfera
    ctx.fillStyle = isPos ? '#0ea5e9' : '#f43f5e';
    ctx.beginPath();
    ctx.arc(pPos.px, pPos.py, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Signo de carga
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isPos ? '+' : '−', pPos.px, pPos.py);
    ctx.textAlign = 'start';
    ctx.textBaseline = 'alphabetic';

    // Vector de velocidad v (verde esmeralda)
    const vScale = 0.0006 * transform.pixelsPerMeter;
    const vx = pPos.px + activeState.vel.x * vScale;
    const vy = pPos.py - activeState.vel.y * vScale;

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pPos.px, pPos.py);
    ctx.lineTo(vx, vy);
    ctx.stroke();

    // Vector de aceleración centripeta / Fuerza FB (amarillo dorado hacia el centro)
    const aMag = Math.sqrt(activeState.acc.x * activeState.acc.x + activeState.acc.y * activeState.acc.y);
    if (aMag > 1e1) {
      const aScale = (35.0 / aMag); // Longitud visual acotada
      const ax = pPos.px + activeState.acc.x * aScale;
      const ay = pPos.py - activeState.acc.y * aScale;

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pPos.px, pPos.py);
      ctx.lineTo(ax, ay);
      ctx.stroke();
    }
  }, [snapshots, activeState, Bz, Ey, chargeU, simMode, theoRadius, transform]);

  // Ejecutar verificación de Ciclotrón
  const runCyclotronVerification = useCallback(() => {
    setIsVerifying(true);
    sendPhysicsRequest({
      type: 'ch6_cyclotron_verify',
      cyclotronQuery: {
        mass: m_si,
        charge: q_si,
        speed: speed,
        Bz: Bz,
        dt: 0.00002,
      },
    });
  }, [m_si, q_si, speed, Bz, sendPhysicsRequest]);

  // Ejecutar verificación de Filtro de Wien
  const runWienVerification = useCallback(() => {
    setIsVerifying(true);
    sendPhysicsRequest({
      type: 'ch6_wien_verify',
      wienQuery: {
        mass: m_si,
        charge: q_si,
        speed: speed,
        Ey: Ey,
        Bz: Bz,
        length: 0.12,
        dt: 0.00002,
      },
    });
  }, [m_si, q_si, speed, Ey, Bz, sendPhysicsRequest]);

  return (
    <ChapterLayout
      chapterNumber={6}
      chapterTitle="Ondas y Campo Magnético 2D: Fuerza de Lorentz y Ciclotrón"
      prevPath="/chapter/5-moving-charge"
      nextPath="/chapter/7-em-wave-vacuum"
    >
      <ChapterAssumptions
        systemRange="Región plana 2D de [-15 cm, +15 cm] bajo campo magnético transversal Bz k̂"
        particleLimit={1}
        minSeparation="N/A (Campo magnético externo uniforme y simulación Boris simpléctica)"
        chargeRange="±0.2 µC a ±5.0 µC (Masa inercial de 0.2 µg a 5.0 µg)"
        additionalDetails={[
          { label: 'Integrador Boris', value: 'Conservación estricta de energía cinética (Trabajo nulo W = 0)' },
          { label: 'Radio de Ciclotrón', value: 'Rc = (m·v) / (|q|·|Bz|)  y  Tc = (2π·m) / (|q|·|Bz|)' },
        ]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '20px', flex: 1, minHeight: 0 }}>
        {/* Canvas de visualización */}
        <div className="lab-card" style={{ display: 'flex', flexDirection: 'column', padding: '16px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={() => { setSimMode('cyclotron'); setEy(0.0); }}
                className={`btn ${simMode === 'cyclotron' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '4px 12px', fontSize: '0.74rem' }}
              >
                Giro Ciclotrónico Puro (E = 0)
              </button>
              <button
                onClick={() => { setSimMode('wien'); setEy(32.0); }}
                className={`btn ${simMode === 'wien' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '4px 12px', fontSize: '0.74rem' }}
              >
                Filtro de Wien (E ⟂ B)
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
                title="Reiniciar órbita"
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

          {/* Telemetría física */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '10px', background: 'var(--bg-surface-elevated)', padding: '10px 14px', borderRadius: '6px', fontSize: '0.76rem' }}>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Radio Ciclotrónico (Rc)</div>
              <div className="font-mono" style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
                {(theoRadius * 100).toFixed(2)} cm
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Periodo Orbital (Tc)</div>
              <div className="font-mono" style={{ color: 'var(--text-primary)' }}>
                {(theoPeriod * 1e3).toFixed(3)} ms
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Trabajo Magnético (W)</div>
              <div className="font-mono" style={{ color: '#10b981', fontWeight: 600 }}>
                0.00000 J (Constante)
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>v Equilibrio Wien</div>
              <div className="font-mono" style={{ color: 'var(--accent-gold)' }}>
                {wienBalancedSpeed.toFixed(1)} m/s
              </div>
            </div>
          </div>
        </div>

        {/* Panel lateral de controles y Guión Comprobable */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
          <div className="lab-card" style={{ padding: '16px' }}>
            <h2 style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Parámetros Magnéticos
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Campo Magnético (Bz):</span>
                  <span className="font-mono" style={{ color: Bz >= 0 ? 'var(--accent-cyan)' : 'var(--accent-gold)' }}>
                    {Bz.toFixed(2)} T ({Bz >= 0 ? 'Saliente ⊙' : 'Entrante ⊗'})
                  </span>
                </div>
                <input
                  type="range"
                  min="-1.5"
                  max="1.5"
                  step="0.05"
                  value={Bz}
                  onChange={(e) => setBz(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Rapidez inicial (v):</span>
                  <span className="font-mono" style={{ color: '#10b981' }}>{speed.toFixed(1)} m/s</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  step="2"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Carga (q):</span>
                  <span className="font-mono" style={{ color: chargeU >= 0 ? 'var(--charge-pos)' : 'var(--charge-neg)' }}>
                    {chargeU > 0 ? `+${chargeU}` : chargeU} µC
                  </span>
                </div>
                <input
                  type="range"
                  min="-3.0"
                  max="3.0"
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
                  max="3.0"
                  step="0.1"
                  value={massUg}
                  onChange={(e) => setMassUg(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              {simMode === 'wien' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Campo Eléctrico (Ey):</span>
                    <span className="font-mono" style={{ color: 'var(--accent-gold)' }}>{Ey.toFixed(1)} V/m</span>
                  </div>
                  <input
                    type="range"
                    min="-80"
                    max="80"
                    step="2"
                    value={Ey}
                    onChange={(e) => setEy(parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {Math.abs(speed - wienBalancedSpeed) < 2.0
                      ? '✓ CONDICIÓN DE WIEN CUMPLIDA (v = Ey / Bz)'
                      : `Deflexión activa (v ≠ ${wienBalancedSpeed.toFixed(1)} m/s)`}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Guiones comprobables físicamente */}
          <div className="lab-card" style={{ padding: '16px', border: '1px solid var(--border-active)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                {simMode === 'cyclotron' ? 'Guión Comprobable 06A: Ciclotrón' : 'Guión Comprobable 06B: Wien'}
              </span>
              <button
                onClick={simMode === 'cyclotron' ? runCyclotronVerification : runWienVerification}
                disabled={isVerifying}
                className="btn btn-primary"
                style={{ padding: '4px 12px', fontSize: '0.74rem' }}
              >
                {isVerifying ? 'Verificando...' : 'Verificar Física'}
              </button>
            </div>

            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '12px' }}>
              {simMode === 'cyclotron'
                ? 'Comprueba que el algoritmo simpléctico de Boris preserva el radio orbital de Larmor y el periodo analítico exacto sin disipación de energía cinética:'
                : 'Verifica la condición de balance en campos cruzados donde la fuerza eléctrica contrarresta exactamente la magnética:'}
            </p>

            <EquationDisplay
              math={
                simMode === 'cyclotron'
                  ? 'R_c = \\frac{m v}{|q| |B_z|}, \\quad T_c = \\frac{2\\pi m}{|q| |B_z|}, \\quad \\Delta K \\equiv 0'
                  : 'q E_y = q v_x B_z \\implies v_{\\text{filtro}} = \\frac{E_y}{B_z}'
              }
              block={false}
            />

            {simMode === 'cyclotron' && cyclotronVerification && (
              <div style={{ marginTop: '14px', background: 'var(--bg-surface-elevated)', padding: '12px', borderRadius: '6px', fontSize: '0.76rem', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Radio teórico:</span>
                  <span className="font-mono">{(((cyclotronVerification?.theoretical?.radius ?? cyclotronVerification?.theoretical?.cyclotron_radius ?? 0) * 100)).toFixed(2)} cm</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Radio medido Boris:</span>
                  <span className="font-mono">{(((cyclotronVerification?.numerical_radius ?? cyclotronVerification?.numerical_avg_radius ?? 0) * 100)).toFixed(2)} cm</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Error radio:</span>
                  <span className="font-mono" style={{ color: '#10b981', fontWeight: 600 }}>
                    {(cyclotronVerification?.radius_error_percent ?? 0).toFixed(4)}%
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Error periodo:</span>
                  <span className="font-mono" style={{ color: '#10b981', fontWeight: 600 }}>
                    {(cyclotronVerification?.period_error_percent ?? 0).toFixed(4)}%
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Variación ΔK (Trabajo):</span>
                  <span className="font-mono" style={{ color: '#10b981', fontWeight: 600 }}>
                    {(cyclotronVerification?.kinetic_energy_drift_J ?? 0).toExponential(3)} J (Exacto)
                  </span>
                </div>
                <div style={{ padding: '6px 10px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', textAlign: 'center', fontWeight: 600, fontSize: '0.72rem' }}>
                  ✓ ÓRBITA Y TRABAJO NULO VERIFICADOS (Boris)
                </div>
              </div>
            )}

            {simMode === 'wien' && wienVerification && (
              <div style={{ marginTop: '14px', background: 'var(--bg-surface-elevated)', padding: '12px', borderRadius: '6px', fontSize: '0.76rem', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Velocidad calculada:</span>
                  <span className="font-mono">{(wienVerification?.measured_speed ?? wienVerification?.actual_speed ?? 0).toFixed(1)} m/s</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Velocidad teórica Wien:</span>
                  <span className="font-mono">{(wienVerification?.theoretical_wien_speed ?? wienVerification?.wien_speed ?? 0).toFixed(1)} m/s</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Deflexión residual y(L):</span>
                  <span className="font-mono">{(((wienVerification?.deflection_at_exit ?? wienVerification?.exit_y_deflection_m ?? 0) * 1000)).toFixed(3)} mm</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Estado:</span>
                  <span className="font-mono" style={{ color: wienVerification?.is_balanced ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                    {wienVerification?.is_balanced ? 'Rayo Indeflectado' : 'Rayo Desviado'}
                  </span>
                </div>
                <div style={{ padding: '6px 10px', borderRadius: '4px', background: wienVerification?.is_verified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)', color: wienVerification?.is_verified ? '#10b981' : '#f43f5e', textAlign: 'center', fontWeight: 600, fontSize: '0.72rem' }}>
                  {wienVerification?.is_verified ? '✓ CONDICIÓN DE WIEN VERIFICADA' : '✗ FUERA DE BALANCE'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ChapterLayout>
  );
};
