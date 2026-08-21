import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, MapPin, Menu, X, Package, Clock, Sparkles, PhoneCall } from 'lucide-react';
import ProductDetailModal from './ProductDetailModal';
import { getUniqueProductsByName } from '../utils/productUtils';

function InstagramIcon({ size = 16, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function Navbar({ products = [], cartCount, onNavigate, cartItems = [], onUpdateQty, orderingEnabled = true, closedMessage, openMessage }) {
  const navigate = useNavigate();
  const location = useLocation();
  const searchContainerRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSearchFocused(false);
        setSearchQuery('');
        setMenuOpen(false);
      }
    };

    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (searchFocused && searchQuery.trim()) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [searchFocused, searchQuery]);

  const isSearchHidden = ['/cart', '/contact', '/hq'].includes(location.pathname);

  const handleNavigate = (page) => {
    setMenuOpen(false);
    if (page === 'home') {
      navigate('/');
    } else if (page === 'cart') {
      navigate('/cart');
    } else if (page === 'contact') {
      navigate('/contact');
    } else if (onNavigate) {
      onNavigate(page);
    }
  };

  const rawFilteredProducts = searchQuery.trim() === '' ? [] : products.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredProducts = getUniqueProductsByName(rawFilteredProducts).slice(0, 7);

  const searchWrapperClass = `flex-1 max-w-[620px] h-11 flex items-center bg-gray-50/90 border border-gray-200/90 rounded-full px-4 transition-all duration-200 shadow-2xs hover:bg-white hover:border-gray-300 ${
    searchFocused || searchQuery
      ? '!bg-white !border-amber-500 shadow-[0_4px_20px_rgba(245,158,11,0.15)] ring-2 ring-amber-500/20'
      : ''
  }`;

  const renderSearchResults = () => {
    if (!searchQuery.trim()) return null;

    return (
      <div className="absolute top-full left-3 right-3 sm:left-0 sm:right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-[250] animate-drop-in">
        {filteredProducts.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-xs font-semibold">
            No items matching "<span className="text-gray-700 font-bold">{searchQuery}</span>"
          </div>
        ) : (
          <div className="divide-y divide-gray-100 max-h-[360px] overflow-y-auto">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  setSelectedProduct(p);
                  setSearchQuery('');
                  setSearchFocused(false);
                }}
                className="flex items-center gap-3.5 px-4.5 py-3 sm:px-5 hover:bg-indigo-50/40 cursor-pointer transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-150 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package size={18} className="text-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0 px-1">
                  <h4 className="text-xs font-extrabold text-gray-900 truncate m-0 group-hover:text-indigo-600 transition-colors">
                    {p.name}
                  </h4>
                  <span className="text-[10px] text-gray-400 font-medium">{p.weight || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 pl-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase bg-gray-100 px-2.5 py-0.5 rounded">
                    {p.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-[100] bg-white border-b border-[#e8eaf0] shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
        <nav className="max-w-[1440px] mx-auto relative">
          <div className="flex items-center gap-3 md:gap-5 px-4 md:px-6 py-2.5">
            {/* Logo */}
            <button 
              onClick={() => handleNavigate('home')} 
              className="flex items-baseline gap-px flex-shrink-0 no-underline bg-transparent border-none cursor-pointer p-0 select-none align-baseline text-left outline-none font-inherit relative z-10"
            >
              <span className="text-[1.6rem] font-extrabold text-[#1a1c2e] tracking-[-1px] pointer-events-none">Few</span>
              <span className="text-[1.6rem] font-extrabold text-[#f59e0b] tracking-[-1px] pointer-events-none">Pick</span>
            </button>

            {/* Delivery Location Badge */}
            <div className="flex items-center gap-1.5 pl-2 sm:pl-3 border-l border-gray-200/80 my-auto py-0.5">
              <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                <MapPin size={13} className="fill-amber-500/20" />
              </div>
              <div className="flex flex-col gap-0.5 leading-tight justify-center">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Delivering To</span>
                <span className="text-[11px] sm:text-xs font-bold text-gray-800 tracking-tight whitespace-nowrap">Vidhani, Sitapura</span>
              </div>
            </div>



            {/* Search — Centered Desktop */}
            {!isSearchHidden && (
              <div ref={searchContainerRef} className="hidden md:flex justify-center flex-1 mx-4 lg:mx-8 relative z-10">
                <div className="w-full max-w-[420px] lg:max-w-[480px]">
                  <div className={searchWrapperClass}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${searchFocused || searchQuery ? 'bg-amber-50 text-amber-600' : 'text-gray-400'}`}>
                      <Search size={16} />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none px-3 text-xs sm:text-sm font-semibold text-gray-900 h-full placeholder:text-gray-400 placeholder:font-medium"
                      placeholder="Search essentials, groceries & more..."
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                    />
                    {searchQuery ? (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center cursor-pointer border-none transition-colors flex-shrink-0"
                      >
                        <X size={13} />
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-100/80 px-2 py-0.5 rounded-full uppercase tracking-wider hidden lg:inline-block pointer-events-none">
                        Search
                      </span>
                    )}
                  </div>
                  {renderSearchResults()}
                </div>
              </div>
            )}

            {/* Right section — Desktop */}
            <div className="hidden md:flex items-center gap-5 ml-auto flex-shrink-0 relative z-10">
              <a
                href="https://www.instagram.com/fewpick?igsh=MWQ0bTFidWF0Mm8yZg=="
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-pink-600 bg-gray-50 hover:bg-pink-50/80 px-3 py-1.5 rounded-full border border-gray-200 hover:border-pink-200 transition-all no-underline"
                title="Follow us on Instagram"
              >
                <InstagramIcon size={15} className="text-pink-600" />
                <span>Follow</span>
              </a>

              <button
                onClick={() => handleNavigate('contact')}
                className="bg-transparent border-none text-sm font-semibold text-[#374151] cursor-pointer py-1 px-1 transition-colors hover:text-indigo-600 whitespace-nowrap flex items-center gap-1.5"
              >
                <PhoneCall size={15} className="text-indigo-600" />
                <span>Contact Us</span>
              </button>

              {/* Cart */}
              <button 
                onClick={() => handleNavigate('cart')}
                className="relative flex items-center justify-center w-10 h-10 bg-transparent border-none rounded-lg cursor-pointer text-[#374151] transition-colors hover:text-[#111827] outline-none"
              >
                <ShoppingCart size={22} className="pointer-events-none" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[0.65rem] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-[3px] pointer-events-none">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile: cart + hamburger */}
            <div ref={mobileMenuRef} className="flex md:hidden items-center gap-3 ml-auto relative z-10">
              <button 
                onClick={() => handleNavigate('cart')}
                className="relative flex items-center justify-center w-10 h-10 bg-transparent border-none rounded-lg cursor-pointer text-[#374151] transition-colors hover:text-[#111827] outline-none"
              >
                <ShoppingCart size={22} className="pointer-events-none" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[0.65rem] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-[3px] pointer-events-none">
                    {cartCount}
                  </span>
                )}
              </button>
              <button className="flex items-center justify-center w-[38px] h-[38px] bg-transparent border-none cursor-pointer text-[#374151] rounded-lg transition-colors hover:bg-[#f3f4f6]" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              {/* Mobile menu drawer — absolute overlay directly below top bar */}
              {menuOpen && (
                <div className="absolute top-[50px] right-0 w-[240px] z-[250] bg-white flex flex-col gap-1 px-3 py-2.5 rounded-2xl shadow-2xl border border-gray-150 animate-slide-down">
                  <a
                    href="https://www.instagram.com/fewpick?igsh=MWQ0bTFidWF0Mm8yZg=="
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-left bg-transparent text-[0.88rem] font-semibold text-[#374151] py-2.5 px-3 rounded-[10px] cursor-pointer transition-colors hover:bg-pink-50 hover:text-pink-600 flex items-center gap-2.5 no-underline"
                  >
                    <InstagramIcon size={17} className="text-pink-600" />
                    <span>Follow on Instagram</span>
                  </a>
                  <button
                    onClick={() => handleNavigate('contact')}
                    className="w-full text-left bg-transparent border-none text-[0.88rem] font-semibold text-[#374151] py-2.5 px-3 rounded-[10px] cursor-pointer transition-colors hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2.5"
                  >
                    <PhoneCall size={17} className="text-indigo-600" />
                    <span>Contact Us</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Store status notice banner below navbar header */}
          {!orderingEnabled ? (
            <div className="w-full bg-red-50 border-t border-red-100 px-4 md:px-6 py-2 flex items-center justify-center gap-1.5">
              <Clock size={13} className="text-red-500 flex-shrink-0" />
              <span className="text-[0.7rem] sm:text-xs font-bold text-red-600 text-center leading-tight">
                {closedMessage}
              </span>
            </div>
          ) : openMessage && openMessage.trim() ? (
            <div className="w-full bg-emerald-50 border-t border-emerald-100 px-4 md:px-6 py-2 flex items-center justify-center gap-1.5">
              <Sparkles size={13} className="text-emerald-600 flex-shrink-0" />
              <span className="text-[0.7rem] sm:text-xs font-bold text-emerald-700 text-center leading-tight">
                {openMessage}
              </span>
            </div>
          ) : null}

          {/* Mobile search bar — full width below nav */}
          {!isSearchHidden && (
            <div className="block md:hidden px-4 pt-2.5 pb-2.5 relative">
              <div className={searchWrapperClass}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${searchFocused || searchQuery ? 'bg-amber-50 text-amber-600' : 'text-gray-400'}`}>
                  <Search size={16} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none px-2.5 text-xs font-semibold text-gray-900 h-full placeholder:text-gray-400 placeholder:font-medium"
                  placeholder="Search snacks, drinks, essentials..."
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center cursor-pointer border-none transition-colors flex-shrink-0"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
              {renderSearchResults()}
            </div>
          )}
        </nav>
      </header>

      {/* Product Quick View / Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          cartItems={cartItems}
          onUpdateQty={onUpdateQty}
          products={products}
        />
      )}
    </>
  );
}
