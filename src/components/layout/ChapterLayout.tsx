import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useNavigate } from 'react-router-dom';

interface ChapterLayoutProps {
  children: React.ReactNode;
  prevPath?: string;
  nextPath?: string;
  chapterNumber: number;
  chapterTitle: string;
}

export const ChapterLayout: React.FC<ChapterLayoutProps> = ({
  children,
  prevPath,
  nextPath,
  chapterNumber,
  chapterTitle,
}) => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Navbar />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />

        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          margin: '0 16px 16px 12px',
          overflowY: 'auto',
          position: 'relative'
        }}>
          {/* Header del capítulo */}
          <div className="glass-panel" style={{
            padding: '16px 24px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Capítulo {chapterNumber.toString().padStart(2, '0')}
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {chapterTitle}
              </h2>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {prevPath && (
                <button
                  onClick={() => navigate(prevPath)}
                  className="btn btn-secondary"
                  style={{ padding: '6px 14px' }}
                >
                  ← Anterior
                </button>
              )}
              {nextPath && (
                <button
                  onClick={() => navigate(nextPath)}
                  className="btn btn-primary"
                  style={{ padding: '6px 14px' }}
                >
                  Siguiente →
                </button>
              )}
            </div>
          </div>

          {/* Contenido interactivo */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
