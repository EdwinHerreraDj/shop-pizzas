import { useCallback } from "react";

/**
 * Hook reutilizable para manejar precios, conversiones
 * y formateo a moneda EUR en toda la app.
 */
export default function usePrecios() {

    // 🔹 Convierte cualquier valor a número seguro
    const toNum = useCallback((v) => Number.parseFloat(v ?? 0) || 0, []);

    // 🔹 Formatea número como moneda en euros (EUR)
    const formatEUR = useCallback((v) => {
        const value = Number.isFinite(v) ? v : parseFloat(v ?? 0);
        return new Intl.NumberFormat("es-ES", {
            style: "currency",
            currency: "EUR",
        }).format(value || 0);
    }, []);

    /**
     * 🔹 Obtiene el precio del ingrediente según tamaño o tipo de producto
     * @param {Object} ingrediente - objeto del ingrediente con precios
     * @param {String} tamaño - "Pequeña" | "Mediana" | "Grande"
     * @param {Boolean} esPrecioUnico - si el producto usa un único precio
     */
    const getPrecioPorTamaño = useCallback((ingrediente, tamaño, esPrecioUnico = false) => {
        if (!ingrediente || !ingrediente.precios) return 0;

        let precios = ingrediente.precios;

        // normaliza el formato de precios (a veces viene como array o anidado)
        if (Array.isArray(precios)) precios = precios[0];
        if (typeof precios === "object" && !("pequena" in precios) && Object.keys(precios).length > 0) {
            precios = Object.values(precios)[0];
        }
        if (!precios) return 0;

        // si el producto tiene un precio único
        if (esPrecioUnico) return toNum(precios.unico);

        // selecciona el precio según el tamaño
        switch (tamaño) {
            case "Pequeña":
                return toNum(precios.pequena ?? precios.unico);
            case "Mediana":
                return toNum(precios.mediana ?? precios.unico);
            case "Grande":
                return toNum(precios.grande ?? precios.unico);
            default:
                return toNum(precios.unico);
        }
    }, [toNum]);

    return {
        toNum,
        formatEUR,
        getPrecioPorTamaño,
    };
}
