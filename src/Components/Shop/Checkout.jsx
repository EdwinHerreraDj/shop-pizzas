import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useCarrito } from "../../context/CarritoContext";
import clientesAxios, { esTiendaCerrada, datosCierre } from "../../config/axios";
import { iniciarPagoRedsys } from "../../utils/pagoRedsys";
import useAbiertoAhora from "../../hooks/useAbiertoAhora";
import useOpcionesEntrega from "../../hooks/useOpcionesEntrega";
import AvisoEntrega from "./AvisoEntrega";
import "../../assets/crear-pizza.css";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const formatEUR = (v) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(
    Number.isFinite(Number(v)) ? Number(v) : 0,
  );

// ─────────────────────────────────────────────────────────────────────────────
// ResumenItem — misma estética que Cart.jsx
// ─────────────────────────────────────────────────────────────────────────────

const renderExtras = (extras = []) => {
  if (!extras.length) return null;
  return (
    <div className="mt-1">
      {extras.map((e, i) => (
        <span
          key={i}
          className="d-inline-flex align-items-center gap-1 rounded-pill px-2 py-1 me-1 mb-1 bg-success bg-opacity-10 border border-success-subtle"
          style={{ fontSize: "0.78rem" }}
        >
          <i
            className="bi bi-plus-circle-fill text-success"
            style={{ fontSize: "0.7rem" }}
          />
          <span className="text-success fw-medium">
            {e.nombre ?? `Extra #${e.ingredienteId}`}
          </span>
          {e.cantidad > 1 && (
            <span
              className="badge bg-success text-white rounded-pill"
              style={{ fontSize: "0.65rem" }}
            >
              x{e.cantidad}
            </span>
          )}
        </span>
      ))}
    </div>
  );
};

const renderQuitados = (quitados = []) => {
  if (!quitados.length) return null;
  return (
    <div className="mt-1">
      {quitados.map((q, i) => (
        <span
          key={i}
          className="d-inline-flex align-items-center gap-1 rounded-pill px-2 py-1 me-1 mb-1 bg-danger bg-opacity-10 border border-danger-subtle"
          style={{ fontSize: "0.78rem" }}
        >
          <i
            className="bi bi-dash-circle-fill text-danger"
            style={{ fontSize: "0.7rem" }}
          />
          <span className="text-danger fw-medium text-decoration-line-through">
            {q.nombre ?? `Ing. #${q.ingredienteId}`}
          </span>
        </span>
      ))}
    </div>
  );
};

const renderMitad = (label, mitad) => {
  if (!mitad) return null;
  return (
    <div className="rounded-3 bg-light p-2 mt-2">
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <span
            className="d-inline-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
            style={{
              width: 22,
              height: 22,
              fontSize: "0.7rem",
              backgroundColor: "#eb0029",
            }}
          >
            {label}
          </span>
          <span className="fw-semibold small">
            {mitad.nombre ?? "Personalizada"}
          </span>
        </div>
      </div>
      {renderExtras(mitad.ingredientesExtras)}
      {renderQuitados(mitad.ingredientesQuitados)}
    </div>
  );
};

