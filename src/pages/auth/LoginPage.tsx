import React, { useState } from 'react';
import { Sparkles, ShieldCheck, Truck, Lock, Mail, ArrowRight, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { UserRole } from '../../types/index.js';

interface LoginPageProps {
  onLoginSuccess: (role: UserRole) => void;
  onGoBack: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onGoBack }) => {
  const { login, loginAsDemo } = useAuth();
  const [email, setEmail] = useState('customer@quickbasket.com');
  const [password, setPassword] = useState('cust123');
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('New Customer');
  const [phone, setPhone] = useState('+91 98888 77777');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);
    try {
      await login(email, password, selectedRole);
      onLoginSuccess(selectedRole);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: UserRole) => {
    setLoading(true);
    try {
      await loginAsDemo(role);
      onLoginSuccess(role);
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white mx-auto shadow-md">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
          Sign In to QuickBasket
        </h1>
        <p className="text-xs text-slate-500">
          Everything You Need, Delivered Fresh and Fast.
        </p>
      </div>

      {/* 1-Click Fast Demo Credentials Box */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-emerald-200 dark:border-emerald-800/60 space-y-2.5">
        <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>One-Click Role Demonstration Login</span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-400">
          Instant testing for role-based permissions (RBAC) without typing:
        </p>

        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => handleDemoLogin('customer')}
            className="w-full text-left p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 flex items-center justify-between transition-colors text-xs"
          >
            <div>
              <div className="font-bold text-slate-900 dark:text-white">
                Customer View (Priya Sundaram)
              </div>
              <div className="text-[10px] text-slate-400">customer@quickbasket.com</div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Customer
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('delivery')}
            className="w-full text-left p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 flex items-center justify-between transition-colors text-xs"
          >
            <div>
              <div className="font-bold text-slate-900 dark:text-white">
                Delivery Partner (Ramesh Kumar)
              </div>
              <div className="text-[10px] text-slate-400">delivery@quickbasket.com</div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              Rider
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('admin')}
            className="w-full text-left p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-500 flex items-center justify-between transition-colors text-xs"
          >
            <div>
              <div className="font-bold text-slate-900 dark:text-white">
                Warehouse Admin (Aditi Sharma)
              </div>
              <div className="text-[10px] text-slate-400">admin@quickbasket.com</div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
              Admin
            </span>
          </button>
        </div>
      </div>

      {/* Manual Email & Password Form */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-4">
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Role selector tab */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-700 p-1">
            {(['customer', 'delivery', 'admin'] as const).map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setSelectedRole(r)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  selectedRole === r
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 transition-colors"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In with Secure Credentials'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center">
          <button
            onClick={onGoBack}
            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 underline"
          >
            Return to Storefront
          </button>
        </div>
      </div>
    </div>
  );
};
