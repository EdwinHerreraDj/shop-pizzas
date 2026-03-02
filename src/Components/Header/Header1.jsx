import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Nav from './Nav';
import CartDrawer from '../Shop/CartDrawer';

export default function Header1({ variant }) {
  const [mobileToggle, setMobileToggle] = useState(false);
  const [isSticky, setIsSticky] = useState();
  const [prevScrollPos, setPrevScrollPos] = useState(0);

  

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      if (currentScrollPos > prevScrollPos) {
        setIsSticky('cs-gescout_sticky');
      } else if (currentScrollPos !== 0) {
        setIsSticky('cs-gescout_show cs-gescout_sticky'); 
      } else {
        setIsSticky();
      }
      setPrevScrollPos(currentScrollPos);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos]);

  return (
    <>
      <header
        className={`cs_site_header header_style_2 cs_style_1 header_sticky_style1 ${
          variant || ''
        } cs_sticky_header cs_site_header_full_width ${
          mobileToggle ? 'cs_mobile_toggle_active' : ''
        } ${isSticky || ''}`}
      >
        <div className="cs_top_header">
          <div className="container">
            <div className="cs_top_header_in">
              <div className="cs_top_header_left header-info">
                <ul className="cs_top_nav d-flex flex-wrap align-items-center cs_fs_12 text-white m-0 p-0">
                  <li>
                    <i className="bi bi-geo-alt-fill"></i>Paseo del Charcón, 13 Las Gabias (Granada)
                  </li>
                  <li><i className="bi bi-alarm"></i>9.00 am - 5.00 pm</li>
                </ul>
              </div>
              <div className="cs_top_header_right">
                <div className="cs_header_social_links_wrap">
                  <div className="cs_header_social_links top-header-social-icon">
                    Síguenos:
                    <ul>
                      <li><a href="#"><i className="bi bi-facebook"></i></a></li>
                      <li><a href="#"><i className="bi bi-twitter"></i></a></li>
                      <li><a href="#"><i className="bi bi-linkedin"></i></a></li>
                      <li><a href="#"><i className="bi bi-instagram"></i></a></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="cs_main_header">
          <div className="container">
            <div className="cs_main_header_in">
              <div className="cs_main_header_left">
                <Link className="cs_site_branding" to="/">
                  <img src="/assets/img/logo/logo.png" alt="Logo" />
                </Link>
              </div>

              <div className="cs_main_header_center">
                <div className="cs_nav cs_primary_font fw-medium">
                  <span
                    className={
                      mobileToggle
                        ? 'cs-munu_toggle cs_teggle_active'
                        : 'cs-munu_toggle'
                    }
                    onClick={() => setMobileToggle(!mobileToggle)}
                  >
                    <span></span>
                  </span>
                  <Nav setMobileToggle={setMobileToggle} />
                </div>
              </div>

              <div className="cs_main_header_right">
                <div className="header-btn d-flex align-items-center">
                  <div className="main-button">
                    <a
                      href="/shop/cart"
                      className="theme-btn flex items-center gap-3"
                    >
                      <i className="bi bi-basket2"></i>
                      Ver pedido
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="cs_site_header_spacing_130"></div>

      
    </>
  );
}
