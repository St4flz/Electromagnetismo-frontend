import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';

export const HomePage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-deep)' }}>
      <Navbar />

      <main style={{ maxWidth: '1240px', width: '100%', margin: '0 auto', padding: '60px 48px', flex: 1, display: 'flex', flexDirection: 'column', gap: '64px' }}>
        {/* Hero Section asimétrica y espaciosa */}
        <section style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '56px', alignItems: 'end', paddingBottom: '48px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
              Laboratorio Teórico &middot; Simulación Computacional
            </span>
            <h1 style={{ fontSize: '3rem', fontWeight: 600, lineHeight: 1.15, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginTop: '16px' }}>
              Modelado de Campos e Interacciones Electrostáticas
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '20px', maxWidth: '620px' }}>
              Un entorno determinista para estudiar la transición entre partículas discretas, la ley de Coulomb y la formulación continua del campo electrostático.
            </p>
            <div style={{ marginTop: '32px' }}>
              <Link to="/chapter/1-charges" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '0.9rem' }}>
                Iniciar con Capítulo 01
              </Link>
            </div>
          </div>

          {/* Bloque lateral de supuestos iniciales del sistema */}
          <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '24px 28px', background: 'var(--bg-surface)' }}>
            <h2 style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Parámetros de frontera
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.82rem' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Espacio de cómputo</div>
                <div style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                  Coordenadas métricas en vacío (ke = 8.988 &times; 10⁹ N&middot;m²/C²)
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Resolución de partículas</div>
                <div style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                  Hasta 4 fuentes discretas con barrera de acercamiento de 4.0 cm
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Rango de polarización</div>
                <div style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                  De &minus;10 &mu;C a +10 &mu;C con resolución continua
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Módulos de estudio con amplio espacio en blanco */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '28px' }}>
            <h2 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
              Estructura del Programa
            </h2>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              4 capítulos interactivos
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            <Link
              to="/chapter/1-charges"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '24px 20px',
                background: 'var(--bg-surface)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'border-color 150ms ease',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                01
              </span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginTop: '8px', color: 'var(--text-primary)' }}>
                Partículas y Carga
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '10px' }}>
                Naturaleza de la carga elemental discreta, cuantización de la materia y polaridades duales en 2D.
              </p>
              <div style={{ marginTop: '24px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Explorar capítulo &rarr;
              </div>
            </Link>

            <Link
              to="/chapter/2-coulomb"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '24px 20px',
                background: 'var(--bg-surface)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'border-color 150ms ease',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                02
              </span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginTop: '8px', color: 'var(--text-primary)' }}>
                Ley de Coulomb
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '10px' }}>
                Evaluación numérica en tiempo real del vector de fuerza mutuo y verificación de la 3ª ley de Newton.
              </p>
              <div style={{ marginTop: '24px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Explorar capítulo &rarr;
              </div>
            </Link>

            <Link
              to="/chapter/3-forces-3d"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '24px 20px',
                background: 'var(--bg-surface)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'border-color 150ms ease',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                03
              </span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginTop: '8px', color: 'var(--text-primary)' }}>
                Interacción en 3D
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '10px' }}>
                Descomposición vectorial en el espacio euclidiano continuo mediante Three.js y órbita tridimensional.
              </p>
              <div style={{ marginTop: '24px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Explorar capítulo &rarr;
              </div>
            </Link>

            <Link
              to="/chapter/4-electric-field"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '24px 20px',
                background: 'var(--bg-surface)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'border-color 150ms ease',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                04
              </span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginTop: '8px', color: 'var(--text-primary)' }}>
                Campo Eléctrico
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '10px' }}>
                Perturbación local del espacio continuo y aplicación del principio de superposición lineal analítica.
              </p>
              <div style={{ marginTop: '24px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Explorar capítulo &rarr;
              </div>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};
