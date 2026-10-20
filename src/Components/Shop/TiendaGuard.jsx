import useEstadoTienda from "../../hooks/useEstadoTienda";
import TiendaCerrada from "./TiendaCerrada";

/**
 * Envuelve cualquier página que deba bloquearse si la tienda está cerrada.
 * Mientras se comprueba el estado NO se renderizan los children: así evitamos
 * que se disparen peticiones (ej. /shop/articulos) que el backend bloquea
 * con 503 y provocarían un mensaje de error genérico.
 */
export default function TiendaGuard({ children }) {
  const { data, isLoading } = useEstadoTienda();

  // 1) Cerrada según el último estado conocido. Va antes que cualquier
  //    comprobación de error: si un refresco posterior falla (red, límite de
  //    peticiones...) React Query conserva el dato y la tienda sigue cerrada.
  if (data?.cerrada) {
    return <TiendaCerrada titulo={data.titulo} mensaje={data.mensaje} />;
  }

  // 2) Primera carga: spinner centrado hasta saber el estado real
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

  // 3) Abierta, o no se pudo saber el estado: dejamos pasar para no bloquear
  //    la tienda por un fallo de red puntual. Si en realidad está cerrada, el
  //    primer 503 de la API lo detecta el interceptor de axios y este guard
  //    pasa a mostrar la pantalla de cerrada.
  return children;
}
