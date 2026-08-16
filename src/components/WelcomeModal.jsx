import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('fewpick_welcome_seen');
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, []);

  // Lock body scroll when popup is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose('close');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleClose = async (actionType = 'close') => {
    // Save to LocalStorage so popup never appears again on reload
    localStorage.setItem('fewpick_welcome_seen', 'true');
    setIsOpen(false);

    // Save event count in Supabase database
    try {
      await supabase.from('welcome_popup_clicks').insert({
        action: actionType,
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString()
      });
    } catch (err) {
      console.log('Welcome popup event logged locally:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={() => handleClose('backdrop_click')}
      className="fixed inset-0 z-[400] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in cursor-pointer"
    >
      {/* Simple Minimal Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white w-full max-w-[380px] rounded-3xl shadow-2xl p-6 sm:p-7 z-10 animate-drop-in border border-gray-100 flex flex-col gap-5 text-center cursor-default"
      >
        {/* Close Button */}
        <button
          onClick={() => handleClose('close')}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-all border-none cursor-pointer"
          title="Close"
        >
          <X size={18} />
        </button>

        {/* Minimal Header */}
        <div className="flex flex-col gap-1 pt-2">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-tight m-0">
            Welcome to FewPick
          </h2>
          <p className="text-xs text-gray-400 font-medium m-0">
            Poornima University Campus Delivery
          </p>
        </div>

        {/* 2 Simple Highlight Lines */}
        <div className="flex flex-col gap-2.5 text-left bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-2.5 text-xs text-gray-800 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
            <span>Orders delivered in <strong>20-25 minute time slots</strong></span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-gray-800 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
            <span><strong>No minimum order</strong>, order even a single item</span>
          </div>
        </div>

        {/* Simple Action Button */}
        <button
          onClick={() => handleClose('shop_now')}
          className="w-full py-3.5 bg-gray-950 hover:bg-black text-white text-xs font-extrabold rounded-xl transition-all shadow-sm hover:-translate-y-px active:translate-y-0 cursor-pointer border-none"
        >
          Shop Now
        </button>
      </div>
    </div>
  );
}
