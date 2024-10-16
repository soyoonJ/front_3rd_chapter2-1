import { CartItems, CartTotalPrice, ProductSelect, StockStatus, Title } from '../components';
import { useAlertDiscount } from '../hooks';

const CartPage = () => {
  useAlertDiscount();

  return (
    <main className="bg-gray-100 p-8">
      <section className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
        <Title />

        <CartItems />
        <CartTotalPrice />

        <ProductSelect />
        <StockStatus />
      </section>
    </main>
  );
};

export default CartPage;
