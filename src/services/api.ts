import {
  Cart,
  CategoryItem,
  Order,
  OrderStatus,
  Product,
  PurchaseOrder,
  Recipe,
  Supplier,
  User,
} from '../types/index.js';

class ApiService {
  private getHeaders(): HeadersInit {
    const userJson = localStorage.getItem('qb_user');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        headers['x-user-id'] = user.id;
        headers['x-user-role'] = user.role;
      } catch {
        // ignore
      }
    }
    return headers;
  }

  // Auth
  async login(email: string, password: string, role?: string): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Login failed');
    }
    return res.json();
  }

  async register(data: { name: string; email: string; password: string; phone: string; role?: string }): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Registration failed');
    }
    return res.json();
  }

  // Products
  async getProducts(params?: {
    category?: string;
    search?: string;
    brand?: string;
    inStockOnly?: boolean;
    sort?: string;
  }): Promise<{ products: Product[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.brand) query.set('brand', params.brand);
    if (params?.inStockOnly) query.set('inStockOnly', 'true');
    if (params?.sort) query.set('sort', params.sort);

    const res = await fetch(`/api/products?${query.toString()}`, {
      headers: this.getHeaders(),
    });
    return res.json();
  }

  async getProductById(id: string): Promise<{ product: Product }> {
    const res = await fetch(`/api/products/${id}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Product not found');
    return res.json();
  }

  async getCategories(): Promise<{ categories: CategoryItem[] }> {
    const res = await fetch('/api/categories');
    return res.json();
  }

  // Cart
  async getCart(): Promise<{ cart: Cart }> {
    const res = await fetch('/api/cart', {
      headers: this.getHeaders(),
    });
    return res.json();
  }

  async addToCart(productId: string, quantity = 1): Promise<{ cart: Cart; message: string }> {
    const res = await fetch('/api/cart/add', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ productId, quantity }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to add item to cart');
    }
    return res.json();
  }

  async updateCartItem(productId: string, quantity: number): Promise<{ cart: Cart }> {
    const res = await fetch('/api/cart/update', {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ productId, quantity }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to update cart');
    }
    return res.json();
  }

  async clearCart(): Promise<void> {
    await fetch('/api/cart/clear', {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
  }

  // Checkout & Orders
  async checkout(orderData: any): Promise<{ order: Order; message: string }> {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(orderData),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Checkout failed');
    }
    return res.json();
  }

  async getOrders(params?: { customerId?: string; deliveryPartnerId?: string; status?: string }): Promise<{ orders: Order[] }> {
    const query = new URLSearchParams();
    if (params?.customerId) query.set('customerId', params.customerId);
    if (params?.deliveryPartnerId) query.set('deliveryPartnerId', params.deliveryPartnerId);
    if (params?.status) query.set('status', params.status);

    const res = await fetch(`/api/orders?${query.toString()}`, {
      headers: this.getHeaders(),
    });
    return res.json();
  }

  async getOrderById(id: string): Promise<{ order: Order }> {
    const res = await fetch(`/api/orders/${id}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Order not found');
    return res.json();
  }

  async updateOrderStatus(id: string, status: OrderStatus, note?: string): Promise<{ order: Order; message: string }> {
    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ status, note }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to update order status');
    }
    return res.json();
  }

  async verifyDeliveryOtp(id: string, otp: string): Promise<{ success: boolean; message: string; order?: Order }> {
    const res = await fetch(`/api/orders/${id}/verify-otp`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ otp }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to verify OTP');
    }
    return data;
  }

  async assignOrderPartner(id: string, deliveryPartnerId: string): Promise<{ order: Order; message: string }> {
    const res = await fetch(`/api/orders/${id}/assign`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ deliveryPartnerId }),
    });
    if (!res.ok) throw new Error('Failed to assign partner');
    return res.json();
  }

  // Recipes
  async getRecipes(category?: string): Promise<{ recipes: Recipe[]; total: number }> {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    const res = await fetch(`/api/recipes${query}`);
    return res.json();
  }

  async getRecipeById(id: string): Promise<{ recipe: Recipe }> {
    const res = await fetch(`/api/recipes/${id}`);
    if (!res.ok) throw new Error('Recipe not found');
    return res.json();
  }

  async matchRecipeIngredients(id: string): Promise<{
    recipe: Recipe;
    matchedProducts: { ingredient: any; product: Product; isAvailable: boolean }[];
    missingIngredients: any[];
    totalCost: number;
    allAvailable: boolean;
  }> {
    const res = await fetch(`/api/recipes/${id}/match-ingredients`);
    if (!res.ok) throw new Error('Failed to match ingredients');
    return res.json();
  }

  async addRecipeIngredientsToCart(id: string): Promise<{ cart: Cart; addedItems: string[]; missingCount: number; message: string }> {
    const res = await fetch(`/api/recipes/${id}/add-to-cart`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to add recipe ingredients');
    }
    return res.json();
  }

  // Admin APIs
  async getAdminInventory(): Promise<{ products: Product[]; lowStock: Product[]; total: number }> {
    const res = await fetch('/api/admin/inventory', {
      headers: this.getHeaders(),
    });
    return res.json();
  }

  async addAdminProduct(productData: any): Promise<{ product: Product; message: string }> {
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(productData),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to add product');
    }
    return res.json();
  }

  async updateAdminProduct(id: string, updates: any): Promise<{ product: Product; message: string }> {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to update product');
    }
    return res.json();
  }

  async deleteAdminProduct(id: string): Promise<{ message: string }> {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete product');
    return res.json();
  }

  async updateProductStock(id: string, stockQuantity: number): Promise<{ product: Product; message: string }> {
    const res = await fetch(`/api/admin/products/${id}/stock`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ stockQuantity }),
    });
    return res.json();
  }

  async getSuppliers(): Promise<{ suppliers: Supplier[] }> {
    const res = await fetch('/api/suppliers', {
      headers: this.getHeaders(),
    });
    return res.json();
  }

  async addSupplier(data: any): Promise<{ supplier: Supplier }> {
    const res = await fetch('/api/suppliers', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  }

  async getPurchaseOrders(): Promise<{ purchaseOrders: PurchaseOrder[] }> {
    const res = await fetch('/api/purchase-orders', {
      headers: this.getHeaders(),
    });
    return res.json();
  }

  async createPurchaseOrder(data: any): Promise<{ purchaseOrder: PurchaseOrder; message: string }> {
    const res = await fetch('/api/purchase-orders', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create PO');
    }
    return res.json();
  }

  async receivePurchaseOrder(id: string): Promise<{ purchaseOrder: PurchaseOrder; message: string }> {
    const res = await fetch(`/api/purchase-orders/${id}/receive`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return res.json();
  }

  async getAnalytics(): Promise<any> {
    const res = await fetch('/api/analytics', {
      headers: this.getHeaders(),
    });
    return res.json();
  }

  async getDeliveryPartners(): Promise<{ partners: User[] }> {
    const res = await fetch('/api/admin/delivery-partners', {
      headers: this.getHeaders(),
    });
    return res.json();
  }

  async getCustomers(): Promise<{ customers: User[] }> {
    const res = await fetch('/api/admin/customers', {
      headers: this.getHeaders(),
    });
    return res.json();
  }

  async resetDemoData(): Promise<{ message: string }> {
    const res = await fetch('/api/demo-reset', { method: 'POST' });
    return res.json();
  }
}

export const api = new ApiService();
