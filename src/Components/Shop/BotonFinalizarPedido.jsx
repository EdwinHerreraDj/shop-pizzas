import { Link, useLocation } from "react-router-dom";
import { useCarrito } from "../../context/CarritoContext";
import usePrecios from "../../hooks/usePrecios";

/**
 * Botón flotante para ir rápido al checkout desde móvil.
 * - Solo se muestra si hay items en el carrito
 * - Se oculta en las páginas de carrito, checkout y tracking
 * - Se oculta en pantallas grandes (donde ya hay sidebar)
 */
export default function BotonFinalizarPedido() {
  const { carrito, totalItems, totalCarrito } = useCarrito();
  const { formatEUR } = usePrecios();
  const location = useLocation();

  if (carrito.length === 0) return null;

  const rutasOcultas = ["/shop/cart", "/shop/checkout", "/pedido"];
  if (rutasOcultas.some((r) => location.pathname.startsWith(r))) return null;

  return (
    <div
      className="position-fixed bottom-0 start-0 end-0 d-lg-none"
      style={{
        pointerEvents: "none",
        zIndex: 1040,
        marginBottom: "1rem",
      }}
    >
      <div
        className="container d-flex justify-content-center"
        style={{ pointerEvents: "auto" }}
      >
        <Link
          to="/shop/checkout"
          className="d-inline-flex align-items-center justify-content-between gap-3 px-4 py-3 rounded-pill text-white fw-semibold text-decoration-none shadow-lg"
          style={{
            backgroundColor: "#eb0029",
            fontSize: "0.95rem",
            minWidth: "280px",
            maxWidth: "calc(100% - 2rem)",
            animation: "bounce-checkout 2.5s infinite",
          }}
        >
          <span className="d-inline-flex align-items-center gap-2">
            <span
              className="d-inline-flex align-items-center justify-content-center rounded-circle bg-white"
              style={{
                width: 28,
                height: 28,
                color: "#eb0029",
                fontSize: "0.75rem",
                fontWeight: 700,
              }}
            >
              {totalItems}
            </span>
            <span>Finalizar pedido</span>
          </span>

          <span className="d-inline-flex align-items-center gap-2">
            <span className="fw-bold">{formatEUR(totalCarrito)}</span>
            <i className="bi bi-chevron-right" />
          </span>
        </Link>
      </div>

      <style>{`
        @keyframes bounce-checkout {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
