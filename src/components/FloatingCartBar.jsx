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
        className="bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 sm:px-4 rounded-full shadow-[0_8px_25px_rgba(217,119,6,0.4)] flex items-center gap-3 cursor-pointer border border-amber-500/30 transition-all active:scale-[0.97] group"
      >
        <div className="flex items-center gap-3">
          {/* Thumbnails stack */}
          <div className="flex items-center -space-x-2 relative">
            {cartPreviewProducts.map((item, index) => (
              <div
                key={item.product.id}
                style={{ zIndex: cartPreviewProducts.length - index }}
                className="w-7 h-7 rounded-full bg-white border-2 border-amber-500 overflow-hidden flex items-center justify-center shadow-xs flex-shrink-0"
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
            <span className="absolute -top-1 -right-1 bg-amber-950 text-white text-[0.55rem] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm border-2 border-white z-30">
              {totalCount}
            </span>
          </div>

          {/* Total price */}
          <div className="flex flex-col text-left leading-tight">
            <span className="text-[0.62rem] font-black text-amber-200 uppercase tracking-widest">CART TOTAL</span>
            <span className="text-sm font-black text-white drop-shadow-xs">₹{totalPrice}</span>
          </div>
        </div>

        <div className="w-px h-4 bg-amber-400/40 mx-0.5" />

        <div className="flex items-center gap-1.5 text-xs font-black text-white tracking-wide">
          <span>View</span>
          <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
        </div>
      </button>
    </div>
  );
}
