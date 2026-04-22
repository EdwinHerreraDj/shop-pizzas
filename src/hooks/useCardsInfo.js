import { useQuery } from "@tanstack/react-query";
import clientesAxios from "../config/axios";

async function fetchCardsInfo() {
  const { data } = await clientesAxios.get("/shop/cards-info");
  return data.cards ?? [];
}

/**
 * Cards informativas configurables desde el admin que se muestran
 * antes del footer. Solo devuelve las activas.
 */
export default function useCardsInfo() {
  return useQuery({
    queryKey: ["cards-info"],
    queryFn: fetchCardsInfo,
    staleTime: 5 * 60 * 1000, // 5 min
  });
}
