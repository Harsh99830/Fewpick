import { useState } from 'react';
import { Plus, Minus, Star } from 'lucide-react';
import styles from './ProductCard.module.css';

const badgeColorMap = {
  orange: styles.badgeOrange,
  yellow: styles.badgeYellow,
  red: styles.badgeRed,
  green: styles.badgeGreen,
  blue: styles.badgeBlue,
  purple: styles.badgePurple,
};

export default function ProductCard({ product }) {
  const [qty, setQty] = useState(0);

  const handleAdd = () => setQty(1);
  const handleInc = () => setQty((q) => q + 1);
  const handleDec = () => setQty((q) => (q <= 1 ? 0 : q - 1));

  const discountColor =
    product.discount >= 50 ? styles.discountHigh : styles.discountMid;

  return (
    <article className={styles.card}>
      {/* Image */}
      <div className={styles.imageWrapper}>
        {product.discount > 0 && (
          <span className={`${styles.discountBadge} ${discountColor}`}>
            {product.discount}% OFF
          </span>
        )}
        {product.badge && (
          <span className={`${styles.labelBadge} ${badgeColorMap[product.badgeColor] || ''}`}>
            {product.badge}
          </span>
        )}
        <img
          src={product.image}
          alt={product.name}
          className={styles.productImage}
          loading="lazy"
        />
      </div>

      {/* Info */}
      <div className={styles.info}>
        <div className={styles.rating}>
          <Star size={11} className={styles.starIcon} />
          <span className={styles.ratingVal}>{product.rating}</span>
          <span className={styles.ratingCount}>({(product.reviews / 1000).toFixed(1)}k)</span>
        </div>

        <h3 className={styles.productName}>{product.name}</h3>
        <p className={styles.weight}>{product.weight}</p>

        <div className={styles.priceRow}>
          <span className={styles.price}>₹{product.price}</span>
          <span className={styles.mrp}>₹{product.mrp}</span>
          <span className={styles.save}>Save ₹{product.mrp - product.price}</span>
        </div>

        {/* Add to cart */}
        {qty === 0 ? (
          <button className={styles.addBtn} onClick={handleAdd}>
            <Plus size={16} />
            Add
          </button>
        ) : (
          <div className={styles.qtyControl}>
            <button className={styles.qtyBtn} onClick={handleDec}>
              <Minus size={14} />
            </button>
            <span className={styles.qtyNum}>{qty}</span>
            <button className={styles.qtyBtn} onClick={handleInc}>
              <Plus size={14} />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
