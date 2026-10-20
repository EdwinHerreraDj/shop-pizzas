import PageHero from "../Components/Common/PageHero";
import Shop1 from "../Components/Shop/Shop";

const ShopPage = () => {
    return (
        <div>
            <PageHero
                titulo="Nuestra carta"
                subtitulo="Elige tu favorita o crea la tuya a tu manera."
                icono="bi-book-half"
            />
            <Shop1></Shop1>
        </div>
    );
};

export default ShopPage;
