import { Link } from "react-router-dom";
import { useCarrito } from "../../context/CarritoContext";
import usePrecios from "../../hooks/usePrecios";
import AvisoEntrega from "./AvisoEntrega";

const ROJO = "#eb0029";
const NARANJA = "#fc791a";

function NombreItem({ item }) {
  if (item.tipo === "pizza-mitades") return "Pizza por mitades";
  if (item.tipo === "pizza-entera") return "Pizza personalizada";
  return item.nombre ?? `Artículo #${item.articuloId}`;
}

function PillsIngredientes({ extras = [], quitados = [] }) {
  if (!extras.length && !quitados.length) return null;
  return (
    <div className="mt-1 d-flex flex-wrap gap-1">
      {extras.map((i) => (
        <span
          key={`e-${i.id}`}
          className="rounded-pill px-2 py-0 bg-success bg-opacity-10 text-success border border-success-subtle"
          style={{ fontSize: "0.65rem", fontWeight: 500 }}
        >
          + {i.nombre}
          {i.cantidad > 1 && ` ×${i.cantidad}`}
        </span>
      ))}
      {quitados.map((i) => (
        <span
          key={`q-${i.id}`}
          className="rounded-pill px-2 py-0 bg-danger bg-opacity-10 text-danger border border-danger-subtle text-decoration-line-through"
          style={{ fontSize: "0.65rem", fontWeight: 500 }}
        >
          {i.nombre}
        </span>
      ))}
    </div>
  );
}

