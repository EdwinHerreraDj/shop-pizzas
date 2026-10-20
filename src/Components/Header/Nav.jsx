import { NavLink } from 'react-router-dom';

// El carrito ya no va en el menú: tiene su propio botón en la cabecera (CarritoBoton).
const ENLACES = [
  { to: '/', texto: 'Inicio', end: true },
  { to: '/shop', texto: 'Nuestra carta', end: true },
  { to: '/pedido', texto: 'Seguir mi pedido' },
  { to: '/contacto', texto: 'Contacto' },
];

export default function Nav({ setMobileToggle }) {
  return (
    <ul className="cs_nav_list fw-medium">
      {ENLACES.map((e) => (
        <li key={e.to}>
          <NavLink
            to={e.to}
            end={e.end}
            onClick={() => setMobileToggle(false)}
            className={({ isActive }) => (isActive ? 'nav-activo' : undefined)}
          >
            {e.texto}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}
