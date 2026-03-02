import { useState, useCallback } from "react";
import PizzaEnteraBuilder from "./PizzaEnteraBuilder";
import PizzaExistenteSelector from "./PizzaExistenteSelector";

export default function SelectorMitad({ tamaño, onChange }) {
  const [modo, setModo] = useState("existente");

  // PERSONALIZADA DESDE CERO
  const handlePersonalizadaChange = useCallback(
    (data) => {
      // Soporta el builder nuevo (extras/quitados/productoId) y el viejo (ingredientesExtras/ingredientesQuitados)
      const extras = data?.extras ?? data?.ingredientesExtras ?? [];
      const quitados = data?.quitados ?? data?.ingredientesQuitados ?? [];

      onChange({
        modo: "personalizada",

        // IMPORTANTE: esto NO puede ser null si es una base editable
        articuloId: data?.productoId ?? 3,

        nombre: data?.nombre ?? "Personalizada",

        // Si tu builder no manda precioBase, aquí quedará 0 (mejorarlo luego)
        precioBase: data?.precioBase ?? 0,
        precioExtras: data?.precioExtras ?? 0,

        ingredientesExtras: extras,
        ingredientesQuitados: quitados,
      });
    },
    [onChange]
  );

  // PIZZA EXISTENTE
  const handleExistenteChange = useCallback(
    (data) => {
      // por si también migras el selector a extras/quitados
      const extras = data?.extras ?? data?.ingredientesExtras ?? [];
      const quitados = data?.quitados ?? data?.ingredientesQuitados ?? [];

      onChange({
        modo: "existente",
        articuloId: data.articuloId,
        nombre: data.nombre,

        precioBase: data.precioBase,
        precioExtras: data.precioExtras ?? 0,

        ingredientesExtras: extras,
        ingredientesQuitados: quitados,
      });
    },
    [onChange]
  );

  return (
    <div className="mb-5">
      <div className="row g-2 mb-4">
        {/* EXISTENTE */}
        <div className="col-6">
          <button
            type="button"
            onClick={() => setModo("existente")}
            className={`
              w-100 text-start p-3 rounded-4 border
              ${modo === "existente" ? "shadow-sm" : ""}
            `}
            style={
              modo === "existente"
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
                <i className="bi bi-card-list"></i>
              </span>

              <span className="fw-semibold">Pizza existente</span>
            </div>

            <small className="text-muted">
              Elige una pizza del menú y personalízala
            </small>
          </button>
        </div>

        {/* PERSONALIZADA */}
        <div className="col-6">
          <button
            type="button"
            onClick={() => setModo("personalizada")}
            className={`
              w-100 text-start p-3 rounded-4 border
              ${modo === "personalizada" ? "shadow-sm" : ""}
            `}
            style={
              modo === "personalizada"
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
                <i className="bi bi-sliders"></i>
              </span>

              <span className="fw-semibold">Crear desde cero</span>
            </div>

            <small className="text-muted">
              Configura ingredientes uno a uno
            </small>
          </button>
        </div>
      </div>

      {/* CONTENIDO */}
      {modo === "existente" ? (
        <PizzaExistenteSelector
          tamaño={tamaño}
          onSelect={handleExistenteChange}
        />
      ) : (
        <PizzaEnteraBuilder
          tamaño={tamaño}
          onChange={handlePersonalizadaChange}
        />
      )}
    </div>
  );
}
