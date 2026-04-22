import useEstadoTienda from "../../hooks/useEstadoTienda";
import TiendaCerrada from "./TiendaCerrada";

/**
 * Envuelve cualquier página que deba bloquearse si la tienda está cerrada.
 * Mientras se comprueba el estado NO se renderizan los children: así evitamos
 * que se disparen peticiones (ej. /shop/articulos) que el backend bloquea
 * con 503 y provocarían un mensaje de error genérico.
 */
export default function TiendaGuard({ children }) {
  const { data, isLoading, isError } = useEstadoTienda();

  // Primera carga: spinner centrado hasta saber el estado real
  if (isLoading) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "60vh" }}
      >
        <div className="text-center">
          <div
            className="spinner-border"
            style={{ color: "#eb0029", width: "3rem", height: "3rem" }}
            role="status"
          />
          <p className="text-muted mt-3 small">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si falla la consulta del estado, asumimos que está abierta (no queremos
  // bloquear la tienda por un fallo de red puntual)
  if (isError || !data) return children;

  if (data.cerrada) {
    return <TiendaCerrada titulo={data.titulo} mensaje={data.mensaje} />;
  }

  return children;
}
