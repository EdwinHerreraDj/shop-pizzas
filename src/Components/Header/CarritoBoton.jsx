import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import CartDrawer from "../Shop/CartDrawer";
import { useCarrito } from "../../context/CarritoContext";
import usePrecios from "../../hooks/usePrecios";

// Por debajo de este ancho la plantilla usa el menú hamburguesa:
// el botón lleva a la página del carrito en lugar de abrir el desplegable.
const MEDIA_MOVIL = "(max-width: 1199px)";

function useEsMovil() {
  const [esMovil, setEsMovil] = useState(
    () => typeof window !== "undefined" && window.matchMedia(MEDIA_MOVIL).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(MEDIA_MOVIL);
    const onChange = (e) => setEsMovil(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return esMovil;
}

/**
 * Botón del carrito de la cabecera: icono, nº de unidades y total.
 * Escritorio: abre el desplegable (hover o click) y se cierra al salir,
 * al hacer click fuera o al cambiar de ruta. Móvil: enlace a /shop/cart.
 */
export default function CarritoBoton() {
  const { totalItems, totalCarrito } = useCarrito();
  const { formatEUR } = usePrecios();
  const esMovil = useEsMovil();
  const location = useLocation();

  const [abierto, setAbierto] = useState(false);
  const wrapperRef = useRef(null);
  const cerrarTimeout = useRef(null);

  // Pequeña animación del globo cada vez que aumentan las unidades
  const [rebote, setRebote] = useState(false);
  const unidadesPrevias = useRef(totalItems);
  useEffect(() => {
    if (totalItems > unidadesPrevias.current) {
      setRebote(true);
      const t = setTimeout(() => setRebote(false), 450);
      unidadesPrevias.current = totalItems;
      return () => clearTimeout(t);
    }
    unidadesPrevias.current = totalItems;
  }, [totalItems]);

  // Cerrar al cambiar de ruta o al pasar a móvil
  useEffect(() => {
    setAbierto(false);
  }, [location.pathname, esMovil]);

  // Click fuera → cerrar
  useEffect(() => {
    if (!abierto) return;
    const handleClickFuera = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, [abierto]);

  useEffect(() => () => clearTimeout(cerrarTimeout.current), []);

  const onMouseEnter = () => {
    if (esMovil) return;
    clearTimeout(cerrarTimeout.current);
    setAbierto(true);
  };

  // Pequeño retardo para poder mover el cursor hasta el desplegable
  const onMouseLeave = () => {
    if (esMovil) return;
    cerrarTimeout.current = setTimeout(() => setAbierto(false), 200);
  };

  const onClick = (e) => {
    if (esMovil) return; // en móvil el Link navega a /shop/cart
    e.preventDefault();
    setAbierto((v) => !v);
  };

  const vacio = totalItems === 0;
  const etiqueta = vacio
    ? "Carrito vacío"
    : `Carrito: ${totalItems} ${totalItems === 1 ? "producto" : "productos"}, ${formatEUR(totalCarrito)}`;

  return (
    <div
      ref={wrapperRef}
      className="carrito-boton-wrap"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Link
        to="/shop/cart"
        onClick={onClick}
        className={`carrito-boton ${abierto ? "abierto" : ""}`}
        aria-label={etiqueta}
        aria-expanded={esMovil ? undefined : abierto}
      >
        <span className="carrito-boton-icono">
          <i className={`bi ${vacio ? "bi-bag" : "bi-bag-check-fill"}`} />
          {!vacio && (
            <span className={`carrito-boton-globo ${rebote ? "rebote" : ""}`}>
              {totalItems > 99 ? "99+" : totalItems}
            </span>
          )}
        </span>
        <span className="carrito-boton-texto">
          <span className="carrito-boton-titulo">Mi pedido</span>
          <span className="carrito-boton-total">
            {vacio ? "Vacío" : formatEUR(totalCarrito)}
          </span>
        </span>
      </Link>

      {abierto && (
        <div className="carrito-boton-desplegable">
          <span className="carrito-boton-flecha" />
          <CartDrawer />
        </div>
      )}

      <style>{`
        .carrito-boton-wrap { position: relative; }

        .carrito-boton {
          display: inline-flex;
          align-items: center;
          gap: 0.7rem;
          padding: 0.5rem 1.1rem 0.5rem 0.55rem;
          border-radius: 999px;
          background: #eb0029;
          color: #fff !important;
          text-decoration: none;
          box-shadow: 0 8px 22px rgba(235, 0, 41, 0.35);
          transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
        }
        .carrito-boton:hover,
        .carrito-boton.abierto {
          background: #fff;
          color: #eb0029 !important;
          box-shadow: 0 10px 26px rgba(0, 0, 0, 0.35);
        }
        .carrito-boton:hover { transform: translateY(-1px); }
        .carrito-boton:focus-visible { outline: 3px solid #fc791a; outline-offset: 3px; }

        .carrito-boton-icono {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.18);
          font-size: 1.15rem;
          transition: background-color 0.2s ease;
        }
        .carrito-boton:hover .carrito-boton-icono,
        .carrito-boton.abierto .carrito-boton-icono { background: rgba(235, 0, 41, 0.1); }

        .carrito-boton-globo {
          position: absolute;
          top: -4px;
          right: -6px;
          min-width: 21px;
          height: 21px;
          padding: 0 5px;
          border-radius: 999px;
          background: #fc791a;
          color: #fff;
          border: 2px solid #111;
          font-size: 0.7rem;
          font-weight: 700;
          line-height: 17px;
          text-align: center;
        }
        .carrito-boton-globo.rebote { animation: carrito-rebote 0.45s ease; }
        @keyframes carrito-rebote {
          0% { transform: scale(1); }
          40% { transform: scale(1.35); }
          100% { transform: scale(1); }
        }

        .carrito-boton-texto { display: flex; flex-direction: column; line-height: 1.15; }
        .carrito-boton-titulo { font-size: 0.72rem; opacity: 0.85; text-transform: uppercase; letter-spacing: 0.5px; }
        .carrito-boton-total { font-size: 1rem; font-weight: 700; white-space: nowrap; }

        .carrito-boton-desplegable {
          position: absolute;
          right: 0;
          top: calc(100% + 14px);
          z-index: 1050;
        }
        .carrito-boton-flecha {
          position: absolute;
          top: -7px;
          right: 34px;
          width: 14px;
          height: 14px;
          transform: rotate(45deg);
          background: #eb0029;
          border-radius: 2px;
        }

        /* Página actual en el menú principal (Nav.jsx) */
        .cs_nav_list a.nav-activo { color: #fc791a !important; }

        /* La plantilla oculta esta zona en móvil: la mostramos junto a la hamburguesa */
        .cs_site_header.cs_style_1 .cs_main_header_right.con-carrito { display: flex; }

        @media (max-width: 575px) {
          .carrito-boton { padding: 0.35rem; gap: 0; box-shadow: none; }
          .carrito-boton-texto { display: none; }
        }
      `}</style>
    </div>
  );
}
