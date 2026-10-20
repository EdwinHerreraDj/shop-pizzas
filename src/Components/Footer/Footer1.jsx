import { Link } from "react-router-dom";
import { usePaginasLegales } from "../../hooks/usePaginaLegal";
import useHorarioSemanal from "../../hooks/useHorarioSemanal";
import useEmpresa from "../../hooks/useEmpresa";
import useAbiertoAhora from "../../hooks/useAbiertoAhora";

const ENLACES_RAPIDOS = [
    { to: "/", texto: "Inicio", icono: "bi-house-door" },
    { to: "/shop", texto: "Nuestra carta", icono: "bi-book" },
    { to: "/shop/cart", texto: "Mi carrito", icono: "bi-basket2" },
    { to: "/pedido", texto: "Seguir mi pedido", icono: "bi-geo-alt" },
    { to: "/contacto", texto: "Contacto", icono: "bi-chat-dots" },
];

// dia_semana del backend: 0 = lunes … 6 = domingo. getDay(): 0 = domingo.
const indiceHoy = () => (new Date().getDay() + 6) % 7;

/** Tarjeta de contacto pulsable (mapa, mailto, tel, WhatsApp). */
function TarjetaContacto({ href, icono, titulo, valor, externo = false }) {
    return (
        <div className="col-sm-6 col-lg-3">
            <a
                href={href}
                className="footer-contacto"
                {...(externo ? { target: "_blank", rel: "noreferrer" } : {})}
            >
                <span className="footer-contacto-icono">
                    <i className={`bi ${icono}`} />
                </span>
                <span className="d-flex flex-column" style={{ minWidth: 0 }}>
                    <span className="footer-contacto-titulo">{titulo}</span>
                    <span className="footer-contacto-valor">{valor}</span>
                </span>
            </a>
        </div>
    );
}

