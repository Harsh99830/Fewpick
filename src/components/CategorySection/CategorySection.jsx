import { ChevronRight } from 'lucide-react';
import { categories } from '../../data/categories';
import styles from './CategorySection.module.css';

export default function CategorySection() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.title}>
          Shop From <span className={styles.highlight}>Top Categories</span>
        </h2>
        <button className={styles.viewAll}>
          View All <ChevronRight size={16} />
        </button>
      </div>

      <div className={styles.grid}>
        {categories.map((cat) => (
          <button key={cat.id} className={styles.categoryItem}>
            <div
              className={styles.iconCircle}
              style={{
                backgroundColor: cat.color,
                boxShadow: `0 0 0 3px ${cat.borderColor}33`,
                border: `2px solid ${cat.borderColor}`,
              }}
            >
              <span className={styles.emoji}>{cat.emoji}</span>
            </div>
            <span className={styles.catName}>{cat.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
