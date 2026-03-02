import { createContext, useContext, useState, useEffect } from "react";

const CarritoContext = createContext();

export function CarritoProvider({ children }) {
  const [carrito, setCarrito] = useState(() => {
    // cargar desde localStorage al iniciar
    const stored = localStorage.getItem("carrito");
    return stored ? JSON.parse(stored) : [];
  });

  // guardar en localStorage cada vez que cambie el carrito
  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }, [carrito]);

  const generarClaveItem = (item) => {
    return JSON.stringify({
      tipo: item.tipo,
      articuloId: item.articuloId ?? null,
      tamaño: item.tamaño ?? null,
      ingredientesExtras: item.ingredientesExtras ?? [],
      ingredientesQuitados: item.ingredientesQuitados ?? [],
      mitadA: item.mitadA ?? null,
      mitadB: item.mitadB ?? null,
    });
  };

  // Agregar producto
  const agregarAlCarrito = (producto) => {
    // Las pizzas por mitades SIEMPRE son únicas
    if (producto.tipo === "pizza-mitades") {
      setCarrito((prev) => [
        ...prev,
        {
          ...producto,
          uid: crypto.randomUUID(),
          cantidad: 1,
        },
      ]);
      return;
    }

    // Para el resto, sí podemos agrupar
    setCarrito((prev) => {
      const index = prev.findIndex(
        (item) =>
          item.tipo === producto.tipo &&
          item.articuloId === producto.articuloId &&
          item.tamaño === producto.tamaño &&
          JSON.stringify(item.ingredientesExtras) ===
            JSON.stringify(producto.ingredientesExtras) &&
          JSON.stringify(item.ingredientesQuitados) ===
            JSON.stringify(producto.ingredientesQuitados)
      );

      if (index !== -1) {
        const copia = [...prev];
        copia[index] = {
          ...copia[index],
          cantidad: copia[index].cantidad + 1,
          precioTotal:
            (copia[index].precioBase + copia[index].precioExtras) *
            (copia[index].cantidad + 1),
        };
        return copia;
      }

      return [
        ...prev,
        {
          ...producto,
          uid: crypto.randomUUID(),
          cantidad: 1,
        },
      ];
    });
  };

  // Actualizar cantidad por índice
  const actualizarCantidad = (index, nuevaCantidad) => {
    setCarrito((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, cantidad: nuevaCantidad } : item
      )
    );
  };

  // Eliminar producto por índice
  const eliminarItem = (index) => {
    setCarrito((prev) => prev.filter((_, i) => i !== index));
  };

  // Vaciar carrito
  const vaciarCarrito = () => {
    setCarrito([]);
    localStorage.removeItem("carrito");
  };

  return (
    <CarritoContext.Provider
      value={{
        carrito,
        agregarAlCarrito,
        eliminarItem,
        vaciarCarrito,
        actualizarCantidad,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

export const useCarrito = () => useContext(CarritoContext);
