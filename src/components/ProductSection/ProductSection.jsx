import ProductCard from '../ProductCard/ProductCard';
import styles from './ProductSection.module.css';

export default function ProductSection({ products }) {
  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
