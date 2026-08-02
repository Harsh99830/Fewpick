
import styles from './HeroBanner.module.css';

export default function HeroBanner() {
  return (
    <section className={styles.hero}>
      <img src="/hero-banner.png" alt="Hero banner" className={styles.heroImg} />
      <div className={styles.overlay} />

      <div className={styles.content}>


        <h1 className={styles.heading}>
          Because even one packet of chips deserves a{' '}
          <span className={styles.headingAccent}>delivery</span>
        </h1>

        <p className={styles.subheading}>
          No minimum order, get even a single item delivered to your door.
        </p>




      </div>
    </section>
  );
}
