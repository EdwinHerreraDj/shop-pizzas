import { createBrowserRouter } from "react-router-dom";
import Main from "../Layout/Main";
import Home from "../Pages/Home";
import ShopPage from "../Pages/ShopPage";
import ShopListPage from "../Pages/ShopListPage";
import ShopListRightPage from "../Pages/ShopListRightPage";
import ShopDetailsPage from "../Pages/ShopDetailsPage";
import CartPage from "../Pages/CartPage";
import CheckoutPage from "../Pages/CheckoutPage";
import WishlistPage from "../Pages/WishlistPage";
import TrackingPage from "../Pages/TrackingPage";
import PaginaLegalPage from "../Pages/PaginaLegalPage";
import PagoOkPage from "../Pages/PagoOkPage";
import PagoErrorPage from "../Pages/PagoErrorPage";
import ContactoPage from "../Pages/ContactoPage";
import TiendaGuard from "../Components/Shop/TiendaGuard";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
    children: [
      {
        index: true,
        element: (
          <TiendaGuard>
            <Home />
          </TiendaGuard>
        ),
      },
      {
        path: "/shop",
        element: (
          <TiendaGuard>
            <ShopPage />
          </TiendaGuard>
        ),
      },
      {
        path: "/shop-list",
        element: (
          <TiendaGuard>
            <ShopListPage />
          </TiendaGuard>
        ),
      },
      {
        path: "/shop-list-right",
        element: (
          <TiendaGuard>
            <ShopListRightPage />
          </TiendaGuard>
        ),
      },
      {
        path: "/shop/shop-details",
        element: (
          <TiendaGuard>
            <ShopDetailsPage />
          </TiendaGuard>
        ),
      },
      {
        path: "/shop/cart",
        element: (
          <TiendaGuard>
            <CartPage />
          </TiendaGuard>
        ),
      },
      {
        path: "/shop/checkout",
        element: (
          <TiendaGuard>
            <CheckoutPage />
          </TiendaGuard>
        ),
      },
      {
        path: "/shop/wishlist",
        element: (
          <TiendaGuard>
            <WishlistPage />
          </TiendaGuard>
        ),
      },

      {
        path: "/pedido/:codigo",
        element: <TrackingPage />,
      },
      {
        path: "/pedido",
        element: <TrackingPage />,
      },

      // Páginas legales dinámicas (términos, privacidad, cookies, etc.)
      // Accesibles aunque la tienda esté cerrada
      {
        path: "/legal/:slug",
        element: <PaginaLegalPage />,
      },

      // Retornos de pago de Redsys (nunca bloqueadas por TiendaGuard)
      {
        path: "/pago/ok",
        element: <PagoOkPage />,
      },
      {
        path: "/pago/error",
        element: <PagoErrorPage />,
      },

      // Página de contacto (accesible siempre)
      {
        path: "/contacto",
        element: <ContactoPage />,
      },
    ],
  },
]);
