import React from 'react';
import { Link } from 'react-router-dom';
import { usePhysicsSocket } from '../../hooks/usePhysicsSocket';

export const Navbar: React.FC = () => {
  const { isConnected, computeTimeMs } = usePhysicsSocket();

  return (
    <header className="navbar glass-panel" style={{
      margin: '12px 16px',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 50
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px var(--accent-glow)'
          }}>
            ⚡
          </div>
          <div>
            <h1 style={{ fontSize: '1.05rem', fontWeight: 600, letterSpacing: '-0.01em' }}>Electromagnetismo</h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Física Computacional Rigurosa</p>
          </div>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Status del motor físico */}
        <div className={`badge ${isConnected ? 'badge-live' : 'badge-pos'}`}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isConnected ? '#10b981' : '#ef4444',
            display: 'inline-block',
            boxShadow: isConnected ? '0 0 8px #10b981' : 'none'
          }} />
          {isConnected ? `Motor Físico Activo (${computeTimeMs.toFixed(1)} ms)` : 'Servidor Desconectado'}
        </div>

        <Link to="/" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
          📖 Inicio
        </Link>
      </div>
    </header>
  );
};