const Footer1 = () => {
    const year = new Date().getFullYear();
    const { data: paginasLegales = [] } = usePaginasLegales();
    const { data: horario = [], isLoading: cargandoHorario } = useHorarioSemanal();
    const { data: empresa } = useEmpresa();
    const { data: apertura } = useAbiertoAhora();
    const hoy = indiceHoy();

    const direccionCompleta = [
        empresa?.direccion,
        empresa?.codigo_postal,
        empresa?.ciudad,
    ]
        .filter(Boolean)
        .join(", ");

    const whatsapp = empresa?.whatsapp?.replace(/\D/g, "");

    const redes = [
        empresa?.facebook && { href: empresa.facebook, icono: "bi-facebook", nombre: "Facebook" },
        empresa?.instagram && { href: empresa.instagram, icono: "bi-instagram", nombre: "Instagram" },
        whatsapp && { href: `https://wa.me/${whatsapp}`, icono: "bi-whatsapp", nombre: "WhatsApp" },
    ].filter(Boolean);

    return (
        <footer className="footer-section bg-title fix">
            <div className="footer-widgets-wrapper">
                <div className="shape1 float-bob-y d-none d-xxl-block"><img src="/assets/img/shape/footerShape1_1.png"
                    alt="" loading="lazy" /></div>
                <div className="shape2 d-none d-xxl-block"><img src="/assets/img/shape/footerShape1_2.webp" alt="" loading="lazy" /></div>
                <div className="shape3 d-none d-xxl-block"><img src="/assets/img/shape/footerShape1_3.webp" alt="" loading="lazy" /></div>
                <div className="shape4  d-none d-xxl-block"><img src="/assets/img/shape/footerShape1_4.png" alt="" loading="lazy" /></div>
                <div className="container">
                    {/* Contacto: solo los datos configurados en el panel */}
                    {(direccionCompleta || empresa?.email || empresa?.telefono || whatsapp) && (
                        <div className="row g-3 mb-2">
                            {direccionCompleta && (
                                <TarjetaContacto
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccionCompleta)}`}
                                    icono="bi-geo-alt-fill"
                                    titulo="Dirección"
                                    valor={direccionCompleta}
                                    externo
                                />
                            )}
                            {empresa?.telefono && (
                                <TarjetaContacto
                                    href={`tel:${empresa.telefono.replace(/\s/g, "")}`}
                                    icono="bi-telephone-fill"
                                    titulo="Pedidos por teléfono"
                                    valor={empresa.telefono}
                                />
                            )}
                            {whatsapp && (
                                <TarjetaContacto
                                    href={`https://wa.me/${whatsapp}`}
                                    icono="bi-whatsapp"
                                    titulo="WhatsApp"
                                    valor={empresa.whatsapp}
                                    externo
                                />
                            )}
                            {empresa?.email && (
                                <TarjetaContacto
                                    href={`mailto:${empresa.email}`}
                                    icono="bi-envelope-fill"
                                    titulo="Email"
                                    valor={empresa.email}
                                />
                            )}
                        </div>
                    )}

                    <div className="row gy-4">
                        {/* Marca */}
                        <div className="col-lg-4 col-md-6">
                            <div className="single-footer-widget">
                                <div className="widget-head">
                                    <Link to="/">
                                        <img src="/assets/img/logo/logo.png" alt={empresa?.nombre || "Pizzería Casa de Campo"} />
                                    </Link>
                                </div>
                                <div className="footer-content">
                                    <p className="footer-texto">
                                        {empresa?.descripcion ||
                                            "En Casa de Campo llevamos más de 30 años ofreciendo pizzas artesanas, elaboradas con masa fresca, ingredientes de calidad y todo el sabor de la tradición."}
                                    </p>
                                    {redes.length > 0 && (
                                        <div className="d-flex align-items-center gap-2 mt-3">
                                            {redes.map((r) => (
                                                <a
                                                    key={r.icono}
                                                    href={r.href}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    aria-label={r.nombre}
                                                    className="footer-red"
                                                >
                                                    <i className={`bi ${r.icono}`} />
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Enlaces rápidos */}
                        <div className="col-lg-2 col-md-6">
                            <div className="single-footer-widget">
                                <div className="widget-head">
                                    <h3>Enlaces</h3>
                                </div>
                                <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                                    {ENLACES_RAPIDOS.map((e) => (
                                        <li key={e.to}>
                                            <Link to={e.to} className="footer-enlace">
                                                <i className={`bi ${e.icono}`} />
                                                {e.texto}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Alérgenos */}
                        <div className="col-lg-3 col-md-6">
                            <div className="single-footer-widget">
                                <div className="widget-head">
                                    <h3>
                                        <i className="bi bi-exclamation-triangle-fill me-2" style={{ color: "#fc791a" }} />
                                        Alérgenos
                                    </h3>
                                </div>
                                <div className="footer-content">
                                    <p className="footer-texto">
                                        Cumplimos con la normativa europea sobre información al consumidor. Si tienes alergias o intolerancias alimentarias, consulta la información completa o pregúntanos antes de pedir.
                                    </p>
                                    <Link to="/legal/alergenos" className="footer-btn-alergenos">
                                        <i className="bi bi-info-circle" />
                                        Ver información de alérgenos
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Horario */}
                        <div className="col-lg-3 col-md-6">
                            <div className="single-footer-widget">
                                <div className="widget-head">
                                    <h3>
                                        <i className="bi bi-clock-fill me-2" style={{ color: "#fc791a" }} />
                                        Horario
                                    </h3>
                                </div>
                                {apertura && (
                                    <span className={`footer-estado ${apertura.abierto ? "abierto" : "cerrado"}`}>
                                        <span className="punto" />
                                        {apertura.abierto
                                            ? `Abierto ahora${apertura.cierra_a ? ` · hasta las ${apertura.cierra_a}` : ""}`
                                            : apertura.proxima_apertura
                                                ? `Cerrado · abrimos a las ${apertura.proxima_apertura}`
                                                : "Cerrado ahora"}
                                    </span>
                                )}
                                <ul className="list-unstyled mb-0 footer-horario">
                                    {cargandoHorario ? (
                                        <li className="footer-texto">Cargando...</li>
                                    ) : horario.length === 0 ? (
                                        <li className="footer-texto">Consúltanos el horario</li>
                                    ) : (
                                        horario.map((dia) => (
                                            <li
                                                key={dia.dia_semana}
                                                className={dia.dia_semana === hoy ? "hoy" : ""}
                                            >
                                                <span className="dia">
                                                    {dia.dia_nombre}
                                                    {dia.dia_semana === hoy && <small> · hoy</small>}
                                                </span>
                                                <span className={dia.cerrado ? "horas cerrado" : "horas"}>
                                                    {dia.cerrado
                                                        ? "Cerrado"
                                                        : dia.franjas
                                                            .map((f) => `${f.apertura} – ${f.cierre}`)
                                                            .join(", ")}
                                                </span>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="container">
                    <div className="d-flex flex-column flex-lg-row align-items-center justify-content-between gap-3 text-center text-lg-start py-3">
                        <p className="mb-0 text-white" style={{ fontSize: "0.9rem" }}>
                            © {year}{" "}
                            <strong>{empresa?.nombre || "Pizzería Casa de Campo"}</strong>
                            {" "}· Todos los derechos reservados
                            {empresa?.cif && (
                                <span className="d-block d-sm-inline ms-sm-2" style={{ opacity: 0.8, whiteSpace: "nowrap" }}>
                                    CIF: {empresa.cif}
                                </span>
                            )}
                        </p>

                        {paginasLegales.length > 0 && (
                            <ul className="d-flex flex-wrap justify-content-center justify-content-lg-end mb-0 list-unstyled footer-legales">
                                {paginasLegales.map((pagina) => (
                                    <li key={pagina.slug}>
                                        <Link to={`/legal/${pagina.slug}`}>{pagina.titulo}</Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .footer-texto {
                    color: rgba(255, 255, 255, 0.75);
                    font-size: 0.9rem;
                    line-height: 1.65;
                }

                /* Tarjetas de contacto */
                .footer-contacto {
                    display: flex;
                    align-items: center;
                    gap: 0.9rem;
                    height: 100%;
                    padding: 1rem 1.1rem;
                    border-radius: 14px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: #fff !important;
                    text-decoration: none;
                    transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
                }
                .footer-contacto:hover {
                    border-color: #fc791a;
                    background: rgba(252, 121, 26, 0.1);
                    transform: translateY(-2px);
                }
                .footer-contacto-icono {
                    flex-shrink: 0;
                    width: 46px;
                    height: 46px;
                    border-radius: 50%;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #eb0029, #fc791a);
                    font-size: 1.15rem;
                    color: #fff;
                }
                .footer-contacto-titulo {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.6px;
                    color: rgba(255, 255, 255, 0.6);
                }
                .footer-contacto-valor {
                    font-weight: 600;
                    font-size: 0.95rem;
                    color: #fff;
                    overflow-wrap: anywhere;
                }

                /* Redes */
                .footer-red {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255, 255, 255, 0.08);
                    color: #fff !important;
                    transition: background-color 0.2s ease;
                }
                .footer-red:hover { background: #fc791a; }

                /* Enlaces rápidos */
                .footer-enlace {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.55rem;
                    color: rgba(255, 255, 255, 0.8) !important;
                    font-size: 0.92rem;
                    text-decoration: none;
                    transition: color 0.2s ease, transform 0.2s ease;
                }
                .footer-enlace i { color: #fc791a; }
                .footer-enlace:hover { color: #fff !important; transform: translateX(3px); }

                .footer-btn-alergenos {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-top: 0.5rem;
                    padding: 0.55rem 1.1rem;
                    border-radius: 999px;
                    background: #fc791a;
                    color: #fff !important;
                    font-size: 0.85rem;
                    font-weight: 600;
                    text-decoration: none;
                    transition: background-color 0.2s ease;
                }
                .footer-btn-alergenos:hover { background: #e2650c; }

                /* Horario */
                .footer-estado {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.45rem;
                    margin-bottom: 0.9rem;
                    padding: 0.3rem 0.8rem;
                    border-radius: 999px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #fff;
                }
                .footer-estado.abierto { background: rgba(25, 135, 84, 0.85); }
                .footer-estado.cerrado { background: rgba(255, 255, 255, 0.1); }
                .footer-estado .punto {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #ff6b6b;
                }
                .footer-estado.abierto .punto { background: #7CFC9A; }

                .footer-horario li {
                    display: flex;
                    justify-content: space-between;
                    gap: 0.75rem;
                    padding: 0.35rem 0.6rem;
                    margin: 0 -0.6rem;
                    border-radius: 8px;
                    font-size: 0.88rem;
                }
                .footer-horario .dia { color: rgba(255, 255, 255, 0.85); white-space: nowrap; }
                .footer-horario .horas { color: #fc791a; text-align: right; }
                .footer-horario .horas.cerrado { color: rgba(255, 255, 255, 0.45); }
                .footer-horario li.hoy { background: rgba(252, 121, 26, 0.14); }
                .footer-horario li.hoy .dia { color: #fff; font-weight: 700; }
                .footer-horario li.hoy small { color: #fc791a; font-weight: 600; }

                /* Barra inferior: todo en blanco para que se lea sobre el rojo */
                .footer-legales { gap: 0.4rem 1.2rem; }
                .footer-legales a {
                    color: #fff !important;
                    font-size: 0.85rem;
                    opacity: 0.9;
                    text-decoration: none;
                    white-space: nowrap;
                }
                .footer-legales a:hover { opacity: 1; text-decoration: underline; }
            `}</style>
        </footer>
    );
};

export default Footer1;
