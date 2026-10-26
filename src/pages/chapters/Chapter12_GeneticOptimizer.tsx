import React, { useState, useRef, useEffect } from 'react';
import { ChapterLayout } from '../../components/layout/ChapterLayout';
import { ChapterAssumptions } from '../../components/educational/ChapterAssumptions';
import {
  OptimizerControls,
  OptimizerConfig,
} from '../../components/ch12/OptimizerControls';
import {
  ConvergenceChart,
  ConvergencePoint,
} from '../../components/ch12/ConvergenceChart';
import { PopulationScatterChart } from '../../components/ch12/PopulationScatterChart';
import {
  ComparisonGaVsGridChart,
  ComparisonPoint,
} from '../../components/ch12/ComparisonGaVsGridChart';
import { BestDesignCard, BestDesignData } from '../../components/ch12/BestDesignCard';
import {
  RevalidationModal,
  RevalidationData,
} from '../../components/ch12/RevalidationModal';
import { SpectrumComparisonChart } from '../../components/ch12/SpectrumComparisonChart';
import { getApiUrl, getWsUrl } from '../../utils/apiConfig';

export const Chapter12_GeneticOptimizer: React.FC = () => {
  // Configuración del Algoritmo Genético
  const [config, setConfig] = useState<OptimizerConfig>({
    family: 'square_ring',
    f0_ghz: 10.0,
    pop_size: 14,
    generations: 12,
    seed: 42,
    periods: 3,
    is_pec: true,
    relative_permittivity: 1.0,
    dx_mm: 0.5,
    a_min: 6.0,
    a_max: 16.0,
    d_min: 2.0,
    d_max: 8.0,
    w_min: 0.5,
    w_max: 2.5,
  });

  // Estado de la ejecución
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isGridSearching, setIsGridSearching] = useState<boolean>(false);

  // Progreso en vivo
  const [currentGen, setCurrentGen] = useState<number>(0);
  const [totalEvals, setTotalEvals] = useState<number>(0);
  const [cacheHits, setCacheHits] = useState<number>(0);
  const [cacheHitRate, setCacheHitRate] = useState<number>(0);

  // Datos para visualizaciones
  const [convergenceData, setConvergenceData] = useState<ConvergencePoint[]>([]);
  const [population, setPopulation] = useState<number[][]>([]);
  const [fitnessValues, setFitnessValues] = useState<number[]>([]);
  const [bestDesign, setBestDesign] = useState<BestDesignData | null>(null);

  // Curvas de eficiencia comparativa (GA vs Grid Search)
  const [comparisonData, setComparisonData] = useState<ComparisonPoint[]>([]);
  const [gaFinalFitness, setGaFinalFitness] = useState<number | undefined>(undefined);
  const [gridFinalFitness, setGridFinalFitness] = useState<number | undefined>(undefined);

  // Espectros antes y después de optimizar
  const [freqs, setFreqs] = useState<number[]>([]);
  const [initialSpectrum, setInitialSpectrum] = useState<number[] | null>(null);
  const [optimizedSpectrum, setOptimizedSpectrum] = useState<number[] | null>(null);

  // Re-validación en malla fina
  const [isRevalidating, setIsRevalidating] = useState<boolean>(false);
  const [revalidationData, setRevalidationData] = useState<RevalidationData | null>(null);
  const [showRevalModal, setShowRevalModal] = useState<boolean>(false);

  // Referencia al socket WebSocket
  const socketRef = useRef<WebSocket | null>(null);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  // Iniciar optimización vía WebSocket en tiempo real
  const handleStartGA = () => {
    if (socketRef.current) {
      socketRef.current.close();
    }

    // Resetear contadores y estados
    setCurrentGen(0);
    setTotalEvals(0);
    setCacheHits(0);
    setCacheHitRate(0);
    setConvergenceData([]);
    setComparisonData([]);
    setInitialSpectrum(null);
    setOptimizedSpectrum(null);

    const wsUrl = getWsUrl('/ws/optimizer');
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      setIsRunning(true);
      setIsPaused(false);
      ws.send(
        JSON.stringify({
          action: 'start',
          config: config,
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'generation_update') {
          const d = msg.data;
          setCurrentGen(d.generation);
          setTotalEvals(d.total_evaluations);
          setCacheHits(d.cache_hits);
          setCacheHitRate(d.cache_hit_rate);

          // Actualizar convergencia
          setConvergenceData((prev) => [
            ...prev,
            {
              generation: d.generation,
              bestFitness: d.best_fitness,
              meanFitness: d.mean_fitness,
            },
          ]);

          // Actualizar población actual y mejor diseño
          setPopulation(d.population);
          setFitnessValues(d.fitness_values);
          setBestDesign(d.best_design_point);

          // Actualizar curva de comparación para GA de forma inmutable
          setComparisonData((prev) => {
            const ev = d.total_evaluations;
            const fit = d.best_fitness;
            const existing = prev.find((p) => p.evals === ev);
            if (existing) {
              return prev.map((p) => (p.evals === ev ? { ...p, gaFitness: fit } : { ...p }));
            }
            return [...prev.map((p) => ({ ...p })), { evals: ev, gaFitness: fit }].sort((a, b) => a.evals - b.evals);
          });
          setGaFinalFitness(d.best_fitness);

          // Actualizar espectros
          if (d.generation === 1) {
            // Guardar primer espectro de referencia
            fetch(getApiUrl(`/api/fdtd/spectrum?a_mm=${d.best_individual[0]}&d_mm=${d.best_individual[1]}&w_mm=${d.best_individual[2]}&periods=${config.periods}&family=${config.family}&dx_mm=${config.dx_mm}&f0_ghz=${config.f0_ghz}`))
              .then((res) => res.json())
              .then((spec) => {
                if (spec.frequencies_ghz) {
                  setFreqs(spec.frequencies_ghz);
                  setInitialSpectrum(spec.transmission);
                }
              })
              .catch(() => {});
          }
        } else if (msg.type === 'optimization_completed') {
          setIsRunning(false);
          setIsPaused(false);

          // Traer espectro completo del mejor diseño ganador
          if (msg.data && bestDesign) {
            fetch(getApiUrl(`/api/fdtd/spectrum?a_mm=${bestDesign.a_mm}&d_mm=${bestDesign.d_mm}&w_mm=${bestDesign.w_mm}&periods=${config.periods}&family=${config.family}&dx_mm=${config.dx_mm}&f0_ghz=${config.f0_ghz}`))
              .then((res) => res.json())
              .then((spec) => {
                if (spec.frequencies_ghz) {
                  setFreqs(spec.frequencies_ghz);
                  setOptimizedSpectrum(spec.transmission);
                }
              })
              .catch(() => {});
          }
        } else if (msg.type === 'optimization_stopped') {
          setIsRunning(false);
          setIsPaused(false);
        }
      } catch (err) {
        console.error('Error procesando mensaje de WebSocket GA:', err);
      }
    };

    ws.onerror = (err) => {
      console.error('Error en WebSocket de optimizador:', err);
      setIsRunning(false);
    };

    ws.onclose = () => {
      setIsRunning(false);
      setIsPaused(false);
    };
  };

  const handlePauseGA = () => {
    if (socketRef.current && isRunning) {
      socketRef.current.send(JSON.stringify({ action: 'pause' }));
      setIsPaused(true);
    }
  };

  const handleResumeGA = () => {
    if (socketRef.current && isRunning) {
      socketRef.current.send(JSON.stringify({ action: 'resume' }));
      setIsPaused(false);
    }
  };

  const handleStopGA = () => {
    if (socketRef.current && isRunning) {
      socketRef.current.send(JSON.stringify({ action: 'stop' }));
      setIsRunning(false);
      setIsPaused(false);
    }
  };

  // Ejecutar búsqueda sistemática para comparar contra GA
  const handleRunGridSearch = async () => {
    setIsGridSearching(true);
    try {
      const res = await fetch(getApiUrl('/api/optimizer/grid-search'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          family: config.family,
          max_evaluations: 15,
          stride: 3,
          f0_ghz: config.f0_ghz,
          periods: config.periods,
          is_pec: config.is_pec,
          relative_permittivity: config.relative_permittivity,
          dx_mm: config.dx_mm,
        }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      if (!data) return;

      if (typeof data.best_fitness === 'number' && !isNaN(data.best_fitness)) {
        setGridFinalFitness(data.best_fitness);
      }

      // Fusionar historia de evaluaciones de forma estrictamente inmutable
      if (Array.isArray(data.evaluations_history) && Array.isArray(data.best_fitness_history)) {
        setComparisonData((prev) => {
          const map = new Map<number, ComparisonPoint>();
          prev.forEach((p) => {
            map.set(p.evals, { ...p });
          });
          data.evaluations_history.forEach((ev: number, idx: number) => {
            const fit = data.best_fitness_history[idx];
            const existing = map.get(ev);
            if (existing) {
              map.set(ev, { ...existing, gridFitness: fit });
            } else {
              map.set(ev, { evals: ev, gridFitness: fit });
            }
          });
          return Array.from(map.values()).sort((a, b) => a.evals - b.evals);
        });
      }
    } catch (err: any) {
      console.error('Error al ejecutar Grid Search:', err);
      alert(`Error en Grid Search: ${err.message}`);
    } finally {
      setIsGridSearching(false);
    }
  };

  // Re-validar diseño ganador en malla fina
  const handleRevalidateWinner = async () => {
    if (!bestDesign) return;
    setIsRevalidating(true);
    try {
      const res = await fetch(getApiUrl('/api/optimizer/revalidate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          a_mm: bestDesign.a_mm,
          d_mm: bestDesign.d_mm,
          w_mm: bestDesign.w_mm,
          periods: bestDesign.periods,
          family: bestDesign.family,
          is_pec: bestDesign.is_pec,
          relative_permittivity: bestDesign.relative_permittivity,
          f0_ghz: config.f0_ghz,
          tolerance_db: 2.0,
        }),
      });
      const report: RevalidationData = await res.json();
      setRevalidationData(report);
      setShowRevalModal(true);
    } catch (err) {
      console.error('Error re-validando diseño ganador:', err);
    } finally {
      setIsRevalidating(false);
    }
  };

  return (
    <ChapterLayout
      chapterNumber={12}
      chapterTitle="Optimizador Genético de Metamateriales"
      prevPath="/chapter/11-parametric-lab"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Hipótesis Físicas y Ecuaciones del Optimizador */}
        <ChapterAssumptions
          systemRange="Espacio de búsqueda cuantizado: a ∈ [6, 16] mm, d ∈ [2, 8] mm, w ∈ [0.5, 2.5] mm"
          particleLimit={0}
          minSeparation="Cuantización estricta a múltiplos del paso de malla Δx = 0.5 mm"
          chargeRange="Minimización de F₂ con penalización por violación física (a - d) ≤ 2w"
          additionalDetails={[
            {
              label: 'Función Objetivo Selectiva F₂',
              value: 'F₂(p) = w₁·T(f₀) + w₂·(1 - T_pasa) + w₃·C(p)',
              description: 'Evita la trampa física de la pared metálica sólida que minimiza T(f₀) trivialmente sin resonancia.',
            },
            {
              label: 'Operadores Genéticos',
              value: 'Torneo (k=3), Cruce BLX-α (α=0.5), Mutación Gaussiana con Recocido, Elitismo (2)',
              description: 'Equilibrio estricto entre exploración del espacio y explotación de diseños prometedores.',
            },
            {
              label: 'Criterio de Rigor Físico',
              value: 'Re-validación en malla fina (Δx/2 = 0.25 mm) con |ΔT(f₀)| < 2 dB',
              description: 'Demuestra convergencia de malla e independencia respecto a la discretización numérica.',
            },
          ]}
        />

        {/* Panel de Control Principal */}
        <OptimizerControls
          config={config}
          onChange={setConfig}
          isRunning={isRunning}
          isPaused={isPaused}
          isGridSearching={isGridSearching}
          onStartGA={handleStartGA}
          onPauseGA={handlePauseGA}
          onResumeGA={handleResumeGA}
          onStopGA={handleStopGA}
          onRunGridSearch={handleRunGridSearch}
          currentGen={currentGen}
          maxGen={config.generations}
          totalEvals={totalEvals}
          cacheHits={cacheHits}
          cacheHitRate={cacheHitRate}
        />

        {/* Fila 1: Diseño Campeón y Espectro Antes / Después */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <BestDesignCard
            bestDesign={bestDesign}
            onRevalidate={handleRevalidateWinner}
            isRevalidating={isRevalidating}
          />
          <SpectrumComparisonChart
            freqs={freqs}
            initialT={initialSpectrum}
            optimizedT={optimizedSpectrum}
            f0_ghz={config.f0_ghz}
          />
        </div>

        {/* Fila 2: Curva de Convergencia y Nube de Dispersión */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <ConvergenceChart data={convergenceData} />
          <PopulationScatterChart
            population={population}
            fitnessValues={fitnessValues}
            bestIndividual={bestDesign ? [bestDesign.a_mm, bestDesign.d_mm, bestDesign.w_mm] : null}
            generation={currentGen}
          />
        </div>

        {/* Fila 3: Comparativa GA vs Búsqueda Sistemática */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <ComparisonGaVsGridChart
            data={comparisonData}
            gaFinalFitness={gaFinalFitness}
            gridFinalFitness={gridFinalFitness}
          />

          {/* Tarjeta Educativa de Rigor Matemático */}
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
            }}
          >
            <h4 style={{ margin: 0, fontSize: '1rem', color: '#f8fafc', fontWeight: 600 }}>
              🧠 Fundamento Teórico: Por qué F₂ y no F₁ puro
            </h4>
            <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.5' }}>
              <p style={{ margin: '0 0 8px 0' }}>
                En estructuras metálicas (PEC) bajo modo TM, minimizar únicamente la transmisión central{' '}
                <code style={{ color: '#ef4444' }}>F₁ = T(f₀)</code> conduce a una <strong>trampa física</strong>:
                el optimizador cerrará todos los orificios formando una pared metálica continua, obteniendo{' '}
                <em>T ≈ 0</em> trivialmente en todo el rango sin ninguna resonancia útil.
              </p>
              <p style={{ margin: '0 0 8px 0' }}>
                Para sintetizar un <strong>filtro metamaterial genuino</strong>, la formulación{' '}
                <code style={{ color: '#10b981' }}>F₂ = w₁ T(f₀) + w₂ (1 − T̄_pass) + w₃ C(p)</code> exige
                simultáneamente máxima opacidad en la frecuencia de corte <code style={{ color: '#38bdf8' }}>f₀</code> y
                alta transparencia (<em>T̄_pass ≈ 1</em>) en las bandas adyacentes, forzando la excitación de corrientes
                circulantes de anillo y resonancia plasmónica localizada.
              </p>
              <div
                style={{
                  background: 'rgba(30, 41, 59, 0.6)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  borderLeft: '3px solid #38bdf8',
                  fontSize: '0.78rem',
                  color: '#94a3b8',
                }}
              >
                Caché de genomas en memoria: evita re-simular duplicados producidos por el elitismo y la baja mutación,
                reduciendo el tiempo global de computación hasta en un <strong>60%</strong>.
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Re-validación en Malla Fina */}
        {showRevalModal && (
          <RevalidationModal
            data={revalidationData}
            onClose={() => setShowRevalModal(false)}
          />
        )}
      </div>
    </ChapterLayout>
  );
};
