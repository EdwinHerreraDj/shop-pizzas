import { Link } from "react-router-dom";
import { useCarrito } from "../../context/CarritoContext";
import usePrecios from "../../hooks/usePrecios";
import AvisoEntrega from "./AvisoEntrega";
import { PizzaDibujo } from "../PizzaBuilder/ui";
import "../../assets/crear-pizza.css";

/* ── Helpers de presentación ─────────────────────── */
const nombreItem = (item) => {
  if (item.tipo === "pizza-mitades") return "Pizza mitad y mitad";
  if (item.tipo === "pizza-entera") return "Pizza a tu gusto";
  return item.nombre || "Producto";
};

// Pizzas: dibujo de pizza. Resto (bebidas, postres, tamaño único): icono.
const esPizza = (item) =>
  item.tipo === "pizza-entera" ||
  item.tipo === "pizza-mitades" ||
  (item.tamano && !/^[uú]nico$/i.test(item.tamano));

const Extras = ({ extras = [] }) =>
  extras.map((i) => (
    <span key={`e-${i.id}`} className="cp-chip extra carrito-chip">
      <i className="bi bi-plus-circle-fill" />
      {i.nombre}
      {i.cantidad > 1 && <strong>×{i.cantidad}</strong>}
    </span>
  ));

const Quitados = ({ quitados = [] }) =>
  quitados.map((i) => (
    <span key={`q-${i.id}`} className="cp-chip quitado carrito-chip">
      <i className="bi bi-dash-circle" />
      {i.nombre}
    </span>
  ));

const Mitad = ({ numero, mitad, formatEUR }) => {
  if (!mitad) return null;
  const total = (Number(mitad.precioBase) || 0) + (Number(mitad.precioExtras) || 0);
  const tieneCambios = mitad.ingredientesExtras?.length || mitad.ingredientesQuitados?.length;

  return (
    <div className="carrito-mitad">
      <div className="d-flex justify-content-between align-items-center gap-2">
        <span className="d-inline-flex align-items-center gap-2 fw-semibold small">
          <span className={`carrito-mitad-num ${numero === 2 ? "dos" : ""}`}>{numero}</span>
          {mitad.nombre || "Personalizada"}
        </span>
        {total > 0 && <span className="small text-muted">{formatEUR(total)}</span>}
      </div>
      {tieneCambios ? (
        <div className="cp-chips mt-2">
          <Extras extras={mitad.ingredientesExtras} />
          <Quitados quitados={mitad.ingredientesQuitados} />
        </div>
      ) : null}
    </div>
  );
};

