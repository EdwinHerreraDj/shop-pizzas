import PageHero from "../Components/Common/PageHero";
import TrackingPedido from "../Components/Shop/TrackingPedido";

const TrackingPage = () => {
  return (
    <>
      <PageHero
        titulo="Seguir mi pedido"
        subtitulo="Mira en qué punto está tu pizza."
        icono="bi-geo-alt-fill"
      />
      <TrackingPedido />
    </>
  );
};

export default TrackingPage;
