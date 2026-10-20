import { Link } from "react-router-dom";

export default function TiendaCerrada({ titulo, mensaje }) {
  return (
    <div
      className="section-padding d-flex align-items-center justify-content-center"
      style={{
        minHeight: "70vh",
        background: "linear-gradient(135deg, #fff5f5 0%, #fef3c7 100%)",
      }}
    >
      <div className="container" style={{ maxWidth: 560 }}>
        <div
          className="text-center bg-white rounded-4 shadow-lg p-5"
          style={{ border: "1px solid rgba(235, 0, 41, 0.1)" }}
        >
          {/* Icono */}
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
            style={{
              width: 110,
              height: 110,
              background: "linear-gradient(135deg, #eb0029, #fc791a)",
              fontSize: "3rem",
              color: "#fff",
            }}
          >
            <i className="bi bi-lock-fill" />
          </div>

          {/* Título */}
          <h2
            className="fw-bold color-primario mb-3"
            style={{ fontFamily: "var(--title-font)" }}
          >
            {titulo || "¡Estamos cerrados!"}
          </h2>

          {/* Mensaje */}
          <p
            className="text-muted mb-4"
            style={{
              fontSize: "1rem",
              lineHeight: 1.6,
              whiteSpace: "pre-line",
            }}
          >
            {mensaje ||
              "Volveremos muy pronto para seguir preparándote las mejores pizzas. ¡Gracias por tu paciencia!"}
          </p>

          {/* Separador */}
          <hr
            className="my-4"
            style={{ borderColor: "rgba(235, 0, 41, 0.15)" }}
          />

          {/* Info */}
          <div className="d-flex align-items-center justify-content-center gap-2 text-muted small mb-4">
            <i className="bi bi-info-circle" />
            <span>
              Si tienes un pedido en curso, puedes seguir consultando su estado
            </span>
          </div>

          {/* Botones */}
          <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
            <Link
              to="/"
              className="btn rounded-pill px-4 py-2 text-white fw-semibold"
              style={{ backgroundColor: "#eb0029" }}
            >
              <i className="bi bi-house me-2" />
              Volver al inicio
            </Link>
            <Link
              to="/pedido"
              className="btn btn-outline rounded-pill px-4 py-2 fw-semibold"
              style={{ border: "1px solid #eb0029", color: "#eb0029" }}
            >
              <i className="bi bi-search me-2" />
              Seguir mi pedido
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
