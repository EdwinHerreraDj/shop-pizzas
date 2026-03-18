import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import ShopCard from "../Card/ShopCard";
import useShop from "../../hooks/useShop";
import CategoriasSelect from "./CategoriaSelect";
import Pagination from "./Pagination";
import ModalCrearPizza from "../ShopDetails/ModalCrearPizza";
import ModalPersonalizar from "../ShopDetails/ModalPersonalizar";
import CarritoSidebar from "../Carrito/CarritoSidebar";

const Shop1 = () => {
  const {
    categoria,
    articulos,
    currentPage,
    lastPage,
    isLoading,
    isError,
    handleCategoriaChange,
    handleAgregar,
    handlePersonalizar,
    setPage,
    productoSeleccionado,
    mostrarModal,
    setMostrarModal,
    handleConfirmar,
    mostrarModalCrearPizza,
    setMostrarModalCrearPizza,
  } = useShop();

  const pizzasRef = useRef(null);
  const handlePageChange = (page) => {
    setPage(page);

    pizzasRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div
      ref={pizzasRef}
      id="pizzas"
      className="shop-section section-padding fix"
    >
      <div className="shop-wrapper style1">
        <div className="container">
          <div className="row">
            <div
              className="col-xl-3 col-lg-4 order-2 order-md-1 wow fadeInUp"
              data-wow-delay=".3s"
            >
              <div className="main-sidebar">
                {/* Crea tu pizza */}
                <div className="single-sidebar-widget">
                  <h5 className="widget-title">Crea tu pizza</h5>

                  <div className="card border-0 shadow-sm rounded-4 bg-light">
                    <div className="card-body p-4">
                      <h6 className="fw-semibold mb-2">
                        Personalízala a tu manera
                      </h6>

                      <p className="text-muted mb-4 small">
                        Crea tu pizza desde cero o combínala por mitades
                        eligiendo ingredientes y sabores a tu gusto.
                      </p>

                      <button
                        type="button"
                        className="theme-btn w-100 text-center d-flex align-items-center justify-content-center"
                        onClick={() => setMostrarModalCrearPizza(true)}
                      >
                        <i className="bi bi-plus-circle me-2"></i>
                        Crear mi pizza
                      </button>
                    </div>
                  </div>
                </div>

                {/* Carrito */}
                <CarritoSidebar />
              </div>
            </div>

            <div
              className="col-xl-9 col-lg-8 order-1 order-md-2 wow fadeInUp"
              data-wow-delay=".5s"
            >
              <div className="sort-bar">
                <div className="row g-sm-0 gy-20 justify-content-between align-items-center">
                  <div className="col-md">
                    <p className="woocommerce-result-count">
                      {" "}
                      {isLoading
                        ? "Cargando resultados..."
                        : `${articulos.length} ${
                            articulos.length === 1 ? "resultado" : "resultados"
                          }`}
                    </p>
                  </div>

                  <div className="col-md-auto">
                    <form className="woocommerce-ordering" method="get">
                      <CategoriasSelect
                        value={categoria}
                        onChange={handleCategoriaChange}
                      />
                    </form>
                  </div>
                  <div className="col-md-auto">
                    <ul
                      className="nav nav-pills mb-3"
                      id="pills-tab"
                      role="tablist"
                    >
                      <li className="nav-item" role="presentation">
                        <button
                          className="nav-link active"
                          id="pills-grid-tab"
                          data-bs-toggle="pill"
                          data-bs-target="#pills-grid"
                          type="button"
                          role="tab"
                          aria-controls="pills-grid"
                          aria-selected="true"
                        >
                          <i className="fa-solid fa-grid"></i>
                        </button>
                      </li>
                      <li className="nav-item" role="presentation">
                        <button
                          className="nav-link"
                          id="pills-list-tab"
                          data-bs-toggle="pill"
                          data-bs-target="#pills-list"
                          type="button"
                          role="tab"
                          aria-controls="pills-list"
                          aria-selected="false"
                        >
                          <i className="fa-solid fa-list"></i>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* PRODUCTOS */}
              <div className="tab-content" id="pills-tabContent">
                <div
                  className="tab-pane fade show active"
                  id="pills-grid"
                  role="tabpanel"
                  aria-labelledby="pills-grid-tab"
                  tabIndex="0"
                >
                  <div className="dishes-card-wrap style2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {isLoading ? (
                      <div className="col-12 d-flex flex-column align-items-center justify-content-center text-center py-5 my-4">
                        <div
                          className="spinner-border text-primary mb-3"
                          role="status"
                          style={{ width: "3rem", height: "3rem" }}
                        />
                        <p className="text-secondary fs-5 fw-semibold mb-0">
                          Cargando productos…
                        </p>
                      </div>
                    ) : isError ? (
                      <div className="col-12 d-flex justify-content-center align-items-center text-center py-5 my-4">
                        <div
                          className="alert alert-danger d-flex flex-column flex-sm-row align-items-center justify-content-center gap-2 shadow-sm px-4 py-3"
                          role="alert"
                          style={{ maxWidth: "600px" }}
                        >
                          <i className="bi bi-exclamation-triangle-fill fs-4"></i>
                          <span className="fw-medium">
                            Ocurrió un error al cargar los productos.
                            <span className="text-muted">
                              {" "}
                              Por favor, inténtalo más tarde.
                            </span>
                          </span>
                        </div>
                      </div>
                    ) : articulos.length === 0 ? (
                      <div className="col-12 d-flex flex-column align-items-center justify-content-center text-center py-5 my-4">
                        <div className="alert alert-light border rounded-4 shadow-sm p-4">
                          <i className="bi bi-info-circle text-primary fs-4 mb-2"></i>
                          <p className="fs-5 fw-semibold mb-0">
                            No hay productos disponibles para esta categoría.
                          </p>
                        </div>
                      </div>
                    ) : (
                      articulos.map((producto) => (
                        <ShopCard
                          key={producto.id}
                          producto={producto}
                          onAgregar={handleAgregar}
                          onPersonalizar={handlePersonalizar}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* PAGINACION */}

              <Pagination
                currentPage={currentPage}
                lastPage={lastPage}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <ModalPersonalizar
        className="rounded-10"
        productoId={productoSeleccionado}
        show={mostrarModal}
        onClose={() => setMostrarModal(false)}
        onConfirm={handleConfirmar}
      />

      {/* Modal Crear Pizza */}
      <ModalCrearPizza
        show={mostrarModalCrearPizza}
        onClose={() => setMostrarModalCrearPizza(false)}
      />
    </div>
  );
};

export default Shop1;
