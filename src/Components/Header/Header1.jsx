import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Nav from './Nav';
import MarqueeInfo from './MarqueeInfo';
import CarritoBoton from './CarritoBoton';

export default function Header1({ variant }) {
  const [mobileToggle, setMobileToggle] = useState(false);
  const [isSticky, setIsSticky] = useState();
  const [prevScrollPos, setPrevScrollPos] = useState(0);

  // El header es fixed: el espaciador debe medir lo mismo que él. La altura
  // cambia si el marquee no tiene cards (desaparece) o según el ancho de pantalla,
  // así que la medimos en vez de usar la altura fija del CSS (136px).
  const headerRef = useRef(null);
  const [alturaHeader, setAlturaHeader] = useState(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => setAlturaHeader(header.offsetHeight));
    observer.observe(header);
    return () => observer.disconnect();
  }, []);


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
        ref={headerRef}
        className={`cs_site_header header_style_2 cs_style_1 header_sticky_style1 ${
          variant || ''
        } cs_sticky_header cs_site_header_full_width ${
          mobileToggle ? 'cs_mobile_toggle_active' : ''
        } ${isSticky || ''}`}
      >
        <MarqueeInfo />

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

              <div className="cs_main_header_right con-carrito">
                <CarritoBoton />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div
        className="cs_site_header_spacing_130"
        style={alturaHeader ? { height: alturaHeader } : undefined}
      ></div>

      
    </>
  );
}
