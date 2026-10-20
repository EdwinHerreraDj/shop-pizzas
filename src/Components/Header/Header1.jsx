import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Nav from './Nav';
import MarqueeInfo from './MarqueeInfo';
import CarritoBoton from './CarritoBoton';

export default function Header1({ variant }) {
  const [mobileToggle, setMobileToggle] = useState(false);
  const [oculta, setOculta] = useState(false);

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


  // Ocultar al bajar y mostrar al subir.
  // - Ignora el "rebote" de Safari en iPhone (scrollY negativo o más allá del
  //   final): antes ocultaba la cabecera un instante y se veía la página blanca.
  // - Umbral de unos píxeles para no parpadear con movimientos mínimos.
  // - Solo cambia el estado cuando de verdad pasa de visible a oculta.
  const ultimaPos = useRef(0);
  useEffect(() => {
    const UMBRAL = 8;
    let pendiente = false;

    const evaluar = () => {
      pendiente = false;
      const maximo = document.documentElement.scrollHeight - window.innerHeight;
      const y = Math.min(Math.max(window.scrollY, 0), Math.max(maximo, 0));
      const alto = headerRef.current?.offsetHeight ?? 120;
      const delta = y - ultimaPos.current;

      if (y <= alto) {
        setOculta(false);
      } else if (delta > UMBRAL) {
        setOculta(true);
      } else if (delta < -UMBRAL) {
        setOculta(false);
      } else {
        return; // movimiento mínimo: no actualizar la referencia
      }
      ultimaPos.current = y;
    };

    const onScroll = () => {
      if (!pendiente) {
        pendiente = true;
        requestAnimationFrame(evaluar);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        className={`cs_site_header header_style_2 cs_style_1 header_sticky_style1 ${
          variant || ''
        } cs_sticky_header cs_site_header_full_width ${
          mobileToggle ? 'cs_mobile_toggle_active' : ''
        } ${oculta && !mobileToggle ? 'cabecera-oculta' : ''}`}
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
