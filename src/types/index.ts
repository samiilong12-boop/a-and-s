export type FragranceConcentration =
  | 'EXTRAIT_DE_PARFUM'
  | 'EAU_DE_PARFUM'
  | 'EAU_DE_TOILETTE'
  | 'EAU_DE_COLOGNE'
  | 'OIL_PERFUME';

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  volumeMl: number; // e.g. 30, 50, 100
  titleEn: string;
  regularPriceInPiasters: number; // e.g. 240000 = 2,400.00 EGP
  salePriceInPiasters?: number | null;
  costPriceInPiasters?: number; // confidential COGS
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  altTextEn: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface Product {
  id: string;
  slug: string;
  nameEn: string;
  headlineEn: string;
  descriptionEn: string;
  concentration: FragranceConcentration;
  fragranceFamily: string; // e.g. "Oriental Woody", "Floral Amber", "Fresh Citrus"
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  categoryId: string;
  categoryName: string;
  collectionIds: string[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestseller: boolean;
  isPublished: boolean;
  rating: number;
  reviewCount: number;
  images: ProductImage[];
  variants: ProductVariant[];
  createdAt: string;
}

export interface CartItem {
  variantId: string;
  productId: string;
  productName: string;
  variantTitle: string;
  volumeMl: number;
  sku: string;
  unitPriceInPiasters: number;
  image: string;
  quantity: number;
  maxStock: number;
}

export type OrderStatus =
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

export type PaymentStatus =
  | 'PENDING_COLLECTION'
  | 'COLLECTED_BY_COURIER'
  | 'REMITTED_TO_STORE'
  | 'FAILED_COLLECTION'
  | 'REFUNDED';

export type PaymentMethod =
  | 'CASH_ON_DELIVERY'
  | 'CREDIT_CARD'
  | 'DIGITAL_WALLET';

export interface OrderItem {
  id: string;
  orderId: string;
  variantId: string;
  productNameSnapshot: string;
  variantTitleSnapshot: string;
  skuSnapshot: string;
  unitPriceInPiasters: number;
  unitCostInPiasters: number;
  quantity: number;
  subtotalInPiasters: number;
  totalCostInPiasters: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  governorate: string;
  city: string;
  streetAddress: string;
  buildingDetails?: string | null;
  deliveryNotes?: string | null;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  currency: string;
  subtotalInPiasters: number;
  shippingInPiasters: number;
  discountInPiasters: number;
  taxInPiasters: number;
  totalInPiasters: number;
  totalCostInPiasters: number;
  courierName?: string | null;
  trackingNumber?: string | null;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface ShippingZone {
  governorateEn: string;
  governorateAr: string;
  rateInPiasters: number;
  minDays: number;
  maxDays: number;
}
