import { Tag } from 'lucide-react';
import styles from './PromoBanner.module.css';

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
    <section className={styles.section}>
      <div className={styles.grid}>
        {promos.map((promo) => (
          <div
            key={promo.id}
            className={styles.promoCard}
            style={{ background: promo.gradient }}
          >
            <div className={styles.promoContent}>
              <div className={styles.promoBadge} style={{ color: promo.accent, borderColor: `${promo.accent}44`, background: `${promo.accent}11` }}>
                <Tag size={12} />
                Limited Offer
              </div>
              <h3 className={styles.promoTitle}>{promo.title}</h3>
              <p className={styles.promoSubtitle}>{promo.subtitle}</p>
              <button className={styles.promoCta} style={{ color: promo.accent, borderColor: `${promo.accent}55` }}>
                {promo.cta} →
              </button>
            </div>
            <div className={styles.promoEmoji}>{promo.emoji}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
