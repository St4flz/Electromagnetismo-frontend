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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--bg-deep)' }}>
      <Navbar />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />

        <main
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '24px 32px',
            overflowY: 'auto',
            position: 'relative',
          }}
        >
          {/* Header del capítulo */}
          <div
            style={{
              paddingBottom: '16px',
              marginBottom: '20px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                Capítulo {chapterNumber.toString().padStart(2, '0')}
              </span>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
                {chapterTitle}
              </h1>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              {prevPath && (
                <button
                  onClick={() => navigate(prevPath)}
                  className="btn btn-secondary"
                  style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                >
                  Anterior
                </button>
              )}
              {nextPath && (
                <button
                  onClick={() => navigate(nextPath)}
                  className="btn btn-primary"
                  style={{ padding: '6px 16px', fontSize: '0.8rem' }}
                >
                  Siguiente
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
