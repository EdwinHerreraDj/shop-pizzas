import { useQuery } from "@tanstack/react-query";
import clientesAxios from "../config/axios";

export default function useIngredientesConPrecios(id) {
  return useQuery({
    queryKey: ["articuloDetalle", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await clientesAxios.get(`/shop/articulos/${id}`);
      return data;
    },
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
}
