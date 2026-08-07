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
      className="bg-white rounded-xl sm:rounded-2xl border border-[#e8eaf0] overflow-hidden transition-all duration-200 cursor-pointer flex flex-col hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-gray-300 hover:-translate-y-0.5 group"
    >
      {/* Balanced Image Container */}
      <div className="relative bg-[#f8f9ff] h-[125px] sm:h-[145px] w-full flex items-center justify-center overflow-hidden p-2 sm:p-3">
        {product.discount > 0 && (
          <span className={`absolute top-2 left-2 text-[0.62rem] font-black py-0.5 px-1.5 rounded tracking-tight text-white z-10 ${discountColor}`}>
            {product.discount}% OFF
          </span>
        )}
        {product.badge && (
          <span className={`absolute bottom-2 left-2 text-[0.58rem] font-bold py-0.5 px-1.5 rounded-full tracking-tight z-10 ${badgeColorMap[product.badgeColor] || ''}`}>
            {product.badge}
          </span>
        )}
        <img
          src={product.image}
          alt={product.name}
          className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Info Content */}
      <div className="p-2.5 sm:p-3 flex flex-col flex-1">
        <h3 className="text-[0.76rem] sm:text-[0.82rem] font-bold text-gray-900 mb-0.5 leading-snug line-clamp-2">
          {product.name}
        </h3>
        <p className="text-[0.68rem] text-gray-400 font-medium mb-1.5">{product.weight}</p>

        <div className="flex items-baseline gap-1 flex-wrap mb-2">
          <span className="text-[0.9rem] sm:text-[1rem] font-black text-gray-900">₹{product.price}</span>
          {product.mrp > product.price && (
            <>
              <span className="text-[0.65rem] text-gray-300 line-through">₹{product.mrp}</span>
              <span className="text-[0.6rem] text-green-600 font-bold bg-green-50 px-1 py-0.5 rounded">
                Save ₹{product.mrp - product.price}
              </span>
            </>
          )}
        </div>

        {/* Balanced Add Button */}
        {qty === 0 ? (
          <button
            className="w-full py-1.5 sm:py-2 border border-green-600 rounded-lg bg-transparent text-green-600 text-xs font-extrabold cursor-pointer flex items-center justify-center gap-1 transition-all hover:bg-green-600 hover:text-white mt-auto"
            onClick={handleAdd}
          >
            <Plus size={14} />
            Add
          </button>
        ) : (
          <div className="flex items-center border border-green-600 rounded-lg overflow-hidden mt-auto">
            <button className="flex-1 py-1.5 sm:py-2 bg-green-600 text-white border-none cursor-pointer flex items-center justify-center transition-colors hover:bg-green-700" onClick={handleDec}>
              <Minus size={13} />
            </button>
            <span className="flex-1 text-center text-xs font-extrabold text-green-600">{qty}</span>
            <button className="flex-1 py-1.5 sm:py-2 bg-green-600 text-white border-none cursor-pointer flex items-center justify-center transition-colors hover:bg-green-700" onClick={handleInc}>
              <Plus size={13} />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
