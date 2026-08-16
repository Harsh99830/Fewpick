import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function FloatingCartBar({ cartItems = [] }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Calculate total item count & total price
  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  // Hide floating cart on Cart page or Admin HQ page or if cart is empty
  if (totalCount === 0 || ['/cart', '/hq'].includes(location.pathname)) {
    return null;
  }

  // Get unique products with images currently in cart (max 3 stacked preview images)
  const cartPreviewProducts = cartItems.filter(item => item.quantity > 0 && item.product?.image).slice(0, 3);

  return (
    <div className="fixed bottom-4 left-4 z-[980] animate-drop-in">
      {/* View Cart Pill */}
      <button
        onClick={() => navigate('/cart')}
        className="bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-3 sm:px-3.5 rounded-full shadow-[0_8px_20px_rgba(16,185,129,0.35)] flex items-center gap-2.5 cursor-pointer border-none transition-all active:scale-[0.97] group"
      >
        <div className="flex items-center gap-1.5">
          {/* Overlapping Product Thumbnails Container */}
          <div className="flex items-center -space-x-2 relative pr-1.5">
            {cartPreviewProducts.length > 0 ? (
              cartPreviewProducts.map((item, idx) => (
                <div
                  key={item.product.id}
                  className="w-7 h-7 rounded-full bg-white border border-emerald-500 overflow-hidden flex items-center justify-center shadow-xs flex-shrink-0"
                  style={{ zIndex: 10 - idx }}
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-contain p-0.5"
                  />
                </div>
              ))
            ) : (
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white">
                <ShoppingBag size={13} />
              </div>
            )}
            <span className="absolute -top-1 -right-0.5 bg-white text-emerald-800 text-[0.55rem] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs border border-emerald-200 z-30">
              {totalCount}
            </span>
          </div>

          <span className="text-xs font-black text-white ml-0.5">
            ₹{totalPrice}
          </span>
        </div>

        <div className="w-px h-3.5 bg-emerald-400/40" />

        <div className="flex items-center gap-1 text-[0.72rem] font-extrabold text-white">
          <span>View Cart</span>
          <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
        </div>
      </button>
    </div>
  );
}
