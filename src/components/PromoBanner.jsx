import { Tag } from 'lucide-react';

const promos = [
  {
    id: 1,
    title: 'Fresh Fruits & Veggies',
    subtitle: 'Up to 40% off on daily essentials',
    cta: 'Shop Now',
    emoji: '🥑',
    gradient: 'linear-gradient(135deg, #0f4c35 0%, #1a7a52 100%)',
    accent: '#4ade80',
  },
  {
    id: 2,
    title: 'Electronics Flash Sale',
    subtitle: 'Grab top tech at jaw-dropping prices',
    cta: 'Explore',
    emoji: '⚡',
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 100%)',
    accent: '#818cf8',
  },
  {
    id: 3,
    title: 'Beauty Specials',
    subtitle: 'Premium skincare at half the price',
    cta: 'Discover',
    emoji: '✨',
    gradient: 'linear-gradient(135deg, #4a044e 0%, #9d174d 100%)',
    accent: '#f9a8d4',
  },
];

export default function PromoBanner() {
  return (
    <section className="py-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {promos.map((promo) => (
          <div
            key={promo.id}
            className="rounded-[20px] py-8 px-7 flex items-center justify-between overflow-hidden relative transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.25)] group"
            style={{ background: promo.gradient }}
          >
            <div className="flex flex-col gap-2 max-w-[65%]">
              <div
                className="inline-flex items-center gap-[5px] py-1 px-2.5 border rounded-full text-[0.65rem] font-bold tracking-[0.04em] uppercase w-fit"
                style={{ color: promo.accent, borderColor: `${promo.accent}44`, background: `${promo.accent}11` }}
              >
                <Tag size={12} />
                Limited Offer
              </div>
              <h3 className="text-[1.1rem] font-extrabold text-white m-0 tracking-[-0.02em] leading-[1.3]">{promo.title}</h3>
              <p className="text-[0.78rem] text-white/65 m-0 leading-[1.5]">{promo.subtitle}</p>
              <button
                className="inline-flex items-center gap-1 mt-1 py-[7px] px-[18px] border-[1.5px] rounded-full text-[0.78rem] font-bold bg-transparent cursor-pointer transition-all w-fit hover:bg-white/10"
                style={{ color: promo.accent, borderColor: `${promo.accent}55` }}
              >
                {promo.cta} →
              </button>
            </div>
            <div className="text-[4.5rem] leading-none [filter:drop-shadow(0_4px_16px_rgba(0,0,0,0.3))] flex-shrink-0 transition-transform duration-300 group-hover:scale-[1.15] group-hover:rotate-[5deg]">
              {promo.emoji}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
