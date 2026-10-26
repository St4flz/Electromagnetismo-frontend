import React from 'react';

export interface SweepPointData {
  design_id: number;
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
  rank: number;
}

interface ReadmeTableProps {
  rows: SweepPointData[];
  onExportCsv: () => void;
}

export const ReadmeTable: React.FC<ReadmeTableProps> = ({ rows, onExportCsv }) => {
  if (!rows || rows.length === 0) {
    return (
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: '10px',
          padding: '24px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.82rem',
        }}
      >
        La tabla tipo README se poblará automáticamente con cada punto de diseño evaluado por el FDTD.
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderRadius: '10px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Tabla de Diseños Generada por la Simulación (Formato README)
          </h3>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            Ordenada por ranking de la función objetivo F₂ (selectividad y rechazo de banda)
          </span>
        </div>

        <button
          onClick={onExportCsv}
          style={{
            background: 'var(--accent-cyan)',
            color: '#030712',
            fontWeight: 600,
            fontSize: '0.74rem',
            padding: '6px 14px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          📥 Descargar CSV Dataset
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-medium)', textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={{ padding: '8px 6px', width: '40px' }}>Rank</th>
              <th style={{ padding: '8px 6px' }}>ID</th>
              <th style={{ padding: '8px 8px' }}>Familia</th>
              <th style={{ padding: '8px 8px' }}>Material</th>
              <th style={{ padding: '8px 8px' }}>a [mm]</th>
              <th style={{ padding: '8px 8px' }}>d [mm]</th>
              <th style={{ padding: '8px 8px' }}>w [mm]</th>
              <th style={{ padding: '8px 8px' }}>f₀ [GHz]</th>
              <th style={{ padding: '8px 8px' }}>T(f₀)</th>
              <th style={{ padding: '8px 8px' }}>T(f₀) [dB]</th>
              <th style={{ padding: '8px 8px' }}>R(f₀)</th>
              <th style={{ padding: '8px 8px' }}>T_pass</th>
              <th style={{ padding: '8px 8px' }}>Rechazo</th>
              <th style={{ padding: '8px 8px', textAlign: 'right' }}>Score F₂</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isBest = row.rank === 1;
              return (
                <tr
                  key={row.design_id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    background: isBest
                      ? 'rgba(16, 185, 129, 0.08)'
                      : row.rank % 2 === 0
                      ? 'rgba(148, 163, 184, 0.02)'
                      : 'transparent',
                  }}
                >
                  <td style={{ padding: '8px 6px', fontWeight: 600 }}>
                    {isBest ? (
                      <span style={{ background: '#10b981', color: '#030712', padding: '2px 6px', borderRadius: '4px', fontSize: '0.68rem' }}>
                        #1
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>#{row.rank}</span>
                    )}
                  </td>
                  <td style={{ padding: '8px 6px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {row.design_id}
                  </td>
                  <td style={{ padding: '8px 8px', color: 'var(--text-primary)' }}>
                    {row.family === 'rod_array' ? 'Varillas B' : 'Anillos C'}
                  </td>
                  <td style={{ padding: '8px 8px', color: row.is_pec ? 'var(--accent-gold)' : 'var(--accent-cyan)' }}>
                    {row.is_pec ? 'PEC' : `ε=${row.relative_permittivity.toFixed(1)}`}
                  </td>
                  <td style={{ padding: '8px 8px', fontFamily: 'var(--font-mono)' }}>{row.a_mm.toFixed(1)}</td>
                  <td style={{ padding: '8px 8px', fontFamily: 'var(--font-mono)' }}>{row.d_mm.toFixed(1)}</td>
                  <td style={{ padding: '8px 8px', fontFamily: 'var(--font-mono)' }}>{row.w_mm.toFixed(2)}</td>
                  <td style={{ padding: '8px 8px', fontFamily: 'var(--font-mono)' }}>{row.f0_ghz.toFixed(1)}</td>
                  <td style={{ padding: '8px 8px', fontFamily: 'var(--font-mono)', color: row.t_f0 < 0.05 ? '#10b981' : 'inherit' }}>
                    {row.t_f0.toFixed(4)}
                  </td>
                  <td style={{ padding: '8px 8px', fontFamily: 'var(--font-mono)', color: row.t_f0_db < -15 ? '#10b981' : 'inherit' }}>
                    {row.t_f0_db.toFixed(1)} dB
                  </td>
                  <td style={{ padding: '8px 8px', fontFamily: 'var(--font-mono)' }}>{row.r_f0.toFixed(4)}</td>
                  <td style={{ padding: '8px 8px', fontFamily: 'var(--font-mono)', color: row.t_pass_mean > 0.8 ? '#10b981' : 'inherit' }}>
                    {row.t_pass_mean.toFixed(3)}
                  </td>
                  <td style={{ padding: '8px 8px', fontFamily: 'var(--font-mono)' }}>
                    {row.rejection_depth_db.toFixed(1)} dB
                  </td>
                  <td style={{ padding: '8px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: isBest ? '#10b981' : 'var(--accent-gold)' }}>
                    {row.f2_score.toFixed(4)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
