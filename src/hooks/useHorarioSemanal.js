import { useQuery } from "@tanstack/react-query";
import clientesAxios from "../config/axios";

async function fetchHorario() {
  const { data } = await clientesAxios.get("/shop/horario-semanal");
  return data;
}

/**
 * Devuelve el horario semanal para mostrar en el footer.
 * [{ dia_semana, dia_nombre, cerrado, franjas: [{ apertura, cierre }] }]
 */
export default function useHorarioSemanal() {
  return useQuery({
    queryKey: ["horario-semanal"],
    queryFn: fetchHorario,
    staleTime: 30 * 60 * 1000, // 30 min (el horario cambia pocas veces)
  });
}
