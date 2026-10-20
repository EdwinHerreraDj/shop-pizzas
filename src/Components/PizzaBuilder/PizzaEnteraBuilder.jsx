import { useEffect, useMemo, useState } from "react";
import { Tabs, Tab } from "react-bootstrap";
import usePizzaPlantilla from "../../hooks/usePizzaPlantilla";
import ErrorCarga from "../Shop/ErrorCarga";
import { TituloCategoria } from "./ui";

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
      {/* ── Lo que ya lleva ── */}
      {ingredientesBase.length > 0 && (
        <div className="mb-3">
          <h4 className="cp-subtitulo">
            <i className="bi bi-basket2-fill" style={{ color: "#fc791a" }} />
            Lo que ya lleva
          </h4>
          <p className="cp-ayuda">¿No te gusta algo? Tócalo para quitarlo.</p>

          <div className="cp-chips">
            {ingredientesBase.map((ing) => {
              const actual = ingredientes.find((i) => i.id === ing.id);
              const desactivado = (actual?.cantidad ?? 0) === 0;

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
        </div>
      )}

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
              const cantidad = ing.incluido ? ing.cantidad - 1 : ing.cantidad;

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
        defaultActiveKey={Object.keys(ingredientesPorCategoria)[0]}
        className="cp-categorias"
      >
        {Object.entries(ingredientesPorCategoria).map(([categoria, items]) => (
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
                        <span className="cp-ing-precio">Ya viene en tu pizza</span>
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
  );
}
