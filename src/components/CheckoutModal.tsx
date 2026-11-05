import React, { useState } from 'react';
import { X, MapPin, Phone, CreditCard, Banknote, QrCode, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { Order } from '../types/index.js';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onOrderSuccess }) => {
  const { user } = useAuth();
  const { items, totalAmount, couponCode, clearCart } = useCart();

  const [customerName, setCustomerName] = useState(user?.name || 'Priya Sundaram');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '+91 99440 88990');
  const [selectedAddressType, setSelectedAddressType] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [streetAddress, setStreetAddress] = useState('Flat 402, Green Glen Heights, 14th Main');
  const [area, setArea] = useState('HSR Layout Sector 4');
  const [deliveryInstructions, setDeliveryInstructions] = useState('Leave with security if not available');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Cash on Delivery' | 'Card / NetBanking'>('UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const orderPayload = {
        customerName,
        customerPhone,
        deliveryAddress: {
          tag: selectedAddressType,
          street: streetAddress,
          area,
          city: 'Bengaluru',
          pincode: '560102',
          instructions: deliveryInstructions,
        },
        paymentMethod,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        couponCode,
      };

      const res = await api.checkout(orderPayload);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }

      await clearCart();
      onClose();
      onOrderSuccess(res.order);
    } catch (err: any) {
      setErrorMessage(err.message || 'Checkout failed. Please verify stock.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
              <span>Checkout & Delivery Details</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                10-Min Fast Track
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Confirm your drop location & payment method
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Contact Details */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Recipient Contact
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 dark:text-white"
                />
              </div>
              <div>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Phone Number (+91)"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Delivery Address</span>
              </label>
              <div className="flex gap-1.5">
                {(['Home', 'Work', 'Other'] as const).map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => setSelectedAddressType(tag)}
                    className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium transition-colors ${
                      selectedAddressType === tag
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              required
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              placeholder="Flat / House / Floor / Building Name"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 dark:text-white"
            />
            <input
              type="text"
              required
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Area / Landmark / City"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 dark:text-white"
            />
            <input
              type="text"
              value={deliveryInstructions}
              onChange={(e) => setDeliveryInstructions(e.target.value)}
              placeholder="Delivery Instructions (Optional: e.g. Don't ring bell)"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 dark:text-white placeholder:text-slate-400"
            />
          </div>

          {/* Payment Method */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  paymentMethod === 'UPI'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-100 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <QrCode className="w-5 h-5 text-emerald-600 mb-2" />
                <div>
                  <div className="text-xs font-bold">UPI / QR</div>
                  <div className="text-[10px] text-slate-500">Google Pay / PhonePe</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Cash on Delivery')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  paymentMethod === 'Cash on Delivery'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-100 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Banknote className="w-5 h-5 text-emerald-600 mb-2" />
                <div>
                  <div className="text-xs font-bold">Cash on Delivery</div>
                  <div className="text-[10px] text-slate-500">Pay at doorstep</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Card / NetBanking')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  paymentMethod === 'Card / NetBanking'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-100 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <CreditCard className="w-5 h-5 text-emerald-600 mb-2" />
                <div>
                  <div className="text-xs font-bold">Card / NetBanking</div>
                  <div className="text-[10px] text-slate-500">Demo Instant Mode</div>
                </div>
              </button>
            </div>
            <div className="text-[11px] text-slate-400 italic">
              Note: Clearly labelled demo transaction environment. Orders update real warehouse stock.
            </div>
          </div>

          {/* Action button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting || items.length === 0}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.01]"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {isSubmitting ? 'Placing Order...' : `Pay & Place Order · ₹${totalAmount}`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
