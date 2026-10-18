import React from 'react';
import { Link } from 'react-router-dom';
import { usePhysicsSocket } from '../../hooks/usePhysicsSocket';
import { useTheme } from '../../context/ThemeContext';

export const Navbar: React.FC = () => {
  const { isConnected, computeTimeMs } = usePhysicsSocket();
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '14px 36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link
          to="/"
          style={{
            textDecoration: 'none',
            color: 'inherit',
            display: 'flex',
            alignItems: 'baseline',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '1.05rem', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Electromagnetismo
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Física Computacional
          </span>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: isConnected ? '#10b981' : '#f43f5e' }}>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: isConnected ? '#10b981' : '#f43f5e',
              display: 'inline-block',
            }}
          />
          <span className="font-mono">
            {isConnected ? `Servidor activo (${computeTimeMs.toFixed(1)} ms)` : 'Servidor desconectado'}
          </span>
        </div>

        {/* Interruptor de Tema Claro / Oscuro */}
        <button
          onClick={toggleTheme}
          className="btn btn-secondary"
          style={{
            padding: '5px 12px',
            fontSize: '0.76rem',
            fontFamily: 'var(--font-mono)',
          }}
          title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        </button>

        <Link
          to="/"
          style={{
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            padding: '5px 12px',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
            transition: 'border-color 150ms ease',
          }}
        >
          Índice
        </Link>
      </div>
    </header>
  );
};
