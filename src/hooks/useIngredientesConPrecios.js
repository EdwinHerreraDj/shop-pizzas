import { useQuery, useQueryClient } from "@tanstack/react-query";
import clientesAxios from "../config/axios";

export default function useIngredientesConPrecios(id) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["articuloDetalle", id],
    enabled: !!id,

    queryFn: async () => {
      const { data } = await clientesAxios.get(`/shop/articulos/${id}`);
      return data;
    },

    // Mantener datos anteriores mientras cambia id (mitades)
    keepPreviousData: true,

    // Cache viva 10 minutos
    staleTime: 1000 * 60 * 10,

    // No refetch automático al volver a la pestaña
    refetchOnWindowFocus: false,

    // Evita refetch si ya existe en cache
    refetchOnMount: false,

    retry: 1,
  });

  // Helper opcional para prefetch (mitades)
  const prefetchArticulo = async (articuloId) => {
    await queryClient.prefetchQuery({
      queryKey: ["articuloDetalle", articuloId],
      queryFn: async () => {
        const { data } = await clientesAxios.get(
          `/shop/articulos/${articuloId}`
        );
        return data;
      },
      staleTime: 1000 * 60 * 10,
    });
  };

  return {
    ...query,
    prefetchArticulo,
  };
}