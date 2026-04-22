import DropDown from './DropDown';
import { Link } from 'react-router-dom';
import CartDrawer from '../Shop/CartDrawer';
import { useCarrito } from '../../context/CarritoContext';

export default function Nav({ setMobileToggle }) {
  const { carrito, setCarrito, eliminarItem  } = useCarrito();

  // Función para eliminar un ítem del carrito por su índice

  const handleRemove = (index) => {
    const updated = carrito.filter((_, i) => i !== index);
    setCarrito(updated);
  };

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

      {/* Carrito */}
      <li className="menu-item-has-children position-relative">
        <Link to="#" onClick={(e) => e.preventDefault()}>
          <i className="bi bi-cart4"></i> Carrito
          {carrito.length > 0 && (
            <span className="badge bg-danger ms-2">{carrito.length}</span>
          )}
        </Link>

        <DropDown>
          <CartDrawer carrito={carrito} onRemove={eliminarItem} />
        </DropDown>
      </li>
    </ul>

  );
}
