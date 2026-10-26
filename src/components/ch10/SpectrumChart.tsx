import React, { useState } from 'react';
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

export interface SpectrumDataPoint {
  frequencyGhz: number;
  transmission: number;
  reflection: number;
  absorption: number;
  totalEnergy: number;
  transmissionDb: number;
  airyAnalytical?: number;
  tmmAnalytical?: number;
}

interface SpectrumChartProps {
  data: SpectrumDataPoint[];
  plasmaFreqGhz?: number;
  airyOverlayActive?: boolean;
  tmmOverlayActive?: boolean;
}

export const SpectrumChart: React.FC<SpectrumChartProps> = ({
  data,
  plasmaFreqGhz,
  airyOverlayActive = false,
  tmmOverlayActive = false,
}) => {
  const [scaleMode, setScaleMode] = useState<'linear' | 'db'>('linear');
  const [showReflection, setShowReflection] = useState<boolean>(true);
  const [showAbsorption, setShowAbsorption] = useState<boolean>(false);
  const [showConservation, setShowConservation] = useState<boolean>(true);

  if (!data || data.length === 0) {
    return (
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: '10px',
          padding: '24px',
          height: '320px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          color: 'var(--text-muted)',
          fontSize: '0.82rem',
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>📊</span>
        <span>El espectro se calculará automáticamente al finalizar o estabilizarse la simulación.</span>
        <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
          Calculado por flujo de Poynting en línea: S_x = -(1/2) Re &#123; E_z · H_y* &#125;
        </span>
      </div>
    );
  }

  // Desviación máxima de conservación de energía R+T
  const maxDev = data.reduce((acc, pt) => Math.max(acc, Math.abs(pt.totalEnergy - 1.0)), 0);

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Espectro Electromagnético de Poynting
          </h3>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            T(f) y R(f) calculados de forma independiente sin renormalizaciones forzadas
          </span>
        </div>

        {/* Controles de Escala y Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', background: 'var(--bg-surface-elevated)', borderRadius: '6px', padding: '2px' }}>
            <button
              onClick={() => setScaleMode('linear')}
              style={{
                background: scaleMode === 'linear' ? 'var(--accent-cyan)' : 'transparent',
                color: scaleMode === 'linear' ? '#030712' : 'var(--text-secondary)',
                fontWeight: scaleMode === 'linear' ? 600 : 400,
                border: 'none',
                borderRadius: '4px',
                padding: '3px 8px',
                fontSize: '0.7rem',
                cursor: 'pointer',
              }}
            >
              Lineal [0, 1]
            </button>
            <button
              onClick={() => setScaleMode('db')}
              style={{
                background: scaleMode === 'db' ? 'var(--accent-cyan)' : 'transparent',
                color: scaleMode === 'db' ? '#030712' : 'var(--text-secondary)',
                fontWeight: scaleMode === 'db' ? 600 : 400,
                border: 'none',
                borderRadius: '4px',
                padding: '3px 8px',
                fontSize: '0.7rem',
                cursor: 'pointer',
              }}
            >
              dB [-40, 0]
            </button>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#c084fc', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showReflection}
              onChange={(e) => setShowReflection(e.target.checked)}
            />
            R(f)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#f59e0b', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showAbsorption}
              onChange={(e) => setShowAbsorption(e.target.checked)}
            />
            A(f)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#10b981', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showConservation}
              onChange={(e) => setShowConservation(e.target.checked)}
            />
            R+T
          </label>
        </div>
      </div>

      {/* Gráfico Recharts */}
      <div style={{ width: '100%', height: '260px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis
              dataKey="frequencyGhz"
              stroke="#64748b"
              fontSize={11}
              tickFormatter={(v) => `${v.toFixed(1)} GHz`}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              domain={scaleMode === 'linear' ? [0, 1.05] : [-40, 2]}
              tickFormatter={(v) => (scaleMode === 'linear' ? v.toFixed(2) : `${v} dB`)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0b1120',
                borderColor: 'rgba(148, 163, 184, 0.2)',
                borderRadius: '8px',
                fontSize: '0.74rem',
                color: '#f1f5f9',
              }}
              formatter={(value: any, name: any) => [
                typeof value === 'number' ? (scaleMode === 'db' && name.includes('dB') ? `${value.toFixed(2)} dB` : value.toFixed(4)) : value,
                name,
              ]}
              labelFormatter={(label) => `Frecuencia: ${Number(label).toFixed(2)} GHz`}
            />
            <Legend wrapperStyle={{ fontSize: '0.72rem', paddingTop: '6px' }} />

            {/* Curva de Transmisión */}
            <Line
              type="monotone"
              dataKey={scaleMode === 'linear' ? 'transmission' : 'transmissionDb'}
              name={scaleMode === 'linear' ? 'Transmisión T(f)' : 'Transmisión T [dB]'}
              stroke="#06b6d4"
              strokeWidth={2.2}
              dot={false}
              isAnimationActive={false}
            />

            {/* Curva de Reflexión */}
            {showReflection && scaleMode === 'linear' && (
              <Line
                type="monotone"
                dataKey="reflection"
                name="Reflexión R(f)"
                stroke="#c084fc"
                strokeWidth={1.8}
                dot={false}
                isAnimationActive={false}
              />
            )}

            {/* Curva de Absorción */}
            {showAbsorption && scaleMode === 'linear' && (
              <Line
                type="monotone"
                dataKey="absorption"
                name="Absorción A(f)"
                stroke="#f59e0b"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            )}

            {/* Conservación de Energía R+T */}
            {showConservation && scaleMode === 'linear' && (
              <Line
                type="monotone"
                dataKey="totalEnergy"
                name="Conservación R(f) + T(f)"
                stroke="#10b981"
                strokeWidth={1.4}
                strokeDasharray="4 4"
                dot={false}
                isAnimationActive={false}
              />
            )}

            {/* Superposición analítica de Airy Fabry-Pérot */}
            {airyOverlayActive && (
              <Line
                type="monotone"
                dataKey="airyAnalytical"
                name="Airy Teórico (Exacto)"
                stroke="#e11d48"
                strokeWidth={1.8}
                strokeDasharray="2 2"
                dot={false}
                isAnimationActive={false}
              />
            )}

            {/* Superposición analítica de Matriz TMM */}
            {tmmOverlayActive && (
              <Line
                type="monotone"
                dataKey="tmmAnalytical"
                name="TMM Bragg (Exacto)"
                stroke="#f43f5e"
                strokeWidth={1.8}
                strokeDasharray="3 3"
                dot={false}
                isAnimationActive={false}
              />
            )}

            {/* Línea de corte de frecuencia de plasma Pendry/Belov */}
            {plasmaFreqGhz && (
              <ReferenceLine
                x={plasmaFreqGhz}
                stroke="#f59e0b"
                strokeDasharray="3 3"
                label={{
                  value: `f_p = ${plasmaFreqGhz.toFixed(2)} GHz`,
                  fill: '#f59e0b',
                  fontSize: 10,
                  position: 'top',
                }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Indicador de Auditoría Física */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-surface-elevated)',
          padding: '6px 12px',
          borderRadius: '6px',
          fontSize: '0.72rem',
        }}
      >
        <span style={{ color: 'var(--text-secondary)' }}>
          Auditoría de Conservación: <strong style={{ color: maxDev < 0.035 ? '#10b981' : '#f59e0b', fontFamily: 'var(--font-mono)' }}>max |R + T - 1| = {maxDev.toFixed(4)}</strong>
        </span>
        <span style={{ color: maxDev < 0.035 ? '#10b981' : '#f59e0b' }}>
          {maxDev < 0.035 ? '✔ Conservación Física Estricta' : '⚠ Disipación / Onda evanescente'}
        </span>
      </div>
    </div>
  );
};
