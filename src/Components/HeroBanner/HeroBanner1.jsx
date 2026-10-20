import { useRef } from "react";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import useAbiertoAhora from "../../hooks/useAbiertoAhora";
import useOpcionesEntrega from "../../hooks/useOpcionesEntrega";

const settings = {
    dots: false,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    swipeToSlide: true,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
};

const heroContent = [
    {
        img: '/assets/img/banner/bannerThumb1_1.png',
        subtitle: 'pizzería casa de campo',
        title: 'Pizzas artesanas únicas',
        btnname: 'Haz tu pedido'
    },
    {
        img: '/assets/img/banner/bannerThumb1_3.png',
        subtitle: 'pizzería casa de campo',
        title: 'Tu pizza caliente en minutos',
        btnname: 'Haz tu pedido'
    },
];

const chipBase = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    padding: "0.4rem 0.85rem",
    borderRadius: "999px",
    fontSize: "0.85rem",
    fontWeight: 600,
    lineHeight: 1.2,
    backdropFilter: "blur(6px)",
};

/** Abierto / cerrado ahora según las franjas horarias. */
function EstadoApertura() {
    const { data } = useAbiertoAhora();
    if (!data) return null;

    const abierto = data.abierto;
    const texto = abierto
        ? `Abierto ahora${data.cierra_a ? ` · hasta las ${data.cierra_a}` : ""}`
        : data.proxima_apertura
            ? `Cerrado ahora · abrimos a las ${data.proxima_apertura}`
            : "Cerrado ahora · puedes programar tu pedido";

    return (
        <span
            style={{
                ...chipBase,
                background: abierto ? "rgba(25, 135, 84, 0.85)" : "rgba(33, 37, 41, 0.75)",
                color: "#fff",
            }}
        >
            <span
                style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: abierto ? "#7CFC9A" : "#ff6b6b",
                    boxShadow: abierto ? "0 0 0 3px rgba(124, 252, 154, 0.3)" : "none",
                }}
            />
            {texto}
        </span>
    );
}

/** Opciones de entrega disponibles ahora mismo (según métodos de pago activos). */
function ChipEntrega({ icono, texto, disponible }) {
    return (
        <span
            title={disponible ? undefined : "No disponible en este momento"}
            style={{
                ...chipBase,
                background: disponible ? "rgba(255, 255, 255, 0.92)" : "rgba(33, 37, 41, 0.6)",
                color: disponible ? "#212529" : "rgba(255, 255, 255, 0.9)",
                border: disponible ? "none" : "1px dashed rgba(255, 255, 255, 0.5)",
            }}
        >
            <i className={`bi ${icono}`} style={{ color: disponible ? "#eb0029" : "inherit" }} />
            <span style={{ textDecoration: disponible ? "none" : "line-through" }}>{texto}</span>
            {!disponible && <span style={{ fontWeight: 400, fontSize: "0.75rem" }}>no disponible ahora</span>}
        </span>
    );
}

function InfoPedido() {
    const { cargado, domicilio, recogida } = useOpcionesEntrega();

    return (
        <div className="d-flex flex-wrap justify-content-center justify-content-lg-start gap-2 mb-4" role="status">
            <EstadoApertura />
            {cargado && (
                <>
                    <ChipEntrega icono="bi-scooter" texto="Envío a domicilio" disponible={domicilio} />
                    <ChipEntrega icono="bi-shop" texto="Recogida en tienda" disponible={recogida} />
                </>
            )}
        </div>
    );
}

