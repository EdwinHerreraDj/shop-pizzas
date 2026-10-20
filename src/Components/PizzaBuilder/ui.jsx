/**
 * Piezas visuales del modal "Crear tu pizza" (solo presentación).
 * Estilos en src/assets/crear-pizza.css.
 */

/* Tarjeta de cada apartado del modal */
export function Seccion({ icono, titulo, sub, children, className = "" }) {
  return (
    <section className={`cp-seccion ${className}`}>
      <div className="cp-seccion-cabecera">
        <span className="cp-seccion-icono">
          <i className={`bi ${icono}`} />
        </span>
        <div>
          <h3 className="cp-seccion-titulo">{titulo}</h3>
          {sub && <p className="cp-seccion-sub">{sub}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

/* Dibujo de pizza: entera o partida por la mitad */
export function PizzaDibujo({ tipo = "entera", size = 56 }) {
  const salsa = "#f25c2a";
  const queso = "#ffd27a";
  const masa = "#e8b06a";

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="flex-shrink-0">
      <circle cx="32" cy="32" r="30" fill={masa} />
      {tipo === "entera" ? (
        <>
          <circle cx="32" cy="32" r="25" fill={salsa} />
          <circle cx="32" cy="32" r="22" fill={queso} />
          <circle cx="24" cy="24" r="3.5" fill={salsa} />
          <circle cx="40" cy="27" r="3.5" fill={salsa} />
          <circle cx="29" cy="40" r="3.5" fill={salsa} />
          <circle cx="41" cy="40" r="2.5" fill="#3b8c3b" />
          <circle cx="22" cy="34" r="2.5" fill="#3b8c3b" />
        </>
      ) : (
        <>
          <path d="M32 7 A25 25 0 0 0 32 57 Z" fill={salsa} />
          <path d="M32 10 A22 22 0 0 0 32 54 Z" fill={queso} />
          <path d="M32 7 A25 25 0 0 1 32 57 Z" fill="#eb0029" />
          <path d="M32 10 A22 22 0 0 1 32 54 Z" fill="#ffb36b" />
          <circle cx="22" cy="26" r="3" fill={salsa} />
          <circle cx="24" cy="40" r="2.5" fill="#3b8c3b" />
          <circle cx="42" cy="25" r="2.5" fill="#6b3d1f" />
          <circle cx="41" cy="39" r="3" fill="#6b3d1f" />
          <line x1="32" y1="4" x2="32" y2="60" stroke="#fff" strokeWidth="2.5" />
        </>
      )}
    </svg>
  );
}

/* Pizza que crece según el tamaño (índice 0, 1, 2…) */
export function PizzaTamano({ indice = 0, total = 3, activo = false }) {
  const minimo = 30;
  const maximo = 62;
  const paso = total > 1 ? (maximo - minimo) / (total - 1) : 0;
  const size = Math.round(minimo + paso * indice);

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill={activo ? "#e8b06a" : "#ead9c6"} />
      <circle cx="32" cy="32" r="23" fill={activo ? "#ffd27a" : "#f5ebde"} />
      <circle cx="25" cy="26" r="3.5" fill={activo ? "#f25c2a" : "#e0cdb8"} />
      <circle cx="39" cy="30" r="3.5" fill={activo ? "#f25c2a" : "#e0cdb8"} />
      <circle cx="31" cy="40" r="3.5" fill={activo ? "#f25c2a" : "#e0cdb8"} />
    </svg>
  );
}

/* Título de categoría con icono (para las pastillas de categorías) */
const ICONOS_CATEGORIA = [
  ["queso", "bi-pie-chart-fill"],
  ["carne", "bi-fire"],
  ["vegetal", "bi-flower1"],
  ["verdura", "bi-flower1"],
  ["salsa", "bi-droplet-fill"],
  ["pescado", "bi-water"],
  ["marisco", "bi-water"],
];

export function TituloCategoria({ categoria }) {
  const clave = String(categoria).toLowerCase();
  const icono = ICONOS_CATEGORIA.find(([k]) => clave.includes(k))?.[1] ?? "bi-stars";
  return (
    <>
      <i className={`bi ${icono}`} />
      {categoria}
    </>
  );
}
