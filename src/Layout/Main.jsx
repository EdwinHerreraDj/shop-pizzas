import { Outlet } from "react-router-dom";
import Header1 from "../Components/Header/Header1";
import Footer1 from "../Components/Footer/Footer1";
import BannerPedidoActivo from "../Components/Shop/BannerPedidoActivo";
import BotonFinalizarPedido from "../Components/Shop/BotonFinalizarPedido";
import CardsInfo from "../Components/Shop/CardsInfo";
import ScrollToTop from "../Components/ScrollToTop";

const Main = () => {
  return (
    <div className="main-page-area bg-color2">
      <ScrollToTop />
      <Header1></Header1>
      <Outlet></Outlet>
      <CardsInfo />
      <Footer1></Footer1>
      <BannerPedidoActivo />
      <BotonFinalizarPedido />
    </div>
  );
};

export default Main;
