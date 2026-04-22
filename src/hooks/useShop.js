import { useState } from "react";
import { toast } from "react-toastify";
import useArticulos from "./useArticulos";
import usePrecios from "./usePrecios";
import { useCarrito } from "../context/CarritoContext";

export default function useShop() {
  const [categoria, setCategoria] = useState("");
  const [page, setPage] = useState(1);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  //Logica de pizzas modal crea tu propia pizza
  const [mostrarModalCrearPizza, setMostrarModalCrearPizza] = useState(false);

  // Hooks externos
  const { data, isLoading, isError } = useArticulos(categoria, page);
  const { agregarAlCarrito } = useCarrito();

  // Datos
  const articulos = data?.articulos || [];
  const currentPage = data?.meta?.current_page || 1;
  const lastPage = data?.meta?.last_page || 1;

  // Cambiar categoría
  const handleCategoriaChange = (e) => {
    setCategoria(e.target.value);
    setPage(1);
  };
  // Utilidad para obtener el precio base según tamaño
  const obtenerPrecioArticulo = (producto, tamanoPorDefecto = "Pequeña") => {
    const tamanos = Array.isArray(producto.tamanos) ? producto.tamanos : [];

    if (tamanos.length === 0) {
      return {
        precioBase: 0,
        tamano: null,
        tamanoId: null,
      };
    }

    // Caso producto único
    const unico = tamanos.find(
      (t) =>
        t.nombre?.toLowerCase() === "unico" ||
        t.nombre?.toLowerCase() === "único",
    );

    if (unico) {
      return {
        precioBase: Number(unico.precio) || 0,
        tamano: unico.nombre,
        tamanoId: unico.id,
      };
    }

    // Caso con tamaños
    const tamanoEncontrado =
      tamanos.find((t) => t.nombre === tamanoPorDefecto) ?? tamanos[0];

    return {
      precioBase: Number(tamanoEncontrado?.precio) || 0,
      tamano: tamanoEncontrado?.nombre ?? null,
      tamanoId: tamanoEncontrado?.id ?? null,
    };
  };

  // Agregar al carrito directamente
  const handleAgregar = (producto) => {
    const tamanoPorDefecto = "Pequeña";

    const { precioBase, tamano, tamanoId } = obtenerPrecioArticulo(
      producto,
      tamanoPorDefecto,
    );

    const item = {
      tipo: "articulo",
      articuloId: producto.id,
      nombre: producto.nombre,
      esComida: producto.esComida === true,
      tamano,
      tamanoId,
      cantidad: 1,

      precioBase,
      precioExtras: 0,
      precioTotal: precioBase,

      ingredientesBase: producto.ingredientes || [],
      ingredientesExtras: [],
      ingredientesQuitados: [],
    };

    agregarAlCarrito(item);
    toast.success(`${producto.nombre} añadido al carrito`);
  };

  // Personalizar producto (abrir modal)
  const handlePersonalizar = (producto) => {
    setProductoSeleccionado(producto.id);
    setMostrarModal(true);
  };

  // Confirmar desde modal
  const handleConfirmar = (productoPersonalizado) => {
    agregarAlCarrito(productoPersonalizado);
    toast.success(`${productoPersonalizado.nombre} añadido al carrito`);
    setMostrarModal(false);
  };

  return {
    categoria,
    articulos,
    currentPage,
    lastPage,
    isLoading,
    isError,
    handleCategoriaChange,
    handleAgregar,
    handlePersonalizar,
    handleConfirmar,
    page,
    setPage,
    productoSeleccionado,
    mostrarModal,
    setMostrarModal,
    mostrarModalCrearPizza,
    setMostrarModalCrearPizza,
  };
}
