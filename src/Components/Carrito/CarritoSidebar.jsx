import { useCarrito } from "../../context/CarritoContext";
import { Link } from "react-router-dom";
import usePrecios from "../../hooks/usePrecios";

export default function CarritoSidebar() {
  const {
    carrito,
    eliminarItem,
    vaciarCarrito,
    actualizarCantidad,
    totalCarrito,
  } = useCarrito();
  const { formatEUR } = usePrecios();

  /* ── Helpers de render ─────────────────────────── */
  const renderExtras = (extras = []) => {
    if (!extras.length) return null;
    return (
      <ul className="mb-1 ps-3 text-muted small">
        {extras.map((i) => (
          <li key={i.id}>
            + {i.nombre}
            {i.cantidad > 1 && <span> x{i.cantidad}</span>}
          </li>
        ))}
      </ul>
    );
  };

  const renderQuitados = (quitados = []) => {
    if (!quitados.length) return null;
    return (
      <p className="text-muted small mb-0">
        – sin {quitados.map((i) => i.nombre).join(", ")}
      </p>
    );
  };

  const renderMitad = (titulo, mitad) => {
    if (!mitad) return null;
    return (
      <div className="mt-1 ms-2">
        <strong>{titulo}:</strong> {mitad.nombre || "Personalizada"}
        {renderExtras(mitad.ingredientesExtras)}
        {renderQuitados(mitad.ingredientesQuitados)}
      </div>
    );
  };

  /* ── Controles de cantidad ─────────────────────── */
  const renderCantidadControls = (item, index) => (
    <div className="d-flex align-items-center gap-2 mt-2">
      <button
        className="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
        style={{ width: 24, height: 24, fontSize: "0.75rem" }}
        onClick={() =>
          item.cantidad === 1
            ? eliminarItem(index)
            : actualizarCantidad(index, item.cantidad - 1)
        }
      >
        {item.cantidad === 1 ? <i className="bi bi-trash" /> : "−"}
      </button>

      <span className="fw-semibold small">{item.cantidad}</span>

      <button
        className="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
        style={{ width: 24, height: 24, fontSize: "0.75rem" }}
        onClick={() => actualizarCantidad(index, item.cantidad + 1)}
      >
        +
      </button>
    </div>
  );

  /* ── Render ────────────────────────────────────── */
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
          <i className="bi bi-info-circle me-1" /> Tu carrito está vacío.
        </div>
      ) : (
        <ul className="list-group list-group-flush small">
          {carrito.map((item, index) => (
            <li
              key={item.uid}
              className="list-group-item d-flex justify-content-between align-items-start py-2 px-0 border-0 border-bottom"
            >
              <div className="flex-grow-1">
                {/* ── ARTÍCULO (normal o personalizado) ── */}
                {item.tipo === "articulo" && (
                  <>
                    <strong>{item.nombre}</strong>
                    {item.tamano && (
                      <span className="text-muted"> ({item.tamano})</span>
                    )}
                    {renderExtras(item.ingredientesExtras)}
                    {renderQuitados(item.ingredientesQuitados)}
                  </>
                )}

                {/* ── PIZZA ENTERA ── */}
                {item.tipo === "pizza-entera" && (
                  <>
                    <strong>Pizza personalizada</strong>{" "}
                    {item.tamano && (
                      <span className="text-muted">({item.tamano})</span>
                    )}
                    {renderExtras(item.ingredientesExtras)}
                    {renderQuitados(item.ingredientesQuitados)}
                  </>
                )}

                {/* ── PIZZA POR MITADES ── */}
                {item.tipo === "pizza-mitades" && (
                  <>
                    <strong>Pizza por mitades</strong>{" "}
                    {item.tamano && (
                      <span className="text-muted">({item.tamano})</span>
                    )}
                    {renderMitad("Mitad 1", item.mitades?.mitadA)}
                    {renderMitad("Mitad 2", item.mitades?.mitadB)}
                  </>
                )}

                {/* ── Controles +/− ── */}
                {renderCantidadControls(item, index)}
              </div>

              <div className="text-end ms-3">
                <div className="fw-semibold">
                  {formatEUR(item.precioTotal)}
                </div>
                <button
                  onClick={() => eliminarItem(index)}
                  className="btn btn-link text-danger btn-sm p-0 mt-1"
                >
                  <i className="bi bi-x-circle" />
                </button>
              </div>
            </li>
          ))}

          {/* ── TOTAL ── */}
          <li className="list-group-item border-0 mt-2 d-flex justify-content-between fw-bold">
            <span>Total</span>
            <span>{formatEUR(totalCarrito)}</span>
          </li>

          <li>
            <Link to="/shop/cart" className="theme-btn w-100 text-center">
              Ver carrito
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
}