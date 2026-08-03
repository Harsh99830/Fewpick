import { useState } from 'react';
import { Search, ShoppingCart, User, MapPin, ChevronDown } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar({ cartCount }) {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className={styles.header}>
      <nav className={styles.navbar}>
        <div className={styles.navInner}>
          {/* Logo */}
          <div className={styles.logo}>
            <span className={styles.logoText}>Few</span>
            <span className={styles.logoAccent}>Pick</span>
          </div>

          {/* Location */}
          <button className={styles.locationBtn}>
            <MapPin size={16} className={styles.locationIcon} />
            <div className={styles.locationText}>
              <span className={styles.locationLabel}>Deliver to</span>
              <span className={styles.locationValue}>
                Poornima University <ChevronDown size={14} />
              </span>
            </div>
          </button>

          {/* Search */}
          <div className={`${styles.searchWrapper} ${searchFocused ? styles.searchFocused : ''}`}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search essentials, groceries and more..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <button className={styles.searchBtn}>Search</button>
          </div>

          {/* Actions */}
          <div className={styles.navActions}>
            <button className={styles.actionBtn}>
              <User size={20} />
              <span className={styles.actionLabel}>Sign In</span>
            </button>
            <button className={styles.cartBtn}>
              <ShoppingCart size={20} />
              <span className={styles.actionLabel}>Cart</span>
              {cartCount > 0 && (
                <span className={styles.cartBadge}>{cartCount}</span>
              )}
            </button>
          </div>
        </div>


      </nav>
    </header>
  );
}
