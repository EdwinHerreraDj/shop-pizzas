import { useQuery } from "@tanstack/react-query";
import clientesAxios from "../config/axios";

const SIN_METODOS = [];

async function fetchMetodosPago() {
  const { data } = await clientesAxios.get("/shop/metodos-pago");
  return data;
}

/**
 * Opciones de entrega disponibles ahora mismo, según los métodos de pago
 * que el admin tiene activos para domicilio y para recogida.
 * Una opción solo está disponible si tiene al menos un método de pago activo.
 *
 * { metodos, metodosDomicilio, metodosRecogida, domicilio, recogida, cargado }
 *
 * Refresca cada minuto para reflejar los cambios del admin mientras se navega.
 */
export default function useOpcionesEntrega() {
  const query = useQuery({
    queryKey: ["metodos-pago"],
    queryFn: fetchMetodosPago,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const metodos = query.data ?? SIN_METODOS;
  const metodosDomicilio = metodos.filter((m) => m.activo_domicilio);
  const metodosRecogida = metodos.filter((m) => m.activo_recogida);

  return {
    ...query,
    metodos,
    metodosDomicilio,
    metodosRecogida,
    domicilio: metodosDomicilio.length > 0,
    recogida: metodosRecogida.length > 0,
    cargado: query.data !== undefined,
  };
}

/**
 * Texto del aviso cuando no están disponibles las dos opciones.
 * Devuelve null si se puede pedir a domicilio y para recoger.
 */
export function mensajeOpcionesEntrega({ domicilio, recogida }) {
  if (domicilio && recogida) return null;
  if (recogida) return "Ahora mismo solo aceptamos pedidos para recoger en tienda.";
  if (domicilio) return "Ahora mismo solo aceptamos pedidos con envío a domicilio.";
  return "Ahora mismo no estamos aceptando pedidos online.";
}
