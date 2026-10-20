import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import CartDrawer from '../Shop/CartDrawer';
import { useCarrito } from '../../context/CarritoContext';

/**
 * Item del carrito con dropdown que se abre al hacer hover o click,
 * y se cierra al sacar el cursor o al hacer click fuera.
 */
function CarritoMenu({ setMobileToggle }) {
  const { carrito } = useCarrito();
  const [abierto, setAbierto] = useState(false);
  const wrapperRef = useRef(null);
  const cerrarTimeout = useRef(null);
  const location = useLocation();

  // Cerrar al cambiar de ruta
  useEffect(() => {
    setAbierto(false);
  }, [location.pathname]);

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

  // Hover: abrir; salir: cerrar tras pequeño delay para permitir mover el cursor
  const onMouseEnter = () => {
    if (cerrarTimeout.current) clearTimeout(cerrarTimeout.current);
    setAbierto(true);
  };

  const onMouseLeave = () => {
    cerrarTimeout.current = setTimeout(() => setAbierto(false), 200);
  };

  const onClick = (e) => {
    e.preventDefault();
    setAbierto((v) => !v);
    setMobileToggle?.(false);
  };

  return (
    <li
      ref={wrapperRef}
      className="position-relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Link to="#" onClick={onClick}>
        <i className="bi bi-cart4"></i> Carrito
        {carrito.length > 0 && (
          <span className="badge bg-danger ms-2">{carrito.length}</span>
        )}
      </Link>

      {abierto && (
        <div
          className="position-absolute end-0"
          style={{
            top: "calc(100% + 8px)",
            zIndex: 1050,
          }}
        >
          <CartDrawer />
        </div>
      )}
    </li>
  );
}

export default function Nav({ setMobileToggle }) {
  return (
    <ul className="cs_nav_list fw-medium">
      <li>
        <Link to="/" onClick={() => setMobileToggle(false)}>
          Inicio
        </Link>
      </li>

      <li>
        <Link to="/contacto" onClick={() => setMobileToggle(false)}>
          Contacto
        </Link>
      </li>

      <CarritoMenu setMobileToggle={setMobileToggle} />
    </ul>
  );
}
