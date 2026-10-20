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
              <h6 className="fw-bold text-uppercase color-primario mb-3">
                Tipo de pizza
              </h6>

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

            <hr />

            {/* ── TAMAÑO ─────────────────────── */}
            <div className="mb-4">
              <label className="fw-semibold mb-2 d-block color-primario">
                Tamaño
              </label>

              <div className="d-flex flex-wrap gap-2">
                {tamanosDisponibles.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`theme-btn style6 flex-fill flex-sm-grow-0 ${
                      tamanoIdActivo === t.id
                        ? "btn-primary text-red-50"
                        : "btn-outline-primary bg-white"
                    }`}
                    style={{ minWidth: "120px" }}
                    onClick={() => handleCambiarTamano(t.id)}
                  >
                    {t.nombre}
                    {modo === "entera" && (
                      <small className="ms-1 opacity-75 d-block d-sm-inline">
                        ({formatEUR(t.precio)})
                      </small>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <hr />

            {/* ── BUILDER ────────────────────── */}
            {tamanoIdActivo && (
              <>
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
    </Modal>
  );
}
