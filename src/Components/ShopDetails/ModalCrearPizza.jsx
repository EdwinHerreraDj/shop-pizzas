import { useState, useCallback, useMemo, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { useCarrito } from "../../context/CarritoContext";
import PizzaEnteraBuilder from "../PizzaBuilder/PizzaEnteraBuilder";
import PizzaMitadBuilder from "../PizzaBuilder/PizzaMitadBuilder";

const toNum = (v) => Number.parseFloat(v ?? 0) || 0;

const formatEUR = (v) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(
    Number.isFinite(v) ? v : 0
  );

/**
 * Props nuevas recomendadas:
 * - tamanos: [{ id, nombre, activo }]
 * - defaultTamanoNombre (opcional): "Mediana"
 */
export default function ModalCrearPizza({
  show,
  onClose,
  tamanos = [],
  defaultTamanoNombre = "Mediana",
}) {
  const { agregarAlCarrito } = useCarrito();

  const [modo, setModo] = useState("entera");

  // tamaño ahora es id
  const [tamanoId, setTamanoId] = useState(null);

  // payloads que deben venir del builder ya con precios calculados
  // pizzaEntera: { articuloId, nombre, tipoProductoId, precioBase, precioExtras, extras:[], quitados:[] }
  const [pizzaEntera, setPizzaEntera] = useState(null);

  // mitades: { articuloId, nombre, tipoProductoId, precioBase, precioExtras, ingredientesExtras:[], ingredientesQuitados:[] }
  const [pizzaMitadA, setPizzaMitadA] = useState(null);
  const [pizzaMitadB, setPizzaMitadB] = useState(null);

  /* ===============================
     INIT: tamaño por defecto
  =============================== */
  useEffect(() => {
    if (!show) return;

    // Si ya hay uno seleccionado, no tocarlo.
    if (tamanoId) return;

    const activos = tamanos.filter((t) => t?.activo !== 0);
    const preferido =
      activos.find((t) => t?.nombre === defaultTamanoNombre) || activos[0];

    setTamanoId(preferido?.id ?? null);
  }, [show, tamanos, defaultTamanoNombre, tamanoId]);

  const tamanoActual = useMemo(
    () => tamanos.find((t) => t?.id === tamanoId) || null,
    [tamanos, tamanoId]
  );

  /* ===============================
     RESETEOS al cambiar modo/tamaño
     (evita precios mezclados de otro tamaño)
  =============================== */
  useEffect(() => {
    // al cambiar tamaño, invalida selección actual (porque cambian precios y compatibilidades)
    if (!show) return;

    setPizzaEntera(null);
    setPizzaMitadA(null);
    setPizzaMitadB(null);
  }, [tamanoId, modo, show]);

  /* ===============================
     PRECIOS (ya NO hay recargos manuales)
  =============================== */
  const precioPizzaEntera = useMemo(() => {
    if (!pizzaEntera) return 0;
    return toNum(pizzaEntera.precioBase) + toNum(pizzaEntera.precioExtras);
  }, [pizzaEntera]);

  const precioPizzaMitades = useMemo(() => {
    if (!pizzaMitadA || !pizzaMitadB) return 0;

    const baseA = toNum(pizzaMitadA.precioBase);
    const baseB = toNum(pizzaMitadB.precioBase);

    const extrasA = toNum(pizzaMitadA.precioExtras);
    const extrasB = toNum(pizzaMitadB.precioExtras);

    const base = Math.max(baseA, baseB);
    return base + extrasA + extrasB;
  }, [pizzaMitadA, pizzaMitadB]);

  const handlePizzaEnteraChange = useCallback((data) => {
    setPizzaEntera(data);
  }, []);

  const allowedTamanos = useMemo(() => {
    // Mantengo tu regla de UI: mitades no permite pequeña.
    // Si quieres que eso sea configurable desde BD, se cambia aquí.
    if (modo === "entera") return tamanos.filter((t) => t?.activo !== 0);
    return tamanos.filter((t) => t?.activo !== 0 && t?.nombre !== "Pequeña");
  }, [modo, tamanos]);

  return (
    <Modal show={show} onHide={onClose} size="lg" backdrop="static">
      <Modal.Header closeButton className="bg-light border-bottom-1">
        <Modal.Title className="fw-bold fuente-title color-primario">
          Crear tu pizza
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* MODO */}
        <div className="mb-4">
          <h6 className="fw-bold text-uppercase color-primario mb-3">
            Tipo de pizza
          </h6>

          <div className="row g-3">
            <div className="col-6">
              <button
                type="button"
                onClick={() => setModo("entera")}
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
                onClick={() => setModo("mitades")}
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
                    backgroundColor: modo === "mitades" ? "#eb0029" : "#fff",
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

        {/* TAMAÑO */}
        <div className="mb-4">
          <label className="fw-semibold mb-2 d-block color-primario">
            Tamaño
          </label>

          <div className="d-flex gap-2 flex-wrap">
            {allowedTamanos.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`theme-btn style6 ${
                  tamanoId === t.id
                    ? "btn-primary text-red-50"
                    : "btn-outline-primary bg-white"
                }`}
                onClick={() => setTamanoId(t.id)}
              >
                {t.nombre}
              </button>
            ))}
          </div>

          {!tamanoId && (
            <small className="text-danger d-block mt-2">
              No hay tamaños disponibles.
            </small>
          )}
        </div>

        <hr />

        {/* BUILDER */}
        {modo === "entera" ? (
          <PizzaEnteraBuilder
            tamanoId={tamanoId}
            tamanoNombre={tamanoActual?.nombre ?? ""}
            onChange={handlePizzaEnteraChange}
          />
        ) : (
          <PizzaMitadBuilder
            tamanoId={tamanoId}
            tamanoNombre={tamanoActual?.nombre ?? ""}
            onChange={({ mitadA, mitadB }) => {
              setPizzaMitadA(mitadA || null);
              setPizzaMitadB(mitadB || null);
            }}
          />
        )}
      </Modal.Body>

      <Modal.Footer className="border-top-0 px-4 pb-4 pt-2">
        <div className="d-flex w-100 gap-3">
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

          <Button
            type="button"
            className="flex-fill rounded-pill py-2 fw-bold text-white d-flex align-items-center justify-content-center gap-2"
            style={{
              backgroundColor: "#eb0029",
              borderColor: "#eb0029",
            }}
            disabled={
              !tamanoId ||
              (modo === "entera" ? !pizzaEntera : !pizzaMitadA || !pizzaMitadB)
            }
            onClick={() => {
              if (!tamanoId) return;

              if (modo === "entera") {
                agregarAlCarrito({
                  tipo: "pizza-entera",
                  nombre: pizzaEntera?.nombre || "Pizza personalizada",
                  tamano_id: tamanoId,
                  tamano: tamanoActual?.nombre || "",
                  cantidad: 1,

                  articulo_id: pizzaEntera?.articuloId ?? null,
                  tipo_producto_id: pizzaEntera?.tipoProductoId ?? null,

                  precioBase: toNum(pizzaEntera?.precioBase),
                  precioExtras: toNum(pizzaEntera?.precioExtras),
                  precioTotal: precioPizzaEntera,

                  ingredientesExtras: pizzaEntera?.extras || [],
                  ingredientesQuitados: pizzaEntera?.quitados || [],
                });
              } else {
                agregarAlCarrito({
                  tipo: "pizza-mitades",
                  tamano_id: tamanoId,
                  tamano: tamanoActual?.nombre || "",
                  cantidad: 1,

                  precioBase: Math.max(
                    toNum(pizzaMitadA?.precioBase),
                    toNum(pizzaMitadB?.precioBase)
                  ),
                  precioExtras:
                    toNum(pizzaMitadA?.precioExtras) +
                    toNum(pizzaMitadB?.precioExtras),
                  precioTotal: precioPizzaMitades,

                  mitades: {
                    mitadA: {
                      articulo_id: pizzaMitadA?.articuloId ?? null,
                      tipo_producto_id: pizzaMitadA?.tipoProductoId ?? null,
                      nombre: pizzaMitadA?.nombre || "Personalizada",
                      precioBase: toNum(pizzaMitadA?.precioBase),
                      precioExtras: toNum(pizzaMitadA?.precioExtras),
                      ingredientesExtras: pizzaMitadA?.ingredientesExtras || [],
                      ingredientesQuitados:
                        pizzaMitadA?.ingredientesQuitados || [],
                    },
                    mitadB: {
                      articulo_id: pizzaMitadB?.articuloId ?? null,
                      tipo_producto_id: pizzaMitadB?.tipoProductoId ?? null,
                      nombre: pizzaMitadB?.nombre || "Personalizada",
                      precioBase: toNum(pizzaMitadB?.precioBase),
                      precioExtras: toNum(pizzaMitadB?.precioExtras),
                      ingredientesExtras: pizzaMitadB?.ingredientesExtras || [],
                      ingredientesQuitados:
                        pizzaMitadB?.ingredientesQuitados || [],
                    },
                  },
                });
              }

              toast.success(
                modo === "entera"
                  ? `Pizza ${tamanoActual?.nombre || ""} añadida al carrito`
                  : `Pizza por mitades (${tamanoActual?.nombre || ""}) añadida al carrito`
              );

              onClose();
            }}
          >
            <span>Añadir</span>
            <span className="opacity-75">·</span>
            <strong>
              {modo === "entera"
                ? formatEUR(precioPizzaEntera)
                : formatEUR(precioPizzaMitades)}
            </strong>
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}