import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import ProductCard from './ProductCard';

export default function TenRupeeStore({ products = [], cartItems = [], onUpdateQty, orderingEnabled = true, onSelectProduct }) {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Filter available products priced at exactly ₹10 (exclude out of stock & closed shop items)
  const tenRupeeItems = products.filter((p) => {
    const isPriceTen = Number(p.price) === 10;
    const isOut = Boolean(p.isOutOfStock || p.isShopClosed || p.isItemStockZero || p.Stock === 0 || p.Stock === '0' || p.stock === 0);
    return isPriceTen && !isOut;
  });

  // Show only first 10 items in home section
  const displayItems = tenRupeeItems.slice(0, 10);
  const hasMore = tenRupeeItems.length > 10;

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [displayItems]);

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = direction === 'left' ? -320 : 320;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  if (tenRupeeItems.length === 0) return null;

  return (
    <section className="pt-0 pb-1.5 sm:pb-2.5">
      {/* Orange Container Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 text-white shadow-[0_8px_30px_rgba(245,158,11,0.25)] relative overflow-hidden">
        
        {/* Section Header Bar */}
        <div className="flex items-center justify-between mb-3 sm:mb-4 relative z-10">
          <div className="flex flex-col">
            <h2 className="text-base sm:text-xl font-extrabold tracking-tight text-white m-0 uppercase drop-shadow-xs">
              ₹10 Super Store
            </h2>
            <p className="text-[0.68rem] sm:text-xs text-amber-100 font-semibold m-0 opacity-95">
              Everything under ₹10 - Snacks, Milk, Drinks & Essentials
            </p>
          </div>

          {/* See All Header Button */}
          <button
            onClick={() => navigate('/ten-rupee-store')}
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-xs font-extrabold px-3 py-1.5 rounded-full border border-white/30 transition-all cursor-pointer backdrop-blur-md whitespace-nowrap"
          >
            <span>See All</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Scrollable Horizontal Products Container */}
        <div className="relative">
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-2.5 sm:gap-3.5 overflow-x-auto py-1.5 px-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth relative z-10"
          >
            {displayItems.map((product) => (
              <div key={`ten-store-${product.id}`} className="w-[140px] min-[400px]:w-[150px] sm:w-[165px] flex-shrink-0">
                <ProductCard
                  product={product}
                  cartItems={cartItems}
                  onUpdateQty={onUpdateQty}
                  orderingEnabled={orderingEnabled}
                  onSelectProduct={onSelectProduct}
                />
              </div>
            ))}

            {/* "See All" Card at the end of the carousel */}
            <div className="w-[110px] sm:w-[130px] flex-shrink-0 flex items-center justify-center">
              <button
                onClick={() => navigate('/ten-rupee-store')}
                className="w-full h-full border-none bg-transparent flex flex-col items-center justify-center gap-2 text-white p-2 text-center cursor-pointer transition-transform hover:scale-105 active:scale-95 group"
              >
                <div className="w-10 h-10 rounded-full bg-white text-amber-600 flex items-center justify-center shadow-md transition-transform group-hover:scale-110">
                  <ArrowRight size={20} />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wider">See All</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
