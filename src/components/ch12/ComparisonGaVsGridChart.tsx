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

export interface ComparisonPoint {
  evals: number;
  gaFitness?: number;
  gridFitness?: number;
}

interface ComparisonGaVsGridChartProps {
  data: ComparisonPoint[];
  gaFinalFitness?: number;
  gridFinalFitness?: number;
}

export const ComparisonGaVsGridChart: React.FC<ComparisonGaVsGridChartProps> = ({
  data,
  gaFinalFitness,
  gridFinalFitness,
}) => {
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
            Eficiencia Computacional: Algoritmo Genético vs Búsqueda Exhaustiva
          </h4>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Mejor F₂ frente al número de simulaciones FDTD evaluadas
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span
            style={{
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)',
            }}
          >
            GA: &le; 40% Evaluaciones
          </span>
        </div>
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
              padding: '16px',
              textAlign: 'center',
            }}
          >
            Ejecuta el Algoritmo Genético y la Búsqueda Exhaustiva para contrastar la velocidad de convergencia
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="evals"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                label={{ value: 'Evaluaciones FDTD', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 11 }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                label={{ value: 'Mejor F₂', angle: -90, position: 'insideLeft', offset: 15, fill: '#64748b', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                }}
                formatter={(val: any) => [Number(val).toFixed(4), '']}
              />
              <Legend
                verticalAlign="top"
                height={30}
                wrapperStyle={{ fontSize: '0.8rem', paddingBottom: '8px' }}
              />
              <Line
                type="stepAfter"
                dataKey="gaFitness"
                name="Algoritmo Genético (BLX-α)"
                stroke="#38bdf8"
                strokeWidth={2.5}
                dot={{ r: 2 }}
                isAnimationActive={false}
              />
              <Line
                type="stepAfter"
                dataKey="gridFitness"
                name="Búsqueda Sistemática (Grid Search)"
                stroke="#a855f7"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 2 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div
        style={{
          background: 'rgba(30, 41, 59, 0.4)',
          borderRadius: '6px',
          padding: '8px 12px',
          fontSize: '0.75rem',
          color: '#cbd5e1',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>
          GA Mejor: <strong style={{ color: '#38bdf8' }}>{gaFinalFitness ? gaFinalFitness.toFixed(4) : '--'}</strong>
        </span>
        <span>
          Grid Search Mejor: <strong style={{ color: '#a855f7' }}>{gridFinalFitness ? gridFinalFitness.toFixed(4) : '--'}</strong>
        </span>
      </div>
    </div>
  );
};
