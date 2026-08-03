import { useState } from 'react';
import { Search, ShoppingCart, MapPin, ChevronDown, Menu, X } from 'lucide-react';

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

  const searchWrapperClass = `flex-1 max-w-[580px] h-11 flex items-center bg-[#f3f4f6] border-2 border-transparent rounded-xl px-3.5 transition-all overflow-hidden hover:bg-[#eff0f5] ${
    searchFocused ? '!bg-white !border-orange-500 shadow-[0_0_0_4px_rgba(249,115,22,0.12)]' : ''
  }`;

  return (
    <header className="sticky top-0 z-[100] bg-white border-b border-[#e8eaf0] shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
      <nav className="max-w-[1440px] mx-auto relative">
        <div className="flex items-center gap-3 md:gap-5 px-4 md:px-6 py-2.5">
          {/* Logo */}
          <div className="flex items-baseline gap-px flex-shrink-0 no-underline">
            <span className="text-[1.6rem] font-extrabold text-[#1a1c2e] tracking-[-1px]">Few</span>
            <span className="text-[1.6rem] font-extrabold text-[#f59e0b] tracking-[-1px]">Pick</span>
          </div>

          {/* Location — hidden on mobile */}
          <button className="hidden md:flex items-center gap-2 px-2.5 py-1.5 border border-[#e5e7eb] rounded-[10px] bg-[#f9fafb] cursor-pointer transition-all hover:border-[#d1d5db] hover:bg-[#f3f4f6] flex-shrink-0">
            <MapPin size={16} className="text-[#6366f1] flex-shrink-0" />
            <div className="flex flex-col items-start">
              <span className="text-[0.625rem] font-medium text-[#9ca3af] uppercase tracking-[0.05em]">Deliver to</span>
              <span className="text-xs font-bold text-[#1f2937] flex items-center gap-0.5">Poornima University</span>
            </div>
          </button>

          {/* Search — hidden on mobile (separate bar shown below) */}
          <div className={`hidden md:flex ${searchWrapperClass}`}>
            <Search size={18} className="text-[#9ca3af] flex-shrink-0" />
            <input
              type="text"
              className="flex-1 bg-transparent border-none outline-none px-3 text-sm font-inherit text-[#1f2937] h-full placeholder:text-[#9ca3af]"
              placeholder="Search essentials, groceries and more..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>

          {/* Right section — hidden on mobile */}
          <div className="hidden md:flex items-center gap-9 ml-auto flex-shrink-0">
            {/* More dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setMoreOpen(true)}
              onMouseLeave={() => setMoreOpen(false)}
            >
              <button className="flex items-center gap-1 bg-transparent border-none text-sm font-semibold text-[#374151] cursor-pointer py-1 px-0.5 transition-colors hover:text-[#111827]">
                More <ChevronDown size={14} className={moreOpen ? 'rotate-180 transition-transform duration-200' : 'transition-transform duration-200'} />
              </button>
              {moreOpen && (
                <div className="absolute top-full right-0 min-w-[180px] pt-2.5 z-[100]">
                  <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.1)] p-1.5 animate-drop-in">
                    {moreLinks.map((link) => (
                      <button key={link.label} className="block w-full text-left bg-transparent border-none text-sm text-[#374151] py-2.5 px-3.5 rounded-lg cursor-pointer transition-colors hover:bg-[#f3f4f6] hover:text-[#111827]">
                        {link.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cart */}
            <button className="relative flex items-center justify-center w-10 h-10 bg-transparent border-none rounded-lg cursor-pointer text-[#374151] transition-colors hover:text-[#111827]">
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[0.65rem] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-[3px]">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Login */}
            <button className="flex-shrink-0 px-6 h-10 bg-[#2563eb] text-white text-sm font-semibold rounded-lg cursor-pointer transition-all hover:bg-[#1d4ed8] hover:-translate-y-px active:translate-y-0 tracking-[0.01em]">
              Login
            </button>
          </div>

          {/* Mobile: cart + hamburger */}
          <div className="flex md:hidden items-center gap-3 ml-auto">
            <button className="relative flex items-center justify-center w-10 h-10 bg-transparent border-none rounded-lg cursor-pointer text-[#374151] transition-colors hover:text-[#111827]">
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[0.65rem] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-[3px]">
                  {cartCount}
                </span>
              )}
            </button>
            <button className="flex items-center justify-center w-[38px] h-[38px] bg-transparent border-none cursor-pointer text-[#374151] rounded-lg transition-colors hover:bg-[#f3f4f6]" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile search bar — full width below nav */}
        <div className="block md:hidden px-4 pb-2.5">
          <div className={searchWrapperClass}>
            <Search size={18} className="text-[#9ca3af] flex-shrink-0" />
            <input
              type="text"
              className="flex-1 bg-transparent border-none outline-none px-3 text-sm text-[#1f2937] h-full placeholder:text-[#9ca3af]"
              placeholder="Search essentials, groceries and more..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>
        </div>

        {/* Mobile menu drawer */}
        {menuOpen && (
          <div className="absolute top-full left-0 right-0 z-[200] bg-white flex flex-col gap-1 px-4 pb-4 max-h-[80vh] overflow-y-auto shadow-[0_8px_32px_rgba(0,0,0,0.13)] border-t border-[#f1f3f9] animate-slide-down">
            <button className="flex items-center gap-2 px-2.5 py-1.5 border border-[#e5e7eb] rounded-[10px] bg-[#f9fafb] cursor-pointer transition-all hover:border-[#d1d5db] hover:bg-[#f3f4f6] w-full justify-start mt-3">
              <MapPin size={16} className="text-[#6366f1] flex-shrink-0" />
              <div className="flex flex-col items-start">
                <span className="text-[0.625rem] font-medium text-[#9ca3af] uppercase tracking-[0.05em]">Deliver to</span>
                <span className="text-xs font-bold text-[#1f2937] flex items-center gap-0.5">Poornima University</span>
              </div>
            </button>
            <div className="h-px bg-[#f1f3f9] my-1.5" />
            {moreLinks.map((link) => (
              <button key={link.label} className="w-full text-left bg-transparent border-none text-[0.95rem] text-[#374151] py-3 px-3.5 rounded-[10px] cursor-pointer transition-colors hover:bg-[#f3f4f6]">
                {link.label}
              </button>
            ))}
            <div className="h-px bg-[#f1f3f9] my-1.5" />
            <button className="flex-shrink-0 px-6 h-10 bg-[#2563eb] text-white text-sm font-semibold rounded-lg cursor-pointer transition-all hover:bg-[#1d4ed8] hover:-translate-y-px active:translate-y-0 tracking-[0.01em] w-full">
              Login
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
