import { Link } from "react-router-dom";
import useEmpresa from "../hooks/useEmpresa";
import useHorarioSemanal from "../hooks/useHorarioSemanal";
import useAbiertoAhora from "../hooks/useAbiertoAhora";
import PageHero from "../Components/Common/PageHero";
import "../assets/crear-pizza.css";

// dia_semana del backend: 0 = lunes … 6 = domingo. getDay(): 0 = domingo.
const indiceHoy = () => (new Date().getDay() + 6) % 7;

/* Tarjeta de un canal de contacto (pulsable si tiene enlace) */
function Canal({ icono, color, titulo, valor, accion, href }) {
  const externo = href?.startsWith("http");
  return (
    <a
      href={href}
      className="contacto-canal"
      {...(externo ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      <span className="contacto-canal-icono" style={{ background: color }}>
        <i className={`bi ${icono}`} />
      </span>
      <span className="d-flex flex-column" style={{ minWidth: 0 }}>
        <span className="contacto-canal-titulo">{titulo}</span>
        <span className="contacto-canal-valor">{valor}</span>
      </span>
      <span className="contacto-canal-accion">
        {accion}
        <i className="bi bi-arrow-right" />
      </span>
    </a>
  );
}

export default function ContactoPage() {
  const { data: empresa, isLoading } = useEmpresa();
  const { data: horario = [] } = useHorarioSemanal();
  const { data: apertura } = useAbiertoAhora();
  const hoy = indiceHoy();

  const direccionCompleta = [empresa?.direccion, empresa?.codigo_postal, empresa?.ciudad]
    .filter(Boolean)
    .join(", ");
  const whatsapp = empresa?.whatsapp?.replace(/\D/g, "");

  const canales = [
    empresa?.telefono && {
      icono: "bi-telephone-fill",
      color: "linear-gradient(135deg, #eb0029, #fc791a)",
      titulo: "Llámanos",
      valor: empresa.telefono,
      accion: "Llamar",
      href: `tel:${empresa.telefono.replace(/\s/g, "")}`,
    },
    whatsapp && {
      icono: "bi-whatsapp",
      color: "linear-gradient(135deg, #1ebe5d, #25d366)",
      titulo: "WhatsApp",
      valor: empresa.whatsapp,
      accion: "Escribir",
      href: `https://wa.me/${whatsapp}`,
    },
    empresa?.email && {
      icono: "bi-envelope-fill",
      color: "linear-gradient(135deg, #fc791a, #ffb347)",
      titulo: "Escríbenos",
      valor: empresa.email,
      accion: "Enviar email",
      href: `mailto:${empresa.email}`,
    },
    direccionCompleta && {
      icono: "bi-geo-alt-fill",
      color: "linear-gradient(135deg, #c2410c, #fc791a)",
      titulo: "Visítanos",
      valor: direccionCompleta,
      accion: "Ver en el mapa",
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccionCompleta)}`,
    },
  ].filter(Boolean);

  const redes = [
    empresa?.facebook && { href: empresa.facebook, icono: "bi-facebook", nombre: "Facebook", color: "#1877f2" },
    empresa?.instagram && {
      href: empresa.instagram,
      icono: "bi-instagram",
      nombre: "Instagram",
      color: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)",
    },
  ].filter(Boolean);

  return (
    <>
      <PageHero
        titulo="Contacto"
        subtitulo="¿Dudas, encargos o sugerencias? Estamos encantados de atenderte."
        icono="bi-chat-heart-fill"
      />

      <div className="section-padding contacto-pagina">
        <div className="container">
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border" style={{ color: "#eb0029" }} role="status" />
            </div>
          ) : (
            <div className="row g-4 align-items-start">
              {/* ── Canales de contacto ── */}
              <div className="col-lg-7">
                <section className="cp-seccion">
                  <div className="cp-seccion-cabecera">
                    <span className="cp-seccion-icono">
                      <i className="bi bi-chat-dots-fill" />
                    </span>
                    <div>
                      <h2 className="cp-seccion-titulo">Habla con nosotros</h2>
                      <p className="cp-seccion-sub">Elige cómo prefieres contactarnos.</p>
                    </div>
                  </div>

                  {canales.length > 0 ? (
                    <div className="d-flex flex-column gap-3">
                      {canales.map((c) => (
                        <Canal key={c.titulo} {...c} />
                      ))}
                    </div>
                  ) : (
                    <p className="cp-ayuda mb-0">Muy pronto publicaremos nuestros datos de contacto.</p>
                  )}

                  {empresa?.descripcion && (
                    <div className="contacto-nota">
                      <i className="bi bi-megaphone-fill" />
                      <span>{empresa.descripcion}</span>
                    </div>
                  )}

                  {redes.length > 0 && (
                    <div className="d-flex align-items-center gap-2 mt-4">
                      <span className="fw-bold small me-1" style={{ color: "#3a2e27" }}>
                        Síguenos
                      </span>
                      {redes.map((r) => (
                        <a
                          key={r.icono}
                          href={r.href}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={r.nombre}
                          className="contacto-red"
                          style={{ background: r.color }}
                        >
                          <i className={`bi ${r.icono}`} />
                        </a>
                      ))}
                    </div>
                  )}
                </section>

                {/* Mapa */}
                {empresa?.google_maps_embed && (
                  <section className="cp-seccion mt-3">
                    <div className="cp-seccion-cabecera">
                      <span className="cp-seccion-icono">
                        <i className="bi bi-map-fill" />
                      </span>
                      <div>
                        <h2 className="cp-seccion-titulo">Cómo llegar</h2>
                        {direccionCompleta && <p className="cp-seccion-sub">{direccionCompleta}</p>}
                      </div>
                    </div>
                    <div
                      className="contacto-mapa"
                      dangerouslySetInnerHTML={{ __html: empresa.google_maps_embed }}
                    />
                  </section>
                )}
              </div>

              {/* ── Horario + accesos rápidos ── */}
              <div className="col-lg-5">
                <section className="cp-seccion">
                  <div className="cp-seccion-cabecera">
                    <span className="cp-seccion-icono">
                      <i className="bi bi-clock-fill" />
                    </span>
                    <div>
                      <h2 className="cp-seccion-titulo">Horario</h2>
                      {apertura && (
                        <span className={`contacto-estado ${apertura.abierto ? "abierto" : ""}`}>
                          <span className="punto" />
                          {apertura.abierto
                            ? `Abierto ahora${apertura.cierra_a ? ` · hasta las ${apertura.cierra_a}` : ""}`
                            : apertura.proxima_apertura
                              ? `Cerrado · abrimos a las ${apertura.proxima_apertura}`
                              : "Cerrado ahora"}
                        </span>
                      )}
                    </div>
                  </div>

                  {horario.length === 0 ? (
                    <p className="cp-ayuda mb-0">Consúltanos el horario.</p>
                  ) : (
                    <ul className="contacto-horario">
                      {horario.map((dia) => (
                        <li key={dia.dia_semana} className={dia.dia_semana === hoy ? "hoy" : ""}>
                          <span className="dia">
                            {dia.dia_nombre}
                            {dia.dia_semana === hoy && <small> · hoy</small>}
                          </span>
                          <span className={dia.cerrado ? "horas cerrado" : "horas"}>
                            {dia.cerrado
                              ? "Cerrado"
                              : dia.franjas.map((f) => `${f.apertura} – ${f.cierre}`).join(", ")}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section className="contacto-cta mt-3">
                  <h2>¿Te apetece una pizza?</h2>
                  <p>Pide online en un par de minutos o sigue tu pedido en directo.</p>
                  <div className="d-flex flex-wrap gap-2">
                    <Link to="/shop" className="contacto-cta-btn principal">
                      <i className="bi bi-book-half" />
                      Ver la carta
                    </Link>
                    <Link to="/pedido" className="contacto-cta-btn">
                      <i className="bi bi-geo-alt-fill" />
                      Seguir mi pedido
                    </Link>
                  </div>
                </section>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .contacto-pagina { background: #fff8f1; }
        .contacto-pagina.section-padding { padding: 48px 0 80px; }
        .contacto-pagina h2 { text-transform: none; }

        .contacto-canal {
          display: flex;
          align-items: center;
          gap: 0.9rem;
          padding: 0.9rem 1rem;
          border-radius: 18px;
          border: 1px solid #f3e3d6;
          background: #fffaf5;
          color: inherit !important;
          text-decoration: none;
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .contacto-canal:hover {
          transform: translateY(-2px);
          border-color: #fc791a;
          box-shadow: 0 10px 22px rgba(252, 121, 26, 0.15);
        }
        .contacto-canal-icono {
          flex-shrink: 0;
          width: 50px;
          height: 50px;
          border-radius: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 1.3rem;
          box-shadow: 0 6px 14px rgba(0, 0, 0, 0.12);
        }
        .contacto-canal-titulo { font-size: 0.78rem; font-weight: 700; color: #8a7a6e; text-transform: uppercase; letter-spacing: 0.4px; }
        .contacto-canal-valor { font-weight: 800; color: #1b1b1b; overflow-wrap: anywhere; line-height: 1.3; }
        .contacto-canal-accion {
          margin-left: auto;
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.82rem;
          font-weight: 700;
          color: #eb0029;
        }

        .contacto-nota {
          display: flex;
          gap: 0.6rem;
          margin-top: 1rem;
          padding: 0.8rem 1rem;
          border-radius: 14px;
          background: #fff4e5;
          border: 1px dashed #f5c48f;
          color: #7a4a00;
          font-size: 0.88rem;
          line-height: 1.45;
          white-space: pre-line;
        }
        .contacto-nota i { color: #fc791a; margin-top: 0.1rem; }

        .contacto-red {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #fff !important;
          transition: transform 0.2s ease;
        }
        .contacto-red:hover { transform: translateY(-2px); }

        .contacto-mapa { border-radius: 16px; overflow: hidden; height: 360px; }
        .contacto-mapa iframe { width: 100% !important; height: 100% !important; border: 0; }

        .contacto-estado {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          margin-top: 0.25rem;
          padding: 0.15rem 0.65rem;
          border-radius: 999px;
          background: #f6f1ec;
          color: #8a7a6e;
          font-size: 0.78rem;
          font-weight: 700;
        }
        .contacto-estado .punto { width: 7px; height: 7px; border-radius: 50%; background: #e5534b; }
        .contacto-estado.abierto { background: #e6f6ec; color: #198754; }
        .contacto-estado.abierto .punto { background: #22c55e; }

        .contacto-horario { list-style: none; margin: 0; padding: 0; }
        .contacto-horario li {
          display: flex;
          justify-content: space-between;
          gap: 0.75rem;
          padding: 0.55rem 0.75rem;
          border-radius: 12px;
          font-size: 0.9rem;
        }
        .contacto-horario li + li { border-top: 1px dashed #f3e3d6; }
        .contacto-horario .dia { font-weight: 700; color: #3a2e27; white-space: nowrap; }
        .contacto-horario .horas { color: #c8590a; font-weight: 600; text-align: right; }
        .contacto-horario .horas.cerrado { color: #b9aca2; }
        .contacto-horario li.hoy { background: #fff1e4; border-top-color: transparent; }
        .contacto-horario li.hoy + li { border-top-color: transparent; }
        .contacto-horario li.hoy small { color: #fc791a; font-weight: 700; }

        .contacto-cta {
          padding: 1.4rem;
          border-radius: 22px;
          background: linear-gradient(140deg, #eb0029, #fc791a);
          color: #fff;
          box-shadow: 0 12px 30px rgba(235, 0, 41, 0.25);
        }
        .contacto-cta h2 { color: #fff; font-size: 1.3rem; font-weight: 800; margin: 0 0 0.3rem; }
        .contacto-cta p { color: rgba(255, 255, 255, 0.92); font-size: 0.9rem; line-height: 1.45; margin-bottom: 1rem; }
        .contacto-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.65rem 1.1rem;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.7);
          color: #fff !important;
          font-weight: 700;
          font-size: 0.9rem;
          text-decoration: none;
          transition: transform 0.2s ease, background-color 0.2s ease;
        }
        .contacto-cta-btn:hover { transform: translateY(-2px); background: rgba(255, 255, 255, 0.15); }
        .contacto-cta-btn.principal { background: #fff; border-color: #fff; color: #eb0029 !important; }
        .contacto-cta-btn.principal:hover { background: #fff; }

        @media (max-width: 575px) {
          .contacto-canal-accion span, .contacto-canal-accion { font-size: 0; gap: 0; }
          .contacto-canal-accion i { font-size: 1rem; }
          .contacto-mapa { height: 260px; }
        }
      `}</style>
    </>
  );
}
