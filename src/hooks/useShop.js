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
  const obtenerPrecioArticulo = (producto, tamaño) => {
    // Caso precio único (bebidas, postres, etc.)
    if (Number(producto.precios?.unico) > 0) {
      return {
        precioBase: Number(producto.precios.unico),
        tamaño: null,
      };
    }

    // Caso con tamaños
    const map = {
      Pequeña: "pequena",
      Mediana: "mediana",
      Grande: "grande",
    };

    const key = map[tamaño] ?? "pequena";

    return {
      precioBase: Number(producto.precios?.[key]) || 0,
      tamaño,
    };
  };

  // Agregar al carrito directamente
  const handleAgregar = (producto) => {
    const tamañoPorDefecto = "Pequeña";

    const { precioBase, tamaño } = obtenerPrecioArticulo(
      producto,
      tamañoPorDefecto
    );

    const item = {
      tipo: "articulo",
      articuloId: producto.id,
      nombre: producto.nombre,
      tamaño, // null si es precio único
      cantidad: 1,

      // precios
      precioBase,
      precioExtras: 0,
      precioTotal: precioBase,

      // ingredientes (solo informativo aquí)
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
