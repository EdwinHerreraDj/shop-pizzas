import { useEffect, useMemo, useState } from "react";
import { Tabs, Tab } from "react-bootstrap";
import useIngredientesConPrecios from "../../hooks/useIngredientesConPrecios";

const toNum = (v) => Number.parseFloat(v ?? 0) || 0;

export default function PizzaEnteraBuilder({ tamaño, onChange }) {
  const { data, isLoading, isError } = useIngredientesConPrecios(3);

  /* ===============================
     DATOS API
  =============================== */
  const articulo = data?.articulo;
  const ingredientesPorCategoria = data?.ingredientes ?? {};

  const ingredientesBase = useMemo(() => {
    return Object.values(ingredientesPorCategoria)
      .flat()
      .filter((ing) => ing.incluido);
  }, [ingredientesPorCategoria]);

  /* ===============================
     ESTADOS
  =============================== */
  const [ingredientesExtras, setIngredientesExtras] = useState([]);
  const [ingredientesQuitados, setIngredientesQuitados] = useState([]);

  /* ===============================
     PRECIO EXTRAS
  =============================== */
  const precioExtras = useMemo(() => {
    return ingredientesExtras.reduce((acc, ing) => {
      const precio =
        tamaño === "Pequeña"
          ? toNum(ing.precios.pequena)
          : tamaño === "Mediana"
          ? toNum(ing.precios.mediana)
          : toNum(ing.precios.grande);

      return acc + precio * ing.cantidad;
    }, 0);
  }, [ingredientesExtras, tamaño]);

  /* ===============================
     EMITIR CAMBIOS
  =============================== */
  const precioBase = useMemo(() => {
    if (!articulo) return 0;

    if (tamaño === "Pequeña") return toNum(articulo.precio_pequena);
    if (tamaño === "Grande") return toNum(articulo.precio_grande);

    return toNum(articulo.precio_mediana);
  }, [articulo, tamaño]);

  useEffect(() => {
    if (!articulo) return;

    onChange({
      productoId: articulo.id,
      tamaño,

      precioBase,
      precioExtras,
      extras: ingredientesExtras.map((ing) => ({
        id: ing.id,
        nombre: ing.nombre,
        cantidad: ing.cantidad,
        precioUnitario:
          tamaño === "Pequeña"
            ? toNum(ing.precios.pequena)
            : tamaño === "Mediana"
            ? toNum(ing.precios.mediana)
            : toNum(ing.precios.grande),
      })),
      quitados: ingredientesQuitados.map((id) => {
        const ing = ingredientesBase.find((i) => i.id === id);
        return {
          id,
          nombre: ing?.nombre ?? "Ingrediente eliminado",
        };
      }),
      precioExtras,
    });
  }, [
    articulo,
    tamaño,
    ingredientesExtras,
    ingredientesQuitados,
    ingredientesBase,
    precioExtras,
    onChange,
  ]);

  /* ===============================
     EXTRAS
  =============================== */
  const aumentarIngrediente = (ingrediente) => {
    setIngredientesExtras((prev) => {
      const existe = prev.find((i) => i.id === ingrediente.id);

      if (existe) {
        if (existe.cantidad >= 3) return prev;
        return prev.map((i) =>
          i.id === ingrediente.id ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      }

      return [...prev, { ...ingrediente, cantidad: 1 }];
    });
  };

  const disminuirIngrediente = (ingrediente) => {
    setIngredientesExtras((prev) => {
      const existe = prev.find((i) => i.id === ingrediente.id);
      if (!existe) return prev;

      if (existe.cantidad <= 1) {
        return prev.filter((i) => i.id !== ingrediente.id);
      }

      return prev.map((i) =>
        i.id === ingrediente.id ? { ...i, cantidad: i.cantidad - 1 } : i
      );
    });
  };

  const quitarIngrediente = (id) => {
    setIngredientesExtras((prev) => prev.filter((i) => i.id !== id));
  };

  /* ===============================
     BASE ON / OFF
  =============================== */
  const toggleIngredienteBase = (ingrediente) => {
    if (!ingrediente.incluido) return;

    setIngredientesQuitados((prev) =>
      prev.includes(ingrediente.id)
        ? prev.filter((id) => id !== ingrediente.id)
        : [...prev, ingrediente.id]
    );
  };

  /* ===============================
     ESTADOS
  =============================== */
  if (isLoading) {
    return (
      <div className="text-center py-5 text-muted">Cargando ingredientes…</div>
    );
  }

  if (isError || !articulo) {
    return (
      <div className="alert alert-danger">Error al cargar ingredientes</div>
    );
  }

  /* ===============================
     UI
  =============================== */
  return (
    <div className="card border rounded-4 shadow-sm mb-4">
      <div className="card-body">
        {/* INGREDIENTES BASE */}
        <div className="mb-4">
          <h6 className="fw-semibold mb-2">Ingredientes base</h6>

          {ingredientesBase.length > 0 ? (
            <div className="d-flex flex-wrap gap-2">
              {ingredientesBase.map((ing) => {
                const desactivado = ingredientesQuitados.includes(ing.id);

                return (
                  <span
                    key={ing.id}
                    onClick={() => toggleIngredienteBase(ing)}
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
          ) : (
            <div className="alert alert-light border border-secondary-subtle py-2 px-3 small mb-0 text-muted">
              <i className="bi bi-info-circle me-1"></i> Sin ingredientes base.
            </div>
          )}
        </div>

        {/* INGREDIENTES AÑADIDOS */}
        {ingredientesExtras.filter((ing) => !ing.incluido || ing.cantidad > 1)
          .length > 0 && (
          <div className="mb-4">
            <hr />
            <h6 className="fw-semibold mb-2">Ingredientes añadidos:</h6>

            <div className="d-flex flex-wrap gap-2">
              {ingredientesExtras
                .filter((ing) => !ing.incluido || ing.cantidad > 1)
                .map((ing) => {
                  // cantidad visible (base + extras o solo extras)
                  const cantidadVisible = ing.incluido
                    ? ing.cantidad // aquí ing.cantidad es SOLO extras
                    : ing.cantidad;

                  return (
                    <span
                      key={ing.id}
                      className="ingrediente-extra d-flex align-items-center gap-2 py-2 px-3 border rounded-pill bg-light shadow-sm"
                      style={{ fontSize: "0.9rem" }}
                    >
                      <span className="fw-medium">{ing.nombre}</span>

                      <span className="badge bg-light color-primario ms-1">
                        ×{ing.incluido ? cantidadVisible + 1 : cantidadVisible}
                      </span>

                      <button
                        className="btn btn-sm btn-link p-0 m-0 text-danger"
                        onClick={() => quitarIngrediente(ing.id)}
                        title={
                          ing.incluido ? "Quitar extras" : "Quitar ingrediente"
                        }
                        style={{ textDecoration: "none" }}
                      >
                        <i className="bi bi-x-circle-fill"></i>
                      </button>
                    </span>
                  );
                })}
            </div>
          </div>
        )}

        <h6 className="fw-semibold mb-3">Agregar ingredientes</h6>

        <Tabs
          defaultActiveKey={Object.keys(ingredientesPorCategoria)[0]}
          className="mb-3 scrollable-tabs"
        >
          {Object.entries(ingredientesPorCategoria).map(
            ([categoria, items]) => (
              <Tab eventKey={categoria} title={categoria} key={categoria}>
                <div className="list-group shadow-sm rounded-3">
                  {items.map((ing) => {
                    const extra = ingredientesExtras.find(
                      (i) => i.id === ing.id
                    );
                    const cantidadExtra = extra?.cantidad || 0;
                    const quitado = ingredientesQuitados.includes(ing.id);

                    const cantidad = ing.incluido
                      ? quitado
                        ? cantidadExtra // base quitado → solo extras
                        : 1 + cantidadExtra // base activo → +1
                      : cantidadExtra;

                    const precio =
                      tamaño === "Pequeña"
                        ? toNum(ing.precios.pequena)
                        : tamaño === "Mediana"
                        ? toNum(ing.precios.mediana)
                        : toNum(ing.precios.grande);

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
                            onClick={() => disminuirIngrediente(ing)}
                            disabled={
                              ing.incluido && !quitado
                                ? cantidadExtra === 0 // base activo: no bajar de 1
                                : cantidad === 0
                            }
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
                            onClick={() => aumentarIngrediente(ing)}
                            disabled={
                              ing.incluido
                                ? cantidadExtra === 2 // base: 1 + 2 = 3
                                : cantidadExtra === 3 // normal: 0 + 3 = 3
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Tab>
            )
          )}
        </Tabs>
      </div>
    </div>
  );
}
