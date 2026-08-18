import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap } from 'lucide-react';
import ProductCard from './ProductCard';

export default function TenRupeeStorePage({ products = [], cartItems = [], onUpdateQty, orderingEnabled = true, onSelectProduct }) {
  const navigate = useNavigate();

  // Filter all products priced at exactly ₹10
  const tenRupeeItems = products.filter(
    (p) => Number(p.price) === 10
  );

  return (
    <div className="w-full flex flex-col gap-6 animate-drop-in pb-12">
      {/* Top Header & Title */}
      <div className="w-full flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-gray-200 text-gray-700 hover:text-gray-950 hover:bg-gray-50 active:scale-95 transition-all shadow-sm flex-shrink-0 cursor-pointer"
            aria-label="Go back to Home"
          >
            <ArrowLeft className="w-5 h-5 sm:w-5 sm:h-5" />
          </button>
          <div className="flex items-center gap-2 overflow-hidden">
            <h2 className="text-[1.2rem] sm:text-[1.5rem] font-black text-gray-900 m-0 tracking-[-0.02em] truncate">
              ₹10 Super Store
            </h2>
            <span className="bg-amber-100 text-amber-900 text-[0.65rem] sm:text-xs font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-flex items-center gap-1">
              <Zap size={11} className="fill-amber-600 text-amber-600" />
              Budget Store
            </span>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {tenRupeeItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center">
          <span className="text-4xl mb-3">🏷️</span>
          <h3 className="text-base font-bold text-gray-900 mb-1">No ₹10 items available right now</h3>
          <p className="text-xs text-gray-500 mb-4">Check back soon for new arrivals under ₹10.</p>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 bg-gray-900 text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-black transition-all border-none"
          >
            Back to Home
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4">
          {tenRupeeItems.map((product) => (
            <ProductCard
              key={`ten-page-${product.id}`}
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
