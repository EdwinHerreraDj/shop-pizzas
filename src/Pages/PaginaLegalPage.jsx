import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import { usePaginaLegal } from "../hooks/usePaginaLegal";

export default function PaginaLegalPage() {
  const { slug } = useParams();
  const { data, isLoading, isError } = usePaginaLegal(slug);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [slug]);

  if (isLoading) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "60vh" }}
      >
        <div
          className="spinner-border"
          style={{ color: "#eb0029", width: "3rem", height: "3rem" }}
          role="status"
        />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="section-padding bg-color2">
        <div className="container text-center py-5" style={{ maxWidth: 560 }}>
          <div className="bg-white rounded-4 shadow-sm p-5">
            <div className="mb-3" style={{ fontSize: "3rem" }}>
              📄
            </div>
            <h2
              className="fw-bold color-primario mb-2"
              style={{ fontFamily: "var(--title-font)" }}
            >
              Página no encontrada
            </h2>
            <p className="text-muted mb-4">
              La página legal que buscas no existe o ha sido desactivada.
            </p>
            <Link
              to="/"
              className="btn rounded-pill px-4 py-2 text-white fw-semibold"
              style={{ backgroundColor: "#eb0029" }}
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const fechaActualizacion = data.updated_at
    ? new Date(data.updated_at).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="section-padding bg-color2">
      <div className="container" style={{ maxWidth: 860 }}>
        <div className="bg-white rounded-4 shadow-sm p-4 p-md-5">
          {/* Título */}
          <h1
            className="fw-bold color-primario mb-2"
            style={{ fontFamily: "var(--title-font)" }}
          >
            {data.titulo}
          </h1>

          {fechaActualizacion && (
            <p className="text-muted small mb-4">
              Última actualización: {fechaActualizacion}
            </p>
          )}

          <hr />

          {/* Contenido — respetando saltos de línea y HTML básico */}
          <div
            className="pagina-legal-contenido"
            style={{
              lineHeight: 1.8,
              fontSize: "1rem",
              color: "#374151",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
            dangerouslySetInnerHTML={{
              __html:
                data.contenido ||
                '<p class="text-muted fst-italic">Esta página aún no tiene contenido.</p>',
            }}
          />
        </div>
      </div>
    </div>
  );
}
