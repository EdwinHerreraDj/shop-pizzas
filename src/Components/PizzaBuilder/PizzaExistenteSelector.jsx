import { useEffect, useMemo, useRef, useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import usePizzasExistentes from "../../hooks/usePizzasExistentes";
import useIngredientesConPrecios from "../../hooks/useIngredientesConPrecios";

const toNum = (v) => Number.parseFloat(v ?? 0) || 0;

const formatCategoria = (key) =>
  key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

export default function PizzaExistenteSelector({ tamaño, onSelect }) {
  /* ===============================
     PAGINACIÓN
  =============================== */
  const [page, setPage] = useState(1);
  const { data: pizzasResponse, isLoading } = usePizzasExistentes(page);

  const pizzas = useMemo(() => {
    if (!pizzasResponse?.data) return [];
    return pizzasResponse.data;
  }, [pizzasResponse]);

  const currentPage = pizzasResponse?.current_page ?? 1;
  const lastPage = pizzasResponse?.last_page ?? 1;

  /* ===============================
     SELECCIÓN
  =============================== */
  const [pizzaSeleccionada, setPizzaSeleccionada] = useState(null);

  const { data: detalle, isLoading: loadingDetalle } =
    useIngredientesConPrecios(pizzaSeleccionada?.id);

  /* ===============================
     INGREDIENTES (BASE + EXTRAS)
  =============================== */
  const [ingredientes, setIngredientes] = useState([]);

  // Inicializar ingredientes al seleccionar pizza
  useEffect(() => {
    if (!detalle?.ingredientes) return;

    const iniciales = Object.values(detalle.ingredientes)
      .flat()
      .map((ing) => ({
        ...ing,
        cantidad: ing.incluido ? 1 : 0, // BASE = 1, EXTRA = 0
      }));

    setIngredientes(iniciales);
  }, [detalle]);

  const categorias = useMemo(() => {
    if (!detalle?.ingredientes) return [];
    return Object.keys(detalle.ingredientes);
  }, [detalle]);

  const [tabActiva, setTabActiva] = useState(null);

  useEffect(() => {
    if (categorias.length && !tabActiva) {
      setTabActiva(categorias[0]);
    }
  }, [categorias, tabActiva]);

  /* ===============================
     MODIFICAR INGREDIENTES
  =============================== */
  const aumentar = (ing) => {
    setIngredientes((prev) =>
      prev.map((i) =>
        i.id === ing.id && i.cantidad < 3
          ? { ...i, cantidad: i.cantidad + 1 }
          : i
      )
    );
  };

  const disminuir = (ing) => {
    setIngredientes((prev) =>
      prev.map((i) =>
        i.id === ing.id && i.cantidad > 0
          ? { ...i, cantidad: i.cantidad - 1 }
          : i
      )
    );
  };

  /* ===============================
     CÁLCULO DE PRECIOS
  =============================== */
  const precioExtras = useMemo(() => {
    return ingredientes.reduce((acc, ing) => {
      const cobrables = ing.incluido
        ? Math.max(0, ing.cantidad - 1)
        : ing.cantidad;

      if (cobrables === 0) return acc;

      const precio =
        tamaño === "Mediana"
          ? toNum(ing.precios.mediana)
          : toNum(ing.precios.grande);

      return acc + precio * cobrables;
    }, 0);
  }, [ingredientes, tamaño]);

  /* ===============================
     EMITIR PAYLOAD (ANTI LOOP)
  =============================== */
  const lastPayloadRef = useRef(null);
  useEffect(() => {
    if (!pizzaSeleccionada || !detalle) return;

    const precioBase =
      tamaño === "Mediana"
        ? toNum(pizzaSeleccionada.precios.mediana)
        : toNum(pizzaSeleccionada.precios.grande);

    // 👉 INGREDIENTES EXTRAS (solo cambios reales)
    const ingredientesExtras = ingredientes
      .filter(
        (i) => (!i.incluido && i.cantidad > 0) || (i.incluido && i.cantidad > 1)
      )
      .map((i) => ({
        id: i.id,
        nombre: i.nombre,
        cantidad: i.incluido ? i.cantidad - 1 : i.cantidad,
      }));

    // 👉 INGREDIENTES QUITADOS
    const ingredientesQuitados = ingredientes
      .filter((i) => i.incluido && i.cantidad === 0)
      .map((i) => ({
        id: i.id,
        nombre: i.nombre,
      }));

    const payload = {
      modo: "existente",
      articuloId: pizzaSeleccionada.id,
      nombre: pizzaSeleccionada.nombre,

      precioBase,
      precioExtras,

      ingredientesExtras,
      ingredientesQuitados,
    };

    if (JSON.stringify(lastPayloadRef.current) !== JSON.stringify(payload)) {
      lastPayloadRef.current = payload;
      onSelect(payload);
    }
  }, [
    pizzaSeleccionada,
    ingredientes,
    precioExtras,
    tamaño,
    onSelect,
    detalle,
  ]);

  /* Quitar ingredientes seleccionados */
  const quitarIngredienteAnadido = (ing) => {
    setIngredientes((prev) =>
      prev.map((i) => {
        if (i.id !== ing.id) return i;

        // Si era ingrediente base → volver a 1
        if (i.incluido) {
          return { ...i, cantidad: 1 };
        }

        // Si era extra → eliminar
        return { ...i, cantidad: 0 };
      })
    );
  };

  /* ===============================
     RENDER
  =============================== */
  if (isLoading) {
    return (
      <div className="text-center py-4 text-gray-500">Cargando pizzas…</div>
    );
  }

  if (!pizzas.length) {
    return (
      <div className="border rounded-lg p-4 text-center text-gray-500">
        No hay pizzas disponibles.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <hr />
      {/* LISTADO DE PIZZAS */}
      <div className="d-flex flex-wrap gap-2">
        {pizzas.map((pizza) => {
          const active = pizzaSeleccionada?.id === pizza.id;

          return (
            <button
              key={pizza.id}
              type="button"
              onClick={() => {
                setPizzaSeleccionada(pizza);
                setIngredientes([]);
                lastPayloadRef.current = null;
              }}
              className={`
          d-inline-flex align-items-center gap-2
          px-3 py-2
          rounded-pill border small fw-semibold
          transition
          ${
            active
              ? "border-danger bg-danger bg-opacity-10 text-danger shadow-sm"
              : "border-secondary-subtle bg-white text-dark"
          }
        `}
            >
              {/* Nombre */}
              <span className="text-nowrap">{pizza.nombre}</span>

              {/* Check */}
              <span
                className={`
            d-flex align-items-center justify-content-center
            rounded-circle
            ${
              active
                ? "bg-danger text-white"
                : "border border-secondary text-transparent"
            }
          `}
                style={{ width: 18, height: 18, fontSize: 11 }}
              >
                ✓
              </span>
            </button>
          );
        })}
      </div>
      {/* PAGINACIÓN */}
      {lastPage > 1 && (
        <div className="mt-3 d-flex align-items-center gap-2 mb-4">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setPage((p) => p - 1)}
            className="btn btn-outline-secondary btn-sm rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: 32, height: 32 }}
          >
            <i className="bi bi-chevron-left"></i>
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
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      )}
      <hr />

      {/* INGREDIENTES BASE */}
      <div className="mb-4">
        <h6 className="fw-bold text-uppercase color-primario mb-3">
          Ingredientes base
        </h6>

        {ingredientes.filter((i) => i.incluido).length === 0 ? (
          <div className="alert alert-light border border-secondary-subtle py-2 px-3 small mb-0 text-muted">
            <i className="bi bi-info-circle me-1"></i>
            Selecciona primero un tipo de pizza para poder ver y modificar los
            ingredientes base.
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
                    onClick={() =>
                      setIngredientes((prev) =>
                        prev.map((i) =>
                          i.id === ing.id
                            ? { ...i, cantidad: i.cantidad === 0 ? 1 : 0 }
                            : i
                        )
                      )
                    }
                    className={`
                badge rounded-pill px-3 py-2 shadow-sm
                d-flex align-items-center
                ${
                  desactivado
                    ? "bg-secondary-subtle text-muted border-secondary-subtle"
                    : "bg-light text-dark border"
                }
              `}
                    style={{
                      cursor: "pointer",
                      userSelect: "none",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <i
                      className={`bi me-1 ${
                        desactivado
                          ? "bi-x-circle text-secondary"
                          : "bi-check-circle-fill color-secundario"
                      }`}
                    ></i>

                    {ing.nombre}
                  </span>
                );
              })}
          </div>
        )}
      </div>

      <hr />

      {/* INGREDIENTES AÑADIDOS */}
      {ingredientes.some(
        (i) => (i.incluido && i.cantidad > 1) || (!i.incluido && i.cantidad > 0)
      ) && (
        <div className="mt-4 mb-4">
          <h6 className="fw-bold text-uppercase text-secondary mb-2">
            Ingredientes añadidos
          </h6>

          <div className="d-flex flex-wrap gap-2">
            {ingredientes
              .filter(
                (i) =>
                  (i.incluido && i.cantidad > 1) ||
                  (!i.incluido && i.cantidad > 0)
              )
              .map((ing) => {
                const cantidad = ing.incluido ? ing.cantidad - 1 : ing.cantidad;

                return (
                  <span
                    key={ing.id}
                    className="d-flex align-items-center gap-2 py-2 px-3 rounded-pill border shadow-sm"
                    style={{
                      fontSize: "0.9rem",
                      backgroundColor: "rgba(25, 135, 84, 0.08)", // verde suave
                      borderColor: "rgba(255, 193, 7, 0.45)", // amarillo tenue
                    }}
                  >
                    {/* Nombre */}
                    <span className="fw-medium text-dark text-nowrap">
                      {ing.nombre}
                    </span>

                    {/* Cantidad */}
                    <span className="badge bg-light text-success fw-semibold">
                      ×{cantidad}
                    </span>

                    {/* Quitar */}
                    <button
                      type="button"
                      className="btn btn-sm btn-link p-0 m-0 text-danger"
                      onClick={() => quitarIngredienteAnadido(ing)}
                      style={{ lineHeight: 1 }}
                    >
                      <i className="bi bi-x-circle-fill"></i>
                    </button>
                  </span>
                );
              })}
          </div>
        </div>
      )}

      {/* DETALLE */}
      {pizzaSeleccionada && detalle && !loadingDetalle && (
        <Tabs
          activeKey={tabActiva}
          onSelect={(k) => setTabActiva(k)}
          className="mb-3 scrollable-tabs"
        >
          {categorias.map((cat) =>
            (detalle.ingredientes[cat] || []).length ? (
              <Tab eventKey={cat} title={formatCategoria(cat)} key={cat}>
                <div className="list-group shadow-sm rounded-3">
                  {(detalle.ingredientes[cat] || []).map((ing) => {
                    const actual = ingredientes.find((i) => i.id === ing.id);
                    const cantidad = actual?.cantidad ?? 0;

                    return (
                      <div
                        key={ing.id}
                        className={`list-group-item d-flex justify-content-between align-items-center ${
                          cantidad > 0 ? "bg-success-subtle" : "bg-white"
                        }`}
                      >
                        {/* Nombre */}
                        <span className="fw-semibold text-dark">
                          {ing.nombre}
                        </span>

                        {/* Stepper – MISMO patrón */}
                        <div className="btn-group btn-group-sm shadow-sm rounded-pill overflow-hidden">
                          <button
                            className="btn btn-light border-0 px-3 fw-bold text-secondary"
                            onClick={() => disminuir(ing)}
                            disabled={cantidad === 0}
                          >
                            −
                          </button>

                          <button
                            className="btn btn-light border-start border-end px-3 fw-semibold text-dark"
                            disabled
                          >
                            {cantidad}
                          </button>

                          <button
                            className="btn btn-light border-0 px-3 fw-bold text-secondary"
                            onClick={() => aumentar(ing)}
                            disabled={cantidad === 3}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Tab>
            ) : null
          )}
        </Tabs>
      )}
    </div>
  );
}
