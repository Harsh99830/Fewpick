import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ProductCard from './ProductCard';
import { categories as fallbackCategories } from '../data/categories';

export default function CategoryPage({ products = [], categories = [], cartItems = [], onUpdateQty, orderingEnabled = true, onSelectProduct }) {
  const { categoryName } = useParams();
  const navigate = useNavigate();

  const decodedName = categoryName ? decodeURIComponent(categoryName) : '';
  const displayCategories = categories.length > 0 ? categories : fallbackCategories;

  // Filter products by category (case-insensitive)
  const categoryProducts = products.filter(
    (p) => p.category && p.category.toLowerCase() === decodedName.toLowerCase()
  );

  return (
    <div className="w-full flex flex-col gap-6 animate-drop-in pb-12">
      {/* Top Header & Categories Scroll Bar */}
      <div className="w-full flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-gray-200 text-gray-700 hover:text-gray-950 hover:bg-gray-50 active:scale-95 transition-all shadow-sm flex-shrink-0 cursor-pointer"
            aria-label="Go back to Home"
          >
            <ArrowLeft className="w-5 h-5 sm:w-5 sm:h-5" />
          </button>
          <div className="flex items-baseline gap-2 overflow-hidden">
            <h2 className="text-[1.1rem] sm:text-[1.35rem] font-extrabold text-gray-900 m-0 tracking-[-0.02em] truncate">
              {decodedName ? decodedName : 'Categories'}
            </h2>
          </div>
        </div>
        <div className="flex flex-nowrap overflow-x-auto gap-2.5 sm:gap-4 pt-2 pb-3 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth w-full">
          {displayCategories.map((cat) => {
            const isSelected = cat.name.toLowerCase() === decodedName.toLowerCase();
            const displayImage = cat.image || cat.emoji;
            const isUrl = displayImage && (displayImage.startsWith('http') || displayImage.startsWith('/') || displayImage.includes('.'));

            return (
              <button
                key={cat.id}
                onClick={() => navigate(`/category/${encodeURIComponent(cat.name)}`, { replace: true })}
                className="flex flex-col items-center gap-1.5 bg-none border-none cursor-pointer p-0.5 transition-transform hover:-translate-y-0.5 flex-shrink-0 w-[68px] sm:w-[84px] group"
              >
                <div
                  className={`w-[60px] h-[60px] md:w-[72px] md:h-[72px] rounded-full flex items-center justify-center transition-all duration-[250ms] overflow-hidden ${
                    isSelected
                      ? 'bg-white border-2 border-gray-950 shadow-[0_0_0_3px_rgba(0,0,0,0.08)] scale-[1.04]'
                      : 'bg-gray-50/80 border border-gray-200 opacity-80 hover:opacity-100 group-hover:border-gray-400 group-hover:scale-[1.04]'
                  }`}
                >
                  {isUrl ? (
                    <img src={displayImage} alt={cat.name} className="w-10/12 h-10/12 object-contain" />
                  ) : (
                    <span className="text-[1.6rem] md:text-[2rem] leading-none">{displayImage || '📦'}</span>
                  )}
                </div>
                <span
                  className={`text-[0.65rem] md:text-[0.72rem] text-center leading-[1.3] ${
                    isSelected ? 'text-gray-950 font-black' : 'text-gray-500 font-bold'
                  }`}
                >
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>



      {/* Products Grid */}
      {categoryProducts.length === 0 ? (
        <div className="py-16 text-center flex flex-col items-center justify-center">
          <div className="text-3xl mb-2 opacity-60">🛒</div>
          <h3 className="text-sm font-extrabold text-gray-800 mb-1">No items found</h3>
          <p className="text-xs text-gray-400 max-w-[280px] m-0">
            There are currently no products registered under <span className="font-semibold text-gray-600">"{decodedName}"</span>.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {categoryProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              cartItems={cartItems}
              onUpdateQty={onUpdateQty}
              orderingEnabled={orderingEnabled}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
}
