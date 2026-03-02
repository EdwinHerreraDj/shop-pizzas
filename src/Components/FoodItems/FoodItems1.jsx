import { Link } from "react-router-dom";
import Slider from "react-slick";

const FoodItems1 = () => {

  const settings = {
    dots: false,
    infinite: true,
    speed: 2000,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false,
    swipeToSlide: true,
    autoplay: true,
    autoplaySpeed: 4000,
    responsive: [
      {
        breakpoint: 1399,
        settings: {
          slidesToShow: 4,
        }
      },
      {
        breakpoint: 1199,
        settings: {
          slidesToShow: 2,
        }
      }, {
        breakpoint: 575,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };

  const foodItems = [
    {
      img: '/assets/img/food-items/item1_1.png',
      title: 'Pizza Barbacoa',
      content: 'Mozzarella, salsa barbacoa, bacon, carne y emmental',
      price: '8,50 €'
    },
    {
      img: '/assets/img/food-items/item1_2.png',
      title: 'Pizza Carbonara',
      content: 'Mozzarella, salsa carbonara, bacon y champiñón',
      price: '8,50 €'
    },
    {
      img: '/assets/img/food-items/item1_3.png',
      title: 'Pizza 4 Quesos',
      content: 'Mozzarella, queso azul, roquefort y emmental',
      price: '7,50 €'
    },
    {
      img: '/assets/img/food-items/item1_4.png',
      title: 'Pizza Especial',
      content: 'Atún, jamón york, salami, champiñón, anchoas y más',
      price: '7,50 €'
    },
    {
      img: '/assets/img/food-items/item1_1.png',
      title: 'Pizza Ibérica',
      content: 'Chorizo ibérico, jamón serrano y mozzarella extra',
      price: '7,50 €'
    },
    {
      img: '/assets/img/food-items/item1_2.png',
      title: 'Pizza Hawaiana',
      content: 'Jamón york, piña y mozzarella extra',
      price: '7,50 €'
    },
    {
      img: '/assets/img/food-items/item1_3.png',
      title: 'Pizza Marinera',
      content: 'Jamón york, atún, huevo duro, gambas y anchoas',
      price: '9,00 €'
    },
    {
      img: '/assets/img/food-items/item1_4.png',
      title: 'Pizza Caprichosa',
      content: 'Jamón york, salchicha ibérica, champiñón y aceitunas',
      price: '7,50 €'
    },
  ];


  return (
    <section className="best-food-items-section fix section-padding bg-color2">
      <div className="best-food-wrapper">
        <div className="shape1 float-bob-y d-none d-xxl-block"><img src="/assets/img/shape/bestFoodItemsShape1_1.png"
          alt="shape" /></div>
        <div className="shape2 float-bob-x d-none d-xxl-block"><img src="/assets/img/shape/bestFoodItemsShape1_2.png"
          alt="shape" /></div>
        <div className="container">
          <div className="title-area">
            <div className="sub-title text-center wow fadeInUp" data-wow-delay="0.5s">
              <img className="me-1" src="/assets/img/icon/titleIcon.svg" alt="icon" />Casa de campo <img
                src="/assets/img/icon/titleIcon.svg" alt="icon" />
            </div>
            <h2 className="title wow fadeInUp" data-wow-delay="0.7s">
              Pizzas mas populares
            </h2>
          </div>
          <div className="slider-area mb-n40">
            <div className="swiper bestFoodItems-slider">
              <div className="swiper-wrapper cs_slider_gap_301 food-slider-item">
                <Slider {...settings}>
                  {foodItems.map((item, i) => (
                    <div key={i} className="swiper-slide">
                      <div className="single-food-items">
                        <div className="item-thumb">
                          <img src={item.img} alt="thumb" />
                          <div className="circle-shape"><img className="cir36"
                            src="/assets/img/food-items/circleShape.png" alt="shape" /></div>
                        </div>
                        <div className="item-content">
                          <Link to="/menu">
                            <h3>{item.title}</h3>
                          </Link>
                          <div className="text ">{item.content}</div>
                          <h6>{item.price}</h6>
                        </div>
                      </div>
                    </div>
                  ))}
                </Slider>

              </div>
            </div>

            <div className="bestFoodItems-pagination"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FoodItems1;