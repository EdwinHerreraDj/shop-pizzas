

export default function Pagination({ currentPage, lastPage, onPageChange }) {

 // if (lastPage <= 1) return null; // si solo hay una página, no mostrar

  // 🔹 Generar los números visibles (con puntos suspensivos)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (lastPage <= maxVisible) {
      for (let i = 1; i <= lastPage; i++) pages.push(i);
    } else {
      if (currentPage > 3) pages.push(1, "...");
      for (
        let i = Math.max(1, currentPage - 1);
        i <= Math.min(lastPage, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }
      if (currentPage < lastPage - 2) pages.push("...", lastPage);
    }

    return pages;
  };

  return (
    <div className="page-nav-wrap text-center mt-5">
      <ul>
        {/* Botón Anterior */}
        <li>
          <a
            className={`previous ${currentPage === 1 ? "disabled" : ""}`}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) onPageChange(currentPage - 1);
            }}
          >
            <i className="bi bi-arrow-left"></i>
          </a>
        </li>

        {/* Números */}
        {getPageNumbers().map((num, i) =>
          num === "..." ? (
            <li key={i}>
              <a className="page-numbers disabled" href="#">
                ...
              </a>
            </li>
          ) : (
            <li key={i}>
              <a
                className={`page-numbers ${
                  currentPage === num ? "active" : ""
                }`}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(num);
                }}
              >
                {num}
              </a>
            </li>
          )
        )}

        {/* Botón Siguiente */}
        <li>
          <a
            className={`next ${currentPage === lastPage ? "disabled" : ""}`}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < lastPage) onPageChange(currentPage + 1);
            }}
          >
            <i className="bi bi-arrow-right"></i>
          </a>
        </li>
      </ul>
    </div>
  );
}
