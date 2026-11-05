import fs from 'fs';
import path from 'path';
import {
  Product,
  Recipe,
  Supplier,
  User,
  Order,
  Cart,
  PurchaseOrder,
  OrderStatus,
} from './types.js';
import {
  INITIAL_PRODUCTS,
  INITIAL_RECIPES,
  INITIAL_SUPPLIERS,
  INITIAL_USERS,
  INITIAL_ORDERS,
} from './seedData.js';

interface DatabaseState {
  users: User[];
  products: Product[];
  recipes: Recipe[];
  suppliers: Supplier[];
  orders: Order[];
  carts: Record<string, Cart>; // userId -> Cart
  purchaseOrders: PurchaseOrder[];
}

const STORAGE_FILE = path.resolve(process.cwd(), 'server-data.json');

class QuickBasketDatabase {
  private state: DatabaseState;

  constructor() {
    this.state = this.loadOrInitialize();
  }

  private loadOrInitialize(): DatabaseState {
    try {
      if (fs.existsSync(STORAGE_FILE)) {
        const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.products && parsed.products.length >= 300) {
          return parsed;
        }
      }
    } catch {
      // Fallback to fresh seed
    }

    return {
      users: [...INITIAL_USERS],
      products: [...INITIAL_PRODUCTS],
      recipes: [...INITIAL_RECIPES],
      suppliers: [...INITIAL_SUPPLIERS],
      orders: [...INITIAL_ORDERS],
      carts: {
        usr_cust_1: {
          userId: 'usr_cust_1',
          items: [
            { productId: 'prod_fruit_1', quantity: 1 },
            { productId: 'prod_dairy_4', quantity: 1 },
          ],
          discountAmount: 0,
        },
      },
      purchaseOrders: [
        {
          id: 'PO-2026-001',
          supplierId: 'sup_1',
          supplierName: 'Kisan Fresh Agro Mandi',
          items: [
            { productId: 'prod_fruit_1', productName: 'Shimla Royal Apple', quantity: 100, unitCost: 115, totalCost: 11500 },
            { productId: 'prod_veg_1', productName: 'Fresh Hybrid Tomatoes', quantity: 150, unitCost: 22, totalCost: 3300 },
          ],
          totalCost: 14800,
          status: 'Received',
          createdAt: '2026-11-01T10:00:00Z',
          receivedAt: '2026-11-02T14:30:00Z',
          notes: 'Standard weekly fresh produce restocking.',
        },
      ],
    };
  }

  public save() {
    try {
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch {
      // Best-effort in-memory persistence
    }
  }

  public resetToDefault() {
    this.state = {
      users: [...INITIAL_USERS],
      products: [...INITIAL_PRODUCTS],
      recipes: [...INITIAL_RECIPES],
      suppliers: [...INITIAL_SUPPLIERS],
      orders: [...INITIAL_ORDERS],
      carts: {},
      purchaseOrders: [],
    };
    this.save();
  }

  // --- Users & Auth ---
  public findUserByEmail(email: string): User | undefined {
    return this.state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): User | undefined {
    return this.state.users.find(u => u.id === id);
  }

  public createUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      ...user,
      id: `usr_${user.role}_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.state.users.push(newUser);
    this.save();
    return newUser;
  }

  public getAllDeliveryPartners(): User[] {
    return this.state.users.filter(u => u.role === 'delivery');
  }

  public getAllCustomers(): User[] {
    return this.state.users.filter(u => u.role === 'customer');
  }

  // --- Products ---
  public getProducts(options: {
    category?: string;
    search?: string;
    brand?: string;
    inStockOnly?: boolean;
    sort?: 'price_asc' | 'price_desc' | 'rating' | 'popular' | 'discount';
    role?: string;
  } = {}): Product[] {
    let result = [...this.state.products];

    if (options.category && options.category !== 'All') {
      result = result.filter(p => p.category.toLowerCase() === options.category!.toLowerCase());
    }

    if (options.brand) {
      result = result.filter(p => p.brand.toLowerCase() === options.brand!.toLowerCase());
    }

    if (options.search) {
      const q = options.search.toLowerCase().trim();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (options.inStockOnly) {
      result = result.filter(p => p.stockQuantity > 0);
    }

    if (options.sort) {
      if (options.sort === 'price_asc') result.sort((a, b) => a.sellingPrice - b.sellingPrice);
      if (options.sort === 'price_desc') result.sort((a, b) => b.sellingPrice - a.sellingPrice);
      if (options.sort === 'rating') result.sort((a, b) => b.rating - a.rating);
      if (options.sort === 'discount') result.sort((a, b) => b.discountPercent - a.discountPercent);
      if (options.sort === 'popular') result.sort((a, b) => b.reviewCount - a.reviewCount);
    }

    // Customer safe sanitize: do not reveal cost price or supplier to regular customers
    if (options.role !== 'admin') {
      return result.map(({ costPrice, supplierId, ...safeProduct }) => safeProduct as Product);
    }

    return result;
  }

  public getProductById(id: string, role?: string): Product | undefined {
    const p = this.state.products.find(item => item.id === id);
    if (!p) return undefined;
    if (role !== 'admin') {
      const { costPrice, supplierId, ...safe } = p;
      return safe as Product;
    }
    return p;
  }

  public addProduct(p: Omit<Product, 'id' | 'sku'>): Product {
    const count = this.state.products.length + 1;
    const newProduct: Product = {
      ...p,
      id: `prod_custom_${Date.now()}`,
      sku: `SKU-CUS-${count + 10000}`,
      rating: p.rating || 4.5,
      reviewCount: p.reviewCount || 1,
    };
    this.state.products.unshift(newProduct);
    this.save();
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | undefined {
    const idx = this.state.products.findIndex(p => p.id === id);
    if (idx === -1) return undefined;

    this.state.products[idx] = {
      ...this.state.products[idx],
      ...updates,
    };
    this.save();
    return this.state.products[idx];
  }

  public deleteProduct(id: string): boolean {
    const idx = this.state.products.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.state.products.splice(idx, 1);
    this.save();
    return true;
  }

  public updateStock(id: string, newStock: number): Product | undefined {
    const p = this.state.products.find(item => item.id === id);
    if (!p) return undefined;
    p.stockQuantity = Math.max(0, newStock);
    this.save();
    return p;
  }

  public getLowStockProducts(): Product[] {
    return this.state.products.filter(p => p.stockQuantity <= p.minStockThreshold);
  }

  // --- Cart ---
  public getCart(userId: string): Cart {
    if (!this.state.carts[userId]) {
      this.state.carts[userId] = { userId, items: [], discountAmount: 0 };
    }
    const cart = this.state.carts[userId];
    // Attach current fresh product info
    cart.items = cart.items.map(item => {
      const product = this.getProductById(item.productId);
      return {
        ...item,
        product,
      };
    });
    return cart;
  }

  public addToCart(userId: string, productId: string, quantity = 1): Cart {
    const product = this.state.products.find(p => p.id === productId);
    if (!product) throw new Error('Product not found');

    const cart = this.getCart(userId);
    const existing = cart.items.find(i => i.productId === productId);

    const currentQty = existing ? existing.quantity : 0;
    const requestedTotal = currentQty + quantity;

    if (requestedTotal > product.stockQuantity) {
      throw new Error(`Only ${product.stockQuantity} items in stock. Cannot add more.`);
    }

    if (existing) {
      existing.quantity = requestedTotal;
    } else {
      cart.items.push({ productId, quantity });
    }

    this.state.carts[userId] = cart;
    this.save();
    return this.getCart(userId);
  }

  public updateCartItem(userId: string, productId: string, quantity: number): Cart {
    const product = this.state.products.find(p => p.id === productId);
    if (!product) throw new Error('Product not found');

    const cart = this.getCart(userId);
    if (quantity <= 0) {
      cart.items = cart.items.filter(i => i.productId !== productId);
    } else {
      if (quantity > product.stockQuantity) {
        throw new Error(`Only ${product.stockQuantity} items available.`);
      }
      const existing = cart.items.find(i => i.productId === productId);
      if (existing) {
        existing.quantity = quantity;
      } else {
        cart.items.push({ productId, quantity });
      }
    }

    this.state.carts[userId] = cart;
    this.save();
    return this.getCart(userId);
  }

  public clearCart(userId: string) {
    this.state.carts[userId] = { userId, items: [], discountAmount: 0 };
    this.save();
  }

  // --- Orders & Transactional Checkout ---
  public placeOrder(orderData: {
    customerId: string;
    customerName: string;
    customerPhone: string;
    deliveryAddress: any;
    paymentMethod: 'Cash on Delivery' | 'UPI' | 'Card / NetBanking';
    items: { productId: string; quantity: number }[];
    couponCode?: string;
  }): Order {
    // 1. Transactional validation: Check all items have sufficient stock
    for (const item of orderData.items) {
      const prod = this.state.products.find(p => p.id === item.productId);
      if (!prod) {
        throw new Error(`Product ${item.productId} does not exist`);
      }
      if (prod.stockQuantity < item.quantity) {
        throw new Error(`Insufficient stock for "${prod.name}". Available: ${prod.stockQuantity}, Requested: ${item.quantity}`);
      }
    }

    // 2. Deduct inventory transactionally
    const orderItems: any[] = [];
    let itemTotal = 0;

    for (const item of orderData.items) {
      const prod = this.state.products.find(p => p.id === item.productId)!;
      prod.stockQuantity -= item.quantity;

      const lineTotal = prod.sellingPrice * item.quantity;
      itemTotal += lineTotal;

      orderItems.push({
        productId: prod.id,
        productName: prod.name,
        quantity: item.quantity,
        unit: prod.unit,
        price: prod.sellingPrice,
        imageUrl: prod.imageUrl,
      });
    }

    // 3. Calculate delivery, discount, and taxes
    const deliveryFee = itemTotal >= 299 ? 0 : 25;
    const taxAmount = Math.round(itemTotal * 0.05); // 5% GST on grocery / packaged goods

    let discountAmount = 0;
    if (orderData.couponCode === 'QUICK50') {
      discountAmount = Math.min(50, Math.round(itemTotal * 0.2));
    } else if (orderData.couponCode === 'FREEDEL') {
      discountAmount = deliveryFee;
    }

    const totalAmount = Math.max(0, itemTotal + deliveryFee + taxAmount - discountAmount);

    // 4. Generate random 4-digit delivery OTP
    const deliveryOtp = String(Math.floor(1000 + Math.random() * 9000));

    // 5. Automatically assign an active delivery partner if available
    const riders = this.getAllDeliveryPartners();
    const assignedRider = riders.length > 0 ? riders[Math.floor(Math.random() * riders.length)] : undefined;

    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: orderId,
      customerId: orderData.customerId,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      deliveryAddress: orderData.deliveryAddress,
      items: orderItems,
      itemTotal,
      deliveryFee,
      taxAmount,
      discountAmount,
      totalAmount,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: orderData.paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
      orderStatus: 'Order Placed',
      statusHistory: [
        { status: 'Order Placed', timestamp: new Date().toISOString(), note: 'Order placed by customer' },
      ],
      deliveryPartnerId: assignedRider ? assignedRider.id : undefined,
      deliveryPartnerName: assignedRider ? assignedRider.name : undefined,
      deliveryPartnerPhone: assignedRider ? assignedRider.phone : undefined,
      deliveryOtp,
      estimatedDeliveryMinutes: 10 + Math.floor(Math.random() * 8),
      createdAt: new Date().toISOString(),
    };

    if (assignedRider) {
      newOrder.statusHistory.push({
        status: 'Delivery Partner Assigned',
        timestamp: new Date().toISOString(),
        note: `Partner ${assignedRider.name} assigned`,
      });
    }

    this.state.orders.unshift(newOrder);

    // Clear cart for this user
    this.clearCart(orderData.customerId);
    this.save();

    return newOrder;
  }

  public getOrders(filter: { customerId?: string; deliveryPartnerId?: string; status?: string } = {}): Order[] {
    let result = [...this.state.orders];
    if (filter.customerId) {
      result = result.filter(o => o.customerId === filter.customerId);
    }
    if (filter.deliveryPartnerId) {
      result = result.filter(o => o.deliveryPartnerId === filter.deliveryPartnerId);
    }
    if (filter.status && filter.status !== 'All') {
      result = result.filter(o => o.orderStatus === filter.status);
    }
    return result;
  }

  public getOrderById(id: string): Order | undefined {
    return this.state.orders.find(o => o.id === id);
  }

  public updateOrderStatus(orderId: string, newStatus: OrderStatus, note?: string): Order | undefined {
    const order = this.state.orders.find(o => o.id === orderId);
    if (!order) return undefined;

    // If order was cancelled, rollback stock
    if (newStatus === 'Cancelled' && order.orderStatus !== 'Cancelled') {
      for (const item of order.items) {
        const prod = this.state.products.find(p => p.id === item.productId);
        if (prod) prod.stockQuantity += item.quantity;
      }
    }

    order.orderStatus = newStatus;
    if (newStatus === 'Delivered') {
      order.deliveredAt = new Date().toISOString();
      order.paymentStatus = 'Paid';
    }

    order.statusHistory.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: note || `Status updated to ${newStatus}`,
    });

    this.save();
    return order;
  }

  public verifyDeliveryOtp(orderId: string, enteredOtp: string): { success: boolean; message: string; order?: Order } {
    const order = this.state.orders.find(o => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found' };

    if (order.deliveryOtp.trim() !== enteredOtp.trim()) {
      return { success: false, message: 'Invalid OTP. Please ask customer to provide the 4-digit OTP shown in their QuickBasket app.' };
    }

    this.updateOrderStatus(orderId, 'Delivered', 'Verified with Customer Delivery OTP');
    return { success: true, message: 'OTP verified successfully. Order marked as Delivered!', order };
  }

  public assignDeliveryPartner(orderId: string, partnerId: string): Order | undefined {
    const order = this.state.orders.find(o => o.id === orderId);
    const partner = this.state.users.find(u => u.id === partnerId && u.role === 'delivery');
    if (!order || !partner) return undefined;

    order.deliveryPartnerId = partner.id;
    order.deliveryPartnerName = partner.name;
    order.deliveryPartnerPhone = partner.phone;
    order.statusHistory.push({
      status: 'Delivery Partner Assigned',
      timestamp: new Date().toISOString(),
      note: `Assigned to ${partner.name}`,
    });
    this.save();
    return order;
  }

  // --- Recipes & Inventory Ingredient Matching ---
  public getRecipes(category?: string): Recipe[] {
    if (!category || category === 'All') return this.state.recipes;
    return this.state.recipes.filter(r => r.category.toLowerCase() === category.toLowerCase());
  }

  public getRecipeById(id: string): Recipe | undefined {
    return this.state.recipes.find(r => r.id === id);
  }

  public matchRecipeIngredients(recipeId: string): {
    recipe: Recipe;
    matchedProducts: { ingredient: any; product: Product; isAvailable: boolean }[];
    missingIngredients: any[];
    totalCost: number;
    allAvailable: boolean;
  } {
    const recipe = this.getRecipeById(recipeId);
    if (!recipe) throw new Error('Recipe not found');

    const matchedProducts: any[] = [];
    const missingIngredients: any[] = [];
    let totalCost = 0;

    for (const ing of recipe.ingredients) {
      let product: Product | undefined;

      if (ing.matchedProductId) {
        product = this.state.products.find(p => p.id === ing.matchedProductId);
      }

      if (!product) {
        // Fallback fuzzy search by name
        product = this.state.products.find(p =>
          p.name.toLowerCase().includes(ing.ingredientName.toLowerCase()) ||
          ing.ingredientName.toLowerCase().includes(p.name.toLowerCase())
        );
      }

      if (product) {
        const isAvailable = product.stockQuantity > 0;
        matchedProducts.push({
          ingredient: ing,
          product,
          isAvailable,
        });
        if (isAvailable) {
          totalCost += product.sellingPrice;
        }
      } else {
        missingIngredients.push(ing);
      }
    }

    const allAvailable = missingIngredients.length === 0 && matchedProducts.every(m => m.isAvailable);

    return {
      recipe,
      matchedProducts,
      missingIngredients,
      totalCost,
      allAvailable,
    };
  }

  // --- Suppliers & Purchase Orders ---
  public getSuppliers(): Supplier[] {
    return this.state.suppliers;
  }

  public addSupplier(supplierData: Omit<Supplier, 'id'>): Supplier {
    const newSup: Supplier = {
      ...supplierData,
      id: `sup_${Date.now()}`,
    };
    this.state.suppliers.push(newSup);
    this.save();
    return newSup;
  }

  public getPurchaseOrders(): PurchaseOrder[] {
    return this.state.purchaseOrders;
  }

  public createPurchaseOrder(data: {
    supplierId: string;
    items: { productId: string; quantity: number; unitCost: number }[];
    notes?: string;
  }): PurchaseOrder {
    const supplier = this.state.suppliers.find(s => s.id === data.supplierId);
    if (!supplier) throw new Error('Supplier not found');

    const poItems = data.items.map(i => {
      const prod = this.state.products.find(p => p.id === i.productId);
      return {
        productId: i.productId,
        productName: prod ? prod.name : 'Unknown Product',
        quantity: i.quantity,
        unitCost: i.unitCost,
        totalCost: i.quantity * i.unitCost,
      };
    });

    const totalCost = poItems.reduce((sum, item) => sum + item.totalCost, 0);

    const po: PurchaseOrder = {
      id: `PO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      supplierId: supplier.id,
      supplierName: supplier.name,
      items: poItems,
      totalCost,
      status: 'Sent',
      createdAt: new Date().toISOString(),
      notes: data.notes,
    };

    this.state.purchaseOrders.unshift(po);
    this.save();
    return po;
  }

  public receivePurchaseOrder(poId: string): PurchaseOrder {
    const po = this.state.purchaseOrders.find(p => p.id === poId);
    if (!po) throw new Error('Purchase order not found');

    if (po.status === 'Received') {
      return po;
    }

    // Automatically restock products
    for (const item of po.items) {
      const prod = this.state.products.find(p => p.id === item.productId);
      if (prod) {
        prod.stockQuantity += item.quantity;
        prod.costPrice = item.unitCost;
      }
    }

    po.status = 'Received';
    po.receivedAt = new Date().toISOString();
    this.save();
    return po;
  }

  // --- Analytics & Demand Forecasting ---
  public getAnalytics() {
    const totalRevenue = this.state.orders
      .filter(o => o.orderStatus !== 'Cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const totalOrders = this.state.orders.length;
    const completedOrders = this.state.orders.filter(o => o.orderStatus === 'Delivered').length;
    const pendingOrders = this.state.orders.filter(o => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled').length;

    const lowStockCount = this.state.products.filter(p => p.stockQuantity <= p.minStockThreshold).length;
    const outOfStockCount = this.state.products.filter(p => p.stockQuantity === 0).length;

    // Sales by category
    const categorySales: Record<string, number> = {};
    for (const order of this.state.orders) {
      if (order.orderStatus === 'Cancelled') continue;
      for (const item of order.items) {
        const prod = this.state.products.find(p => p.id === item.productId);
        const cat = prod ? prod.category : 'General';
        categorySales[cat] = (categorySales[cat] || 0) + item.price * item.quantity;
      }
    }

    // Demand forecasting (simulated using inventory velocities + reorder suggestions)
    const demandForecast = this.state.products
      .filter(p => p.stockQuantity <= p.minStockThreshold + 10)
      .slice(0, 10)
      .map(p => {
        const estDailyBurn = Math.max(2, Math.round(p.reviewCount / 20));
        const daysOfSupply = +(p.stockQuantity / estDailyBurn).toFixed(1);
        const suggestedReorder = Math.max(30, p.minStockThreshold * 3);
        return {
          productId: p.id,
          name: p.name,
          category: p.category,
          currentStock: p.stockQuantity,
          minThreshold: p.minStockThreshold,
          estimatedDailySales: estDailyBurn,
          daysOfSupply,
          suggestedReorder,
          priority: daysOfSupply <= 2 ? 'Critical' : 'Moderate',
        };
      });

    return {
      totalRevenue,
      totalOrders,
      completedOrders,
      pendingOrders,
      totalCustomers: this.getAllCustomers().length,
      totalDeliveryPartners: this.getAllDeliveryPartners().length,
      totalProducts: this.state.products.length,
      lowStockCount,
      outOfStockCount,
      categorySales,
      demandForecast,
    };
  }
}

export const db = new QuickBasketDatabase();
