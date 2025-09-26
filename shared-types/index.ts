// Types partagés entre les microservices et les frontends
// Seuls les types réellement utilisés par les services sont conservés

// ===========================================
// AUTHENTICATION TYPES
// ===========================================

export interface JWTPayload {
  userId: number;
  email: string;
  role: "admin" | "customer";
  firstName: string;
  lastName: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName: string;
  lastName: string;
  role?: "admin" | "customer";
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: "admin" | "customer";
  isActive?: boolean;
}

// ===========================================
// CUSTOMER TYPES
// ===========================================

export interface CustomerData {
  civilityId: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  socioProfessionalCategoryId: number;
  phoneNumber?: string;
  birthday?: Date;
}

export interface CustomerUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  birthday?: Date;
}

export interface AddressData {
  addressType: "shipping" | "billing";
  address: string;
  postalCode: string;
  city: string;
  countryId: number;
  isDefault?: boolean;
}

export interface CustomerListOptions {
  page: number;
  limit: number;
  search: string;
  activeOnly: boolean;
}

export interface CustomerListResult {
  customers: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ===========================================
// PRODUCT TYPES
// ===========================================

export interface ProductData {
  id?: number;
  name: string;
  description?: string;
  price: number;
  vatRate: number;
  categoryId: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductUpdateData {
  name?: string;
  description?: string;
  price?: number;
  vatRate?: number;
  categoryId?: number;
  isActive?: boolean;
}

export interface CategoryData {
  id?: number;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CategoryUpdateData {
  name?: string;
  description?: string;
}

export interface ProductImageData {
  id?: number;
  productId: number;
  filename: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  width: number;
  height: number;
  altText?: string;
  description?: string;
  isActive?: boolean;
  orderIndex?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductImageUpdateData {
  altText?: string;
  description?: string;
  isActive?: boolean;
  orderIndex?: number;
}

export interface ProductListOptions {
  page?: number;
  limit?: number;
  categoryId?: number;
  search?: string;
  activeOnly?: boolean;
}

export interface ProductListResult {
  products: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ImageUploadOptions {
  altText?: string;
  description?: string;
  orderIndex?: number;
}

// ===========================================
// ORDER TYPES
// ===========================================

export interface OrderData {
  id?: number;
  customerId: number;
  customerSnapshot: any;
  totalAmountHT: number;
  totalAmountTTC: number;
  paymentMethod: string;
  notes?: string;
  items?: OrderItemData[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderItemData {
  id?: number;
  orderId?: number;
  productId: number;
  quantity: number;
  unitPriceHT: number;
  unitPriceTTC: number;
  vatRate: number;
  totalPriceHT: number;
  totalPriceTTC: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderUpdateData {
  customerId?: number;
  customerSnapshot?: any;
  totalAmountHT?: number;
  totalAmountTTC?: number;
  paymentMethod?: string;
  notes?: string;
  items?: OrderItemData[];
}

export interface CreditNoteData {
  id?: number;
  customerId: number;
  orderId: number;
  totalAmountHT: number;
  totalAmountTTC: number;
  reason: string;
  description?: string;
  issueDate: Date;
  paymentMethod: string;
  notes?: string;
  items?: CreditNoteItemData[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreditNoteItemData {
  id?: number;
  creditNoteId?: number;
  productId: number;
  quantity: number;
  unitPriceHT: number;
  unitPriceTTC: number;
  vatRate: number;
  totalPriceHT: number;
  totalPriceTTC: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderAddressData {
  id?: number;
  orderId: number;
  type: "shipping" | "billing";
  addressSnapshot: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderListOptions {
  page?: number;
  limit?: number;
  customerId?: number;
  status?: string;
  sort?: string;
  startDate?: string;
  endDate?: string;
}

export interface OrderListResult {
  orders: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface OrderStatistics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: { [key: string]: number };
  revenueByPeriod: { [key: string]: number };
}

// ===========================================
// PAYMENT TYPES
// ===========================================

export interface PaymentIntentData {
  orderId: number;
  amount: number;
  currency: string;
  paymentMethod: string;
}

export interface ConfirmPaymentData {
  paymentIntentId: string;
  paymentMethodId?: string;
}

export interface PaymentIntentResponse {
  id: number;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret: string;
  createdAt: Date;
}

export interface PaymentStatusResponse {
  id: number;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentListResponse {
  payments: PaymentStatusResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ===========================================
// CART TYPES
// ===========================================

export interface CartItem {
  productId: number;
  name: string;
  unitPriceHT: number;
  vatRate: number;
  quantity: number;
  image?: string | null;
}

export interface CartTotals {
  totalHT: number;
  totalTTC: number;
  totalVAT: number;
}

export interface Cart {
  items: CartItem[];
  totals: CartTotals;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  vat_rate: number;
  is_active: boolean;
  images?: Array<{
    file_path: string;
  }>;
}

export interface CartItemRequest {
  productId: number;
  quantity: number;
}

export interface OrderItem {
  productId: number;
  quantity: number;
  unitPriceHT: number;
  vatRate: number;
}

export interface CartOrderData {
  customerId: number;
  items: OrderItem[];
  totals: CartTotals;
}

// ===========================================
// EMAIL TYPES
// ===========================================

export interface ContactEmailRequest {
  email: string;
  name?: string;
  subject?: string;
  message?: string;
}

export interface ContactEmailResponse {
  message: string;
  messageId: string;
}

export interface EmailTemplate {
  html: string;
  text: string;
}

export interface MailOptions {
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
}

// ===========================================
// WEBSITE CONTENT TYPES
// ===========================================

export interface WebsitePageData {
  id?: number;
  pageSlug: string;
  pageTitle: string;
  markdownContent: string;
  htmlContent?: string;
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
}

export interface WebsitePageUpdateData {
  pageSlug?: string;
  pageTitle?: string;
  markdownContent?: string;
}

export interface WebsitePageVersionData {
  id?: number;
  pageId: number;
  versionNumber: number;
  markdownContent: string;
  htmlContent?: string;
  createdAt?: Date | undefined;
}

export interface PageListOptions {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PageListResult {
  pages: WebsitePageData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
