import { useState, useEffect, useCallback } from "react";
import SelectorMitad from "./SelectorMitad";

const ROJO = "#eb0029";
const formatEUR = (v) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(
    Number(v) || 0,
  );
const NARANJA = "#fc791a";

/**
 * Builder para pizza por mitades.
 *
 * Props:
 *   tamanoId     — id numérico del tamaño
 *   tamanoNombre — nombre del tamaño (para display)
 *   onChange     — callback({ mitadA, mitadB }) | ({ mitadA: null, mitadB: null })
 *
 * Diseño: resumen visual (pizza partida + estado de cada mitad) y pestañas
 * para editar una mitad cada vez. Las dos mitades siguen montadas (la otra
 * solo se oculta) para no perder lo elegido al cambiar de pestaña.
 */
export default function PizzaMitadBuilder({ tamanoId, tamanoNombre, onChange }) {
  const [mitadA, setMitadA] = useState(null);
  const [mitadB, setMitadB] = useState(null);
  const [activa, setActiva] = useState("A");

  /* Reset cuando cambia el tamaño */
  useEffect(() => {
    setMitadA(null);
    setMitadB(null);
    setActiva("A");
  }, [tamanoId]);

  /* Emitir cambios al modal */
  useEffect(() => {
    if (!mitadA || !mitadB) {
      onChange({ mitadA: null, mitadB: null });
      return;
    }
    onChange({ mitadA, mitadB });
  }, [mitadA, mitadB, onChange]);

  const handleMitadAChange = useCallback((data) => {
    if (data === null) {
      setMitadA(null);
      return;
    }
    setMitadA({
      articuloId: data.articuloId,
      tipoProductoId: data.tipoProductoId,
      nombre: data.nombre,
      precioBase: data.precioBase ?? 0,
      precioExtras: data.precioExtras ?? 0,
      ingredientesExtras: data.ingredientesExtras ?? [],
      ingredientesQuitados: data.ingredientesQuitados ?? [],
    });
  }, []);

  const handleMitadBChange = useCallback((data) => {
    if (data === null) {
      setMitadB(null);
      return;
    }
    setMitadB({
      articuloId: data.articuloId,
      tipoProductoId: data.tipoProductoId,
      nombre: data.nombre,
      precioBase: data.precioBase ?? 0,
      precioExtras: data.precioExtras ?? 0,
      ingredientesExtras: data.ingredientesExtras ?? [],
      ingredientesQuitados: data.ingredientesQuitados ?? [],
    });
  }, []);

  const mitades = [
    { id: "A", numero: 1, datos: mitadA },
    { id: "B", numero: 2, datos: mitadB },
  ];

  return (
    <div className="d-flex flex-column gap-3">
      {/* ── RESUMEN VISUAL ───────────────────────────── */}
      <div className="mitades-resumen rounded-4 p-3 p-sm-4 d-flex flex-column flex-sm-row align-items-center gap-4">
        <PizzaPartida mitadA={mitadA} mitadB={mitadB} activa={activa} onElegir={setActiva} />

        <div className="flex-grow-1 w-100 d-flex flex-column gap-2">
          {mitades.map((m) => (
            <ResumenMitad
              key={m.id}
              numero={m.numero}
              datos={m.datos}
              activa={activa === m.id}
              onClick={() => setActiva(m.id)}
            />
          ))}
        </div>
      </div>

      {/* ── PESTAÑAS ─────────────────────────────────── */}
      <div className="mitades-pestanas d-flex gap-2" role="tablist">
        {mitades.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={activa === m.id}
            className={`mitades-pestana flex-fill ${activa === m.id ? "activa" : ""}`}
            onClick={() => setActiva(m.id)}
          >
            <span className="numero">{m.numero}</span>
            Mitad {m.numero}
            {m.datos && <i className="bi bi-check-circle-fill ms-1 hecho" />}
          </button>
        ))}
      </div>

      {/* ── EDITOR DE CADA MITAD (ambos montados, uno visible) ── */}
      <div className={activa === "A" ? "" : "d-none"} role="tabpanel">
        <SelectorMitad
          tamanoId={tamanoId}
          tamanoNombre={tamanoNombre}
          onChange={handleMitadAChange}
        />
        {mitadA && !mitadB && (
          <div className="text-end">
            <button
              type="button"
              className="btn rounded-pill px-4 py-2 fw-semibold text-white mitades-continuar"
              onClick={() => setActiva("B")}
            >
              Continuar con la mitad 2
              <i className="bi bi-arrow-right ms-2" />
            </button>
          </div>
        )}
      </div>

      <div className={activa === "B" ? "" : "d-none"} role="tabpanel">
        <SelectorMitad
          tamanoId={tamanoId}
          tamanoNombre={tamanoNombre}
          onChange={handleMitadBChange}
        />
      </div>

      <style>{`
        .mitades-resumen {
          background: linear-gradient(135deg, #fff5f5 0%, #fff8ef 100%);
          border: 1px solid rgba(235, 0, 41, 0.12);
        }

        .mitades-pestana {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.7rem 1rem;
          border-radius: 999px;
          border: 1px solid #dee2e6;
          background: #fff;
          color: #495057;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        .mitades-pestana .numero {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #e9ecef;
          color: #495057;
          font-size: 0.8rem;
        }
        .mitades-pestana.activa {
          background: ${ROJO};
          border-color: ${ROJO};
          color: #fff;
          box-shadow: 0 6px 18px rgba(235, 0, 41, 0.25);
        }
        .mitades-pestana.activa .numero { background: #fff; color: ${ROJO}; }
        .mitades-pestana .hecho { color: #198754; }
        .mitades-pestana.activa .hecho { color: #fff; }

        .mitades-resumen-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          text-align: left;
          padding: 0.65rem 0.85rem;
          border-radius: 14px;
          border: 1px solid transparent;
          background: #fff;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .mitades-resumen-item:hover { border-color: rgba(235, 0, 41, 0.3); }
        .mitades-resumen-item.activa {
          border-color: ${ROJO};
          box-shadow: 0 4px 14px rgba(235, 0, 41, 0.12);
        }

        .mitades-continuar { background: ${ROJO}; }
        .mitades-continuar:hover { background: #c80023; color: #fff; }
      `}</style>
    </div>
  );
}

