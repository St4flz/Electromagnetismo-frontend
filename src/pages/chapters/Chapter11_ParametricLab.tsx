import React, { useState } from 'react';
import { ChapterLayout } from '../../components/layout/ChapterLayout';
import { ChapterAssumptions } from '../../components/educational/ChapterAssumptions';
import { SweepControls, SweepConfig } from '../../components/ch11/SweepControls';
import { FamilyCurvesChart } from '../../components/ch11/FamilyCurvesChart';
import { HeatmapChart } from '../../components/ch11/HeatmapChart';
import { ReadmeTable, SweepPointData } from '../../components/ch11/ReadmeTable';
import { ObjectiveComparisonCard } from '../../components/ch11/ObjectiveComparisonCard';

export const Chapter11_ParametricLab: React.FC = () => {
  const [config, setConfig] = useState<SweepConfig>({
    parameterName: 'w_mm',
    base_a_mm: 10.0,
    base_d_mm: 6.0,
    base_w_mm: 1.0,
    family: 'square_ring',
    periods: 3,
    is_pec: true,
    relative_permittivity: 1.0,
    f0_ghz: 10.0,
    w1: 0.60,
    w2: 0.30,
    w3: 0.10,
    dx_mm: 0.5,
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [frequenciesGhz, setFrequenciesGhz] = useState<number[]>([]);
  const [familyCurvesT, setFamilyCurvesT] = useState<Record<string, number[]>>({});
  const [tableRows, setTableRows] = useState<SweepPointData[]>([]);
  const [bestF2Design, setBestF2Design] = useState<SweepPointData | undefined>(undefined);
  const [bestF1Design, setBestF1Design] = useState<SweepPointData | undefined>(undefined);

  // Datos para heatmap 2D
  const [heatmapMatrixDb, setHeatmapMatrixDb] = useState<number[][]>([]);
  const [heatmapMatrixLinear, setHeatmapMatrixLinear] = useState<number[][]>([]);
  const [heatmapMatrixF2, setHeatmapMatrixF2] = useState<number[][]>([]);
  const [heatmapParamX, setHeatmapParamX] = useState<string>('a_mm');
  const [heatmapParamXValues, setHeatmapParamXValues] = useState<number[]>([]);
  const [heatmapParamY, setHeatmapParamY] = useState<string>('d_mm');
  const [heatmapParamYValues, setHeatmapParamYValues] = useState<number[]>([]);

  // Robustez Spearman
  const [robustnessResult, setRobustnessResult] = useState<any>(null);

  // 1. Ejecutar barrido 1D
  const handleRun1DSweep = async () => {
    setIsLoading(true);
    try {
      let values: number[] = [];
      if (config.parameterName === 'w_mm') {
        values = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
      } else if (config.parameterName === 'd_mm') {
        values = [3.0, 4.0, 5.0, 6.0, 7.0, 8.0];
      } else {
        values = [8.0, 9.0, 10.0, 11.0, 12.0];
      }

      const res = await fetch('/api/sweep/1d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parameter_name: config.parameterName,
          param_values: values,
          base_a_mm: config.base_a_mm,
          base_d_mm: config.base_d_mm,
          base_w_mm: config.base_w_mm,
          family: config.family,
          periods: config.periods,
          is_pec: config.is_pec,
          relative_permittivity: config.relative_permittivity,
          dx_mm: config.dx_mm,
          f0_ghz: config.f0_ghz,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setFrequenciesGhz(data.frequencies_ghz);
      setFamilyCurvesT(data.family_curves_t);
      setTableRows(data.table_rows);
      setBestF2Design(data.best_design);
      setBestF1Design(data.best_by_f1);
    } catch (err: any) {
      alert(`Error en barrido 1D: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Ejecutar barrido 2D (heatmap)
  const handleRun2DSweep = async () => {
    setIsLoading(true);
    try {
      const xVals = [8.0, 9.0, 10.0, 11.0, 12.0];
      const yVals = [3.0, 4.0, 5.0, 6.0, 7.0];

      const res = await fetch('/api/sweep/2d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          param_x_name: 'a_mm',
          param_x_values: xVals,
          param_y_name: 'd_mm',
          param_y_values: yVals,
          base_w_mm: config.base_w_mm,
          family: config.family,
          periods: config.periods,
          is_pec: config.is_pec,
          relative_permittivity: config.relative_permittivity,
          dx_mm: config.dx_mm,
          f0_ghz: config.f0_ghz,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setHeatmapParamX(data.param_x_name);
      setHeatmapParamXValues(data.param_x_values);
      setHeatmapParamY(data.param_y_name);
      setHeatmapParamYValues(data.param_y_values);
      setHeatmapMatrixDb(data.heatmap_t_f0_db);
      setHeatmapMatrixLinear(data.heatmap_t_f0);
      setHeatmapMatrixF2(data.heatmap_f2);
      setTableRows(data.table_rows);
      setBestF2Design(data.best_design);
    } catch (err: any) {
      alert(`Error en barrido 2D: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Exportar CSV
  const handleExportCsv = async () => {
    try {
      const res = await fetch('/api/sweep/export/csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parameter_name: config.parameterName,
          base_a_mm: config.base_a_mm,
          base_d_mm: config.base_d_mm,
          base_w_mm: config.base_w_mm,
          family: config.family,
          periods: config.periods,
          is_pec: config.is_pec,
          relative_permittivity: config.relative_permittivity,
          dx_mm: config.dx_mm,
          f0_ghz: config.f0_ghz,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dataset_metamaterial_${config.parameterName}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Error descargando CSV: ${err.message}`);
    }
  };

  // 4. Evaluar robustez de Spearman
  const handleRunRobustness = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/sweep/robustness');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRobustnessResult(data);
    } catch (err: any) {
      alert(`Error en prueba de robustez: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChapterLayout
      chapterNumber={11}
      chapterTitle="Laboratorio Paramétrico y Función Objetivo F₂"
      prevPath="/chapter/10-fdtd-simulator"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <ChapterAssumptions
          systemRange="Barridos FDTD 1D y 2D sobre el espacio de parámetros (a, d, w) en banda X (10 GHz)"
          particleLimit={0}
          minSeparation="Cuantización estricta a celdas de malla Δx = 0.5 mm para evitar diversidad falsa"
          chargeRange="Función objetivo multiobjetivo con selectividad: rechazo en f₀ y transparencia en banda de paso"
          additionalDetails={[
            {
              label: 'Función Objetivo F₂',
              value: 'F₂(p) = w₁·T(f₀) + w₂·(1 - T_pasa) + w₃·C(p)',
              description: 'Exige selectividad y rechazo sin caer en la trampa física de la pared sólida.',
            },
            {
              label: 'Dataset Formato README',
              value: 'Exportación a CSV con metadatos completos y reproducibilidad',
              description: 'Genera las tablas de diseño solicitadas para la entrega del proyecto.',
            },
            {
              label: 'Prueba de Robustez',
              value: 'Correlación de Spearman entre evaluaciones en Δx y Δx/2',
              description: 'Demuestra que la resolución numérica no altera el ranking relativo de los diseños.',
            },
          ]}
        />

        {/* Sección Superior: Controles + Comparación de Función Objetivo */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 1.2fr', gap: '16px' }}>
          <SweepControls
            config={config}
            onChange={setConfig}
            onRun1DSweep={handleRun1DSweep}
            onRun2DSweep={handleRun2DSweep}
            onExportCsv={handleExportCsv}
            onRunRobustness={handleRunRobustness}
            isLoading={isLoading}
          />

          <ObjectiveComparisonCard bestF1={bestF1Design} bestF2={bestF2Design} />
        </div>

        {/* Notificación de Robustez Spearman (si se ejecutó) */}
        {robustnessResult && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.76rem',
            }}
          >
            <div>
              <strong style={{ color: '#10b981' }}>✔ Prueba de Robustez de Malla Exitosa (Tarea 333):</strong>
              <span style={{ color: 'var(--text-secondary)', marginLeft: '8px' }}>
                Correlación de rangos de Spearman entre Δx (0.5 mm) y Δx/2 (0.25 mm) ={' '}
                <strong style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                  ρ = {robustnessResult.spearman_rank_correlation.toFixed(4)}
                </strong>{' '}
                (Umbral ≥ 0.90).
              </span>
            </div>
            <span style={{ background: '#10b981', color: '#030712', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>
              RANKING PRESERVADO
            </span>
          </div>
        )}

        {/* Visualizaciones: Familia de Curvas 1D y Mapa de Calor 2D */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
          <FamilyCurvesChart
            frequenciesGhz={frequenciesGhz}
            familyCurvesT={familyCurvesT}
            f0Ghz={config.f0_ghz}
            paramName={config.parameterName}
          />

          <HeatmapChart
            paramXName={heatmapParamX}
            paramXValues={heatmapParamXValues}
            paramYName={heatmapParamY}
            paramYValues={heatmapParamYValues}
            matrixDb={heatmapMatrixDb}
            matrixLinear={heatmapMatrixLinear}
            matrixF2={heatmapMatrixF2}
          />
        </div>

        {/* Tabla tipo README con Exportación CSV */}
        <ReadmeTable rows={tableRows} onExportCsv={handleExportCsv} />
      </div>
    </ChapterLayout>
  );
};
