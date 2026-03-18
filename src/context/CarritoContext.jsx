import { createContext, useContext, useState, useEffect } from "react";

const CarritoContext = createContext();

export function CarritoProvider({ children }) {
  const [carrito, setCarrito] = useState(() => {
    const stored = localStorage.getItem("carrito");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }, [carrito]);

  /* ═══════════════════════════════════════════════
     CLAVE ÚNICA — agrupa items idénticos
     Dos items son iguales si: mismo tipo, artículo,
     tamanoId, e ingredientes extras/quitados.
  ═══════════════════════════════════════════════ */
  const generarClave = (item) =>
    JSON.stringify({
      tipo: item.tipo,
      articuloId: item.articuloId ?? null,
      tamanoId: item.tamanoId ?? null,
      ingredientesExtras: item.ingredientesExtras ?? [],
      ingredientesQuitados: item.ingredientesQuitados ?? [],
    });

  /* ═══════════════════════════════════════════════
     AGREGAR AL CARRITO
  ═══════════════════════════════════════════════ */
  const agregarAlCarrito = (producto) => {
    // Pizzas por mitades son SIEMPRE únicas (no agrupar)
    if (producto.tipo === "pizza-mitades") {
      setCarrito((prev) => [
        ...prev,
        { ...producto, uid: crypto.randomUUID(), cantidad: 1 },
      ]);
      return;
    }

    setCarrito((prev) => {
      const claveNueva = generarClave(producto);
      const index = prev.findIndex((it) => generarClave(it) === claveNueva);

      if (index !== -1) {
        // Existe → incrementar cantidad + recalcular total
        const copia = [...prev];
        const nuevaCantidad = copia[index].cantidad + 1;
        const precioUnitario =
          (Number(copia[index].precioBase) || 0) +
          (Number(copia[index].precioExtras) || 0);

        copia[index] = {
          ...copia[index],
          cantidad: nuevaCantidad,
          precioTotal: precioUnitario * nuevaCantidad,
        };
        return copia;
      }

      // Nuevo item
      const precioUnitario =
        (Number(producto.precioBase) || 0) +
        (Number(producto.precioExtras) || 0);

      return [
        ...prev,
        {
          ...producto,
          uid: crypto.randomUUID(),
          cantidad: 1,
          precioTotal: producto.precioTotal ?? precioUnitario,
        },
      ];
    });
  };

  /* ═══════════════════════════════════════════════
     ACTUALIZAR CANTIDAD
  ═══════════════════════════════════════════════ */
  const actualizarCantidad = (index, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;

    setCarrito((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        // Para mitades el precioTotal no se descompone en base+extras
        if (item.tipo === "pizza-mitades") {
          const precioUnitario = item.precioTotal / item.cantidad;
          return {
            ...item,
            cantidad: nuevaCantidad,
            precioTotal: precioUnitario * nuevaCantidad,
          };
        }

        const precioUnitario =
          (Number(item.precioBase) || 0) + (Number(item.precioExtras) || 0);

        return {
          ...item,
          cantidad: nuevaCantidad,
          precioTotal: precioUnitario * nuevaCantidad,
        };
      }),
    );
  };

  /* ═══════════════════════════════════════════════
     ELIMINAR / VACIAR
  ═══════════════════════════════════════════════ */
  const eliminarItem = (index) => {
    setCarrito((prev) => prev.filter((_, i) => i !== index));
  };

  const vaciarCarrito = () => {
    setCarrito([]);
    localStorage.removeItem("carrito");
  };

  /* ═══════════════════════════════════════════════
     TOTALES
  ═══════════════════════════════════════════════ */
  const totalCarrito = carrito.reduce(
    (acc, item) => acc + (Number(item.precioTotal) || 0),
    0,
  );

  const totalItems = carrito.reduce(
    (acc, item) => acc + (item.cantidad || 0),
    0,
  );

  /* ═══════════════════════════════════════════════
     PREPARAR PAYLOAD PARA BACKEND
     Estructura limpia lista para POST /api/pedidos
  ═══════════════════════════════════════════════ */
  const prepararPedido = () => {
    const mapExtras = (extras = []) =>
      extras.map((ing) => ({
        ingredienteId: ing.ingredienteId ?? ing.id,
        cantidad: ing.cantidad || 1,
      }));

    const mapQuitados = (quitados = []) =>
      quitados.map((ing) => ({
        ingredienteId: ing.ingredienteId ?? ing.id,
      }));

    const items = carrito.map((item) => {
      if (item.tipo === "articulo" || item.tipo === "pizza-entera") {
        return {
          tipo: "articulo",
          articuloId: item.articuloId,
          tamanoId: item.tamanoId ?? null,
          cantidad: item.cantidad,
          ingredientesExtras: mapExtras(item.ingredientesExtras),
          ingredientesQuitados: mapQuitados(item.ingredientesQuitados),
        };
      }

      if (item.tipo === "pizza-mitades") {
        return {
          tipo: "pizza-mitades",
          cantidad: item.cantidad,
          mitades: {
            mitadA: {
              articuloId: item.mitades?.mitadA?.articuloId,
              tamanoId: item.tamanoId,
              ingredientesExtras: mapExtras(
                item.mitades?.mitadA?.ingredientesExtras,
              ),
              ingredientesQuitados: mapQuitados(
                item.mitades?.mitadA?.ingredientesQuitados,
              ),
            },
            mitadB: {
              articuloId: item.mitades?.mitadB?.articuloId,
              tamanoId: item.tamanoId,
              ingredientesExtras: mapExtras(
                item.mitades?.mitadB?.ingredientesExtras,
              ),
              ingredientesQuitados: mapQuitados(
                item.mitades?.mitadB?.ingredientesQuitados,
              ),
            },
          },
        };
      }

      return {
        tipo: item.tipo,
        cantidad: item.cantidad,
      };
    });

    console.log("ITEMS PREPARADOS", items);
    return items;
  };

  return (
    <CarritoContext.Provider
      value={{
        carrito,
        agregarAlCarrito,
        eliminarItem,
        vaciarCarrito,
        actualizarCantidad,
        totalCarrito,
        totalItems,
        prepararPedido,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

export const useCarrito = () => useContext(CarritoContext);
