import { useCategorias } from "../../hooks/useCategoria";

const CategoriasSelect = ({ onChange, value }) => {
  const { data: categorias = [], isLoading } = useCategorias();

  if (isLoading) return <p>Cargando categorías...</p>;

  return (
    <select
      name="categoria"
      value={value}
      onChange={onChange}
      className="single-select"
      aria-label="Categorías"
    >
      <option value="">-- Selecciona una categoría --</option>

      {categorias.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.nombre}
        </option>
      ))}
    </select>
  );
};

export default CategoriasSelect;
