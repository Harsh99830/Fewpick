import ProductCard from './ProductCard';

export default function ProductSection({ products, cartItems, onUpdateQty, orderingEnabled = true }) {
  return (
    <section className="py-1 sm:py-2">
      <div className="grid grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            cartItems={cartItems}
            onUpdateQty={onUpdateQty}
            orderingEnabled={orderingEnabled}
          />
        ))}
      </div>
    </section>
  );
}
