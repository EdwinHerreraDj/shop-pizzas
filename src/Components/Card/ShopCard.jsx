const formatEUR = (value) =>
  typeof value === "number"
    ? new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
      }).format(value)
    : value
      ? new Intl.NumberFormat("es-ES", {
          style: "currency",
          currency: "EUR",
        }).format(parseFloat(value))
      : "—";

const getPrecioMinimo = (tamanos = []) => {
  if (!tamanos.length) return null;

  const valores = tamanos.map((t) => parseFloat(t.precio));
  return Math.min(...valores);
};

// La descripción llega con Mayúsculas En Cada Palabra: la mostramos en tono natural
const textoNatural = (texto = "") => {
  const t = String(texto).trim().toLowerCase();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : "";
};

export default function ShopCard({ producto, onPersonalizar, onAgregar }) {
  const DEFAULT_IMG = "/assets/img/food-items/item1_4.png";
  const imgSrc = producto?.imagen || DEFAULT_IMG;

  const tamanos = producto?.tamanos || [];
  const price = getPrecioMinimo(tamanos);
  const tieneVariosTamanos = tamanos.length > 1;
  const descripcion = textoNatural(producto?.descripcion);

  return (
    <article className="carta-card">
      <div className="carta-card-imagen">
        <img
          src={imgSrc}
          alt={producto?.nombre || "Producto"}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = DEFAULT_IMG;
          }}
        />
        {tieneVariosTamanos && (
          <span className="carta-card-tamanos">
            <i className="bi bi-rulers me-1" />
            {tamanos.length} tamaños
          </span>
        )}
      </div>

      <div className="carta-card-cuerpo">
        <h3 className="carta-card-nombre">{producto?.nombre}</h3>
        {descripcion && <p className="carta-card-descripcion">{descripcion}</p>}

        <div className="carta-card-pie">
          <div className="carta-card-precio">
            {tieneVariosTamanos && <span>Desde</span>}
            {formatEUR(price)}
          </div>

          <div className="carta-card-acciones">
            {producto?.personalizable && (
              <button
                type="button"
                className="carta-btn secundario"
                onClick={() => onPersonalizar?.(producto)}
                aria-label={`Personalizar ${producto?.nombre}`}
                title="Personalizar"
              >
                <i className="bi bi-sliders" />
                <span>Personalizar</span>
              </button>
            )}
            <button
              type="button"
              className="carta-btn principal"
              onClick={() => onAgregar?.(producto)}
              aria-label={`Añadir ${producto?.nombre}`}
            >
              <i className="bi bi-bag-plus-fill" />
              <span>Añadir</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