const HeroBanner1 = () => {
    const sliderRef = useRef(null);

    const irAPizzas = (e) => {
        e.preventDefault();
        const el = document.getElementById("pizzas");
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <section className="banner-section fix">
            <div className="slider-area">
                <div className="swiper banner-slider">
                    <div className="swiper-wrapper">

                        <Slider ref={sliderRef} {...settings}>
                            {heroContent.map((item, i) => (
                                <div key={i} className="swiper-slide">
                                    <div className="banner-wrapper style1 bg-img">
                                        <div className="shape1_1 d-none d-xxl-block"><img src="/assets/img/shape/bannerShape1_1.svg" alt="" /></div>
                                        <div className="shape1_2 d-none d-xxl-block"><img src="/assets/img/shape/bannerShape1_2.svg" alt="" /></div>
                                        <div className="shape1_3 d-none d-xxl-block"><img src="/assets/img/shape/bannerShape1_3.svg" alt="" /></div>
                                        <div className="shape1_4 d-none d-xxl-block"><img src="/assets/img/shape/bannerShape1_4.svg" alt="" /></div>
                                        <div className="shape1_5 d-none d-xxl-block"><img src="/assets/img/shape/bannerShape1_5.svg" alt="" /></div>
                                        <div className="shape1_6 d-none d-xxl-block cir36"><img src="/assets/img/shape/bannerShape1_6.svg" alt="" /></div>
                                        <div className="overlay"></div>
                                        <div className="banner-container">
                                            <div className="container">
                                                <div className="row align-items-center">
                                                    <div className="col-12 col-lg-7 col-xxl-6">
                                                        <div className="banner-title-area">
                                                            <div className="banner-style1">
                                                                <div className="section-title">
                                                                    <h6 className="sub-title"> {item.subtitle} </h6>
                                                                    <h1
                                                                        className="title"
                                                                        style={{ textShadow: "0 4px 24px rgba(0, 0, 0, 0.45)" }}
                                                                    >
                                                                        {item.title}
                                                                    </h1>

                                                                    <InfoPedido />

                                                                    {/* Imagen también en móvil y tablet, más pequeña */}
                                                                    <div className="d-lg-none text-center mb-4">
                                                                        <img
                                                                            src={item.img}
                                                                            alt={item.title}
                                                                            className="d-block mx-auto"
                                                                            style={{ width: "100%", maxWidth: 240, height: "auto" }}
                                                                        />
                                                                    </div>

                                                                    <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start gap-3">
                                                                        <a
                                                                            className="hero-btn hero-btn-primario"
                                                                            href="#pizzas"
                                                                            onClick={irAPizzas}
                                                                        >
                                                                            {item.btnname}
                                                                            <i className="bi bi-arrow-down-circle-fill" />
                                                                        </a>
                                                                        <Link
                                                                            to="/pedido"
                                                                            className="hero-btn hero-btn-secundario"
                                                                        >
                                                                            <i className="bi bi-geo-alt-fill" />
                                                                            Seguir mi pedido
                                                                        </Link>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-5 col-xxl-6 d-none d-lg-block">
                                                        <div className="banner-thumb-area">
                                                            <img
                                                                src={item.img}
                                                                alt={item.title}
                                                                style={{ maxWidth: "100%", height: "auto" }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Slider>

                    </div>

                    {/* Flechas decorativas de la plantilla (visibles > 1600px), ahora funcionales */}
                    <button
                        type="button"
                        className="arrow-prev border-0 bg-transparent p-0"
                        aria-label="Anterior"
                        onClick={() => sliderRef.current?.slickPrev()}
                    >
                        <img src="/assets/img/icon/arrowPrev.svg" alt="" />
                    </button>
                    <button
                        type="button"
                        className="arrow-next border-0 bg-transparent p-0"
                        aria-label="Siguiente"
                        onClick={() => sliderRef.current?.slickNext()}
                    >
                        <img src="/assets/img/icon/arrowNext.svg" alt="" />
                    </button>
                </div>
            </div>

            {/* Botones propios del hero: alto contraste sobre la foto de fondo */}
            <style>{`
                .hero-btn {
                    position: relative;
                    z-index: 5;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.6rem;
                    padding: 17px 34px;
                    font-size: 1.1rem;
                    font-weight: 700;
                    letter-spacing: 0.3px;
                    line-height: 1.2;
                    text-decoration: none;
                    border: 2px solid transparent;
                    border-radius: 999px;
                    transition: background-color 0.25s ease, color 0.25s ease,
                        border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
                }
                .hero-btn i { font-size: 1.25rem; transition: color 0.25s ease; }
                .hero-btn:hover { transform: translateY(-2px); }
                .hero-btn:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }

                .hero-btn-primario {
                    background-color: #eb0029;
                    color: #fff !important;
                    box-shadow: 0 10px 30px rgba(235, 0, 41, 0.45);
                }
                .hero-btn-primario:hover {
                    background-color: #fff;
                    color: #eb0029 !important;
                    border-color: #fff;
                    box-shadow: 0 14px 34px rgba(0, 0, 0, 0.35);
                }

                .hero-btn-secundario {
                    background-color: #fff;
                    color: #1b1b1b !important;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                }
                .hero-btn-secundario i { color: #eb0029 !important; }
                .hero-btn-secundario:hover {
                    background-color: #111;
                    color: #fff !important;
                    border-color: #111;
                }
                .hero-btn-secundario:hover i { color: #fc791a !important; }

                @media (max-width: 575px) {
                    .hero-btn { padding: 15px 26px; font-size: 1rem; }
                }
            `}</style>
        </section>
    );
};

export default HeroBanner1;
