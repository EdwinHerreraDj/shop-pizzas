import useCardsInfo from "../../hooks/useCardsInfo";

/* El panel guarda un emoji como icono: lo traducimos a Bootstrap Icons.
   Si no hay equivalencia, se deduce por el título de la tarjeta. */
const POR_EMOJI = {
  "🛵": "bi-scooter",
  "🚚": "bi-truck",
  "🚗": "bi-car-front-fill",
  "🍕": "bi-fire",
  "📞": "bi-telephone-fill",
  "☎️": "bi-telephone-fill",
  "📱": "bi-phone-fill",
  "⏰": "bi-clock-fill",
  "🕐": "bi-clock-fill",
  "💳": "bi-credit-card-fill",
  "💶": "bi-cash-coin",
  "📍": "bi-geo-alt-fill",
  "✉️": "bi-envelope-fill",
  "📧": "bi-envelope-fill",
  "⭐": "bi-star-fill",
  "❤️": "bi-heart-fill",
  "🎉": "bi-stars",
  "🥗": "bi-flower1",
};
const POR_TITULO = [
  ["entrega", "bi-scooter"],
  ["reparto", "bi-scooter"],
  ["domicilio", "bi-scooter"],
  ["pizza", "bi-fire"],
  ["horno", "bi-fire"],
  ["duda", "bi-headset"],
  ["contact", "bi-headset"],
  ["llam", "bi-telephone-fill"],
  ["horario", "bi-clock-fill"],
  ["pago", "bi-wallet2"],
  ["oferta", "bi-tag-fill"],
];
const iconoTarjeta = (card) =>
  POR_EMOJI[card.icono?.trim()] ??
  POR_TITULO.find(([k]) => String(card.titulo).toLowerCase().includes(k))?.[1] ??
  "bi-info-circle-fill";

/* Convierte teléfonos españoles (9 cifras, con o sin espacios) en enlaces tel: */
const conTelefonos = (texto) =>
  String(texto)
    .split(/(\b[6789]\d{2}[\s.]?\d{3}[\s.]?\d{3}\b)/g)
    .map((trozo, i) =>
      i % 2 === 1 ? (
        <a key={i} href={`tel:${trozo.replace(/\D/g, "")}`} className="info-tel">
          {trozo}
        </a>
      ) : (
        trozo
      ),
    );

export default function CardsInfo() {
  const { data: cards = [], isLoading } = useCardsInfo();

  if (isLoading || cards.length === 0) return null;

  return (
    <section className="info-seccion">
      <div className="container">
        <div className="text-center mb-4">
          <span className="info-etiqueta">
            <i className="bi bi-heart-fill me-1" />
            Bueno saberlo
          </span>
          <h2 className="info-titulo">Antes de pedir, te contamos</h2>
        </div>

        <div className="row g-4 justify-content-center">
          {cards.map((card, i) => {
            const lineas = String(card.descripcion ?? "")
              .split("\n")
              .map((l) => l.trim())
              .filter(Boolean);

            return (
              <div key={i} className="col-md-6 col-lg-4">
                <article className="info-card">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <span className="info-card-icono">
                      <i className={`bi ${iconoTarjeta(card)}`} />
                    </span>
                    {card.titulo && <h3 className="info-card-titulo">{card.titulo}</h3>}
                  </div>

                  {lineas.length > 1 ? (
                    <ul className="info-card-lista">
                      {lineas.map((l, j) => (
                        <li key={j}>
                          <i className="bi bi-check-circle-fill" />
                          <span>{conTelefonos(l)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    lineas[0] && <p className="info-card-texto">{conTelefonos(lineas[0])}</p>
                  )}
                </article>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .info-seccion {
          padding: 70px 0;
          background: linear-gradient(180deg, #fff8f1 0%, #fff 100%);
        }
        .info-etiqueta {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.8rem;
          border-radius: 999px;
          background: #ffe9ec;
          color: #eb0029;
          font-size: 0.8rem;
          font-weight: 700;
        }
        .info-titulo {
          margin: 0.6rem 0 0;
          font-size: 2rem;
          font-weight: 800;
          color: #1b1b1b;
          text-transform: none;
        }
        .info-card {
          height: 100%;
          padding: 1.5rem;
          border-radius: 22px;
          background: #fff;
          border: 1px solid #f3e3d6;
          box-shadow: 0 6px 22px rgba(120, 60, 20, 0.07);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .info-card:hover { transform: translateY(-4px); box-shadow: 0 14px 34px rgba(120, 60, 20, 0.13); }
        .info-card-icono {
          flex-shrink: 0;
          width: 54px;
          height: 54px;
          border-radius: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: #fff;
          background: linear-gradient(135deg, #eb0029, #fc791a);
          box-shadow: 0 8px 18px rgba(235, 0, 41, 0.25);
        }
        .info-card-titulo { margin: 0; font-size: 1.25rem; font-weight: 800; color: #1b1b1b; text-transform: none; line-height: 1.2; }
        .info-card-lista { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.6rem; }
        .info-card-lista li { display: flex; gap: 0.55rem; font-size: 0.92rem; line-height: 1.5; color: #5a4a40; }
        .info-card-lista i { color: #fc791a; margin-top: 0.2rem; flex-shrink: 0; }
        .info-card-texto { margin: 0; font-size: 0.95rem; line-height: 1.55; color: #5a4a40; }
        .info-tel { color: #eb0029 !important; font-weight: 800; text-decoration: none; white-space: nowrap; }
        .info-tel:hover { text-decoration: underline; }

        @media (max-width: 575px) {
          .info-seccion { padding: 50px 0; }
          .info-titulo { font-size: 1.5rem; }
          .info-card { padding: 1.25rem; }
        }
      `}</style>
    </section>
  );
}
