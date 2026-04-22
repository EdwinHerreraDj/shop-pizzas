import Slider from "react-slick";

const HeroBanner1 = () => {
    const irAPizzas = (e) => {
        e.preventDefault();
        const el = document.getElementById("pizzas");
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };


    const settings = {
        dots: false,
        infinite: true,
        speed: 2000,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        swipeToSlide: true,
        autoplay: true,
        autoplaySpeed: 4000,
        responsive: [
            {
                breakpoint: 1399,
                settings: {
                    slidesToShow: 1,
                }
            },
            {
                breakpoint: 1199,
                settings: {
                    slidesToShow: 1,
                }
            }, {
                breakpoint: 575,
                settings: {
                    slidesToShow: 1,
                }
            }
        ]
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



    return (
        <section className="banner-section fix">
            <div className="slider-area">
                <div className="swiper banner-slider">
                    <div className="swiper-wrapper">

                        <Slider {...settings}>
                            {heroContent.map((item, i) => (
                                <div key={i} className="swiper-slide">
                                    <div className="banner-wrapper style1 bg-img">
                                        <div className="shape1_1 d-none d-xxl-block" data-animation="slideInLeft" data-duration="2s"
                                            data-delay=".3s"><img src="/assets/img/shape/bannerShape1_1.svg" alt="shape" /></div>
                                        <div className="shape1_2 d-none d-xxl-block" data-animation="slideInLeft" data-duration="2s"
                                            data-delay=".3s"><img src="/assets/img/shape/bannerShape1_2.svg" alt="shape" /></div>
                                        <div className="shape1_3 d-none d-xxl-block" data-animation="slideInLeft" data-duration="3s"
                                            data-delay="2s"><img src="/assets/img/shape/bannerShape1_3.svg" alt="shape" /></div>
                                        <div className="shape1_4 d-none d-xxl-block" data-animation="slideInLeft" data-duration="2s"
                                            data-delay=".3s"><img src="/assets/img/shape/bannerShape1_4.svg" alt="shape" /></div>
                                        <div className="shape1_5 d-none d-xxl-block" data-animation="slideInLeft" data-duration="2s"
                                            data-delay=".3s"><img src="/assets/img/shape/bannerShape1_5.svg" alt="shape" /></div>
                                        <div className="shape1_6 d-none d-xxl-block cir36"><img
                                            src="/assets/img/shape/bannerShape1_6.svg" alt="shape" /></div>
                                        <div className="overlay"></div>
                                        <div className="banner-container">
                                            <div className="container">
                                                <div className="row">
                                                    <div className="col-12 col-xxl-6">
                                                        <div className="banner-title-area">
                                                            <div className="banner-style1">
                                                                <div className="section-title">
                                                                    <h6 className="sub-title" data-animation="slideInRight"
                                                                        data-duration="2s" data-delay=".3s"> {item.subtitle} </h6>
                                                                    <h1 className="title" data-animation="slideInRight"
                                                                        data-duration="2s" data-delay=".5s">
                                                                        {item.title}
                                                                    </h1>
                                                                    <a
                                                                        className="theme-btn btn-pedido-hero"
                                                                        href="#pizzas"
                                                                        onClick={irAPizzas}
                                                                        data-animation="slideInRight"
                                                                        data-duration="2s"
                                                                        data-delay=".7s"
                                                                        style={{
                                                                            fontSize: "1.2rem",
                                                                            padding: "18px 44px",
                                                                            fontWeight: 700,
                                                                            letterSpacing: "0.3px",
                                                                            boxShadow:
                                                                                "0 10px 30px rgba(235, 0, 41, 0.35)",
                                                                        }}
                                                                    >
                                                                        {item.btnname}{" "}
                                                                        <i
                                                                            className="bi bi-arrow-down-circle ms-1"
                                                                            style={{ fontSize: "1.3rem" }}
                                                                        />
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-12 col-xl-6 d-none d-xxl-block">
                                                        <div className="banner-thumb-area" data-tilt data-animation="slideInRight"
                                                            data-duration="2s" data-delay=".9s">
                                                            <img src={item.img} alt="shape" />
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

                    <div className="arrow-prev"><img src="/assets/img/icon/arrowPrev.svg" alt="Icon" /></div>
                    <div className="arrow-next"><img src="/assets/img/icon/arrowNext.svg" alt="Icon" /></div>
                    <div className="pagination-className swiper-pagination"></div>
                </div>
            </div>
        </section>
    );
};

export default HeroBanner1;