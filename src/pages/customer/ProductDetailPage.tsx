import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, ShieldCheck, Truck, RotateCcw, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Product } from '../../types/index.js';
import { api } from '../../services/api.js';
import { useCart } from '../../context/CartContext.js';
import { ProductCard } from '../../components/ProductCard.js';

interface ProductDetailPageProps {
  productId: string;
  onBack: () => void;
  onNavigateProduct: (id: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productId,
  onBack,
  onNavigateProduct,
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const { items, addToCart, updateQuantity } = useCart();

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setImageError(false);
      try {
        const res = await api.getProductById(productId);
        setProduct(res.product);

        // Fetch related products in same category
        const relatedRes = await api.getProducts({ category: res.product.category });
        setRelatedProducts(relatedRes.products.filter((p) => p.id !== productId).slice(0, 4));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-6 w-1/3 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-10 w-3/4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Product not found</h2>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const cartItem = items.find((i) => i.productId === product.id);
  const qtyInCart = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = product.stockQuantity === 0;
  const isLowStock = !isOutOfStock && product.stockQuantity <= product.minStockThreshold;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-10">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Products</span>
        </button>
        <span>/</span>
        <span>{product.category}</span>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200 truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left: Sticky Image Gallery */}
        <div className="md:col-span-6 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center relative overflow-hidden">
          {product.discountPercent > 0 && (
            <div className="absolute top-4 left-4 z-10 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-sm">
              {product.discountPercent}% OFF
            </div>
          )}

          <div className="w-full aspect-[4/3] flex items-center justify-center">
            {!imageError && product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                onError={() => setImageError(true)}
                className="max-h-80 w-auto object-contain hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400">
                <ShoppingBag className="w-16 h-16 text-emerald-500/50 mb-2" />
                <span className="text-xs font-medium text-slate-500">{product.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Contiguous Purchase Module */}
        <div className="md:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                {product.brand}
              </span>
              <span>·</span>
              <span>SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white mt-1 leading-snug">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mt-2 text-xs">
              <div className="flex items-center text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                <span>{product.rating}</span>
              </div>
              <span className="text-slate-500">
                {product.reviewCount} customer reviews
              </span>
            </div>
          </div>

          {/* Pricing & Unit */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="text-xs text-slate-500">Net Quantity: <strong>{product.unit}</strong></div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums font-display">
                ₹{product.sellingPrice}
              </span>
              {product.mrp > product.sellingPrice && (
                <>
                  <span className="text-sm text-slate-400 line-through tabular-nums">
                    MRP ₹{product.mrp}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Save ₹{product.mrp - product.sellingPrice}
                  </span>
                </>
              )}
            </div>

            <div className="text-[11px] text-slate-500">
              (Inclusive of all taxes · 5% GST calculated at checkout)
            </div>
          </div>

          {/* Stock Visibility */}
          <div className="text-xs">
            {isOutOfStock ? (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-semibold">
                ⚠️ Currently Out of Stock. Our inventory team is restocking from regional mandi.
              </div>
            ) : isLowStock ? (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 font-semibold">
                ⚡ Hurry! Only {product.stockQuantity} {product.unit} left in dark store.
              </div>
            ) : (
              <div className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>In Stock & Ready for 10-Min Dispatch</span>
              </div>
            )}
          </div>

          {/* Action Module */}
          <div className="pt-2">
            {qtyInCart === 0 ? (
              <button
                onClick={() => addToCart(product.id, 1)}
                disabled={isOutOfStock}
                className={`w-full py-3.5 px-6 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isOutOfStock
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 hover:scale-[1.01]'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? 'Sold Out' : 'Add to Shopping Basket'}</span>
              </button>
            ) : (
              <div className="flex items-center justify-between p-2 rounded-2xl bg-emerald-600 text-white shadow-md">
                <span className="text-xs font-medium pl-3">
                  In Basket: <strong>{qtyInCart} {product.unit}</strong> (₹{qtyInCart * product.sellingPrice})
                </span>
                <div className="flex items-center gap-2 bg-emerald-700 px-3 py-1.5 rounded-xl">
                  <button
                    onClick={() => updateQuantity(product.id, qtyInCart - 1)}
                    className="p-1 hover:bg-emerald-800 rounded transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-bold w-6 text-center tabular-nums">
                    {qtyInCart}
                  </span>
                  <button
                    onClick={() => updateQuantity(product.id, qtyInCart + 1)}
                    disabled={qtyInCart >= product.stockQuantity}
                    className="p-1 hover:bg-emerald-800 rounded transition-colors disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Description & Promises */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-5 space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                About Product
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>10-Minute Express Hub</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>FSSAI Certified Fresh</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-emerald-600" />
                <span>Instant Doorstep Return</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-800 pt-10">
          <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-4">
            Frequently Bought Together in {product.category}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onViewDetail={(id) => onNavigateProduct(id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
