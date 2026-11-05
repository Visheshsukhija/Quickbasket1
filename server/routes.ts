import { Router, Request, Response } from 'express';
import { db } from './db.js';

export const apiRouter = Router();

// --- Auth Routes ---
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.findUserByEmail(email);
  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // If role is specified, verify RBAC role match
  if (role && user.role !== role) {
    return res.status(403).json({ error: `Account does not have ${role} role permissions.` });
  }

  const { passwordHash, ...safeUser } = user;
  return res.json({
    user: safeUser,
    token: `demo-jwt-token-${user.id}-${Date.now()}`,
  });
});

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { name, email, password, phone, role } = req.body;
  if (!name || !email || !password || !phone) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const existing = db.findUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

  const user = db.createUser({
    name,
    email,
    passwordHash: password,
    phone,
    role: role || 'customer',
    avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 5000)}?auto=format&fit=crop&w=200&q=80`,
  });

  const { passwordHash: _, ...safeUser } = user;
  return res.json({
    user: safeUser,
    token: `demo-jwt-token-${user.id}-${Date.now()}`,
  });
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const user = db.findUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const { passwordHash, ...safeUser } = user;
  return res.json({ user: safeUser });
});

// --- Products & Categories ---
apiRouter.get('/products', (req: Request, res: Response) => {
  const { category, search, brand, inStockOnly, sort, role } = req.query;
  const products = db.getProducts({
    category: category as string,
    search: search as string,
    brand: brand as string,
    inStockOnly: inStockOnly === 'true',
    sort: sort as any,
    role: role as string,
  });
  return res.json({ products, total: products.length });
});

apiRouter.get('/products/:id', (req: Request, res: Response) => {
  const role = req.headers['x-user-role'] as string;
  const product = db.getProductById(req.params.id, role);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  return res.json({ product });
});

apiRouter.get('/categories', (_req: Request, res: Response) => {
  const categories = [
    { name: 'Fruits', count: 20, icon: 'Apple' },
    { name: 'Vegetables', count: 25, icon: 'Carrot' },
    { name: 'Dairy', count: 20, icon: 'Milk' },
    { name: 'Rice and Grains', count: 20, icon: 'Wheat' },
    { name: 'Dal and Pulses', count: 20, icon: 'Bean' },
    { name: 'Snacks and Chips', count: 25, icon: 'Cookie' },
    { name: 'Beverages', count: 20, icon: 'Coffee' },
    { name: 'Bakery', count: 15, icon: 'Croissant' },
    { name: 'Spices and Masalas', count: 20, icon: 'Flame' },
    { name: 'Cooking Oils and Ghee', count: 15, icon: 'Droplet' },
    { name: 'Instant Food', count: 20, icon: 'Timer' },
    { name: 'Frozen Food', count: 10, icon: 'Snowflake' },
    { name: 'Personal Care', count: 15, icon: 'Sparkles' },
    { name: 'Cleaning Supplies', count: 15, icon: 'Brush' },
    { name: 'Crockery', count: 15, icon: 'Utensils' },
    { name: 'Kitchen Essentials', count: 15, icon: 'Soup' },
    { name: 'Dry Fruits', count: 10, icon: 'Nut' },
  ];
  return res.json({ categories });
});

// --- Cart ---
apiRouter.get('/cart', (req: Request, res: Response) => {
  const userId = (req.headers['x-user-id'] as string) || 'usr_cust_1';
  const cart = db.getCart(userId);
  return res.json({ cart });
});

apiRouter.post('/cart/add', (req: Request, res: Response) => {
  const userId = (req.headers['x-user-id'] as string) || 'usr_cust_1';
  const { productId, quantity = 1 } = req.body;
  try {
    const cart = db.addToCart(userId, productId, quantity);
    return res.json({ cart, message: 'Added to cart' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/cart/update', (req: Request, res: Response) => {
  const userId = (req.headers['x-user-id'] as string) || 'usr_cust_1';
  const { productId, quantity } = req.body;
  try {
    const cart = db.updateCartItem(userId, productId, quantity);
    return res.json({ cart });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/cart/clear', (req: Request, res: Response) => {
  const userId = (req.headers['x-user-id'] as string) || 'usr_cust_1';
  db.clearCart(userId);
  return res.json({ message: 'Cart cleared' });
});

// --- Checkout & Orders ---
apiRouter.post('/checkout', (req: Request, res: Response) => {
  const userId = (req.headers['x-user-id'] as string) || 'usr_cust_1';
  const { customerName, customerPhone, deliveryAddress, paymentMethod, items, couponCode } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty. Add items to checkout.' });
  }

  try {
    const order = db.placeOrder({
      customerId: userId,
      customerName: customerName || 'Valued Customer',
      customerPhone: customerPhone || '+91 99887 76655',
      deliveryAddress: deliveryAddress || {
        tag: 'Home',
        street: 'Flat 101, Lakeview Residency',
        area: 'Indiranagar',
        city: 'Bengaluru',
        pincode: '560038',
      },
      paymentMethod: paymentMethod || 'UPI',
      items,
      couponCode,
    });
    return res.status(201).json({ order, message: 'Order placed successfully!' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/orders', (req: Request, res: Response) => {
  const { customerId, deliveryPartnerId, status } = req.query;
  const orders = db.getOrders({
    customerId: customerId as string,
    deliveryPartnerId: deliveryPartnerId as string,
    status: status as string,
  });
  return res.json({ orders });
});

apiRouter.get('/orders/:id', (req: Request, res: Response) => {
  const order = db.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  return res.json({ order });
});

apiRouter.put('/orders/:id/status', (req: Request, res: Response) => {
  const { status, note } = req.body;
  const order = db.updateOrderStatus(req.params.id, status, note);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  return res.json({ order, message: `Status updated to ${status}` });
});

apiRouter.post('/orders/:id/verify-otp', (req: Request, res: Response) => {
  const { otp } = req.body;
  if (!otp) {
    return res.status(400).json({ error: 'OTP is required' });
  }
  const result = db.verifyDeliveryOtp(req.params.id, otp);
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }
  return res.json(result);
});

apiRouter.post('/orders/:id/assign', (req: Request, res: Response) => {
  const { deliveryPartnerId } = req.body;
  const order = db.assignDeliveryPartner(req.params.id, deliveryPartnerId);
  if (!order) {
    return res.status(404).json({ error: 'Order or Delivery Partner not found' });
  }
  return res.json({ order, message: 'Partner assigned successfully' });
});

// --- Recipes & Smart Matcher ---
apiRouter.get('/recipes', (req: Request, res: Response) => {
  const { category } = req.query;
  const recipes = db.getRecipes(category as string);
  return res.json({ recipes, total: recipes.length });
});

apiRouter.get('/recipes/:id', (req: Request, res: Response) => {
  const recipe = db.getRecipeById(req.params.id);
  if (!recipe) {
    return res.status(404).json({ error: 'Recipe not found' });
  }
  return res.json({ recipe });
});

apiRouter.get('/recipes/:id/match-ingredients', (req: Request, res: Response) => {
  try {
    const match = db.matchRecipeIngredients(req.params.id);
    return res.json(match);
  } catch (err: any) {
    return res.status(404).json({ error: err.message });
  }
});

apiRouter.post('/recipes/:id/add-to-cart', (req: Request, res: Response) => {
  const userId = (req.headers['x-user-id'] as string) || 'usr_cust_1';
  try {
    const match = db.matchRecipeIngredients(req.params.id);
    const addedItems: any[] = [];
    for (const item of match.matchedProducts) {
      if (item.isAvailable) {
        db.addToCart(userId, item.product.id, 1);
        addedItems.push(item.product.name);
      }
    }
    const cart = db.getCart(userId);
    return res.json({
      cart,
      addedItems,
      missingCount: match.missingIngredients.length,
      message: `Added ${addedItems.length} available ingredients to your cart!`,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// --- Admin & Inventory Management ---
apiRouter.get('/admin/inventory', (_req: Request, res: Response) => {
  const products = db.getProducts({ role: 'admin' });
  const lowStock = db.getLowStockProducts();
  return res.json({ products, lowStock, total: products.length });
});

apiRouter.post('/admin/products', (req: Request, res: Response) => {
  const { name, brand, category, subcategory, description, imageUrl, mrp, sellingPrice, stockQuantity, unit, minStockThreshold, costPrice } = req.body;
  if (!name || !category || !sellingPrice) {
    return res.status(400).json({ error: 'Name, Category, and Selling Price are required' });
  }

  const newProd = db.addProduct({
    name,
    brand: brand || 'QuickBasket Fresh',
    category,
    subcategory: subcategory || category,
    description: description || `Fresh high quality ${name}.`,
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
    mrp: Number(mrp) || Number(sellingPrice),
    sellingPrice: Number(sellingPrice),
    discountPercent: Math.round((((Number(mrp) || Number(sellingPrice)) - Number(sellingPrice)) / (Number(mrp) || Number(sellingPrice))) * 100),
    stockQuantity: Number(stockQuantity) || 10,
    unit: unit || '1 unit',
    minStockThreshold: Number(minStockThreshold) || 5,
    costPrice: Number(costPrice) || Math.round(Number(sellingPrice) * 0.75),
    rating: 4.5,
    reviewCount: 1,
  });

  return res.status(201).json({ product: newProd, message: 'Product added successfully' });
});

apiRouter.put('/admin/products/:id', (req: Request, res: Response) => {
  const updated = db.updateProduct(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Product not found' });
  }
  return res.json({ product: updated, message: 'Product updated successfully' });
});

apiRouter.delete('/admin/products/:id', (req: Request, res: Response) => {
  const success = db.deleteProduct(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Product not found' });
  }
  return res.json({ message: 'Product deleted' });
});

apiRouter.put('/admin/products/:id/stock', (req: Request, res: Response) => {
  const { stockQuantity } = req.body;
  const updated = db.updateStock(req.params.id, Number(stockQuantity));
  if (!updated) {
    return res.status(404).json({ error: 'Product not found' });
  }
  return res.json({ product: updated, message: 'Stock updated' });
});

// --- Suppliers & Purchase Orders ---
apiRouter.get('/suppliers', (_req: Request, res: Response) => {
  return res.json({ suppliers: db.getSuppliers() });
});

apiRouter.post('/suppliers', (req: Request, res: Response) => {
  const { name, contactPerson, phone, email, city, categoriesSupplied, rating } = req.body;
  const newSup = db.addSupplier({
    name,
    contactPerson,
    phone,
    email,
    city,
    categoriesSupplied: categoriesSupplied || ['General'],
    rating: Number(rating) || 4.5,
  });
  return res.status(201).json({ supplier: newSup });
});

apiRouter.get('/purchase-orders', (_req: Request, res: Response) => {
  return res.json({ purchaseOrders: db.getPurchaseOrders() });
});

apiRouter.post('/purchase-orders', (req: Request, res: Response) => {
  const { supplierId, items, notes } = req.body;
  try {
    const po = db.createPurchaseOrder({ supplierId, items, notes });
    return res.status(201).json({ purchaseOrder: po, message: 'Purchase Order generated' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/purchase-orders/:id/receive', (req: Request, res: Response) => {
  try {
    const po = db.receivePurchaseOrder(req.params.id);
    return res.json({ purchaseOrder: po, message: 'Inventory received and stock auto-updated!' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// --- Admin Analytics & Demand Forecasting ---
apiRouter.get('/analytics', (_req: Request, res: Response) => {
  const analytics = db.getAnalytics();
  return res.json(analytics);
});

apiRouter.get('/admin/delivery-partners', (_req: Request, res: Response) => {
  const partners = db.getAllDeliveryPartners();
  return res.json({ partners });
});

apiRouter.get('/admin/customers', (_req: Request, res: Response) => {
  const customers = db.getAllCustomers();
  return res.json({ customers });
});

// --- Demo Reset ---
apiRouter.post('/demo-reset', (_req: Request, res: Response) => {
  db.resetToDefault();
  return res.json({ message: 'Demo data successfully reset to pristine seed state' });
});
