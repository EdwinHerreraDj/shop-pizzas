import { Link } from "react-router-dom";
import { usePaginasLegales } from "../../hooks/usePaginaLegal";
import useHorarioSemanal from "../../hooks/useHorarioSemanal";
import useEmpresa from "../../hooks/useEmpresa";

const Footer1 = () => {
    const date = new Date();
    const year = date.getFullYear();
    const { data: paginasLegales = [] } = usePaginasLegales();
    const { data: horario = [], isLoading: cargandoHorario } = useHorarioSemanal();
    const { data: empresa } = useEmpresa();

    const direccionCompleta = [
        empresa?.direccion,
        empresa?.codigo_postal,
        empresa?.ciudad,
    ]
        .filter(Boolean)
        .join(", ");


    return (
        <footer className="footer-section bg-title fix">
            <div className="footer-widgets-wrapper">
                <div className="shape1 float-bob-y d-none d-xxl-block"><img src="/assets/img/shape/footerShape1_1.png"
                    alt="shape" /></div>
                <div className="shape2 d-none d-xxl-block"><img src="/assets/img/shape/footerShape1_2.png" alt="shape" /></div>
                <div className="shape3 d-none d-xxl-block"><img src="/assets/img/shape/footerShape1_3.png" alt="shape" /></div>
                <div className="shape4  d-none d-xxl-block"><img src="/assets/img/shape/footerShape1_4.png" alt="shape" /></div>
                <div className="container">
                    <div className="footer-top">
                        <div className="row gy-4">
                            {direccionCompleta && (
                                <div className="col-lg-4">
                                    <div className="fancy-box">
                                        <div className="item1"><i className="bi bi-geo-alt-fill"></i></div>
                                        <div className="item2">
                                            <h6>Dirección</h6>
                                            <p>{direccionCompleta}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {empresa?.email && (
                                <div className="col-lg-4 d-flex justify-content-start justify-content-lg-end">
                                    <div className="fancy-box">
                                        <div className="item1"><i className="bi bi-envelope-fill"></i></div>
                                        <div className="item2">
                                            <h6>Email</h6>
                                            <p>{empresa.email}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {empresa?.telefono && (
                                <div className="col-lg-4 d-flex justify-content-start justify-content-lg-end">
                                    <div className="fancy-box">
                                        <div className="item1"><i className="bi bi-telephone-fill"></i></div>
                                        <div className="item2">
                                            <h6>Domicilios</h6>
                                            <p>{empresa.telefono}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="row gy-4">
                        {/* Marca */}
                        <div className="col-lg-5 col-md-6 wow fadeInUp" data-wow-delay=".2s">
                            <div className="single-footer-widget">
                                <div className="widget-head">
                                    <Link to="/">
                                        <img src="/assets/img/logo/logo.png" alt="logo-img" />
                                    </Link>
                                </div>
                                <div className="footer-content">
                                    <p>
                                        {empresa?.descripcion ||
                                            "En Casa de Campo llevamos más de 30 años ofreciendo pizzas artesanas, elaboradas con masa fresca, ingredientes de calidad y todo el sabor de la tradición."}
                                    </p>
                                    <div className="social-icon d-flex align-items-center">
                                        {empresa?.facebook && (
                                            <a
                                                href={empresa.facebook}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <i className="bi bi-facebook"></i>
                                            </a>
                                        )}
                                        {empresa?.instagram && (
                                            <a
                                                href={empresa.instagram}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <i className="bi bi-instagram"></i>
                                            </a>
                                        )}
                                        {empresa?.whatsapp && (
                                            <a
                                                href={`https://wa.me/${empresa.whatsapp.replace(/\D/g, "")}`}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <i className="bi bi-whatsapp"></i>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Alérgenos */}
                        <div className="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay=".4s">
                            <div className="single-footer-widget">
                                <div className="widget-head">
                                    <h3>
                                        <i className="bi bi-exclamation-triangle-fill me-2" style={{ color: "#fc791a" }} />
                                        Alérgenos
                                    </h3>
                                </div>
                                <div className="footer-content">
                                    <p style={{ fontSize: "0.9rem", lineHeight: 1.6 }}>
                                        Cumplimos con la normativa europea sobre información al consumidor. Si tienes alergias o intolerancias alimentarias, consulta la información completa o pregúntanos antes de pedir.
                                    </p>
                                    <Link
                                        to="/legal/alergenos"
                                        className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill text-decoration-none fw-semibold mt-2"
                                        style={{
                                            backgroundColor: "#fc791a",
                                            color: "#fff",
                                            fontSize: "0.85rem",
                                        }}
                                    >
                                        <i className="bi bi-info-circle" />
                                        Ver información de alérgenos
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Horario */}
                        <div className="col-lg-3 col-md-12 wow fadeInUp" data-wow-delay=".6s">
                            <div className="single-footer-widget">
                                <div className="widget-head">
                                    <h3>
                                        <i className="bi bi-clock-fill me-2" style={{ color: "#fc791a" }} />
                                        Horario
                                    </h3>
                                </div>
                                <ul className="list-area list-unstyled" style={{ fontSize: "0.9rem" }}>
                                    {cargandoHorario ? (
                                        <li className="text-muted small">Cargando...</li>
                                    ) : horario.length === 0 ? (
                                        <li className="text-muted small">Consúltanos el horario</li>
                                    ) : (
                                        horario.map((dia) => (
                                            <li
                                                key={dia.dia_semana}
                                                className="mb-2 d-flex justify-content-between align-items-center"
                                            >
                                                <span>{dia.dia_nombre}</span>
                                                <span className="text-theme-color2 ms-2">
                                                    {dia.cerrado
                                                        ? "Cerrado"
                                                        : dia.franjas
                                                              .map(
                                                                  (f) =>
                                                                      `${f.apertura} – ${f.cierre}`,
                                                              )
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
                    <div className="footer-wrapper d-flex flex-column flex-lg-row align-items-center justify-content-between gap-3 text-center text-lg-start py-3">
                        <p
                            className="wow fadeInLeft mb-0"
                            data-wow-delay=".3s"
                            style={{ fontSize: "0.9rem" }}
                        >
                            © Todos los derechos reservados {year} by{" "}
                            <span className="text-theme-color2">
                                {empresa?.nombre || "Pizzería Casa de Campo"}
                            </span>
                            {empresa?.cif && (
                                <span className="text-muted ms-2">
                                    · CIF: {empresa.cif}
                                </span>
                            )}
                        </p>

                        {paginasLegales.length > 0 && (
                            <ul
                                className="wow fadeInRight d-flex flex-wrap justify-content-center align-items-center mb-0 list-unstyled gap-2 gap-md-3"
                                data-wow-delay=".5s"
                            >
                                {paginasLegales.map((pagina, idx) => (
                                    <li
                                        key={pagina.slug}
                                        className="d-flex align-items-center"
                                    >
                                        <Link
                                            to={`/legal/${pagina.slug}`}
                                            className="text-white text-decoration-none legal-link"
                                            style={{
                                                fontSize: "0.85rem",
                                                opacity: 0.85,
                                                transition: "opacity 0.2s",
                                                whiteSpace: "nowrap",
                                            }}
                                            onMouseEnter={(e) =>
                                                (e.currentTarget.style.opacity = 1)
                                            }
                                            onMouseLeave={(e) =>
                                                (e.currentTarget.style.opacity = 0.85)
                                            }
                                        >
                                            {pagina.titulo}
                                        </Link>
                                        {idx < paginasLegales.length - 1 && (
                                            <span
                                                className="text-white ms-2 ms-md-3 d-none d-sm-inline"
                                                style={{ opacity: 0.3 }}
                                            >
                                                ·
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer1;