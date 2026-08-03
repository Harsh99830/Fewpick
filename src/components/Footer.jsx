import { MapPin, Phone, Mail } from 'lucide-react';

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
    <footer className="bg-[#0f1117] text-gray-200 mt-10">
      <div className="py-[60px] px-6 max-w-[1440px] mx-auto pb-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-10">
          {/* Brand */}
          <div className="flex flex-col gap-4 col-span-2 sm:col-span-3 lg:col-span-1">
            <div className="flex items-baseline gap-px">
              <span className="text-2xl font-extrabold text-white tracking-[-0.5px]">Mega</span>
              <span className="text-2xl font-extrabold text-[#f59e0b] tracking-[-0.5px]">Mart</span>
            </div>
            <p className="text-[0.82rem] text-gray-400 leading-[1.7] m-0 max-w-[280px]">
              Your daily essentials, delivered in minutes. Fresh, fast, and reliable — that's the MegaMart promise.
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[0.78rem] text-gray-400">
                <MapPin size={15} className="text-[#6366f1] flex-shrink-0" />
                <span>Mumbai, Maharashtra, India</span>
              </div>
              <div className="flex items-center gap-2 text-[0.78rem] text-gray-400">
                <Phone size={15} className="text-[#6366f1] flex-shrink-0" />
                <span>1800-123-MEGA</span>
              </div>
              <div className="flex items-center gap-2 text-[0.78rem] text-gray-400">
                <Mail size={15} className="text-[#6366f1] flex-shrink-0" />
                <span>support@megamart.in</span>
              </div>
            </div>
            <div className="flex gap-2.5 mt-1">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  className="w-9 h-9 bg-gray-800 rounded-[10px] flex items-center justify-center text-gray-400 no-underline transition-all hover:bg-[#6366f1] hover:text-white hover:-translate-y-0.5"
                  aria-label={s.label}
                >
                  {s.letter}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="flex flex-col gap-3">
              <h4 className="text-[0.82rem] font-bold text-white uppercase tracking-[0.08em] m-0">{title}</h4>
              <ul className="list-none m-0 p-0 flex flex-col gap-2">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-[0.8rem] text-gray-500 no-underline transition-colors block hover:text-gray-200">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-800 py-5 px-6 max-w-[1440px] mx-auto flex items-center justify-between flex-wrap gap-3">
        <p className="text-[0.78rem] text-gray-500 m-0">
          © {new Date().getFullYear()} MegaMart Pvt. Ltd. All rights reserved.
        </p>
        <div className="flex gap-2 items-center">
          {['VISA', 'MC', 'UPI', 'PayTm', 'GPay'].map((p) => (
            <span key={p} className="py-1 px-2.5 bg-gray-800 border border-gray-700 rounded-md text-[0.65rem] font-extrabold text-gray-400 tracking-[0.05em]">
              {p}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
