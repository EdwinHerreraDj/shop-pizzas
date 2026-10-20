import { useState, useCallback, useMemo } from "react";
import { Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import { useCarrito } from "../../context/CarritoContext";
import usePizzaPlantilla from "../../hooks/usePizzaPlantilla";
import ErrorCarga from "../Shop/ErrorCarga";
import PizzaEnteraBuilder from "../PizzaBuilder/PizzaEnteraBuilder";
import PizzaMitadBuilder from "../PizzaBuilder/PizzaMitadBuilder";
import { Seccion, PizzaDibujo, PizzaTamano } from "../PizzaBuilder/ui";
import "../../assets/crear-pizza.css";

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

  /* ── Progreso: 1 tipo (siempre), 2 tamaño, 3 pizza lista ── */
  const pasos = [
    { nombre: "Tipo", hecho: true },
    { nombre: "Tamaño", hecho: !!tamanoIdActivo },
    { nombre: modo === "mitades" ? "Mitades" : "Ingredientes", hecho: puedeAnadir },
  ];
  const textoProgreso = puedeAnadir
    ? "¡Lista para el horno!"
    : modo === "mitades"
      ? "Elige tus dos sabores y listo."
      : "Tres pasos y a disfrutar.";

  /* ── Render ────────────────────────────────────── */
  return (
    <Modal
      show={show}
      onHide={onClose}
      size="lg"
      backdrop="static"
      dialogClassName="cp-modal"
    >
      {/* ── CABECERA ───────────────────────────── */}
      <div className="cp-cabecera">
        <button type="button" className="cp-cerrar" onClick={onClose} aria-label="Cerrar">
          <i className="bi bi-x-lg" />
        </button>
        <h2>¡Vamos a crear tu pizza!</h2>
        <p>{textoProgreso}</p>

        <ol className="cp-pasos" aria-label="Progreso">
          {pasos.map((paso, i) => (
            <li key={paso.nombre} className={`cp-paso ${paso.hecho ? "hecho" : ""}`}>
              <span className="cp-paso-marca">
                {paso.hecho ? <i className="bi bi-check-lg" /> : i + 1}
              </span>
              {paso.nombre}
            </li>
          ))}
        </ol>
      </div>

      <Modal.Body className="cp-cuerpo">
        {/* Loading / Error */}
        {isLoading && (
          <div className="text-center py-5 text-muted">
            <div className="spinner-border mb-2" style={{ color: "#eb0029" }} role="status" />
            <div>Preparando la masa…</div>
          </div>
        )}

        {isError && (
          <ErrorCarga error={error} onReintentar={refetch} que="la configuración de la pizza" />
        )}

        {plantilla && (
          <>
            {/* ── 1. TIPO ─────────────────────── */}
            <Seccion icono="bi-heart-fill" titulo="¿Cómo la quieres?" sub="Una sola receta o dos sabores en la misma pizza.">
              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <button
                    type="button"
                    onClick={() => handleCambiarModo("entera")}
                    aria-pressed={modo === "entera"}
                    className={`cp-opcion ${modo === "entera" ? "activa" : ""}`}
                  >
                    <PizzaDibujo tipo="entera" />
                    <span>
                      <span className="cp-opcion-titulo">Pizza entera</span>
                      <span className="cp-opcion-sub">Tú eliges todos los ingredientes</span>
                    </span>
                  </button>
                </div>
                <div className="col-12 col-sm-6">
                  <button
                    type="button"
                    onClick={() => handleCambiarModo("mitades")}
                    aria-pressed={modo === "mitades"}
                    className={`cp-opcion ${modo === "mitades" ? "activa" : ""}`}
                  >
                    <PizzaDibujo tipo="mitades" />
                    <span>
                      <span className="cp-opcion-titulo">Mitad y mitad</span>
                      <span className="cp-opcion-sub">Lo mejor de dos sabores</span>
                    </span>
                  </button>
                </div>
              </div>
            </Seccion>

            {/* ── 2. TAMAÑO ───────────────────── */}
            <Seccion
              icono="bi-rulers"
              titulo="¿Qué tamaño te apetece?"
              sub={
                modo === "mitades"
                  ? "Mitad y mitad está disponible a partir de la mediana."
                  : "Para ti solo o para compartir."
              }
            >
              <div className="cp-tamanos">
                {tamanosDisponibles.map((t) => {
                  const activo = tamanoIdActivo === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      aria-pressed={activo}
                      className={`cp-tamano ${activo ? "activo" : ""}`}
                      onClick={() => handleCambiarTamano(t.id)}
                    >
                      <PizzaTamano
                        indice={tamanos.findIndex((x) => x.id === t.id)}
                        total={tamanos.length}
                        activo={activo}
                      />
                      {activo && <i className="bi bi-check-circle-fill cp-tamano-check" />}
                      <span className="cp-tamano-nombre">{t.nombre}</span>
                      {modo === "entera" && (
                        <span className="cp-tamano-precio">{formatEUR(toNum(t.precio))}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </Seccion>

            {/* ── 3. INGREDIENTES / MITADES ───── */}
            {tamanoIdActivo && (
              <Seccion
                icono={modo === "entera" ? "bi-magic" : "bi-circle-half"}
                titulo={modo === "entera" ? "Dale tu toque" : "Elige tus dos mitades"}
                sub={
                  modo === "entera"
                    ? "Quita lo que no te guste y añade tus extras favoritos."
                    : "Una pizza de la carta o creada por ti en cada mitad."
                }
              >
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
              </Seccion>
            )}
          </>
        )}
      </Modal.Body>

      {/* ── PIE ────────────────────────────────── */}
      <div className="cp-pie">
        {modo === "mitades" && plantilla && (
          <p className="cp-nota mb-2">
            <i className="bi bi-info-circle me-1" />
            Se cobra la mitad más cara
            {recargoMitades > 0 && ` + ${formatEUR(recargoMitades)} por pizza a mitades`}.
            {!puedeAnadir && " Elige las dos mitades para ver el total."}
          </p>
        )}
        <div className="d-flex align-items-center gap-2">
          <button type="button" className="cp-ahora-no" onClick={onClose}>
            Ahora no
          </button>
          <button
            type="button"
            className="cp-anadir"
            disabled={!puedeAnadir}
            onClick={handleAnadir}
          >
            <i className="bi bi-bag-plus-fill" />
            <span className="d-none d-sm-inline">Añadir a mi pedido</span>
            <span className="d-sm-none">Añadir</span>
            <span className="cp-anadir-precio">{formatEUR(precioFinal)}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
