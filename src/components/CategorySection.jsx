import { useNavigate } from 'react-router-dom';
import { categories as fallbackCategories } from '../data/categories';

export default function CategorySection({ categories = [] }) {
  const navigate = useNavigate();
  const displayCategories = categories.length > 0 ? categories : fallbackCategories;

  return (
    <section className="py-2">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[1.35rem] font-extrabold text-gray-900 m-0 tracking-[-0.02em]">
          Shop From Top Categories
        </h2>
      </div>

      <div className="flex flex-nowrap overflow-x-auto gap-2 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-5 lg:grid-cols-10 md:overflow-visible md:pb-0 md:gap-3">
        {displayCategories.map((cat) => {
          const displayImage = cat.image || cat.emoji;
          const isUrl = displayImage && (displayImage.startsWith('http') || displayImage.startsWith('/') || displayImage.includes('.'));

          return (
            <button
              key={cat.id}
              onClick={() => navigate(`/category/${encodeURIComponent(cat.name)}`)}
              className="flex flex-col items-center gap-2.5 bg-none border-none cursor-pointer p-1 transition-transform hover:-translate-y-1 flex-shrink-0 w-[72px] md:w-auto group"
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
    </section>
  );
}
