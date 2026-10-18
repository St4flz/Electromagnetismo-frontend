import React from 'react';
import { NavLink } from 'react-router-dom';

interface ChapterItem {
  id: string;
  number: string;
  title: string;
  path: string;
  description: string;
  badge: string;
}

const CHAPTERS: ChapterItem[] = [
  {
    id: 'ch1',
    number: '01',
    title: 'Partículas y Cargas',
    path: '/chapter/1-charges',
    description: 'Naturaleza de la carga eléctrica q [C] en 2D',
    badge: '2D Básico',
  },
  {
    id: 'ch2',
    number: '02',
    title: 'Ley de Coulomb',
    path: '/chapter/2-coulomb',
    description: 'Fuerza electrostática F = k·q₁·q₂/r²·r̂ en tiempo real',
    badge: '2D Dinámico',
  },
  {
    id: 'ch3',
    number: '03',
    title: 'Interacción en 3D',
    path: '/chapter/3-forces-3d',
    description: 'Espacio tridimensional con Three.js y vectores r = (x,y,z)',
    badge: '3D WebGL',
  },
  {
    id: 'ch4',
    number: '04',
    title: 'Campo Eléctrico E',
    path: '/chapter/4-electric-field',
    description: 'Definición de campo vectorial E = F/q₀ y superposición',
    badge: 'Vectorial',
  },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="glass-panel" style={{
      width: '280px',
      margin: '0 0 16px 16px',
      padding: '20px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      flexShrink: 0,
      height: 'calc(100vh - 100px)',
      overflowY: 'auto'
    }}>
      <div style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-glass)' }}>
        <h2 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>
          Ruta de Aprendizaje
        </h2>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          De conceptos elementales a campos complejos
        </p>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {CHAPTERS.map((chap) => (
          <NavLink
            key={chap.id}
            to={chap.path}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              padding: '12px 14px',
              borderRadius: '10px',
              textDecoration: 'none',
              color: 'inherit',
              background: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
              border: isActive ? '1px solid var(--border-accent)' : '1px solid transparent',
              transition: 'all var(--transition-fast)'
            })}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                CAPÍTULO {chap.number}
              </span>
              <span className="badge" style={{ fontSize: '0.65rem', padding: '2px 6px', background: 'rgba(255,255,255,0.06)' }}>
                {chap.badge}
              </span>
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {chap.title}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {chap.description}
            </span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
