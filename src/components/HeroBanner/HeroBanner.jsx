import styles from './HeroBanner.module.css';

export default function HeroBanner() {
  return (
    <section className={styles.hero}>
      <img src="/hero-banner.png" alt="Fewpick — delivery for even one item" className={styles.bannerImg} />
    </section>
  );
}
