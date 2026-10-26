import React from 'react';
import { NavLink } from 'react-router-dom';

interface ChapterItem {
  id: string;
  number: string;
  title: string;
  path: string;
  description: string;
}

const CHAPTERS: ChapterItem[] = [
  {
    id: 'ch1',
    number: '01',
    title: 'Partículas y Carga Eléctrica',
    path: '/chapter/1-charges',
    description: 'Naturaleza discreta de la carga q en dos dimensiones.',
  },
  {
    id: 'ch2',
    number: '02',
    title: 'Ley de Coulomb',
    path: '/chapter/2-coulomb',
    description: 'Fuerza electrostática y tercera ley de Newton.',
  },
  {
    id: 'ch3',
    number: '03',
    title: 'Interacción Tridimensional',
    path: '/chapter/3-forces-3d',
    description: 'Espacio vectorial tridimensional y órbita WebGL.',
  },
  {
    id: 'ch4',
    number: '04',
    title: 'Campo Eléctrico Vectorial',
    path: '/chapter/4-electric-field',
    description: 'Perturbación local y principio de superposición.',
  },
  {
    id: 'ch5',
    number: '05',
    title: 'Campo Eléctrico en Movimiento',
    path: '/chapter/5-moving-charge',
    description: 'Cinemática de cargas, Velocity-Verlet y deflexión balística de Thomson.',
  },
  {
    id: 'ch6',
    number: '06',
    title: 'Ondas y Campo Magnético (2D)',
    path: '/chapter/6-magnetic-field',
    description: 'Ley de Biot-Savart, Fuerza de Lorentz, órbita de Boris y Ciclotrón.',
  },
  {
    id: 'ch7',
    number: '07',
    title: 'Onda Electromagnética en Vacío',
    path: '/chapter/7-em-wave-vacuum',
    description: 'Ecuaciones de Maxwell 2D, velocidad c, equipartición y flujo de Poynting.',
  },
  {
    id: 'ch8',
    number: '08',
    title: 'Medio Efectivo Fenomenológico',
    path: '/chapter/8-metamaterials',
    description: 'Modelo de medio efectivo fenomenológico: celda (a, d, w), parámetros Veselago y TMM.',
  },
  {
    id: 'ch9',
    number: '09',
    title: 'Introducción al Método FDTD',
    path: '/chapter/9-fdtd-intro',
    description: 'Celda de Yee 2D TM, estabilidad CFL, fronteras Mur ABC y espectro FFT.',
  },
  {
    id: 'ch10',
    number: '10',
    title: 'Simulador FDTD v2: Celda Unitaria',
    path: '/chapter/10-fdtd-simulator',
    description: 'Yee 2D TM con rigor, Floquet en y, CPML, TF/SF y espectro Poynting.',
  },
  {
    id: 'ch11',
    number: '11',
    title: 'Laboratorio Paramétrico FDTD',
    path: '/chapter/11-parametric-lab',
    description: 'Barridos 1D/2D, mapas de calor T(f, a), selectividad F2 y tabla README.',
  },
];

export const Sidebar: React.FC = () => {
  return (
    <aside
      style={{
        width: '260px',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        flexShrink: 0,
        height: 'calc(100vh - 65px)',
        borderRight: '1px solid var(--border-subtle)',
        overflowY: 'auto',
      }}
    >
      <div style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
        <h2 style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
          Programa
        </h2>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {CHAPTERS.map((chap) => (
          <NavLink
            key={chap.id}
            to={chap.path}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              padding: '12px 14px',
              borderRadius: '6px',
              textDecoration: 'none',
              color: 'inherit',
              background: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
              borderLeft: isActive ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              transition: 'background 120ms ease',
            })}
          >
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Capítulo {chap.number}
            </span>
            <span style={{ fontSize: '0.86rem', fontWeight: 500, color: 'var(--text-primary)', marginTop: '2px' }}>
              {chap.title}
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
              {chap.description}
            </span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
