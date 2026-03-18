import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useCarrito } from "../../context/CarritoContext";
import clientesAxios from "../../config/axios";

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
    <div className="border rounded-4 p-3 shadow-sm bg-white">
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
        <label className="form-label fw-semibold small color-primario">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}

      {children ??
        (as === "textarea" ? (
          <textarea
            id={`field-${name}`}
            name={name}
            className={`form-control rounded-3${error ? " is-invalid" : ""}`}
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
            className={`form-control rounded-3${error ? " is-invalid" : ""}`}
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

function RadioCard({
  id,
  name,
  value,
  checked,
  onChange,
  icon,
  label,
  sublabel,
}) {
  return (
    <label
      htmlFor={id}
      className={`d-flex align-items-center gap-3 p-3 rounded-4 border cursor-pointer mb-2 ${
        checked
          ? "border-danger bg-danger bg-opacity-10"
          : "border-light-subtle bg-white"
      }`}
      style={{ cursor: "pointer", transition: "all 0.2s ease" }}
    >
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="form-check-input mt-0 flex-shrink-0"
        style={{ accentColor: "#eb0029" }}
      />
      <span style={{ fontSize: "1.4rem" }}>{icon}</span>
      <div>
        <div className="fw-semibold color-primario">{label}</div>
        {sublabel && <div className="text-muted small">{sublabel}</div>}
      </div>
    </label>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PedidoConfirmado
// ─────────────────────────────────────────────────────────────────────────────

function PedidoConfirmado({ pedido }) {
  return (
    <div className="section-padding bg-white">
      <div className="container text-center py-5" style={{ maxWidth: 480 }}>
        <div
          className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
          style={{
            width: 80,
            height: 80,
            backgroundColor: "#eb002915",
            fontSize: "2.2rem",
          }}
        >
          ✓
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
        <p className="text-muted mb-4">
          {pedido.tipo_entrega === "recogida"
            ? "Pasa a recogerlo cuando esté listo."
            : "En breve comenzaremos a prepararlo."}
        </p>

        {/* Botón de tracking — nuevo */}
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
    codigo_postal: "",
    barrio: "",
    observaciones: "",
    metodo_pago: "efectivo",
    tipo_entrega: "domicilio",
  });

  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState({});
  const [pedidoCreado, setPedidoCreado] = useState(null);
  const [zonas, setZonas] = useState([]);
  const [loadingZonas, setLoadingZonas] = useState(true);
  const [errorZonas, setErrorZonas] = useState(false);

  useEffect(() => {
    setLoadingZonas(true);
    setErrorZonas(false);
    clientesAxios
      .get("/shop/zonas-envio")
      .then(({ data }) => setZonas(data))
      .catch(() => {
        setErrorZonas(true);
        toast.error("No se pudieron cargar las zonas de envío");
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

  const submitBloqueado =
    loading ||
    loadingZonas ||
    errorZonas ||
    carrito.length === 0 ||
    cpSinCobertura ||
    (!esRecogida && !zonaSeleccionada);

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

  if (pedidoCreado) return <PedidoConfirmado pedido={pedidoCreado} />;

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "codigo_postal") next.barrio = "";
      if (name === "tipo_entrega" && value === "recogida") {
        next.direccion = "";
        next.codigo_postal = "";
        next.barrio = "";
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
          codigo_postal: esRecogida ? null : form.codigo_postal,
          barrio: esRecogida ? null : form.barrio,
        },
        metodo_pago: form.metodo_pago,
        observaciones: form.observaciones || null,
        items: prepararPedido(),
      };

      const { data } = await clientesAxios.post("/shop/pedidos", payload);
      setPedidoCreado(data.pedido);
      vaciarCarrito();
      toast.success("¡Pedido realizado correctamente!");
    } catch (error) {
      if (error.response?.status === 422) {
        const serverErrors = error.response.data.errors ?? {};
        setErrores(serverErrors);
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
    <div className="section-padding bg-color2">
      <div className="container" style={{ maxWidth: 960 }}>
        <h2
          className="fw-bold color-primario mb-1"
          style={{ fontFamily: "var(--title-font)" }}
        >
          Finalizar pedido
        </h2>
        <p className="text-muted mb-4 small">
          Revisa tu pedido y completa los datos de entrega
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="row g-4">
            {/* ── COLUMNA IZQUIERDA: formulario ────────────────────────── */}
            <div className="col-lg-7">
              {/* Tipo de entrega */}
              <div className="border rounded-4 p-4 shadow-sm bg-white mb-4">
                <h5
                  className="fw-bold color-primario mb-3"
                  style={{ fontFamily: "var(--title-font)" }}
                >
                  ¿Cómo quieres recibir tu pedido?
                </h5>
                <RadioCard
                  id="entrega_domicilio"
                  name="tipo_entrega"
                  value="domicilio"
                  checked={form.tipo_entrega === "domicilio"}
                  onChange={handleChange}
                  icon="🛵"
                  label="Envío a domicilio"
                  sublabel="Te lo llevamos a casa"
                />
                <RadioCard
                  id="entrega_recogida"
                  name="tipo_entrega"
                  value="recogida"
                  checked={form.tipo_entrega === "recogida"}
                  onChange={handleChange}
                  icon="🏪"
                  label="Recoger en tienda"
                  sublabel="Gratis — sin gastos de envío"
                />
              </div>

              {/* Datos personales */}
              <div className="border rounded-4 p-4 shadow-sm bg-white mb-4">
                <h5
                  className="fw-bold color-primario mb-3"
                  style={{ fontFamily: "var(--title-font)" }}
                >
                  {esRecogida ? "Tus datos" : "Datos de entrega"}
                </h5>

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
                      placeholder="Calle, número, piso…"
                    />

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
                                  {z.barrio} ({formatEUR(z.recargo)} envío)
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
              <div className="border rounded-4 p-4 shadow-sm bg-white">
                <h5
                  className="fw-bold color-primario mb-3"
                  style={{ fontFamily: "var(--title-font)" }}
                >
                  Método de pago
                </h5>
                <RadioCard
                  id="pago_efectivo"
                  name="metodo_pago"
                  value="efectivo"
                  checked={form.metodo_pago === "efectivo"}
                  onChange={handleChange}
                  icon="💵"
                  label="Efectivo"
                  sublabel="Paga al recibir o recoger"
                />
                <RadioCard
                  id="pago_tarjeta"
                  name="metodo_pago"
                  value="tarjeta"
                  checked={form.metodo_pago === "tarjeta"}
                  onChange={handleChange}
                  icon="💳"
                  label="Tarjeta"
                  sublabel="Paga con tarjeta al recibir o recoger"
                />
                <RadioCard
                  id="pago_transferencia"
                  name="metodo_pago"
                  value="transferencia"
                  checked={form.metodo_pago === "transferencia"}
                  onChange={handleChange}
                  icon="🏦"
                  label="Transferencia bancaria"
                  sublabel="Te indicamos los datos al confirmar"
                />
                {errores["metodo_pago"] && (
                  <div className="text-danger small mt-1">
                    {errores["metodo_pago"][0]}
                  </div>
                )}
              </div>
            </div>

            {/* ── COLUMNA DERECHA: resumen ──────────────────────────────── */}
            <div className="col-lg-5">
              <div
                className="border rounded-4 shadow-sm bg-white"
                style={{ position: "sticky", top: "100px" }}
              >
                {/* Header resumen */}
                <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
                  <h5
                    className="fw-bold color-primario mb-0"
                    style={{ fontFamily: "var(--title-font)" }}
                  >
                    Tu pedido
                  </h5>
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

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <span className="fw-bold">Total estimado</span>
                    <span className="fw-bold fs-5 color-secundario">
                      {totalEstimado !== null ? formatEUR(totalEstimado) : "—"}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="btn w-100 rounded-pill py-3 fw-bold text-white"
                    disabled={submitBloqueado}
                    style={{
                      backgroundColor: submitBloqueado ? "#adb5bd" : "#eb0029",
                      border: "none",
                      fontSize: "1rem",
                      transition: "background-color 0.2s ease",
                    }}
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
