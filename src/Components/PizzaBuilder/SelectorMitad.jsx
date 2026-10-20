import { useState, useCallback } from "react";
import PizzaEnteraBuilder from "./PizzaEnteraBuilder";
import PizzaExistenteSelector from "./PizzaExistenteSelector";

/**
 * Selector de una mitad de pizza.
 * Permite elegir entre pizza existente del menú o crear una personalizada.
 *
 * Props:
 *   tamanoId     — id numérico del tamaño
 *   tamanoNombre — nombre del tamaño (para display)
 *   onChange     — callback con estructura unificada de mitad
 */
export default function SelectorMitad({ tamanoId, tamanoNombre, onChange }) {
  const [modo, setModo] = useState("existente");

  /* ── Normalizar datos antes de emitir ──────────── */
  const emitir = useCallback(
    (origen, data) => {
      onChange({
        modo: origen,
        articuloId: data.articuloId,
        tipoProductoId: data.tipoProductoId,
        nombre: data.nombre,
        tamanoId: data.tamanoId ?? tamanoId,
        tamano: data.tamano ?? tamanoNombre,
        precioBase: data.precioBase ?? 0,
        precioExtras: data.precioExtras ?? 0,
        precioTotal:
          data.precioTotal ??
          (data.precioBase ?? 0) + (data.precioExtras ?? 0),
        ingredientesExtras: data.ingredientesExtras ?? [],
        ingredientesQuitados: data.ingredientesQuitados ?? [],
      });
    },
    [onChange, tamanoId, tamanoNombre]
  );

  const handlePersonalizadaChange = useCallback(
    (data) => emitir("personalizada", data),
    [emitir]
  );

  const handleExistenteChange = useCallback(
    (data) => {
      if (data === null) {
        onChange(null);
        return;
      }
      emitir("existente", data);
    },
    [emitir, onChange]
  );

  return (
    <div className="mb-3">
      {/* Selector modo */}
      <h4 className="cp-subtitulo">
        <i className="bi bi-question-circle-fill" style={{ color: "#fc791a" }} />
        ¿Cómo quieres esta mitad?
      </h4>
      <div className="row g-2 mb-3">
        <div className="col-6">
          <ModoCard
            activo={modo === "existente"}
            onClick={() => setModo("existente")}
            icono="bi-card-list"
            titulo="Pizza de la carta"
            subtitulo="Elige una y ajústala"
          />
        </div>

        <div className="col-6">
          <ModoCard
            activo={modo === "personalizada"}
            onClick={() => setModo("personalizada")}
            icono="bi-sliders"
            titulo="Desde cero"
            subtitulo="Tú eliges cada ingrediente"
          />
        </div>
      </div>

      {/* Builder según modo */}
      {modo === "existente" ? (
        <PizzaExistenteSelector
          tamanoId={tamanoId}
          onSelect={handleExistenteChange}
        />
      ) : (
        <PizzaEnteraBuilder
          tamanoId={tamanoId}
          onChange={handlePersonalizadaChange}
        />
      )}
    </div>
  );
}

/* ── Sub-componente: ModoCard ────────────────────── */
function ModoCard({ activo, onClick, icono, titulo, subtitulo }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={`w-100 h-100 text-start px-3 py-2 rounded-4 border d-flex align-items-center gap-2 ${activo ? "shadow-sm" : ""}`}
      style={
        activo
          ? {
              borderColor: "#eb0029",
              backgroundColor: "rgba(235, 0, 41, 0.06)",
            }
          : { backgroundColor: "#fff" }
      }
    >
      <span
        className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
        style={{
          width: 32,
          height: 32,
          backgroundColor: activo ? "#eb0029" : "#f1f3f5",
          color: activo ? "#fff" : "#868e96",
        }}
      >
        <i className={`bi ${icono}`} />
      </span>
      <span className="d-flex flex-column" style={{ minWidth: 0 }}>
        <span className="fw-semibold lh-sm">{titulo}</span>
        <small className="text-muted lh-sm">{subtitulo}</small>
      </span>
    </button>
  );
}
