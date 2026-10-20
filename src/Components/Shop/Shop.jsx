import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import ShopCard from "../Card/ShopCard";
import useShop from "../../hooks/useShop";
import CategoriasSelect from "./CategoriaSelect";
import Pagination from "./Pagination";
import ModalCrearPizza from "../ShopDetails/ModalCrearPizza";
import ModalPersonalizar from "../ShopDetails/ModalPersonalizar";
import CarritoSidebar from "../Carrito/CarritoSidebar";
import ErrorCarga from "./ErrorCarga";
import { PizzaDibujo } from "../PizzaBuilder/ui";
import "../../assets/crear-pizza.css";

const Shop1 = () => {
  const {
    categoria,
    articulos,
    currentPage,
    lastPage,
    isLoading,
    isError,
    error,
    refetch,
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
                <div className="lateral-crea mb-4">
                  <div className="lateral-crea-dibujos" aria-hidden="true">
                    <PizzaDibujo tipo="entera" size={64} />
                    <PizzaDibujo tipo="mitades" size={64} />
                  </div>
                  <span className="lateral-etiqueta">
                    <i className="bi bi-magic me-1" />
                    A tu manera
                  </span>
                  <h3 className="lateral-crea-titulo">Crea tu pizza</h3>
                  <p className="lateral-crea-texto">
                    Desde cero o mitad y mitad: tú eliges los ingredientes y
                    los sabores.
                  </p>
                  <button
                    type="button"
                    className="lateral-crea-btn"
                    onClick={() => setMostrarModalCrearPizza(true)}
                  >
                    <i className="bi bi-plus-circle-fill" />
                    Crear mi pizza
                  </button>
                </div>

                {/* Carrito */}
                <CarritoSidebar />
              </div>
            </div>

            <div
              className="col-xl-9 col-lg-8 order-1 order-md-2 wow fadeInUp"
              data-wow-delay=".5s"
            >
              <div className="carta-filtros">
                <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                  <h2 className="carta-filtros-titulo">
                    <i className="bi bi-funnel-fill me-2" style={{ color: "#fc791a" }} />
                    ¿Qué te apetece?
                  </h2>
                  <span className="carta-resultados">
                    {isLoading
                      ? "Cargando…"
                      : `${articulos.length} ${articulos.length === 1 ? "producto" : "productos"}`}
                  </span>
                </div>
                <CategoriasSelect value={categoria} onChange={handleCategoriaChange} />
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
                      <div
                        className="col-12 d-flex justify-content-center align-items-center py-5 my-4"
                        style={{ gridColumn: "1 / -1" }}
                      >
                        <div className="shadow-sm" style={{ width: "100%", maxWidth: "640px" }}>
                          <ErrorCarga error={error} onReintentar={refetch} que="los productos" />
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
