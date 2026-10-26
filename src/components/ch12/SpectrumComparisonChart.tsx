import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface SpectrumComparisonChartProps {
  freqs: number[];
  initialT: number[] | null;
  optimizedT: number[] | null;
  f0_ghz: number;
}

export const SpectrumComparisonChart: React.FC<SpectrumComparisonChartProps> = ({
  freqs,
  initialT,
  optimizedT,
  f0_ghz,
}) => {
  const [useLogScale, setUseLogScale] = useState(false);

  const chartData = freqs.map((f, i) => {
    const tInit = initialT ? initialT[i] : undefined;
    const tOpt = optimizedT ? optimizedT[i] : undefined;

    const toDb = (val?: number) => {
      if (val === undefined) return undefined;
      const clamped = Math.max(val, 1e-5);
      return Math.max(-50, 10 * Math.log10(clamped));
    };

    return {
      freq: f,
      t_initial: useLogScale ? toDb(tInit) : tInit,
      t_optimized: useLogScale ? toDb(tOpt) : tOpt,
    };
  });

  return (
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.85)',
        border: '1px solid rgba(148, 163, 184, 0.15)',
        borderRadius: '12px',
        padding: '20px',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        height: '100%',
        minHeight: '360px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '1rem', color: '#f8fafc', fontWeight: 600 }}>
            Espectro de Transmisión: Inicial vs Optimizado
          </h4>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Aparición del notch de resonancia y selectividad en {f0_ghz.toFixed(1)} GHz
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setUseLogScale(false)}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: !useLogScale ? '#0284c7' : '#1e293b',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
            }}
          >
            Lineal
          </button>
          <button
            onClick={() => setUseLogScale(true)}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: useLogScale ? '#0284c7' : '#1e293b',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
            }}
          >
            Logarítmico (dB)
          </button>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: '260px', width: '100%' }}>
        {!optimizedT ? (
          <div
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              fontSize: '0.85rem',
              border: '1px dashed #334155',
              borderRadius: '8px',
            }}
          >
            El espectro comparativo se trazará conforme se obtenga el mejor diseño
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="freq"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                label={{ value: 'Frecuencia (GHz)', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 11 }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                domain={useLogScale ? [-45, 0] : [0, 1.05]}
                label={{
                  value: useLogScale ? 'Transmisión T (dB)' : 'Transmisión T(f)',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 15,
                  fill: '#64748b',
                  fontSize: 11,
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                }}
                formatter={(val: any) => [Number(val).toFixed(2) + (useLogScale ? ' dB' : ''), '']}
              />
              <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: '0.8rem' }} />
              {initialT && (
                <Line
                  type="monotone"
                  dataKey="t_initial"
                  name="Diseño Inicial (Gen 1)"
                  stroke="#94a3b8"
                  strokeWidth={1.8}
                  strokeDasharray="3 3"
                  dot={false}
                />
              )}
              <Line
                type="monotone"
                dataKey="t_optimized"
                name="Diseño Optimizado (Final)"
                stroke="#38bdf8"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
