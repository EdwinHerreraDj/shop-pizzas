import { useState, useEffect } from "react";
import SelectorMitad from "./SelectorMitad";

export default function PizzaMitadBuilder({ tamaño, onChange }) {
  const [mitadA, setMitadA] = useState(null);
  const [mitadB, setMitadB] = useState(null);

  useEffect(() => {
    if (!mitadA || !mitadB) return;

    onChange({
      mitadA,
      mitadB,
    });
  }, [mitadA, mitadB, onChange]);

  return (
    <div className="d-flex flex-column gap-4">
      {/* MITAD 1 */}
      <div className="border rounded-4 p-4 shadow-sm bg-white">
        <div className="d-flex align-items-center gap-2 mb-3">
          <span
            className="d-inline-flex align-items-center justify-content-center rounded-circle fw-bold text-white"
            style={{
              width: 28,
              height: 28,
              backgroundColor: "#eb0029",
            }}
          >
            1
          </span>

          <h5 className="fw-bold mb-0">Primera mitad</h5>
        </div>

        <SelectorMitad
          tamaño={tamaño}
          onChange={(data) => {
            setMitadA({
              nombre: data.nombre,
              precioBase: data.precioBase,
              precioExtras: data.precioExtras,
              ingredientesExtras: data.ingredientesExtras || [],
              ingredientesQuitados: data.ingredientesQuitados || [],
            });
          }}
        />
      </div>

      {/* MITAD 2 */}
      <div className="border rounded-4 p-4 shadow-sm bg-white">
        <div className="d-flex align-items-center gap-2 mb-3">
          <span
            className="d-inline-flex align-items-center justify-content-center rounded-circle fw-bold text-white"
            style={{
              width: 28,
              height: 28,
              backgroundColor: "#eb0029",
            }}
          >
            2
          </span>

          <h5 className="fw-bold mb-0">Segunda mitad</h5>
        </div>

        <SelectorMitad
          tamaño={tamaño}
          onChange={(data) => {
            setMitadB({
              nombre: data.nombre,
              precioBase: data.precioBase,
              precioExtras: data.precioExtras,
              ingredientesExtras: data.ingredientesExtras || [],
              ingredientesQuitados: data.ingredientesQuitados || [],
            });
          }}
        />
      </div>
    </div>
  );
}
