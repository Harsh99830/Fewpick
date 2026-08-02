import { MapPin, Phone, Mail } from 'lucide-react';
import styles from './Footer.module.css';

const footerLinks = {
  Company: ['About Us', 'Careers', 'Press', 'Blog', 'Partner with Us'],
  'Customer Service': ['Help Center', 'Returns', 'Track Order', 'FAQs', 'Contact Us'],
  'Top Categories': ['Groceries', 'Fresh Fruits', 'Dairy & Eggs', 'Snacks & Drinks', 'Electronics'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Refund Policy'],
};

const socialLinks = [
  { label: 'Facebook', letter: 'f', href: '#' },
  { label: 'Twitter', letter: '𝕏', href: '#' },
  { label: 'Instagram', letter: '📷', href: '#' },
  { label: 'YouTube', letter: '▶', href: '#' },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <div className={styles.footerGrid}>
          {/* Brand */}
          <div className={styles.brand}>
            <div className={styles.logoText}>
              <span className={styles.logo}>Mega</span>
              <span className={styles.logoAccent}>Mart</span>
            </div>
            <p className={styles.tagline}>
              Your daily essentials, delivered in minutes. Fresh, fast, and reliable — that's the MegaMart promise.
            </p>
            <div className={styles.contactList}>
              <div className={styles.contactItem}>
                <MapPin size={15} />
                <span>Mumbai, Maharashtra, India</span>
              </div>
              <div className={styles.contactItem}>
                <Phone size={15} />
                <span>1800-123-MEGA</span>
              </div>
              <div className={styles.contactItem}>
                <Mail size={15} />
                <span>support@megamart.in</span>
              </div>
            </div>
            <div className={styles.socials}>
              {socialLinks.map((s) => (
                <a key={s.label} href={s.href} className={styles.socialIcon} aria-label={s.label}>
                  {s.letter}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className={styles.linkGroup}>
              <h4 className={styles.linkTitle}>{title}</h4>
              <ul className={styles.linkList}>
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className={styles.link}>{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className={styles.footerBottom}>
        <p className={styles.copyright}>
          © {new Date().getFullYear()} MegaMart Pvt. Ltd. All rights reserved.
        </p>
        <div className={styles.paymentIcons}>
          {['VISA', 'MC', 'UPI', 'PayTm', 'GPay'].map((p) => (
            <span key={p} className={styles.payIcon}>{p}</span>
          ))}
        </div>
      </div>
    </footer>
  );
}
