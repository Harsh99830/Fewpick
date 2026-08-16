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
  const cartPreviewProducts = cartItems.filter(item => item.quantity > 0).slice(0, 3);

  return (
    <div className="fixed bottom-4 left-4 z-[350] animate-drop-in">
      {/* View Cart Pill */}
      <button
        onClick={() => navigate('/cart')}
        className="bg-amber-500 hover:bg-amber-600 text-white py-1.5 px-3 sm:px-3.5 rounded-full shadow-[0_8px_20px_rgba(245,158,11,0.35)] flex items-center gap-2.5 cursor-pointer border-none transition-all active:scale-[0.97] group"
      >
        <div className="flex items-center gap-2.5">
          {/* Thumbnails stack */}
          <div className="flex items-center -space-x-2 relative">
            {cartPreviewProducts.map((item, index) => (
              <div
                key={item.product.id}
                style={{ zIndex: cartPreviewProducts.length - index }}
                className="w-7 h-7 rounded-full bg-white border border-amber-400 overflow-hidden flex items-center justify-center shadow-xs flex-shrink-0"
              >
                {item.product.image ? (
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[9px] font-bold text-gray-500">
                    {item.product.name?.[0]}
                  </span>
                )}
              </div>
            ))}

            {/* Badge count overlay */}
            <span className="absolute -top-1 -right-0.5 bg-white text-amber-900 text-[0.55rem] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs border border-amber-300 z-30">
              {totalCount}
            </span>
          </div>

          {/* Total price */}
          <div className="flex flex-col text-left leading-none">
            <span className="text-[0.58rem] font-bold text-amber-100 uppercase tracking-wider">Cart Total</span>
            <span className="text-xs font-black text-white">₹{totalPrice}</span>
          </div>
        </div>

        <div className="w-px h-3.5 bg-amber-300/40" />

        <div className="flex items-center gap-1 text-[0.72rem] font-extrabold text-white">
          <span>View</span>
          <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
        </div>
      </button>
    </div>
  );
}
