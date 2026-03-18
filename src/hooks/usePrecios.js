import { useCallback } from "react";

/**
 * Hook unificado de utilidades de precios.
 * Alineado con arquitectura:
 * - tamanos globales (id)
 * - precio_por_tamano indexado por tamano_id
 */
export default function usePrecios() {

  // Conversión segura a número
  const toNum = useCallback((v) => Number.parseFloat(v ?? 0) || 0, []);

  // Formateo EUR
  const formatEUR = useCallback((v) => {
    const value = Number.isFinite(v) ? v : parseFloat(v ?? 0);
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(value || 0);
  }, []);

  /**
   * Obtiene precio del ingrediente según tamano_id
   * @param {Object} ingrediente
   * @param {Number} tamanoId
   */
  const getPrecioIngrediente = useCallback((ingrediente, tamanoId) => {
    if (!ingrediente || !tamanoId) return 0;
    return toNum(
      ingrediente.precio_por_tamano?.[tamanoId] ?? 0
    );
  }, [toNum]);

  /**
   * Calcula total de extras seleccionados
   */
  const calcularExtras = useCallback((ingredientes, tamanoId) => {
    if (!tamanoId) return 0;

    return ingredientes.reduce((acc, ing) => {
      const precio = toNum(
        ing.precio_por_tamano?.[tamanoId] ?? 0
      );

      const unidadesDePago =
        ing.modo === "base"
          ? Math.max(ing.cantidad - 1, 0)
          : ing.cantidad;

      return acc + precio * unidadesDePago;
    }, 0);
  }, [toNum]);

  return {
    toNum,
    formatEUR,
    getPrecioIngrediente,
    calcularExtras,
  };
}