/* ── Pizza dibujada en dos mitades (SVG) ─────────────── */
function PizzaPartida({ mitadA, mitadB, activa, onElegir }) {
  const colorMitad = (datos, id) => {
    if (datos) return id === "A" ? ROJO : NARANJA;
    return activa === id ? "#ffd6dc" : "#f1f3f5";
  };

  return (
    <svg
      viewBox="0 0 120 120"
      width="120"
      height="120"
      className="flex-shrink-0"
      role="img"
      aria-label="Pizza dividida en dos mitades"
    >
      {/* Mitad 1 (izquierda) */}
      <path
        d="M60 6 A54 54 0 0 0 60 114 Z"
        fill={colorMitad(mitadA, "A")}
        stroke="#fff"
        strokeWidth="3"
        style={{ cursor: "pointer", transition: "fill 0.25s ease" }}
        onClick={() => onElegir("A")}
      />
      {/* Mitad 2 (derecha) */}
      <path
        d="M60 6 A54 54 0 0 1 60 114 Z"
        fill={colorMitad(mitadB, "B")}
        stroke="#fff"
        strokeWidth="3"
        style={{ cursor: "pointer", transition: "fill 0.25s ease" }}
        onClick={() => onElegir("B")}
      />
      {/* Borde de masa */}
      <circle cx="60" cy="60" r="56" fill="none" stroke="#e8b06a" strokeWidth="4" />
      <text x="36" y="66" textAnchor="middle" fontSize="18" fontWeight="700"
        fill={mitadA ? "#fff" : "#868e96"} style={{ pointerEvents: "none" }}>1</text>
      <text x="84" y="66" textAnchor="middle" fontSize="18" fontWeight="700"
        fill={mitadB ? "#fff" : "#868e96"} style={{ pointerEvents: "none" }}>2</text>
    </svg>
  );
}

/* ── Fila de resumen de una mitad ────────────────────── */
function ResumenMitad({ numero, datos, activa, onClick }) {
  const extras = datos?.ingredientesExtras?.length ?? 0;
  const quitados = datos?.ingredientesQuitados?.length ?? 0;
  const color = numero === 1 ? ROJO : NARANJA;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`mitades-resumen-item ${activa ? "activa" : ""}`}
    >
      <span
        className="d-inline-flex align-items-center justify-content-center rounded-circle fw-bold flex-shrink-0"
        style={{
          width: 30,
          height: 30,
          background: datos ? color : "#e9ecef",
          color: datos ? "#fff" : "#868e96",
          fontSize: "0.85rem",
        }}
      >
        {datos ? <i className="bi bi-check-lg" /> : numero}
      </span>

      <span className="d-flex flex-column" style={{ minWidth: 0 }}>
        <span className="small text-muted">Mitad {numero}</span>
        {datos ? (
          <span className="fw-semibold text-dark text-truncate">
            {datos.nombre || "Personalizada"}
          </span>
        ) : (
          <span className="fw-semibold" style={{ color: ROJO }}>
            Sin elegir · toca para elegir
          </span>
        )}
        {datos && (extras > 0 || quitados > 0) && (
          <span className="small text-muted">
            {extras > 0 && `+${extras} extra${extras > 1 ? "s" : ""}`}
            {extras > 0 && quitados > 0 && " · "}
            {quitados > 0 && `sin ${quitados} ingrediente${quitados > 1 ? "s" : ""}`}
          </span>
        )}
      </span>

      {datos && (
        <span className="ms-auto fw-bold flex-shrink-0" style={{ color: ROJO }}>
          {formatEUR(Number(datos.precioBase || 0) + Number(datos.precioExtras || 0))}
        </span>
      )}
      <i className={`bi ${datos ? "ms-2" : "ms-auto"} ${activa ? "bi-pencil-fill" : "bi-chevron-right"} text-muted`} />
    </button>
  );
}
