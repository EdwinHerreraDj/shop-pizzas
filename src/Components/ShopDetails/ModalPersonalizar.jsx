import { useState, useEffect, useMemo } from "react";
import { Modal, Spinner, Tabs, Tab } from "react-bootstrap";
import useIngredientesConPrecios from "../../hooks/useIngredientesConPrecios";
import ErrorCarga from "../Shop/ErrorCarga";
import { Seccion, PizzaTamano, TituloCategoria } from "../PizzaBuilder/ui";
import "../../assets/crear-pizza.css";

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
    <Modal
      show={show}
      onHide={onClose}
      size="lg"
      backdrop="static"
      centered
      dialogClassName="cp-modal"
    >
      {/* ── CABECERA: producto ─────────────────── */}
      <div className="cp-cabecera cp-cabecera-producto">
        <button type="button" className="cp-cerrar" onClick={onClose} aria-label="Cerrar">
          <i className="bi bi-x-lg" />
        </button>

        <div className="d-flex align-items-center gap-3">
          {data?.imagen && (
            <img src={data.imagen} alt={data?.nombre ?? "Producto"} className="cp-producto-imagen" />
          )}
          <div style={{ minWidth: 0 }}>
            <span className="cp-etiqueta">
              <i className="bi bi-magic me-1" />
              A tu gusto
            </span>
            <h2>{data?.nombre ?? "Personalizar"}</h2>
            {data?.descripcion && <p className="cp-producto-descripcion">{data.descripcion}</p>}
          </div>
        </div>
      </div>

      <Modal.Body className="cp-cuerpo cp-cuerpo-scroll">
        {isLoading && (
          <div className="text-center py-5">
            <Spinner animation="border" style={{ color: "#eb0029" }} />
            <div className="small text-muted mt-3">Preparando tu pedido…</div>
          </div>
        )}

        {isError && (
          <ErrorCarga error={error} onReintentar={refetch} que="el artículo" />
        )}

        {!isLoading && !isError && data && (
          <>
            {/* ── Tamaño ── */}
            {!esPrecioUnico && (
              <Seccion icono="bi-rulers" titulo="¿Qué tamaño te apetece?" sub="Para ti solo o para compartir.">
                <div className="cp-tamanos">
                  {tamanos.map((t, i) => {
                    const activo = tamanoSeleccionado?.id === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        aria-pressed={activo}
                        className={`cp-tamano ${activo ? "activo" : ""}`}
                        onClick={() => setTamanoSeleccionado(t)}
                      >
                        {activo && <i className="bi bi-check-circle-fill cp-tamano-check" />}
                        <PizzaTamano indice={i} total={tamanos.length} activo={activo} />
                        <span className="cp-tamano-nombre">{t.nombre}</span>
                        <span className="cp-tamano-precio">{formatEUR(toNum(t.precio))}</span>
                      </button>
                    );
                  })}
                </div>
              </Seccion>
            )}

            {/* ── Ingredientes ── */}
            <Seccion
              icono="bi-magic"
              titulo="Dale tu toque"
              sub="Quita lo que no te guste y añade tus extras favoritos."
            >
              {/* Lo que ya lleva */}
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

              {/* Quitados */}
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

              {/* Extras añadidos */}
              {extrasAnadidos.length > 0 && (
                <div className="mb-3">
                  <h4 className="cp-subtitulo">
                    <i className="bi bi-stars text-success" />
                    Tus extras
                  </h4>

                  <div className="cp-chips">
                    {extrasAnadidos.map((ing) => {
                      const cantidad =
                        ing.modo === "base" ? ing.cantidad - 1 : ing.cantidad;

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

              {/* Añadir por categorías */}
              <h4 className="cp-subtitulo">
                <i className="bi bi-plus-square-fill" style={{ color: "#fc791a" }} />
                Añade lo que más te guste
              </h4>
              <p className="cp-ayuda">Elige una categoría y usa los botones + y −.</p>

              <Tabs
                defaultActiveKey={Object.keys(ingredientesAgrupados)[0]}
                className="cp-categorias"
              >
                {Object.entries(ingredientesAgrupados).map(([categoria, items]) => (
                  <Tab eventKey={categoria} title={<TituloCategoria categoria={categoria} />} key={categoria}>
                    <div className="cp-ingredientes">
                      {items.map((ing) => {
                        const actual = ingredientes.find((i) => i.id === ing.id);
                        const cantidad = actual?.cantidad ?? 0;

                        // Para extras: cantidad extra directa
                        // Para base: extras son cantidad - 1 (si no está quitado)
                        const cantidadExtra =
                          ing.modo === "base" ? Math.max(0, cantidad - 1) : cantidad;

                        const quitado = ing.modo === "base" && cantidad === 0;
                        const precio = getPrecioExtra(ing);
                        const max = ing.max_cantidad ?? 3;

                        return (
                          <div
                            key={ing.id}
                            className={`cp-ing ${
                              ing.modo === "base" && quitado ? "quitado" : cantidad > 0 ? "con-cantidad" : ""
                            }`}
                          >
                            <div className="d-flex flex-column" style={{ minWidth: 0 }}>
                              <span className="cp-ing-nombre">{ing.nombre}</span>
                              {ing.modo === "base" ? (
                                <span className="cp-ing-precio">
                                  Ya viene incluido
                                  {precio > 0 && <> · +{precio.toFixed(2)} € por extra</>}
                                </span>
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
            </Seccion>
          </>
        )}
      </Modal.Body>

      {/* ── PIE ────────────────────────────────── */}
      <div className="cp-pie">
        {precioExtras > 0 && (
          <p className="cp-nota mb-2">
            <i className="bi bi-info-circle me-1" />
            {formatEUR(precioBase)} + {formatEUR(precioExtras)} en extras
          </p>
        )}
        <div className="d-flex align-items-center gap-2">
          <button type="button" className="cp-ahora-no" onClick={onClose}>
            Ahora no
          </button>
          <button
            type="button"
            className="cp-anadir"
            disabled={!data}
            onClick={handleConfirmar}
          >
            <i className="bi bi-bag-plus-fill" />
            <span className="d-none d-sm-inline">Añadir a mi pedido</span>
            <span className="d-sm-none">Añadir</span>
            <span className="cp-anadir-precio">{formatEUR(precioTotal)}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
