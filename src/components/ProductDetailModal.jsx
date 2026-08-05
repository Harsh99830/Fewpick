import { X, Plus, Minus } from 'lucide-react';

export default function ProductDetailModal({ product, onClose, cartItems = [], onUpdateQty }) {
  if (!product) return null;

  const cartItem = cartItems.find((item) => item.product.id === product.id);
  const qty = cartItem ? cartItem.quantity : 0;

  const handleAdd = () => onUpdateQty(product.id, 1);
  const handleInc = () => onUpdateQty(product.id, qty + 1);
  const handleDec = () => onUpdateQty(product.id, qty - 1);

  return (
    <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />

      <div className="relative bg-white w-full max-w-[440px] rounded-3xl shadow-2xl overflow-hidden z-10 animate-drop-in border border-gray-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-all border-none cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Product Image */}
        <div className="relative bg-[#f8f9ff] aspect-square flex items-center justify-center p-8 overflow-hidden border-b border-gray-100">
          {product.discount > 0 && (
            <span className="absolute top-4 left-4 bg-orange-600 text-white text-xs font-extrabold px-2.5 py-1 rounded-lg">
              {product.discount}% OFF
            </span>
          )}
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="max-w-[80%] max-h-[80%] object-contain"
            />
          ) : (
            <div className="text-6xl">📦</div>
          )}
        </div>

        {/* Product Details */}
        <div className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md self-start">
              {product.category || 'General'}
            </span>
            <h2 className="text-lg font-extrabold text-gray-900 mt-1 leading-snug">
              {product.name}
            </h2>
            <p className="text-xs text-gray-400 font-semibold m-0">
              {product.weight}
            </p>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">₹{product.price}</span>
            {product.mrp && product.mrp > product.price && (
              <>
                <span className="text-sm text-gray-300 line-through">₹{product.mrp}</span>
                <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-md">
                  Save ₹{product.mrp - product.price}
                </span>
              </>
            )}
          </div>

          {/* Add to Cart Controls */}
          <div className="pt-2">
            {qty === 0 ? (
              <button
                onClick={handleAdd}
                className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white text-sm font-extrabold rounded-2xl transition-all shadow-[0_4px_16px_rgba(22,163,74,0.25)] hover:-translate-y-px active:translate-y-0 cursor-pointer border-none flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Add to Cart
              </button>
            ) : (
              <div className="flex items-center border-2 border-green-600 rounded-2xl overflow-hidden">
                <button
                  onClick={handleDec}
                  className="flex-1 py-3.5 bg-green-600 text-white border-none cursor-pointer flex items-center justify-center transition-colors hover:bg-green-700"
                >
                  <Minus size={18} />
                </button>
                <span className="flex-1 text-center text-base font-black text-green-600">
                  {qty} in cart
                </span>
                <button
                  onClick={handleInc}
                  className="flex-1 py-3.5 bg-green-600 text-white border-none cursor-pointer flex items-center justify-center transition-colors hover:bg-green-700"
                >
                  <Plus size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
