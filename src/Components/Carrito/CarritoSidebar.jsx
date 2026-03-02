import { useCarrito } from "../../context/CarritoContext";
import usePrecios from "../../hooks/usePrecios";

export default function CarritoSidebar() {
  const { carrito, eliminarItem, vaciarCarrito } = useCarrito();
  const { formatEUR } = usePrecios();

  const total = carrito.reduce(
    (acc, item) => acc + (Number(item.precioTotal) || 0),
    0
  );

  // mostrar solo cambios reales
  const getExtrasVisibles = (extras = []) =>
    extras.filter((i) => !i.incluido || i.cantidad > 1);

  // render de una mitad (CLAVE)
  const renderMitad = (titulo, mitad) => {
    if (!mitad) return null;

    const extrasVisibles = getExtrasVisibles(mitad.ingredientesExtras || []);

    return (
      <div className="mt-1 ms-2">
        <strong>{titulo}:</strong> {mitad.nombre || "Personalizada"}
        {extrasVisibles.length > 0 && (
          <ul className="mb-1 ps-3 text-muted small">
            {extrasVisibles.map((i) => (
              <li key={i.id}>
                + {i.nombre} x{i.cantidad}
              </li>
            ))}
          </ul>
        )}
        {mitad.ingredientesQuitados?.length > 0 && (
          <p className="text-muted small mb-0">
            – sin {mitad.ingredientesQuitados.map((i) => i.nombre).join(", ")}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="single-sidebar-widget">
      <h5 className="widget-title d-flex justify-content-between align-items-center">
        Tu pedido
        {carrito.length > 0 && (
          <button
            className="btn btn-sm btn-outline-vaciar ms-2 color-secundario"
            onClick={vaciarCarrito}
          >
            Vaciar
          </button>
        )}
      </h5>

      {carrito.length === 0 ? (
        <div className="alert alert-light border border-secondary-subtle py-2 px-3 small mb-0 text-muted">
          <i className="bi bi-info-circle me-1"></i> Tu carrito está vacío.
        </div>
      ) : (
        <ul className="list-group list-group-flush small">
          {carrito.map((item, index) => {
            const extrasVisibles = getExtrasVisibles(item.ingredientesExtras);

            return (
              <li
                key={item.uid}
                className="list-group-item d-flex justify-content-between align-items-start py-2 px-0 border-0 border-bottom"
              >
                <div>
                  {/* ===============================
                      ARTÍCULO NORMAL
                  =============================== */}
                  {item.tipo === "articulo" && (
                    <>
                      <strong>
                        {item.nombre}
                        {item.cantidad > 1 && (
                          <span className="text-muted"> ×{item.cantidad}</span>
                        )}
                      </strong>
                      {item.tamaño && (
                        <span className="text-muted"> ({item.tamaño})</span>
                      )}
                    </>
                  )}

                  {/* ===============================
                      ARTÍCULO PERSONALIZADO
                  =============================== */}
                  {item.tipo === "articulo-personalizado" && (
                    <>
                      <strong>{item.nombre}</strong>
                      {item.tamaño && (
                        <span className="text-muted"> ({item.tamaño})</span>
                      )}

                      {extrasVisibles.length > 0 && (
                        <ul className="mb-1 ps-3 text-muted small">
                          {extrasVisibles.map((i) => (
                            <li key={i.id}>
                              + {i.nombre} x{i.cantidad}
                            </li>
                          ))}
                        </ul>
                      )}

                      {item.ingredientesQuitados?.length > 0 && (
                        <p className="text-muted small mb-0">
                          – sin{" "}
                          {item.ingredientesQuitados
                            .map((i) => i.nombre)
                            .join(", ")}
                        </p>
                      )}
                    </>
                  )}

                  {/* ===============================
                      PIZZA ENTERA
                  =============================== */}
                  {item.tipo === "pizza-entera" && (
                    <>
                      <strong>
                        Pizza entera
                        {item.cantidad > 1 && (
                          <span className="text-muted"> ×{item.cantidad}</span>
                        )}
                      </strong>{" "}
                      <span className="text-muted">({item.tamaño})</span>
                      {extrasVisibles.length > 0 && (
                        <ul className="mb-1 ps-3 text-muted small">
                          {extrasVisibles.map((i) => (
                            <li key={i.id}>
                              + {i.nombre} x{i.cantidad}
                            </li>
                          ))}
                        </ul>
                      )}
                      {item.ingredientesQuitados?.length > 0 && (
                        <p className="text-muted small mb-0">
                          – sin{" "}
                          {item.ingredientesQuitados
                            .map((i) => i.nombre)
                            .join(", ")}
                        </p>
                      )}
                    </>
                  )}

                  {/* ===============================
                      PIZZA POR MITADES
                  =============================== */}
                  {item.tipo === "pizza-mitades" && (
                    <>
                      <strong>
                        Pizza por mitades
                        {item.cantidad > 1 && (
                          <span className="text-muted"> ×{item.cantidad}</span>
                        )}
                      </strong>{" "}
                      <span className="text-muted">({item.tamaño})</span>
                      {renderMitad("Mitad 1", item.mitades?.mitadA)}
                      {renderMitad("Mitad 2", item.mitades?.mitadB)}
                    </>
                  )}
                </div>

                <div className="text-end">
                  <div className="fw-semibold">
                    {formatEUR(item.precioTotal)}
                  </div>
                  <button
                    onClick={() => eliminarItem(index)}
                    className="btn btn-link text-danger btn-sm p-0 mt-1"
                  >
                    <i className="bi bi-x-circle"></i>
                  </button>
                </div>
              </li>
            );
          })}

          <li className="list-group-item border-0 mt-2 d-flex justify-content-between fw-bold">
            <span>Total</span>
            <span>{formatEUR(total)}</span>
          </li>

          <li>
            <a href="/shop/cart" className="theme-btn w-100 text-center">
              Ver carrito
            </a>
          </li>
        </ul>
      )}
    </div>
  );
}
