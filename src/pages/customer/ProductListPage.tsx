import React, { useState, useEffect, useMemo } from 'react';
import { Filter, ArrowUpDown, Search, Check, X, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { ProductCard } from '../../components/ProductCard.js';
import { Product } from '../../types/index.js';
import { api } from '../../services/api.js';

interface ProductListPageProps {
  initialCategory?: string;
  initialSearch?: string;
  onNavigate: (view: string, param?: string) => void;
}

export const ProductListPage: React.FC<ProductListPageProps> = ({
  initialCategory,
  initialSearch,
  onNavigate,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'rating' | 'discount'>('popular');
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const categories = [
    'All',
    'Fruits',
    'Vegetables',
    'Dairy',
    'Rice and Grains',
    'Dal and Pulses',
    'Snacks and Chips',
    'Beverages',
    'Bakery',
    'Spices and Masalas',
    'Cooking Oils and Ghee',
    'Instant Food',
    'Frozen Food',
    'Personal Care',
    'Cleaning Supplies',
    'Crockery',
    'Kitchen Essentials',
    'Dry Fruits',
  ];

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const res = await api.getProducts({
          category: selectedCategory === 'All' ? undefined : selectedCategory,
          search: searchQuery.trim() || undefined,
          brand: selectedBrand === 'All' ? undefined : selectedBrand,
          inStockOnly,
          sort: sortBy,
        });
        setProducts(res.products);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [selectedCategory, selectedBrand, inStockOnly, sortBy, searchQuery]);

  // Extract unique brands from loaded products or standard catalog
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    products.forEach((p) => brands.add(p.brand));
    return ['All', ...Array.from(brands).sort()];
  }, [products]);

  const clearFilters = () => {
    setSelectedCategory('All');
    setSelectedBrand('All');
    setInStockOnly(false);
    setSearchQuery('');
    setSortBy('popular');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
            <span>{selectedCategory === 'All' ? 'All Grocery & Kitchen Essentials' : selectedCategory}</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {products.length} Products Available
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Express 10-minute delivery direct from local temperature-controlled hubs.
          </p>
        </div>

        {/* Filter / Sort bar on desktop */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search in page */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by name / brand..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-700 dark:text-slate-300 font-medium focus:outline-none cursor-pointer"
            >
              <option value="popular">Popularity</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="discount">Biggest Discount</option>
            </select>
          </div>

          <button
            onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Filter Sidebar + Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {/* Sidebar Filters (Desktop) */}
        <div className={`space-y-6 md:block ${isFilterDrawerOpen ? 'block' : 'hidden'}`}>
          {/* Categories list */}
          <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Categories
              </h3>
              {selectedCategory !== 'All' && (
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="text-[11px] text-emerald-600 hover:underline"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                    selectedCategory === cat
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <span className="truncate">{cat}</span>
                  {selectedCategory === cat && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Availability & Brands */}
          <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-2">
                Availability
              </h3>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>In Stock Only</span>
              </label>
            </div>

            {/* Brand Filter */}
            {availableBrands.length > 2 && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-2">
                  Brand
                </h3>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  {availableBrands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={clearFilters}
              className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-rose-600 text-center transition-colors border-t border-slate-100 dark:border-slate-700 pt-2"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Product Grid Area */}
        <div className="md:col-span-3 lg:col-span-4">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="h-72 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 mb-3">
                <Filter className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No matching products found
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Try loosening your filters or search keywords.
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onViewDetail={(id) => onNavigate('product-detail', id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
