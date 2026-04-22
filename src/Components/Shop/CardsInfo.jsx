import useCardsInfo from "../../hooks/useCardsInfo";

export default function CardsInfo() {
  const { data: cards = [], isLoading } = useCardsInfo();

  if (isLoading || cards.length === 0) return null;

  return (
    <section
      className="section-padding"
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #fff5f5 100%)",
      }}
    >
      <div className="container">
        <div className="row g-4 justify-content-center">
          {cards.map((card, i) => (
            <div key={i} className="col-md-6 col-lg-4">
              <div
                className="h-100 rounded-4 p-4 text-center bg-white shadow-sm"
                style={{
                  border: "1px solid rgba(235, 0, 41, 0.1)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(235, 0, 41, 0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 1px 3px rgba(0,0,0,0.05)";
                }}
              >
                {card.icono && (
                  <div
                    className="mx-auto mb-3 d-inline-flex align-items-center justify-content-center rounded-circle"
                    style={{
                      width: 72,
                      height: 72,
                      background:
                        "linear-gradient(135deg, #eb002915, #fc791a15)",
                      fontSize: "2.4rem",
                    }}
                  >
                    {card.icono}
                  </div>
                )}
                {card.titulo && (
                  <h4
                    className="fw-bold color-primario mb-2"
                    style={{ fontFamily: "var(--title-font)" }}
                  >
                    {card.titulo}
                  </h4>
                )}
                {card.descripcion && (
                  <p
                    className="text-muted mb-0"
                    style={{
                      fontSize: "0.95rem",
                      lineHeight: 1.6,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {card.descripcion}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
