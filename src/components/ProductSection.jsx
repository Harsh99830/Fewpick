import ProductCard from './ProductCard';

export default function ProductSection({ products = [], cartItems = [], onUpdateQty, orderingEnabled = true, onSelectProduct }) {
  // Filter items marked as featured, or items with badges/category 'Featured'
  const featuredProducts = products.filter(
    (p) => p.is_featured === true || p.featured === true || Boolean(p.badge) || p.category === 'Featured'
  );

  // If no products have badges/flags, display the first 4 products as featured
  const featuredList = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 4);

  return (
    <div className="flex flex-col gap-6 sm:gap-10">
      {/* Featured Products Section */}
      {featuredList.length > 0 && (
        <section className="py-1 sm:py-2">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h2 className="text-[1.35rem] font-extrabold text-gray-900 m-0 tracking-[-0.02em]">
              Featured Products
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {featuredList.map((product) => (
              <ProductCard 
                key={`featured-${product.id}`} 
                product={product} 
                cartItems={cartItems}
                onUpdateQty={onUpdateQty}
                orderingEnabled={orderingEnabled}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        </section>
      )}

      {/* All Products Section */}
      {products.length > 0 && (
        <section className="py-1 sm:py-2">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h2 className="text-[1.35rem] font-extrabold text-gray-900 m-0 tracking-[-0.02em]">
              All Products
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product) => (
              <ProductCard 
                key={`all-${product.id}`} 
                product={product} 
                cartItems={cartItems}
                onUpdateQty={onUpdateQty}
                orderingEnabled={orderingEnabled}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
