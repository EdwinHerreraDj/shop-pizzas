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

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/shop",
        element: <ShopPage />,
      },
      {
        path: "/shop-list",
        element: <ShopListPage />,
      },
      {
        path: "/shop-list-right",
        element: <ShopListRightPage />,
      },
      {
        path: "/shop/shop-details",
        element: <ShopDetailsPage />,
      },
      {
        path: "/shop/cart",
        element: <CartPage />,
      },
      {
        path: "/shop/checkout",
        element: <CheckoutPage />,
      },
      {
        path: "/shop/wishlist",
        element: <WishlistPage />,
      },

      {
        path: "/pedido/:codigo",
        element: <TrackingPage />,
      },
      {
        path: "/pedido",
        element: <TrackingPage />,
      },
    ],
  },
]);
