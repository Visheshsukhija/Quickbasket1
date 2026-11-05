import React, { useState } from 'react';
import { Plus, Minus, Star, ShoppingBag, Eye } from 'lucide-react';
import { Product } from '../types/index.js';
import { useCart } from '../context/CartContext.js';

interface ProductCardProps {
  product: Product;
  onViewDetail?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetail }) => {
  const { items, addToCart, updateQuantity } = useCart();
  const [imageFailed, setImageFailed] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const cartItem = items.find((i) => i.productId === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const isOutOfStock = product.stockQuantity === 0;
  const isLowStock = !isOutOfStock && product.stockQuantity <= product.minStockThreshold;

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    setIsAdding(true);
    try {
      await addToCart(product.id, 1);
    } catch {
      // handled in context
    } finally {
      setIsAdding(false);
    }
  };

  const handleIncrement = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantityInCart >= product.stockQuantity) return;
    await updateQuantity(product.id, quantityInCart + 1);
  };

  const handleDecrement = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await updateQuantity(product.id, quantityInCart - 1);
  };

  return (
    <div
      onClick={() => onViewDetail && onViewDetail(product.id)}
      className="group relative flex flex-col bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
    >
      {/* Discount / Flash Deal badge */}
      {product.discountPercent > 0 && (
        <div className="absolute top-2.5 left-2.5 z-10 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
          {product.discountPercent}% OFF
        </div>
      )}

      {/* Product Image Area with Zero Broken Image Fallback */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-3">
        {!imageFailed && product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            onError={() => setImageFailed(true)}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 text-slate-400 p-2 text-center">
            <ShoppingBag className="w-8 h-8 text-emerald-500/50 mb-1" />
            <span className="text-[11px] font-medium text-slate-500 truncate max-w-[120px]">
              {product.name}
            </span>
          </div>
        )}

        {/* Quick View overlay on hover */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 text-[11px] font-semibold px-2.5 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1 shadow-sm">
            <Eye className="w-3 h-3" /> Quick View
          </span>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
        <div>
          {/* Unboxed clean metadata with typographic separators */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-medium truncate max-w-[110px]">{product.brand}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{product.unit}</span>
          </div>

          {/* Product Name */}
          <h3 className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-2 mt-1 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center text-amber-500">
              <Star className="w-3 h-3 fill-amber-400" />
              <span className="ml-1 font-semibold text-slate-800 dark:text-slate-200">
                {product.rating}
              </span>
            </div>
            <span>({product.reviewCount})</span>
          </div>
        </div>

        {/* Stock Status Indicator */}
        <div className="text-[11px] pt-1">
          {isOutOfStock ? (
            <span className="text-rose-500 font-medium">Out of Stock</span>
          ) : isLowStock ? (
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              Only {product.stockQuantity} left
            </span>
          ) : (
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">In Stock</span>
          )}
        </div>

        {/* Price and Add to Cart Stepper */}
        <div className="flex items-center justify-between pt-1 mt-auto border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                ₹{product.sellingPrice}
              </span>
              {product.mrp > product.sellingPrice && (
                <span className="text-[11px] text-slate-400 line-through tabular-nums">
                  ₹{product.mrp}
                </span>
              )}
            </div>
          </div>

          {/* Add / Stepper Button */}
          {quantityInCart === 0 ? (
            <button
              onClick={handleAdd}
              disabled={isOutOfStock || isAdding}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-150 ${
                isOutOfStock
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white shadow-2xs active:scale-95'
              }`}
            >
              {isAdding ? '...' : isOutOfStock ? 'Sold Out' : 'Add'}
            </button>
          ) : (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 bg-emerald-600 text-white px-2 py-1 rounded-xl shadow-xs"
            >
              <button
                onClick={handleDecrement}
                className="w-5 h-5 flex items-center justify-center hover:bg-emerald-700 rounded-md transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-xs font-bold w-4 text-center tabular-nums">
                {quantityInCart}
              </span>
              <button
                onClick={handleIncrement}
                disabled={quantityInCart >= product.stockQuantity}
                className={`w-5 h-5 flex items-center justify-center rounded-md transition-colors ${
                  quantityInCart >= product.stockQuantity
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:bg-emerald-700'
                }`}
                aria-label="Increase quantity"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
