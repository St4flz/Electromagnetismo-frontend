import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';

export const HomePage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-deep)' }}>
      <Navbar />

      <main style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '48px 36px', flex: 1, display: 'flex', flexDirection: 'column', gap: '56px' }}>
        {/* Hero Section */}
        <section style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '48px', alignItems: 'end', paddingBottom: '40px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
              Laboratorio Teórico &middot; Simulación Computacional
            </span>
            <h1 style={{ fontSize: '2.8rem', fontWeight: 600, lineHeight: 1.15, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginTop: '14px' }}>
              Electromagnetismo Computacional &amp; Metamateriales
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '16px', maxWidth: '640px' }}>
              Plataforma determinista de física interactiva: desde la electrostática de Coulomb hasta la electrodinámica FDTD de Yee y el control de ondas mediante estructuras periódicas de microondas.
            </p>
            <div style={{ marginTop: '28px', display: 'flex', gap: '12px' }}>
              <Link to="/chapter/1-charges" className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '0.88rem' }}>
                Iniciar desde Capítulo 01
              </Link>
              <Link to="/chapter/9-fdtd-intro" className="btn btn-secondary" style={{ padding: '10px 20px', fontSize: '0.88rem' }}>
                Ir directo a FDTD 2D
              </Link>
            </div>
          </div>

          {/* Bloque lateral de supuestos iniciales del sistema */}
          <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '22px 24px', background: 'var(--bg-surface)' }}>
            <h2 style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Parámetros Físicos del Entorno
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.82rem' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Constantes fundamentales</div>
                <div style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                  c = 2.998×10⁸ m/s &middot; η₀ = 376.73 Ω &middot; ε₀ = 8.854×10⁻¹² F/m
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Integración en Tiempo Real</div>
                <div style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                  Velocity-Verlet, algoritmo simpléctico de Boris y salto de rana Leap-Frog FDTD
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Frecuencia objetivo de diseño</div>
                <div style={{ color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                  f₀ = 10 GHz (Microondas) &middot; Estructuras periódicas (a, d, w)
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 9 Capítulos Interactivos */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
              Programa Completo del Laboratorio
            </h2>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              9 capítulos con guiones de comprobación física
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {/* Ch 1 */}
            <Link to="/chapter/1-charges" className="lab-card" style={{ textDecoration: 'none', color: 'inherit', padding: '20px', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>01</span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginTop: '6px', color: 'var(--text-primary)' }}>Partículas y Carga</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '8px' }}>
                Naturaleza discreta de la carga elemental, cuantización de la materia y polaridades duales en 2D.
              </p>
              <div style={{ marginTop: 'auto', paddingTop: '16px', fontSize: '0.76rem', color: 'var(--accent-cyan)' }}>Explorar capítulo &rarr;</div>
            </Link>

            {/* Ch 2 */}
            <Link to="/chapter/2-coulomb" className="lab-card" style={{ textDecoration: 'none', color: 'inherit', padding: '20px', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>02</span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginTop: '6px', color: 'var(--text-primary)' }}>Ley de Coulomb</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '8px' }}>
                Evaluación numérica en tiempo real del vector de fuerza mutuo y verificación de la 3ª ley de Newton.
              </p>
              <div style={{ marginTop: 'auto', paddingTop: '16px', fontSize: '0.76rem', color: 'var(--accent-cyan)' }}>Explorar capítulo &rarr;</div>
            </Link>

            {/* Ch 3 */}
            <Link to="/chapter/3-forces-3d" className="lab-card" style={{ textDecoration: 'none', color: 'inherit', padding: '20px', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>03</span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginTop: '6px', color: 'var(--text-primary)' }}>Interacción en 3D</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '8px' }}>
                Descomposición vectorial tridimensional continua mediante Three.js y órbita interactiva.
              </p>
              <div style={{ marginTop: 'auto', paddingTop: '16px', fontSize: '0.76rem', color: 'var(--accent-cyan)' }}>Explorar capítulo &rarr;</div>
            </Link>

            {/* Ch 4 */}
            <Link to="/chapter/4-electric-field" className="lab-card" style={{ textDecoration: 'none', color: 'inherit', padding: '20px', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>04</span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginTop: '6px', color: 'var(--text-primary)' }}>Campo Eléctrico</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '8px' }}>
                Perturbación local del espacio continuo y aplicación del principio de superposición lineal analítica.
              </p>
              <div style={{ marginTop: 'auto', paddingTop: '16px', fontSize: '0.76rem', color: 'var(--accent-cyan)' }}>Explorar capítulo &rarr;</div>
            </Link>

            {/* Ch 5 */}
            <Link to="/chapter/5-moving-charge" className="lab-card" style={{ textDecoration: 'none', color: 'inherit', padding: '20px', display: 'flex', flexDirection: 'column', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>05</span>
                <span className="badge" style={{ fontSize: '0.65rem' }}>Nuevo</span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginTop: '6px', color: 'var(--text-primary)' }}>Campo Eléctrico en Movimiento</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '8px' }}>
                Cinemática de partículas aceleradas por campo eléctrico, algoritmo Velocity-Verlet y deflexión de Thomson.
              </p>
              <div style={{ marginTop: 'auto', paddingTop: '16px', fontSize: '0.76rem', color: 'var(--accent-cyan)' }}>Explorar capítulo &rarr;</div>
            </Link>

            {/* Ch 6 */}
            <Link to="/chapter/6-magnetic-field" className="lab-card" style={{ textDecoration: 'none', color: 'inherit', padding: '20px', display: 'flex', flexDirection: 'column', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>06</span>
                <span className="badge" style={{ fontSize: '0.65rem' }}>Nuevo</span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginTop: '6px', color: 'var(--text-primary)' }}>Ondas y Campo Magnético (2D)</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '8px' }}>
                Fuerza de Lorentz q(E + v×B), radio ciclotrónico, selector de velocidades de Wien y trabajo nulo.
              </p>
              <div style={{ marginTop: 'auto', paddingTop: '16px', fontSize: '0.76rem', color: 'var(--accent-cyan)' }}>Explorar capítulo &rarr;</div>
            </Link>

            {/* Ch 7 */}
            <Link to="/chapter/7-em-wave-vacuum" className="lab-card" style={{ textDecoration: 'none', color: 'inherit', padding: '20px', display: 'flex', flexDirection: 'column', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>07</span>
                <span className="badge" style={{ fontSize: '0.65rem' }}>Nuevo</span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginTop: '6px', color: 'var(--text-primary)' }}>Onda Electromagnética en Vacío</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '8px' }}>
                Acoplamiento rotacional de Maxwell, velocidad c, impedancia η₀ ≈ 376.73 Ω y flujo vectorial de Poynting.
              </p>
              <div style={{ marginTop: 'auto', paddingTop: '16px', fontSize: '0.76rem', color: 'var(--accent-cyan)' }}>Explorar capítulo &rarr;</div>
            </Link>

            {/* Ch 8 */}
            <Link to="/chapter/8-metamaterials" className="lab-card" style={{ textDecoration: 'none', color: 'inherit', padding: '20px', display: 'flex', flexDirection: 'column', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>08</span>
                <span className="badge" style={{ fontSize: '0.65rem' }}>Nuevo</span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginTop: '6px', color: 'var(--text-primary)' }}>Medio Efectivo Fenomenológico</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '8px' }}>
                Modelo fenomenológico de medio efectivo: estructuras periódicas (a, d, w), modelos Drude-Lorentz, medios zurdos DNG y refracción negativa.
              </p>
              <div style={{ marginTop: 'auto', paddingTop: '16px', fontSize: '0.76rem', color: 'var(--accent-cyan)' }}>Explorar capítulo &rarr;</div>
            </Link>

            {/* Ch 9 */}
            <Link to="/chapter/9-fdtd-intro" className="lab-card" style={{ textDecoration: 'none', color: 'inherit', padding: '20px', display: 'flex', flexDirection: 'column', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>09</span>
                <span className="badge" style={{ fontSize: '0.65rem' }}>Nuevo</span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginTop: '6px', color: 'var(--text-primary)' }}>Introducción al Método FDTD</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '8px' }}>
                Malla escalonada de Yee 2D TM, criterio de estabilidad CFL, fronteras Mur ABC y espectro FFT.
              </p>
              <div style={{ marginTop: 'auto', paddingTop: '16px', fontSize: '0.76rem', color: 'var(--accent-cyan)' }}>Explorar capítulo &rarr;</div>
            </Link>

            {/* Ch 10 */}
            <Link to="/chapter/10-fdtd-simulator" className="lab-card" style={{ textDecoration: 'none', color: 'inherit', padding: '20px', display: 'flex', flexDirection: 'column', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>10</span>
                <span className="badge" style={{ fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}>Eje Troncal</span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginTop: '6px', color: 'var(--text-primary)' }}>Simulador FDTD v2: Rigor y Celda</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '8px' }}>
                Malla Yee 2D TM, Floquet periódico en y, capas CPML (-120 dB), inyección TF/SF pura, espectro Poynting y batería V1–V11.
              </p>
              <div style={{ marginTop: 'auto', paddingTop: '16px', fontSize: '0.76rem', color: 'var(--accent-emerald)' }}>Explorar simulador troncal &rarr;</div>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};
