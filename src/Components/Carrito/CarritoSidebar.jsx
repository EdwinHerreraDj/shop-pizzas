import { useCarrito } from "../../context/CarritoContext";
import { Link } from "react-router-dom";
import usePrecios from "../../hooks/usePrecios";
import "../../assets/crear-pizza.css";

/* Nombre amable según el tipo de producto */
const nombreItem = (item) => {
  if (item.tipo === "pizza-mitades") return "Pizza mitad y mitad";
  if (item.tipo === "pizza-entera") return "Pizza a tu gusto";
  return item.nombre || "Producto";
};

/* Resumen corto de cambios: "+2 extras · sin cebolla" */
const resumenCambios = (extras = [], quitados = []) => {
  const partes = [];
  if (extras.length) partes.push(`+${extras.length} extra${extras.length > 1 ? "s" : ""}`);
  if (quitados.length) partes.push(`sin ${quitados.map((i) => i.nombre.toLowerCase()).join(", ")}`);
  return partes.join(" · ");
};

export default function CarritoSidebar() {
  const {
    carrito,
    eliminarItem,
    vaciarCarrito,
    actualizarCantidad,
    totalCarrito,
  } = useCarrito();
  const { formatEUR } = usePrecios();

  const unidades = carrito.reduce((a, i) => a + (i.cantidad || 0), 0);

  return (
    <div className="lateral-pedido">
      {/* Cabecera */}
      <div className="lateral-pedido-cabecera">
        <span className="cp-seccion-icono">
          <i className="bi bi-basket2-fill" />
        </span>
        <div className="flex-grow-1">
          <h3 className="cp-seccion-titulo">Tu pedido</h3>
          <p className="cp-seccion-sub">
            {unidades === 0
              ? "Aún no has añadido nada"
              : `${unidades} ${unidades === 1 ? "producto" : "productos"}`}
          </p>
        </div>
        {carrito.length > 0 && (
          <button type="button" className="lateral-vaciar" onClick={vaciarCarrito}>
            Vaciar
          </button>
        )}
      </div>

      {carrito.length === 0 ? (
        <div className="lateral-vacio">
          <i className="bi bi-emoji-smile" />
          <span>Añade tu primera pizza y aparecerá aquí.</span>
        </div>
      ) : (
        <>
          <ul className="lateral-lista">
            {carrito.map((item, index) => {
              const detalle =
                item.tipo === "pizza-mitades"
                  ? [item.mitades?.mitadA?.nombre, item.mitades?.mitadB?.nombre]
                      .filter(Boolean)
                      .join(" + ")
                  : resumenCambios(item.ingredientesExtras, item.ingredientesQuitados);

              return (
                <li key={item.uid ?? index} className="lateral-item">
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <div style={{ minWidth: 0 }}>
                      <div className="lateral-item-nombre">{nombreItem(item)}</div>
                      <div className="lateral-item-detalle">
                        {item.tamano && <span>{item.tamano}</span>}
                        {item.tamano && detalle && <span> · </span>}
                        {detalle && <span>{detalle}</span>}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="lateral-quitar"
                      onClick={() => eliminarItem(index)}
                      aria-label={`Quitar ${nombreItem(item)}`}
                    >
                      <i className="bi bi-x-lg" />
                    </button>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <div className="cp-cantidad lateral-cantidad">
                      <button
                        type="button"
                        className="cp-cantidad-btn menos"
                        onClick={() =>
                          item.cantidad === 1
                            ? eliminarItem(index)
                            : actualizarCantidad(index, item.cantidad - 1)
                        }
                        aria-label={item.cantidad === 1 ? "Quitar" : "Uno menos"}
                      >
                        <i className={`bi ${item.cantidad === 1 ? "bi-trash3" : "bi-dash-lg"}`} />
                      </button>
                      <span className="cp-cantidad-valor">{item.cantidad}</span>
                      <button
                        type="button"
                        className="cp-cantidad-btn mas"
                        onClick={() => actualizarCantidad(index, item.cantidad + 1)}
                        aria-label="Uno más"
                      >
                        <i className="bi bi-plus-lg" />
                      </button>
                    </div>
                    <span className="lateral-item-precio">{formatEUR(item.precioTotal)}</span>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="lateral-total">
            <span>Total</span>
            <span>{formatEUR(totalCarrito)}</span>
          </div>

          <Link to="/shop/cart" className="cp-anadir w-100 text-white text-decoration-none mt-3">
            <i className="bi bi-bag-check-fill" />
            Ver mi pedido
            <i className="bi bi-arrow-right" />
          </Link>
        </>
      )}
    </div>
  );
}
