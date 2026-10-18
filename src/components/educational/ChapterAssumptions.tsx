import React, { useState } from 'react';

export interface AssumptionProperty {
  label: string;
  value: string;
  description?: string;
}

interface ChapterAssumptionsProps {
  systemRange?: string;
  particleLimit?: number;
  minSeparation?: string;
  chargeRange?: string;
  additionalDetails?: AssumptionProperty[];
}

export const ChapterAssumptions: React.FC<ChapterAssumptionsProps> = ({
  systemRange = 'Plano cartesiano [-15 cm, +15 cm] en X e Y',
  particleLimit = 4,
  minSeparation = '0.5 cm (evita divergencia asintótica 1/r²)',
  chargeRange = 'De -10.0 µC a +10.0 µC (resolución de 0.5 µC)',
  additionalDetails = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      style={{
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        background: 'var(--bg-surface)',
        marginBottom: '20px',
        padding: '12px 18px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
          <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
            Supuestos del modelo
          </span>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Límite de {particleLimit} partículas &middot; Separación mínima {minSeparation.split(' ')[0]}
          </span>
        </div>

        <button
          type="button"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.75rem',
            cursor: 'pointer',
          }}
        >
          {isOpen ? 'Ocultar detalles' : 'Desplegar parámetros'}
        </button>
      </div>

      {isOpen && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px',
            marginTop: '14px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Sistema coordenado
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
              {systemRange}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Población máxima
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
              {particleLimit} cargas simultáneas
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Límite de proximidad visual
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
              {minSeparation}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Rango de carga
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
              {chargeRange}
            </div>
          </div>

          {additionalDetails.map((item, idx) => (
            <div key={idx}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {item.label}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
