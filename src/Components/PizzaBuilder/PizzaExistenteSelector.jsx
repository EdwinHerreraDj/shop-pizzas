import { useEffect, useMemo, useRef, useState } from "react";
import { Tabs, Tab } from "react-bootstrap";
import usePizzasExistentes from "../../hooks/usePizzasExistentes";
import useIngredientesConPrecios from "../../hooks/useIngredientesConPrecios";

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
      <hr />

      {/* ── LISTADO DE PIZZAS ── */}
      <div className="d-flex flex-wrap gap-2">
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
              className={`d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill border small fw-semibold ${
                active
                  ? "border-danger bg-danger bg-opacity-10 text-danger shadow-sm"
                  : "border-secondary-subtle bg-white text-dark"
              }`}
            >
              <span className="text-nowrap">{pizza.nombre}</span>
              <span
                className={`d-flex align-items-center justify-content-center rounded-circle ${
                  active
                    ? "bg-danger text-white"
                    : "border border-secondary text-transparent"
                }`}
                style={{ width: 18, height: 18, fontSize: 11 }}
              >
                ✓
              </span>
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
        <>
          <hr />

          {/* ── Ingredientes base ── */}
          <div className="mb-4">
            <h6 className="fw-semibold mb-2">Ingredientes base</h6>

            {ingredientes.filter((i) => i.incluido).length === 0 ? (
              <div className="alert alert-light border border-secondary-subtle py-2 px-3 small mb-0 text-muted">
                <i className="bi bi-info-circle me-1" />
                Esta pizza no tiene ingredientes base.
              </div>
            ) : (
              <div className="d-flex flex-wrap gap-2">
                {ingredientes
                  .filter((i) => i.incluido)
                  .map((ing) => {
                    const desactivado = ing.cantidad === 0;

                    return (
                      <span
                        key={ing.id}
                        onClick={() => toggleBase(ing)}
                        className={`badge rounded-pill px-3 py-2 shadow-sm d-flex align-items-center ${
                          desactivado
                            ? "bg-secondary-subtle text-muted border border-secondary-subtle"
                            : "bg-light text-dark border"
                        }`}
                        style={{
                          cursor: "pointer",
                          userSelect: "none",
                          transition: "all 0.2s ease",
                        }}
                        title={
                          desactivado ? "Clic para añadir" : "Clic para quitar"
                        }
                      >
                        <i
                          className={`bi me-1 ${
                            desactivado
                              ? "bi-x-circle text-secondary"
                              : "bi-check-circle-fill color-secundario"
                          }`}
                        />
                        {ing.nombre}
                      </span>
                    );
                  })}
              </div>
            )}
          </div>

          {/* ── Ingredientes quitados ── */}
          {baseQuitados.length > 0 && (
            <div className="mb-4">
              <h6 className="fw-semibold mb-2 text-muted">
                <i className="bi bi-dash-circle me-1" />
                Ingredientes quitados
              </h6>

              <div className="d-flex flex-wrap gap-2">
                {baseQuitados.map((ing) => (
                  <span
                    key={ing.id}
                    onClick={() => toggleBase(ing)}
                    className="badge rounded-pill px-3 py-2 shadow-sm d-flex align-items-center bg-danger-subtle text-muted border border-danger-subtle"
                    style={{
                      cursor: "pointer",
                      userSelect: "none",
                      transition: "all 0.2s ease",
                      textDecoration: "line-through",
                    }}
                    title="Clic para restaurar"
                  >
                    <i className="bi bi-arrow-counterclockwise me-1 text-success" />
                    {ing.nombre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Extras añadidos (resumen) ── */}
          {extrasAnadidos.length > 0 && (
            <div className="mb-4">
              <hr />
              <h6 className="fw-semibold mb-2">Ingredientes añadidos:</h6>

              <div className="d-flex flex-wrap gap-2">
                {extrasAnadidos.map((ing) => {
                  const cantidad = ing.incluido
                    ? ing.cantidad - 1
                    : ing.cantidad;

                  return (
                    <span
                      key={ing.id}
                      className="ingrediente-extra d-flex align-items-center gap-2 py-2 px-3 border rounded-pill bg-light shadow-sm"
                      style={{ fontSize: "0.9rem" }}
                    >
                      <span className="fw-medium">{ing.nombre}</span>

                      <span className="badge bg-light color-primario ms-1">
                        ×{cantidad}
                      </span>

                      <button
                        className="btn btn-sm btn-link p-0 m-0 text-danger"
                        onClick={() => quitarExtra(ing.id)}
                        style={{ textDecoration: "none" }}
                      >
                        <i className="bi bi-x-circle-fill" />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <hr />

          {/* ── Selector por categorías (Tabs) ── */}
          <h6 className="fw-semibold mb-3">Agregar ingredientes</h6>

          <Tabs
            defaultActiveKey={Object.keys(detalle.ingredientes)[0]}
            className="mb-3 scrollable-tabs"
          >
            {Object.entries(detalle.ingredientes).map(([categoria, items]) => (
              <Tab eventKey={categoria} title={categoria} key={categoria}>
                <div className="list-group shadow-sm rounded-3">
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
                        className={`list-group-item d-flex justify-content-between align-items-center ${
                          ing.incluido && quitado
                            ? "bg-danger-subtle"
                            : cantidad > 0
                              ? "bg-success-subtle"
                              : "bg-white"
                        }`}
                      >
                        <div className="d-flex flex-column">
                          <span className="fw-semibold text-dark">
                            {ing.nombre}
                          </span>
                          {ing.incluido ? (
                            <small className="text-muted">
                              Ingrediente base
                            </small>
                          ) : (
                            <small className="text-muted">
                              +{precio.toFixed(2)} € / unidad
                            </small>
                          )}
                        </div>

                        <div className="btn-group btn-group-sm rounded-pill overflow-hidden">
                          <button
                            className="btn btn-light"
                            onClick={() => disminuir(ing)}
                            disabled={cantidad === 0}
                          >
                            −
                          </button>

                          <button
                            className="btn btn-light fw-semibold"
                            disabled
                          >
                            {cantidad}
                          </button>

                          <button
                            className="btn btn-light"
                            onClick={() => aumentar(ing)}
                            disabled={cantidadExtra >= max}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Tab>
            ))}
          </Tabs>
        </>
      )}

      {/* Mensaje si no hay pizza seleccionada */}
      {!pizzaSeleccionada && (
        <>
          <hr />
          <div className="alert alert-light border border-secondary-subtle py-2 px-3 small mb-0 text-muted text-center">
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
