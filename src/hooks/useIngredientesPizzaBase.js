// src/hooks/useIngredientesPizzaBase.js
import { useQuery } from "@tanstack/react-query";
import clientesAxios, { reintentarSalvoCierre } from "../config/axios";

export default function useIngredientesPizzaBase() {
  return useQuery({
    queryKey: ["ingredientesPizzaBase"],
    queryFn: async () => {
      const { data } = await clientesAxios.get("/ingredientes/base");
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: reintentarSalvoCierre(1),
  });
}
