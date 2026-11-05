import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Cart, CartItem } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from './AuthContext.js';

interface CartContextType {
  cart: Cart | null;
  items: CartItem[];
  cartCount: number;
  itemTotal: number;
  deliveryFee: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  couponCode: string;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [couponCode, setCouponCode] = useState<string>('QUICK50');
  const [error, setError] = useState<string | null>(null);

  const refreshCart = useCallback(async () => {
    try {
      const res = await api.getCart();
      setCart(res.cart);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [user, refreshCart]);

  const items = cart?.items || [];
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const itemTotal = items.reduce((sum, item) => {
    const price = item.product?.sellingPrice || 0;
    return sum + price * item.quantity;
  }, 0);

  const deliveryFee = itemTotal >= 299 || itemTotal === 0 ? 0 : 25;
  const taxAmount = itemTotal > 0 ? Math.round(itemTotal * 0.05) : 0;

  let discountAmount = 0;
  if (couponCode === 'QUICK50' && itemTotal > 0) {
    discountAmount = Math.min(50, Math.round(itemTotal * 0.2));
  } else if (couponCode === 'FREEDEL' && itemTotal > 0) {
    discountAmount = deliveryFee;
  }

  const totalAmount = Math.max(0, itemTotal + deliveryFee + taxAmount - discountAmount);

  const addToCart = async (productId: string, quantity = 1) => {
    setError(null);
    try {
      const res = await api.addToCart(productId, quantity);
      setCart(res.cart);
    } catch (err: any) {
      setError(err.message || 'Could not add item to cart');
      throw err;
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    setError(null);
    try {
      const res = await api.updateCartItem(productId, quantity);
      setCart(res.cart);
    } catch (err: any) {
      setError(err.message || 'Could not update item quantity');
      throw err;
    }
  };

  const removeItem = async (productId: string) => {
    await updateQuantity(productId, 0);
  };

  const clearCart = async () => {
    await api.clearCart();
    await refreshCart();
  };

  const applyCoupon = (code: string): boolean => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'QUICK50' || cleanCode === 'FREEDEL') {
      setCouponCode(cleanCode);
      return true;
    }
    return false;
  };

  const removeCoupon = () => {
    setCouponCode('');
  };

  const clearError = () => setError(null);

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        cartCount,
        itemTotal,
        deliveryFee,
        taxAmount,
        discountAmount,
        totalAmount,
        couponCode,
        isCartOpen,
        isCheckoutOpen,
        setIsCartOpen,
        setIsCheckoutOpen,
        addToCart,
        updateQuantity,
        removeItem,
        applyCoupon,
        removeCoupon,
        clearCart,
        refreshCart,
        error,
        clearError,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
