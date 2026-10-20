import PageHero from "../Components/Common/PageHero";
import Checkout from "../Components/Shop/Checkout";

const CheckoutPage = () => {
    return (
        <div>
            <PageHero
                titulo="Finalizar pedido"
                subtitulo="Ya casi está: solo faltan tus datos."
                icono="bi-bag-check-fill"
                migas={[{ to: "/shop/cart", texto: "Tu carrito" }]}
            />
            <Checkout></Checkout>
        </div>
    );
};

export default CheckoutPage;
