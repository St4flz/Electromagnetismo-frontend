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
  ReferenceArea,
  ReferenceLine,
} from 'recharts';

interface FamilyCurvesChartProps {
  frequenciesGhz: number[];
  familyCurvesT: Record<string, number[]>;
  f0Ghz?: number;
  paramName?: string;
}

const PALETTE = [
  '#06b6d4', // cyan
  '#38bdf8', // light blue
  '#818cf8', // indigo
  '#c084fc', // purple
  '#f43f5e', // rose
  '#f59e0b', // amber
  '#10b981', // emerald
  '#14b8a6', // teal
];

export const FamilyCurvesChart: React.FC<FamilyCurvesChartProps> = ({
  frequenciesGhz,
  familyCurvesT,
  f0Ghz = 10.0,
  paramName = 'w',
}) => {
  const [scaleMode, setScaleMode] = useState<'linear' | 'db'>('linear');

  const curveKeys = Object.keys(familyCurvesT);
  if (!frequenciesGhz || frequenciesGhz.length === 0 || curveKeys.length === 0) {
    return (
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: '10px',
          padding: '24px',
          height: '340px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          color: 'var(--text-muted)',
          fontSize: '0.82rem',
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>📈</span>
        <span>Ejecute un barrido 1D para visualizar la familia de curvas T(f).</span>
        <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
          Permite observar el desplazamiento de la frecuencia de resonancia y la profundidad del notch.
        </span>
      </div>
    );
  }

  // Combinar frecuencias y curvas en formato plano para Recharts
  const chartData = frequenciesGhz.map((f, idx) => {
    const row: Record<string, any> = { frequencyGhz: f };
    curveKeys.forEach((key) => {
      const t = familyCurvesT[key]?.[idx] ?? 0;
      row[key] = scaleMode === 'linear' ? t : (t > 0 ? 10 * Math.log10(Math.max(t, 1e-4)) : -40);
    });
    return row;
  });

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
            Familia de Curvas Espectrales T(f; {paramName})
          </h3>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            Evolución de la selectividad de banda al variar paramétricamente la celda
          </span>
        </div>

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
      </div>

      <div style={{ width: '100%', height: '280px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
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
                typeof value === 'number' ? (scaleMode === 'db' ? `${value.toFixed(2)} dB` : value.toFixed(4)) : value,
                name,
              ]}
              labelFormatter={(label) => `Frecuencia: ${Number(label).toFixed(2)} GHz`}
            />
            <Legend wrapperStyle={{ fontSize: '0.72rem', paddingTop: '6px' }} />

            {/* Ventana de rechazo de diseño [f0 - 0.5, f0 + 0.5] */}
            <ReferenceArea
              x1={f0Ghz - 0.5}
              x2={f0Ghz + 0.5}
              fill="rgba(239, 68, 68, 0.08)"
              stroke="rgba(239, 68, 68, 0.2)"
              strokeDasharray="2 2"
            />
            <ReferenceLine
              x={f0Ghz}
              stroke="#ef4444"
              strokeDasharray="3 3"
              label={{ value: `f₀=${f0Ghz} GHz`, fill: '#ef4444', fontSize: 10, position: 'top' }}
            />

            {/* Líneas de cada diseño de la familia */}
            {curveKeys.map((key, idx) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={key}
                stroke={PALETTE[idx % PALETTE.length]}
                strokeWidth={1.8}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
