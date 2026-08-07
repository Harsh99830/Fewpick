import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, MapPin, Menu, X, Package, Clock } from 'lucide-react';
import ProductDetailModal from './ProductDetailModal';
import { getUniqueProductsByName } from '../utils/productUtils';

export default function Navbar({ products = [], cartCount, onNavigate, cartItems = [], onUpdateQty, orderingEnabled = true, closedMessage }) {
  const navigate = useNavigate();
  const location = useLocation();
  const searchContainerRef = useRef(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSearchFocused(false);
        setSearchQuery('');
      }
    };

    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
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

  const searchWrapperClass = `flex-1 max-w-[580px] h-11 flex items-center bg-[#f3f4f6] border-2 border-transparent rounded-xl px-3.5 transition-all overflow-hidden hover:bg-[#eff0f5] ${
    searchFocused || searchQuery ? '!bg-white !border-indigo-500 shadow-[0_0_0_4px_rgba(99,102,241,0.12)]' : ''
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

            {/* Location Indicator */}
            <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-1 sm:py-1.5 border border-[#e5e7eb] rounded-[10px] bg-[#f9fafb] flex-shrink-0 relative z-10">
              <MapPin size={13} className="text-[#6366f1] flex-shrink-0 pointer-events-none" />
              <div className="flex flex-col items-start pointer-events-none leading-none">
                <span className="text-[0.5rem] sm:text-[0.625rem] font-bold text-[#9ca3af] uppercase tracking-[0.05em] mb-0.5">Deliver to</span>
                <span className="text-[0.58rem] min-[350px]:text-[0.65rem] min-[390px]:text-[0.72rem] sm:text-xs font-bold text-[#1f2937] whitespace-nowrap">Poornima University</span>
              </div>
            </div>

            {/* Search — Desktop */}
            {!isSearchHidden && (
              <div ref={searchContainerRef} className="hidden md:block flex-1 max-w-[580px] relative z-10">
                <div className={searchWrapperClass}>
                  <Search size={18} className="text-[#9ca3af] flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none px-3 text-sm font-inherit text-[#1f2937] h-full placeholder:text-[#9ca3af]"
                    placeholder="Search essentials, groceries and more..."
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-700 cursor-pointer border-none bg-transparent"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                {renderSearchResults()}
              </div>
            )}

            {/* Right section — hidden on mobile */}
            <div className="hidden md:flex items-center gap-6 ml-auto flex-shrink-0 relative z-10">
              <button
                onClick={() => handleNavigate('contact')}
                className="bg-transparent border-none text-sm font-semibold text-[#374151] cursor-pointer py-1 px-1 transition-colors hover:text-indigo-600"
              >
                Contact Us
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
            <div className="flex md:hidden items-center gap-3 ml-auto relative z-10">
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
            </div>
          </div>

          {/* Closed notice — replaces the old page banner */}
          {!orderingEnabled && (
            <div className="w-full bg-red-50 border-t border-red-100 px-4 md:px-6 py-2 flex items-center justify-center gap-1.5">
              <Clock size={13} className="text-red-500 flex-shrink-0" />
              <span className="text-[0.7rem] sm:text-xs font-bold text-red-600 text-center leading-tight">
                {closedMessage}
              </span>
            </div>
          )}

          {/* Mobile search bar — full width below nav */}
          {!isSearchHidden && (
            <div className="block md:hidden px-4 pt-2.5 pb-2.5 relative">
              <div className={searchWrapperClass}>
                <Search size={18} className="text-[#9ca3af] flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none px-3 text-sm text-[#1f2937] h-full placeholder:text-[#9ca3af]"
                  placeholder="Search essentials, groceries and more..."
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-700 cursor-pointer border-none bg-transparent"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              {renderSearchResults()}
            </div>
          )}

          {/* Mobile menu drawer */}
          {menuOpen && (
            <div className="absolute top-full left-0 right-0 z-[200] bg-white flex flex-col gap-1 px-4 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.13)] border-t border-[#f1f3f9] animate-slide-down">
              <button
                onClick={() => handleNavigate('contact')}
                className="w-full text-left bg-transparent border-none text-[0.95rem] font-semibold text-[#374151] py-3 px-3.5 rounded-[10px] cursor-pointer transition-colors hover:bg-[#f3f4f6] hover:text-indigo-600"
              >
                Contact Us
              </button>
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
