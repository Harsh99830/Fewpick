import { ChevronRight } from 'lucide-react';
import ProductCard from '../ProductCard/ProductCard';
import styles from './ProductSection.module.css';

export default function ProductSection({ title, highlightWord, products }) {
  const parts = title.split(highlightWord);

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.title}>
          {parts[0]}
          <span className={styles.highlight}>{highlightWord}</span>
          {parts[1]}
        </h2>
        <button className={styles.viewAll}>
          View All <ChevronRight size={16} />
        </button>
      </div>

      <div className={styles.grid}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
