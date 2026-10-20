import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { router } from "./Routes/Routes.jsx";
import { CarritoProvider } from "./context/CarritoContext.jsx";
import { ToastContainer } from "react-toastify";
import { setQueryClient, reintentarSalvoCierre } from "./config/axios.js";
import "react-toastify/dist/ReactToastify.css";

// 🔹 Estilos globales
import "slick-carousel/slick/slick.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./assets/main.css";
import "./assets/ajustes.css";

// Crear instancia de React Query.
// Un 503 de tienda cerrada no se reintenta: se muestra el mantenimiento al momento.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: reintentarSalvoCierre(3) },
  },
});

// Permite al interceptor de axios actualizar la caché del query client
// cuando el backend responde 503 (tienda cerrada).
setQueryClient(queryClient);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CarritoProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        {/* 🔔 TOAST GLOBAL */}
        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="light"
        />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </CarritoProvider>
  </StrictMode>
);
