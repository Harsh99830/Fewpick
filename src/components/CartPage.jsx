import { ArrowLeft, Trash2, Plus, Minus, MapPin, User, Phone, FileText, Clock, ChevronDown, Info, Zap } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function CartPage({ cartItems, onUpdateQty, onNavigateHome, orderingEnabled = true, closedMessage }) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [customerName, setCustomerName] = useState(() => {
    return localStorage.getItem('fewpick_customer_name') || '';
  });
  const [customerPhone, setCustomerPhone] = useState(() => {
    return localStorage.getItem('fewpick_customer_phone') || '';
  });
  const [customerAddress, setCustomerAddress] = useState(() => {
    return localStorage.getItem('fewpick_customer_address') || '';
  });
  const [nameError, setNameError] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [addressError, setAddressError] = useState(false);

  // State for Rider Fee / Rider's Effort selection: 10 (default selected), 15, 20, or custom
  const [riderTip, setRiderTip] = useState(10);
  const [customTip, setCustomTip] = useState('');
  const [isCustomTip, setIsCustomTip] = useState(false);

  // Custom tip validation (must be between ₹10 and ₹50)
  const parsedCustomTip = parseInt(customTip, 10);
  const isValidCustomTip = !isNaN(parsedCustomTip) && parsedCustomTip >= 10 && parsedCustomTip <= 50;

  // Is Rider's Effort option selected & valid?
  const isTipSelected = (isCustomTip && isValidCustomTip) || (!isCustomTip && riderTip !== null);

  // Computations
  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  
  // Delivery Charge / Rider's Effort calculation (default 10)
  const deliveryCharge = subtotal > 0
    ? (isCustomTip ? (isValidCustomTip ? parsedCustomTip : 10) : (riderTip !== null ? riderTip : 10))
    : 0;
  
  const grandTotal = subtotal + deliveryCharge;

  const generateShortId = (length = 8) => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setCustomerName(val);
    localStorage.setItem('fewpick_customer_name', val);
    if (val.trim()) {
      setNameError(false);
    }
  };

  const handlePhoneChange = (e) => {
    // Only allow numbers and limit max length to 10 digits
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setCustomerPhone(digitsOnly);
    localStorage.setItem('fewpick_customer_phone', digitsOnly);
    if (digitsOnly.length === 10) {
      setPhoneError('');
    }
  };

  const handleAddressChange = (e) => {
    const val = e.target.value;
    setCustomerAddress(val);
    localStorage.setItem('fewpick_customer_address', val);
    if (val.trim()) {
      setAddressError(false);
    }
  };

  const handleCheckout = async () => {
    if (!orderingEnabled) return;
    
    let hasErr = false;
    if (!customerName || !customerName.trim()) {
      setNameError(true);
      hasErr = true;
    }

    const cleanPhone = customerPhone.replace(/\D/g, '').trim();
    if (!cleanPhone) {
      setPhoneError('Required');
      hasErr = true;
    } else if (cleanPhone.length !== 10) {
      setPhoneError('Invalid 10-digit number');
      hasErr = true;
    } else {
      setPhoneError('');
    }

    if (!customerAddress || !customerAddress.trim()) {
      setAddressError(true);
      hasErr = true;
    }

    if (hasErr) return;

    setIsCheckingOut(true);
    const orderId = generateShortId(8);
    const cleanName = customerName.trim();
    const cleanAddress = customerAddress.trim();
    
    // Formulate a clean WhatsApp order message with customer name, phone & delivery address
    let message = `*New Order from ${cleanName} (${orderId})*\n\n`;
    cartItems.forEach((item) => {
      message += `• ${item.product.name} (${item.product.weight}) - ${item.quantity} x ₹${item.product.price} = ₹${item.product.price * item.quantity}\n`;
    });
    message += `\n*Customer Name:* ${cleanName}`;
    message += `\n*Phone:* ${cleanPhone}`;
    message += `\n*Delivery Address:* ${cleanAddress}`;
    message += `\n*Item Total:* ₹${subtotal}`;
    message += `\n*Rider's Effort:* ₹${deliveryCharge}`;
    message += `\n*Grand Total:* ₹${grandTotal}`;
    const waUrl = `https://wa.me/919719214408?text=${encodeURIComponent(message)}`;

    // Prepare DB insert payload
    const orderItems = cartItems.map(item => ({
      product_id: item.product.id,
      name: item.product.name,
      weight: item.product.weight,
      quantity: item.quantity,
      price: item.product.price
    }));

    try {
      // Save order to Supabase expected_orders table
      const { error } = await supabase.from('expected_orders').insert({
        id: orderId,
        name: cleanName,
        phone: cleanPhone,
        address: cleanAddress,
        items: orderItems,
        subtotal: subtotal,
        rider_effort: deliveryCharge,
        grand_total: grandTotal,
        status: 'pending',
        confirm: 'No'
      });
      
      if (error) {
        console.error("Failed to save order to database:", error.message);
      }
    } catch (err) {
      console.error("Error saving order to database:", err);
    } finally {
      setIsCheckingOut(false);
      // Open WhatsApp directly
      window.location.href = waUrl;
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-[480px] py-20 px-4 mx-auto text-center flex flex-col items-center animate-drop-in">
        <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-[-0.02em]">Your cart is empty</h2>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
          There are no items in your cart. Choose from our top categories and add some items to get started.
        </p>
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 hover:bg-black text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-px active:translate-y-0 cursor-pointer border-none"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[620px] mx-auto py-2 sm:py-4 px-3 sm:px-4 animate-drop-in">
      {/* Back button */}
      <button
        onClick={onNavigateHome}
        className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors mb-4 cursor-pointer bg-none border-none p-0 group"
      >
        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 transition-transform group-hover:-translate-x-0.5">
          <ArrowLeft size={16} />
        </div>
        <span>Back to Shopping</span>
      </button>



      <div className="flex flex-col gap-5 sm:gap-6">
        {/* Cart Items Cards */}
        <div className="flex flex-col gap-3">
          {cartItems.map((item) => (
            <div
              key={item.product.id}
              className="bg-white rounded-2xl border border-gray-200/80 p-2.5 sm:p-3 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center gap-3"
            >
              {/* Image Box */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-50 rounded-xl flex-shrink-0 flex items-center justify-center p-1 border border-gray-100 overflow-hidden">
                <img src={item.product.image} alt={item.product.name} className="w-full h-full object-contain" />
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-gray-900 m-0 leading-tight truncate mb-0.5">
                  {item.product.name}
                </h3>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm sm:text-base font-extrabold text-gray-900">₹{item.product.price}</span>
                  {item.product.mrp && item.product.mrp > item.product.price && (
                    <span className="text-[10px] sm:text-xs text-gray-400 line-through">₹{item.product.mrp}</span>
                  )}
                </div>
              </div>

              {/* Stepper */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <div className="flex items-center border border-green-600/30 rounded-xl bg-green-50/50 overflow-hidden">
                  <button
                    onClick={() => onUpdateQty(item.product.id, item.quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center text-green-700 hover:bg-green-600 hover:text-white transition-colors cursor-pointer border-none bg-transparent"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-6 text-center text-xs font-black text-gray-900">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQty(item.product.id, item.quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center text-green-700 hover:bg-green-600 hover:text-white transition-colors cursor-pointer border-none bg-transparent"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Divider Line */}
        <div className="border-b border-dashed border-gray-200 my-1" />

        {/* Section 2: Customer Contact Info Card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-3.5 sm:p-4 flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-3">
            {/* Name Box */}
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <label className="text-[11px] sm:text-xs font-bold text-gray-800 truncate">Your Name</label>
                {nameError && <span className="text-[10px] font-extrabold text-rose-500 flex-shrink-0">Required</span>}
              </div>
              <div className="relative flex items-center">
                <User size={14} className="absolute left-2.5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={customerName}
                  onChange={handleNameChange}
                  placeholder="Enter name"
                  className={`w-full pl-8 pr-2.5 py-2 rounded-xl border text-[11px] sm:text-xs font-semibold outline-none transition-all ${
                    nameError
                      ? 'border-rose-500 bg-rose-50/50 text-rose-900'
                      : 'border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10'
                  }`}
                />
              </div>
            </div>

            {/* Mobile Box */}
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <label className="text-[11px] sm:text-xs font-bold text-gray-800 truncate">Mobile Number</label>
                {phoneError && (
                  <span className="text-[10px] font-extrabold text-rose-500 flex-shrink-0 truncate" title={phoneError}>
                    {phoneError}
                  </span>
                )}
              </div>
              <div className="relative flex items-center">
                <Phone size={14} className="absolute left-2.5 text-gray-400 pointer-events-none" />
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={handlePhoneChange}
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  className={`w-full pl-8 pr-2.5 py-2 rounded-xl border text-[11px] sm:text-xs font-semibold outline-none transition-all ${
                    phoneError
                      ? 'border-rose-500 bg-rose-50/50 text-rose-900'
                      : 'border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Delivery Address Box */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <label className="text-[11px] sm:text-xs font-bold text-gray-800 truncate">Delivery Address</label>
              {addressError && <span className="text-[10px] font-extrabold text-rose-500 flex-shrink-0">Required</span>}
            </div>
            <div className="relative flex items-center">
              <MapPin size={14} className="absolute left-2.5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={customerAddress}
                onChange={handleAddressChange}
                placeholder="Hostel name or campus location"
                className={`w-full pl-8 pr-2.5 py-2 rounded-xl border text-[11px] sm:text-xs font-semibold outline-none transition-all ${
                  addressError
                    ? 'border-rose-500 bg-rose-50/50 text-rose-900'
                    : 'border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Order Summary Card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileText size={18} />
            </div>
            <h3 className="text-base font-bold text-gray-900 m-0">Order Summary</h3>
          </div>

          <div className="flex flex-col gap-2.5 text-xs sm:text-sm">
            <div className="flex justify-between items-center text-gray-900 font-bold text-sm sm:text-base">
              <span>Item Total</span>
              <span className="font-extrabold text-gray-900 text-sm sm:text-base">₹{subtotal}</span>
            </div>
            <div className="flex flex-col gap-2.5 border-b border-dashed border-gray-200 pb-3.5">
              {/* Row 1: Header title on left, calculated fee amount on right */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm sm:text-base font-bold text-gray-900">Rider's Effort</span>
                  <span className="text-[10px] text-gray-400 font-medium mt-0.5">Minimum ₹10 • Increase it if you'd like</span>
                </div>
                <span className="font-extrabold text-gray-900 text-sm sm:text-base">₹{deliveryCharge}</span>
              </div>

              {/* Row 2: Systematic option pills */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                {[10, 15, 20].map((amount) => {
                  const isActive = !isCustomTip && riderTip === amount;
                  return (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => {
                        setIsCustomTip(false);
                        setRiderTip(amount);
                      }}
                      className={`py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer text-center ${
                        isActive
                          ? 'bg-[#00A859] text-white border-[#00A859] font-extrabold shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      ₹{amount}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => {
                    setIsCustomTip(!isCustomTip);
                    if (!isCustomTip) setRiderTip(null);
                    else setRiderTip(10);
                  }}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer text-center ${
                    isCustomTip
                      ? 'bg-[#00A859] text-white border-[#00A859] font-extrabold shadow-xs'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  Custom
                </button>
              </div>

              {/* Simple helper text below pills */}
              <p className="text-[11px] font-medium text-gray-500 m-0 mt-0.5">
                100% transferred directly to your rider
              </p>

              {/* Custom Tip Input Field */}
              {isCustomTip && (
                <div className="pt-1 animate-drop-in">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">₹</span>
                    <input
                      type="number"
                      min="10"
                      max="50"
                      placeholder="10 to 50"
                      value={customTip}
                      onChange={(e) => setCustomTip(e.target.value)}
                      className={`w-full pl-6 pr-3 py-1.5 bg-white border rounded-lg text-xs font-semibold text-gray-900 focus:outline-none ${
                        customTip !== '' && !isValidCustomTip
                          ? 'border-red-500 text-red-600'
                          : 'border-gray-300 focus:border-amber-500'
                      }`}
                    />
                  </div>
                  {customTip !== '' && !isValidCustomTip && (
                    <span className="text-[10px] font-medium text-red-500 mt-1 block">
                      Enter between ₹10 and ₹50
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-between text-base font-extrabold text-gray-900 pt-1">
              <span>Grand Total</span>
              <span className="text-xl font-black text-amber-600">₹{grandTotal}</span>
            </div>
          </div>

          {/* Place Order WhatsApp Button */}
          {!orderingEnabled ? (
            <button
              disabled
              className="w-full py-3.5 bg-gray-100 text-gray-400 font-bold rounded-xl border border-gray-200 cursor-not-allowed text-sm flex items-center justify-center gap-2"
            >
              <span>Store is closed</span>
            </button>
          ) : (
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut || (isCustomTip && !isValidCustomTip)}
              className="w-full py-3.5 bg-[#00A859] hover:bg-[#00964f] text-white font-extrabold rounded-xl shadow-[0_4px_16px_rgba(0,168,89,0.3)] transition-all active:scale-[0.99] text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-300 border-none"
            >
              {isCheckingOut ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Connecting to WhatsApp...
                </span>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span>Place order via WhatsApp</span>
                </>
              )}
            </button>
          )}

          {/* Delivery Note Box */}
          <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl p-3 flex flex-col gap-2.5">
            {/* Line 1: Slot info */}
            <div className="flex items-center gap-2.5 text-xs text-amber-950 font-medium">
              <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                <Clock size={15} />
              </div>
              <p className="m-0 leading-snug">
                Orders are processed in <strong>20–25 minute slots</strong>.
              </p>
            </div>

            {/* Line 2: Quick Delivery info */}
            <div className="flex items-center gap-2.5 text-xs text-amber-950 font-medium">
              <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                <Zap size={15} className="fill-amber-500" />
              </div>
              <p className="m-0 leading-snug">
                For <strong>Quick Delivery</strong>, message us after placing order. <strong>₹10 extra applies</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