function ResumenItem({ item }) {
  const esMitades = item.tipo === "pizza-mitades";

  return (
    <div className="checkout-item">
      <div className="d-flex justify-content-between align-items-start">
        <div className="flex-grow-1">
          <div className="fw-bold color-primario">
            {esMitades
              ? "Pizza por mitades"
              : (item.nombre ?? `Artículo #${item.articuloId}`)}
            <span className="ms-2 fw-normal text-muted small">
              ×{item.cantidad}
            </span>
          </div>

          {item.tamanoNombre && (
            <span className="badge bg-light text-muted border rounded-pill small me-1">
              {item.tamanoNombre}
            </span>
          )}

          {esMitades ? (
            <>
              {renderMitad("1", item.mitades?.mitadA)}
              {renderMitad("2", item.mitades?.mitadB)}
            </>
          ) : (
            <>
              {renderExtras(item.ingredientesExtras)}
              {renderQuitados(item.ingredientesQuitados)}
            </>
          )}
        </div>

        <div className="text-end ms-3 flex-shrink-0">
          <div className="fw-bold color-secundario">
            {formatEUR(item.precioTotal)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Campo de formulario
// ─────────────────────────────────────────────────────────────────────────────

function Campo({
  label,
  name,
  type = "text",
  value,
  onChange,
  errores,
  required,
  placeholder,
  as,
  children,
}) {
  const error = errores?.[`cliente.${name}`]?.[0] ?? errores?.[name]?.[0];

  return (
    <div className="mb-3">
      {label && (
        <label className="form-label checkout-label">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}

      {children ??
        (as === "textarea" ? (
          <textarea
            id={`field-${name}`}
            name={name}
            className={`form-control checkout-input${error ? " is-invalid" : ""}`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            rows={3}
          />
        ) : (
          <input
            id={`field-${name}`}
            type={type}
            name={name}
            className={`form-control checkout-input${error ? " is-invalid" : ""}`}
            placeholder={placeholder ?? label}
            value={value}
            onChange={onChange}
            required={required}
          />
        ))}

      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Opción de radio con estilo de card seleccionable
// ─────────────────────────────────────────────────────────────────────────────

// Icono (Bootstrap Icons) según la clave del método de pago
const ICONOS_METODO_PAGO = {
  efectivo: "bi-cash-coin",
  tarjeta: "bi-credit-card",
  transferencia: "bi-bank",
};
const iconoMetodoPago = (clave) => ICONOS_METODO_PAGO[clave] ?? "bi-wallet2";

// "Te lo llevamos a casa · Pago: Efectivo, Tarjeta"
function textoMetodos(texto, metodos) {
  if (!metodos.length) return texto;
  return `${texto} · Pago: ${metodos.map((m) => m.nombre).join(", ")}`;
}

function RadioCard({
  id,
  name,
  value,
  checked,
  onChange,
  icon,
  label,
  sublabel,
  disabled = false,
}) {
  return (
    <label
      htmlFor={id}
      className={`checkout-opcion ${checked ? "activa" : ""} ${disabled ? "desactivada" : ""}`}
    >
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="form-check-input mt-0 flex-shrink-0"
        style={{ accentColor: "#eb0029" }}
      />
      <span className="checkout-opcion-icono">
        <i className={`bi ${icon}`} />
      </span>
      <div>
        <div className="fw-semibold color-primario">{label}</div>
        {sublabel && <div className="text-muted small">{sublabel}</div>}
      </div>
    </label>
  );
}

// Cabecera numerada de cada apartado del checkout
function CabeceraPaso({ numero, icono, titulo }) {
  return (
    <div className="cp-seccion-cabecera">
      <span className="cp-seccion-icono">
        <i className={`bi ${icono}`} />
      </span>
      <div>
        <span className="checkout-paso">Paso {numero} de 4</span>
        <h3 className="cp-seccion-titulo">{titulo}</h3>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PedidoConfirmado
// ─────────────────────────────────────────────────────────────────────────────

function PedidoConfirmado({ pedido, carritoSnapshot = [] }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const subtotal = carritoSnapshot.reduce(
    (acc, item) => acc + (Number(item.precioTotal) || 0),
    0,
  );

  return (
    <div className="section-padding bg-color2">
      <div className="container" style={{ maxWidth: 580 }}>
        {/* Cabecera */}
        <div className="text-center mb-4">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
            style={{
              width: 80,
              height: 80,
              backgroundColor: "#eb002915",
              fontSize: "2.2rem",
            }}
          >
            <i className="bi bi-check-lg" />
          </div>
          <h2 className="fw-bold color-primario mb-2">¡Pedido realizado!</h2>
          <p className="text-muted mb-1">
            Código:{" "}
            <strong
              style={{
                fontFamily: "monospace",
                letterSpacing: "2px",
                color: "#eb0029",
              }}
            >
              {pedido.codigo}
            </strong>
          </p>
          <p className="text-muted mb-0">
            {pedido.tipo_entrega === "recogida"
              ? "Pasa a recogerlo cuando esté listo."
              : "En breve comenzaremos a prepararlo."}
          </p>
        </div>

        {/* Resumen detallado del pedido */}
        {carritoSnapshot.length > 0 && (
          <div className="border rounded-4 p-4 shadow-sm bg-white mb-4">
            <h5
              className="fw-bold color-primario mb-3"
              style={{ fontFamily: "var(--title-font)" }}
            >
              <i className="bi bi-receipt me-2" />
              Resumen de tu pedido
            </h5>

            <div className="d-flex flex-column gap-3">
              {carritoSnapshot.map((item, i) => (
                <ResumenItem key={item.uid ?? i} item={item} />
              ))}
            </div>

            {/* Totales */}
            <div className="border-top mt-3 pt-3">
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-bold">Total</span>
                <span className="fw-bold fs-5 color-secundario">
                  {formatEUR(subtotal)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="text-center">
          <Link
            to={`/pedido/${pedido.codigo}`}
            className="btn rounded-pill px-5 py-2 text-white fw-semibold d-block mb-3"
            style={{ backgroundColor: "#eb0029" }}
          >
            <i className="bi bi-geo-alt me-2" />
            Seguir mi pedido
          </Link>

          <Link
            to="/"
            className="btn btn-outline rounded-pill px-5 py-2 fw-semibold"
            style={{ border: "1px solid #eb0029", color: "#eb0029" }}
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Checkout principal
// ─────────────────────────────────────────────────────────────────────────────

const Checkout = () => {
  const { carrito, totalCarrito, vaciarCarrito, prepararPedido } = useCarrito();

  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
    bloque: "",
    piso: "",
    codigo_postal: "",
    barrio: "",
    observaciones: "",
    metodo_pago: "",
    tipo_entrega: "domicilio",
  });

  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState({});
  const [pedidoCreado, setPedidoCreado] = useState(null);
  const [carritoSnapshot, setCarritoSnapshot] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [loadingZonas, setLoadingZonas] = useState(true);
  const [errorZonas, setErrorZonas] = useState(false);
  const [slots, setSlots] = useState([]);
  const [modoHora, setModoHora] = useState("asap"); // "asap" | "programar"
  const { data: estadoApertura } = useAbiertoAhora();
  const tiendaCerradaPorHorario =
    estadoApertura !== undefined && estadoApertura?.abierto === false;

  // Si la tienda está cerrada por horario, forzamos modo "programar"
  useEffect(() => {
    if (tiendaCerradaPorHorario && modoHora === "asap") {
      setModoHora("programar");
    }
  }, [tiendaCerradaPorHorario, modoHora]);
  const [horaDeseada, setHoraDeseada] = useState("");
  const {
    metodos: metodosPago,
    metodosDomicilio,
    metodosRecogida,
    domicilio: hayDomicilio,
    recogida: hayRecogida,
    cargado: metodosCargados,
  } = useOpcionesEntrega();

  // Si el admin desactiva una opción de entrega, pasamos a la disponible
  // y aseguramos que el método de pago elegido sea válido para ella.
  useEffect(() => {
    if (!metodosCargados) return;
    setForm((prev) => {
      let tipo = prev.tipo_entrega;
      if (tipo === "domicilio" && !hayDomicilio && hayRecogida) tipo = "recogida";
      if (tipo === "recogida" && !hayRecogida && hayDomicilio) tipo = "domicilio";

      const campo = tipo === "recogida" ? "activo_recogida" : "activo_domicilio";
      const metodoValido = metodosPago.some(
        (m) => m.clave === prev.metodo_pago && m[campo],
      );
      const metodo = metodoValido
        ? prev.metodo_pago
        : (metodosPago.find((m) => m[campo])?.clave ?? "");

      if (tipo === prev.tipo_entrega && metodo === prev.metodo_pago) return prev;

      const next = { ...prev, tipo_entrega: tipo, metodo_pago: metodo };
      if (tipo === "recogida") {
        next.direccion = "";
        next.codigo_postal = "";
        next.barrio = "";
      }
      return next;
    });
  }, [metodosCargados, hayDomicilio, hayRecogida, metodosPago]);

  useEffect(() => {
    setLoadingZonas(true);
    setErrorZonas(false);
    Promise.all([
      clientesAxios.get("/shop/zonas-envio"),
      clientesAxios.get("/shop/franjas-horarias"),
    ])
      .then(([zonasRes, franjasRes]) => {
        setZonas(zonasRes.data);
        setSlots(franjasRes.data.slots ?? []);
      })
      .catch(() => {
        setErrorZonas(true);
        toast.error("No se pudieron cargar los datos de configuración");
      })
      .finally(() => setLoadingZonas(false));
  }, []);

  const esRecogida = form.tipo_entrega === "recogida";

  const barriosDisponibles = useMemo(() => {
    if (!form.codigo_postal.trim() || esRecogida) return [];
    return zonas.filter((z) => z.codigo_postal === form.codigo_postal.trim());
  }, [form.codigo_postal, zonas, esRecogida]);

  const cpSinCobertura =
    !esRecogida &&
    form.codigo_postal.trim().length > 0 &&
    zonas.length > 0 &&
    barriosDisponibles.length === 0;

  const zonaSeleccionada = useMemo(() => {
    if (esRecogida || !form.barrio) return null;
    return barriosDisponibles.find((z) => z.barrio === form.barrio) ?? null;
  }, [form.barrio, barriosDisponibles, esRecogida]);

  const subtotal = totalCarrito;
  const gastosEnvio = zonaSeleccionada
    ? Number(zonaSeleccionada.recargo)
    : null;
  const totalEstimado =
    gastosEnvio !== null
      ? subtotal + gastosEnvio
      : esRecogida
        ? subtotal
        : null;

  // Comparar en céntimos (enteros) para evitar errores de punto flotante
  // El pedido mínimo se valida contra el total (subtotal + gastos de envío)
  const totalParaMinimo = subtotal + (gastosEnvio ?? 0);
  const pedidoMinimoNoAlcanzado =
    !esRecogida &&
    zonaSeleccionada &&
    Number(zonaSeleccionada.pedido_minimo) > 0 &&
    Math.round(totalParaMinimo * 100) < Math.round(Number(zonaSeleccionada.pedido_minimo) * 100);

  // La opción elegida no tiene ningún método de pago activo ahora mismo
  const entregaNoDisponible =
    metodosCargados && !(esRecogida ? hayRecogida : hayDomicilio);

  const submitBloqueado =
    loading ||
    loadingZonas ||
    errorZonas ||
    !metodosCargados ||
    entregaNoDisponible ||
    carrito.length === 0 ||
    cpSinCobertura ||
    (!esRecogida && !zonaSeleccionada) ||
    pedidoMinimoNoAlcanzado;

  // ── Carrito vacío ──────────────────────────────────────────────────────
  if (carrito.length === 0 && !pedidoCreado) {
    return (
      <div className="section-padding bg-white">
        <div className="container text-center py-5">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light mb-3"
            style={{ width: 80, height: 80 }}
          >
            <i
              className="bi bi-cart3"
              style={{ fontSize: "2rem", color: "#adb5bd" }}
            />
          </div>
          <p className="text-muted mb-4">Tu carrito está vacío</p>
          <Link
            to="/shop"
            className="btn rounded-pill px-4 py-2 text-white fw-semibold"
            style={{ backgroundColor: "#eb0029" }}
          >
            Ver la carta
          </Link>
        </div>
      </div>
    );
  }

  if (pedidoCreado) return <PedidoConfirmado pedido={pedidoCreado} carritoSnapshot={carritoSnapshot} />;

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      // Teléfono: solo dígitos, máximo 9
      const val = name === "telefono" ? value.replace(/\D/g, "").slice(0, 9) : value;
      const next = { ...prev, [name]: val };
      if (name === "codigo_postal") next.barrio = "";
      if (name === "tipo_entrega") {
        if (value === "recogida") {
          next.direccion = "";
          next.codigo_postal = "";
          next.barrio = "";
        }
        // Resetear método de pago si el actual no está disponible en el nuevo tipo
        const campo = value === "recogida" ? "activo_recogida" : "activo_domicilio";
        const disponible = metodosPago.some(
          (m) => m.clave === next.metodo_pago && m[campo],
        );
        if (!disponible) {
          const primero = metodosPago.find((m) => m[campo]);
          next.metodo_pago = primero?.clave ?? "";
        }
      }
      return next;
    });
    const claves = [name, `cliente.${name}`];
    if (claves.some((k) => errores[k])) {
      setErrores((prev) => {
        const copia = { ...prev };
        claves.forEach((k) => delete copia[k]);
        return copia;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (carrito.length === 0) {
      toast.error("El carrito está vacío");
      return;
    }

    const tieneComida = carrito.some(
      (item) =>
        item.tipo === "pizza-entera" ||
        item.tipo === "pizza-mitades" ||
        item.esComida === true,
    );
    if (!tieneComida) {
      toast.error("El pedido debe incluir al menos un artículo de comida");
      return;
    }

    if (!/^\d{9}$/.test(form.telefono)) {
      setErrores({ "cliente.telefono": ["El teléfono debe tener exactamente 9 dígitos."] });
      document.getElementById("field-telefono")?.scrollIntoView({ behavior: "smooth", block: "center" });
      toast.error("El teléfono debe tener 9 dígitos");
      return;
    }

    if (!esRecogida) {
      if (cpSinCobertura) {
        setErrores({
          "cliente.codigo_postal": [
            "No realizamos envíos a ese código postal.",
          ],
        });
        document
          .getElementById("field-codigo_postal")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
        toast.error("No realizamos envíos a ese código postal");
        return;
      }
      if (!zonaSeleccionada) {
        setErrores({
          "cliente.barrio": ["Selecciona el barrio para calcular el envío."],
        });
        document
          .getElementById("field-barrio")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
        toast.error("Selecciona tu barrio");
        return;
      }
    }

    setLoading(true);
    setErrores({});

    try {
      const payload = {
        tipo_entrega: form.tipo_entrega,
        cliente: {
          nombre: form.nombre,
          telefono: form.telefono,
          direccion: esRecogida ? null : form.direccion,
          bloque: esRecogida ? null : (form.bloque || null),
          piso: esRecogida ? null : (form.piso || null),
          codigo_postal: esRecogida ? null : form.codigo_postal,
          barrio: esRecogida ? null : form.barrio,
        },
        metodo_pago: form.metodo_pago,
        observaciones: form.observaciones || null,
        hora_deseada: modoHora === "programar" && horaDeseada ? horaDeseada : null,
        items: prepararPedido(),
      };

      const { data } = await clientesAxios.post("/shop/pedidos", payload);
      setCarritoSnapshot([...carrito]);
      const pedido = data.pedido;

      // Registramos el pedido como activo (para el banner de tracking)
      const activos = JSON.parse(localStorage.getItem("pedidos_activos") || "[]");
      if (!activos.includes(pedido.codigo)) activos.push(pedido.codigo);
      localStorage.setItem("pedidos_activos", JSON.stringify(activos));

      // ── Pago con tarjeta → redirigir al TPV de Redsys ───────────────────
      if (form.metodo_pago === "tarjeta") {
        try {
          vaciarCarrito();
          await iniciarPagoRedsys(pedido.codigo);
          return; // El navegador sale de la SPA hacia el TPV
        } catch (e) {
          toast.error(
            e?.response?.data?.message ??
              "No se pudo iniciar el pago con tarjeta",
          );
          return;
        }
      }

      // ── Otros métodos (efectivo, transferencia): pantalla de confirmación
      setPedidoCreado(pedido);
      vaciarCarrito();
      toast.success("¡Pedido realizado correctamente!");
    } catch (error) {
      if (error.response?.status === 422) {
        const serverErrors = error.response.data.errors ?? {};
        setErrores(serverErrors);

        if (serverErrors.pedido_minimo) {
          toast.error(serverErrors.pedido_minimo[0]);
        } else if (serverErrors.hora_deseada) {
          toast.error(serverErrors.hora_deseada[0]);
        } else {
          const primerCampo = Object.keys(serverErrors)[0];
          if (primerCampo) {
            const normalizado = primerCampo.startsWith("cliente.")
              ? primerCampo.replace("cliente.", "")
              : primerCampo;
            document
              .getElementById(`field-${normalizado}`)
              ?.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          toast.error("Revisa los datos del formulario");
        }
      } else if (esTiendaCerrada(error)) {
        // La tienda ha cerrado mientras el cliente rellenaba el pedido. El
        // interceptor ya activa la pantalla de mantenimiento; el carrito se
        // conserva en localStorage para cuando vuelva a abrir.
        toast.info(datosCierre(error).titulo);
      } else {
        toast.error(
          error.response?.data?.message ?? "No se pudo realizar el pedido",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="section-padding checkout-pagina">
      <div className="container" style={{ maxWidth: 1080 }}>

        <form onSubmit={handleSubmit} noValidate>
          <div className="row g-4">
            {/* ── COLUMNA IZQUIERDA: formulario ────────────────────────── */}
            <div className="col-lg-7">
              {/* Tipo de entrega */}
              <div className="cp-seccion mb-3">
                <CabeceraPaso numero={1} icono={esRecogida ? "bi-shop" : "bi-scooter"} titulo="¿Cómo quieres recibir tu pedido?" />
                <AvisoEntrega className="mb-3" />
                <RadioCard
                  id="entrega_domicilio"
                  name="tipo_entrega"
                  value="domicilio"
                  checked={form.tipo_entrega === "domicilio"}
                  onChange={handleChange}
                  disabled={metodosCargados && !hayDomicilio}
                  icon="bi-scooter"
                  label="Envío a domicilio"
                  sublabel={
                    metodosCargados && !hayDomicilio
                      ? "No disponible en este momento"
                      : textoMetodos("Te lo llevamos a casa", metodosDomicilio)
                  }
                />
                <RadioCard
                  id="entrega_recogida"
                  name="tipo_entrega"
                  value="recogida"
                  checked={form.tipo_entrega === "recogida"}
                  onChange={handleChange}
                  disabled={metodosCargados && !hayRecogida}
                  icon="bi-shop"
                  label="Recoger en tienda"
                  sublabel={
                    metodosCargados && !hayRecogida
                      ? "No disponible en este momento"
                      : textoMetodos("Gratis — sin gastos de envío", metodosRecogida)
                  }
                />
              </div>

              {/* Datos personales */}
              <div className="cp-seccion mb-3">
                <CabeceraPaso numero={2} icono="bi-person-fill" titulo={esRecogida ? "Tus datos" : "Datos de entrega"} />

                <div className="row g-3">
                  <div className="col-md-6">
                    <Campo
                      label="Nombre completo"
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      errores={errores}
                      required
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div className="col-md-6">
                    <Campo
                      label="Teléfono"
                      name="telefono"
                      type="tel"
                      value={form.telefono}
                      onChange={handleChange}
                      errores={errores}
                      required
                      placeholder="600 000 000"
                    />
                  </div>
                </div>

                {!esRecogida && (
                  <>
                    <Campo
                      label="Dirección"
                      name="direccion"
                      value={form.direccion}
                      onChange={handleChange}
                      errores={errores}
                      required
                      placeholder="Calle y número"
                    />

                    <div className="row g-3">
                      <div className="col-md-6">
                        <Campo
                          label="Bloque / Escalera / Portal"
                          name="bloque"
                          value={form.bloque}
                          onChange={handleChange}
                          errores={errores}
                          placeholder="Bloque B, Escalera 2…"
                        />
                      </div>
                      <div className="col-md-6">
                        <Campo
                          label="Piso / Puerta"
                          name="piso"
                          value={form.piso}
                          onChange={handleChange}
                          errores={errores}
                          placeholder="3º A, 1º Izq…"
                        />
                      </div>
                    </div>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <Campo
                          label="Código postal"
                          name="codigo_postal"
                          value={form.codigo_postal}
                          onChange={handleChange}
                          errores={errores}
                          required
                          placeholder="18001"
                        />
                      </div>

                      <div className="col-md-6">
                        {barriosDisponibles.length > 0 && (
                          <Campo
                            label="Barrio"
                            name="barrio"
                            errores={errores}
                            required
                          >
                            <select
                              id="field-barrio"
                              name="barrio"
                              className={`form-control rounded-3${errores?.["cliente.barrio"] || errores?.["barrio"] ? " is-invalid" : ""}`}
                              value={form.barrio}
                              onChange={handleChange}
                            >
                              <option value="">— Selecciona tu barrio —</option>
                              {barriosDisponibles.map((z) => (
                                <option key={z.barrio} value={z.barrio}>
                                  {z.barrio} ({formatEUR(z.recargo)} envío
                                  {Number(z.pedido_minimo) > 0
                                    ? ` · mín. ${formatEUR(z.pedido_minimo)}`
                                    : ""}
                                  )
                                </option>
                              ))}
                            </select>
                          </Campo>
                        )}
                      </div>
                    </div>

                    {cpSinCobertura && (
                      <div className="alert alert-danger rounded-3 py-2 small mt-2">
                        <i className="bi bi-exclamation-circle me-2" />
                        No realizamos envíos a ese código postal.
                      </div>
                    )}
                  </>
                )}

                <Campo
                  label="Observaciones"
                  name="observaciones"
                  as="textarea"
                  value={form.observaciones}
                  onChange={handleChange}
                  errores={errores}
                  placeholder="Instrucciones especiales, alergias, timbre…"
                />
              </div>

              {/* Método de pago */}
              <div className="cp-seccion">
                <CabeceraPaso numero={3} icono="bi-wallet2" titulo="Método de pago" />
                {metodosPago
                  .filter((m) =>
                    esRecogida ? m.activo_recogida : m.activo_domicilio,
                  )
                  .map((m) => (
                    <RadioCard
                      key={m.clave}
                      id={`pago_${m.clave}`}
                      name="metodo_pago"
                      value={m.clave}
                      checked={form.metodo_pago === m.clave}
                      onChange={handleChange}
                      icon={iconoMetodoPago(m.clave)}
                      label={m.nombre}
                      sublabel={
                        esRecogida
                          ? "Paga al recoger"
                          : "Paga al recibir"
                      }
                    />
                  ))}
                {metodosPago.filter((m) =>
                  esRecogida ? m.activo_recogida : m.activo_domicilio,
                ).length === 0 && (
                  <div className="alert alert-warning rounded-3 py-2 small">
                    <i className="bi bi-exclamation-circle me-2" />
                    No hay métodos de pago disponibles para este tipo de entrega.
                  </div>
                )}
                {errores["metodo_pago"] && (
                  <div className="text-danger small mt-1">
                    {errores["metodo_pago"][0]}
                  </div>
                )}
              </div>

              {/* Hora de entrega/recogida */}
              <div className="cp-seccion mt-3">
                <CabeceraPaso numero={4} icono="bi-clock-fill" titulo={esRecogida ? "¿Cuándo pasas a recogerlo?" : "¿Cuándo lo quieres recibir?"} />

                {tiendaCerradaPorHorario && (
                  <div
                    className="rounded-3 p-3 mb-3 d-flex align-items-start gap-2"
                    style={{
                      background: "#fef3c7",
                      border: "1px solid #fde68a",
                      fontSize: "0.9rem",
                    }}
                  >
                    <i
                      className="bi bi-clock-history mt-1"
                      style={{ color: "#d97706", fontSize: "1.1rem" }}
                    />
                    <div>
                      <div
                        className="fw-bold mb-1"
                        style={{ color: "#92400e" }}
                      >
                        Estamos fuera del horario de servicio
                      </div>
                      <div style={{ color: "#92400e" }}>
                        {estadoApertura?.proxima_apertura
                          ? `Abrimos hoy a las ${estadoApertura.proxima_apertura}. `
                          : "No abrimos más por hoy. "}
                        Programa tu pedido para una hora dentro del horario.
                      </div>
                    </div>
                  </div>
                )}

                <RadioCard
                  id="hora_asap"
                  name="modo_hora"
                  value="asap"
                  checked={modoHora === "asap"}
                  onChange={() => {
                    if (tiendaCerradaPorHorario) return;
                    setModoHora("asap");
                    setHoraDeseada("");
                  }}
                  icon="bi-lightning-charge-fill"
                  label="Lo antes posible"
                  sublabel={
                    tiendaCerradaPorHorario
                      ? "No disponible fuera de horario"
                      : "En cuanto esté listo"
                  }
                  disabled={tiendaCerradaPorHorario}
                />
                <RadioCard
                  id="hora_programar"
                  name="modo_hora"
                  value="programar"
                  checked={modoHora === "programar"}
                  onChange={() => setModoHora("programar")}
                  icon="bi-clock"
                  label="Programar hora"
                  sublabel="Elige la hora que prefieras"
                />

                {modoHora === "programar" && (
                  <div className="mt-3">
                    {slots.length === 0 ? (
                      <div className="alert alert-warning rounded-3 py-2 small">
                        <i className="bi bi-exclamation-circle me-2" />
                        No hay horarios disponibles para hoy.
                      </div>
                    ) : (
                      <>
                        <label className="form-label checkout-label">
                          Hora deseada
                        </label>
                        <select
                          id="field-hora_deseada"
                          className={`form-control rounded-3${errores?.hora_deseada ? " is-invalid" : ""}`}
                          value={horaDeseada}
                          onChange={(e) => setHoraDeseada(e.target.value)}
                        >
                          <option value="">— Selecciona una hora —</option>
                          {slots.map((slot) => (
                            <option key={slot} value={slot}>
                              {slot}
                            </option>
                          ))}
                        </select>
                        {errores?.hora_deseada && (
                          <div className="invalid-feedback d-block">
                            {errores.hora_deseada[0]}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ── COLUMNA DERECHA: resumen ──────────────────────────────── */}
            <div className="col-lg-5">
              <div className="cp-seccion p-0 overflow-hidden checkout-resumen">
                {/* Header resumen */}
                <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
                  <h3 className="cp-seccion-titulo d-flex align-items-center gap-2 mb-0">
                    <span className="cp-seccion-icono">
                      <i className="bi bi-receipt" />
                    </span>
                    Tu pedido
                  </h3>
                  <span className="badge rounded-pill px-3 py-2 bg-danger bg-opacity-10 text-danger">
                    {carrito.reduce((a, i) => a + (i.cantidad || 0), 0)} art.
                  </span>
                </div>

                {/* Items */}
                <div
                  className="p-3 d-flex flex-column gap-2"
                  style={{ maxHeight: 320, overflowY: "auto" }}
                >
                  {carrito.map((item, i) => (
                    <ResumenItem key={item.uid ?? i} item={item} />
                  ))}
                </div>

                {/* Totales */}
                <div className="p-4 border-top">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted small">Subtotal</span>
                    <span className="fw-semibold">{formatEUR(subtotal)}</span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted small">Envío</span>
                    <span className="fw-semibold">
                      {esRecogida ? (
                        <span className="text-success small">Gratis</span>
                      ) : !form.codigo_postal.trim() ? (
                        <span className="text-muted small">
                          Introduce tu CP
                        </span>
                      ) : cpSinCobertura ? (
                        <span className="text-danger small">No disponible</span>
                      ) : !form.barrio ? (
                        <span className="text-muted small">
                          Elige tu barrio
                        </span>
                      ) : zonaSeleccionada ? (
                        formatEUR(gastosEnvio)
                      ) : (
                        "—"
                      )}
                    </span>
                  </div>

                  <hr className="my-2" />

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="fw-bold">Total estimado</span>
                    <span className="fw-bold fs-5 color-secundario">
                      {totalEstimado !== null ? formatEUR(totalEstimado) : "—"}
                    </span>
                  </div>

                  {pedidoMinimoNoAlcanzado && (
                    <div className="alert alert-warning rounded-3 py-2 small mb-3 d-flex align-items-start gap-2">
                      <i className="bi bi-exclamation-triangle-fill mt-1" />
                      <div>
                        <strong>Pedido mínimo para esta zona: {formatEUR(zonaSeleccionada.pedido_minimo)} (envío incluido)</strong>
                        <br />
                        Te faltan{" "}
                        <strong>
                          {formatEUR(Number(zonaSeleccionada.pedido_minimo) - totalParaMinimo)}
                        </strong>{" "}
                        para poder realizar el pedido.
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="cp-anadir w-100"
                    disabled={submitBloqueado}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Procesando…
                      </>
                    ) : loadingZonas ? (
                      "Cargando…"
                    ) : errorZonas ? (
                      "Servicio no disponible"
                    ) : entregaNoDisponible ? (
                      "Opción de entrega no disponible"
                    ) : (
                      "Confirmar pedido →"
                    )}
                  </button>

                  <Link
                    to="/shop/cart"
                    className="btn w-100 rounded-pill py-2 mt-2 small"
                    style={{
                      color: "#6c757d",
                      backgroundColor: "transparent",
                      border: "1px solid #dee2e6",
                    }}
                  >
                    ← Volver al carrito
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
