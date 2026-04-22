import { useQuery } from "@tanstack/react-query";
import clientesAxios from "../config/axios";

async function fetchPagina(slug) {
  const { data } = await clientesAxios.get(`/shop/paginas-legales/${slug}`);
  return data;
}

async function fetchListado() {
  const { data } = await clientesAxios.get("/shop/paginas-legales");
  return data;
}

/**
 * Hook para obtener una página legal por slug.
 */
export function usePaginaLegal(slug) {
  return useQuery({
    queryKey: ["pagina-legal", slug],
    queryFn: () => fetchPagina(slug),
    enabled: Boolean(slug),
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook para listar todas las páginas legales activas (para el footer).
 */
export function usePaginasLegales() {
  return useQuery({
    queryKey: ["paginas-legales"],
    queryFn: fetchListado,
    staleTime: 10 * 60 * 1000,
  });
}
