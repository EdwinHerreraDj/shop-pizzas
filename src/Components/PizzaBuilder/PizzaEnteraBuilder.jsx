import { useEffect, useMemo, useState } from "react";
import { Tabs, Tab } from "react-bootstrap";
import usePizzaPlantilla from "../../hooks/usePizzaPlantilla";
import ErrorCarga from "../Shop/ErrorCarga";

const toNum = (v) => Number.parseFloat(v ?? 0) || 0;

const formatEUR = (v) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(Number.isFinite(v) ? v : 0);

export default function PizzaEnteraBuilder({ tamanoId, onChange }) {
  const { data: plantilla, isLoading, isError, error, refetch } = usePizzaPlantilla();

  const ingredientesPorCategoria = plantilla?.ingredientes ?? {};
  const tamanos = plantilla?.tamanos ?? [];

  /* ── Ingredientes base ─────────────────────────── */
  const ingredientesBase = useMemo(() => {
    return Object.values(ingredientesPorCategoria)
      .flat()
      .filter((ing) => ing.incluido);
  }, [ingredientesPorCategoria]);

  /* ── Estado local ──────────────────────────────── */
  const [ingredientes, setIngredientes] = useState([]);

  /* Inicializar ingredientes al cargar plantilla */
  useEffect(() => {
    if (!plantilla?.ingredientes) return;
    const inicial = Object.values(plantilla.ingredientes)
      .flat()
      .map((i) => ({
        ...i,
        cantidad: i.incluido ? 1 : 0,
      }));
    setIngredientes(inicial);
  }, [plantilla]);

  /* Reset cuando cambia el tamaño */
  useEffect(() => {
    if (!plantilla?.ingredientes) return;
    const inicial = Object.values(plantilla.ingredientes)
      .flat()
      .map((i) => ({
        ...i,
        cantidad: i.incluido ? 1 : 0,
      }));
    setIngredientes(inicial);
  }, [tamanoId, plantilla]);

  /* ── Precio helpers ────────────────────────────── */
  const getPrecioIngrediente = (ing) => {
    const precioObj = ing.precios?.find(
      (p) => Number(p.tamano_id) === Number(tamanoId),
    );
    return toNum(precioObj?.precio);
  };

  const precioBase = useMemo(() => {
    if (!tamanoId || !tamanos.length) return 0;
    const tamano = tamanos.find((t) => Number(t.id) === Number(tamanoId));
    return toNum(tamano?.precio);
  }, [tamanos, tamanoId]);

  const precioExtras = useMemo(() => {
    return ingredientes.reduce((acc, ing) => {
      const cobrables = ing.incluido
        ? Math.max(ing.cantidad - 1, 0)
        : ing.cantidad;
      if (cobrables === 0) return acc;
      return acc + getPrecioIngrediente(ing) * cobrables;
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ingredientes, tamanoId]);

  /* ── Emitir datos al padre ─────────────────────── */
  useEffect(() => {
    if (!plantilla || !tamanoId) return;

    const tamanoActual = tamanos.find((t) => Number(t.id) === Number(tamanoId));

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

    
    onChange({
      articuloId: plantilla.id,
      tipoProductoId: plantilla.tipo_producto_id,
      nombre: plantilla.nombre,
      tamanoId,
      tamano: tamanoActual?.nombre ?? "",
      precioBase,
      precioExtras,
      precioTotal: precioBase + precioExtras,
      ingredientesExtras,
      ingredientesQuitados,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plantilla, tamanoId, ingredientes, precioBase, precioExtras]);

  /* ── Acciones ──────────────────────────────────── */
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

  /* ── Derivados ─────────────────────────────────── */
  const extrasAnadidos = ingredientes.filter(
    (i) => (!i.incluido && i.cantidad > 0) || (i.incluido && i.cantidad > 1),
  );

  const baseQuitados = ingredientes.filter(
    (i) => i.incluido && i.cantidad === 0,
  );

  /* ── Loading / Error ───────────────────────────── */
  if (isLoading) {
    return (
      <div className="text-center py-5 text-muted">Cargando ingredientes…</div>
    );
  }

  if (isError || !plantilla) {
    return (
      <ErrorCarga error={error} onReintentar={isError ? refetch : undefined} que="los ingredientes" />
    );
  }

  /* ── Render ────────────────────────────────────── */
  return (
    <div>
      {/* ── Ingredientes base ── */}
      {ingredientesBase.length > 0 && (
        <div className="mb-4">
          <h6 className="fw-semibold mb-2">Ingredientes base</h6>

          <div className="d-flex flex-wrap gap-2">
            {ingredientesBase.map((ing) => {
              const actual = ingredientes.find((i) => i.id === ing.id);
              const desactivado = (actual?.cantidad ?? 0) === 0;

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
                  title={desactivado ? "Clic para añadir" : "Clic para quitar"}
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
        </div>
      )}

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
              const cantidad = ing.incluido ? ing.cantidad - 1 : ing.cantidad;

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
        defaultActiveKey={Object.keys(ingredientesPorCategoria)[0]}
        className="mb-3 scrollable-tabs"
      >
        {Object.entries(ingredientesPorCategoria).map(([categoria, items]) => (
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
                        <small className="text-muted">Ingrediente base</small>
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

                      <button className="btn btn-light fw-semibold" disabled>
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
    </div>
  );
}
