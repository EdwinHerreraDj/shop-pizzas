import axios from 'axios';

const clientesAxios = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },

});

// Referencia al QueryClient de TanStack Query. Se inyecta desde main.jsx
// para poder invalidar queries desde el interceptor.
let queryClientRef = null;
export function setQueryClient(client) {
    queryClientRef = client;
}

/**
 * ¿El error es el 503 de "tienda cerrada / mantenimiento" del backend?
 * Lo distingue de un error real (red caída, 500, límite de peticiones...).
 */
export function esTiendaCerrada(error) {
    return error?.response?.status === 503 && error?.response?.data?.tienda_cerrada === true;
}

/** Título y mensaje de cierre que envía Laravel junto al 503. */
export function datosCierre(error) {
    const data = error?.response?.data ?? {};
    return {
        cerrada: true,
        titulo: data.titulo ?? "¡Estamos cerrados!",
        mensaje: data.mensaje ?? "Volveremos pronto.",
    };
}

/**
 * Política de reintentos para React Query: nunca reintenta un cierre por
 * mantenimiento ni errores 4xx (no se van a arreglar solos); los fallos de
 * red y 5xx reales se reintentan hasta `maxIntentos` veces.
 */
export function reintentarSalvoCierre(maxIntentos = 3) {
    return (intentos, error) => {
        if (esTiendaCerrada(error)) return false;
        const status = error?.response?.status;
        if (status >= 400 && status < 500) return false;
        return intentos < maxIntentos;
    };
}

// Interceptor: si el backend responde 503 con tienda_cerrada, actualizamos
// el estado de la tienda para que TiendaGuard muestre la pantalla de cerrada
// inmediatamente, en lugar de un mensaje de error.
clientesAxios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (esTiendaCerrada(error) && queryClientRef) {
            queryClientRef.setQueryData(["estado-tienda"], datosCierre(error));
        }
        return Promise.reject(error);
    },
);

export default clientesAxios;