import { useQuery } from "@tanstack/react-query";
import clientesAxios from "../config/axios";

export const useCategorias = () => {
  return useQuery({
    queryKey: ["categorias"],
    queryFn: async () => {
      const { data } = await clientesAxios.get("/shop/categorias");
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
};
