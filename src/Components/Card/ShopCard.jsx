import { Link } from "react-router-dom";

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

export default function ShopCard({ producto, onPersonalizar, onAgregar }) {
  const DEFAULT_IMG = "/assets/img/food-items/item1_4.png";
  const imgSrc = producto?.imagen || DEFAULT_IMG;

  const tamanos = producto?.tamanos || [];
  const price = getPrecioMinimo(tamanos);
  const tieneVariosTamanos = tamanos.length > 1;

  return (
    <div className="dishes-card style2 wow fadeInUp" data-wow-delay="0.2s">
      <div className="dishes-thumb">
        <div className="w-full h-48 overflow-hidden rounded-lg flex items-center justify-center">
          <img
            src={imgSrc}
            alt={producto?.nombre || "thumb"}
            className="imagen-producto object-cover object-center"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = DEFAULT_IMG;
            }}
          />
        </div>

        <div className="circle-shape">
          <img
            className="cir36"
            src="/assets/img/food-items/circleShape.png"
            alt="shape"
          />
        </div>
      </div>

      <div className="dishes-content">
        <h3>{producto?.nombre}</h3>
        <div className="text">{producto?.descripcion || "Sin descripción"}</div>

        <h6>
          {tieneVariosTamanos && (
            <span
              className="text-muted fw-normal me-1"
              style={{ fontSize: "0.75em" }}
            >
              Desde
            </span>
          )}
          {formatEUR(price)}
        </h6>

        <div className="flex gap-2">
          {producto?.personalizable ? (
            <>
              <button
                type="button"
                className="theme-btn style6"
                onClick={() => onPersonalizar?.(producto)}
              >
                Personalizar <i className="bi bi-vignette"></i>
              </button>

              <button
                type="button"
                className="theme-btn style6 mt-2"
                onClick={() => onAgregar?.(producto)}
              >
                Añadir <i className="bi bi-basket2"></i>
              </button>
            </>
          ) : (
            <button
              type="button"
              className="theme-btn style6"
              onClick={() => onAgregar?.(producto)}
            >
              Añadir <i className="bi bi-basket2"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
