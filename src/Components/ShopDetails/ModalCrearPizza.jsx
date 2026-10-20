import { useState, useCallback, useMemo } from "react";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { useCarrito } from "../../context/CarritoContext";
import usePizzaPlantilla from "../../hooks/usePizzaPlantilla";
import ErrorCarga from "../Shop/ErrorCarga";
import PizzaEnteraBuilder from "../PizzaBuilder/PizzaEnteraBuilder";
import PizzaMitadBuilder from "../PizzaBuilder/PizzaMitadBuilder";

/* ── Helpers ─────────────────────────────────────── */
const toNum = (v) => Number.parseFloat(v ?? 0) || 0;

const formatEUR = (v) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(Number.isFinite(v) ? v : 0);

/* ── Componente ──────────────────────────────────── */
export default function ModalCrearPizza({ show, onClose }) {
  const { agregarAlCarrito } = useCarrito();
  const { data: plantilla, isLoading, isError, error, refetch } = usePizzaPlantilla();

  /* Estado principal */
  const [modo, setModo] = useState("entera");
  const [tamanoId, setTamanoId] = useState(null);

  /* Datos emitidos por los builders */
  const [pizzaEntera, setPizzaEntera] = useState(null);
  const [pizzaMitadA, setPizzaMitadA] = useState(null);
  const [pizzaMitadB, setPizzaMitadB] = useState(null);

  /* ── Tamaños disponibles según modo ────────────── */
  const tamanos = plantilla?.tamanos ?? [];

  const tamanosDisponibles = useMemo(() => {
    if (modo === "entera") return tamanos;
    return tamanos.filter((t) => t.nombre !== "Pequeña");
  }, [tamanos, modo]);

  const tamanoIdActivo = useMemo(() => {
    if (tamanoId && tamanosDisponibles.some((t) => t.id === tamanoId)) {
      return tamanoId;
    }
    return tamanosDisponibles[0]?.id ?? null;
  }, [tamanoId, tamanosDisponibles]);

  const tamanoActual = useMemo(
    () => tamanos.find((t) => t.id === tamanoIdActivo) ?? null,
    [tamanos, tamanoIdActivo],
  );

  /* ── Recargo por mitades (configurable desde admin → Tamaños) ── */
  const recargoMitades = useMemo(() => {
    if (!tamanoActual) return 0;
    return toNum(tamanoActual.recargo_mitades);
  }, [tamanoActual]);

  /* ── Precios calculados ────────────────────────── */
  const precioPizzaEntera = useMemo(() => {
    if (!pizzaEntera) return 0;
    return toNum(pizzaEntera.precioBase) + toNum(pizzaEntera.precioExtras);
  }, [pizzaEntera]);

  const precioPizzaMitades = useMemo(() => {
    if (!pizzaMitadA || !pizzaMitadB) return 0;

    const totalA =
      toNum(pizzaMitadA.precioBase) + toNum(pizzaMitadA.precioExtras);
    const totalB =
      toNum(pizzaMitadB.precioBase) + toNum(pizzaMitadB.precioExtras);

    // Regla: la mitad MÁS CARA (base + extras) define el precio + recargo
    return Math.max(totalA, totalB) + recargoMitades;
  }, [pizzaMitadA, pizzaMitadB, recargoMitades]);

  const precioFinal =
    modo === "entera" ? precioPizzaEntera : precioPizzaMitades;

  /* ── Handlers ──────────────────────────────────── */
  const handlePizzaEnteraChange = useCallback((data) => {
    setPizzaEntera(data);
  }, []);

  const handleMitadesChange = useCallback(({ mitadA, mitadB }) => {
    setPizzaMitadA(mitadA);
    setPizzaMitadB(mitadB);
  }, []);

  const handleCambiarModo = (nuevoModo) => {
    setModo(nuevoModo);
    setPizzaEntera(null);
    setPizzaMitadA(null);
    setPizzaMitadB(null);
  };

  const handleCambiarTamano = (id) => {
    setTamanoId(id);
    setPizzaEntera(null);
    setPizzaMitadA(null);
    setPizzaMitadB(null);
  };

  const handleAnadir = () => {
    if (modo === "entera" && pizzaEntera) {
      agregarAlCarrito({
        tipo: "pizza-entera",
        articuloId: pizzaEntera.articuloId,
        tipoProductoId: pizzaEntera.tipoProductoId,
        nombre: "Pizza personalizada",
        tamanoId: tamanoIdActivo,
        tamano: tamanoActual?.nombre ?? "",
        cantidad: 1,
        precioBase: toNum(pizzaEntera.precioBase),
        precioExtras: toNum(pizzaEntera.precioExtras),
        precioTotal: precioPizzaEntera,
        ingredientesExtras: pizzaEntera.ingredientesExtras ?? [],
        ingredientesQuitados: pizzaEntera.ingredientesQuitados ?? [],
      });

      toast.success(`Pizza ${tamanoActual?.nombre} añadida al carrito`);
    }

    if (modo === "mitades" && pizzaMitadA && pizzaMitadB) {
      agregarAlCarrito({
        tipo: "pizza-mitades",
        tamanoId: tamanoIdActivo,
        tamano: tamanoActual?.nombre ?? "",
        cantidad: 1,
        precioTotal: precioPizzaMitades,
        mitades: {
          mitadA: {
            articuloId: pizzaMitadA.articuloId,
            nombre: pizzaMitadA.nombre || "Personalizada",
            precioBase: toNum(pizzaMitadA.precioBase),
            precioExtras: toNum(pizzaMitadA.precioExtras),
            ingredientesExtras: pizzaMitadA.ingredientesExtras ?? [],
            ingredientesQuitados: pizzaMitadA.ingredientesQuitados ?? [],
          },
          mitadB: {
            articuloId: pizzaMitadB.articuloId,
            nombre: pizzaMitadB.nombre || "Personalizada",
            precioBase: toNum(pizzaMitadB.precioBase),
            precioExtras: toNum(pizzaMitadB.precioExtras),
            ingredientesExtras: pizzaMitadB.ingredientesExtras ?? [],
            ingredientesQuitados: pizzaMitadB.ingredientesQuitados ?? [],
          },
        },
      });
      toast.success(
        `Pizza por mitades (${tamanoActual?.nombre}) añadida al carrito`,
      );
    }

    onClose();
  };

  const puedeAnadir =
    modo === "entera" ? !!pizzaEntera : !!pizzaMitadA && !!pizzaMitadB;

  /* ── Render ────────────────────────────────────── */
  return (
    <Modal show={show} onHide={onClose} size="lg" backdrop="static">
      <Modal.Header closeButton className="bg-light border-bottom-1">
        <Modal.Title className="fw-bold fuente-title color-primario">
          Crear tu pizza
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Loading / Error */}
        {isLoading && (
          <div className="text-center py-5 text-muted">
            Cargando configuración…
          </div>
        )}

        {isError && (
          <ErrorCarga error={error} onReintentar={refetch} que="la configuración de la pizza" />
        )}

        {plantilla && (
          <>
            {/* ── MODO ───────────────────────── */}
            <div className="mb-4">
              <Paso numero={1} titulo="Tipo de pizza" />

              <div className="row g-3">
                <div className="col-6">
                  <button
                    type="button"
                    onClick={() => handleCambiarModo("entera")}
                    className="w-100 text-start px-3 py-3 rounded-3 border d-flex align-items-start gap-3"
                    style={
                      modo === "entera"
                        ? {
                            borderColor: "#eb0029",
                            backgroundColor: "rgba(235, 0, 41, 0.05)",
                          }
                        : { backgroundColor: "#fff" }
                    }
                  >
                    <span
                      className="d-flex align-items-center justify-content-center rounded-circle border flex-shrink-0 mt-1"
                      style={{
                        width: 18,
                        height: 18,
                        borderColor: modo === "entera" ? "#eb0029" : "#adb5bd",
                        backgroundColor: modo === "entera" ? "#eb0029" : "#fff",
                      }}
                    >
                      {modo === "entera" && (
                        <span
                          className="rounded-circle bg-white"
                          style={{ width: 8, height: 8 }}
                        />
                      )}
                    </span>
                    <div>
                      <div className="fw-semibold">Crea tu propia pizza</div>
                      <small className="text-muted lh-sm">
                        Elige ingredientes y personaliza
                      </small>
                    </div>
                  </button>
                </div>

                <div className="col-6">
                  <button
                    type="button"
                    onClick={() => handleCambiarModo("mitades")}
                    className="w-100 text-start px-3 py-3 rounded-3 border d-flex align-items-start gap-3"
                    style={
                      modo === "mitades"
                        ? {
                            borderColor: "#eb0029",
                            backgroundColor: "rgba(235, 0, 41, 0.05)",
                          }
                        : { backgroundColor: "#fff" }
                    }
                  >
                    <span
                      className="d-flex align-items-center justify-content-center rounded-circle border flex-shrink-0 mt-1"
                      style={{
                        width: 18,
                        height: 18,
                        borderColor: modo === "mitades" ? "#eb0029" : "#adb5bd",
                        backgroundColor:
                          modo === "mitades" ? "#eb0029" : "#fff",
                      }}
                    >
                      {modo === "mitades" && (
                        <span
                          className="rounded-circle bg-white"
                          style={{ width: 8, height: 8 }}
                        />
                      )}
                    </span>
                    <div>
                      <div className="fw-semibold">Pizza por mitades</div>
                      <small className="text-muted lh-sm">
                        Combina dos sabores distintos
                      </small>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* ── TAMAÑO ─────────────────────── */}
            <div className="mb-4">
              <Paso numero={2} titulo="Tamaño" />

              <div className="d-flex flex-wrap gap-2">
                {tamanosDisponibles.map((t) => {
                  const activo = tamanoIdActivo === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      aria-pressed={activo}
                      className="crear-pizza-tamano flex-fill flex-sm-grow-0"
                      data-activo={activo}
                      onClick={() => handleCambiarTamano(t.id)}
                    >
                      {activo && <i className="bi bi-check-circle-fill me-1" />}
                      {t.nombre}
                      {modo === "entera" && (
                        <small className="ms-1 opacity-75">
                          ({formatEUR(t.precio)})
                        </small>
                      )}
                    </button>
                  );
                })}
              </div>
              {modo === "mitades" && (
                <p className="small text-muted mt-2 mb-0">
                  <i className="bi bi-info-circle me-1" />
                  Las pizzas por mitades están disponibles a partir del tamaño mediano.
                </p>
              )}
            </div>

            {/* ── BUILDER ────────────────────── */}
            {tamanoIdActivo && (
              <>
                <Paso
                  numero={3}
                  titulo={modo === "entera" ? "Elige los ingredientes" : "Elige las dos mitades"}
                />
                {modo === "entera" ? (
                  <PizzaEnteraBuilder
                    tamanoId={tamanoIdActivo}
                    onChange={handlePizzaEnteraChange}
                  />
                ) : (
                  <PizzaMitadBuilder
                    tamanoId={tamanoIdActivo}
                    tamanoNombre={tamanoActual?.nombre ?? ""}
                    onChange={handleMitadesChange}
                  />
                )}
              </>
            )}
          </>
        )}
      </Modal.Body>

      <Modal.Footer className="border-top-0 px-4 pb-4 pt-2">
        {modo === "mitades" && plantilla && (
          <div className="crear-pizza-desglose w-100 small text-muted">
            <i className="bi bi-info-circle me-1" />
            Se cobra la mitad más cara
            {recargoMitades > 0 && ` + ${formatEUR(recargoMitades)} por pizza a mitades`}.
            {!puedeAnadir && " Elige las dos mitades para ver el total."}
          </div>
        )}
        <div className="d-flex w-100 gap-3">
          {/* CANCELAR */}
          <Button
            type="button"
            onClick={onClose}
            className="flex-fill rounded-pill py-2 fw-semibold border"
            style={{
              backgroundColor: "#f8f9fa",
              color: "#495057",
              borderColor: "#dee2e6",
            }}
          >
            Cancelar
          </Button>

          {/* AÑADIR */}
          <Button
            type="button"
            className="flex-fill rounded-pill py-2 fw-bold text-white d-flex align-items-center justify-content-center gap-2"
            style={{
              backgroundColor: "#eb0029",
              borderColor: "#eb0029",
            }}
            disabled={!puedeAnadir}
            onClick={handleAnadir}
          >
            <span>Añadir</span>
            <span className="opacity-75">·</span>
            <strong>{formatEUR(precioFinal)}</strong>
          </Button>
        </div>
      </Modal.Footer>
      <style>{`
        .crear-pizza-tamano {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 120px;
          padding: 0.6rem 1.2rem;
          border-radius: 999px;
          border: 1px solid #dee2e6;
          background: #fff;
          color: #495057;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        .crear-pizza-tamano:hover { border-color: #eb0029; color: #eb0029; }
        .crear-pizza-tamano[data-activo="true"] {
          background: #eb0029;
          border-color: #eb0029;
          color: #fff;
          box-shadow: 0 6px 18px rgba(235, 0, 41, 0.25);
        }
        .crear-pizza-desglose {
          background: #f8f9fa;
          border-radius: 14px;
          padding: 0.75rem 1rem;
          margin-bottom: 0.5rem;
        }
      `}</style>
    </Modal>
  );
}

/* ── Encabezado de paso numerado ─────────────────── */
function Paso({ numero, titulo }) {
  return (
    <div className="d-flex align-items-center gap-2 mb-3">
      <span
        className="d-inline-flex align-items-center justify-content-center rounded-circle fw-bold text-white flex-shrink-0"
        style={{ width: 28, height: 28, backgroundColor: "#eb0029", fontSize: "0.85rem" }}
      >
        {numero}
      </span>
      <h6 className="fw-bold mb-0 color-primario">{titulo}</h6>
    </div>
  );
}
