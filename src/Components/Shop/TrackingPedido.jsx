import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import clientesAxios from "../../config/axios";
import { iniciarPagoRedsys } from "../../utils/pagoRedsys";

// ─────────────────────────────────────────────────────────────────────────────
// Configuración de estados
// ─────────────────────────────────────────────────────────────────────────────

const PASOS = [
  {
    estado: "pendiente",
    label: "Recibido",
    icono: "✓",
    desc: "Hemos recibido tu pedido",
  },
  {
    estado: "aceptado",
    label: "Aceptado",
    icono: "👍",
    desc: "Tu pedido ha sido aceptado",
  },
  {
    estado: "en_preparacion",
    label: "Preparando",
    icono: "🍕",
    desc: "Estamos preparando tu pedido",
  },
  {
    estado: "listo",
    label: "Listo",
    icono: "✅",
    desc: "Tu pedido está listo",
  },
  {
    estado: "en_camino",
    label: "En camino",
    icono: "🛵",
    desc: "Tu pedido está en camino",
  },
  {
    estado: "entregado",
    label: "Entregado",
    icono: "🎉",
    desc: "¡Pedido entregado! Buen provecho",
  },
];

const ESTADO_RECOGIDA = [
  {
    estado: "pendiente",
    label: "Recibido",
    icono: "✓",
    desc: "Hemos recibido tu pedido",
  },
  {
    estado: "aceptado",
    label: "Aceptado",
    icono: "👍",
    desc: "Tu pedido ha sido aceptado",
  },
  {
    estado: "en_preparacion",
    label: "Preparando",
    icono: "🍕",
    desc: "Estamos preparando tu pedido",
  },
  {
    estado: "listo",
    label: "Listo",
    icono: "✅",
    desc: "¡Tu pedido está listo para recoger!",
  },
];

const CANCELADO = {
  estado: "cancelado",
  label: "Cancelado",
  icono: "✗",
  desc: "Este pedido ha sido cancelado",
};

function getPasoActual(estado, tipoEntrega) {
  if (estado === "cancelado") return -1;
  const pasos = tipoEntrega === "recogida" ? ESTADO_RECOGIDA : PASOS;
  return pasos.findIndex((p) => p.estado === estado);
}

// ─────────────────────────────────────────────────────────────────────────────
// Barra de progreso visual
// ─────────────────────────────────────────────────────────────────────────────

