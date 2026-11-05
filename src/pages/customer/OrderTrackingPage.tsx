import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Phone,
  ShieldCheck,
  MapPin,
  Truck,
  Package,
  AlertCircle,
  KeyRound,
  RefreshCw,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types/index.js';
import { api } from '../../services/api.js';

interface OrderTrackingPageProps {
  orderId: string;
  onBack: () => void;
  onExploreMore: () => void;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({
  orderId,
  onBack,
  onExploreMore,
}) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [riderProgress, setRiderProgress] = useState(65); // percentage along route

  const statusSteps: OrderStatus[] = [
    'Order Placed',
    'Order Confirmed',
    'Preparing Order',
    'Ready for Pickup',
    'Delivery Partner Assigned',
    'Out for Delivery',
    'Delivered',
  ];

  const fetchOrder = async () => {
    try {
      const res = await api.getOrderById(orderId);
      setOrder(res.order);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // Poll every 5s for live status updates
    const interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  // Simulate rider movement along the delivery route if Out for Delivery
  useEffect(() => {
    if (order?.orderStatus === 'Out for Delivery') {
      const anim = setInterval(() => {
        setRiderProgress((prev) => (prev >= 92 ? 65 : prev + 3));
      }, 2000);
      return () => clearInterval(anim);
    }
  }, [order?.orderStatus]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          Connecting to Hyperlocal Dispatch Hub...
        </h3>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Order not found</h3>
        <button
          onClick={onExploreMore}
          className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const currentStepIndex = statusSteps.indexOf(order.orderStatus);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Orders</span>
      </button>

      {/* Main Delivery Status Card */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Live Order Tracking
              </span>
              <span>·</span>
              <span className="text-xs text-slate-500 font-mono">#{order.id}</span>
            </div>
            <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white mt-1">
              {order.orderStatus === 'Delivered'
                ? 'Order Delivered Successfully!'
                : `Arriving in ~${order.estimatedDeliveryMinutes} Minutes`}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {order.items.length} items
            </p>
          </div>

          {/* Delivery OTP Card (Crucial Security Feature) */}
          {order.orderStatus !== 'Delivered' && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md flex items-center gap-4">
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-xs">
                <KeyRound className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">
                  Delivery OTP
                </div>
                <div className="text-2xl font-mono font-black tracking-widest leading-none mt-0.5">
                  {order.deliveryOtp}
                </div>
                <div className="text-[10px] text-emerald-100 mt-1">
                  Share only with delivery rider
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Map Visualization */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-[21/9] bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
          {/* Simulated Map Canvas */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
            {/* Map grid streets */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-200 dark:text-slate-800" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* S-curve delivery road */}
            <path
              d="M 60 120 Q 200 40 380 90 T 700 80"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Active route highlight */}
            <path
              d="M 60 120 Q 200 40 380 90 T 700 80"
              fill="none"
              stroke="url(#routeGrad)"
              strokeWidth="4"
              strokeDasharray="8 6"
              strokeLinecap="round"
            />
          </svg>

          {/* Dark store origin marker */}
          <div className="absolute left-10 top-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs shadow-md">
              <Package className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded shadow-xs mt-1 text-slate-700 dark:text-slate-300">
              Dark Store #4
            </span>
          </div>

          {/* Moving Delivery Partner Marker */}
          {order.orderStatus !== 'Delivered' && (
            <div
              style={{ left: `${riderProgress}%` }}
              className="absolute top-1/2 -translate-y-8 flex flex-col items-center transition-all duration-1000"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xl ring-4 ring-emerald-500/30 animate-bounce">
                <Truck className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold bg-emerald-700 text-white px-2 py-0.5 rounded-full shadow-xs mt-1">
                Rider en route
              </span>
            </div>
          )}

          {/* Customer destination marker */}
          <div className="absolute right-12 top-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg ring-4 ring-rose-500/20">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded shadow-xs mt-1 text-slate-700 dark:text-slate-300">
              Your Doorstep
            </span>
          </div>
        </div>

        {/* 7-Step Status Timeline */}
        <div className="py-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
            Live Timeline
          </div>
          <div className="relative flex items-center justify-between">
            {/* Progress line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-700 -translate-y-1/2 z-0" />
            <div
              style={{
                width: `${Math.min(100, (Math.max(0, currentStepIndex) / (statusSteps.length - 1)) * 100)}%`,
              }}
              className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-500"
            />

            {statusSteps.map((step, idx) => {
              const isDone = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step} className="relative z-10 flex flex-col items-center text-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isDone
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950'
                        : 'bg-white dark:bg-slate-800 text-slate-400 border-2 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span
                    className={`text-[10px] max-w-[70px] mt-2 hidden sm:block ${
                      isCurrent
                        ? 'font-bold text-emerald-600 dark:text-emerald-400'
                        : isDone
                        ? 'text-slate-700 dark:text-slate-300 font-medium'
                        : 'text-slate-400'
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Delivery Partner Details Card */}
        {order.deliveryPartnerName && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 shrink-0 font-bold text-sm">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-500">Your QuickBasket Partner</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {order.deliveryPartnerName}
                </div>
                <div className="text-[11px] text-emerald-600 font-medium">
                  ★ 4.9 · Vaccinated & Temperature Verified
                </div>
              </div>
            </div>

            <a
              href={`tel:${order.deliveryPartnerPhone || '+919822011223'}`}
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-100 transition-colors shadow-2xs"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Call Partner</span>
            </a>
          </div>
        )}

        {/* Order Items & Address Summary */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Delivery Destination
            </h3>
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <div className="font-semibold text-slate-900 dark:text-white">
                {order.customerName} ({order.deliveryAddress.tag})
              </div>
              <div>{order.deliveryAddress.street}</div>
              <div>{order.deliveryAddress.area}, {order.deliveryAddress.city} - {order.deliveryAddress.pincode}</div>
              <div className="text-slate-500">Phone: {order.customerPhone}</div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Receipt Summary
            </h3>
            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-medium tabular-nums text-slate-800 dark:text-slate-200">
                  ₹{order.itemTotal}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-medium tabular-nums text-slate-800 dark:text-slate-200">
                  {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & Fees</span>
                <span className="font-medium tabular-nums text-slate-800 dark:text-slate-200">
                  ₹{order.taxAmount}
                </span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Savings</span>
                  <span className="tabular-nums">-₹{order.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>Total Paid ({order.paymentMethod})</span>
                <span className="tabular-nums text-emerald-600 dark:text-emerald-400">
                  ₹{order.totalAmount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
