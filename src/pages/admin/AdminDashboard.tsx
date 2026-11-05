import React, { useState, useEffect } from 'react';
import {
  Package,
  AlertTriangle,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Truck,
  Users,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Search,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  FileText,
  BarChart3,
  X,
} from 'lucide-react';
import { Product, Order, Supplier, PurchaseOrder, User } from '../../types/index.js';
import { api } from '../../services/api.js';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'inventory' | 'lowstock' | 'purchase' | 'orders' | 'customers' | 'analytics'
  >('overview');

  const [products, setProducts] = useState<Product[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [deliveryPartners, setDeliveryPartners] = useState<User[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatePoOpen, setIsCreatePoOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [poItems, setPoItems] = useState<{ productId: string; quantity: number; unitCost: number }[]>([]);

  // Search in inventory
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategory, setInventoryCategory] = useState('All');

  // New product form
  const [newProdName, setNewProdName] = useState('');
  const [newProdBrand, setNewProdBrand] = useState('QuickBasket Fresh');
  const [newProdCategory, setNewProdCategory] = useState('Vegetables');
  const [newProdPrice, setNewProdPrice] = useState(40);
  const [newProdMrp, setNewProdMrp] = useState(50);
  const [newProdStock, setNewProdStock] = useState(50);
  const [newProdUnit, setNewProdUnit] = useState('500 g');
  const [newProdMinStock, setNewProdMinStock] = useState(15);
  const [newProdDesc, setNewProdDesc] = useState('Fresh handpicked organic quality');

  const loadAllAdminData = async () => {
    try {
      setLoading(true);
      const [invRes, ordRes, supRes, poRes, ridersRes, custRes, anaRes] = await Promise.all([
        api.getAdminInventory(),
        api.getOrders(),
        api.getSuppliers(),
        api.getPurchaseOrders(),
        api.getDeliveryPartners(),
        api.getCustomers(),
        api.getAnalytics(),
      ]);

      setProducts(invRes.products);
      setLowStockProducts(invRes.lowStock);
      setOrders(ordRes.orders);
      setSuppliers(supRes.suppliers);
      setPurchaseOrders(poRes.purchaseOrders);
      setDeliveryPartners(ridersRes.partners);
      setCustomers(custRes.customers);
      setAnalytics(anaRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  // CRUD Handlers
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.updateAdminProduct(editingProduct.id, {
          name: newProdName,
          brand: newProdBrand,
          category: newProdCategory,
          sellingPrice: Number(newProdPrice),
          mrp: Number(newProdMrp),
          stockQuantity: Number(newProdStock),
          unit: newProdUnit,
          minStockThreshold: Number(newProdMinStock),
          description: newProdDesc,
        });
        setEditingProduct(null);
      } else {
        await api.addAdminProduct({
          name: newProdName,
          brand: newProdBrand,
          category: newProdCategory,
          sellingPrice: Number(newProdPrice),
          mrp: Number(newProdMrp),
          stockQuantity: Number(newProdStock),
          unit: newProdUnit,
          minStockThreshold: Number(newProdMinStock),
          description: newProdDesc,
        });
        setIsAddProductOpen(false);
      }
      await loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product from catalog?')) return;
    try {
      await api.deleteAdminProduct(id);
      await loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  const handleQuickStockUpdate = async (id: string, currentStock: number, delta: number) => {
    const updated = Math.max(0, currentStock + delta);
    await api.updateProductStock(id, updated);
    await loadAllAdminData();
  };

  const handleReceivePo = async (poId: string) => {
    try {
      await api.receivePurchaseOrder(poId);
      await loadAllAdminData();
      alert('Purchase Order received! Warehouse inventory automatically updated.');
    } catch (err: any) {
      alert(err.message || 'Receive failed');
    }
  };

  const handleAssignPartner = async (orderId: string, partnerId: string) => {
    try {
      await api.assignOrderPartner(orderId, partnerId);
      await loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Assignment failed');
    }
  };

  const handleCreatePo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId || poItems.length === 0) {
      alert('Please select supplier and at least one item');
      return;
    }
    try {
      await api.createPurchaseOrder({
        supplierId: selectedSupplierId,
        items: poItems,
        notes: 'Restock order generated from admin dashboard',
      });
      setIsCreatePoOpen(false);
      setPoItems([]);
      await loadAllAdminData();
      alert('Purchase Order generated successfully!');
    } catch (err: any) {
      alert(err.message || 'PO creation failed');
    }
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setNewProdName(p.name);
    setNewProdBrand(p.brand);
    setNewProdCategory(p.category);
    setNewProdPrice(p.sellingPrice);
    setNewProdMrp(p.mrp);
    setNewProdStock(p.stockQuantity);
    setNewProdUnit(p.unit);
    setNewProdMinStock(p.minStockThreshold);
    setNewProdDesc(p.description);
  };

  const filteredInventory = products.filter((p) => {
    const matchesCat = inventoryCategory === 'All' || p.category === inventoryCategory;
    const matchesQ =
      p.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(inventorySearch.toLowerCase());
    return matchesCat && matchesQ;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              Warehouse Admin Console
            </span>
            <span>·</span>
            <span className="text-xs text-slate-500">RBAC Role: ADMIN</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white mt-0.5">
            QuickBasket Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage 300+ items, suppliers, purchase orders, deliveries, and predictive restocking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingProduct(null);
              setNewProdName('');
              setNewProdBrand('QuickBasket Fresh');
              setNewProdCategory('Vegetables');
              setNewProdPrice(40);
              setNewProdMrp(50);
              setNewProdStock(50);
              setNewProdUnit('500 g');
              setNewProdMinStock(15);
              setNewProdDesc('Garden fresh harvest');
              setIsAddProductOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
          <button
            onClick={loadAllAdminData}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
            title="Reload data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-semibold">
        {[
          { id: 'overview', label: 'Executive Overview' },
          { id: 'inventory', label: `Inventory (${products.length})` },
          { id: 'lowstock', label: `Low Stock Alerts (${lowStockProducts.length})` },
          { id: 'purchase', label: `Suppliers & POs (${purchaseOrders.length})` },
          { id: 'orders', label: `Order Dispatch (${orders.length})` },
          { id: 'customers', label: `Customers (${customers.length})` },
          { id: 'analytics', label: 'Demand Forecasting' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-2 rounded-xl whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Total Gross Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold font-display text-slate-900 dark:text-white mt-1 tabular-nums">
                ₹{analytics?.totalRevenue || 0}
              </div>
              <div className="text-[11px] text-emerald-600 font-medium mt-1">
                From {analytics?.totalOrders || 0} customer orders
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Total Active SKU Catalog</span>
                <Package className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold font-display text-slate-900 dark:text-white mt-1 tabular-nums">
                {products.length} Products
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Across 17 categories</div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Low Stock Threshold Alert</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold font-display text-amber-600 mt-1 tabular-nums">
                {lowStockProducts.length} Items
              </div>
              <div className="text-[11px] text-amber-600 font-medium mt-1">
                Need immediate replenishment
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Active Delivery Partners</span>
                <Truck className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold font-display text-slate-900 dark:text-white mt-1 tabular-nums">
                {deliveryPartners.length} Active Riders
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Avg 9.8 mins turn-around</div>
            </div>
          </div>

          {/* Quick Action Low-Stock Banner */}
          {lowStockProducts.length > 0 && (
            <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>{lowStockProducts.length} Products are below minimum stock threshold!</span>
                </h3>
                <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-1">
                  Products like{' '}
                  <strong>{lowStockProducts.slice(0, 3).map((p) => p.name).join(', ')}</strong>{' '}
                  are nearly depleted.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('lowstock')}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shrink-0"
              >
                Review & Restock POs →
              </button>
            </div>
          )}

          {/* Category Sales Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Sales by Category (₹)
              </h3>
              <div className="space-y-2">
                {analytics?.categorySales &&
                  Object.entries(analytics.categorySales).map(([cat, amount]: any) => (
                    <div key={cat} className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400">{cat}</span>
                      <span className="font-bold tabular-nums text-slate-900 dark:text-white">
                        ₹{amount}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Recent Customer Orders
              </h3>
              <div className="space-y-2 divide-y divide-slate-100 dark:divide-slate-700">
                {orders.slice(0, 5).map((o) => (
                  <div key={o.id} className="pt-2 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        #{o.id}
                      </span>
                      <span className="text-slate-500 ml-2">{o.customerName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                        {o.orderStatus}
                      </span>
                      <span className="font-bold tabular-nums">₹{o.totalAmount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INVENTORY MANAGEMENT */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                placeholder="Search inventory by name, brand, or SKU..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 shrink-0">Category:</span>
              <select
                value={inventoryCategory}
                onChange={(e) => setInventoryCategory(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="All">All Categories</option>
                {[
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
                ].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Product & SKU</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Selling Price</th>
                    <th className="p-3.5">Stock Available</th>
                    <th className="p-3.5">Min Threshold</th>
                    <th className="p-3.5">Quick Stock Adjust</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-700 dark:text-slate-300">
                  {filteredInventory.slice(0, 50).map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900 dark:text-white truncate max-w-xs">
                          {prod.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {prod.sku} · {prod.unit}
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-400">
                        {prod.category}
                      </td>
                      <td className="p-3.5 font-bold tabular-nums text-slate-900 dark:text-white">
                        ₹{prod.sellingPrice}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`font-bold tabular-nums px-2 py-0.5 rounded text-[11px] ${
                            prod.stockQuantity === 0
                              ? 'bg-rose-100 text-rose-700'
                              : prod.stockQuantity <= prod.minStockThreshold
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {prod.stockQuantity} {prod.unit}
                        </span>
                      </td>
                      <td className="p-3.5 tabular-nums text-slate-500">
                        {prod.minStockThreshold}
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleQuickStockUpdate(prod.id, prod.stockQuantity, -5)}
                            className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                            title="Decrease 5"
                          >
                            -5
                          </button>
                          <button
                            onClick={() => handleQuickStockUpdate(prod.id, prod.stockQuantity, 10)}
                            className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-semibold hover:bg-emerald-100"
                            title="Add 10"
                          >
                            +10
                          </button>
                          <button
                            onClick={() => handleQuickStockUpdate(prod.id, prod.stockQuantity, 50)}
                            className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-semibold hover:bg-blue-100"
                            title="Add 50"
                          >
                            +50
                          </button>
                        </div>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(prod)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 text-center">
              Showing top {Math.min(50, filteredInventory.length)} of {filteredInventory.length} products
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LOW STOCK MANAGEMENT */}
      {activeTab === 'lowstock' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
            <strong>Automated Restock System:</strong> The table below lists all items where available quantity is at or below the safety threshold.
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Product Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Current Stock</th>
                  <th className="p-3.5">Min Required</th>
                  <th className="p-3.5">Suggested Reorder</th>
                  <th className="p-3.5 text-right">Quick Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-700 dark:text-slate-300">
                {lowStockProducts.map((p) => {
                  const suggested = Math.max(30, p.minStockThreshold * 3);
                  return (
                    <tr key={p.id}>
                      <td className="p-3.5 font-semibold text-slate-900 dark:text-white">
                        {p.name}
                      </td>
                      <td className="p-3.5 text-slate-500">{p.category}</td>
                      <td className="p-3.5 font-bold text-amber-600 tabular-nums">
                        {p.stockQuantity} {p.unit}
                      </td>
                      <td className="p-3.5 tabular-nums text-slate-500">{p.minStockThreshold}</td>
                      <td className="p-3.5 font-bold text-emerald-600 tabular-nums">
                        +{suggested} {p.unit}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleQuickStockUpdate(p.id, p.stockQuantity, suggested)}
                          className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px]"
                        >
                          Replenish +{suggested}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PURCHASE ORDERS & SUPPLIERS */}
      {activeTab === 'purchase' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Purchase Orders Pipeline
            </h2>
            <button
              onClick={() => {
                if (suppliers.length > 0) setSelectedSupplierId(suppliers[0].id);
                setPoItems([
                  { productId: products[0]?.id || 'prod_fruit_1', quantity: 50, unitCost: 35 },
                ]);
                setIsCreatePoOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Purchase Order</span>
            </button>
          </div>

          {/* PO List */}
          <div className="space-y-3">
            {purchaseOrders.map((po) => (
              <div
                key={po.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-xs text-slate-900 dark:text-white">
                      {po.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        po.status === 'Received'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {po.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                    Supplier: {po.supplierName}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {po.items.map((i) => `${i.productName} (${i.quantity} units @ ₹${i.unitCost})`).join(', ')}
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end md:self-center">
                  <div className="text-right">
                    <div className="text-[11px] text-slate-400">Total Purchase Cost</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                      ₹{po.totalCost}
                    </div>
                  </div>

                  {po.status !== 'Received' ? (
                    <button
                      onClick={() => handleReceivePo(po.id)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      Record Received Inventory
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Received
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Supplier Directory */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Verified Wholesale Suppliers
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {suppliers.map((s) => (
                <div
                  key={s.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5"
                >
                  <div className="font-bold text-slate-900 dark:text-white">{s.name}</div>
                  <div className="text-slate-500">Contact: {s.contactPerson} · {s.phone}</div>
                  <div className="text-slate-500">City: {s.city}</div>
                  <div className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
                    Categories: {s.categoriesSupplied.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ORDER DISPATCH & PARTNER ASSIGNMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Customer Orders & Hyperlocal Dispatch
            </h2>
            <span className="text-xs text-slate-500">{orders.length} total orders recorded</span>
          </div>

          <div className="space-y-3">
            {orders.map((o) => (
              <div
                key={o.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      #{o.id}
                    </span>
                    <span className="font-semibold">{o.customerName}</span>
                    <span>·</span>
                    <span className="text-slate-500">{o.customerPhone}</span>
                  </div>
                  <div className="text-slate-500">
                    Drop: {o.deliveryAddress.street}, {o.deliveryAddress.area}
                  </div>
                  <div className="text-slate-500">
                    Total: <strong className="text-slate-900 dark:text-white">₹{o.totalAmount}</strong> ({o.paymentMethod}) · OTP: <strong>{o.deliveryOtp}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {o.orderStatus}
                    </span>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Rider: {o.deliveryPartnerName || 'Unassigned'}
                    </div>
                  </div>

                  {/* Assign Delivery Partner Dropdown */}
                  <select
                    value={o.deliveryPartnerId || ''}
                    onChange={(e) => handleAssignPartner(o.id, e.target.value)}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
                  >
                    <option value="">Assign Rider...</option>
                    {deliveryPartners.map((dp) => (
                      <option key={dp.id} value={dp.id}>
                        {dp.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: CUSTOMERS DIRECTORY */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Registered Customers ({customers.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {customers.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-xs space-y-2"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={c.avatarUrl}
                    alt={c.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">{c.name}</div>
                    <div className="text-slate-500">{c.phone}</div>
                  </div>
                </div>
                <div className="text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-700">
                  Email: {c.email}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: DEMAND FORECASTING ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="p-5 rounded-3xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200 leading-relaxed">
            <strong>Predictive Demand Engine:</strong> Based on historical checkout velocities and customer shopping frequency, the system calculates estimated daily consumption rates and days of supply remaining before stockouts occur.
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Item Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Current Stock</th>
                  <th className="p-3.5">Est. Daily Burn</th>
                  <th className="p-3.5">Days of Supply</th>
                  <th className="p-3.5">Urgency</th>
                  <th className="p-3.5 text-right">Suggested Reorder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-700 dark:text-slate-300">
                {analytics?.demandForecast?.map((item: any) => (
                  <tr key={item.productId}>
                    <td className="p-3.5 font-semibold text-slate-900 dark:text-white">
                      {item.name}
                    </td>
                    <td className="p-3.5 text-slate-500">{item.category}</td>
                    <td className="p-3.5 tabular-nums font-bold">{item.currentStock}</td>
                    <td className="p-3.5 tabular-nums text-slate-600 dark:text-slate-400">
                      ~{item.estimatedDailySales} units/day
                    </td>
                    <td className="p-3.5 font-bold tabular-nums">
                      {item.daysOfSupply} days
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          item.priority === 'Critical'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.priority}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-bold text-emerald-600 tabular-nums">
                      +{item.suggestedReorder} units
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {(isAddProductOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingProduct ? 'Edit Catalog Product' : 'Add New Grocery Product'}
              </h3>
              <button
                onClick={() => {
                  setIsAddProductOpen(false);
                  setEditingProduct(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="e.g. Organic Alphonso Mangoes"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    value={newProdBrand}
                    onChange={(e) => setNewProdBrand(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Category</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  >
                    {[
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
                    ].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    required
                    value={newProdMrp}
                    onChange={(e) => setNewProdMrp(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Stock Qty</label>
                  <input
                    type="number"
                    required
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Unit (e.g. 1 kg, 500 ml)</label>
                  <input
                    type="text"
                    required
                    value={newProdUnit}
                    onChange={(e) => setNewProdUnit(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Min Threshold</label>
                  <input
                    type="number"
                    required
                    value={newProdMinStock}
                    onChange={(e) => setNewProdMinStock(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Product Description</label>
                <textarea
                  rows={2}
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddProductOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 shadow-sm"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Purchase Order Modal */}
      {isCreatePoOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Generate Purchase Order
              </h3>
              <button onClick={() => setIsCreatePoOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePo} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Select Wholesale Supplier</label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Items in PO */}
              <div className="space-y-2">
                <label className="font-semibold block">Order Items</label>
                {poItems.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <select
                      value={item.productId}
                      onChange={(e) => {
                        const copy = [...poItems];
                        copy[idx].productId = e.target.value;
                        setPoItems(copy);
                      }}
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5"
                    >
                      {products.slice(0, 40).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => {
                        const copy = [...poItems];
                        copy[idx].quantity = Number(e.target.value);
                        setPoItems(copy);
                      }}
                      className="w-20 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5"
                    />

                    <input
                      type="number"
                      placeholder="Unit Cost ₹"
                      value={item.unitCost}
                      onChange={(e) => {
                        const copy = [...poItems];
                        copy[idx].unitCost = Number(e.target.value);
                        setPoItems(copy);
                      }}
                      className="w-24 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatePoOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700"
                >
                  Issue Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
