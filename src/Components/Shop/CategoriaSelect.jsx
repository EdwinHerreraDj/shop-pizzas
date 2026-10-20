import { useCategorias } from "../../hooks/useCategoria";

// Icono orientativo según el nombre de la categoría (Bootstrap Icons)
const ICONOS = [
  ["pizza", "bi-circle-half"],
  ["bebida", "bi-cup-straw"],
  ["refresco", "bi-cup-straw"],
  ["cerveza", "bi-cup-straw"],
  ["postre", "bi-cake2"],
  ["dulce", "bi-cake2"],
  ["ensalada", "bi-flower1"],
  ["entrante", "bi-egg-fried"],
  ["complemento", "bi-egg-fried"],
  ["hamburguesa", "bi-stack"],
  ["menu", "bi-stars"],
  ["menú", "bi-stars"],
  ["oferta", "bi-tag-fill"],
];
const iconoCategoria = (nombre) =>
  ICONOS.find(([k]) => String(nombre).toLowerCase().includes(k))?.[1] ?? "bi-tag";

/**
 * Filtro de categorías en pastillas. Mantiene la misma interfaz que el
 * antiguo <select>: onChange recibe un objeto con target.value.
 */
const CategoriasSelect = ({ onChange, value }) => {
  const { data: categorias = [], isLoading } = useCategorias();

  const elegir = (id) => onChange({ target: { value: id } });

  if (isLoading) {
    return (
      <div className="carta-categorias" aria-busy="true">
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className="carta-categoria esqueleto" />
        ))}
      </div>
    );
  }

  const opciones = [{ id: "", nombre: "Todas", icono: "bi-grid-fill" }, ...categorias];

  return (
    <div className="carta-categorias" role="tablist" aria-label="Categorías">
      {opciones.map((cat) => {
        const activa = String(value ?? "") === String(cat.id);
        return (
          <button
            key={cat.id || "todas"}
            type="button"
            role="tab"
            aria-selected={activa}
            className={`carta-categoria ${activa ? "activa" : ""}`}
            onClick={() => elegir(cat.id)}
          >
            <i className={`bi ${cat.icono ?? iconoCategoria(cat.nombre)}`} />
            {cat.nombre}
          </button>
        );
      })}
    </div>
  );
};

export default CategoriasSelect;
