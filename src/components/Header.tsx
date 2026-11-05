import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ShoppingCart,
  MapPin,
  Sun,
  Moon,
  ChevronDown,
  Sparkles,
  Truck,
  ShieldAlert,
  User as UserIcon,
  BookOpen,
  Package,
  Layers,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useCart } from '../context/CartContext.js';
import { useTheme } from '../context/ThemeContext.js';
import { Product } from '../types/index.js';
import { api } from '../services/api.js';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const { user, role, switchRole, logout } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
  const { theme, toggleTheme } = useTheme();

  const [selectedLocation, setSelectedLocation] = useState('HSR Layout, Bengaluru');
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  const locations = [
    'HSR Layout, Bengaluru',
    'Indiranagar 100ft Rd, Bengaluru',
    'Koramangala 4th Block, Bengaluru',
    'Whitefield, Bengaluru',
    'Bandra West, Mumbai',
    'Connaught Place, New Delhi',
  ];

  // Dynamic live search
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const timer = setTimeout(async () => {
        try {
          const res = await api.getProducts({ search: searchQuery });
          setSearchResults(res.products.slice(0, 6));
          setIsSearchOpen(true);
        } catch {
          setSearchResults([]);
        }
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  }, [searchQuery]);

  // Click outside to close search popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProductSelect = (product: Product) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    onNavigate('product-detail', product.id);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Top Testing & Role Quick Switch Bar */}
      <div className="bg-slate-900 text-slate-100 dark:bg-slate-950 px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-emerald-400">⚡ QUICKBASKET LIVE</span>
            <span className="hidden sm:inline text-slate-400">|</span>
            <span className="hidden sm:inline text-slate-300">
              Logged in as <strong className="text-white">{user?.name}</strong> ({role.toUpperCase()})
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px] mr-1 hidden md:inline">Switch Role:</span>
            <button
              onClick={() => {
                switchRole('customer');
                onNavigate('home');
              }}
              className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                role === 'customer'
                  ? 'bg-emerald-500 text-white font-semibold shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Customer
            </button>
            <button
              onClick={() => {
                switchRole('delivery');
                onNavigate('delivery-dashboard');
              }}
              className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                role === 'delivery'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Delivery Partner
            </button>
            <button
              onClick={() => {
                switchRole('admin');
                onNavigate('admin-dashboard');
              }}
              className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                role === 'admin'
                  ? 'bg-purple-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Admin Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Main Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4 md:gap-8">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate(role === 'admin' ? 'admin-dashboard' : role === 'delivery' ? 'delivery-dashboard' : 'home')}
            className="flex items-center gap-2 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 font-display">
                QuickBasket
              </div>
              <div className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span>10 MINS DELIVERY</span>
                <span>⚡</span>
              </div>
            </div>
          </button>

          {/* Location Picker (Customer) */}
          {role === 'customer' && (
            <div className="relative hidden lg:block border-l border-slate-200 dark:border-slate-800 pl-4 ml-1">
              <button
                onClick={() => setIsLocationOpen(!isLocationOpen)}
                className="flex items-center gap-1.5 text-xs text-left group"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div className="max-w-[140px] truncate">
                  <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {selectedLocation.split(',')[0]}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {selectedLocation.split(',')[1] || 'Express Hub'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform" />
              </button>

              {isLocationOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Select Delivery Location
                  </div>
                  {locations.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => {
                        setSelectedLocation(loc);
                        setIsLocationOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                        selectedLocation === loc
                          ? 'text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50/50 dark:bg-emerald-950/20'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{loc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dynamic Search Bar (Customer) */}
        {role === 'customer' && (
          <div ref={searchRef} className="relative flex-1 max-w-lg hidden md:block">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length > 1 && setIsSearchOpen(true)}
                placeholder='Search "Basmati Rice", "Amul Butter", "Paneer", "Dinner Sets"...'
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 pl-10 pr-9 py-2 text-xs rounded-xl border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Live Autocomplete Suggestions */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                <div className="p-2 border-b border-slate-100 dark:border-slate-700 text-[11px] font-medium text-slate-400 flex items-center justify-between">
                  <span>Found {searchResults.length} items</span>
                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      onNavigate('products', searchQuery);
                    }}
                    className="text-emerald-600 hover:underline"
                  >
                    View all results →
                  </button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700/50 max-h-80 overflow-y-auto">
                  {searchResults.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleProductSelect(item)}
                      className="w-full text-left p-2.5 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-10 h-10 object-cover rounded-lg bg-slate-100 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>{item.unit}</span>
                          <span>·</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            ₹{item.sellingPrice}
                          </span>
                          {item.mrp > item.sellingPrice && (
                            <span className="line-through text-slate-400 text-[10px]">
                              ₹{item.mrp}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                        {item.category}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Links according to Role */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600 dark:text-slate-300">
          {role === 'customer' && (
            <>
              <button
                onClick={() => onNavigate('home')}
                className={`hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap ${
                  currentView === 'home' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
                }`}
              >
                Shop Fresh
              </button>
              <button
                onClick={() => onNavigate('products')}
                className={`hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap ${
                  currentView === 'products' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
                }`}
              >
                300+ Products
              </button>
              <button
                onClick={() => onNavigate('recipes')}
                className={`flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap ${
                  currentView === 'recipes' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                <span>Recipe Book</span>
              </button>
              <button
                onClick={() => onNavigate('orders')}
                className={`hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap ${
                  currentView === 'orders' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
                }`}
              >
                My Orders
              </button>
            </>
          )}

          {role === 'delivery' && (
            <>
              <button
                onClick={() => onNavigate('delivery-dashboard')}
                className={`flex items-center gap-1.5 hover:text-blue-600 transition-colors whitespace-nowrap ${
                  currentView === 'delivery-dashboard' ? 'text-blue-600 font-semibold' : ''
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Active Deliveries</span>
              </button>
              <button
                onClick={() => onNavigate('delivery-history')}
                className="hover:text-blue-600 transition-colors whitespace-nowrap"
              >
                Delivery History
              </button>
            </>
          )}

          {role === 'admin' && (
            <>
              <button
                onClick={() => onNavigate('admin-dashboard')}
                className={`hover:text-purple-600 transition-colors whitespace-nowrap ${
                  currentView === 'admin-dashboard' ? 'text-purple-600 font-semibold' : ''
                }`}
              >
                Management Console
              </button>
              <button
                onClick={() => onNavigate('admin-inventory')}
                className="hover:text-purple-600 transition-colors whitespace-nowrap"
              >
                Live Stock & POs
              </button>
              <button
                onClick={() => onNavigate('admin-analytics')}
                className="hover:text-purple-600 transition-colors whitespace-nowrap"
              >
                Demand Forecast
              </button>
            </>
          )}
        </nav>

        {/* Right Zone Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* User Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-500/20"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
              )}
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 hidden sm:inline max-w-[100px] truncate">
                {user?.name.split(' ')[0]}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:inline" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">{user?.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
                  <div className="text-[10px] mt-1 inline-block px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-medium">
                    Role: {role.toUpperCase()}
                  </div>
                </div>

                <div className="py-1">
                  {role === 'customer' && (
                    <>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigate('orders');
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        Order History
                      </button>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigate('recipes');
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        Saved Recipes
                      </button>
                    </>
                  )}
                  {role === 'delivery' && (
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onNavigate('delivery-dashboard');
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      Rider Dashboard
                    </button>
                  )}
                  {role === 'admin' && (
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onNavigate('admin-dashboard');
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      Admin Console
                    </button>
                  )}
                </div>

                <div className="pt-1 border-t border-slate-100 dark:border-slate-700">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onNavigate('login');
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    Switch Account / Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Cart Button with Count Badge (Customer) */}
          {role === 'customer' && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">My Cart</span>
              {cartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-emerald-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Search Input */}
      {role === 'customer' && (
        <div className="p-2 sm:hidden border-t border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 300+ grocery & kitchen items..."
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 pl-9 pr-4 py-2 text-xs rounded-xl border-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      )}
    </header>
  );
};
