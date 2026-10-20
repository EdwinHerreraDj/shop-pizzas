import { useState, useEffect, useMemo } from "react";
import { Modal, Spinner, Tabs, Tab } from "react-bootstrap";
import useIngredientesConPrecios from "../../hooks/useIngredientesConPrecios";
import ErrorCarga from "../Shop/ErrorCarga";

const toNum = (v) => Number.parseFloat(v ?? 0) || 0;

const formatEUR = (v) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(Number.isFinite(v) ? v : 0);

export default function ModalPersonalizar({
  productoId,
  show,
  onClose,
  onConfirm,
}) {
  const { data, isLoading, isError, error, refetch } = useIngredientesConPrecios(productoId);

  const [tamanoSeleccionado, setTamanoSeleccionado] = useState(null);
  const [ingredientes, setIngredientes] = useState([]);

  const tamanos = useMemo(() => data?.tamanos ?? [], [data?.tamanos]);
  const esPrecioUnico = tamanos.length <= 1;

  const ingredientesAgrupados = useMemo(
    () => data?.ingredientes ?? {},
    [data?.ingredientes]
  );

  const ingredientesBase = useMemo(
    () =>
      Object.values(ingredientesAgrupados)
        .flat()
        .filter((i) => i.modo === "base"),
    [ingredientesAgrupados]
  );

  /* ── Init on show ──────────────────────────────── */
  useEffect(() => {
    if (!show || !tamanos.length) return;
    setTamanoSeleccionado(tamanos[0]);
  }, [show, tamanos]);

  useEffect(() => {
    if (!show || !data?.ingredientes) return;

    const inicial = Object.values(data.ingredientes)
      .flat()
      .map((i) => ({
        ...i,
        cantidad: i.modo === "base" ? 1 : 0,
      }));

    setIngredientes(inicial);
  }, [show, data]);

  /* ── Precios ───────────────────────────────────── */
  const precioBase = useMemo(
    () => (tamanoSeleccionado ? toNum(tamanoSeleccionado.precio) : 0),
    [tamanoSeleccionado]
  );

  const getPrecioExtra = (ing) => {
    if (!tamanoSeleccionado) return 0;
    return toNum(ing.precio_por_tamano?.[tamanoSeleccionado.id] ?? 0);
  };

  const precioExtras = useMemo(() => {
    return ingredientes.reduce((acc, ing) => {
      if (!tamanoSeleccionado) return acc;
      const precio = toNum(
        ing.precio_por_tamano?.[tamanoSeleccionado.id] ?? 0
      );
      const cobrables =
        ing.modo === "base" ? Math.max(ing.cantidad - 1, 0) : ing.cantidad;
      return acc + precio * cobrables;
    }, 0);
  }, [ingredientes, tamanoSeleccionado]);

  const precioTotal = precioBase + precioExtras;

  /* ── Acciones ──────────────────────────────────── */
  const aumentar = (ing) => {
    const max = ing.max_cantidad ?? 3;
    setIngredientes((prev) =>
      prev.map((i) =>
        i.id === ing.id && i.cantidad < max
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

  const toggleBase = (ing) => {
    setIngredientes((prev) =>
      prev.map((i) =>
        i.id === ing.id ? { ...i, cantidad: i.cantidad > 0 ? 0 : 1 } : i
      )
    );
  };

  const quitarExtra = (id) => {
    setIngredientes((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        return { ...i, cantidad: i.modo === "base" ? 1 : 0 };
      })
    );
  };

  /* ── Derivados ─────────────────────────────────── */
  const extrasAnadidos = ingredientes.filter(
    (i) =>
      (i.modo !== "base" && i.cantidad > 0) ||
      (i.modo === "base" && i.cantidad > 1)
  );

  const baseQuitados = ingredientes.filter(
    (i) => i.modo === "base" && i.cantidad === 0
  );

  /* ── Confirmar ─────────────────────────────────── */
  const handleConfirmar = () => {
    const ingredientesExtras = ingredientes
      .filter(
        (i) =>
          (i.modo !== "base" && i.cantidad > 0) ||
          (i.modo === "base" && i.cantidad > 1)
      )
      .map((i) => ({
        id: i.id,
        nombre: i.nombre,
        cantidad: i.modo === "base" ? i.cantidad - 1 : i.cantidad,
        precioUnitario: getPrecioExtra(i),
      }));

    const ingredientesQuitados = ingredientes
      .filter((i) => i.modo === "base" && i.cantidad === 0)
      .map((i) => ({ id: i.id, nombre: i.nombre }));

    onConfirm({
      tipo: "articulo",
      articuloId: data.id,
      tipoProductoId: data.tipo_producto_id,
      nombre: data.nombre,
      esComida: true,
      tamanoId: tamanoSeleccionado?.id ?? null,
      tamano: tamanoSeleccionado?.nombre ?? null,
      cantidad: 1,
      precioBase,
      precioExtras,
      precioTotal,
      ingredientesExtras,
      ingredientesQuitados,
    });
    onClose();
  };

  /* ── Render ────────────────────────────────────── */
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
          <ErrorCarga error={error} onReintentar={refetch} que="el artículo" />
        )}

        {!isLoading && !isError && data && (
          <>
            {/* ── Imagen ── */}
            <div className="text-center mb-4">
              <img
                src={data?.imagen ?? ""}
                alt={data?.nombre ?? "Producto"}
                className="img-fluid rounded-4 shadow-sm"
                style={{ maxHeight: "220px", objectFit: "cover" }}
              />
            </div>

            {data?.descripcion && (
              <p className="text-muted mb-4">{data.descripcion}</p>
            )}

            <hr />

            {/* ── Tamaño ── */}
            {!esPrecioUnico && (
              <>
                <div className="mb-4">
                  <h6 className="fw-semibold mb-2">Tamaño</h6>

                  <div className="d-flex flex-wrap gap-2">
                    {tamanos.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTamanoSeleccionado(t)}
                        className={`theme-btn style6 ${
                          tamanoSeleccionado?.id === t.id
                            ? "btn-primary text-red-50"
                            : "btn-outline-primary bg-white"
                        }`}
                      >
                        <span className="fw-semibold">{t.nombre}</span>
                        <span className="ms-2 small opacity-75">
                          {formatEUR(toNum(t.precio))}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <hr />
              </>
            )}

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
                        title={
                          desactivado
                            ? "Clic para añadir"
                            : "Clic para quitar"
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
                    const cantidad =
                      ing.modo === "base" ? ing.cantidad - 1 : ing.cantidad;

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
              defaultActiveKey={Object.keys(ingredientesAgrupados)[0]}
              className="mb-3 scrollable-tabs"
            >
              {Object.entries(ingredientesAgrupados).map(
                ([categoria, items]) => (
                  <Tab eventKey={categoria} title={categoria} key={categoria}>
                    <div className="list-group shadow-sm rounded-3">
                      {items.map((ing) => {
                        const actual = ingredientes.find(
                          (i) => i.id === ing.id
                        );
                        const cantidad = actual?.cantidad ?? 0;

                        // Para extras: cantidad extra directa
                        // Para base: extras son cantidad - 1 (si no está quitado)
                        const cantidadExtra =
                          ing.modo === "base"
                            ? Math.max(0, cantidad - 1)
                            : cantidad;

                        const quitado =
                          ing.modo === "base" && cantidad === 0;

                        const precio = getPrecioExtra(ing);
                        const max = ing.max_cantidad ?? 3;

                        return (
                          <div
                            key={ing.id}
                            className={`list-group-item d-flex justify-content-between align-items-center ${
                              ing.modo === "base" && quitado
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
                              {ing.modo === "base" ? (
                                <small className="text-muted">
                                  Ingrediente base
                                  {precio > 0 && (
                                    <> · +{precio.toFixed(2)} € por extra</>
                                  )}
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
                )
              )}
            </Tabs>
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
          {/* Total en cápsula */}
          <div className="bg-light rounded-4 px-3 py-2 mb-3 d-flex justify-content-between align-items-center">
            <span className="small color-primario fw-semibold">Total</span>
            <span className="fs-5 fw-bold color-secundario">
              {formatEUR(precioTotal)}
            </span>
          </div>

          {/* Botón principal */}
          <button
            className="theme-btn style4 w-100 rounded-pill fw-semibold text-white py-3 mb-2"
            style={{ border: "none" }}
            onClick={handleConfirmar}
          >
            Añadir al carrito
          </button>

          {/* Cancelar */}
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