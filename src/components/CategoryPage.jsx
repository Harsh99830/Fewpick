import { useParams, useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';

export default function CategoryPage({ products = [], cartItems = [], onUpdateQty, orderingEnabled = true }) {
  const { categoryName } = useParams();
  const navigate = useNavigate();

  const decodedName = categoryName ? decodeURIComponent(categoryName) : '';

  // Filter products by category (case-insensitive)
  const categoryProducts = products.filter(
    p => p.category && p.category.toLowerCase() === decodedName.toLowerCase()
  );

  return (
    <div className="w-full flex flex-col gap-6 animate-drop-in pb-12">
      {/* Products Grid */}
      {categoryProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-150 p-12 text-center flex flex-col items-center justify-center animate-fade-in">
          <div className="text-4xl mb-3">🛒</div>
          <h3 className="text-base font-extrabold text-gray-800 mb-1">No items found</h3>
          <p className="text-xs text-gray-400 max-w-[300px] mb-6">
            There are currently no products registered under <span className="font-bold text-gray-700">"{decodedName}"</span>.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer border-none"
          >
            Explore Other Categories
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {categoryProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              cartItems={cartItems}
              onUpdateQty={onUpdateQty}
              orderingEnabled={orderingEnabled}
            />
          ))}
        </div>
      )}
    </div>
  );
}
