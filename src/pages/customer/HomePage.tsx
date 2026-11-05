import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Zap,
  Clock,
  Sparkles,
  ChevronRight,
  Flame,
  Star,
  CheckCircle,
  BookOpen,
  ShoppingBag,
} from 'lucide-react';
import { ProductCard } from '../../components/ProductCard.js';
import { Product, Recipe } from '../../types/index.js';
import { api } from '../../services/api.js';

interface HomePageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [flashDeals, setFlashDeals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [crockeryItems, setCrockeryItems] = useState<Product[]>([]);
  const [featuredRecipe, setFeaturedRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  const categories = [
    { name: 'Fruits', count: '20+ items', icon: '🍎', img: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=300&q=80' },
    { name: 'Vegetables', count: '25+ items', icon: '🥦', img: '/src/assets/images/category_fresh_produce_1793812404381.jpg' },
    { name: 'Dairy', count: '20+ items', icon: '🥛', img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=300&q=80' },
    { name: 'Rice and Grains', count: '20+ items', icon: '🌾', img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80' },
    { name: 'Dal and Pulses', count: '20+ items', icon: '🫘', img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=300&q=80' },
    { name: 'Snacks and Chips', count: '25+ items', icon: '🍟', img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=300&q=80' },
    { name: 'Beverages', count: '20+ items', icon: '☕', img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=300&q=80' },
    { name: 'Bakery', count: '15+ items', icon: '🍞', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80' },
    { name: 'Spices and Masalas', count: '20+ items', icon: '🌶️', img: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=300&q=80' },
    { name: 'Cooking Oils and Ghee', count: '15+ items', icon: '🧈', img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=300&q=80' },
    { name: 'Instant Food', count: '20+ items', icon: '🍜', img: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=300&q=80' },
    { name: 'Crockery', count: '15+ items', icon: '🍽️', img: '/src/assets/images/category_kitchen_crockery_1793812404018.jpg' },
    { name: 'Kitchen Essentials', count: '15+ items', icon: '🍳', img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=300&q=80' },
  ];

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [allProds, recipesRes] = await Promise.all([
          api.getProducts(),
          api.getRecipes(),
        ]);

        const prods = allProds.products;
        setFlashDeals(prods.filter((p) => p.isFlashDeal).slice(0, 4));
        setBestSellers(prods.filter((p) => p.isPopular).slice(0, 4));
        setCrockeryItems(prods.filter((p) => p.category === 'Crockery').slice(0, 4));

        if (recipesRes.recipes && recipesRes.recipes.length > 0) {
          setFeaturedRecipe(recipesRes.recipes[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white shadow-xl mx-4 sm:mx-6 mt-4">
        {/* Decorative background image */}
        <div className="absolute inset-0 opacity-25 mix-blend-overlay">
          <img
            src="/src/assets/images/hero_grocery_fresh_1793812403269.jpg"
            alt="Fresh Groceries"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 fill-emerald-300" />
              <span>Hyperlocal Grocery Delivery in 10 Minutes</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display leading-tight">
              Everything You Need, Delivered Fresh and Fast.
            </h1>

            <p className="text-sm sm:text-base text-emerald-100/80 max-w-xl font-normal leading-relaxed">
              300+ farm-fresh fruits, vegetables, pure dairy, pantry pulses, and elegant kitchen crockery delivered directly from our temperature-controlled dark stores.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('products')}
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
              >
                <span>Shop Catalog (300+)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('recipes')}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-2 backdrop-blur-xs border border-white/20 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-amber-300" />
                <span>Explore Recipe Book</span>
              </button>
            </div>

            {/* Micro Trust Points */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-emerald-200/90 border-t border-white/10">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>100% Quality Checked</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Free Delivery Above ₹299</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Live Route Tracking & OTP</span>
              </div>
            </div>
          </div>

          {/* Hero Banner Visual Card */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-[4/3]">
              <img
                src="/src/assets/images/hero_grocery_fresh_1793812403269.jpg"
                alt="Fresh farm harvest"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5">
                <div className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">
                  Today's Fresh Mandi Harvest
                </div>
                <div className="text-base font-bold text-white mt-1">
                  Organic Vegetables, Pure Dairy & Pantry Essentials
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  Stored at 4°C for peak nutrient retention.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-display">
              Explore Aisles & Categories
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              17 specialized departments stocked with 300+ items
            </p>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => onNavigate('products', cat.name)}
              className="group flex flex-col items-center p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md transition-all text-center"
            >
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900 mb-2 relative">
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-1 right-1 text-xs">{cat.icon}</div>
              </div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                {cat.name}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">{cat.count}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Flash Deals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500 text-white">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-display">
                Flash Deals & Lightning Discounts
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Up to 30% off on everyday grocery essentials
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>See More Deals</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {flashDeals.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onViewDetail={(id) => onNavigate('product-detail', id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Recipe of the Day Spotlight (Connects Recipe Book to Groceries!) */}
      {featuredRecipe && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-950 via-stone-900 to-slate-900 text-white shadow-xl border border-amber-900/40">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-6 sm:p-10">
              <div className="md:col-span-5 order-2 md:order-1 space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-300" />
                  <span>Recipe of the Day · QuickBasket Kitchen</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold font-display leading-snug">
                  {featuredRecipe.title}
                </h3>

                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed line-clamp-3">
                  {featuredRecipe.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-amber-200/90 pt-1">
                  <span>⏱️ {featuredRecipe.prepTimeMinutes + featuredRecipe.cookTimeMinutes} mins total</span>
                  <span>·</span>
                  <span>🔥 {featuredRecipe.calories} kcal</span>
                  <span>·</span>
                  <span>👨‍🍳 {featuredRecipe.difficulty}</span>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => onNavigate('recipes', featuredRecipe.id)}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all hover:scale-105"
                  >
                    <span>View Recipe & Ingredients</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onNavigate('recipes')}
                    className="text-xs font-semibold text-stone-300 hover:text-white underline ml-2"
                  >
                    Browse all 30+ recipes
                  </button>
                </div>
              </div>

              <div className="md:col-span-7 order-1 md:order-2">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[16/10] border border-white/10">
                  <img
                    src={featuredRecipe.imageUrl}
                    alt={featuredRecipe.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-medium text-white">
                    1-Click: Add all required ingredients to cart!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Best Sellers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-display">
              Best Sellers in Your Neighborhood
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              High-frequency staples ordered in the last 2 hours
            </p>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>Explore All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {bestSellers.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onViewDetail={(id) => onNavigate('product-detail', id)}
            />
          ))}
        </div>
      </section>

      {/* Crockery & Tableware Feature Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Lifestyle & Dining
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-display mt-0.5">
                Artisanal Crockery & Cookware Essentials
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Ceramic dinner sets, opalware, non-stick cookware and glass tumblers
              </p>
            </div>
            <button
              onClick={() => onNavigate('products', 'Crockery')}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Shop Kitchen & Crockery
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {crockeryItems.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onViewDetail={(id) => onNavigate('product-detail', id)}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
