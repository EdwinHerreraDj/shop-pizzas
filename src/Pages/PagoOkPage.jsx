import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import clientesAxios from "../config/axios";

/**
 * Página a la que Redsys redirige al cliente tras un pago con éxito.
 * Hacemos polling al backend hasta confirmar que la notificación asíncrona
 * ya llegó y el pedido quedó marcado como pagado.
 */
export default function PagoOkPage() {
  const [params] = useSearchParams();
  const codigo = params.get("codigo");

  const [estado, setEstado] = useState("comprobando"); // comprobando|pagado|timeout|error
  const [pedido, setPedido] = useState(null);
  const intentosRef = useRef(0);
  const MAX_INTENTOS = 20; // 20 * 1.5s = 30s de espera máxima

  useEffect(() => {
    if (!codigo) {
      setEstado("error");
      return;
    }

    let activo = true;

    const comprobar = async () => {
      try {
        const { data } = await clientesAxios.get(
          `/shop/pedidos/${codigo}/pago-estado`,
        );

        if (!activo) return;
        setPedido(data);

        if (data.estado_pago === "pagado") {
          setEstado("pagado");
          return;
        }

        if (data.estado_pago === "fallido") {
          setEstado("error");
          return;
        }

        // Sigue pendiente, reintentar
        intentosRef.current += 1;
        if (intentosRef.current >= MAX_INTENTOS) {
          setEstado("timeout");
        } else {
          setTimeout(comprobar, 1500);
        }
      } catch {
        if (!activo) return;
        setEstado("error");
      }
    };

    comprobar();

    return () => {
      activo = false;
    };
  }, [codigo]);

  return (
    <div className="section-padding bg-color2">
      <div className="container" style={{ maxWidth: 560 }}>
        <div className="bg-white rounded-4 shadow-sm p-5 text-center">
          {estado === "comprobando" && (
            <>
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
                style={{
                  width: 90,
                  height: 90,
                  background: "linear-gradient(135deg, #eb002915, #fc791a15)",
                }}
              >
                <div
                  className="spinner-border"
                  style={{ color: "#eb0029", width: "2.5rem", height: "2.5rem" }}
                  role="status"
                />
              </div>
              <h2
                className="fw-bold color-primario mb-2"
                style={{ fontFamily: "var(--title-font)" }}
              >
                Confirmando tu pago…
              </h2>
              <p className="text-muted mb-0">
                Estamos verificando con el banco. Esto puede tardar unos
                segundos.
              </p>
            </>
          )}

          {estado === "pagado" && (
            <>
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
                style={{
                  width: 90,
                  height: 90,
                  backgroundColor: "#d1fae5",
                  fontSize: "2.8rem",
                }}
              >
                ✓
              </div>
              <h2
                className="fw-bold mb-2"
                style={{
                  fontFamily: "var(--title-font)",
                  color: "#059669",
                }}
              >
                ¡Pago confirmado!
              </h2>
              <p className="text-muted mb-1">
                Código de pedido:{" "}
                <strong
                  style={{
                    fontFamily: "monospace",
                    letterSpacing: "2px",
                    color: "#eb0029",
                  }}
                >
                  {codigo}
                </strong>
              </p>
              <p className="text-muted mb-4">
                Hemos recibido tu pago correctamente y empezamos a preparar
                tu pedido.
              </p>

              <Link
                to={`/pedido/${codigo}`}
                className="btn rounded-pill px-5 py-2 text-white fw-semibold d-block mb-3"
                style={{ backgroundColor: "#eb0029" }}
              >
                <i className="bi bi-geo-alt me-2" />
                Seguir mi pedido
              </Link>

              <Link
                to="/"
                className="btn rounded-pill px-5 py-2 fw-semibold"
                style={{ border: "1px solid #eb0029", color: "#eb0029" }}
              >
                Volver al inicio
              </Link>
            </>
          )}

          {estado === "timeout" && (
            <>
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
                style={{
                  width: 90,
                  height: 90,
                  backgroundColor: "#fef3c7",
                  fontSize: "2.8rem",
                }}
              >
                ⏱
              </div>
              <h2
                className="fw-bold mb-2"
                style={{
                  fontFamily: "var(--title-font)",
                  color: "#d97706",
                }}
              >
                Pago procesándose
              </h2>
              <p className="text-muted mb-4">
                El banco está tardando más de lo normal en confirmar tu pago.
                Puedes consultar el estado de tu pedido en cualquier momento.
              </p>

              <Link
                to={`/pedido/${codigo}`}
                className="btn rounded-pill px-5 py-2 text-white fw-semibold"
                style={{ backgroundColor: "#eb0029" }}
              >
                Ver estado de mi pedido
              </Link>
            </>
          )}

          {estado === "error" && (
            <>
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
                style={{
                  width: 90,
                  height: 90,
                  backgroundColor: "#fee2e2",
                  fontSize: "2.8rem",
                }}
              >
                ✗
              </div>
              <h2
                className="fw-bold mb-2"
                style={{
                  fontFamily: "var(--title-font)",
                  color: "#dc2626",
                }}
              >
                No pudimos confirmar el pago
              </h2>
              <p className="text-muted mb-4">
                Ha ocurrido un problema al verificar tu pago. Si se ha cargado
                en tu tarjeta, contáctanos indicando el código del pedido.
              </p>

              {codigo && (
                <p className="text-muted small mb-4">
                  Código:{" "}
                  <strong style={{ fontFamily: "monospace" }}>{codigo}</strong>
                </p>
              )}

              <Link
                to="/"
                className="btn rounded-pill px-5 py-2 text-white fw-semibold"
                style={{ backgroundColor: "#eb0029" }}
              >
                Volver al inicio
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
