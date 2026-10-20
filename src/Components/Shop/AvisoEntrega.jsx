import useOpcionesEntrega, {
  mensajeOpcionesEntrega,
} from "../../hooks/useOpcionesEntrega";

/**
 * Aviso que informa al cliente, antes de pedir, de que alguna opción de
 * entrega no está disponible ahora mismo. No muestra nada si están las dos.
 */
export default function AvisoEntrega({ compacto = false, className = "" }) {
  const { cargado, domicilio, recogida, metodosDomicilio, metodosRecogida } =
    useOpcionesEntrega();

  if (!cargado) return null;

  const mensaje = mensajeOpcionesEntrega({ domicilio, recogida });
  if (!mensaje) return null;

  const ninguna = !domicilio && !recogida;
  const metodos = domicilio ? metodosDomicilio : metodosRecogida;

  return (
    <div
      role="status"
      className={`d-flex align-items-start gap-2 rounded-3 border ${
        ninguna
          ? "border-danger-subtle bg-danger bg-opacity-10 text-danger"
          : "border-warning-subtle bg-warning bg-opacity-10"
      } ${compacto ? "px-2 py-2 small" : "px-3 py-3"} ${className}`}
      style={{ color: ninguna ? undefined : "#7a4a00" }}
    >
      <span style={{ fontSize: compacto ? "1rem" : "1.3rem", lineHeight: 1.2 }}>
        {ninguna ? "⛔" : recogida ? "🏪" : "🛵"}
      </span>
      <div>
        <div className="fw-semibold">{mensaje}</div>
        {!ninguna && metodos.length > 0 && (
          <div className="opacity-75" style={{ fontSize: "0.8em" }}>
            Pago disponible: {metodos.map((m) => m.nombre).join(", ")}
          </div>
        )}
      </div>
    </div>
  );
}
