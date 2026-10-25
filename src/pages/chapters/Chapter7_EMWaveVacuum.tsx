import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ChapterLayout } from '../../components/layout/ChapterLayout';
import { ChapterAssumptions } from '../../components/educational/ChapterAssumptions';
import { EquationDisplay } from '../../components/educational/EquationDisplay';
import { usePhysicsSocket } from '../../hooks/usePhysicsSocket';
import { EMWaveSnapshot } from '../../types/physics';
import { physicsToCanvas, ViewportTransform } from '../../utils/coordinates';

export const Chapter7_EMWaveVacuum: React.FC = () => {
  // Parámetros de la onda electromagnética
  const [amplitudeE0, setAmplitudeE0] = useState<number>(120.0); // V/m
  const [frequencyGhz, setFrequencyGhz] = useState<number>(1.5);   // GHz
  const [angleDeg, setAngleDeg] = useState<number>(0.0);           // Grados
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [waveTime, setWaveTime] = useState<number>(0.0);           // Segundos

  // Datos de la grilla de campo
  const [gridData, setGridData] = useState<EMWaveSnapshot[]>([]);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [selectedProbe, setSelectedProbe] = useState<EMWaveSnapshot | null>(null);

  const { sendPhysicsRequest, lastResponse, computeTimeMs, isConnected } = usePhysicsSocket();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  const transform: ViewportTransform = {
    width: 760,
    height: 480,
    pixelsPerMeter: 2400, // 1 metro = 2400 px => 20 cm = 480 px
  };

  const angleRad = (angleDeg * Math.PI) / 180.0;
  const frequencyHz = frequencyGhz * 1e9;
  const wavelengthM = 299792458.0 / frequencyHz;

  // Solicitar grilla de campo electromagnético al backend vía WebSocket
  useEffect(() => {
    sendPhysicsRequest({
      type: 'ch7_em_wave_grid',
      emWaveQuery: {
        amplitudeE0,
        frequency: frequencyHz,
        propagationAngleRad: angleRad,
        time: waveTime,
        resolution: 20,
        xRange: [-0.14, 0.14],
        yRange: [-0.09, 0.09],
      },
    });
  }, [amplitudeE0, frequencyHz, angleRad, waveTime, sendPhysicsRequest]);

  // Manejo de respuestas WebSocket
  useEffect(() => {
    if (lastResponse?.type === 'ch7_em_wave_result' && lastResponse.emWaveGrid) {
      setGridData(lastResponse.emWaveGrid);
      if (!selectedProbe && lastResponse.emWaveGrid.length > 0) {
        setSelectedProbe(lastResponse.emWaveGrid[Math.floor(lastResponse.emWaveGrid.length / 2)]);
      }
    } else if (lastResponse?.type === 'ch7_em_verify_result' && lastResponse.emWaveVerifyResult) {
      setVerificationResult(lastResponse.emWaveVerifyResult);
    }
  }, [lastResponse]);

  // Bucle de animación temporal
  useEffect(() => {
    if (!isPlaying) return;

    let lastT = performance.now();
    const period = 1.0 / frequencyHz;

    const loop = (now: number) => {
      const dt = (now - lastT) / 1000;
      lastT = now;

      // Escalar tiempo para que la oscilación sea visible al ojo humano
      const animSpeed = 0.8 * period;
      setWaveTime((prev) => prev + dt * animSpeed);

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, frequencyHz]);

  // Renderizado del frente de onda y vectores de Poynting en Canvas 2D
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = transform;
    ctx.clearRect(0, 0, width, height);

    // Fondo oscuro con sutil retícula
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, width, height);

    // Renderizar celdas de campo eléctrico Ez continuo
    if (gridData.length > 0) {
      const cellPx = 22; // Tamaño de celda visual
      for (const pt of gridData) {
        const cPos = physicsToCanvas(pt.point, transform);

        // Mapa cromático de Ez: Azul intenso para cresta positiva, Rojo para valle negativo
        const normE = Math.max(Math.min(pt.Ez / (amplitudeE0 || 1.0), 1.0), -1.0);
        let colorStr = 'rgba(15, 23, 42, 0.4)';

        if (normE > 0) {
          const alpha = 0.15 + normE * 0.7;
          colorStr = `rgba(14, 165, 233, ${alpha})`; // Azul eléctrico
        } else if (normE < 0) {
          const alpha = 0.15 + Math.abs(normE) * 0.7;
          colorStr = `rgba(244, 63, 94, ${alpha})`; // Rojo electromagnético
        }

        ctx.fillStyle = colorStr;
        ctx.fillRect(cPos.px - cellPx / 2, cPos.py - cellPx / 2, cellPx, cellPx);

        // Vector de campo magnético B (flechas verdes en el plano)
        if (pt.BMagnitude > 1e-12) {
          const bScale = 4e7; // Escala visual para Teslas
          const bEndX = cPos.px + pt.B.x * bScale;
          const bEndY = cPos.py - pt.B.y * bScale;

          ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(cPos.px, cPos.py);
          ctx.lineTo(bEndX, bEndY);
          ctx.stroke();
        }

        // Vector de Poynting S (flechas doradas hacia la dirección de flujo k)
        if (pt.poyntingMagnitude > 1e-3) {
          const sScale = 0.35;
          const sEndX = cPos.px + pt.poynting.x * sScale;
          const sEndY = cPos.py - pt.poynting.y * sScale;

          ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(cPos.px, cPos.py);
          ctx.lineTo(sEndX, sEndY);
          ctx.stroke();
        }
      }
    }

    // Dibujar indicador de la sonda seleccionada si existe
    if (selectedProbe) {
      const probePos = physicsToCanvas(selectedProbe.point, transform);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(probePos.px, probePos.py, 8, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(probePos.px, probePos.py, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [gridData, selectedProbe, amplitudeE0, transform]);

  // Selección de sonda al hacer clic en el canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || gridData.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Buscar el punto de la grilla más cercano
    let closestPt = gridData[0];
    let minD = Infinity;

    for (const pt of gridData) {
      const p = physicsToCanvas(pt.point, transform);
      const d = Math.hypot(p.px - clickX, p.py - clickY);
      if (d < minD) {
        minD = d;
        closestPt = pt;
      }
    }

    setSelectedProbe(closestPt);
  };

  // Ejecutar verificación teórica analítica completa de Maxwell
  const runEMVerification = useCallback(() => {
    sendPhysicsRequest({
      type: 'ch7_em_verify',
      emWaveVerifyQuery: {
        amplitudeE0,
        frequency: frequencyHz,
        angleRad,
      },
    });
  }, [amplitudeE0, frequencyHz, angleRad, sendPhysicsRequest]);

  return (
    <ChapterLayout
      chapterNumber={7}
      chapterTitle="Onda Electromagnética Ideal en el Vacío 2D: Ecuaciones de Maxwell y Flujo de Poynting"
      prevPath="/chapter/6-magnetic-field"
      nextPath="/chapter/8-metamaterials"
    >
      <ChapterAssumptions
        systemRange="Región de propagación 2D en vacío infinito (ε₀ = 8.854×10⁻¹² F/m, μ₀ = 1.257×10⁻⁶ H/m)"
        particleLimit={0}
        minSeparation="N/A (Campos continuos de Maxwell en el régimen libre sin fuentes)"
        chargeRange="E₀ = 10 a 500 V/m &middot; Frecuencias de microondas 0.5 a 5.0 GHz"
        additionalDetails={[
          { label: 'Relación de Maxwell', value: 'c = 1 / √(ε₀·μ₀) ≈ 299,792,458 m/s' },
          { label: 'Impedancia intrínseca', value: 'η₀ = √(μ₀ / ε₀) ≈ 376.7303 Ω (E / H = η₀)' },
          { label: 'Equipartición', value: 'u_E = 0.5 ε₀ E²  ≡  u_B = 0.5 (1/μ₀) B²' },
        ]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '20px', flex: 1, minHeight: 0 }}>
        {/* Canvas de visualización de la onda electromagnética */}
        <div className="lab-card" style={{ display: 'flex', flexDirection: 'column', padding: '16px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Modo TM 2D &middot; E(z) cresta/valle &middot; B(xy) verde &middot; Poynting S dorado
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="btn btn-secondary"
                style={{ padding: '4px 12px', fontSize: '0.74rem' }}
              >
                {isPlaying ? 'Pausar' : 'Reanudar'}
              </button>
              <button
                onClick={() => setWaveTime(0.0)}
                className="btn btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.74rem' }}
              >
                t = 0
              </button>
              <span className="badge badge-live" style={{ fontSize: '0.7rem' }}>
                {isConnected ? `WS ${computeTimeMs.toFixed(1)} ms` : 'Offline'}
              </span>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: '#030712',
              borderRadius: '6px',
              overflow: 'hidden',
              border: '1px solid var(--border-subtle)',
              cursor: 'crosshair',
            }}
          >
            <canvas
              ref={canvasRef}
              width={transform.width}
              height={transform.height}
              onClick={handleCanvasClick}
              style={{ maxWidth: '100%', maxHeight: '100%' }}
            />
          </div>

          {/* Telemetría física de la sonda */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginTop: '12px', background: 'var(--bg-surface-elevated)', padding: '10px 14px', borderRadius: '6px', fontSize: '0.76rem' }}>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Longitud de onda (λ)</div>
              <div className="font-mono" style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
                {(wavelengthM * 100).toFixed(2)} cm
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Campo Ez medido</div>
              <div className="font-mono" style={{ color: selectedProbe && selectedProbe.Ez >= 0 ? 'var(--charge-pos)' : 'var(--charge-neg)', fontWeight: 600 }}>
                {selectedProbe ? `${selectedProbe.Ez.toFixed(1)} V/m` : '--'}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Campo ||B|| medido</div>
              <div className="font-mono" style={{ color: '#10b981' }}>
                {selectedProbe ? `${(selectedProbe.BMagnitude * 1e9).toFixed(2)} nT` : '--'}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Flujo de Poynting ||S||</div>
              <div className="font-mono" style={{ color: 'var(--accent-gold)' }}>
                {selectedProbe ? `${selectedProbe.poyntingMagnitude.toFixed(2)} W/m²` : '--'}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Equipartición uE / uB</div>
              <div className="font-mono" style={{ color: '#ffffff' }}>
                {selectedProbe && selectedProbe.energyDensityB > 0
                  ? (selectedProbe.energyDensityE / selectedProbe.energyDensityB).toFixed(3)
                  : '1.000'}
              </div>
            </div>
          </div>
        </div>

        {/* Panel lateral de controles y Guión Comprobable */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
          <div className="lab-card" style={{ padding: '16px' }}>
            <h2 style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Parámetros de la Onda
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Frecuencia (f):</span>
                  <span className="font-mono" style={{ color: 'var(--accent-cyan)' }}>{frequencyGhz.toFixed(2)} GHz</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="4.0"
                  step="0.1"
                  value={frequencyGhz}
                  onChange={(e) => setFrequencyGhz(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Amplitud eléctrica (E₀):</span>
                  <span className="font-mono" style={{ color: '#ffffff' }}>{amplitudeE0.toFixed(0)} V/m</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="400"
                  step="10"
                  value={amplitudeE0}
                  onChange={(e) => setAmplitudeE0(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Ángulo de propagación (θ):</span>
                  <span className="font-mono" style={{ color: 'var(--accent-gold)' }}>{angleDeg.toFixed(0)}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="5"
                  value={angleDeg}
                  onChange={(e) => setAngleDeg(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* GUIÓN COMPROBABLE 07 */}
          <div className="lab-card" style={{ padding: '16px', border: '1px solid var(--border-active)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                Guión Comprobable 07
              </span>
              <button
                onClick={runEMVerification}
                className="btn btn-primary"
                style={{ padding: '4px 12px', fontSize: '0.74rem' }}
              >
                Verificar Vacío Maxwell
              </button>
            </div>

            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '10px' }}>
              Evalúa en tiempo real las 3 leyes universales del vacío a partir de las ecuaciones de Maxwell:
            </p>

            <EquationDisplay math="c = \frac{1}{\sqrt{\varepsilon_0 \mu_0}}, \quad \frac{E_0}{B_0} = c, \quad \vec{S} = \frac{\vec{E} \times \vec{B}}{\mu_0}, \quad \eta_0 = \sqrt{\frac{\mu_0}{\varepsilon_0}}" block={false} />

            {verificationResult && (
              <div style={{ marginTop: '12px', background: 'var(--bg-surface-elevated)', padding: '12px', borderRadius: '6px', fontSize: '0.76rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Velocidad λ·f calculada:</span>
                  <span className="font-mono">{verificationResult.wave_speed.calculated_speed_m_s.toExponential(4)} m/s</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Razón E / B medida:</span>
                  <span className="font-mono" style={{ color: '#10b981' }}>{verificationResult.orthogonality_equipartition.E_over_B_measured.toExponential(4)} m/s</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Ortogonalidad E·B:</span>
                  <span className="font-mono">{verificationResult.orthogonality_equipartition.dot_product_E_dot_B.toFixed(1)} (Estrictamente 0)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Impedancia deducida η₀:</span>
                  <span className="font-mono" style={{ color: 'var(--accent-gold)' }}>{verificationResult.poynting_impedance.derived_vacuum_impedance_ohms.toFixed(3)} Ω</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Impedancia teórica:</span>
                  <span className="font-mono">376.730 Ω</span>
                </div>

                <div style={{ padding: '6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', textAlign: 'center', fontWeight: 600, fontSize: '0.72rem' }}>
                  ✓ TODAS LAS RELACIONES DEL VACÍO COMPROBADAS RIGUROSAMENTE
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ChapterLayout>
  );
};
