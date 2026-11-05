import React, { useState, useEffect } from 'react';
import {
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Navigation,
  KeyRound,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types/index.js';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';

export const DeliveryDashboard: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderForOtp, setSelectedOrderForOtp] = useState<Order | null>(null);
  const [inputOtp, setInputOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeNavOrder, setActiveNavOrder] = useState<Order | null>(null);

  const fetchRiderOrders = async () => {
    try {
      const res = await api.getOrders({ deliveryPartnerId: user?.id });
      setOrders(res.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiderOrders();
    const interval = setInterval(fetchRiderOrders, 5000);
    return () => clearInterval(interval);
  }, [user]);

  // Handle Order Status Transitions
  const handleUpdateStatus = async (orderId: string, status: OrderStatus, note?: string) => {
    try {
      await api.updateOrderStatus(orderId, status, note);
      await fetchRiderOrders();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForOtp) return;
    setOtpError(null);
    setIsVerifying(true);

    try {
      await api.verifyDeliveryOtp(selectedOrderForOtp.id, inputOtp);
      setSelectedOrderForOtp(null);
      setInputOtp('');
      await fetchRiderOrders();
    } catch (err: any) {
      setOtpError(err.message || 'Invalid delivery OTP');
    } finally {
      setIsVerifying(false);
    }
  };

  const completedOrders = orders.filter((o) => o.orderStatus === 'Delivered');
  const activeOrders = orders.filter((o) => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled');
  const totalEarnings = completedOrders.length * 45 + 120; // Base delivery fee + incentive

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Rider Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
            <Truck className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Shift Active · On Duty</span>
            </div>
            <h1 className="text-2xl font-bold font-display mt-1">
              Rider Console: {user?.name}
            </h1>
            <p className="text-xs text-blue-200/80 mt-0.5">
              Assigned Dark Store: Sector 4 Hub · EV Bike KA-01-EQ-9082
            </p>
          </div>
        </div>

        <button
          onClick={fetchRiderOrders}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Assignments</span>
        </button>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800">
          <div className="text-xs text-slate-500">Deliveries Today</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums mt-1 font-display">
            {completedOrders.length} Completed
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">100% on-time rating</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800">
          <div className="text-xs text-slate-500">Pending Deliveries</div>
          <div className="text-2xl font-bold text-blue-600 tabular-nums mt-1 font-display">
            {activeOrders.length} Active
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Avg 9.2 min delivery time</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800">
          <div className="text-xs text-slate-500">Total Shift Earnings</div>
          <div className="text-2xl font-bold text-emerald-600 tabular-nums mt-1 font-display">
            ₹{totalEarnings}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Includes ₹120 fuel/EV perk</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800">
          <div className="text-xs text-slate-500">Distance Travelled</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums mt-1 font-display">
            18.4 km
          </div>
          <div className="text-[11px] text-blue-500 mt-1">Dark store radius: 3 km</div>
        </div>
      </div>

      {/* Active Assigned Deliveries List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">
            Current Assigned Deliveries ({activeOrders.length})
          </h2>
          <span className="text-xs text-slate-500">
            Real-time synchronization with customer app
          </span>
        </div>

        {loading ? (
          <div className="h-40 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        ) : activeOrders.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-800/60 rounded-3xl border border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              All caught up! No active deliveries pending.
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Stand by at the dark store dispatch bay for incoming 10-minute orders.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeOrders.map((order) => (
              <div
                key={order.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-md flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                      #{order.id}
                    </span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                      {order.orderStatus}
                    </span>
                  </div>

                  {/* Customer info */}
                  <div className="mt-3 space-y-1 text-xs">
                    <div className="font-bold text-sm text-slate-900 dark:text-white">
                      {order.customerName}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate">
                        {order.deliveryAddress.street}, {order.deliveryAddress.area}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{order.customerPhone}</span>
                    </div>
                  </div>

                  {/* Items brief */}
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 flex justify-between">
                      <span>Order Items ({order.items.length})</span>
                      <span className="tabular-nums font-bold text-slate-900 dark:text-white">
                        ₹{order.totalAmount} ({order.paymentMethod})
                      </span>
                    </div>
                    <div className="line-clamp-2 text-[11px] text-slate-500">
                      {order.items.map((i) => `${i.productName} × ${i.quantity}`).join(', ')}
                    </div>
                  </div>
                </div>

                {/* Status-Driven Operational Actions */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700 space-y-2">
                  {order.orderStatus === 'Ready for Pickup' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'Out for Delivery', 'Rider picked up order from store')}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Confirm Pickup & Start Delivery</span>
                    </button>
                  )}

                  {order.orderStatus === 'Out for Delivery' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setActiveNavOrder(order)}
                        className="py-2.5 px-3 rounded-xl bg-slate-900 text-white dark:bg-slate-700 text-xs font-semibold hover:bg-slate-800 flex items-center justify-center gap-1.5"
                      >
                        <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Navigate</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedOrderForOtp(order);
                          setInputOtp('');
                          setOtpError(null);
                        }}
                        className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Verify OTP</span>
                      </button>
                    </div>
                  )}

                  {order.orderStatus === 'Order Placed' || order.orderStatus === 'Order Confirmed' || order.orderStatus === 'Preparing Order' ? (
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-center text-xs text-slate-500">
                      Store bagger packing items. Standby for pickup call.
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Trips Summary */}
      <div className="bg-white dark:bg-slate-800/80 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <h2 className="text-base font-bold font-display text-slate-900 dark:text-white">
          Completed Deliveries History ({completedOrders.length})
        </h2>
        {completedOrders.length === 0 ? (
          <div className="text-xs text-slate-500">No completed orders yet on this shift.</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {completedOrders.map((o) => (
              <div key={o.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold font-mono text-slate-900 dark:text-white">
                    #{o.id}
                  </span>
                  <span className="text-slate-500 ml-2">
                    {o.customerName} · {o.deliveryAddress.area}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-emerald-600 font-semibold">Delivered ✓</span>
                  <span className="tabular-nums font-bold">₹{o.totalAmount}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delivery OTP Verification Modal */}
      {selectedOrderForOtp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 mx-auto mb-2">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Enter Customer Delivery OTP
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Order #{selectedOrderForOtp.id} · {selectedOrderForOtp.customerName}
              </p>
            </div>

            {otpError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength={4}
                  required
                  autoFocus
                  value={inputOtp}
                  onChange={(e) => setInputOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="4-digit OTP"
                  className="w-full text-center text-2xl font-mono font-bold tracking-widest py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                />
                <div className="text-[11px] text-slate-400 text-center mt-1">
                  (Customer can see this in their order tracking screen)
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForOtp(null)}
                  className="py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inputOtp.length !== 4 || isVerifying}
                  className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold transition-colors"
                >
                  {isVerifying ? 'Verifying...' : 'Mark Delivered'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Navigation Modal Fallback / Demo Map */}
      {activeNavOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-emerald-600" />
                  <span>Turn-by-Turn Navigation</span>
                </h3>
                <p className="text-xs text-slate-500">Destination: {activeNavOrder.deliveryAddress.street}</p>
              </div>
              <button
                onClick={() => setActiveNavOrder(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Simulated Live Route Canvas */}
            <div className="h-64 rounded-2xl bg-slate-950 relative overflow-hidden flex flex-col justify-between p-4 text-white">
              <div className="flex items-center justify-between bg-black/40 backdrop-blur-md p-2.5 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <span>GPS Connected · 1.4 km remaining</span>
                </div>
                <span className="font-bold text-emerald-400">~4 mins ETA</span>
              </div>

              {/* Road visuals */}
              <div className="text-center space-y-1">
                <div className="text-2xl font-black font-display tracking-tight text-white">
                  In 200m, Turn Right onto 14th Main
                </div>
                <div className="text-xs text-slate-400">Pass Green Glen Residency on left</div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-2">
                <span>Speed: 28 km/h</span>
                <span>Destination: HSR Sector 4</span>
              </div>
            </div>

            <button
              onClick={() => setActiveNavOrder(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold"
            >
              Close Navigation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
