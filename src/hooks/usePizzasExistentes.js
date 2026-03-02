import { useQuery } from "@tanstack/react-query";
import clientesAxios from "../config/axios";

export default function usePizzasExistentes(page = 1) {
  return useQuery({
    queryKey: ["pizzas-existentes", page],
    queryFn: async () => {
      const { data } = await clientesAxios.get(
        `/articulos/categoria/1?page=${page}`
      );
      return data;
    },
    keepPreviousData: true,
  });
}
