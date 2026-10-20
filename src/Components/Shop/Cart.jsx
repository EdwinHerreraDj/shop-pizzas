import { Link } from "react-router-dom";
import { useCarrito } from "../../context/CarritoContext";
import usePrecios from "../../hooks/usePrecios";
import AvisoEntrega from "./AvisoEntrega";

/* ── Helpers ─────────────────────────────────────── */
const renderExtras = (extras = []) => {
  if (!extras.length) return null;
  return (
    <div className="mt-1">
      {extras.map((i) => (
        <span
          key={i.id}
          className="d-inline-flex align-items-center gap-1 rounded-pill px-2 py-1 me-1 mb-1 bg-success bg-opacity-10 border border-success-subtle"
          style={{ fontSize: "0.78rem" }}
        >
          <i
            className="bi bi-plus-circle-fill text-success"
            style={{ fontSize: "0.7rem" }}
          />
          <span className="text-success fw-medium">{i.nombre}</span>
          {i.cantidad > 1 && (
            <span
              className="badge bg-success text-white rounded-pill"
              style={{ fontSize: "0.65rem" }}
            >
              x{i.cantidad}
            </span>
          )}
        </span>
      ))}
    </div>
  );
};

const renderQuitados = (quitados = []) => {
  if (!quitados.length) return null;
  return (
    <div className="mt-1">
      {quitados.map((i) => (
        <span
          key={i.id}
          className="d-inline-flex align-items-center gap-1 rounded-pill px-2 py-1 me-1 mb-1 bg-danger bg-opacity-10 border border-danger-subtle"
          style={{ fontSize: "0.78rem" }}
        >
          <i
            className="bi bi-dash-circle-fill text-danger"
            style={{ fontSize: "0.7rem" }}
          />
          <span className="text-danger fw-medium text-decoration-line-through">
            {i.nombre}
          </span>
        </span>
      ))}
    </div>
  );
};

const renderMitad = (label, mitad, formatEUR) => {
  if (!mitad) return null;
  const totalMitad =
    (Number(mitad.precioBase) || 0) + (Number(mitad.precioExtras) || 0);

  return (
    <div className="rounded-3 bg-light p-2 mt-2">
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <span
            className="d-inline-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
            style={{
              width: 22,
              height: 22,
              fontSize: "0.7rem",
              backgroundColor: "#eb0029",
            }}
          >
            {label === "Mitad 1" ? "1" : "2"}
          </span>
          <span className="fw-semibold small">
            {mitad.nombre || "Personalizada"}
          </span>
        </div>
        <span className="small text-muted">{formatEUR(totalMitad)}</span>
      </div>
      {renderExtras(mitad.ingredientesExtras)}
      {renderQuitados(mitad.ingredientesQuitados)}
    </div>
  );
};

