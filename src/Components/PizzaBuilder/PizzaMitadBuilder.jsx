import { useState, useEffect, useCallback } from "react";
import SelectorMitad from "./SelectorMitad";

/**
 * Builder para pizza por mitades.
 *
 * Props:
 *   tamanoId     — id numérico del tamaño
 *   tamanoNombre — nombre del tamaño (para display)
 *   onChange     — callback({ mitadA, mitadB }) | ({ mitadA: null, mitadB: null })
 */
export default function PizzaMitadBuilder({ tamanoId, tamanoNombre, onChange }) {
  const [mitadA, setMitadA] = useState(null);
  const [mitadB, setMitadB] = useState(null);

  /* Reset cuando cambia el tamaño */
  useEffect(() => {
    setMitadA(null);
    setMitadB(null);
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
          tamanoId={tamanoId}
          tamanoNombre={tamanoNombre}
          onChange={handleMitadAChange}
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
          tamanoId={tamanoId}
          tamanoNombre={tamanoNombre}
          onChange={handleMitadBChange}
        />
      </div>
    </div>
  );
}
