export type UserRole = 'customer' | 'delivery' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface CustomerProfile {
  userId: string;
  addresses: Address[];
  defaultAddressId?: string;
}

export interface DeliveryPartnerProfile {
  userId: string;
  vehicleType: 'Bike' | 'Scooter' | 'EV';
  vehicleNumber: string;
  rating: number;
  totalDeliveries: number;
  isAvailable: boolean;
  currentLat: number;
  currentLng: number;
}

export interface Address {
  id: string;
  tag: 'Home' | 'Work' | 'Other';
  street: string;
  area: string;
  city: string;
  pincode: string;
  lat: number;
  lng: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  description: string;
  imageUrl: string;
  mrp: number;
  sellingPrice: number;
  discountPercent: number;
  stockQuantity: number;
  unit: string;
  sku: string;
  rating: number;
  reviewCount: number;
  minStockThreshold: number;
  isPopular?: boolean;
  isFlashDeal?: boolean;
  supplierId?: string;
  costPrice?: number; // Internal warehouse only
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  productCount: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
  product?: Product;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  couponCode?: string;
  discountAmount: number;
}

export type OrderStatus =
  | 'Order Placed'
  | 'Order Confirmed'
  | 'Preparing Order'
  | 'Ready for Pickup'
  | 'Delivery Partner Assigned'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  price: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: Address;
  items: OrderItem[];
  itemTotal: number;
  deliveryFee: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: 'Cash on Delivery' | 'UPI' | 'Card / NetBanking';
  paymentStatus: 'Paid' | 'Pending' | 'Failed';
  orderStatus: OrderStatus;
  statusHistory: { status: OrderStatus; timestamp: string; note?: string }[];
  deliveryPartnerId?: string;
  deliveryPartnerName?: string;
  deliveryPartnerPhone?: string;
  deliveryOtp: string;
  estimatedDeliveryMinutes: number;
  createdAt: string;
  deliveredAt?: string;
}

export interface RecipeIngredient {
  ingredientName: string;
  quantityRequired: string;
  matchedProductId?: string;
  fallbackKeywords?: string[];
}

export interface Recipe {
  id: string;
  title: string;
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks' | 'Desserts';
  imageUrl: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  difficulty: 'Easy' | 'Medium' | 'Chef Level';
  servings: number;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  description: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  categoriesSupplied: string[];
  rating: number;
}

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  totalCost: number;
  status: 'Draft' | 'Sent' | 'Received' | 'Cancelled';
  createdAt: string;
  receivedAt?: string;
  notes?: string;
}
