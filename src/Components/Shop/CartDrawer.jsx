import { Link } from "react-router-dom";
import { useCarrito } from "../../context/CarritoContext";
import usePrecios from "../../hooks/usePrecios";

export default function CartDropdown() {
  const { carrito, eliminarItem } = useCarrito();
  const { formatEUR } = usePrecios();

  const total = carrito.reduce((acc, item) => acc + (item.precioTotal || 0), 0);

  return (
    <ul className="dropdown-menu p-3 shadow rounded-3 border-0 show" style={{ width: "22rem" }}>
      {carrito.length > 0 ? (
        <>
          {carrito.map((item, index) => (
            <li
              key={index}
              className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-2"
            >
              <div className="d-flex align-items-center">
                {item.imagen && (
                  <img
                    src={item.imagen}
                    alt={item.nombre}
                    className="rounded me-3"
                    style={{ width: "48px", height: "48px", objectFit: "cover" }}
                  />
                )}
                <div>
                  <h6 className="mb-0 fw-semibold">{item.nombre}</h6>
                  <small className="text-muted">
                    {item.tamaño && `(${item.tamaño})`} — {formatEUR(item.precioTotal)}
                  </small>

                  {item.ingredientesExtras?.length > 0 && (
                    <ul className="text-muted small mb-0 ps-3">
                      {item.ingredientesExtras.map((i) => (
                        <li key={i.id}>+ {i.nombre}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => eliminarItem(index)}
                className="btn btn-link text-danger p-0"
                title="Eliminar"
              >
                <i className="bi bi-trash-fill fs-5"></i>
              </button>
            </li>
          ))}

          <li className="d-flex justify-content-between fw-semibold pt-2 border-top">
            <span>Total</span>
            <span>{formatEUR(total)}</span>
          </li>

          <li className="mt-3 d-flex gap-2">
            <Link to="/shop/cart" className="btn-ver-carrito w-50">
              Ver carrito
            </Link>
            <Link to="#" className="btn-finalizar-pedido w-50">
              Finalizar pedido
            </Link>
          </li>
        </>
      ) : (
        <li className="text-center py-3 text-muted small">
          Tu carrito está vacío 🍕
        </li>
      )}
    </ul>
  );
}
