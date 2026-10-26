import React from 'react';
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

export interface ConvergencePoint {
  generation: number;
  bestFitness: number;
  meanFitness: number;
}

interface ConvergenceChartProps {
  data: ConvergencePoint[];
}

export const ConvergenceChart: React.FC<ConvergenceChartProps> = ({ data }) => {
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
            Curva de Convergencia del Algoritmo Genético
          </h4>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Minimización de F₂ = w₁ T(f₀) + w₂ (1 − T̄_pass) + w₃ C(p)
          </span>
        </div>
        {data.length > 0 && (
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Mejor F₂ Actual</span>
            <strong style={{ fontSize: '1.1rem', color: '#38bdf8' }}>
              {data[data.length - 1].bestFitness.toFixed(4)}
            </strong>
          </div>
        )}
      </div>

      <div style={{ flex: 1, minHeight: '260px', width: '100%' }}>
        {data.length === 0 ? (
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
            Inicia el Algoritmo Genético para observar la evolución generacional
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="generation"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                label={{ value: 'Generación (g)', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 11 }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                domain={['auto', 'auto']}
                label={{ value: 'Función Objetivo F₂', angle: -90, position: 'insideLeft', offset: 15, fill: '#64748b', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                }}
                formatter={(val: any) => [Number(val).toFixed(4), '']}
              />
              <Legend
                verticalAlign="top"
                height={30}
                wrapperStyle={{ fontSize: '0.8rem', paddingBottom: '8px' }}
              />
              <Line
                type="monotone"
                dataKey="bestFitness"
                name="Mejor Individuo (Elitismo)"
                stroke="#38bdf8"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#38bdf8' }}
                activeDot={{ r: 6 }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="meanFitness"
                name="Promedio Poblacional"
                stroke="#f59e0b"
                strokeWidth={1.8}
                strokeDasharray="4 4"
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