export default function CartDropdown() {
  const { carrito, eliminarItem, totalCarrito, totalItems } = useCarrito();
  const { formatEUR } = usePrecios();

  const vacio = carrito.length === 0;

  return (
    <div
      className="bg-white p-0 border-0 overflow-hidden"
      style={{
        width: "23rem",
        borderRadius: "1rem",
        boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
      }}
    >
      {/* CABECERA */}
      <div
        className="d-flex align-items-center justify-content-between px-3 py-3"
        style={{
          background: `linear-gradient(135deg, ${ROJO}, ${NARANJA})`,
          color: "#fff",
        }}
      >
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-bag-check-fill" style={{ fontSize: "1.1rem" }} />
          <strong style={{ fontSize: "0.95rem" }}>Tu pedido</strong>
        </div>
        {!vacio && (
          <span
            className="badge rounded-pill bg-white"
            style={{ color: ROJO, fontWeight: 700 }}
          >
            {totalItems} {totalItems === 1 ? "artículo" : "artículos"}
          </span>
        )}
      </div>

      {vacio ? (
        /* VACÍO */
        <div className="text-center py-5 px-4">
          <div
            className="mx-auto mb-3 d-inline-flex align-items-center justify-content-center rounded-circle"
            style={{
              width: 70,
              height: 70,
              background: "#f8f9fa",
            }}
          >
            <i
              className="bi bi-cart3"
              style={{ fontSize: "2rem", color: "#adb5bd" }}
            />
          </div>
          <h6 className="fw-bold text-dark mb-1">Tu carrito está vacío</h6>
          <p className="text-muted small mb-3">
            Añade productos para empezar tu pedido
          </p>
          <Link
            to="/"
            className="btn rounded-pill px-4 py-2 text-white fw-semibold"
            style={{ backgroundColor: ROJO, fontSize: "0.85rem" }}
          >
            Ver carta
          </Link>
        </div>
      ) : (
        <>
          {/* ITEMS */}
          <div
            className="px-3 py-2"
            style={{
              maxHeight: "55vh",
              overflowY: "auto",
            }}
          >
            {carrito.map((item, index) => (
              <div
                key={item.uid ?? index}
                className="d-flex align-items-start py-2"
                style={{
                  borderBottom:
                    index < carrito.length - 1 ? "1px dashed #f1f3f5" : "none",
                }}
              >
                {/* Cantidad badge */}
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-circle me-2 flex-shrink-0"
                  style={{
                    width: 32,
                    height: 32,
                    background: `${ROJO}15`,
                    color: ROJO,
                    fontWeight: 700,
                    fontSize: "0.8rem",
                  }}
                >
                  {item.cantidad}
                </div>

                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <div
                    className="fw-semibold text-dark text-truncate"
                    style={{ fontSize: "0.85rem", lineHeight: 1.2 }}
                  >
                    <NombreItem item={item} />
                  </div>

                  <div
                    className="text-muted d-flex align-items-center gap-2 mt-1"
                    style={{ fontSize: "0.7rem" }}
                  >
                    {item.tamano && (
                      <span
                        className="badge rounded-pill"
                        style={{
                          background: "#f1f3f5",
                          color: "#495057",
                          fontWeight: 500,
                          fontSize: "0.65rem",
                        }}
                      >
                        {item.tamano}
                      </span>
                    )}
                    <span className="fw-bold" style={{ color: ROJO }}>
                      {formatEUR(item.precioTotal)}
                    </span>
                  </div>

                  {/* Mitades */}
                  {item.tipo === "pizza-mitades" && (
                    <div className="mt-1">
                      {item.mitades?.mitadA && (
                        <div
                          className="text-muted text-truncate"
                          style={{ fontSize: "0.7rem" }}
                        >
                          <span style={{ color: ROJO, fontWeight: 700 }}>
                            ½
                          </span>{" "}
                          {item.mitades.mitadA.nombre || "Personalizada"}
                        </div>
                      )}
                      {item.mitades?.mitadB && (
                        <div
                          className="text-muted text-truncate"
                          style={{ fontSize: "0.7rem" }}
                        >
                          <span style={{ color: ROJO, fontWeight: 700 }}>
                            ½
                          </span>{" "}
                          {item.mitades.mitadB.nombre || "Personalizada"}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Extras y quitados (artículos no mitades) */}
                  {item.tipo !== "pizza-mitades" && (
                    <PillsIngredientes
                      extras={item.ingredientesExtras}
                      quitados={item.ingredientesQuitados}
                    />
                  )}
                </div>

                {/* Eliminar */}
                <button
                  type="button"
                  onClick={() => eliminarItem(index)}
                  className="btn btn-sm p-0 ms-2 flex-shrink-0 d-flex align-items-center justify-content-center rounded-circle"
                  title="Eliminar del carrito"
                  style={{
                    width: 26,
                    height: 26,
                    color: "#dc3545",
                    border: "1px solid transparent",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#fee2e2";
                    e.currentTarget.style.borderColor = "#fecaca";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderColor = "transparent";
                  }}
                >
                  <i className="bi bi-trash3" style={{ fontSize: "0.85rem" }} />
                </button>
              </div>
            ))}
          </div>

          {/* TOTAL + ACCIONES */}
          <div
            className="px-3 py-3"
            style={{
              background: "#f8f9fa",
              borderTop: "1px solid #e9ecef",
            }}
          >
            <AvisoEntrega compacto className="mb-3" />

            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-muted small fw-medium">Total</span>
              <span
                className="fw-bold"
                style={{ fontSize: "1.15rem", color: ROJO }}
              >
                {formatEUR(totalCarrito)}
              </span>
            </div>

            <div className="d-flex gap-2">
              <Link
                to="/shop/cart"
                className="btn rounded-pill flex-fill fw-semibold"
                style={{
                  border: `1px solid ${ROJO}`,
                  color: ROJO,
                  fontSize: "0.8rem",
                  padding: "0.45rem 0.5rem",
                }}
              >
                Ver carrito
              </Link>
              <Link
                to="/shop/checkout"
                className="btn rounded-pill flex-fill text-white fw-semibold d-flex align-items-center justify-content-center gap-1"
                style={{
                  backgroundColor: ROJO,
                  fontSize: "0.8rem",
                  padding: "0.45rem 0.5rem",
                  border: "none",
                }}
              >
                Finalizar
                <i className="bi bi-arrow-right" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
