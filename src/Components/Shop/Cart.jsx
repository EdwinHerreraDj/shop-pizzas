import { Link } from "react-router-dom";
import { useCarrito } from "../../context/CarritoContext";
import usePrecios from "../../hooks/usePrecios";

/* ===============================
   Helpers
================================ */
const renderMitadDetalle = (label, mitad) => {
  if (!mitad) return null;

  return (
    <div className="small mt-1">
      <strong>{label}:</strong>{" "}
      <span className="text-muted">{mitad.nombre}</span>
      {mitad.ingredientesExtras?.length > 0 && (
        <ul className="ps-3 mb-1 text-success">
          {mitad.ingredientesExtras.map((i) => (
            <li key={i.id}>
              + {i.nombre}
              {i.cantidad > 1 && ` x${i.cantidad}`}
            </li>
          ))}
        </ul>
      )}
      {mitad.ingredientesQuitados?.length > 0 && (
        <p className="text-danger mb-0">
          – sin {mitad.ingredientesQuitados.map((i) => i.nombre).join(", ")}
        </p>
      )}
    </div>
  );
};

const Cart = () => {
  const { carrito, eliminarItem, actualizarCantidad } = useCarrito();
  const { formatEUR } = usePrecios();

  const totalGeneral = carrito.reduce(
    (acc, item) => acc + (item.precioTotal || 0) * (item.cantidad || 1),
    0
  );

  return (
    <div className="section-padding bg-white">
      <div className="container">
        {carrito.length === 0 ? (
          <div className="text-center py-5 text-muted">
            Tu carrito está vacío 🍕
          </div>
        ) : (
          <>
            {/* LISTADO */}
            <div className="d-flex flex-column gap-3 mb-4">
              {carrito.map((item, index) => {
                const totalLinea =
                  (item.precioTotal || 0) * (item.cantidad || 1);

                return (
                  <div
                    key={item.uid}
                    className="border rounded-4 p-3 shadow-sm"
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      {/* INFO PRODUCTO */}
                      <div>
                        {/* ARTÍCULOS */}
                        {(item.tipo === "articulo" ||
                          item.tipo === "articulo-personalizado") && (
                          <>
                            <div className="fw-semibold">{item.nombre}</div>
                            {item.tamaño && (
                              <small className="text-muted">
                                {item.tamaño}
                              </small>
                            )}

                            {item.ingredientesExtras?.length > 0 && (
                              <ul className="small text-success ps-3 mb-1">
                                {item.ingredientesExtras.map((i) => (
                                  <li key={i.id}>
                                    + {i.nombre}
                                    {i.cantidad > 1 && ` x${i.cantidad}`}
                                  </li>
                                ))}
                              </ul>
                            )}

                            {item.ingredientesQuitados?.length > 0 && (
                              <div className="small text-danger">
                                – sin{" "}
                                {item.ingredientesQuitados
                                  .map((i) => i.nombre)
                                  .join(", ")}
                              </div>
                            )}
                          </>
                        )}

                        {/* PIZZA ENTERA */}
                        {item.tipo === "pizza-entera" && (
                          <>
                            <div className="fw-semibold">Pizza entera</div>
                            <small className="text-muted">{item.tamaño}</small>

                            {item.ingredientesExtras?.length > 0 && (
                              <ul className="small text-success ps-3 mb-1">
                                {item.ingredientesExtras.map((i) => (
                                  <li key={i.id}>
                                    + {i.nombre}
                                    {i.cantidad > 1 && ` x${i.cantidad}`}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </>
                        )}

                        {/* PIZZA MITADES */}
                        {item.tipo === "pizza-mitades" && (
                          <>
                            <div className="fw-semibold">Pizza por mitades</div>
                            <small className="text-muted">{item.tamaño}</small>

                            {renderMitadDetalle(
                              "Mitad 1",
                              item.mitades?.mitadA
                            )}
                            {renderMitadDetalle(
                              "Mitad 2",
                              item.mitades?.mitadB
                            )}
                          </>
                        )}
                      </div>

                      {/* ELIMINAR */}
                      <button
                        type="button"
                        className="btn btn-sm text-danger"
                        onClick={() => eliminarItem(index)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>

                    {/* CONTROLES */}
                    <div className="d-flex justify-content-between align-items-center">
                      {/* CANTIDAD */}
                      {item.tipo === "pizza-mitades" ? (
                        <span className="text-muted">Cantidad: 1</span>
                      ) : (
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() =>
                              actualizarCantidad(
                                index,
                                Math.max(1, item.cantidad - 1)
                              )
                            }
                          >
                            −
                          </button>

                          <span className="px-3 d-flex align-items-center">
                            {item.cantidad}
                          </span>

                          <button
                            className="btn btn-outline-secondary"
                            onClick={() =>
                              actualizarCantidad(index, item.cantidad + 1)
                            }
                          >
                            +
                          </button>
                        </div>
                      )}

                      {/* TOTAL */}
                      <div className="fw-bold">{formatEUR(totalLinea)}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RESUMEN FINAL */}
            <div className="border-top pt-4 mt-4">
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                {/* TOTAL */}
                <div>
                  <span className="text-muted small text-uppercase">
                    Total del pedido
                  </span>
                  <h3 className="fw-bold mb-0">{formatEUR(totalGeneral)}</h3>
                </div>

                {/* ACCIONES */}
                <div className="d-flex gap-2">
                  <Link
                    to="/shop"
                    className="btn rounded-pill px-4"
                    style={{
                      backgroundColor: "#f8f9fa",
                      color: "#495057",
                      border: "1px solid #dee2e6",
                    }}
                  >
                    Seguir comprando
                  </Link>

                  <Link
                    to="/checkout"
                    className="btn rounded-pill px-4 text-white fw-semibold"
                    style={{
                      backgroundColor: "#eb0029",
                      borderColor: "#eb0029",
                    }}
                  >
                    Finalizar pedido
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
