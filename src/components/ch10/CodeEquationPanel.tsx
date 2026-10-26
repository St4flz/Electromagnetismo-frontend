import React, { useState } from 'react';
import { getApiUrl } from '../../utils/apiConfig';

interface EquationMapping {
  id: string;
  title: string;
  formulaLatex: string;
  description: string;
  symbol: string;
  submodule: string;
}

const EQUATION_MAPPINGS: EquationMapping[] = [
  {
    id: 'faraday',
    title: '1. Ley de Faraday Discreta (Actualización H)',
    formulaLatex: '∂H_x/∂t = -(1/μ₀) ∂E_z/∂y,   ∂H_y/∂t = +(1/μ₀) ∂E_z/∂x',
    description: 'Rotacional espacial centrado en t = n + 1/2 con frontera periódica transversal (np.roll) en y.',
    symbol: 'fdtd.FDTDSimulation.step',
    submodule: 'domain/fdtd/simulator.py (Bloque 1)',
  },
  {
    id: 'ampere',
    title: '2. Ley de Ampère-Maxwell Discreta (Actualización E)',
    formulaLatex: '∂E_z/∂t = (1/ε) [ ∂H_y/∂x - ∂H_x/∂y - σ E_z ]',
    description: 'Coeficientes Ca = (1 - σΔt/2ε)/(1 + σΔt/2ε) y Cb = (Δt/εΔx)/(1 + σΔt/2ε). Máscara PEC Ez = 0.',
    symbol: 'fdtd.FDTDSimulation.step',
    submodule: 'domain/fdtd/simulator.py (Bloque 2)',
  },
  {
    id: 'cpml',
    title: '3. Fronteras Absorbentes Convolucionales (CPML)',
    formulaLatex: 's_x = κ_x + σ_x / (α_x + jω ε₀),   ψⁿ = b ψⁿ⁻¹ + a (∂/∂x)',
    description: 'Roden & Gedney (2000) con perfiles continuos de profundidad adaptados a los nodos enteros de E y medios de H.',
    symbol: 'fdtd.CPMLBoundary.__post_init__',
    submodule: 'domain/fdtd/boundaries.py',
  },
  {
    id: 'tfsf',
    title: '4. Inyección Total-Field / Scattered-Field (TF/SF)',
    formulaLatex: 'H_y[i₀-1] -= D_b · E_z^{1D}[i₀],   E_z[i₀] -= C_b · H_y^{1D}[i₀-1/2]',
    description: 'Rejilla auxiliar 1D idéntica para generar la onda incidente sin fuga numérica espurio (< -100 dB).',
    symbol: 'fdtd.TFSFSource.correct_2d_E',
    submodule: 'domain/fdtd/sources.py',
  },
  {
    id: 'poynting',
    title: '5. Flujo Espectral de Poynting y Coeficientes T, R, A',
    formulaLatex: 'S_x = -(1/2) Re{ E_z · H_y* },   T(f) = P_t(f) / P_inc(f),   R(f) = -P_r(f) / P_inc(f)',
    description: 'DFT en tiempo real integrada a lo largo de y. T y R medidos independientemente para auditar R+T=1.',
    symbol: 'fdtd.PoyntingSpectrum.from_powers',
    submodule: 'domain/fdtd/monitors.py',
  },
  {
    id: 'airy',
    title: '6. Benchmark Analítico de Airy (Lámina Fabry-Pérot)',
    formulaLatex: 'T = [1 + (1/4)(n - 1/n)² sin²(n k₀ L)]⁻¹',
    description: 'Solución exacta de interferencia multicapa para validación numérica V5.',
    symbol: 'fdtd.airy_dielectric_slab_transmission',
    submodule: 'domain/fdtd/analytic.py',
  },
  {
    id: 'plasma',
    title: '7. Frecuencia de Plasma de Hilos Metálicos (Pendry / Belov)',
    formulaLatex: '(k_p a)² = 2π / [ ln(a / 2πr) + 0.5275 ]',
    description: 'Permitividad efectiva negativa ε_eff < 0 y corte por debajo de fp para validación V11.',
    symbol: 'fdtd.wire_medium_plasma_frequency',
    submodule: 'domain/fdtd/analytic.py',
  },
];

export const CodeEquationPanel: React.FC = () => {
  const [activeItem, setActiveItem] = useState<EquationMapping>(EQUATION_MAPPINGS[0]);
  const [sourceCode, setSourceCode] = useState<string>('');
  const [sourceMeta, setSourceMeta] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchSource = async (item: EquationMapping) => {
    setActiveItem(item);
    setIsLoading(true);
    try {
      const res = await fetch(getApiUrl(`/api/source/${item.symbol}`));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const contentType = res.headers.get('content-type');
      if (contentType && !contentType.includes('application/json')) {
        throw new Error('Respuesta del servidor no es JSON (verifique proxy backend)');
      }
      const data = await res.json();
      setSourceCode(data.source);
      setSourceMeta(data);
    } catch (err: any) {
      setSourceCode(`// Error al obtener código fuente para ${item.symbol}: ${err.message}`);
      setSourceMeta(null);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSource(EQUATION_MAPPINGS[0]);
  }, []);

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderRadius: '10px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div>
        <h3 style={{ fontSize: '0.96rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Trazabilidad Estricta: Ecuación Física ↔ Código Real en Ejecución
        </h3>
        <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
          El código mostrado a continuación se extrae en vivo directamente del backend vía <code style={{ color: 'var(--accent-cyan)' }}>inspect.getsourcelines</code>. Garantiza que la formulación teórica es idéntica a la implementación numérica.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2fr', gap: '16px' }}>
        {/* Lista de Ecuaciones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {EQUATION_MAPPINGS.map((item) => {
            const isSelected = item.id === activeItem.id;
            return (
              <button
                key={item.id}
                onClick={() => fetchSource(item)}
                style={{
                  textAlign: 'left',
                  background: isSelected ? 'var(--bg-surface-highlight)' : 'var(--bg-surface-elevated)',
                  border: `1px solid ${isSelected ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                  borderRadius: '8px',
                  padding: '10px 12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontSize: '0.76rem', fontWeight: 600, color: isSelected ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
                  {item.title}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--accent-gold)', margin: '4px 0' }}>
                  {item.formulaLatex}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  {item.submodule}
                </div>
              </button>
            );
          })}
        </div>

        {/* Visor de Código Fuente Real */}
        <div
          style={{
            background: '#030712',
            border: '1px solid var(--border-medium)',
            borderRadius: '8px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              padding: '8px 12px',
              background: 'rgba(15, 23, 42, 0.8)',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.72rem',
              color: 'var(--text-secondary)',
            }}
          >
            <span>
              Símbolo: <strong style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{activeItem.symbol}</strong>
            </span>
            {sourceMeta && (
              <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Líneas {sourceMeta.startLine}–{sourceMeta.endLine}
              </span>
            )}
          </div>

          <div style={{ padding: '12px', overflow: 'auto', maxHeight: '420px' }}>
            {isLoading ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem', padding: '16px', textAlign: 'center' }}>
                Consultando código fuente con inspect...
              </div>
            ) : (
              <pre
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.74rem',
                  lineHeight: '1.45',
                  color: '#e2e8f0',
                  whiteSpace: 'pre',
                }}
              >
                {sourceCode}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