function BarraProgreso({ estado, tipoEntrega }) {
  const cancelado = estado === "cancelado";
  const pasos = tipoEntrega === "recogida" ? ESTADO_RECOGIDA : PASOS;
  const pasoActual = getPasoActual(estado, tipoEntrega);

  if (cancelado) {
    return (
      <div
        className="d-flex flex-column align-items-center justify-content-center py-4 rounded-4 mb-4"
        style={{ background: "#fff5f5", border: "1px solid #fecaca" }}
      >
        <div
          className="d-flex align-items-center justify-content-center rounded-circle mb-3"
          style={{
            width: 64,
            height: 64,
            background: "#fecaca",
            fontSize: "1.8rem",
          }}
        >
          ✗
        </div>
        <p className="fw-bold mb-1" style={{ color: "#dc2626" }}>
          Pedido cancelado
        </p>
        <p className="text-muted small mb-0">{CANCELADO.desc}</p>
      </div>
    );
  }

  return (
    <div className="mb-4">
      {/* Descripción del estado actual */}
      <div
        className="d-flex align-items-center gap-3 p-3 rounded-4 mb-4"
        style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}
      >
        <div
          className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
          style={{
            width: 48,
            height: 48,
            background: "#eb0029",
            fontSize: "1.4rem",
          }}
        >
          {pasos[pasoActual]?.icono ?? "⏳"}
        </div>
        <div>
          <div className="fw-bold" style={{ color: "#eb0029" }}>
            {pasos[pasoActual]?.label ?? estado}
          </div>
          <div className="text-muted small">
            {pasos[pasoActual]?.desc ?? "Procesando tu pedido..."}
          </div>
        </div>
      </div>

      {/* Pasos */}
      <div className="position-relative">
        {/* Línea de fondo */}
        <div
          className="position-absolute"
          style={{
            top: 20,
            left: "calc(10% + 20px)",
            right: "calc(10% + 20px)",
            height: 3,
            background: "#e2e8f0",
            zIndex: 0,
          }}
        />
        {/* Línea de progreso */}
        <div
          className="position-absolute transition"
          style={{
            top: 20,
            left: "calc(10% + 20px)",
            width:
              pasoActual > 0
                ? `calc(${(pasoActual / (pasos.length - 1)) * 80}% - 20px)`
                : "0%",
            height: 3,
            background: "#eb0029",
            zIndex: 1,
            transition: "width 0.6s ease",
          }}
        />

        {/* Círculos */}
        <div
          className="d-flex justify-content-between position-relative"
          style={{ zIndex: 2 }}
        >
          {pasos.map((paso, idx) => {
            const completado = idx <= pasoActual;
            const actual = idx === pasoActual;
            return (
              <div
                key={paso.estado}
                className="d-flex flex-column align-items-center"
                style={{ width: `${100 / pasos.length}%` }}
              >
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle mb-2"
                  style={{
                    width: 40,
                    height: 40,
                    background: completado ? "#eb0029" : "#e2e8f0",
                    fontSize: "1rem",
                    border: actual
                      ? "3px solid #fc791a"
                      : "3px solid transparent",
                    boxShadow: actual ? "0 0 0 4px #eb002920" : "none",
                    transition: "all 0.3s ease",
                  }}
                >
                  {completado ? (
                    <span style={{ filter: "grayscale(0)" }}>{paso.icono}</span>
                  ) : (
                    <span style={{ opacity: 0.4, fontSize: "0.8rem" }}>
                      {idx + 1}
                    </span>
                  )}
                </div>
                <span
                  className="text-center"
                  style={{
                    fontSize: "10px",
                    fontWeight: actual ? 700 : 400,
                    color: completado ? "#eb0029" : "#94a3b8",
                    lineHeight: 1.2,
                  }}
                >
                  {paso.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Resumen del pedido
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Separa item.ingredientes[] (del backend) en extras, quitados,
 * y agrupa por mitad (A/B) si aplica.
 *
 * Estructura backend de cada ingrediente:
 *   { tipo: 'extra'|'quitado', mitad: 'A'|'B'|null, cantidad, precio,
 *     ingrediente: { id, nombre } }
 */
function parseIngredientes(ingredientes = []) {
  const extras = [];
  const quitados = [];
  const mitadA = { nombre: null, extras: [], quitados: [] };
  const mitadB = { nombre: null, extras: [], quitados: [] };
  let tieneMitades = false;

  ingredientes.forEach((ing) => {
    const nombre = ing.ingrediente?.nombre ?? `#${ing.ingrediente_id}`;
    const parsed = { nombre, cantidad: ing.cantidad ?? 1 };

    if (ing.mitad === "A" || ing.mitad === "B") {
      tieneMitades = true;
      const destino = ing.mitad === "A" ? mitadA : mitadB;
      if (ing.tipo === "extra") destino.extras.push(parsed);
      else destino.quitados.push(parsed);
    } else {
      if (ing.tipo === "extra") extras.push(parsed);
      else quitados.push(parsed);
    }
  });

  return { extras, quitados, mitadA, mitadB, tieneMitades };
}

function IngredientePills({ extras = [], quitados = [] }) {
  if (!extras.length && !quitados.length) return null;
  return (
    <div className="mt-1">
      {extras.map((e, i) => (
        <span
          key={`e${i}`}
          className="d-inline-flex align-items-center gap-1 rounded-pill px-2 py-0 me-1 mb-1 bg-success bg-opacity-10 text-success border border-success-subtle"
          style={{ fontSize: "0.7rem" }}
        >
          + {e.nombre}
          {e.cantidad > 1 && ` x${e.cantidad}`}
        </span>
      ))}
      {quitados.map((q, i) => (
        <span
          key={`q${i}`}
          className="d-inline-flex align-items-center gap-1 rounded-pill px-2 py-0 me-1 mb-1 bg-danger bg-opacity-10 text-danger border border-danger-subtle text-decoration-line-through"
          style={{ fontSize: "0.7rem" }}
        >
          {q.nombre}
        </span>
      ))}
    </div>
  );
}

function BloqMitad({ label, mitadNombre, mitadData }) {
  if (!mitadData.extras.length && !mitadData.quitados.length && !mitadNombre)
    return null;
  return (
    <div className="rounded-3 p-2 mt-1" style={{ background: "#f1f5f9" }}>
      <div className="d-flex align-items-center gap-2">
        <span
          className="d-inline-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
          style={{
            width: 18,
            height: 18,
            fontSize: "0.6rem",
            backgroundColor: "#eb0029",
          }}
        >
          {label}
        </span>
        <span className="fw-semibold" style={{ fontSize: "0.75rem" }}>
          {mitadNombre ?? "Personalizada"}
        </span>
      </div>
      <IngredientePills extras={mitadData.extras} quitados={mitadData.quitados} />
    </div>
  );
}

function ResumenPedido({ pedido }) {
  const eur = (n) => Number(n || 0).toFixed(2) + " €";

  return (
    <div
      className="rounded-4 p-3 mb-3"
      style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
    >
      <div
        className="fw-semibold small text-muted text-uppercase mb-2"
        style={{ letterSpacing: "0.05em" }}
      >
        Tu pedido
      </div>
      {(pedido.items ?? []).map((item) => {
        const { extras, quitados, mitadA, mitadB, tieneMitades } =
          parseIngredientes(item.ingredientes);

        // Nombres de mitades: campo directo o fallback parseando "NombreA / NombreB"
        let nombreMitadA = item.nombre_mitad_a;
        let nombreMitadB = item.nombre_mitad_b;
        if (tieneMitades && !nombreMitadA && !nombreMitadB && item.nombre?.includes(" / ")) {
          const partes = item.nombre.split(" / ");
          nombreMitadA = partes[0]?.trim();
          nombreMitadB = partes[1]?.trim();
        }

        return (
          <div
            key={item.id}
            className="py-2 border-bottom"
            style={{ borderColor: "#e2e8f0" }}
          >
            <div className="d-flex justify-content-between align-items-start">
              <div className="flex-grow-1">
                <span className="fw-semibold small">
                  {item.cantidad}× {tieneMitades ? "Pizza por mitades" : item.nombre}
                </span>
                {item.tamano && (
                  <span className="text-muted small ms-1">({item.tamano})</span>
                )}
              </div>
              <span className="small text-muted ms-2 flex-shrink-0">
                {eur(item.subtotal)}
              </span>
            </div>

            {/* Mitades con sus ingredientes */}
            {tieneMitades && (
              <>
                <BloqMitad label="1" mitadNombre={nombreMitadA} mitadData={mitadA} />
                <BloqMitad label="2" mitadNombre={nombreMitadB} mitadData={mitadB} />
              </>
            )}

            {/* Extras y quitados (artículos normales / sin mitad) */}
            {!tieneMitades && (
              <IngredientePills extras={extras} quitados={quitados} />
            )}
          </div>
        );
      })}
      <div className="d-flex justify-content-between pt-2">
        <span className="small text-muted">Subtotal</span>
        <span className="small">{eur(pedido.subtotal)}</span>
      </div>
      {Number(pedido.gastos_envio) > 0 && (
        <div className="d-flex justify-content-between">
          <span className="small text-muted">Envío</span>
          <span className="small">{eur(pedido.gastos_envio)}</span>
        </div>
      )}
      <div
        className="d-flex justify-content-between fw-bold mt-1 pt-1"
        style={{ borderTop: "1px solid #e2e8f0" }}
      >
        <span>Total</span>
        <span style={{ color: "#eb0029" }}>{eur(pedido.total)}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Banner de pago pendiente (cuando el pago con tarjeta no se completó)
// ─────────────────────────────────────────────────────────────────────────────

function BannerPagoPendiente({ pedido }) {
  const [procesando, setProcesando] = useState(false);

  // Solo se muestra si: método = tarjeta, estado_pago = pendiente|fallido,
  // el pedido no está cancelado y tampoco está ya entregado.
  const debeMostrar =
    pedido.metodo_pago === "tarjeta" &&
    ["pendiente", "fallido"].includes(pedido.estado_pago) &&
    !["cancelado", "entregado"].includes(pedido.estado);

  if (!debeMostrar) return null;

  const pagar = async () => {
    setProcesando(true);
    try {
      await iniciarPagoRedsys(pedido.codigo);
    } catch (e) {
      toast.error(
        e?.response?.data?.message ??
          "No se pudo iniciar el pago. Inténtalo de nuevo.",
      );
      setProcesando(false);
    }
  };

  const fallido = pedido.estado_pago === "fallido";

  return (
    <div
      className="rounded-4 p-3 mb-3 d-flex flex-column flex-sm-row align-items-sm-center gap-3"
      style={{
        background: fallido ? "#fee2e2" : "#fef3c7",
        border: `1px solid ${fallido ? "#fecaca" : "#fde68a"}`,
      }}
    >
      <div
        className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
        style={{
          width: 48,
          height: 48,
          background: fallido ? "#fecaca" : "#fde68a",
          fontSize: "1.4rem",
        }}
      >
        {fallido ? "✗" : "⏳"}
      </div>

      <div className="flex-grow-1">
        <div
          className="fw-bold small mb-1"
          style={{ color: fallido ? "#991b1b" : "#92400e" }}
        >
          {fallido ? "El pago no se completó" : "Pago pendiente"}
        </div>
        <div className="small" style={{ color: "#555" }}>
          {fallido
            ? "Hubo un problema al procesar el pago con tarjeta. Puedes volver a intentarlo."
            : "Tu pedido está reservado. Completa el pago para que empecemos a prepararlo."}
        </div>
      </div>

      <button
        type="button"
        onClick={pagar}
        disabled={procesando}
        className="btn rounded-pill px-4 py-2 text-white fw-semibold flex-shrink-0"
        style={{ backgroundColor: "#eb0029", border: "none" }}
      >
        {procesando ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" />
            Conectando…
          </>
        ) : (
          <>
            <i className="bi bi-credit-card-2-back me-2" />
            Pagar ahora
          </>
        )}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TrackingPedido — componente principal
// ─────────────────────────────────────────────────────────────────────────────

export default function TrackingPedido() {
  const { codigo: codigoParam } = useParams();
  const navigate = useNavigate();

  const [codigo, setCodigo] = useState(codigoParam ?? "");
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ultimaVez, setUltimaVez] = useState(null);

  // ── Buscar pedido ──────────────────────────────────────────────────────────
  const buscar = useCallback(async (codigoBuscar, silencioso = false) => {
    if (!codigoBuscar?.trim()) return;
    if (!silencioso) setLoading(true);
    setError(null);
    try {
      const { data } = await clientesAxios.get(
        `/shop/pedidos/${codigoBuscar.trim()}`,
      );
      setPedido(data);
      setUltimaVez(new Date());
    } catch (e) {
      if (e.response?.status === 404) {
        setError("No encontramos ningún pedido con ese código.");
      } else {
        setError("No se pudo conectar. Inténtalo de nuevo.");
      }
      if (!silencioso) setPedido(null);
    } finally {
      if (!silencioso) setLoading(false);
    }
  }, []);

  // Cargar al montar si viene código en la URL
  useEffect(() => {
    if (codigoParam) buscar(codigoParam);
  }, [codigoParam, buscar]);

  // Limpiar pedido activo de localStorage si terminó
  useEffect(() => {
    if (!pedido) return;
    const terminales = ["entregado", "cancelado"];
    if (terminales.includes(pedido.estado)) {
      const activos = JSON.parse(localStorage.getItem("pedidos_activos") || "[]");
      const nuevos = activos.filter((c) => c !== pedido.codigo);
      if (nuevos.length > 0) {
        localStorage.setItem("pedidos_activos", JSON.stringify(nuevos));
      } else {
        localStorage.removeItem("pedidos_activos");
      }
    }
  }, [pedido]);

  // Polling cada 20s si hay pedido activo
  useEffect(() => {
    const estadosTerminales = ["entregado", "cancelado"];
    if (!pedido || estadosTerminales.includes(pedido.estado)) return;

    const intervalo = setInterval(() => {
      buscar(pedido.codigo, true);
    }, 20000);

    return () => clearInterval(intervalo);
  }, [pedido, buscar]);

  // ── Submit del formulario de búsqueda ─────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!codigo.trim()) return;
    navigate(`/pedido/${codigo.trim().toUpperCase()}`);
    buscar(codigo.trim());
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="section-padding fix"
      style={{ background: "#f8fafc", minHeight: "70vh" }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            {/* Buscador (el título de la página lo pone PageHero) */}
            <div className="bg-white rounded-4 shadow-sm p-4 mb-4 border">
              <div className="text-center mb-3">
                <h2 className="fw-bold color-primario mb-1 fs-5" style={{ textTransform: "none" }}>
                  ¿Tienes tu código de pedido?
                </h2>
                <p className="text-muted small mb-0" style={{ lineHeight: 1.4 }}>
                  Lo encontrarás en la confirmación de tu pedido.
                </p>
              </div>

            {/* Formulario de búsqueda */}
            <form onSubmit={handleSubmit}>
              <div className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control rounded-pill px-4"
                  placeholder="Ej: PED-20260318-A3F7"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                  style={{ fontFamily: "monospace", letterSpacing: "1px" }}
                />
                <button
                  type="submit"
                  className="btn rounded-pill px-4 text-white fw-semibold flex-shrink-0"
                  style={{ backgroundColor: "#eb0029" }}
                  disabled={loading || !codigo.trim()}
                >
                  {loading ? (
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                    />
                  ) : (
                    "Buscar"
                  )}
                </button>
              </div>
            </form>
            </div>

            {/* Error */}
            {error && (
              <div
                className="alert alert-danger rounded-4 text-center py-3"
                role="alert"
              >
                <i className="bi bi-exclamation-circle me-2" />
                {error}
              </div>
            )}

            {/* Resultado */}
            {pedido && (
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                {/* Cabecera de la tarjeta */}
                <div
                  className="p-4"
                  style={{
                    background: "linear-gradient(135deg, #eb0029, #fc791a)",
                    color: "#fff",
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="small opacity-75 mb-1">
                        Código de pedido
                      </div>
                      <div
                        className="fw-bold fs-5"
                        style={{
                          fontFamily: "monospace",
                          letterSpacing: "2px",
                        }}
                      >
                        {pedido.codigo}
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="small opacity-75 mb-1">
                        {pedido.tipo_entrega === "recogida"
                          ? "⭐ Recogida"
                          : "🛵 Domicilio"}
                      </div>
                      {ultimaVez && (
                        <div
                          className="small opacity-60"
                          style={{ fontSize: "11px" }}
                        >
                          Act.{" "}
                          {ultimaVez.toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cuerpo */}
                <div className="card-body p-4">
                  {/* Banner de pago pendiente / fallido */}
                  <BannerPagoPendiente pedido={pedido} />

                  {/* Barra de progreso */}
                  <BarraProgreso
                    estado={pedido.estado}
                    tipoEntrega={pedido.tipo_entrega}
                  />

                  {/* Datos de entrega — solo domicilio */}
                  {pedido.tipo_entrega === "domicilio" && pedido.direccion && (
                    <div
                      className="d-flex align-items-start gap-2 mb-3 p-3 rounded-3"
                      style={{ background: "#f1f5f9" }}
                    >
                      <i
                        className="bi bi-geo-alt-fill mt-1"
                        style={{ color: "#eb0029" }}
                      />
                      <div>
                        <div className="small fw-semibold">
                          Dirección de entrega
                        </div>
                        <div className="small text-muted">
                          {pedido.direccion}, {pedido.codigo_postal}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Hora deseada */}
                  {pedido.hora_deseada && (
                    <div
                      className="d-flex align-items-start gap-2 mb-3 p-3 rounded-3"
                      style={{ background: "#ede9fe" }}
                    >
                      <i
                        className="bi bi-clock-fill mt-1"
                        style={{ color: "#7c3aed" }}
                      />
                      <div>
                        <div className="small fw-semibold">
                          Hora deseada
                        </div>
                        <div className="small text-muted">
                          {pedido.hora_deseada}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Resumen del pedido */}
                  <ResumenPedido pedido={pedido} />

                  {/* Footer */}
                  <div className="d-flex justify-content-between align-items-center pt-2">
                    <div className="small text-muted">
                      {pedido.estado !== "entregado" &&
                        pedido.estado !== "cancelado" && (
                          <span>
                            <i className="bi bi-arrow-repeat me-1" />
                            Se actualiza cada 20 segundos
                          </span>
                        )}
                    </div>
                    <Link
                      to="/"
                      className="btn btn-sm rounded-pill px-3"
                      style={{ border: "1px solid #eb0029", color: "#eb0029" }}
                    >
                      Volver al menú
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
