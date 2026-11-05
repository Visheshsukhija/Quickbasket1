import React from 'react';
import { Sparkles, ShieldCheck, Clock, Award, PhoneCall, HelpCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors">
      {/* 4 Value Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 border-b border-slate-100 dark:border-slate-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">10-Minute Delivery</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Dark-store powered hyperlocal dispatch.</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Farm Fresh Guarantee</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Direct procurement from Mandis & certified farms.</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Instant Refund Policy</div>
              <div className="text-[11px] text-slate-500 mt-0.5">No questions asked instant replacement or refund.</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 shrink-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">24/7 Priority Support</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Live resolution within 2 minutes on call or chat.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold font-display text-slate-900 dark:text-white">
                QuickBasket
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 max-w-sm leading-relaxed">
              Everything You Need, Delivered Fresh and Fast. Hyperlocal instant grocery, kitchen essentials, crockery, and recipe-based shopping.
            </p>
            <div className="text-xs text-slate-400 mt-4">
              Registered Office: Indiranagar 100ft Rd, Bangalore 560038, India.
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Popular Aisles
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>Fruits & Vegetables</li>
              <li>Dairy, Bread & Eggs</li>
              <li>Basmati Rice & Atta</li>
              <li>Dal & Organic Pulses</li>
              <li>Designer Crockery</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Company & Roles
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>Customer Portal</li>
              <li>Delivery Partner Fleet</li>
              <li>Admin Warehouse</li>
              <li>Partner with Us</li>
              <li>Careers & Franchises</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Trust & Legal
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>Terms & Conditions</li>
              <li>Privacy Policy</li>
              <li>Refund & Cancellation</li>
              <li>FSSAI Food License</li>
              <li>Security & Compliance</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} QuickBasket Technologies Pvt. Ltd. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Made with precision for instant commerce</span>
            <span>·</span>
            <span>Version 2.4.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
