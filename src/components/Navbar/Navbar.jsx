import { useState, useRef } from 'react';
import { Search, ShoppingCart, MapPin, ChevronDown } from 'lucide-react';
import styles from './Navbar.module.css';

const moreLinks = [
  { label: 'About Us' },
  { label: 'Contact Us' },
  { label: 'Careers' },
  { label: 'Blog' },
  { label: 'Help & Support' },
];

export default function Navbar({ cartCount }) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

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
                Poornima University
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
          </div>

          <div className={styles.navRight}>
            {/* More dropdown */}
            <div
              className={styles.moreWrapper}
              ref={moreRef}
              onMouseEnter={() => setMoreOpen(true)}
              onMouseLeave={() => setMoreOpen(false)}
            >
              <button className={styles.moreBtn}>
                More <ChevronDown size={14} className={moreOpen ? styles.chevronUp : ''} />
              </button>
              {moreOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownInner}>
                    {moreLinks.map((link) => (
                      <button key={link.label} className={styles.dropdownItem}>
                        {link.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cart */}
            <button className={styles.cartIconBtn}>
              <ShoppingCart size={22} />
              {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
            </button>

            {/* Login */}
            <button className={styles.loginBtn}>Login</button>
          </div>

        </div>
      </nav>
    </header>
  );
}
