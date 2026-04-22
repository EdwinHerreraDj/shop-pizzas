import { useQuery } from "@tanstack/react-query";
import clientesAxios from "../config/axios";

async function fetchEstadoTienda() {
  const { data } = await clientesAxios.get("/shop/estado-tienda");
  return data;
}

/**
 * Devuelve el estado actual de la tienda.
 * { cerrada: boolean, titulo: string, mensaje: string }
 *
 * Se refresca cada 60s para que si el admin cambia el estado
 * mientras el cliente navega, se actualice en poco tiempo.
 */
export default function useEstadoTienda() {
  return useQuery({
    queryKey: ["estado-tienda"],
    queryFn: fetchEstadoTienda,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
