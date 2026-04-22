import useEmpresa from "../hooks/useEmpresa";

function TarjetaContacto({ icono, titulo, children, href, bgColor }) {
  const Inner = (
    <div
      className="h-100 p-4 rounded-4 bg-white shadow-sm text-center"
      style={{
        border: "1px solid rgba(235, 0, 41, 0.1)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(235, 0, 41, 0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
      }}
    >
      <div
        className="mx-auto mb-3 d-inline-flex align-items-center justify-content-center rounded-circle"
        style={{
          width: 64,
          height: 64,
          background: bgColor || "linear-gradient(135deg, #eb002915, #fc791a15)",
          fontSize: "1.6rem",
          color: "#eb0029",
        }}
      >
        <i className={`bi ${icono}`} />
      </div>
      <h5
        className="fw-bold mb-2"
        style={{ fontFamily: "var(--title-font)", color: "#eb0029" }}
      >
        {titulo}
      </h5>
      <div className="text-muted" style={{ fontSize: "0.95rem" }}>
        {children}
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="text-decoration-none" target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
        {Inner}
      </a>
    );
  }
  return Inner;
}

export default function ContactoPage() {
  const { data: empresa, isLoading } = useEmpresa();

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

  const direccionCompleta = [
    empresa?.direccion,
    empresa?.codigo_postal,
    empresa?.ciudad,
  ]
    .filter(Boolean)
    .join(", ");

  const whatsappLink = empresa?.whatsapp
    ? `https://wa.me/${empresa.whatsapp.replace(/\D/g, "")}`
    : null;

  return (
    <div className="section-padding bg-color2">
      <div className="container">
        {/* Cabecera */}
        <div className="text-center mb-5">
          <h1
            className="fw-bold color-primario mb-2"
            style={{ fontFamily: "var(--title-font)" }}
          >
            Contacto
          </h1>
          <p className="text-muted" style={{ maxWidth: 560, margin: "0 auto" }}>
            Estamos aquí para atenderte. Llámanos, escríbenos o visítanos en
            nuestro local.
          </p>
        </div>

        {/* Tarjetas de contacto */}
        <div className="row g-4 mb-5">
          {empresa?.telefono && (
            <div className="col-md-6 col-lg-3">
              <TarjetaContacto
                icono="bi-telephone-fill"
                titulo="Teléfono"
                href={`tel:${empresa.telefono.replace(/\s/g, "")}`}
              >
                {empresa.telefono}
              </TarjetaContacto>
            </div>
          )}

          {whatsappLink && (
            <div className="col-md-6 col-lg-3">
              <TarjetaContacto
                icono="bi-whatsapp"
                titulo="WhatsApp"
                href={whatsappLink}
                bgColor="linear-gradient(135deg, #25d36615, #25d36630)"
              >
                Escríbenos directo
              </TarjetaContacto>
            </div>
          )}

          {empresa?.email && (
            <div className="col-md-6 col-lg-3">
              <TarjetaContacto
                icono="bi-envelope-fill"
                titulo="Email"
                href={`mailto:${empresa.email}`}
              >
                {empresa.email}
              </TarjetaContacto>
            </div>
          )}

          {direccionCompleta && (
            <div className="col-md-6 col-lg-3">
              <TarjetaContacto icono="bi-geo-alt-fill" titulo="Dirección">
                {direccionCompleta}
              </TarjetaContacto>
            </div>
          )}
        </div>

        {/* Mapa de Google */}
        {empresa?.google_maps_embed && (
          <div className="bg-white rounded-4 shadow-sm p-3 p-md-4">
            <h4
              className="fw-bold color-primario mb-3 text-center"
              style={{ fontFamily: "var(--title-font)" }}
            >
              <i className="bi bi-map me-2" />
              Cómo llegar
            </h4>
            <div
              className="rounded-3 overflow-hidden"
              style={{ height: "450px" }}
              dangerouslySetInnerHTML={{ __html: empresa.google_maps_embed }}
            />
          </div>
        )}

        {/* Redes sociales */}
        {(empresa?.facebook || empresa?.instagram) && (
          <div className="text-center mt-5">
            <h5 className="fw-bold color-primario mb-3">Síguenos</h5>
            <div className="d-flex justify-content-center gap-3">
              {empresa.facebook && (
                <a
                  href={empresa.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="d-inline-flex align-items-center justify-content-center rounded-circle text-white"
                  style={{
                    width: 48,
                    height: 48,
                    backgroundColor: "#1877f2",
                    fontSize: "1.3rem",
                  }}
                >
                  <i className="bi bi-facebook" />
                </a>
              )}
              {empresa.instagram && (
                <a
                  href={empresa.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="d-inline-flex align-items-center justify-content-center rounded-circle text-white"
                  style={{
                    width: 48,
                    height: 48,
                    background:
                      "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)",
                    fontSize: "1.3rem",
                  }}
                >
                  <i className="bi bi-instagram" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
