import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { categories as fallbackCategories } from '../data/categories';

export default function CategorySection({ categories = [] }) {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const displayCategories = categories.length > 0 ? categories : fallbackCategories;

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
  }, [displayCategories]);

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = direction === 'left' ? -240 : 240;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <section className="py-2 relative group/section">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-[1.35rem] font-extrabold text-gray-900 m-0 tracking-[-0.02em]">
          Shop From Top Categories
        </h2>

        {/* Desktop Header Scroll Buttons */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            className="w-8 h-8 rounded-full border border-gray-200 bg-white text-gray-700 flex items-center justify-center cursor-pointer transition-all hover:bg-gray-50 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            className="w-8 h-8 rounded-full border border-gray-200 bg-white text-gray-700 flex items-center justify-center cursor-pointer transition-all hover:bg-gray-50 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Category Scroll Container with Side Floating Arrows */}
      <div className="relative">
        {/* Left Side Floating Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => handleScroll('left')}
            className="absolute -left-2 sm:-left-3 top-[40px] md:top-[48px] -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 border border-gray-200 shadow-md text-gray-800 flex items-center justify-center cursor-pointer hover:bg-white active:scale-95 transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        {/* Scrollable Track */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex flex-nowrap overflow-x-auto gap-2.5 sm:gap-4 pt-3 pb-3 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth w-full"
        >
          {displayCategories.map((cat) => {
            const displayImage = cat.image || cat.emoji;
            const isUrl = displayImage && (displayImage.startsWith('http') || displayImage.startsWith('/') || displayImage.includes('.'));

            return (
              <button
                key={cat.id}
                onClick={() => navigate(`/category/${encodeURIComponent(cat.name)}`)}
                className="flex flex-col items-center gap-2 bg-none border-none cursor-pointer p-0.5 transition-transform hover:-translate-y-1 flex-shrink-0 w-[68px] sm:w-[84px] group"
              >
                <div className="w-[60px] h-[60px] md:w-[76px] md:h-[76px] rounded-full flex items-center justify-center bg-gray-50/80 border-2 border-gray-200 shadow-[0_0_0_3px_rgba(229,231,235,0.4)] transition-all duration-[250ms] group-hover:scale-[1.08] group-hover:border-gray-300 group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] overflow-hidden">
                  {isUrl ? (
                    <img src={displayImage} alt={cat.name} className="w-10/12 h-10/12 object-contain" />
                  ) : (
                    <span className="text-[1.6rem] md:text-[2rem] leading-none">{displayImage || '📦'}</span>
                  )}
                </div>
                <span className="text-[0.65rem] md:text-[0.72rem] font-bold text-gray-700 text-center leading-[1.3]">{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right Side Floating Arrow */}
        {canScrollRight && (
          <button
            onClick={() => handleScroll('right')}
            className="absolute -right-2 sm:-right-3 top-[40px] md:top-[48px] -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 border border-gray-200 shadow-md text-gray-800 flex items-center justify-center cursor-pointer hover:bg-white active:scale-95 transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </section>
  );
}
