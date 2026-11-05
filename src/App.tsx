/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Home,
  ShoppingBag,
  BookOpen,
  Clock,
  User as UserIcon,
  Truck,
  ShieldCheck,
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { CartProvider, useCart } from './context/CartContext.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { CartDrawer } from './components/CartDrawer.js';
import { CheckoutModal } from './components/CheckoutModal.js';
import { HomePage } from './pages/customer/HomePage.js';
import { ProductListPage } from './pages/customer/ProductListPage.js';
import { ProductDetailPage } from './pages/customer/ProductDetailPage.js';
import { RecipeBookPage } from './pages/recipes/RecipeBookPage.js';
import { OrderTrackingPage } from './pages/customer/OrderTrackingPage.js';
import { CustomerOrdersPage } from './pages/customer/CustomerOrdersPage.js';
import { DeliveryDashboard } from './pages/delivery/DeliveryDashboard.js';
import { AdminDashboard } from './pages/admin/AdminDashboard.js';
import { LoginPage } from './pages/auth/LoginPage.js';
import { Order } from './types/index.js';

function QuickBasketApp() {
  const { role, user } = useAuth();
  const { cartCount, setIsCartOpen, isCheckoutOpen, setIsCheckoutOpen } = useCart();

  // Navigation router state
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParam, setViewParam] = useState<string | undefined>(undefined);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string>('ORD-8821');

  const handleNavigate = (view: string, param?: string) => {
    setCurrentView(view);
    setViewParam(param);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (order: Order) => {
    setActiveTrackingOrderId(order.id);
    handleNavigate('order-tracking', order.id);
  };

  // RBAC safety check: If user role is delivery, keep them on delivery or allow login
  React.useEffect(() => {
    if (role === 'delivery' && currentView !== 'delivery-dashboard' && currentView !== 'login') {
      setCurrentView('delivery-dashboard');
    } else if (role === 'admin' && currentView !== 'admin-dashboard' && currentView !== 'login') {
      setCurrentView('admin-dashboard');
    }
  }, [role]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Header Navigation */}
      <Header currentView={currentView} onNavigate={handleNavigate} />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentView === 'home' && role === 'customer' && (
          <HomePage onNavigate={handleNavigate} />
        )}

        {currentView === 'products' && (
          <ProductListPage
            initialCategory={viewParam}
            initialSearch={viewParam && !viewParam.includes(' ') && viewParam.length > 3 ? viewParam : undefined}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'product-detail' && viewParam && (
          <ProductDetailPage
            productId={viewParam}
            onBack={() => handleNavigate('products')}
            onNavigateProduct={(id) => handleNavigate('product-detail', id)}
          />
        )}

        {currentView === 'recipes' && (
          <RecipeBookPage
            initialRecipeId={viewParam}
            onExploreProducts={() => handleNavigate('products')}
          />
        )}

        {currentView === 'orders' && (
          <CustomerOrdersPage
            onTrackOrder={(id) => {
              setActiveTrackingOrderId(id);
              handleNavigate('order-tracking', id);
            }}
            onExploreProducts={() => handleNavigate('products')}
          />
        )}

        {currentView === 'order-tracking' && (
          <OrderTrackingPage
            orderId={viewParam || activeTrackingOrderId}
            onBack={() => handleNavigate('orders')}
            onExploreMore={() => handleNavigate('products')}
          />
        )}

        {currentView === 'delivery-dashboard' && (
          <DeliveryDashboard />
        )}

        {currentView === 'admin-dashboard' && (
          <AdminDashboard />
        )}

        {currentView === 'login' && (
          <LoginPage
            onLoginSuccess={(newRole) => {
              if (newRole === 'admin') handleNavigate('admin-dashboard');
              else if (newRole === 'delivery') handleNavigate('delivery-dashboard');
              else handleNavigate('home');
            }}
            onGoBack={() => handleNavigate('home')}
          />
        )}
      </main>

      {/* Global Slide-Over Cart Drawer */}
      <CartDrawer
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        onExploreMore={() => handleNavigate('products')}
      />

      {/* Global Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Mobile Bottom Navigation Bar (Customer View Only) */}
      {role === 'customer' && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-2 px-4 flex items-center justify-around shadow-lg">
          <button
            onClick={() => handleNavigate('home')}
            className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
              currentView === 'home'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>

          <button
            onClick={() => handleNavigate('products')}
            className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
              currentView === 'products'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Catalog</span>
          </button>

          <button
            onClick={() => handleNavigate('recipes')}
            className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
              currentView === 'recipes'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span>Recipes</span>
          </button>

          <button
            onClick={() => handleNavigate('orders')}
            className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
              currentView === 'orders' || currentView === 'order-tracking'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Orders</span>
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex flex-col items-center gap-1 text-[10px] font-medium text-slate-500"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-emerald-600 text-white rounded-full w-4 h-4 text-[9px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span>Cart</span>
          </button>
        </div>
      )}

      {/* Global Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <QuickBasketApp />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
