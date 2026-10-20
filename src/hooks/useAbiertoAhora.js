import { useQuery } from "@tanstack/react-query";
import clientesAxios from "../config/axios";

async function fetchAbierto() {
  const { data } = await clientesAxios.get("/shop/abierto-ahora");
  return data;
}

/**
 * Indica si la tienda está abierta ahora mismo según las franjas horarias.
 * { abierto, hora_actual, cierra_a, proxima_apertura }
 *
 * Refresca cada minuto para detectar el cambio de franja.
 */
export default function useAbiertoAhora() {
  return useQuery({
    queryKey: ["abierto-ahora"],
    queryFn: fetchAbierto,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });
}
