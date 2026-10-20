import { useEffect, useMemo, useRef, useState } from "react";
import { Tabs, Tab } from "react-bootstrap";
import usePizzasExistentes from "../../hooks/usePizzasExistentes";
import useIngredientesConPrecios from "../../hooks/useIngredientesConPrecios";
import { TituloCategoria } from "./ui";

const toNum = (v) => Number.parseFloat(v ?? 0) || 0;

const formatEUR = (v) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(Number.isFinite(v) ? v : 0);

export default function PizzaExistenteSelector({ tamanoId, onSelect }) {
  /* ═══════════════════════════════════════════════
     LISTADO PAGINADO
  ═══════════════════════════════════════════════ */
  const [page, setPage] = useState(1);
  const { data: pizzasResponse, isLoading } = usePizzasExistentes(page);

  const pizzas = useMemo(() => pizzasResponse?.data ?? [], [pizzasResponse]);
  const currentPage = pizzasResponse?.current_page ?? 1;
  const lastPage = pizzasResponse?.last_page ?? 1;

  /* ═══════════════════════════════════════════════
     SELECCIÓN + DETALLE
  ═══════════════════════════════════════════════ */
  const [pizzaSeleccionada, setPizzaSeleccionada] = useState(null);
  const { data: detalle, isLoading: loadingDetalle } =
    useIngredientesConPrecios(pizzaSeleccionada?.id);

  /* ═══════════════════════════════════════════════
     INGREDIENTES
  ═══════════════════════════════════════════════ */
  const [ingredientes, setIngredientes] = useState([]);

  useEffect(() => {
    if (!detalle?.ingredientes) return;
    const inicial = Object.values(detalle.ingredientes)
      .flat()
      .map((ing) => ({ ...ing, cantidad: ing.incluido ? 1 : 0 }));
    setIngredientes(inicial);
  }, [detalle]);

  useEffect(() => {
    if (!detalle?.ingredientes) return;
    const inicial = Object.values(detalle.ingredientes)
      .flat()
      .map((ing) => ({ ...ing, cantidad: ing.incluido ? 1 : 0 }));
    setIngredientes(inicial);
  }, [tamanoId, detalle]);

  /* ═══════════════════════════════════════════════
     HELPERS DE PRECIO
  ═══════════════════════════════════════════════ */
  const getPrecioIngrediente = (ing) => {
    if (ing.precio_por_tamano) {
      return toNum(ing.precio_por_tamano[tamanoId]);
    }
    if (Array.isArray(ing.precios)) {
      const p = ing.precios.find(
        (pr) => Number(pr.tamano_id) === Number(tamanoId),
      );
      return toNum(p?.precio);
    }
    return 0;
  };

  const getPrecioBasePizza = () => {
    if (!pizzaSeleccionada) return 0;
    if (pizzaSeleccionada.tamanos) {
      const t = pizzaSeleccionada.tamanos.find(
        (t) => Number(t.tamano_id) === Number(tamanoId),
      );
      if (t) return toNum(t.precio);
    }
    if (detalle?.tamanos) {
      const t = detalle.tamanos.find((t) => Number(t.id) === Number(tamanoId));
      if (t) return toNum(t.precio);
    }
    return 0;
  };

  /* ═══════════════════════════════════════════════
     ACCIONES
  ═══════════════════════════════════════════════ */
  const aumentar = (ing) => {
    const max = ing.max_cantidad ?? 3;
    setIngredientes((prev) =>
      prev.map((i) =>
        i.id === ing.id && i.cantidad < max
          ? { ...i, cantidad: i.cantidad + 1 }
          : i,
      ),
    );
  };

  const disminuir = (ing) => {
    setIngredientes((prev) =>
      prev.map((i) =>
        i.id === ing.id && i.cantidad > 0
          ? { ...i, cantidad: i.cantidad - 1 }
          : i,
      ),
    );
  };

  const toggleBase = (ing) => {
    setIngredientes((prev) =>
      prev.map((i) =>
        i.id === ing.id ? { ...i, cantidad: i.cantidad > 0 ? 0 : 1 } : i,
      ),
    );
  };

  const quitarExtra = (id) => {
    setIngredientes((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        return { ...i, cantidad: i.incluido ? 1 : 0 };
      }),
    );
  };

  /* ═══════════════════════════════════════════════
     DERIVADOS
  ═══════════════════════════════════════════════ */
  const precioExtras = useMemo(() => {
    return ingredientes.reduce((acc, ing) => {
      const cobrables = ing.incluido
        ? Math.max(0, ing.cantidad - 1)
        : ing.cantidad;
      if (cobrables === 0) return acc;
      return acc + getPrecioIngrediente(ing) * cobrables;
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ingredientes, tamanoId]);

  const extrasAnadidos = ingredientes.filter(
    (i) => (!i.incluido && i.cantidad > 0) || (i.incluido && i.cantidad > 1),
  );

  const baseQuitados = ingredientes.filter(
    (i) => i.incluido && i.cantidad === 0,
  );

  /* ═══════════════════════════════════════════════
     EMITIR PAYLOAD (anti-loop)
  ═══════════════════════════════════════════════ */
  const lastPayloadRef = useRef(null);

  useEffect(() => {
    if (!pizzaSeleccionada) {
      if (lastPayloadRef.current !== null) {
        lastPayloadRef.current = null;
        onSelect(null);
      }
      return;
    }
    if (!detalle) return;

    const precioBase = getPrecioBasePizza();

    const ingredientesExtras = ingredientes
      .filter(
        (i) =>
          (!i.incluido && i.cantidad > 0) || (i.incluido && i.cantidad > 1),
      )
      .map((i) => ({
        id: i.id,
        nombre: i.nombre,
        cantidad: i.incluido ? i.cantidad - 1 : i.cantidad,
        precioUnitario: getPrecioIngrediente(i),
      }));

    const ingredientesQuitados = ingredientes
      .filter((i) => i.incluido && i.cantidad === 0)
      .map((i) => ({ id: i.id, nombre: i.nombre }));

    const payload = {
      modo: "existente",
      articuloId: pizzaSeleccionada.id,
      tipoProductoId:
        pizzaSeleccionada.tipo_producto_id ?? detalle.tipo_producto_id,
      nombre: pizzaSeleccionada.nombre,
      tamanoId,
      precioBase,
      precioExtras,
      precioTotal: precioBase + precioExtras,
      ingredientesExtras,
      ingredientesQuitados,
    };

    const key = JSON.stringify(payload);
    if (lastPayloadRef.current !== key) {
      lastPayloadRef.current = key;
      onSelect(payload);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pizzaSeleccionada, ingredientes, precioExtras, tamanoId, detalle]);

  /* ═══════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════ */
  if (isLoading) {
    return <div className="text-center py-4 text-muted">Cargando pizzas…</div>;
  }

  if (!pizzas.length) {
    return (
      <div className="alert alert-light border border-secondary-subtle py-3 px-4 text-center text-muted">
        <i className="bi bi-info-circle me-1" />
        No hay pizzas disponibles.
      </div>
    );
  }

  return (
    <div>
      {/* ── LISTADO DE PIZZAS ── */}
      <h4 className="cp-subtitulo">
        <i className="bi bi-card-list" style={{ color: "#fc791a" }} />
        Elige una pizza de la carta
      </h4>
      <div className="d-flex flex-wrap gap-2 cp-lista-pizzas">
        {pizzas.map((pizza) => {
          const active = pizzaSeleccionada?.id === pizza.id;

          return (
            <button
              key={pizza.id}
              type="button"
              onClick={() => {
                if (pizzaSeleccionada?.id === pizza.id) {
                  setPizzaSeleccionada(null);
                  setIngredientes([]);
                  lastPayloadRef.current = null;
                  return;
                }
                setPizzaSeleccionada(pizza);
                setIngredientes([]);
                lastPayloadRef.current = null;
              }}
              aria-pressed={active}
              className={`cp-pizza ${active ? "activa" : ""}`}
            >
              {active && <i className="bi bi-check-circle-fill" />}
              <span className="text-nowrap">{pizza.nombre}</span>
            </button>
          );
        })}
      </div>

      {/* ── PAGINACIÓN ── */}
      {lastPage > 1 && (
        <div className="mt-3 d-flex align-items-center gap-2 mb-4">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setPage((p) => p - 1)}
            className="btn btn-outline-secondary btn-sm rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: 32, height: 32 }}
          >
            <i className="bi bi-chevron-left" />
          </button>
          <span className="small text-secondary fw-semibold">
            Página {currentPage} de {lastPage}
          </span>
          <button
            type="button"
            disabled={currentPage === lastPage}
            onClick={() => setPage((p) => p + 1)}
            className="btn btn-outline-secondary btn-sm rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: 32, height: 32 }}
          >
            <i className="bi bi-chevron-right" />
          </button>
        </div>
      )}

      {/* ── Contenido cuando hay pizza seleccionada ── */}
      {pizzaSeleccionada && detalle && !loadingDetalle && (
        <div className="mt-3 pt-3 border-top">
          {/* ── Lo que ya lleva ── */}
          <div className="mb-3">
            <h4 className="cp-subtitulo">
              <i className="bi bi-basket2-fill" style={{ color: "#fc791a" }} />
              Lo que ya lleva
            </h4>

            {ingredientes.filter((i) => i.incluido).length === 0 ? (
              <p className="cp-ayuda mb-0">Esta pizza no tiene ingredientes base.</p>
            ) : (
              <>
                <p className="cp-ayuda">¿No te gusta algo? Tócalo para quitarlo.</p>
                <div className="cp-chips">
                  {ingredientes
                    .filter((i) => i.incluido)
                    .map((ing) => {
                      const desactivado = ing.cantidad === 0;

                      return (
                        <span
                          key={ing.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => toggleBase(ing)}
                          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggleBase(ing)}
                          className={`cp-chip ${desactivado ? "quitado" : ""}`}
                          title={desactivado ? "Toca para volver a ponerlo" : "Toca para quitarlo"}
                        >
                          <i className={`bi ${desactivado ? "bi-arrow-counterclockwise" : "bi-check-circle-fill"}`} />
                          {ing.nombre}
                        </span>
                      );
                    })}
                </div>
              </>
            )}
          </div>

          {/* ── Quitados ── */}
          {baseQuitados.length > 0 && (
            <div className="mb-3">
              <h4 className="cp-subtitulo text-muted">
                <i className="bi bi-dash-circle" />
                Sin estos ingredientes
              </h4>
              <p className="cp-ayuda">Toca para volver a ponerlo.</p>

              <div className="cp-chips">
                {baseQuitados.map((ing) => (
                  <span
                    key={ing.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleBase(ing)}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggleBase(ing)}
                    className="cp-chip quitado"
                    title="Toca para volver a ponerlo"
                  >
                    <i className="bi bi-arrow-counterclockwise" />
                    {ing.nombre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Extras añadidos (resumen) ── */}
          {extrasAnadidos.length > 0 && (
            <div className="mb-3">
              <h4 className="cp-subtitulo">
                <i className="bi bi-stars text-success" />
                Tus extras
              </h4>

              <div className="cp-chips">
                {extrasAnadidos.map((ing) => {
                  const cantidad = ing.incluido
                    ? ing.cantidad - 1
                    : ing.cantidad;

                  return (
                    <span key={ing.id} className="cp-chip extra">
                      <i className="bi bi-plus-circle-fill" />
                      {ing.nombre}
                      <strong>×{cantidad}</strong>
                      <button
                        type="button"
                        className="cp-chip-quitar"
                        onClick={() => quitarExtra(ing.id)}
                        aria-label={`Quitar ${ing.nombre}`}
                      >
                        <i className="bi bi-x-circle-fill" />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Añadir ingredientes por categorías ── */}
          <h4 className="cp-subtitulo">
            <i className="bi bi-plus-square-fill" style={{ color: "#fc791a" }} />
            Añade lo que más te guste
          </h4>
          <p className="cp-ayuda">Elige una categoría y usa los botones + y −.</p>

          <Tabs
            defaultActiveKey={Object.keys(detalle.ingredientes)[0]}
            className="cp-categorias"
          >
            {Object.entries(detalle.ingredientes).map(([categoria, items]) => (
              <Tab eventKey={categoria} title={<TituloCategoria categoria={categoria} />} key={categoria}>
                <div className="cp-ingredientes">
                  {items.map((ing) => {
                    const actual = ingredientes.find((i) => i.id === ing.id);
                    const cantidad = actual?.cantidad ?? 0;

                    const cantidadExtra = ing.incluido
                      ? Math.max(0, cantidad - 1)
                      : cantidad;

                    const quitado = ing.incluido && cantidad === 0;
                    const precio = getPrecioIngrediente(ing);
                    const max = ing.max_cantidad ?? 3;

                    return (
                      <div
                        key={ing.id}
                        className={`cp-ing ${
                          ing.incluido && quitado ? "quitado" : cantidad > 0 ? "con-cantidad" : ""
                        }`}
                      >
                        <div className="d-flex flex-column" style={{ minWidth: 0 }}>
                          <span className="cp-ing-nombre">{ing.nombre}</span>
                          {ing.incluido ? (
                            <span className="cp-ing-precio">Ya viene en esta pizza</span>
                          ) : (
                            <span className="cp-ing-precio">
                              +{precio.toFixed(2)} € / unidad
                            </span>
                          )}
                        </div>

                        <div className="cp-cantidad">
                          <button
                            type="button"
                            className="cp-cantidad-btn menos"
                            onClick={() => disminuir(ing)}
                            disabled={cantidad === 0}
                            aria-label={`Menos ${ing.nombre}`}
                          >
                            <i className="bi bi-dash-lg" />
                          </button>

                          <span className="cp-cantidad-valor">{cantidad}</span>

                          <button
                            type="button"
                            className="cp-cantidad-btn mas"
                            onClick={() => aumentar(ing)}
                            disabled={cantidadExtra >= max}
                            aria-label={`Más ${ing.nombre}`}
                          >
                            <i className="bi bi-plus-lg" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Tab>
            ))}
          </Tabs>
        </div>
      )}

      {/* Mensaje si no hay pizza seleccionada */}
      {!pizzaSeleccionada && (
        <>
          <div className="mt-3 alert alert-light border border-secondary-subtle py-2 px-3 small mb-0 text-muted text-center">
            <i className="bi bi-hand-index me-1" />
            Selecciona una pizza para ver y modificar sus ingredientes.
          </div>
        </>
      )}

      {pizzaSeleccionada && loadingDetalle && (
        <div className="text-center py-4 text-muted">
          Cargando ingredientes…
        </div>
      )}
    </div>
  );
}
