import { Link } from "react-router-dom";
import { useCarrito } from "../../context/CarritoContext";
import usePrecios from "../../hooks/usePrecios";

export default function CartDropdown() {
  const { carrito, eliminarItem, totalCarrito } = useCarrito();
  const { formatEUR } = usePrecios();

  return (
    <ul
      className="dropdown-menu p-3 shadow rounded-3 border-0 show"
      style={{ width: "22rem", maxHeight: "70vh", overflowY: "auto" }}
    >
      {carrito.length > 0 ? (
        <>
          {carrito.map((item, index) => (
            <li
              key={item.uid ?? index}
              className="d-flex align-items-start justify-content-between border-bottom pb-2 mb-2"
            >
              <div className="flex-grow-1">
                {/* ── ARTÍCULO ── */}
                {item.tipo === "articulo" && (
                  <>
                    <h6 className="mb-0 fw-semibold">
                      {item.nombre}
                      {item.cantidad > 1 && (
                        <span className="text-muted fw-normal">
                          {" "}
                          x{item.cantidad}
                        </span>
                      )}
                    </h6>
                    <small className="text-muted">
                      {item.tamano && `${item.tamano} · `}
                      {formatEUR(item.precioTotal)}
                    </small>
                  </>
                )}

                {/* ── PIZZA ENTERA ── */}
                {item.tipo === "pizza-entera" && (
                  <>
                    <h6 className="mb-0 fw-semibold">
                      Pizza personalizada
                      {item.cantidad > 1 && (
                        <span className="text-muted fw-normal">
                          {" "}
                          x{item.cantidad}
                        </span>
                      )}
                    </h6>
                    <small className="text-muted">
                      {item.tamano && `${item.tamano} · `}
                      {formatEUR(item.precioTotal)}
                    </small>
                  </>
                )}

                {/* ── PIZZA MITADES ── */}
                {item.tipo === "pizza-mitades" && (
                  <>
                    <h6 className="mb-0 fw-semibold">
                      Pizza por mitades
                      {item.cantidad > 1 && (
                        <span className="text-muted fw-normal">
                          {" "}
                          x{item.cantidad}
                        </span>
                      )}
                    </h6>
                    <small className="text-muted">
                      {item.tamano && `${item.tamano} · `}
                      {formatEUR(item.precioTotal)}
                    </small>
                    {item.mitades?.mitadA && (
                      <div className="small text-muted mt-1">
                        <span className="fw-medium">½</span>{" "}
                        {item.mitades.mitadA.nombre || "Personalizada"}
                      </div>
                    )}
                    {item.mitades?.mitadB && (
                      <div className="small text-muted">
                        <span className="fw-medium">½</span>{" "}
                        {item.mitades.mitadB.nombre || "Personalizada"}
                      </div>
                    )}
                  </>
                )}

                {/* ── Extras ── */}
                {item.ingredientesExtras?.length > 0 && (
                  <div className="mt-1">
                    {item.ingredientesExtras.map((i) => (
                      <span
                        key={i.id}
                        className="d-inline-block rounded-pill px-2 py-0 me-1 mb-1 bg-success bg-opacity-10 text-success border border-success-subtle"
                        style={{ fontSize: "0.7rem" }}
                      >
                        + {i.nombre}
                        {i.cantidad > 1 && ` x${i.cantidad}`}
                      </span>
                    ))}
                  </div>
                )}

                {/* ── Quitados ── */}
                {item.ingredientesQuitados?.length > 0 && (
                  <div className="mt-1">
                    {item.ingredientesQuitados.map((i) => (
                      <span
                        key={i.id}
                        className="d-inline-block rounded-pill px-2 py-0 me-1 mb-1 bg-danger bg-opacity-10 text-danger border border-danger-subtle text-decoration-line-through"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {i.nombre}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Eliminar */}
              <button
                type="button"
                onClick={() => eliminarItem(index)}
                className="btn btn-link text-danger p-0 ms-2 flex-shrink-0"
                title="Eliminar"
              >
                <i className="bi bi-x-circle" style={{ fontSize: "1rem" }} />
              </button>
            </li>
          ))}

          {/* ── Total ── */}
          <li className="d-flex justify-content-between fw-semibold pt-2 border-top">
            <span>Total</span>
            <span className="color-secundario">{formatEUR(totalCarrito)}</span>
          </li>

          {/* ── Acciones ── */}
          <li className="mt-3 d-flex gap-2">
            <Link to="/shop/cart" className="btn-ver-carrito w-50">
              Ver carrito
            </Link>
            <Link to="/shop/checkout" className="btn-finalizar-pedido w-50">
              Finalizar pedido
            </Link>
          </li>
        </>
      ) : (
        <li className="text-center py-4">
          <i
            className="bi bi-cart3 d-block mb-2"
            style={{ fontSize: "1.5rem", color: "#adb5bd" }}
          />
          <span className="text-muted small">Tu carrito está vacío</span>
        </li>
      )}
    </ul>
  );
}
