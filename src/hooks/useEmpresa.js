import { useQuery } from "@tanstack/react-query";
import clientesAxios from "../config/axios";

async function fetchEmpresa() {
  const { data } = await clientesAxios.get("/shop/empresa");
  return data;
}

/**
 * Información pública de la empresa configurable desde el admin:
 * nombre, email, teléfono, WhatsApp, dirección, Google Maps, redes...
 */
export default function useEmpresa() {
  return useQuery({
    queryKey: ["empresa"],
    queryFn: fetchEmpresa,
    staleTime: 30 * 60 * 1000, // 30 min
  });
}
