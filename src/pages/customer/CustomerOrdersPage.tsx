import React, { useState, useEffect } from 'react';
import { Package, ChevronRight, Clock, CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react';
import { Order } from '../../types/index.js';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';

interface CustomerOrdersPageProps {
  onTrackOrder: (orderId: string) => void;
  onExploreProducts: () => void;
}

export const CustomerOrdersPage: React.FC<CustomerOrdersPageProps> = ({
  onTrackOrder,
  onExploreProducts,
}) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      try {
        const res = await api.getOrders({ customerId: user?.id });
        setOrders(res.orders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
          My Orders & History
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Track active 10-minute dispatches and review previous orders
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No orders placed yet
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Order fresh groceries and get them delivered to your doorstep in 10 minutes!
          </p>
          <button
            onClick={onExploreProducts}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => onTrackOrder(order.id)}
              className="group p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 hover:shadow-lg hover:border-emerald-500/50 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                    #{order.id}
                  </span>
                  <span>·</span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      order.orderStatus === 'Delivered'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : order.orderStatus === 'Cancelled'
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700'
                        : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                    }`}
                  >
                    {order.orderStatus}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
                  {order.items.map((i) => `${i.productName} (${i.quantity})`).join(', ')}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                    ₹{order.totalAmount}
                  </span>
                  <span>·</span>
                  <span>{order.paymentMethod}</span>
                  {order.orderStatus !== 'Delivered' && (
                    <span className="text-emerald-600 font-medium">
                      OTP: <strong>{order.deliveryOtp}</strong>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <span className="text-xs font-semibold text-emerald-600 group-hover:underline">
                  {order.orderStatus === 'Delivered' ? 'View Receipt' : 'Live Track'}
                </span>
                <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
