import { Outlet } from "react-router-dom";
import Header1 from "../Components/Header/Header1";
import Footer1 from "../Components/Footer/Footer1";
import BannerPedidoActivo from "../Components/Shop/BannerPedidoActivo";

const Main = () => {
  return (
    <div className="main-page-area bg-color2">
      <Header1></Header1>
      <Outlet></Outlet>
      <Footer1></Footer1>
      <BannerPedidoActivo />
    </div>
  );
};

export default Main;
