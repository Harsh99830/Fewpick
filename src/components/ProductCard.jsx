import { Plus, Minus } from 'lucide-react';

const badgeColorMap = {
  orange: 'bg-orange-50 text-orange-700 border border-orange-200',
  yellow: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  red: 'bg-red-50 text-red-700 border border-red-200',
  green: 'bg-green-50 text-green-700 border border-green-200',
  blue: 'bg-blue-50 text-blue-700 border border-blue-200',
  purple: 'bg-purple-50 text-purple-700 border border-purple-200',
};

export default function ProductCard({ product, cartItems = [], onUpdateQty, onSelectProduct }) {
  const cartItem = cartItems.find((item) => item.product.id === product.id);
  const qty = cartItem ? cartItem.quantity : 0;

  const handleAdd = (e) => {
    e.stopPropagation();
    onUpdateQty(product.id, 1);
  };
  const handleInc = (e) => {
    e.stopPropagation();
    onUpdateQty(product.id, qty + 1);
  };
  const handleDec = (e) => {
    e.stopPropagation();
    onUpdateQty(product.id, qty - 1);
  };

  const discountColor = product.discount >= 50 ? 'bg-red-600' : 'bg-orange-600';

  return (
    <article
      onClick={() => onSelectProduct && onSelectProduct(product)}
      className="bg-white rounded-xl sm:rounded-2xl border border-[#e8eaf0] overflow-hidden transition-all duration-200 cursor-pointer flex flex-col hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-gray-300 hover:-translate-y-0.5 group h-full"
    >
      {/* Product Image Container */}
      <div className="relative bg-[#f8f9ff] h-[100px] min-[380px]:h-[115px] sm:h-[145px] w-full flex items-center justify-center overflow-hidden p-1.5 sm:p-2 flex-shrink-0">
        {product.discount > 0 && (
          <span className={`absolute top-1.5 left-1.5 text-[0.55rem] sm:text-[0.62rem] font-black py-0.5 px-1 sm:px-1.5 rounded tracking-tight text-white z-10 ${discountColor}`}>
            {product.discount}% OFF
          </span>
        )}

        {product.badge && (
          <span className={`absolute top-1.5 right-1.5 text-[0.52rem] sm:text-[0.58rem] font-bold py-0.5 px-1 sm:px-1.5 rounded-full tracking-tight z-10 ${badgeColorMap[product.badgeColor] || ''}`}>
            {product.badge}
          </span>
        )}

        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain scale-105 transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />
      </div>

      {/* Info Content */}
      <div className="p-2 sm:p-2.5 flex flex-col flex-1 justify-between gap-1.5">
        <div>
          <h3 className="text-[0.74rem] sm:text-[0.82rem] font-bold text-gray-900 mb-0.5 leading-snug line-clamp-2 min-h-[2.2em]">
            {product.name}
          </h3>
        </div>

        {/* Price, Store Description & ADD Button section */}
        <div className="mt-auto flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-1">
            <div className="flex items-baseline gap-1">
              <span className="text-[0.9rem] sm:text-[1rem] font-black text-gray-900">₹{product.price}</span>
              {product.mrp > product.price && (
                <span className="text-[0.62rem] text-gray-400 line-through">₹{product.mrp}</span>
              )}
            </div>
            <span className="text-[0.63rem] sm:text-[0.68rem] text-gray-400 font-semibold">{product.weight}</span>
          </div>

          {/* Shop Description Line (placed between price and ADD button) */}
          {!product.isShopClosed && product.shopDescription && (
            <p className="text-[0.54rem] sm:text-[0.58rem] text-amber-700 font-semibold leading-tight line-clamp-1 m-0 opacity-90">
              {product.shopDescription}
            </p>
          )}

          {/* Action Button Section */}
          <div>
            {product.isShopClosed ? (
              <div className="w-full h-[30px] border border-slate-200 rounded-lg bg-slate-50 text-slate-600 text-[0.62rem] font-bold text-center cursor-not-allowed flex items-center justify-center">
                Closed
              </div>
            ) : (product.isOutOfStock || product.Stock === 0 || product.Stock === '0' || product.stock === 0) ? (
              <div className="w-full h-[30px] border border-gray-200 rounded-lg bg-gray-100 text-gray-400 text-[0.62rem] font-bold text-center cursor-not-allowed flex items-center justify-center">
                Out of stock
              </div>
            ) : qty === 0 ? (
              <button
                className="w-full h-[30px] border border-amber-500 rounded-lg bg-amber-50/50 hover:bg-amber-500 text-amber-700 hover:text-white text-[0.72rem] sm:text-xs font-black cursor-pointer flex items-center justify-center gap-1 transition-all active:scale-[0.98]"
                onClick={handleAdd}
              >
                <Plus size={13} />
                <span>ADD</span>
              </button>
            ) : (
              <div className="w-full h-[30px] flex items-center border border-amber-500 rounded-lg overflow-hidden bg-white">
                <button className="flex-1 h-full bg-amber-500 text-white border-none cursor-pointer flex items-center justify-center hover:bg-amber-600 transition-colors" onClick={handleDec}>
                  <Minus size={13} />
                </button>
                <span className="flex-1 text-center text-[0.75rem] font-extrabold text-amber-700 select-none">{qty}</span>
                <button className="flex-1 h-full bg-amber-500 text-white border-none cursor-pointer flex items-center justify-center hover:bg-amber-600 transition-colors" onClick={handleInc}>
                  <Plus size={13} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
