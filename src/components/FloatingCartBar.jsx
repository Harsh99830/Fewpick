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

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-24 sm:max-w-[360px] z-[980] animate-drop-in">
      <button
        onClick={() => navigate('/cart')}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-2xl shadow-[0_8px_25px_rgba(16,185,129,0.35)] flex items-center justify-between cursor-pointer border-none transition-all active:scale-[0.98] group"
      >
        {/* Left Side: Items & Total Price */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/80 flex items-center justify-center text-white relative">
            <ShoppingBag size={19} />
            <span className="absolute -top-1 -right-1 bg-white text-emerald-800 text-[0.62rem] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
              {totalCount}
            </span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[0.68rem] text-emerald-100 font-bold uppercase tracking-wider leading-none mb-0.5">
              {totalCount} {totalCount === 1 ? 'item' : 'items'} added
            </span>
            <span className="text-sm font-black leading-tight text-white">
              ₹{totalPrice}
            </span>
          </div>
        </div>

        {/* Right Side: View Cart Action */}
        <div className="flex items-center gap-1 text-xs font-black tracking-wide bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-xl transition-colors">
          <span>View Cart</span>
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </div>
      </button>
    </div>
  );
}
