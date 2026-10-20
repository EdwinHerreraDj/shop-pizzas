import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { iniciarPagoRedsys } from "../utils/pagoRedsys";

/**
 * Página a la que Redsys redirige cuando el pago es rechazado o cancelado.
 */
export default function PagoErrorPage() {
  const [params] = useSearchParams();
  const codigo = params.get("codigo");
  const [reintentando, setReintentando] = useState(false);

  const reintentarPago = async () => {
    if (!codigo || reintentando) return;
    setReintentando(true);
    try {
      await iniciarPagoRedsys(codigo);
      // Si llega aquí, el submit ya redirigió; no hacemos nada.
    } catch (e) {
      toast.error(
        e?.response?.data?.message ??
          "No se pudo reiniciar el pago. Inténtalo más tarde.",
      );
      setReintentando(false);
    }
  };

  return (
    <div className="section-padding bg-color2">
      <div className="container" style={{ maxWidth: 560 }}>
        <div className="bg-white rounded-4 shadow-sm p-5 text-center">
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
            Pago no realizado
          </h2>
          <p className="text-muted mb-2">
            El banco ha rechazado la operación o has cancelado el pago.
          </p>
          <p className="text-muted mb-4">
            No se ha cargado ningún importe en tu tarjeta.
          </p>

          {codigo && (
            <div
              className="rounded-3 p-3 mb-4"
              style={{
                background: "#fef3c7",
                border: "1px solid #fde68a",
                fontSize: "0.9rem",
              }}
            >
              <i
                className="bi bi-info-circle me-2"
                style={{ color: "#d97706" }}
              />
              Tu pedido{" "}
              <strong style={{ fontFamily: "monospace" }}>{codigo}</strong>{" "}
              sigue reservado. Puedes volver a intentar el pago.
            </div>
          )}

          <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
            {codigo && (
              <button
                type="button"
                onClick={reintentarPago}
                disabled={reintentando}
                className="btn rounded-pill px-4 py-2 text-white fw-semibold"
                style={{ backgroundColor: "#eb0029", border: "none" }}
              >
                {reintentando ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Conectando con el banco…
                  </>
                ) : (
                  <>
                    <i className="bi bi-credit-card-2-back me-2" />
                    Reintentar pago
                  </>
                )}
              </button>
            )}
            <Link
              to={codigo ? `/pedido/${codigo}` : "/pedido"}
              className="btn rounded-pill px-4 py-2 fw-semibold"
              style={{ border: "1px solid #eb0029", color: "#eb0029" }}
            >
              <i className="bi bi-geo-alt me-2" />
              Ver estado del pedido
            </Link>
            <Link
              to="/"
              className="btn rounded-pill px-4 py-2 fw-semibold text-muted"
              style={{ border: "1px solid #dee2e6" }}
            >
              Ir al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
