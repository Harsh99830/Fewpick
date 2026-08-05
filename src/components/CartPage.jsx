import { ArrowLeft, Trash2, Plus, Minus } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function CartPage({ cartItems, onUpdateQty, onNavigateHome }) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState('');

  // Computations
  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  
  // Delivery Charge: Fixed charge of ₹10
  const deliveryCharge = subtotal > 0 ? 10 : 0;
  
  const grandTotal = subtotal + deliveryCharge;

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    const orderId = `FP-${Math.floor(100000 + Math.random() * 900000)}`;
    setPlacedOrderId(orderId);
    
    // Formulate a clean WhatsApp order message with text details
    let message = `*New Order from FewPick (${orderId})*\n\n`;
    cartItems.forEach((item) => {
      message += `• ${item.product.name} (${item.product.weight}) - ${item.quantity} x ₹${item.product.price} = ₹${item.product.price * item.quantity}\n`;
    });
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
    }

    setTimeout(() => {
      setIsCheckingOut(false);
      setOrderPlaced(true);
      window.open(waUrl, '_blank');
    }, 1200); // simulate API call and open WhatsApp
  };

  if (orderPlaced) {
    return (
      <div className="max-w-[480px] py-16 px-4 mx-auto text-center flex flex-col items-center animate-drop-in">
        <div className="text-sm font-bold text-green-600 mb-3.5 flex items-center justify-center gap-1.5">
          <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse" /> Order Confirmed
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-[-0.02em]">Thank you for your order!</h2>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
          Your order <span className="font-semibold text-gray-800">{placedOrderId}</span> has been successfully placed. We're getting it ready and it will be delivered within <span className="font-semibold text-gray-800">10 minutes</span>.
        </p>
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 hover:bg-black text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-px active:translate-y-0 cursor-pointer border-none"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

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
        Your Shopping Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
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

          {/* Bill Breakdowns */}
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Item Total</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-500 border-b border-dashed border-gray-100 pb-3">
              <span>Rider's Effort</span>
              <span>₹{deliveryCharge}</span>
            </div>
            <div className="flex justify-between text-base font-black text-gray-900 pt-1">
              <span>Grand Total</span>
              <span className="text-lg">₹{grandTotal}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={isCheckingOut}
            className="w-full py-4 bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold rounded-xl shadow-[0_4px_20px_rgba(37,211,102,0.25)] transition-all transform hover:-translate-y-px active:translate-y-0 text-sm flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-400 border-none"
          >
            {isCheckingOut ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Connecting to WhatsApp...
              </span>
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="flex-shrink-0">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>Place order via WhatsApp</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
