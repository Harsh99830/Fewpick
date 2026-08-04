import { ArrowLeft, Trash2, Plus, Minus, ShieldCheck, Tag, ShoppingBag, Check, Percent } from 'lucide-react';
import { useState } from 'react';

export default function CartPage({ cartItems, onUpdateQty, onNavigateHome }) {
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState('');

  // Computations
  const totalMRP = cartItems.reduce((acc, item) => acc + (item.product.mrp * item.quantity), 0);
  const totalDiscount = cartItems.reduce((acc, item) => acc + ((item.product.mrp - item.product.price) * item.quantity), 0);
  const subtotal = totalMRP - totalDiscount;
  
  // Delivery Charge: Free if subtotal > 150, else 35
  const deliveryCharge = subtotal > 150 || subtotal === 0 ? 0 : 35;
  
  // Promo code discount: 10% off
  const promoDiscount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  
  const grandTotal = subtotal + deliveryCharge - promoDiscount;

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'FEWPICK10') {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError('Invalid coupon. Try FEWPICK10!');
      setPromoApplied(false);
    }
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    const orderId = `FP-${Math.floor(100000 + Math.random() * 900000)}`;
    setPlacedOrderId(orderId);
    setTimeout(() => {
      setIsCheckingOut(false);
      setOrderPlaced(true);
    }, 1500); // simulate API call
  };

  if (orderPlaced) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-[600px] mx-auto bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-drop-in">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-6 shadow-inner animate-bounce">
          <Check size={40} className="stroke-[3]" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Order Placed Successfully!</h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed max-w-[400px]">
          Thank you for shopping with FewPick. Your order <span className="font-extrabold text-gray-800">{placedOrderId}</span> has been placed and will reach you in <span className="font-bold text-orange-500">10 mins</span>!
        </p>
        <button
          onClick={() => {
            // First clear all items from the cart
            cartItems.forEach(item => onUpdateQty(item.product.id, 0));
            // Navigate back to homepage
            onNavigateHome();
          }}
          className="px-8 py-3.5 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-xl shadow-[0_4px_14px_rgba(22,163,74,0.3)] transition-all transform hover:-translate-y-px active:translate-y-0 text-sm cursor-pointer"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-[500px] mx-auto animate-drop-in">
        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 mb-6 relative">
          <ShoppingBag size={44} className="stroke-[1.5]" />
          <span className="absolute top-5 right-5 w-3.5 h-3.5 bg-rose-500 rounded-full animate-ping" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Your Cart is Empty</h2>
        <p className="text-sm text-gray-400 mb-8 leading-relaxed">
          Looks like you haven't added anything to your cart yet. Browse our top categories and grab some fresh items!
        </p>
        <button
          onClick={onNavigateHome}
          className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-[0_4px_14px_rgba(99,102,241,0.3)] transition-all transform hover:-translate-y-px active:translate-y-0 text-sm cursor-pointer"
        >
          Explore Products
        </button>
      </div>
    );
  }

  return (
    <div className="animate-drop-in">
      {/* Back button */}
      <button
        onClick={onNavigateHome}
        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors mb-6 cursor-pointer bg-none border-none p-0 group"
      >
        <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
        Back to Shopping
      </button>

      <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-8 tracking-[-0.03em]">
        Your <span className="text-indigo-600">Shopping Cart</span> ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {cartItems.map((item) => {
            return (
              <div
                key={item.product.id}
                className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-[#e8eaf0] shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all hover:border-[#e0e2f0]"
              >
                {/* Image */}
                <div className="w-20 h-20 bg-gray-50 rounded-xl flex-shrink-0 flex items-center justify-center p-2 border border-gray-100">
                  <img src={item.product.image} alt={item.product.name} className="w-full h-full object-contain" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <span className="text-[0.65rem] font-extrabold text-orange-600 bg-orange-50 px-2 py-0.5 rounded uppercase tracking-wider">
                    {item.product.weight}
                  </span>
                  <h3 className="text-sm font-bold text-gray-900 mt-1 mb-0.5 truncate">{item.product.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-extrabold text-gray-900">₹{item.product.price}</span>
                    <span className="text-xs text-gray-400 line-through">₹{item.product.mrp}</span>
                  </div>
                </div>

                {/* Quantity + Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                    <button
                      onClick={() => onUpdateQty(item.product.id, item.quantity - 1)}
                      className="p-2 hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer border-none"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-extrabold text-gray-800">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQty(item.product.id, item.quantity + 1)}
                      className="p-2 hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer border-none"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => onUpdateQty(item.product.id, 0)}
                    className="p-2 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-all cursor-pointer border-none"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cart Summary */}
        <div className="bg-white rounded-2xl border border-[#e8eaf0] shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-6 flex flex-col gap-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-4">Bill Details</h2>

          {/* Promo code */}
          <form onSubmit={handleApplyPromo} className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter promo (FEWPICK10)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                disabled={promoApplied}
                className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-indigo-500 disabled:opacity-50 placeholder:text-gray-400 font-medium"
              />
              <button
                type="submit"
                disabled={promoApplied}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl disabled:bg-green-600 transition-colors cursor-pointer"
              >
                {promoApplied ? <Check size={16} /> : 'Apply'}
              </button>
            </div>
            {promoApplied && (
              <span className="text-xs font-bold text-green-600 flex items-center gap-1 animate-drop-in">
                <Tag size={12} /> Coupon 'FEWPICK10' Applied (10% Off)
              </span>
            )}
            {promoError && <span className="text-xs font-bold text-rose-500 animate-drop-in">{promoError}</span>}
          </form>

          {/* Bill Breakdowns */}
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Item Total (MRP)</span>
              <span>₹{totalMRP}</span>
            </div>
            <div className="flex justify-between text-green-600 font-medium">
              <span>Product Discount</span>
              <span>-₹{totalDiscount}</span>
            </div>
            {promoApplied && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Promo Discount (10%)</span>
                <span>-₹{promoDiscount}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-500 border-b border-dashed border-gray-100 pb-3">
              <span>Delivery Charges</span>
              <span>{deliveryCharge === 0 ? <span className="text-green-600 font-bold uppercase text-xs bg-green-50 px-2 py-0.5 rounded text-[10px]">FREE</span> : `₹${deliveryCharge}`}</span>
            </div>
            <div className="flex justify-between text-base font-black text-gray-900 pt-1">
              <span>Grand Total</span>
              <span className="text-lg">₹{grandTotal}</span>
            </div>
          </div>

          {/* Savings Callout */}
          <div className="bg-green-50/50 border border-green-100 rounded-xl p-3 flex items-start gap-2.5 text-xs text-green-700">
            <Percent size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
            <div className="font-semibold">
              Yay! You saved ₹{totalDiscount + promoDiscount} on this order.
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={isCheckingOut}
            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-xl shadow-[0_4px_20px_rgba(22,163,74,0.25)] transition-all transform hover:-translate-y-px active:translate-y-0 text-sm flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-400 border-none"
          >
            {isCheckingOut ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              <span>Proceed to Checkout</span>
            )}
          </button>

          {/* Security details */}
          <div className="flex items-center justify-center gap-1.5 text-[0.7rem] text-gray-400 font-semibold uppercase tracking-wider mt-1">
            <ShieldCheck size={14} className="text-green-600" />
            <span>100% Safe and Secure Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
}
