import { useQuery } from "@tanstack/react-query";
import clientesAxios from "../config/axios";

/**
 * Hook para cargar pizzas existentes (selector de mitades).
 *
 * Endpoint: GET /api/shop/pizzas-existentes?page=N
 *
 * Devuelve paginación estándar de Laravel con cada pizza:
 *   { id, nombre, imagen, tipo_producto_id, tamanos[{ tamano_id, nombre, precio }] }
 */
export default function usePizzasExistentes(page = 1) {
  return useQuery({
    queryKey: ["pizzas-existentes", page],
    queryFn: async () => {
      const { data } = await clientesAxios.get(
        `/shop/pizzas-existentes?page=${page}`,
      );
      return data;
    },
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
  });
}
