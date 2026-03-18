import { useQuery } from "@tanstack/react-query";
import clientesAxios from "../config/axios";

export default function useArticulos(categoriaId = "", page = 1, search = "") {
  return useQuery({
    queryKey: ["articulos", categoriaId, page, search],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (categoriaId) params.append("categoria_id", categoriaId);
      if (search) params.append("search", search);
      params.append("page", page);

      const { data } = await clientesAxios.get(
        `/shop/articulos?${params.toString()}`,
      );
      return {
        articulos: data.data,
        meta: {
          current_page: data.meta.current_page,
          last_page: data.meta.last_page,
          total: data.meta.total,
        },
      };
    },
    keepPreviousData: true,
  });
}
