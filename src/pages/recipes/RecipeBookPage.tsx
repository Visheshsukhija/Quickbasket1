import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Clock,
  Flame,
  ChefHat,
  ShoppingBag,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  X,
  Search,
  Sparkles,
  Check,
} from 'lucide-react';
import { Recipe, MatchedIngredient } from '../../types/index.js';
import { api } from '../../services/api.js';
import { useCart } from '../../context/CartContext.js';

interface RecipeBookPageProps {
  initialRecipeId?: string;
  onExploreProducts: () => void;
}

export const RecipeBookPage: React.FC<RecipeBookPageProps> = ({ initialRecipeId, onExploreProducts }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [ingredientMatch, setIngredientMatch] = useState<{
    matchedProducts: MatchedIngredient[];
    missingIngredients: any[];
    totalCost: number;
    allAvailable: boolean;
  } | null>(null);
  const [isMatchingLoading, setIsMatchingLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedSuccessMsg, setAddedSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { refreshCart, setIsCartOpen } = useCart();

  const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Desserts'];

  useEffect(() => {
    async function loadRecipes() {
      setLoading(true);
      try {
        const res = await api.getRecipes();
        setRecipes(res.recipes);

        if (initialRecipeId) {
          const target = res.recipes.find((r) => r.id === initialRecipeId);
          if (target) openRecipeDetail(target);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadRecipes();
  }, [initialRecipeId]);

  const openRecipeDetail = async (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setAddedSuccessMsg(null);
    setIsMatchingLoading(true);
    try {
      const match = await api.matchRecipeIngredients(recipe.id);
      setIngredientMatch(match);
    } catch (err) {
      console.error(err);
    } finally {
      setIsMatchingLoading(false);
    }
  };

  const handleAddAllIngredients = async () => {
    if (!selectedRecipe) return;
    setAddingToCart(true);
    try {
      const res = await api.addRecipeIngredientsToCart(selectedRecipe.id);
      await refreshCart();
      setAddedSuccessMsg(res.message);
      setTimeout(() => setIsCartOpen(true), 1200);
    } catch (err: any) {
      alert(err.message || 'Could not add ingredients to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const filteredRecipes = recipes.filter((r) => {
    const matchesCat = selectedCategory === 'All' || r.category === selectedCategory;
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ingredients.some((i) => i.ingredientName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-8 sm:p-10 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Recipe-to-Cart Intelligent Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight">
            Indian Culinary Recipe Book
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
            30+ authentic Indian homestyle recipes. Open any recipe and tap <strong>"Add All Available Ingredients"</strong> to match fresh groceries from our dark store directly into your shopping cart.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dish or ingredient (e.g. Biryani, Paneer)..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Recipes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-80 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No recipes matching "{searchQuery}"
          </h3>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="mt-3 text-xs text-emerald-600 font-semibold underline"
          >
            Show all 30 recipes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <div
              key={recipe.id}
              onClick={() => openRecipeDetail(recipe)}
              className="group bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col"
            >
              {/* Image banner */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-900">
                <img
                  src={recipe.imageUrl}
                  alt={recipe.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider">
                  {recipe.category}
                </div>
                <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded-lg text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-600" />
                  <span>{recipe.prepTimeMinutes + recipe.cookTimeMinutes}m</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold font-display text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {recipe.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {recipe.description}
                  </p>
                </div>

                {/* Nutritional Tags */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                  <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{recipe.calories} kcal</span>
                  </div>
                  <div>Serves {recipe.servings}</div>
                  <div className="font-semibold text-emerald-600 flex items-center gap-0.5">
                    <span>View Ingredients</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recipe Detail Modal with Live Ingredient Matcher */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="relative h-56 sm:h-64 shrink-0 overflow-hidden">
              <img
                src={selectedRecipe.imageUrl}
                alt={selectedRecipe.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <button
                onClick={() => setSelectedRecipe(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-600 px-2 py-0.5 rounded">
                  {selectedRecipe.category}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold font-display mt-1">
                  {selectedRecipe.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-200 mt-1">
                  <span>⏱️ Prep: {selectedRecipe.prepTimeMinutes}m</span>
                  <span>·</span>
                  <span>🍳 Cook: {selectedRecipe.cookTimeMinutes}m</span>
                  <span>·</span>
                  <span>🍽️ Servings: {selectedRecipe.servings}</span>
                  <span>·</span>
                  <span>⚡ Difficulty: {selectedRecipe.difficulty}</span>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Success Notification if added */}
              {addedSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{addedSuccessMsg}</span>
                </div>
              )}

              {/* Nutrition Strip */}
              <div className="grid grid-cols-4 gap-2 text-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 text-xs">
                <div>
                  <div className="text-[10px] text-slate-400">Calories</div>
                  <div className="font-bold text-slate-900 dark:text-white tabular-nums">
                    {selectedRecipe.calories} kcal
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Protein</div>
                  <div className="font-bold text-emerald-600 tabular-nums">
                    {selectedRecipe.proteinGrams}g
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Carbs</div>
                  <div className="font-bold text-slate-900 dark:text-white tabular-nums">
                    {selectedRecipe.carbsGrams}g
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Fats</div>
                  <div className="font-bold text-slate-900 dark:text-white tabular-nums">
                    {selectedRecipe.fatGrams}g
                  </div>
                </div>
              </div>

              {/* Special Feature: Live Ingredient Matcher */}
              <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>Smart Inventory Matcher</span>
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Matched directly against QuickBasket local dark store stock
                    </p>
                  </div>

                  {ingredientMatch && (
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Estimated Total</div>
                      <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums font-display">
                        ₹{ingredientMatch.totalCost}
                      </div>
                    </div>
                  )}
                </div>

                {isMatchingLoading ? (
                  <div className="text-xs text-slate-500 animate-pulse">
                    Scanning 300+ items in current inventory...
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Required Ingredients ({selectedRecipe.ingredients.length} items):
                    </div>

                    <div className="divide-y divide-emerald-100 dark:divide-emerald-900/40 max-h-56 overflow-y-auto bg-white dark:bg-slate-800/80 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 p-2 text-xs">
                      {ingredientMatch?.matchedProducts.map((item, idx) => (
                        <div key={idx} className="py-2 px-1 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {item.isAvailable ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                            )}
                            <div className="truncate">
                              <span className="font-semibold text-slate-900 dark:text-white truncate">
                                {item.product.name}
                              </span>
                              <span className="text-slate-400 text-[11px] ml-1">
                                ({item.ingredient.quantityRequired})
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-bold tabular-nums text-slate-900 dark:text-white">
                              ₹{item.product.sellingPrice}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                                item.isAvailable
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-rose-100 text-rose-600'
                              }`}
                            >
                              {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </div>
                        </div>
                      ))}

                      {ingredientMatch?.missingIngredients.map((item, idx) => (
                        <div key={`miss-${idx}`} className="py-2 px-1 flex items-center justify-between text-slate-400">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-slate-400 shrink-0" />
                            <span>{item.ingredientName} ({item.quantityRequired})</span>
                          </div>
                          <span className="text-[10px] text-slate-400">Pantry Staple</span>
                        </div>
                      ))}
                    </div>

                    {/* 1-Click Action Button */}
                    <button
                      onClick={handleAddAllIngredients}
                      disabled={addingToCart || !ingredientMatch?.matchedProducts.some((p) => p.isAvailable)}
                      className="w-full mt-3 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.01]"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>
                        {addingToCart
                          ? 'Adding to Basket...'
                          : `Add All Available Ingredients to Cart (₹${ingredientMatch?.totalCost})`}
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Step-by-Step Instructions
                </h3>
                <div className="space-y-2">
                  {selectedRecipe.instructions.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3"
                    >
                      <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        {idx + 1}
                      </span>
                      <p className="leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
