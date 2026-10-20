import { esTiendaCerrada, datosCierre } from "../../config/axios";

/**
 * Mensaje para cuando falla la carga de datos de la tienda.
 * - Cierre por mantenimiento (503 tienda_cerrada): título y mensaje de Laravel.
 *   Normalmente TiendaGuard ya habrá sustituido la página entera; esto evita
 *   que, mientras tanto, se vea un error genérico.
 * - Error real (red, servidor...): aviso de conexión con botón Reintentar.
 */
export default function ErrorCarga({ error, onReintentar, que = "los datos" }) {
  if (esTiendaCerrada(error)) {
    const { titulo, mensaje } = datosCierre(error);
    return (
      <div className="alert alert-warning d-flex align-items-start gap-2 mb-0" role="status">
        <i className="bi bi-shop fs-5" />
        <div>
          <div className="fw-semibold">{titulo}</div>
          <div className="small">{mensaje}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="alert alert-danger d-flex flex-column flex-sm-row align-items-center justify-content-center gap-2 mb-0"
      role="alert"
    >
      <i className="bi bi-wifi-off fs-4" />
      <span className="fw-medium text-center text-sm-start">
        No pudimos conectar con la tienda para cargar {que}.
        <span className="text-muted"> Revisa tu conexión e inténtalo de nuevo.</span>
      </span>
      {onReintentar && (
        <button
          type="button"
          className="btn btn-sm btn-outline-danger rounded-pill px-3 flex-shrink-0"
          onClick={() => onReintentar()}
        >
          <i className="bi bi-arrow-clockwise me-1" />
          Reintentar
        </button>
      )}
    </div>
  );
}
