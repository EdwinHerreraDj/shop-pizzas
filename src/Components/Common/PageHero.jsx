import { useState } from "react";
import { Link } from "react-router-dom";

/**
 * Encabezado de las páginas interiores de la tienda (carta, seguimiento,
 * carrito, checkout). Usa la foto del horno del inicio en WebP ligero.
 *
 * Sin "salto" al cargar: altura fija, color base oscuro mientras llega la
 * imagen y fundido suave cuando está lista (antes el fondo lo ponía un script
 * después de pintar, y aparecía de golpe).
 */
export default function PageHero({ titulo, subtitulo, icono, migas = [] }) {
  const [cargada, setCargada] = useState(false);

  return (
    <section className="page-hero">
      <img
        src="/assets/img/bg/hero-paginas.webp"
        srcSet="/assets/img/bg/hero-paginas-movil.webp 800w, /assets/img/bg/hero-paginas.webp 1600w"
        sizes="100vw"
        alt=""
        aria-hidden="true"
        decoding="async"
        fetchPriority="high"
        className={`page-hero-imagen ${cargada ? "cargada" : ""}`}
        onLoad={() => setCargada(true)}
        ref={(img) => {
          // Si ya estaba en caché, onLoad puede no dispararse tras hidratar
          if (img?.complete && img.naturalWidth > 0 && !cargada) setCargada(true);
        }}
      />
      <div className="page-hero-velo" />

      <div className="container page-hero-contenido">
        {icono && (
          <span className="page-hero-icono">
            <i className={`bi ${icono}`} />
          </span>
        )}
        <h1 className="page-hero-titulo">{titulo}</h1>
        {subtitulo && <p className="page-hero-subtitulo">{subtitulo}</p>}

        <nav aria-label="Ruta de navegación">
          <ol className="page-hero-migas">
            <li>
              <Link to="/">
                <i className="bi bi-house-door-fill me-1" />
                Inicio
              </Link>
            </li>
            {migas.map((m) => (
              <li key={m.texto}>
                <i className="bi bi-chevron-right separador" />
                {m.to ? <Link to={m.to}>{m.texto}</Link> : <span>{m.texto}</span>}
              </li>
            ))}
            <li aria-current="page">
              <i className="bi bi-chevron-right separador" />
              <span className="actual">{titulo}</span>
            </li>
          </ol>
        </nav>
      </div>

      <style>{`
        .page-hero {
          position: relative;
          min-height: 300px;
          display: flex;
          align-items: center;
          overflow: hidden;
          background: #2b140c; /* color base mientras carga la imagen */
          text-align: center;
          color: #fff;
        }
        .page-hero-imagen {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 60%;
          opacity: 0;
          transform: scale(1.04);
          transition: opacity 0.6s ease, transform 1.2s ease;
        }
        .page-hero-imagen.cargada { opacity: 1; transform: scale(1); }
        .page-hero-velo {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(20, 8, 4, 0.55) 0%, rgba(20, 8, 4, 0.7) 100%),
            radial-gradient(ellipse at center, rgba(235, 0, 41, 0.15), transparent 70%);
        }
        .page-hero-contenido { position: relative; z-index: 2; padding-top: 2.5rem; padding-bottom: 2.5rem; }

        .page-hero-icono {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.75rem;
          font-size: 1.4rem;
          color: #fff;
          background: linear-gradient(135deg, #eb0029, #fc791a);
          box-shadow: 0 8px 20px rgba(235, 0, 41, 0.35);
        }
        .page-hero-titulo {
          color: #fff;
          font-family: var(--title-font);
          font-size: 3rem;
          font-weight: 800;
          line-height: 1.1;
          text-transform: none;
          margin: 0;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        }
        .page-hero-subtitulo {
          margin: 0.5rem auto 0;
          max-width: 560px;
          color: rgba(255, 255, 255, 0.9);
          font-size: 1.05rem;
          line-height: 1.45;
        }

        .page-hero-migas {
          display: inline-flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          list-style: none;
          margin: 1.1rem 0 0;
          padding: 0.4rem 1rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.14);
          backdrop-filter: blur(6px);
          font-size: 0.88rem;
          font-weight: 600;
        }
        .page-hero-migas li { display: inline-flex; align-items: center; }
        .page-hero-migas a { color: #fff !important; text-decoration: none; }
        .page-hero-migas a:hover { color: #ffd2a8 !important; }
        .page-hero-migas .separador { font-size: 0.7rem; opacity: 0.7; margin-right: 0.35rem; }
        .page-hero-migas .actual { color: #ffb36b; }

        @media (max-width: 575px) {
          .page-hero { min-height: 220px; }
          .page-hero-contenido { padding-top: 1.75rem; padding-bottom: 1.75rem; }
          .page-hero-icono { width: 44px; height: 44px; font-size: 1.2rem; border-radius: 14px; }
          .page-hero-titulo { font-size: 2rem; }
          .page-hero-subtitulo { font-size: 0.95rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .page-hero-imagen { transition: none; transform: none; }
        }
      `}</style>
    </section>
  );
}
