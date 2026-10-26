import React from 'react';

export interface OptimizerConfig {
  family: 'square_ring' | 'rod_array';
  f0_ghz: number;
  pop_size: number;
  generations: number;
  seed: number;
  periods: number;
  is_pec: boolean;
  relative_permittivity: number;
  dx_mm: number;
  a_min: number;
  a_max: number;
  d_min: number;
  d_max: number;
  w_min: number;
  w_max: number;
}

interface OptimizerControlsProps {
  config: OptimizerConfig;
  onChange: (cfg: OptimizerConfig) => void;
  isRunning: boolean;
  isPaused: boolean;
  isGridSearching: boolean;
  onStartGA: () => void;
  onPauseGA: () => void;
  onResumeGA: () => void;
  onStopGA: () => void;
  onRunGridSearch: () => void;
  currentGen: number;
  maxGen: number;
  totalEvals: number;
  cacheHits: number;
  cacheHitRate: number;
}

export const OptimizerControls: React.FC<OptimizerControlsProps> = ({
  config,
  onChange,
  isRunning,
  isPaused,
  isGridSearching,
  onStartGA,
  onPauseGA,
  onResumeGA,
  onStopGA,
  onRunGridSearch,
  currentGen,
  maxGen,
  totalEvals,
  cacheHits,
  cacheHitRate,
}) => {
  const update = <K extends keyof OptimizerConfig>(key: K, val: OptimizerConfig[K]) => {
    onChange({ ...config, [key]: val });
  };

  const progressPercent = maxGen > 0 ? Math.min(100, Math.round((currentGen / maxGen) * 100)) : 0;

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
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#f8fafc', fontWeight: 600 }}>
            Configuración del Optimizador Genético
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Exploración de metamateriales con BLX-α, torneo y mutación adaptativa
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: isRunning
                ? isPaused
                  ? 'rgba(234, 179, 8, 0.2)'
                  : 'rgba(16, 185, 129, 0.2)'
                : isGridSearching
                ? 'rgba(56, 189, 248, 0.2)'
                : 'rgba(100, 116, 139, 0.2)',
              color: isRunning
                ? isPaused
                  ? '#eab308'
                  : '#10b981'
                : isGridSearching
                ? '#38bdf8'
                : '#94a3b8',
              border: '1px solid currentColor',
            }}
          >
            {isRunning ? (isPaused ? '⏸ PAUSADO' : '⚡ EVOLUCIONANDO (WS)') : isGridSearching ? '🔍 GRID SEARCH' : 'LISTO'}
          </span>
        </div>
      </div>

      {/* Selector de Familia y Frecuencia Objetivo */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
            Familia Geométrica
          </label>
          <select
            disabled={isRunning || isGridSearching}
            value={config.family}
            onChange={(e) => update('family', e.target.value as 'square_ring' | 'rod_array')}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f8fafc',
              fontSize: '0.85rem',
            }}
          >
            <option value="square_ring">Anillo Cuadrado Metálico (README)</option>
            <option value="rod_array">Arreglo Periódico de Varillas</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
            Frecuencia Objetivo f₀: <strong style={{ color: '#38bdf8' }}>{config.f0_ghz.toFixed(1)} GHz</strong>
          </label>
          <input
            type="range"
            min={7.0}
            max={14.0}
            step={0.5}
            disabled={isRunning || isGridSearching}
            value={config.f0_ghz}
            onChange={(e) => update('f0_ghz', parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#38bdf8' }}
          />
        </div>
      </div>

      {/* Parámetros del GA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
        <div>
          <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>
            Población (N_pop)
          </label>
          <select
            disabled={isRunning || isGridSearching}
            value={config.pop_size}
            onChange={(e) => update('pop_size', parseInt(e.target.value))}
            style={{
              width: '100%',
              padding: '6px 8px',
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#f8fafc',
              fontSize: '0.8rem',
            }}
          >
            <option value={10}>10 individuos</option>
            <option value={14}>14 individuos</option>
            <option value={18}>18 individuos</option>
            <option value={24}>24 individuos</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>
            Generaciones (G)
          </label>
          <select
            disabled={isRunning || isGridSearching}
            value={config.generations}
            onChange={(e) => update('generations', parseInt(e.target.value))}
            style={{
              width: '100%',
              padding: '6px 8px',
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#f8fafc',
              fontSize: '0.8rem',
            }}
          >
            <option value={8}>8 gens</option>
            <option value={12}>12 gens</option>
            <option value={16}>16 gens</option>
            <option value={22}>22 gens</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>
            Semilla (Seed)
          </label>
          <input
            type="number"
            disabled={isRunning || isGridSearching}
            value={config.seed}
            onChange={(e) => update('seed', parseInt(e.target.value) || 42)}
            style={{
              width: '100%',
              padding: '6px 8px',
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#f8fafc',
              fontSize: '0.8rem',
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>
            Celdas en x
          </label>
          <select
            disabled={isRunning || isGridSearching}
            value={config.periods}
            onChange={(e) => update('periods', parseInt(e.target.value))}
            style={{
              width: '100%',
              padding: '6px 8px',
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#f8fafc',
              fontSize: '0.8rem',
            }}
          >
            <option value={2}>2 celdas</option>
            <option value={3}>3 celdas (estándar)</option>
            <option value={4}>4 celdas</option>
          </select>
        </div>
      </div>

      {/* Rango del Espacio de Búsqueda */}
      <div
        style={{
          background: 'rgba(30, 41, 59, 0.4)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          borderRadius: '8px',
          padding: '10px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.78rem',
          color: '#cbd5e1',
        }}
      >
        <span>
          <strong>Espacio:</strong> a ∈ [{config.a_min}, {config.a_max}] mm &nbsp;|&nbsp; d ∈ [{config.d_min}, {config.d_max}] mm &nbsp;|&nbsp; w ∈ [{config.w_min}, {config.w_max}] mm
        </span>
        <span style={{ color: '#38bdf8' }}>
          Restricción física: (a − d) &gt; 2w
        </span>
      </div>

      {/* Progreso del Algoritmo Genético */}
      {(isRunning || currentGen > 0) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8' }}>
            <span>
              Generación {currentGen} de {maxGen} ({progressPercent}%)
            </span>
            <span>
              Evaluaciones FDTD: <strong style={{ color: '#f8fafc' }}>{totalEvals}</strong> | Caché hits:{' '}
              <strong style={{ color: '#10b981' }}>{cacheHits}</strong> ({cacheHitRate}%)
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: '8px',
              background: '#1e293b',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #38bdf8, #10b981)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      )}

      {/* Botonera de Control */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
        {!isRunning ? (
          <button
            onClick={onStartGA}
            disabled={isGridSearching}
            style={{
              flex: 2,
              padding: '10px 16px',
              background: 'linear-gradient(135deg, #0284c7, #0369a1)',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: isGridSearching ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
            }}
          >
            <span>⚡</span> Iniciar Algoritmo Genético (En Vivo)
          </button>
        ) : (
          <>
            <button
              onClick={isPaused ? onResumeGA : onPauseGA}
              style={{
                flex: 1,
                padding: '10px 16px',
                background: isPaused ? '#10b981' : '#eab308',
                border: 'none',
                borderRadius: '8px',
                color: '#0f172a',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              {isPaused ? '▶ Reanudar' : '⏸ Pausar'}
            </button>
            <button
              onClick={onStopGA}
              style={{
                flex: 1,
                padding: '10px 16px',
                background: '#ef4444',
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              ⏹ Detener
            </button>
          </>
        )}

        <button
          onClick={onRunGridSearch}
          disabled={isRunning || isGridSearching}
          style={{
            flex: 1.2,
            padding: '10px 14px',
            background: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid #475569',
            borderRadius: '8px',
            color: '#e2e8f0',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: isRunning || isGridSearching ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <span>🔍</span> {isGridSearching ? 'Buscando...' : 'Grid Search Referencia'}
        </button>
      </div>
    </div>
  );
};
