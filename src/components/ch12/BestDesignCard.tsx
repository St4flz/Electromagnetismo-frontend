import React from 'react';

export interface BestDesignData {
  design_id?: number;
  a_mm: number;
  d_mm: number;
  w_mm: number;
  periods: number;
  family: string;
  is_pec: boolean;
  relative_permittivity: number;
  f0_ghz: number;
  t_f0: number;
  t_f0_db: number;
  r_f0: number;
  t_pass_mean: number;
  rejection_depth_db: number;
  f2_score: number;
}

interface BestDesignCardProps {
  bestDesign: BestDesignData | null;
  onRevalidate: () => void;
  isRevalidating: boolean;
}

export const BestDesignCard: React.FC<BestDesignCardProps> = ({
  bestDesign,
  onRevalidate,
  isRevalidating,
}) => {
  if (!bestDesign) {
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
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '220px',
          color: '#64748b',
          fontSize: '0.85rem',
        }}
      >
        <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>💎</div>
        <span>El diseño óptimo seleccionado por el Algoritmo Genético aparecerá aquí</span>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.85)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        borderRadius: '12px',
        padding: '20px',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxShadow: '0 8px 24px rgba(2, 132, 199, 0.15)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.3rem' }}>🏆</span>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#f8fafc', fontWeight: 600 }}>
              Diseño Campeón (Metamaterial Óptimo)
            </h4>
            <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>
              Filtro Rechaza-Banda sintonizado a {bestDesign.f0_ghz.toFixed(1)} GHz
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Aptitud (F₂)</span>
          <strong style={{ fontSize: '1.15rem', color: '#10b981' }}>{bestDesign.f2_score.toFixed(4)}</strong>
        </div>
      </div>

      {/* Grid de Dimensiones y Métricas Electromagnéticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
        <div
          style={{
            background: 'rgba(30, 41, 59, 0.6)',
            padding: '10px',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #334155',
          }}
        >
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Periodo (a)</span>
          <strong style={{ fontSize: '1rem', color: '#f8fafc' }}>{bestDesign.a_mm.toFixed(2)} mm</strong>
        </div>

        <div
          style={{
            background: 'rgba(30, 41, 59, 0.6)',
            padding: '10px',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #334155',
          }}
        >
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Espaciado (d)</span>
          <strong style={{ fontSize: '1rem', color: '#f8fafc' }}>{bestDesign.d_mm.toFixed(2)} mm</strong>
        </div>

        <div
          style={{
            background: 'rgba(30, 41, 59, 0.6)',
            padding: '10px',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #334155',
          }}
        >
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Grosor (w)</span>
          <strong style={{ fontSize: '1rem', color: '#f8fafc' }}>{bestDesign.w_mm.toFixed(2)} mm</strong>
        </div>

        <div
          style={{
            background: 'rgba(30, 41, 59, 0.6)',
            padding: '10px',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #334155',
          }}
        >
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Celdas (N)</span>
          <strong style={{ fontSize: '1rem', color: '#f8fafc' }}>{bestDesign.periods}</strong>
        </div>
      </div>

      {/* Métricas de Transmisión y Rechazo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        <div
          style={{
            background: 'rgba(2, 132, 199, 0.1)',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid rgba(56, 189, 248, 0.2)',
          }}
        >
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>Rechazo en f₀</span>
          <strong style={{ fontSize: '1.1rem', color: '#38bdf8' }}>
            {bestDesign.t_f0_db.toFixed(1)} dB
          </strong>
          <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginTop: '2px' }}>
            T(f₀) = {(bestDesign.t_f0 * 100).toFixed(1)}%
          </span>
        </div>

        <div
          style={{
            background: 'rgba(16, 185, 129, 0.1)',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid rgba(16, 185, 129, 0.2)',
          }}
        >
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>Transmisión Banda Paso</span>
          <strong style={{ fontSize: '1.1rem', color: '#10b981' }}>
            {(bestDesign.t_pass_mean * 100).toFixed(1)}%
          </strong>
          <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginTop: '2px' }}>
            Transparencia fuera del rechazo
          </span>
        </div>

        <div
          style={{
            background: 'rgba(245, 158, 11, 0.1)',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid rgba(245, 158, 11, 0.2)',
          }}
        >
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>Reflexión en f₀</span>
          <strong style={{ fontSize: '1.1rem', color: '#f59e0b' }}>
            {(bestDesign.r_f0 * 100).toFixed(1)}%
          </strong>
          <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginTop: '2px' }}>
            Onda reflejada hacia la fuente
          </span>
        </div>
      </div>

      {/* Botón de Re-validación Física */}
      <button
        onClick={onRevalidate}
        disabled={isRevalidating}
        style={{
          width: '100%',
          padding: '10px 16px',
          background: 'linear-gradient(135deg, #059669, #047857)',
          border: 'none',
          borderRadius: '8px',
          color: '#ffffff',
          fontWeight: 600,
          fontSize: '0.85rem',
          cursor: isRevalidating ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
        }}
      >
        <span>🔬</span>
        {isRevalidating
          ? 'Re-validando en Malla Fina (Δx = 0.25 mm)...'
          : 'Re-validar Ganador en Malla Fina (Δx/2 = 0.25 mm)'}
      </button>
    </div>
  );
};
