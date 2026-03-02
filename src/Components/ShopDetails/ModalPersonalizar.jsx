import { useState, useEffect, useMemo } from "react";
import useIngredientesConPrecios from "../../hooks/useIngredientesConPrecios";
import { Modal, Spinner } from "react-bootstrap";

const toNum = (v) => Number.parseFloat(v ?? 0) || 0;

const formatEUR = (v) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(Number.isFinite(v) ? v : 0);

const formatCategoria = (key) =>
  key?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

export default function ModalPersonalizar({
  productoId,
  show,
  onClose,
  onConfirm,
}) {
  const { data, isLoading, isError } = useIngredientesConPrecios(productoId);

  const [tamanoSeleccionado, setTamanoSeleccionado] = useState(null);
  const [ingredientes, setIngredientes] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState(null);

  const tamanos = useMemo(() => data?.tamanos ?? [], [data?.tamanos]);
  const esPrecioUnico = tamanos.length <= 1;

  useEffect(() => {
    if (!show || !tamanos.length) return;
    setTamanoSeleccionado(tamanos[0]);
  }, [show, tamanos]);

  const ingredientesAgrupados = useMemo(
    () => data?.ingredientes ?? {},
    [data?.ingredientes],
  );

  const ingredientesBase = useMemo(
    () =>
      Object.values(ingredientesAgrupados)
        .flat()
        .filter((i) => i.modo === "base"),
    [ingredientesAgrupados],
  );

  useEffect(() => {
    if (!show || !data?.ingredientes) return;

    const inicial = Object.values(data.ingredientes)
      .flat()
      .map((i) => ({
        ...i,
        cantidad: i.modo === "base" ? 1 : 0,
      }));

    setIngredientes(inicial);
    setCategoriaActiva(Object.keys(data.ingredientes)[0] ?? null);
  }, [show, data]);

  const precioBase = useMemo(
    () => (tamanoSeleccionado ? toNum(tamanoSeleccionado.precio) : 0),
    [tamanoSeleccionado],
  );

  const precioExtras = useMemo(() => {
    return ingredientes.reduce((acc, ing) => {
      if (!tamanoSeleccionado) return acc;

      const precioExtra = toNum(
        ing.precios?.find((p) => p.tamano_id === tamanoSeleccionado.id)
          ?.precio ?? 0,
      );

      const unidadesDePago =
        ing.modo === "base" ? Math.max(ing.cantidad - 1, 0) : ing.cantidad;

      return acc + precioExtra * unidadesDePago;
    }, 0);
  }, [ingredientes, tamanoSeleccionado]);

  const precioTotal = precioBase + precioExtras;

  const cambiarCantidad = (id, delta) => {
    setIngredientes((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;

        const nueva = i.cantidad + delta;
        if (nueva < 0) return { ...i, cantidad: 0 };
        if (nueva > (i.max_cantidad ?? 3)) return i;

        return { ...i, cantidad: nueva };
      }),
    );
  };

  const toggleBase = (id) => {
    setIngredientes((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, cantidad: i.cantidad > 0 ? 0 : 1 } : i,
      ),
    );
  };

  const getPrecioExtra = (ing) => {
    if (!tamanoSeleccionado) return 0;
    return toNum(
      ing.precios?.find((p) => p.tamano_id === tamanoSeleccionado.id)?.precio ??
        0,
    );
  };

  const categorias = Object.keys(ingredientesAgrupados);

  const extrasEnCategoria = (cat) =>
    (ingredientesAgrupados[cat] ?? []).reduce((sum, ing) => {
      if (ing.modo === "base") return sum;
      return sum + (ingredientes.find((i) => i.id === ing.id)?.cantidad ?? 0);
    }, 0);

  // Extras que el usuario ha añadido (modo !== "base" y cantidad > 0)
  const extrasSeleccionados = ingredientes.filter(
    (i) => i.modo !== "base" && i.cantidad > 0,
  );

  return (
    <Modal show={show} onHide={onClose} size="lg" backdrop="static" centered>
      <Modal.Header closeButton className="border-0 pb-2">
        <Modal.Title className="fw-bold color-primario">
          {data?.nombre ?? "Personalizar"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body
        className="px-4 pb-4"
        style={{ maxHeight: "70vh", overflowY: "auto" }}
      >
        {isLoading && (
          <div className="text-center py-5">
            <Spinner animation="border" className="color-primario" />
            <div className="small text-muted mt-3">Cargando producto…</div>
          </div>
        )}

        {isError && (
          <div className="alert alert-danger">
            Ocurrió un error al cargar el artículo.
          </div>
        )}
        {!isLoading && !isError && (
          <>
            <div className="text-center mb-4">
              <img
                src={data?.imagen ?? ""}
                alt={data?.nombre ?? "Producto"}
                className="img-fluid rounded-4 shadow-sm"
                style={{
                  maxHeight: "220px",
                  objectFit: "cover",
                }}
              />
            </div>

            {data?.descripcion && (
              <p className="text-muted mb-4">{data.descripcion}</p>
            )}
            <hr />
            {!esPrecioUnico && (
              <div className="mb-4">
                <h6 className="fw-bold text-uppercase color-primary small mb-3">
                  Tamaño
                </h6>

                <div className="d-flex flex-wrap gap-2">
                  {tamanos.map((t) => {
                    const activo = tamanoSeleccionado?.id === t.id;

                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTamanoSeleccionado(t)}
                        className={`theme-btn style6 ${
                          tamanoSeleccionado === t
                            ? "btn-primary text-red-50"
                            : "btn-outline-primary bg-white"
                        }`}
                      >
                        <span className="fw-semibold">{t.nombre}</span>
                        <span className="ms-2 small opacity-75">
                          {formatEUR(toNum(t.precio))}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <hr />

            {ingredientesBase.length > 0 && (
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Ingredientes base</h6>
                  <small className="color-primario">Toca para quitar</small>
                </div>

                <div className="d-flex flex-wrap gap-2">
                  {ingredientesBase.map((ing) => {
                    const activo =
                      (ingredientes.find((i) => i.id === ing.id)?.cantidad ??
                        0) > 0;

                    return (
                      <button
                        key={ing.id}
                        type="button"
                        onClick={() => toggleBase(ing.id)}
                        className={`btn btn-sm rounded-pill px-3 ${
                          activo
                            ? "btn-outline-success fw-semibold"
                            : "btn-light border text-muted"
                        }`}
                      >
                        {activo && <span className="me-1">✓</span>}
                        {ing.nombre}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <hr />

            {/* ── Resumen de extras añadidos ── */}
            {extrasSeleccionados.length > 0 && (
              <>
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold mb-0">Extras añadidos</h6>
                    <small className="text-muted">Toca para quitar</small>
                  </div>

                  <div className="d-flex flex-wrap gap-2">
                    {extrasSeleccionados.map((ing) => (
                      <button
                        key={ing.id}
                        type="button"
                        onClick={() =>
                          setIngredientes((prev) =>
                            prev.map((i) =>
                              i.id === ing.id ? { ...i, cantidad: 0 } : i,
                            ),
                          )
                        }
                        className="d-inline-flex align-items-center gap-1 rounded-pill px-3 py-1 bg-danger bg-opacity-10 border border-danger btn"
                        style={{ fontSize: "0.85rem" }}
                        title="Toca para quitar"
                      >
                        <span className="fw-semibold color-secundario">
                          {ing.nombre}
                        </span>
                        {ing.cantidad > 1 && (
                          <span
                            className="badge bg-danger text-white rounded-pill"
                            style={{ fontSize: "0.75rem" }}
                          >
                            x{ing.cantidad}
                          </span>
                        )}
                        <span
                          className="color-secundario ms-1"
                          style={{ fontSize: "0.8rem", lineHeight: 1 }}
                        >
                          ✕
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <hr />
              </>
            )}

            {categorias.length > 0 && (
              <div>
                <h6 className="fw-bold text-uppercase color-primary small mb-3">
                  Añadir extras
                </h6>

                <ul className="nav nav-pills flex-wrap gap-2 mb-4">
                  {categorias.map((cat) => {
                    const count = extrasEnCategoria(cat);

                    return (
                      <li key={cat} className="nav-item">
                        <button
                          className={`btn rounded-pill ${
                            categoriaActiva === cat
                              ? "btn-danger"
                              : "btn-outline-danger"
                          }`}
                          onClick={() => setCategoriaActiva(cat)}
                        >
                          {formatCategoria(cat)}
                          {count > 0 && (
                            <span className="badge bg-light color-secundario ms-2">
                              {count}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>

                {(ingredientesAgrupados[categoriaActiva] ?? []).map((ing) => {
                  const cant =
                    ingredientes.find((i) => i.id === ing.id)?.cantidad ?? 0;

                  const precio = getPrecioExtra(ing);

                  const max = ing.max_cantidad ?? 3;

                  return (
                    <div
                      key={ing.id}
                      className="d-flex justify-content-between align-items-center py-3 border-bottom"
                    >
                      <div>
                        <div className="fw-semibold">{ing.nombre}</div>
                        {precio > 0 && (
                          <div className="small text-muted">
                            +{formatEUR(precio)}
                          </div>
                        )}
                      </div>

                      <div
                        className={`d-inline-flex align-items-center rounded-pill px-2 py-1 ${
                          cant > 0
                            ? "bg-danger bg-opacity-10 border border-danger"
                            : "bg-light border"
                        }`}
                      >
                        <button
                          className="btn btn-sm border-0 color-secundario px-2"
                          onClick={() => cambiarCantidad(ing.id, -1)}
                          disabled={cant === 0}
                        >
                          −
                        </button>

                        <span
                          className={`fw-semibold px-2 ${
                            cant > 0 ? "color-secundario" : "text-dark"
                          }`}
                          style={{ minWidth: "24px", textAlign: "center" }}
                        >
                          {cant}
                        </span>

                        <button
                          className="btn btn-sm border-0 color-secundario px-2"
                          onClick={() => cambiarCantidad(ing.id, 1)}
                          disabled={cant >= max}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </Modal.Body>

      <Modal.Footer
        className="px-4 py-3 bg-white"
        style={{
          position: "sticky",
          bottom: 0,
          zIndex: 10,
          borderTop: "1px solid #eee",
        }}
      >
        <div className="w-100">
          {/* Total destacado en cápsula */}
          <div className="bg-light rounded-4 px-3 py-2 mb-3 d-flex justify-content-between align-items-center">
            <span className="small color-primario fw-semibold">Total</span>
            <span className="fs-5 fw-bold color-secundario">
              {formatEUR(precioTotal)}
            </span>
          </div>

          {/* Botón principal grande */}
          <button
            className="theme-btn style4 w-100 rounded-pill fw-semibold text-white py-3 mb-2"
            style={{
              border: "none",
            }}
            onClick={() => {
              onConfirm({
                articuloId: data.id,
                tamano: tamanoSeleccionado?.nombre ?? null,
                precioTotal,
                ingredientes,
              });
              onClose();
            }}
          >
            Añadir al carrito
          </button>

          {/* Cancelar discreto */}
          <div className="text-center">
            <button
              className="btn btn-link text-muted small p-0"
              onClick={onClose}
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
