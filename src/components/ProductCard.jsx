import { useState } from 'react';
import { Plus, Minus, Star } from 'lucide-react';

const badgeColorMap = {
  orange: 'bg-orange-50 text-orange-700 border border-orange-200',
  yellow: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  red: 'bg-red-50 text-red-700 border border-red-200',
  green: 'bg-green-50 text-green-700 border border-green-200',
  blue: 'bg-blue-50 text-blue-700 border border-blue-200',
  purple: 'bg-purple-50 text-purple-700 border border-purple-200',
};

export default function ProductCard({ product }) {
  const [qty, setQty] = useState(0);

  const handleAdd = () => setQty(1);
  const handleInc = () => setQty((q) => q + 1);
  const handleDec = () => setQty((q) => (q <= 1 ? 0 : q - 1));

  const discountColor = product.discount >= 50 ? 'bg-red-600' : 'bg-orange-600';

  return (
    <article className="bg-white rounded-[14px] sm:rounded-[18px] border-[1.5px] border-[#f1f3f9] overflow-hidden transition-all duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer flex flex-col hover:shadow-[0_12px_40px_rgba(99,102,241,0.12)] hover:border-[#e0e2f0] hover:-translate-y-[3px] group">
      {/* Image */}
      <div className="relative bg-[#f8f9ff] aspect-square flex items-center justify-center overflow-hidden p-2.5 sm:p-4">
        {product.discount > 0 && (
          <span className={`absolute top-2.5 left-2.5 text-[0.65rem] font-extrabold py-[3px] px-2 rounded-md tracking-[0.02em] text-white ${discountColor}`}>
            {product.discount}% OFF
          </span>
        )}
        {product.badge && (
          <span className={`absolute bottom-2.5 left-2.5 text-[0.6rem] font-bold py-[3px] px-2 rounded-full tracking-[0.02em] ${badgeColorMap[product.badgeColor] || ''}`}>
            {product.badge}
          </span>
        )}
        <img
          src={product.image}
          alt={product.name}
          className="w-3/4 h-3/4 object-contain transition-transform duration-[350ms] ease-in-out group-hover:scale-110"
          loading="lazy"
        />
      </div>

      {/* Info */}
      <div className="py-2 px-2.5 sm:py-3.5 sm:px-3.5 flex flex-col flex-1">
        <div className="flex items-center gap-[3px] mb-[5px]">
          <Star size={11} className="text-amber-500 fill-amber-500" />
          <span className="text-[0.72rem] font-bold text-gray-700">{product.rating}</span>
          <span className="text-[0.65rem] text-gray-400">({(product.reviews / 1000).toFixed(1)}k)</span>
        </div>

        <h3 className="text-[0.75rem] sm:text-[0.82rem] font-bold text-gray-900 mb-0.5 leading-[1.35]">{product.name}</h3>
        <p className="text-[0.72rem] text-gray-400 mb-2.5">{product.weight}</p>

        <div className="flex items-baseline gap-1.5 flex-wrap mb-3">
          <span className="text-[0.95rem] sm:text-[1.1rem] font-extrabold text-gray-900">₹{product.price}</span>
          <span className="text-xs text-gray-300 line-through">₹{product.mrp}</span>
          <span className="text-[0.65rem] text-green-600 font-bold bg-green-50 py-px px-[5px] rounded">Save ₹{product.mrp - product.price}</span>
        </div>

        {/* Add to cart */}
        {qty === 0 ? (
          <button
            className="w-full py-[7px] sm:py-[9px] border-2 border-green-600 rounded-[10px] bg-transparent text-green-600 text-[0.75rem] sm:text-[0.82rem] font-extrabold cursor-pointer flex items-center justify-center gap-[5px] transition-all hover:bg-green-600 hover:text-white mt-auto"
            onClick={handleAdd}
          >
            <Plus size={16} />
            Add
          </button>
        ) : (
          <div className="flex items-center border-2 border-green-600 rounded-[10px] overflow-hidden mt-auto">
            <button className="flex-1 py-[9px] bg-green-600 text-white border-none cursor-pointer flex items-center justify-center transition-colors hover:bg-green-700" onClick={handleDec}>
              <Minus size={14} />
            </button>
            <span className="flex-1 text-center text-[0.9rem] font-extrabold text-green-600">{qty}</span>
            <button className="flex-1 py-[9px] bg-green-600 text-white border-none cursor-pointer flex items-center justify-center transition-colors hover:bg-green-700" onClick={handleInc}>
              <Plus size={14} />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
