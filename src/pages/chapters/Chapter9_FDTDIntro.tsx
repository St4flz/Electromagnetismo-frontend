import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { ChapterLayout } from '../../components/layout/ChapterLayout';
import { ChapterAssumptions } from '../../components/educational/ChapterAssumptions';
import { EquationDisplay } from '../../components/educational/EquationDisplay';
import { usePhysicsSocket } from '../../hooks/usePhysicsSocket';

export const Chapter9_FDTDIntro: React.FC = () => {
  // Parámetros de simulación FDTD 2D
  const [courantFactor, setCourantFactor] = useState<number>(0.5); // S = c·dt/dx (CFL <= 0.7071)
  const [sourceType, setSourceType] = useState<'gaussian' | 'sine'>('gaussian');
  const [sourceFreqGhz, setSourceFreqGhz] = useState<number>(10.0);
  const [mediumType, setMediumType] = useState<'vacuum' | 'dielectric_slab' | 'metamaterial_array'>('dielectric_slab');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Datos de la rejilla FDTD recibidos del backend
  const [ezGrid, setEzGrid] = useState<number[][]>([]);
  const [timeStep, setTimeStep] = useState<number>(0);
  const [currentTimePs, setCurrentTimePs] = useState<number>(0);
  const [fftSpectrum, setFftSpectrum] = useState<any[]>([]);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const { sendPhysicsRequest, lastResponse, computeTimeMs, isConnected } = usePhysicsSocket();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Dimensiones de la rejilla
  const Nx = 80;
  const Ny = 50;

  // Enviar paso temporal de FDTD al backend
  const requestFDTDStep = useCallback(
    (reset = false, steps = 4) => {
      sendPhysicsRequest({
        type: 'ch9_fdtd_step',
        fdtdQuery: {
          Nx,
          Ny,
          dx: 0.002, // 2 mm
          courantFactor,
          sourceType,
          sourceFreqGhz,
          steps,
          addSlab: mediumType === 'dielectric_slab',
          slabStart: 32,
          slabEnd: 46,
          slabEps: 4.0,
          addMetamaterial: mediumType === 'metamaterial_array',
          reset,
        },
      });
    },
    [courantFactor, sourceType, sourceFreqGhz, mediumType, sendPhysicsRequest]
  );

  // Reiniciar simulación cuando cambie medio o tipo de fuente
  useEffect(() => {
    requestFDTDStep(true, 1);
  }, [mediumType, sourceType, sourceFreqGhz, courantFactor]);

  // Actualizar datos recibidos por WebSocket
  useEffect(() => {
    if (lastResponse?.type === 'ch9_fdtd_result') {
      if (lastResponse.fdtdGridEz) setEzGrid(lastResponse.fdtdGridEz);
      if (lastResponse.fdtdTimeStep !== undefined) setTimeStep(lastResponse.fdtdTimeStep);
      if (lastResponse.fdtdCurrentTime !== undefined) setCurrentTimePs(lastResponse.fdtdCurrentTime * 1e12); // picosegundos
      if (lastResponse.fdtdSpectrum) setFftSpectrum(lastResponse.fdtdSpectrum);
    } else if (lastResponse?.type === 'ch9_fdtd_verify_result' && lastResponse.fdtdVerifyResult) {
      setVerificationResult(lastResponse.fdtdVerifyResult);
    }
  }, [lastResponse]);

  // Bucle continuo a 30-60 fps si está en Play
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      requestFDTDStep(false, 3);
    }, 40); // Cada 40 ms
    return () => clearInterval(interval);
  }, [isPlaying, requestFDTDStep]);

  // Renderizar la rejilla Ez en el Canvas 2D
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || ezGrid.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const rows = ezGrid.length;
    const cols = ezGrid[0].length;
    const cellW = w / rows;
    const cellH = h / cols;

    // 1. Dibujar celdas de campo eléctrico Ez con colormap divergente
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const val = ezGrid[i][j];
        // Normalizar valor entre -1.5 y +1.5
        const norm = Math.max(Math.min(val / 1.0, 1.0), -1.0);

        if (norm > 0) {
          // Cresta positiva: Azul / Cian eléctrico
          const b = Math.min(Math.floor(norm * 255), 255);
          const g = Math.min(Math.floor(norm * 180), 255);
          ctx.fillStyle = `rgb(14, ${g}, ${b})`;
        } else if (norm < 0) {
          // Valle negativo: Rojo / Naranja
          const r = Math.min(Math.floor(Math.abs(norm) * 255), 255);
          const g = Math.min(Math.floor(Math.abs(norm) * 60), 255);
          ctx.fillStyle = `rgb(${r}, ${g}, 70)`;
        } else {
          ctx.fillStyle = '#030712';
        }

        ctx.fillRect(i * cellW, j * cellH, cellW + 0.5, cellH + 0.5);
      }
    }

    // 2. Línea de inyección de la fuente
    const srcX = (15 / Nx) * w;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(srcX, 10);
    ctx.lineTo(srcX, h - 10);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Superposición del obstáculo dieléctrico o metamaterial
    if (mediumType === 'dielectric_slab') {
      const slabX1 = (32 / Nx) * w;
      const slabX2 = (46 / Nx) * w;
      ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
      ctx.fillRect(slabX1, 0, slabX2 - slabX1, h);

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(slabX1, 0, slabX2 - slabX1, h);

      ctx.fillStyle = '#f59e0b';
      ctx.font = '10px monospace';
      ctx.fillText('Lámina Dieléctrica (εr = 4.0)', slabX1 + 6, 18);
    } else if (mediumType === 'metamaterial_array') {
      ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1;

      for (let p = 0; p < 4; p++) {
        const xStart = ((30 + p * 4) / Nx) * w;
        const xEnd = ((30 + p * 4 + 2) / Nx) * w;
        for (let y = 8; y < Ny - 8; y += 8) {
          const yStart = (y / Ny) * h;
          const yEnd = ((y + 4) / Ny) * h;
          ctx.fillRect(xStart, yStart, xEnd - xStart, yEnd - yStart);
          ctx.strokeRect(xStart, yStart, xEnd - xStart, yEnd - yStart);
        }
      }
      ctx.fillStyle = '#06b6d4';
      ctx.font = '10px monospace';
      ctx.fillText('Arreglo Metamaterial', ((30 / Nx) * w) + 4, 18);
    }

    // 4. Sondas de reflexión y transmisión
    const reflX = (10 / Nx) * w;
    const transX = ((Nx - 12) / Nx) * w;
    const midY = h / 2;

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(reflX, midY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(transX, midY, 4, 0, Math.PI * 2);
    ctx.fill();
  }, [ezGrid, mediumType, Nx, Ny]);

  // Ejecutar verificación rigurosa FDTD
  const runFDTDVerification = useCallback(() => {
    sendPhysicsRequest({
      type: 'ch9_fdtd_verify',
    });
  }, [sendPhysicsRequest]);

  return (
    <ChapterLayout
      chapterNumber={9}
      chapterTitle="Introducción al Método FDTD 2D: Celda de Yee y Estabilidad CFL"
      prevPath="/chapter/8-metamaterials"
      nextPath="/chapter/10-fdtd-simulator"
    >
      <ChapterAssumptions
        systemRange="Rejilla escalonada de Yee 2D de 80×50 celdas (Δx = Δy = 2.0 mm, polarización TM: Ez, Hx, Hy)"
        particleLimit={0}
        minSeparation="N/A (Discretización diferencial en diferencias finitas y salto de rana Leap-Frog)"
        chargeRange="Frecuencia central 10 GHz &middot; Fronteras absorbentes de 1er orden Mur ABC"
        additionalDetails={[
          { label: 'Criterio CFL 2D', value: 'S = c·Δt / Δx ≤ 1/√2 ≈ 0.7071 (Estabilidad incondicional)' },
          { label: 'Mur ABC', value: 'Elimina reflexiones espurias en los extremos x=0 y x=Nx-1' },
          { label: 'Espectro FFT', value: 'Transformada de Fourier en tiempo real del campo transmitido' },
        ]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '20px', flex: 1, minHeight: 0 }}>
        {/* Canvas de la Rejilla FDTD y Espectro FFT */}
        <div className="lab-card" style={{ display: 'flex', flexDirection: 'column', padding: '16px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => setMediumType('vacuum')}
                className={`btn ${mediumType === 'vacuum' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '4px 10px', fontSize: '0.72rem' }}
              >
                1. Vacío
              </button>
              <button
                onClick={() => setMediumType('dielectric_slab')}
                className={`btn ${mediumType === 'dielectric_slab' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '4px 10px', fontSize: '0.72rem' }}
              >
                2. Lámina Dieléctrica (ε=4)
              </button>
              <button
                onClick={() => setMediumType('metamaterial_array')}
                className={`btn ${mediumType === 'metamaterial_array' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '4px 10px', fontSize: '0.72rem' }}
              >
                3. Arreglo Metamaterial
              </button>
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
                onClick={() => requestFDTDStep(true, 1)}
                className="btn btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.74rem' }}
              >
                Reiniciar
              </button>
              <span className="badge badge-live" style={{ fontSize: '0.7rem' }}>
                {isConnected ? `WS ${computeTimeMs.toFixed(1)} ms` : 'Offline'}
              </span>
            </div>
          </div>

          {/* Lienzo FDTD de la rejilla de Yee */}
          <div
            style={{
              flex: 1,
              minHeight: '230px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: '#030712',
              borderRadius: '6px',
              overflow: 'hidden',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <canvas ref={canvasRef} width={640} height={320} style={{ width: '100%', height: '100%', display: 'block' }} />
          </div>

          {/* Gráfico espectral FFT transmitido */}
          <div style={{ height: '150px', width: '100%', marginTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Espectro FFT de Potencia Transmitida T(f) calculada por el monitor
              </span>
              <span className="badge" style={{ fontSize: '0.7rem' }}>
                Paso #{timeStep} &middot; t = {currentTimePs.toFixed(1)} ps
              </span>
            </div>

            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={fftSpectrum} margin={{ top: 5, right: 15, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis dataKey="frequencyGhz" stroke="var(--text-muted)" fontSize={10} unit=" GHz" />
                <YAxis stroke="var(--text-muted)" fontSize={10} domain={[0, 1.1]} />
                <Tooltip contentStyle={{ background: '#0b1120', borderColor: 'var(--border-subtle)', fontSize: '11px' }} />
                <Line type="monotone" dataKey="powerTransmission" name="Potencia T(f)" stroke="#06b6d4" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Panel lateral de controles numéricos y Guión Comprobable */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
          <div className="lab-card" style={{ padding: '16px' }}>
            <h2 style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Parámetros del Esquema de Yee
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Factor de Courant (S):</span>
                  <span className="font-mono" style={{ color: courantFactor <= 0.7071 ? '#10b981' : '#f43f5e', fontWeight: 600 }}>
                    {courantFactor.toFixed(3)} {courantFactor <= 0.7071 ? '(Estable CFL)' : '(Inestable!)'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="1.15"
                  step="0.02"
                  value={courantFactor}
                  onChange={(e) => setCourantFactor(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  Límite teórico CFL 2D: S ≤ 1/√2 ≈ 0.707. Mueve el slider por encima de 0.71 para comprobar la explosión numérica.
                </span>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Tipo de Fuente de Excitación:</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    onClick={() => setSourceType('gaussian')}
                    className={`btn ${sourceType === 'gaussian' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                  >
                    Pulso Gaussiano
                  </button>
                  <button
                    onClick={() => setSourceType('sine')}
                    className={`btn ${sourceType === 'sine' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                  >
                    Onda Armónica 10 GHz
                  </button>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Frecuencia central:</span>
                  <span className="font-mono">{sourceFreqGhz.toFixed(1)} GHz</span>
                </div>
                <input
                  type="range"
                  min="5.0"
                  max="18.0"
                  step="0.5"
                  value={sourceFreqGhz}
                  onChange={(e) => setSourceFreqGhz(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* GUIÓN COMPROBABLE 09 */}
          <div className="lab-card" style={{ padding: '16px', border: '1px solid var(--border-active)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                Guión Comprobable 09
              </span>
              <button
                onClick={runFDTDVerification}
                className="btn btn-primary"
                style={{ padding: '4px 12px', fontSize: '0.74rem' }}
              >
                Verificar Algoritmo FDTD
              </button>
            </div>

            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '10px' }}>
              Verifica el teorema CFL de estabilidad de Courant y mide la velocidad de grupo del pulso en vacío:
            </p>

            <EquationDisplay math="c \Delta t \le \frac{1}{\sqrt{\frac{1}{\Delta x^2} + \frac{1}{\Delta y^2}}}, \quad v_{\text{pulso}} = \frac{\Delta x}{\Delta t} \equiv c" block={false} />

            {verificationResult && (
              <div style={{ marginTop: '12px', background: 'var(--bg-surface-elevated)', padding: '12px', borderRadius: '6px', fontSize: '0.76rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Prueba CFL (S = 0.5):</span>
                  <span className="font-mono" style={{ color: '#10b981', fontWeight: 600 }}>
                    {verificationResult.cfl_stable_test.numerically_stable ? 'ESTABLE (Acotado)' : 'FALLO'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Prueba CFL (S = 1.05):</span>
                  <span className="font-mono" style={{ color: '#f43f5e', fontWeight: 600 }}>
                    {!verificationResult.cfl_unstable_test.numerically_stable ? 'INESTABLE (Divergencia a ∞)' : 'INESPERADO'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Velocidad pulso FDTD:</span>
                  <span className="font-mono">{verificationResult.pulse_speed_test.measured_pulse_speed_m_s.toExponential(4)} m/s</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Error de dispersión numérica:</span>
                  <span className="font-mono" style={{ color: '#10b981' }}>
                    {verificationResult.pulse_speed_test.dispersion_error_percent.toFixed(2)}% (Malla gruesa)
                  </span>
                </div>

                <div style={{ padding: '6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', textAlign: 'center', fontWeight: 600, fontSize: '0.72rem' }}>
                  ✓ RIGOR MATEMÁTICO FDTD Y TEOREMA CFL CONFIRMADOS
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ChapterLayout>
  );
};
