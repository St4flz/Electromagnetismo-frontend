import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';

export const HomePage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'radial-gradient(circle at 50% 20%, #1e1b4b 0%, #070a11 60%)' }}>
      <Navbar />

      <main style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '48px' }}>
        {/* Hero Section */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div className="badge badge-live" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
            ⚡ Simulación Computacional con Rigor Físico y Matemático
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #f8fafc, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Diseño Computacional de Metamateriales Electromagnéticos
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: '750px', lineHeight: 1.6 }}>
            Aprende y experimenta cómo las leyes fundamentales del electromagnetismo se traducen en código numérico determinista: desde la interacción elemental de cargas hasta el control avanzado de ondas electromagnéticas.
          </p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
            <Link to="/chapter/1-charges" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '1rem' }}>
              Comenzar Historia: Cap. 01 →
            </Link>
            <Link to="/chapter/2-coulomb" className="btn btn-secondary" style={{ padding: '12px 24px', fontSize: '1rem' }}>
              Simulador de Coulomb 2D
            </Link>
          </div>
        </div>

        {/* Tarjetas de los 4 Capítulos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'transform 0.2s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge badge-pos">Capítulo 01</span>
              <span style={{ fontSize: '1.2rem' }}>🔵🔴</span>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Partículas y Cargas</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Abstracción lógica de partículas en 2D. Definición de carga $q$ [C], sistemas de coordenadas físicas y unidades del SI.
            </p>
            <Link to="/chapter/1-charges" className="btn btn-secondary" style={{ marginTop: 'auto', fontSize: '0.8rem' }}>
              Explorar Cap. 1
            </Link>
          </div>

          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fcd34d', border: '1px solid rgba(245, 158, 11, 0.3)' }}>Capítulo 02</span>
              <span style={{ fontSize: '1.2rem' }}>📐⚡</span>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Ley de Coulomb 2D</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Interacción entre dos o más cargas. Vector de fuerza F₁₂, tercera ley de Newton y cálculo en tiempo real vía WebSocket.
            </p>
            <Link to="/chapter/2-coulomb" className="btn btn-secondary" style={{ marginTop: 'auto', fontSize: '0.8rem' }}>
              Explorar Cap. 2
            </Link>
          </div>

          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#d8b4fe', border: '1px solid rgba(168, 85, 247, 0.3)' }}>Capítulo 03</span>
              <span style={{ fontSize: '1.2rem' }}>🌐</span>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Interacción en 3D</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Traspaso de la física al espacio tridimensional con Three.js y WebGL. Vectores en el espacio tridimensional R³ con rotación orbital.
            </p>
            <Link to="/chapter/3-forces-3d" className="btn btn-secondary" style={{ marginTop: 'auto', fontSize: '0.8rem' }}>
              Explorar Cap. 3
            </Link>
          </div>

          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#7dd3fc', border: '1px solid rgba(56, 189, 248, 0.3)' }}>Capítulo 04</span>
              <span style={{ fontSize: '1.2rem' }}>🌊</span>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Campo Eléctrico E</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Del concepto de fuerza a la perturbación del espacio: E = F/q₀. Mapeo vectorial de líneas de campo y superposición.
            </p>
            <Link to="/chapter/4-electric-field" className="btn btn-secondary" style={{ marginTop: 'auto', fontSize: '0.8rem' }}>
              Explorar Cap. 4
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
