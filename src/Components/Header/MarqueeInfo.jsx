import useCardsInfo from "../../hooks/useCardsInfo";

/**
 * Marquee infinito que se muestra encima del header.
 * Usa las cards configuradas desde el admin (Info en tienda).
 */
export default function MarqueeInfo() {
  const { data: cards = [] } = useCardsInfo();

  if (!cards.length) return null;

  // Duplicamos los items para conseguir el efecto de loop infinito sin saltos
  const items = [...cards, ...cards];

  return (
    <div
      className="marquee-info-bar"
      style={{
        background: "linear-gradient(90deg, #eb0029, #fc791a, #eb0029)",
        color: "#fff",
        overflow: "hidden",
        position: "relative",
        height: 36,
      }}
    >
      <div
        className="marquee-track"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "3rem",
          whiteSpace: "nowrap",
          height: "100%",
          // La duración escala con el nº de items para mantener velocidad constante
          animation: `marquee-scroll ${cards.length * 12}s linear infinite`,
        }}
      >
        {items.map((card, i) => (
          <span
            key={i}
            className="d-inline-flex align-items-center gap-2"
            style={{ fontSize: "0.85rem", lineHeight: 1 }}
          >
            {card.icono && (
              <span style={{ fontSize: "1rem" }}>{card.icono}</span>
            )}
            {card.titulo && (
              <strong style={{ letterSpacing: "0.3px" }}>
                {card.titulo}
              </strong>
            )}
            {card.titulo && card.descripcion && (
              <span style={{ opacity: 0.6 }}>·</span>
            )}
            {card.descripcion && (
              <span style={{ opacity: 0.95 }}>{card.descripcion}</span>
            )}
            <span
              className="ms-3"
              style={{ opacity: 0.5, fontSize: "0.7rem" }}
            >
              ●
            </span>
          </span>
        ))}
      </div>

      <style>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-info-bar:hover .marquee-track {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
