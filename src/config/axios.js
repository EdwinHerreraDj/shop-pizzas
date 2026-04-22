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

// Interceptor: si el backend responde 503 con tienda_cerrada, refrescamos
// el estado de la tienda para que TiendaGuard muestre la pantalla de cerrada
// inmediatamente, en lugar de un mensaje de error.
clientesAxios.interceptors.response.use(
    (response) => response,
    (error) => {
        const data = error?.response?.data;
        if (error?.response?.status === 503 && data?.tienda_cerrada) {
            if (queryClientRef) {
                queryClientRef.setQueryData(["estado-tienda"], {
                    cerrada: true,
                    titulo: data.titulo ?? "¡Estamos cerrados!",
                    mensaje: data.mensaje ?? "Volveremos pronto.",
                });
            }
        }
        return Promise.reject(error);
    },
);

export default clientesAxios;