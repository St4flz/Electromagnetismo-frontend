import React from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface ScatterIndividual {
  a: number;
  d: number;
  w: number;
  fitness: number;
  isBest?: boolean;
}

interface PopulationScatterChartProps {
  population: number[][]; // [ [a, d, w], ... ]
  fitnessValues: number[];
  bestIndividual: number[] | null;
  generation: number;
}

export const PopulationScatterChart: React.FC<PopulationScatterChartProps> = ({
  population,
  fitnessValues,
  bestIndividual,
  generation,
}) => {
  const data: ScatterIndividual[] = population.map((ind, idx) => ({
    a: ind[0],
    d: ind[1],
    w: ind[2],
    fitness: fitnessValues[idx] || 1.0,
    isBest: Boolean(
      bestIndividual &&
      Math.abs(ind[0] - bestIndividual[0]) < 1e-3 &&
      Math.abs(ind[2] - bestIndividual[2]) < 1e-3
    ),
  }));

  const regularPop = data.filter((p) => !p.isBest);
  const bestPop = data.filter((p) => p.isBest);

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
            Dispersión Paramétrica de la Población (a vs w)
          </h4>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Gen {generation}: Agrupamiento y deriva genética en el espacio de búsqueda
          </span>
        </div>
        <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#38bdf8' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }} /> Población
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} /> Campeón
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
            }}
          >
            La dispersión espacial de los individuos aparecerá al ejecutar el GA
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                type="number"
                dataKey="a"
                name="Periodo a"
                unit=" mm"
                domain={[5, 17]}
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                label={{ value: 'Periodo a (mm)', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 11 }}
              />
              <YAxis
                type="number"
                dataKey="w"
                name="Grosor w"
                unit=" mm"
                domain={[0.2, 3.0]}
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                label={{ value: 'Grosor w (mm)', angle: -90, position: 'insideLeft', offset: 15, fill: '#64748b', fontSize: 11 }}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                }}
                formatter={(val: any, name?: any) => [
                  typeof val === 'number' ? val.toFixed(2) : val,
                  name === 'a' ? 'Periodo a' : name === 'w' ? 'Grosor w' : name,
                ]}
              />
              <Scatter name="Población" data={regularPop} fill="#38bdf8" fillOpacity={0.6} />
              <Scatter name="Mejor Individuo" data={bestPop} fill="#10b981" shape="cross" />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
