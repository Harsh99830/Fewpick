import { useState } from 'react';
import { Search, ShoppingCart, MapPin, ChevronDown, Menu, X } from 'lucide-react';
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
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <nav className={styles.navbar}>
        <div className={styles.navInner}>
          {/* Logo */}
          <div className={styles.logo}>
            <span className={styles.logoText}>Few</span>
            <span className={styles.logoAccent}>Pick</span>
          </div>

          {/* Location — hidden on mobile */}
          <button className={styles.locationBtn}>
            <MapPin size={16} className={styles.locationIcon} />
            <div className={styles.locationText}>
              <span className={styles.locationLabel}>Deliver to</span>
              <span className={styles.locationValue}>Poornima University</span>
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

          {/* Right section — hidden on mobile */}
          <div className={styles.navRight}>
            {/* More dropdown */}
            <div
              className={styles.moreWrapper}
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

          {/* Mobile: cart + hamburger */}
          <div className={styles.mobileActions}>
            <button className={styles.cartIconBtn}>
              <ShoppingCart size={22} />
              {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
            </button>
            <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile search bar — full width below nav */}
        <div className={styles.mobileSearch}>
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
        </div>

        {/* Mobile menu drawer */}
        {menuOpen && (
          <div className={styles.mobileMenu}>
            <button className={styles.locationBtn} style={{ width: '100%', justifyContent: 'flex-start', marginTop: '12px' }}>
              <MapPin size={16} className={styles.locationIcon} />
              <div className={styles.locationText}>
                <span className={styles.locationLabel}>Deliver to</span>
                <span className={styles.locationValue}>Poornima University</span>
              </div>
            </button>
            <div className={styles.mobileDivider} />
            {moreLinks.map((link) => (
              <button key={link.label} className={styles.mobileMenuItem}>
                {link.label}
              </button>
            ))}
            <div className={styles.mobileDivider} />
            <button className={styles.loginBtn} style={{ width: '100%' }}>Login</button>
          </div>
        )}
      </nav>
    </header>
  );
}
