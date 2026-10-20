import PageHero from "../Components/Common/PageHero";
import Cart from "../Components/Shop/Cart";

const CartPage = () => {
    return (
        <div>
            <PageHero
                titulo="Tu carrito"
                subtitulo="Revisa tu pedido antes de terminar."
                icono="bi-basket2-fill"
                migas={[{ to: "/shop", texto: "Nuestra carta" }]}
            />
            <Cart></Cart>
        </div>
    );
};

export default CartPage;