/* ── Componente ──────────────────────────────────── */
const Cart = () => {
  const { carrito, eliminarItem, actualizarCantidad, totalCarrito } =
    useCarrito();
  const { formatEUR } = usePrecios();

  return (
    <div className="section-padding bg-white">
      <div className="container" style={{ maxWidth: 720 }}>
        {/* ── Header ── */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold color-primario mb-0">Tu pedido</h4>
          {carrito.length > 0 && (
            <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3 py-2">
              {carrito.reduce((a, i) => a + (i.cantidad || 0), 0)} artículo
              {carrito.reduce((a, i) => a + (i.cantidad || 0), 0) !== 1 && "s"}
            </span>
          )}
        </div>

        {carrito.length === 0 ? (
          <div className="text-center py-5">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light mb-3"
              style={{ width: 80, height: 80 }}
            >
              <i
                className="bi bi-cart3"
                style={{ fontSize: "2rem", color: "#adb5bd" }}
              />
            </div>
            <p className="text-muted mb-4">Tu carrito está vacío</p>
            <Link
              to="/shop"
              className="btn rounded-pill px-4 py-2 text-white fw-semibold"
              style={{ backgroundColor: "#eb0029", borderColor: "#eb0029" }}
            >
              Ver la carta
            </Link>
          </div>
        ) : (
          <>
            {/* ── ITEMS ── */}
            <div className="d-flex flex-column gap-3 mb-4">
              {carrito.map((item, index) => {
                const precioUnitario =
                  item.tipo === "pizza-mitades"
                    ? item.precioTotal / item.cantidad
                    : (Number(item.precioBase) || 0) +
                      (Number(item.precioExtras) || 0);

                return (
                  <div
                    key={item.uid}
                    className="border rounded-4 p-3 shadow-sm bg-white"
                  >
                    {/* ── Cabecera: nombre + precio ── */}
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="flex-grow-1">
                        {/* ARTÍCULO */}
                        {item.tipo === "articulo" && (
                          <>
                            <div className="fw-bold">{item.nombre}</div>
                            {item.tamano && (
                              <span className="badge bg-light text-muted border rounded-pill small">
                                {item.tamano}
                              </span>
                            )}
                            {renderExtras(item.ingredientesExtras)}
                            {renderQuitados(item.ingredientesQuitados)}
                          </>
                        )}

                        {/* PIZZA ENTERA */}
                        {item.tipo === "pizza-entera" && (
                          <>
                            <div className="fw-bold">Pizza personalizada</div>
                            {item.tamano && (
                              <span className="badge bg-light text-muted border rounded-pill small">
                                {item.tamano}
                              </span>
                            )}
                            {renderExtras(item.ingredientesExtras)}
                            {renderQuitados(item.ingredientesQuitados)}
                          </>
                        )}

                        {/* PIZZA MITADES */}
                        {item.tipo === "pizza-mitades" && (
                          <>
                            <div className="fw-bold">Pizza por mitades</div>
                            {item.tamano && (
                              <span className="badge bg-light text-muted border rounded-pill small">
                                {item.tamano}
                              </span>
                            )}
                            {renderMitad(
                              "Mitad 1",
                              item.mitades?.mitadA,
                              formatEUR,
                            )}
                            {renderMitad(
                              "Mitad 2",
                              item.mitades?.mitadB,
                              formatEUR,
                            )}
                          </>
                        )}
                      </div>

                      {/* Eliminar */}
                      <button
                        type="button"
                        className="btn btn-sm text-danger p-1"
                        onClick={() => eliminarItem(index)}
                        title="Eliminar"
                      >
                        <i className="bi bi-trash" />
                      </button>
                    </div>

                    {/* ── Footer: cantidad + precio ── */}
                    <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                      {/* Stepper cantidad */}
                      <div
                        className="d-inline-flex align-items-center rounded-pill overflow-hidden border"
                        style={{ height: 34 }}
                      >
                        <button
                          className="btn btn-sm border-0 px-3 h-100"
                          onClick={() =>
                            item.cantidad === 1
                              ? eliminarItem(index)
                              : actualizarCantidad(index, item.cantidad - 1)
                          }
                        >
                          {item.cantidad === 1 ? (
                            <i
                              className="bi bi-trash text-danger"
                              style={{ fontSize: "0.8rem" }}
                            />
                          ) : (
                            "−"
                          )}
                        </button>

                        <span
                          className="fw-bold px-2"
                          style={{ minWidth: 28, textAlign: "center" }}
                        >
                          {item.cantidad}
                        </span>

                        <button
                          className="btn btn-sm border-0 px-3 h-100"
                          onClick={() =>
                            actualizarCantidad(index, item.cantidad + 1)
                          }
                        >
                          +
                        </button>
                      </div>

                      {/* Precio */}
                      <div className="text-end">
                        {item.cantidad > 1 && (
                          <div className="text-muted small">
                            {formatEUR(precioUnitario)} × {item.cantidad}
                          </div>
                        )}
                        <div className="fw-bold color-secundario">
                          {formatEUR(item.precioTotal)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── RESUMEN ── */}
            <div className="border rounded-4 p-4 shadow-sm bg-light">
              <AvisoEntrega className="mb-3" />

              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted">Subtotal</span>
                <span className="fw-semibold">{formatEUR(totalCarrito)}</span>
              </div>

              <hr className="my-2" />

              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-bold fs-5">Total</span>
                <span className="fw-bold fs-5 color-secundario">
                  {formatEUR(totalCarrito)}
                </span>
              </div>

              <div className="d-flex flex-column flex-sm-row gap-2 mt-4">
                <Link
                  to="/shop"
                  className="btn rounded-pill px-4 py-2 flex-fill text-center"
                  style={{
                    backgroundColor: "#f8f9fa",
                    color: "#495057",
                    border: "1px solid #dee2e6",
                  }}
                >
                  Seguir comprando
                </Link>

                <Link
                  to="/shop/checkout"
                  className="theme-btn style4 w-100 rounded-pill fw-semibold text-white py-3 mb-2 text-center"
                  style={{
                    backgroundColor: "#eb0029",
                    borderColor: "#eb0029",
                  }}
                >
                  Finalizar pedido
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
