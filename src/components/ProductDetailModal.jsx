import { useState, useEffect } from 'react';
import { X, Plus, Minus, Package } from 'lucide-react';

export default function ProductDetailModal({ product, onClose, cartItems = [], onUpdateQty, products = [] }) {
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedVariantId(product.id);
    }
  }, [product]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (product) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [product]);

  if (!product) return null;

  const baseName = product.name.trim().toLowerCase();
  const matchingVariants = products.filter(
    (p) => p.name && p.name.trim().toLowerCase() === baseName
  );

  // Clicked item comes first, followed by remaining variants sorted by ascending price
  const clickedItem = matchingVariants.find((p) => p.id === product.id) || product;
  const otherVariants = matchingVariants
    .filter((p) => p.id !== product.id)
    .sort((a, b) => a.price - b.price);
  const variants = matchingVariants.length > 0 ? [clickedItem, ...otherVariants] : [product];

  // Active product variant selected inside the modal
  const activeProduct = variants.find((v) => v.id === selectedVariantId) || product;

  const cartItem = cartItems.find((item) => item.product.id === activeProduct.id);
  const qty = cartItem ? cartItem.quantity : 0;

  const handleAdd = () => onUpdateQty(activeProduct.id, 1);
  const handleInc = () => onUpdateQty(activeProduct.id, qty + 1);
  const handleDec = () => onUpdateQty(activeProduct.id, qty - 1);

  return (
    <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-[420px] rounded-3xl shadow-2xl overflow-hidden z-10 animate-drop-in border border-gray-100 flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-all border-none cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Product Image Header */}
        <div className="relative bg-[#f8f9ff] aspect-[4/3] flex items-center justify-center p-3 sm:p-4 overflow-hidden border-b border-gray-100 flex-shrink-0">
          {activeProduct.discount > 0 && (
            <span className="absolute top-4 left-4 bg-orange-600 text-white text-[0.65rem] font-extrabold px-2.5 py-1 rounded-md shadow-sm z-10">
              {activeProduct.discount}% OFF
            </span>
          )}
          {activeProduct.image && !imgError ? (
            <img
              src={activeProduct.image}
              alt={activeProduct.name}
              className="w-full h-full object-contain scale-105 transition-all duration-300"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-300 gap-1">
              <Package size={54} strokeWidth={1.5} />
            </div>
          )}
        </div>

        {/* Product Details & Compact Horizontal Variant Selector */}
        <div className="px-6 py-5 sm:px-7 sm:py-6 flex flex-col gap-3.5">
          <div className="flex flex-col gap-0.5 px-0.5">
            {activeProduct.category && (
              <span className="text-xs font-semibold text-gray-400 capitalize">
                {activeProduct.category}
              </span>
            )}
            <h2 className="text-base font-extrabold text-gray-900 leading-snug">
              {activeProduct.name}
            </h2>
            <p className="text-xs text-gray-400 font-semibold m-0">
              {activeProduct.weight || 'Standard Pack'}
            </p>
          </div>

          {/* Active Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-gray-900">₹{activeProduct.price}</span>
            {activeProduct.mrp > activeProduct.price && (
              <>
                <span className="text-xs text-gray-300 line-through">₹{activeProduct.mrp}</span>
                <span className="text-[0.65rem] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                  Save ₹{activeProduct.mrp - activeProduct.price}
                </span>
              </>
            )}
          </div>

          {/* Clean Horizontal Pack Size Pills */}
          {variants.length > 1 && (
            <div className="flex flex-col gap-1.5 pt-1 border-t border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Select Pack Size
              </span>
              <div className="flex flex-nowrap overflow-x-auto gap-2 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth w-full">
                {variants.map((v) => {
                  const isSelected = v.id === activeProduct.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`flex flex-col items-center justify-center px-3.5 py-1.5 rounded-xl text-left flex-shrink-0 cursor-pointer transition-all ${isSelected
                          ? 'border-2 border-gray-900 bg-white shadow-sm'
                          : 'border border-gray-200 bg-gray-50/70 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                        }`}
                    >
                      <span className={`text-[0.72rem] font-bold ${isSelected ? 'text-gray-950 font-black' : 'text-gray-900'}`}>
                        {v.weight || v.name}
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className={`text-[0.72rem] font-black ${isSelected ? 'text-gray-950' : 'text-gray-900'}`}>
                          ₹{v.price}
                        </span>
                        {v.mrp > v.price && (
                          <span className={`text-[0.6rem] line-through ${isSelected ? 'text-gray-400' : 'text-gray-400'}`}>
                            ₹{v.mrp}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Shop Description Line (Shown only when store is OPEN) */}
          {!activeProduct.isShopClosed && activeProduct.shopDescription && (
            <p className="text-xs text-amber-700 font-semibold m-0 leading-snug">
              {activeProduct.shopDescription}
            </p>
          )}

          {/* Add to Cart Controls */}
          <div className="pt-1">
            {activeProduct.isShopClosed ? (
              <div className="w-full py-3 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl text-center cursor-not-allowed select-none flex items-center justify-center">
                <span>Unavailable after {activeProduct.availableTill || '11 p.m.'}</span>
              </div>
            ) : (activeProduct.isOutOfStock || activeProduct.Stock === 0 || activeProduct.Stock === '0' || activeProduct.stock === 0) ? (
              <div className="w-full py-3 bg-gray-100 border border-gray-200 text-gray-400 text-xs font-black rounded-xl text-center cursor-not-allowed select-none">
                Out of Stock
              </div>
            ) : qty === 0 ? (
              <button
                onClick={handleAdd}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold rounded-xl transition-all shadow-[0_4px_14px_rgba(245,158,11,0.25)] hover:-translate-y-px active:translate-y-0 cursor-pointer border-none flex items-center justify-center gap-1.5"
              >
                <Plus size={16} />
                Add to Cart
              </button>
            ) : (
              <div className="flex items-center border-2 border-amber-500 rounded-xl overflow-hidden">
                <button
                  onClick={handleDec}
                  className="flex-1 py-3 bg-amber-500 text-white border-none cursor-pointer flex items-center justify-center transition-colors hover:bg-amber-600"
                >
                  <Minus size={16} />
                </button>
                <span className="flex-1 text-center text-sm font-black text-amber-600">
                  {qty}
                </span>
                <button
                  onClick={handleInc}
                  className="flex-1 py-3 bg-amber-500 text-white border-none cursor-pointer flex items-center justify-center transition-colors hover:bg-amber-600"
                >
                  <Plus size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
