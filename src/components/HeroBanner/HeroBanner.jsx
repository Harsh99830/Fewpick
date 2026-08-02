import { Timer } from 'lucide-react';
import styles from './HeroBanner.module.css';

export default function HeroBanner() {
  return (
    <section className={styles.hero}>
      <img src="/hero-banner.png" alt="Hero banner" className={styles.heroImg} />
      <div className={styles.overlay} />

      <div className={styles.content}>
        <div className={styles.badge}>
          <Timer size={16} />
          <span>Delivered in 10 minutes</span>
        </div>

        <h1 className={styles.heading}>
          Because even one packet of chips deserves a{' '}
          <span className={styles.headingAccent}>delivery</span>
        </h1>

        <p className={styles.subheading}>
          Groceries, snacks &amp; essentials — at your door before you know it.
        </p>

        <div className={styles.actions}>
          <button className={styles.primaryBtn}>Shop Now</button>
          <button className={styles.secondaryBtn}>Browse Categories</button>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNum}>10 min</span>
            <span className={styles.statLabel}>Avg Delivery</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>50K+</span>
            <span className={styles.statLabel}>Products</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>2M+</span>
            <span className={styles.statLabel}>Happy Customers</span>
          </div>
        </div>
      </div>
    </section>
  );
}