/* ── Componente ──────────────────────────────────── */
const Cart = () => {
  const { carrito, eliminarItem, actualizarCantidad, totalCarrito } =
    useCarrito();
  const { formatEUR } = usePrecios();

  const unidades = carrito.reduce((a, i) => a + (i.cantidad || 0), 0);

  /* ── Carrito vacío ── */
  if (carrito.length === 0) {
    return (
      <div className="section-padding carrito-pagina">
        <div className="container" style={{ maxWidth: 560 }}>
          <div className="cp-seccion text-center py-5">
            <div className="mb-3 d-inline-block carrito-vacio-dibujo">
              <PizzaDibujo tipo="entera" size={96} />
            </div>
            <h2 className="carrito-titulo mb-2">Tu carrito está vacío</h2>
            <p className="text-muted mb-4" style={{ lineHeight: 1.5 }}>
              ¿Te apetece una pizza? Echa un vistazo a la carta o crea la tuya.
            </p>
            <Link to="/shop" className="cp-anadir d-inline-flex text-white text-decoration-none px-4">
              <i className="bi bi-book-half" />
              Ver la carta
            </Link>
          </div>
        </div>
        <EstilosCarrito />
      </div>
    );
  }

  return (
    <div className="section-padding carrito-pagina">
      <div className="container">
        <div className="row g-4 align-items-start">
          {/* ── PRODUCTOS ── */}
          <div className="col-lg-7">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h2 className="carrito-titulo mb-0">
                <i className="bi bi-basket2-fill me-2" style={{ color: "#fc791a" }} />
                Lo que vas a pedir
              </h2>
              <span className="carrito-unidades">
                {unidades} {unidades === 1 ? "producto" : "productos"}
              </span>
            </div>

            <div className="d-flex flex-column gap-3">
              {carrito.map((item, index) => {
                const precioUnitario =
                  item.tipo === "pizza-mitades"
                    ? item.precioTotal / item.cantidad
                    : (Number(item.precioBase) || 0) +
                      (Number(item.precioExtras) || 0);
                const mitades = item.tipo === "pizza-mitades";

                return (
                  <article key={item.uid ?? index} className="carrito-item">
                    <div className="carrito-item-cabecera">
                      <div className="carrito-item-icono">
                        {esPizza(item) ? (
                          <PizzaDibujo tipo={mitades ? "mitades" : "entera"} size={52} />
                        ) : (
                          <i className="bi bi-bag-heart-fill" />
                        )}
                      </div>

                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <div className="carrito-item-nombre">{nombreItem(item)}</div>
                        {item.tamano && (
                          <span className="carrito-tamano">
                            <i className="bi bi-rulers me-1" />
                            {item.tamano}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        className="carrito-quitar"
                        onClick={() => eliminarItem(index)}
                        aria-label={`Quitar ${nombreItem(item)} del carrito`}
                      >
                        <i className="bi bi-x-lg" />
                      </button>
                    </div>

                    {/* Detalle */}
                    {mitades ? (
                      <div className="d-flex flex-column gap-2 mt-3">
                        <Mitad numero={1} mitad={item.mitades?.mitadA} formatEUR={formatEUR} />
                        <Mitad numero={2} mitad={item.mitades?.mitadB} formatEUR={formatEUR} />
                      </div>
                    ) : item.ingredientesExtras?.length || item.ingredientesQuitados?.length ? (
                      <div className="cp-chips mt-3">
                        <Extras extras={item.ingredientesExtras} />
                        <Quitados quitados={item.ingredientesQuitados} />
                      </div>
                    ) : null}

                    {/* Cantidad + precio */}
                    <div className="carrito-item-pie">
                      <div className="cp-cantidad">
                        <button
                          type="button"
                          className="cp-cantidad-btn menos"
                          onClick={() =>
                            item.cantidad === 1
                              ? eliminarItem(index)
                              : actualizarCantidad(index, item.cantidad - 1)
                          }
                          aria-label={item.cantidad === 1 ? "Quitar del carrito" : "Uno menos"}
                        >
                          <i className={`bi ${item.cantidad === 1 ? "bi-trash3" : "bi-dash-lg"}`} />
                        </button>
                        <span className="cp-cantidad-valor">{item.cantidad}</span>
                        <button
                          type="button"
                          className="cp-cantidad-btn mas"
                          onClick={() => actualizarCantidad(index, item.cantidad + 1)}
                          aria-label="Uno más"
                        >
                          <i className="bi bi-plus-lg" />
                        </button>
                      </div>

                      <div className="text-end">
                        {item.cantidad > 1 && (
                          <div className="small text-muted">
                            {formatEUR(precioUnitario)} × {item.cantidad}
                          </div>
                        )}
                        <div className="carrito-item-precio">{formatEUR(item.precioTotal)}</div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <Link to="/shop" className="carrito-seguir">
              <i className="bi bi-plus-circle" />
              Añadir algo más de la carta
            </Link>
          </div>

          {/* ── RESUMEN ── */}
          <div className="col-lg-5">
            <aside className="cp-seccion carrito-resumen">
              <div className="cp-seccion-cabecera">
                <span className="cp-seccion-icono">
                  <i className="bi bi-receipt" />
                </span>
                <div>
                  <h3 className="cp-seccion-titulo">Resumen</h3>
                  <p className="cp-seccion-sub">Entrega y pago, en el siguiente paso.</p>
                </div>
              </div>

              <AvisoEntrega className="mb-3" />

              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">
                  Productos ({unidades})
                </span>
                <span className="fw-semibold">{formatEUR(totalCarrito)}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center small text-muted mb-3">
                <span>Envío</span>
                <span>Se calcula al finalizar</span>
              </div>

              <div className="carrito-total">
                <span>Total</span>
                <span>{formatEUR(totalCarrito)}</span>
              </div>

              <Link
                to="/shop/checkout"
                className="cp-anadir w-100 text-white text-decoration-none mt-3"
              >
                <i className="bi bi-bag-check-fill" />
                Finalizar pedido
                <i className="bi bi-arrow-right" />
              </Link>

              <Link to="/shop" className="carrito-seguir justify-content-center mt-2 mb-0">
                Seguir comprando
              </Link>
            </aside>
          </div>
        </div>
      </div>
      <EstilosCarrito />
    </div>
  );
};

/* ── Estilos propios de la página (el resto viene de crear-pizza.css) ── */
function EstilosCarrito() {
  return (
    <style>{`
      .carrito-pagina { background: #fff8f1; }
      .carrito-pagina.section-padding { padding: 48px 0 80px; }
      .carrito-titulo {
        font-size: 1.35rem;
        font-weight: 800;
        color: #1b1b1b;
        text-transform: none;
        display: flex;
        align-items: center;
      }
      .carrito-unidades {
        padding: 0.3rem 0.8rem;
        border-radius: 999px;
        background: #ffe9ec;
        color: #eb0029;
        font-size: 0.82rem;
        font-weight: 700;
        white-space: nowrap;
      }

      .carrito-item {
        background: #fff;
        border-radius: 20px;
        padding: 1rem 1.1rem;
        border: 1px solid #f3e3d6;
        box-shadow: 0 6px 22px rgba(120, 60, 20, 0.06);
      }
      .carrito-item-cabecera { display: flex; align-items: center; gap: 0.85rem; }
      .carrito-item-icono {
        flex-shrink: 0;
        width: 58px;
        height: 58px;
        border-radius: 50%;
        background: #fff4ea;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        color: #fc791a;
      }
      .carrito-item-nombre { font-weight: 800; font-size: 1.02rem; color: #1b1b1b; line-height: 1.25; }
      .carrito-tamano {
        display: inline-flex;
        align-items: center;
        margin-top: 0.3rem;
        padding: 0.1rem 0.6rem;
        border-radius: 999px;
        background: #f5efe9;
        color: #6b5a4f;
        font-size: 0.78rem;
        font-weight: 600;
      }
      .carrito-quitar {
        flex-shrink: 0;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        border: 0;
        background: #f6f1ec;
        color: #8a7a6e;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s ease, color 0.2s ease;
      }
      .carrito-quitar:hover { background: #ffe1e5; color: #eb0029; }
      .carrito-chip { cursor: default; font-size: 0.8rem; padding: 0.3rem 0.75rem; }

      .carrito-mitad { background: #fffaf5; border: 1px dashed #f1d2c2; border-radius: 14px; padding: 0.6rem 0.8rem; }
      .carrito-mitad-num {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: #eb0029;
        color: #fff;
        font-size: 0.72rem;
        font-weight: 700;
      }
      .carrito-mitad-num.dos { background: #fc791a; }

      .carrito-item-pie {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 0.9rem;
        padding-top: 0.8rem;
        border-top: 1px solid #f3e3d6;
      }
      .carrito-item-precio { font-weight: 800; font-size: 1.1rem; color: #eb0029; }

      .carrito-seguir {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        margin: 1rem 0 0;
        color: #c8590a !important;
        font-weight: 700;
        text-decoration: none;
        width: 100%;
      }
      .carrito-seguir:hover { color: #eb0029 !important; }

      .carrito-resumen { position: sticky; top: 150px; }
      .carrito-total {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 0.8rem;
        border-top: 2px dashed #f1d2c2;
        font-size: 1.3rem;
        font-weight: 800;
        color: #1b1b1b;
      }
      .carrito-total span:last-child { color: #eb0029; }
      .carrito-vacio-dibujo { animation: carrito-flota 3s ease-in-out infinite; }
      @keyframes carrito-flota { 50% { transform: translateY(-6px) rotate(8deg); } }

      @media (max-width: 991px) { .carrito-resumen { position: static; } }
      @media (max-width: 575px) {
        .carrito-titulo { font-size: 1.15rem; }
        .carrito-item { padding: 0.9rem; }
        .carrito-item-icono { width: 48px; height: 48px; }
      }
      @media (prefers-reduced-motion: reduce) { .carrito-vacio-dibujo { animation: none; } }
    `}</style>
  );
}

export default Cart;
