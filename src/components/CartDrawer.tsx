import React, { useState } from 'react';
import { X, Trash2, ArrowRight, ShieldCheck, Tag, Plus, Minus, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext.js';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
  onExploreMore: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout, onExploreMore }) => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    itemTotal,
    deliveryFee,
    taxAmount,
    discountAmount,
    totalAmount,
    couponCode,
    applyCoupon,
    removeCoupon,
    error,
    clearError,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isCartOpen) return null;

  const handleApply = (codeToApply?: string) => {
    const code = codeToApply || inputCoupon;
    const ok = applyCoupon(code);
    if (ok) {
      setCouponMsg({ text: `Coupon ${code.toUpperCase()} applied!`, isError: false });
      setInputCoupon('');
    } else {
      setCouponMsg({ text: 'Invalid coupon. Try QUICK50 or FREEDEL', isError: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
                My Shopping Basket
              </h2>
              <div className="text-xs text-slate-500 mt-0.5">
                {items.length} {items.length === 1 ? 'item' : 'items'} · Delivered in ~10 mins
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stock Error Notification if any */}
          {error && (
            <div className="mx-4 mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
              <button onClick={clearError} className="text-xs font-bold underline ml-2">
                Dismiss
              </button>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 mb-3">
                  <Tag className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Your basket is empty
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Browse fresh fruits, vegetables, dairy, pulses, cookware, and crockery!
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onExploreMore();
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.productId}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 flex items-center gap-3"
                >
                  <img
                    src={item.product?.imageUrl}
                    alt={item.product?.name || 'Item'}
                    className="w-14 h-14 object-cover rounded-lg bg-white shrink-0"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {item.product?.name || 'Product'}
                    </h4>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {item.product?.unit} · ₹{item.product?.sellingPrice} each
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1 tabular-nums">
                      ₹{((item.product?.sellingPrice || 0) * item.quantity).toFixed(0)}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2 py-1 rounded-lg shrink-0">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-4 h-4 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-emerald-600"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-semibold w-4 text-center tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-4 h-4 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-emerald-600"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.productId)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Bill & Checkout */}
          {items.length > 0 && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 space-y-3">
              {/* Promo Coupon Box */}
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputCoupon}
                    onChange={(e) => setInputCoupon(e.target.value)}
                    placeholder="Enter Coupon (QUICK50 / FREEDEL)"
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs uppercase placeholder:normal-case focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={() => handleApply()}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-slate-800 text-xs font-semibold hover:bg-slate-800"
                  >
                    Apply
                  </button>
                </div>

                {couponCode && (
                  <div className="flex items-center justify-between text-[11px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-lg">
                    <span>Applied: <strong>{couponCode}</strong></span>
                    <button onClick={removeCoupon} className="text-rose-500 hover:underline">
                      Remove
                    </button>
                  </div>
                )}

                {couponMsg && (
                  <div
                    className={`text-[11px] ${
                      couponMsg.isError ? 'text-rose-500' : 'text-emerald-600'
                    }`}
                  >
                    {couponMsg.text}
                  </div>
                )}
              </div>

              {/* Bill Details */}
              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex justify-between">
                  <span>Item Total</span>
                  <span className="tabular-nums font-medium text-slate-800 dark:text-slate-200">
                    ₹{itemTotal}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Partner Fee</span>
                  <span className="tabular-nums font-medium text-slate-800 dark:text-slate-200">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-600 font-semibold">FREE (Above ₹299)</span>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes (5% GST)</span>
                  <span className="tabular-nums font-medium text-slate-800 dark:text-slate-200">
                    ₹{taxAmount}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                    <span>Discount Savings</span>
                    <span className="tabular-nums">-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>To Pay</span>
                  <span className="tabular-nums text-emerald-600 dark:text-emerald-400">
                    ₹{totalAmount}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-between shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-200" />
                  <span>Proceed to Checkout</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>₹{totalAmount}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
