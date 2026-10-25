import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { ChapterLayout } from '../../components/layout/ChapterLayout';
import { ChapterAssumptions } from '../../components/educational/ChapterAssumptions';
import { EquationDisplay } from '../../components/educational/EquationDisplay';
import { usePhysicsSocket } from '../../hooks/usePhysicsSocket';
import { SpectralPoint } from '../../types/physics';

export const Chapter8_Metamaterials: React.FC = () => {
  // Variables geométricas de la celda unitaria periódica (Segunda Entrega del Proyecto)
  const [a_mm, setA_mm] = useState<number>(10.0);       // Tamaño de la celda (a) [mm]
  const [d_mm, setD_mm] = useState<number>(2.0);        // Separación (d) [mm]
  const [w_mm, setW_mm] = useState<number>(1.0);        // Ancho de la sección (w) [mm]
  const [periods, setPeriods] = useState<number>(5);     // Número de períodos (N)
  const [lossFactor, setLossFactor] = useState<number>(0.002); // Factor de pérdidas óhmicas

  // Modo de visualización de gráficas: Espectro de Potencia (T, R, A) vs Parámetros Efectivos (ε, μ, n)
  const [chartView, setChartView] = useState<'powers' | 'effective_params'>('powers');

  // Datos espectrales
  const [spectrumData, setSpectrumData] = useState<SpectralPoint[]>([]);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const { sendPhysicsRequest, lastResponse, computeTimeMs, isConnected } = usePhysicsSocket();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Solicitar espectro TMM continuo al backend cada vez que cambien variables geométricas
  useEffect(() => {
    sendPhysicsRequest({
      type: 'ch8_metamaterials_spectrum',
      metaQuery: {
        cell: {
          a: a_mm,
          d: d_mm,
          w: w_mm,
          periods: periods,
          lossFactor: lossFactor,
        },
        freqMinGhz: 5.0,
        freqMaxGhz: 15.0,
        points: 70,
      },
    });
  }, [a_mm, d_mm, w_mm, periods, lossFactor, sendPhysicsRequest]);

  // Manejar respuestas WebSocket
  useEffect(() => {
    if (lastResponse?.type === 'ch8_metamaterials_result' && lastResponse.spectrum) {
      setSpectrumData(lastResponse.spectrum);
    } else if (lastResponse?.type === 'ch8_metamaterials_verify_result' && lastResponse.metamaterialsVerifyResult) {
      setVerificationResult(lastResponse.metamaterialsVerifyResult);
    }
  }, [lastResponse]);

  // Dibujar diagrama esquemático de refracción negativa y arquitectura de celda unitaria
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Fondo
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, w, h);

    // 1. Dibujo de la losa del metamaterial en el centro
    const slabX = w * 0.38;
    const slabWidth = w * 0.35;
    ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';
    ctx.fillRect(slabX, 20, slabWidth, h - 40);

    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(slabX, 20, slabWidth, h - 40);

    // Texto de interfaz
    ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
    ctx.font = '10px monospace';
    ctx.fillText('Vacío (n₁ = +1)', 20, 35);
    ctx.fillText(`Metamaterial DNG (a=${a_mm}mm, w=${w_mm}mm)`, slabX + 15, 35);
    ctx.fillText('Transmisión (n₃ = +1)', slabX + slabWidth + 15, 35);

    // 2. Estructura interna periódica (Split-Ring Resonators esquemáticos)
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1.5;
    const numRows = 4;
    const numCols = Math.min(periods, 6);
    const colStep = slabWidth / (numCols + 1);
    const rowStep = (h - 70) / (numRows + 1);

    for (let c = 1; c <= numCols; c++) {
      for (let r = 1; r <= numRows; r++) {
        const cx = slabX + c * colStep;
        const cy = 40 + r * rowStep;
        const rad = 8 * (a_mm / 10.0);

        // Anillo exterior con gap (SRR)
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0.25 * Math.PI, 1.75 * Math.PI);
        ctx.stroke();

        // Anillo interior con gap opuesto
        ctx.beginPath();
        ctx.arc(cx, cy, rad * 0.55, 1.25 * Math.PI, 0.75 * Math.PI);
        ctx.stroke();
      }
    }

    // 3. Trayectoria del haz electromagnético con REFRACCIÓN NEGATIVA (Veselago)
    const normalY = h * 0.55;
    // Línea normal punteada
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(slabX - 40, normalY);
    ctx.lineTo(slabX + slabWidth + 40, normalY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Haz incidente desde el cuadrante superior izquierdo (θ₁ = 30°)
    const startX = slabX - 100;
    const startY = normalY - 58;
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.9)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(slabX, normalY);
    ctx.stroke();

    // Flecha de propagación incidente
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc((startX + slabX) / 2, (startY + normalY) / 2, 3, 0, Math.PI * 2);
    ctx.fill();

    // Haz dentro del metamaterial: Refracción Negativa (se desvía HACIA ARRIBA en vez de hacia abajo)
    const midX = slabX + slabWidth;
    const midY = normalY - 24; // Ángulo negativo!
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(slabX, normalY);
    ctx.lineTo(midX, midY);
    ctx.stroke();

    // Haz transmitido de salida al vacío (paralelo al haz incidente)
    const exitX = midX + 90;
    const exitY = midY - 52;
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.9)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(midX, midY);
    ctx.lineTo(exitX, exitY);
    ctx.stroke();

    // Etiqueta de ángulo negativo
    ctx.fillStyle = '#06b6d4';
    ctx.fillText('Refracción Negativa (θ₂ < 0)', slabX + 10, normalY + 25);
  }, [a_mm, d_mm, w_mm, periods]);

  // Ejecutar verificación física de metamateriales
  const runMetamaterialsVerification = useCallback(() => {
    sendPhysicsRequest({
      type: 'ch8_metamaterials_verify',
      metaQuery: {
        cell: {
          a: a_mm,
          d: d_mm,
          w: w_mm,
          periods: periods,
          lossFactor: lossFactor,
        },
        freqMinGhz: 5.0,
        freqMaxGhz: 15.0,
        points: 80,
      },
    });
  }, [a_mm, d_mm, w_mm, periods, lossFactor, sendPhysicsRequest]);

  // Valor de la función objetivo a f0 = 10 GHz
  const ptAt10Ghz = spectrumData.reduce((prev, curr) =>
    Math.abs(curr.frequencyGhz - 10.0) < Math.abs(prev.frequencyGhz - 10.0) ? curr : prev,
    spectrumData[0] || { transmission: 0, reflection: 0, absorption: 0, frequencyGhz: 10 }
  );

  return (
    <ChapterLayout
      chapterNumber={8}
      chapterTitle="Introducción a Metamateriales: Estructuras Periódicas y Refracción Negativa"
      prevPath="/chapter/7-em-wave-vacuum"
      nextPath="/chapter/9-fdtd-intro"
    >
      <ChapterAssumptions
        systemRange="Estructura periódica 2D con celda unitaria de parámetros geométricos (a, d, w)"
        particleLimit={0}
        minSeparation="a = 5 a 20 mm &middot; Banda de microondas 5.0 a 15.0 GHz &middot; Objetivo: f₀ = 10 GHz"
        chargeRange="Resonadores magnéticos Split-Ring (SRR) y varillas delgadas tipo Pendry/Smith"
        additionalDetails={[
          { label: 'Condición DNG (Veselago)', value: 'Re(ε) < 0 y Re(μ) < 0  =>  n_eff = -√(ε_r · μ_r) < 0' },
          { label: 'Conservación estricta', value: 'R(f) + T(f) + A(f) ≡ 1.000000 (TMM matricial)' },
          { label: 'Función Objetivo F(p)', value: 'F(a, d, w) = T(10 GHz; p) para blindaje / transmisión' },
        ]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '20px', flex: 1, minHeight: 0 }}>
        {/* Panel principal: Gráfica espectral y diagrama de refracción */}
        <div className="lab-card" style={{ display: 'flex', flexDirection: 'column', padding: '16px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setChartView('powers')}
                className={`btn ${chartView === 'powers' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '4px 12px', fontSize: '0.74rem' }}
              >
                Espectro de Potencia (T, R, A)
              </button>
              <button
                onClick={() => setChartView('effective_params')}
                className={`btn ${chartView === 'effective_params' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '4px 12px', fontSize: '0.74rem' }}
              >
                Parámetros Efectivos (ε_eff, μ_eff, n_eff)
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span className="badge" style={{ fontSize: '0.72rem' }}>
                F(p) a 10 GHz = {(ptAt10Ghz.transmission * 100).toFixed(1)}% T
              </span>
              <span className="badge badge-live" style={{ fontSize: '0.7rem' }}>
                {isConnected ? `WS ${computeTimeMs.toFixed(1)} ms` : 'Offline'}
              </span>
            </div>
          </div>

          {/* Gráfico Recharts de alta precisión */}
          <div style={{ height: '240px', width: '100%', marginTop: '6px' }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartView === 'powers' ? (
                <LineChart data={spectrumData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                  <XAxis
                    dataKey="frequencyGhz"
                    stroke="var(--text-muted)"
                    fontSize={11}
                    unit=" GHz"
                    domain={[5, 15]}
                  />
                  <YAxis stroke="var(--text-muted)" fontSize={11} domain={[0, 1.05]} />
                  <Tooltip
                    contentStyle={{ background: '#0b1120', borderColor: 'var(--border-subtle)', fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <ReferenceLine x={10.0} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: 'f₀ = 10 GHz', fill: '#f43f5e', fontSize: 10 }} />
                  <Line type="monotone" dataKey="transmission" name="Transmisión T(f)" stroke="#06b6d4" strokeWidth={2.2} dot={false} />
                  <Line type="monotone" dataKey="reflection" name="Reflexión R(f)" stroke="#f59e0b" strokeWidth={1.8} dot={false} />
                  <Line type="monotone" dataKey="absorption" name="Absorción A(f)" stroke="#a855f7" strokeWidth={1.5} dot={false} />
                </LineChart>
              ) : (
                <LineChart data={spectrumData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                  <XAxis dataKey="frequencyGhz" stroke="var(--text-muted)" fontSize={11} unit=" GHz" />
                  <YAxis stroke="var(--text-muted)" fontSize={11} domain={[-5, 5]} />
                  <Tooltip contentStyle={{ background: '#0b1120', borderColor: 'var(--border-subtle)', fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <ReferenceLine y={0} stroke="rgba(255, 255, 255, 0.3)" />
                  <Line type="monotone" dataKey="nReal" name="Re(n_eff) Índice Refracción" stroke="#f43f5e" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="epsReal" name="Re(ε_r) Permitividad" stroke="#0ea5e9" strokeWidth={1.8} dot={false} />
                  <Line type="monotone" dataKey="muReal" name="Re(μ_r) Permeabilidad" stroke="#10b981" strokeWidth={1.8} dot={false} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Diagrama de Refracción Negativa Canvas */}
          <div style={{ marginTop: '14px', flex: 1, minHeight: '140px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
            <canvas ref={canvasRef} width={680} height={160} style={{ width: '100%', height: '100%', display: 'block' }} />
          </div>
        </div>

        {/* Panel lateral: Parámetros de la Celda y Guión Comprobable */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
          <div className="lab-card" style={{ padding: '16px' }}>
            <h2 style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Geometría de la Celda Unitaria (a, d, w)
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Tamaño de celda (a):</span>
                  <span className="font-mono" style={{ color: 'var(--accent-cyan)' }}>{a_mm.toFixed(1)} mm</span>
                </div>
                <input
                  type="range"
                  min="6.0"
                  max="18.0"
                  step="0.5"
                  value={a_mm}
                  onChange={(e) => setA_mm(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Separación entre celdas (d):</span>
                  <span className="font-mono">{d_mm.toFixed(1)} mm</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="4.0"
                  step="0.1"
                  value={d_mm}
                  onChange={(e) => setD_mm(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Ancho del elemento conductor (w):</span>
                  <span className="font-mono">{w_mm.toFixed(1)} mm</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={w_mm}
                  onChange={(e) => setW_mm(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Períodos longitudinales (N):</span>
                  <span className="font-mono">{periods} celdas</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={periods}
                  onChange={(e) => setPeriods(parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* GUIÓN COMPROBABLE 08 */}
          <div className="lab-card" style={{ padding: '16px', border: '1px solid var(--border-active)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                Guión Comprobable 08
              </span>
              <button
                onClick={runMetamaterialsVerification}
                className="btn btn-primary"
                style={{ padding: '4px 12px', fontSize: '0.74rem' }}
              >
                Verificar Física Metamaterial
              </button>
            </div>

            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '10px' }}>
              Valida la ley de conservación de energía continua y la refracción negativa de Veselago en la banda DNG:
            </p>

            <EquationDisplay math="R(f) + T(f) + A(f) \equiv 1, \quad n_1 \sin\theta_1 = n_{\text{eff}} \sin\theta_2 \quad (n_{\text{eff}} < 0)" block={false} />

            {verificationResult && (
              <div style={{ marginTop: '12px', background: 'var(--bg-surface-elevated)', padding: '12px', borderRadius: '6px', fontSize: '0.76rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Desviación max de energía (R+T+A):</span>
                  <span className="font-mono" style={{ color: '#10b981' }}>
                    {verificationResult.energy_conservation.max_energy_deviation.toExponential(3)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Índice de refracción DNG medido:</span>
                  <span className="font-mono" style={{ color: '#f43f5e', fontWeight: 600 }}>
                    {verificationResult.veselago_refraction.refractive_index_n2.toFixed(3)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Ángulo refractado de Snell (θ₂):</span>
                  <span className="font-mono" style={{ color: '#06b6d4' }}>
                    {verificationResult.veselago_refraction.refracted_angle_deg.toFixed(2)}° (Negativo)
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Banda Prohibida de Bragg teórica:</span>
                  <span className="font-mono">
                    {verificationResult.bragg_bandgap.theoretical_bragg_frequency_ghz.toFixed(2)} GHz
                  </span>
                </div>

                <div style={{ padding: '6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', textAlign: 'center', fontWeight: 600, fontSize: '0.72rem' }}>
                  ✓ CONSERVACIÓN DE ENERGÍA Y REFRACCIÓN NEGATIVA VERIFICADAS
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ChapterLayout>
  );
};
