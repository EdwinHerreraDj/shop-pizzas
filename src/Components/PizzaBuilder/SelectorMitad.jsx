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
    <div className="mb-5">
      {/* Selector modo */}
      <div className="row g-2 mb-4">
        <div className="col-6">
          <ModoCard
            activo={modo === "existente"}
            onClick={() => setModo("existente")}
            icono="bi-card-list"
            titulo="Pizza existente"
            subtitulo="Elige una pizza del menú y personalízala"
          />
        </div>

        <div className="col-6">
          <ModoCard
            activo={modo === "personalizada"}
            onClick={() => setModo("personalizada")}
            icono="bi-sliders"
            titulo="Crear desde cero"
            subtitulo="Configura ingredientes uno a uno"
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
      className={`w-100 text-start p-3 rounded-4 border ${activo ? "shadow-sm" : ""}`}
      style={
        activo
          ? {
              borderColor: "#eb0029",
              backgroundColor: "rgba(235, 0, 41, 0.08)",
            }
          : { backgroundColor: "#fff" }
      }
    >
      <div className="d-flex align-items-center gap-2 mb-1">
        <span
          className="d-inline-flex align-items-center justify-content-center rounded-circle text-white"
          style={{
            width: 28,
            height: 28,
            backgroundColor: "#eb0029",
          }}
        >
          <i className={`bi ${icono}`} />
        </span>
        <span className="fw-semibold">{titulo}</span>
      </div>
      <small className="text-muted">{subtitulo}</small>
    </button>
  );
}
