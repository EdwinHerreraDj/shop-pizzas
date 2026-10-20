import { useQuery } from "@tanstack/react-query";
import clientesAxios, { reintentarSalvoCierre } from "../config/axios.js";

/**
 * Hook exclusivo para la pizza plantilla (es_plantilla = 1).
 * NO reutiliza hooks de artículos normales.
 *
 * Devuelve: { data, isLoading, isError }
 *   data => { id, nombre, imagen, personalizable, tipo_producto_id, tamanos[], ingredientes{} }
 */
export default function usePizzaPlantilla() {
  return useQuery({
    queryKey: ["pizzaPlantilla"],
    queryFn: async () => {
      const { data } = await clientesAxios.get("/shop/pizza-plantilla");
      return data;
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    retry: reintentarSalvoCierre(1),
  });
}
