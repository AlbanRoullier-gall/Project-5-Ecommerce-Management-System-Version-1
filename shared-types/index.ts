// Types partagés entre les microservices et les frontends

// ===========================================
// CONTACT TYPES
// ===========================================

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  message: string;
  messageId?: string;
}

export interface ConfirmationEmailData {
  customerName: string;
  customerEmail: string;
  subject: string;
  message: string;
}

// ===========================================
// CUSTOMER TYPES
// ===========================================

export interface Customer {
  customerId: number;
  civilityId: number;
  firstName: string;
  lastName: string;
  email: string;
  socioProfessionalCategoryId: number;
  phoneNumber?: string;
  birthday?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  civility?: string;
  socioProfessionalCategory?: string;
}

export interface CustomerAddress {
  addressId: number;
  customerId: number;
  addressType: "shipping" | "billing";
  address: string;
  postalCode: string;
  city: string;
  countryId: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  countryName?: string;
}

export interface CustomerCompany {
  companyId: number;
  customerId: number;
  companyName: string;
  siretNumber?: string;
  vatNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Civility {
  civilityId: number;
  abbreviation: string;
  createdAt: string;
}

export interface Country {
  countryId: number;
  countryName: string;
  createdAt: string;
}

export interface SocioProfessionalCategory {
  categoryId: number;
  categoryName: string;
  createdAt: string;
}

// ===========================================
// PRODUCT TYPES
// ===========================================

export interface Category {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  fullName?: string; // Added from category service
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number | string; // Support both number and string formats
  vatRate: number | string; // Support both number and string formats
  categoryId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  categoryName?: string;
  priceWithVAT?: number; // Added from product service
  images?: ProductImage[];
}

export interface ProductImage {
  id: number;
  productId: number;
  filename: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  altText?: string;
  description?: string;
  isActive: boolean;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImageVariant {
  id: number;
  imageId: number;
  variantType: string;
  filePath: string;
  width?: number;
  height?: number;
  fileSize?: number;
  quality?: number;
  createdAt: string;
}

// ===========================================
// ORDER TYPES
// ===========================================

export interface Order {
  id: number;
  customerId: number;
  customerSnapshot: any;
  totalAmountHT: number;
  totalAmountTTC: number;
  paymentMethod: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  addresses?: OrderAddress[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPriceHT: number;
  unitPriceTTC: number;
  vatRate: number;
  totalPriceHT: number;
  totalPriceTTC: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreditNote {
  id: number;
  customerId: number;
  orderId: number;
  totalAmountHT: number;
  totalAmountTTC: number;
  reason: string;
  description?: string;
  issueDate: string;
  paymentMethod: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items?: CreditNoteItem[];
}

export interface CreditNoteItem {
  id: number;
  creditNoteId: number;
  productId: number;
  quantity: number;
  unitPriceHT: number;
  unitPriceTTC: number;
  vatRate: number;
  totalPriceHT: number;
  totalPriceTTC: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderAddress {
  id: number;
  orderId: number;
  type: "shipping" | "billing";
  addressSnapshot: any;
  createdAt: string;
  updatedAt: string;
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
  image?: string;
}

export interface Cart {
  items: CartItem[];
  totals: {
    totalHT: number;
    totalTTC: number;
    totalVAT: number;
  };
}

// ===========================================
// PAYMENT TYPES
// ===========================================

export interface PaymentIntent {
  id: number;
  stripePaymentIntentId: string;
  customerId: number;
  orderId: number;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: number;
  stripePaymentMethodId: string;
  customerId: number;
  type: string;
  cardLast4?: string;
  cardBrand?: string;
  cardExpMonth?: number;
  cardExpYear?: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Refund {
  id: number;
  stripeRefundId: string;
  paymentIntentId: number;
  amount: number;
  currency: string;
  reason?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// ===========================================
// WEBSITE CONTENT TYPES
// ===========================================

export interface WebsitePage {
  pageId: number;
  pageSlug: string;
  pageTitle: string;
  markdownContent: string;
  htmlContent: string;
  version: number;
  creationTimestamp: string;
  lastUpdateTimestamp: string;
}

export interface WebsitePageVersion {
  versionId: number;
  parentPageId: number;
  markdownContent: string;
  htmlContent: string;
  version: number;
  creationTimestamp: string;
}

// ===========================================
// API RESPONSE TYPES
// ===========================================

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ===========================================
// AUTH TYPES
// ===========================================

export interface User {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "customer";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthToken {
  userId: number;
  email: string;
  role: "admin" | "customer";
  iat: number;
  exp: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: "admin" | "customer";
}

export interface AdminRegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "admin";
}

export interface CustomerRegisterRequest {
  civilityId: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  socioProfessionalCategoryId: number;
  phoneNumber?: string;
  birthday?: string;
}

export interface CreateCustomerRequest {
  civilityId: number;
  firstName: string;
  lastName: string;
  email: string;
  socioProfessionalCategoryId: number;
  phoneNumber?: string;
  birthday?: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  vatRate: number;
  categoryId: number;
  isActive?: boolean;
}

export interface CreateProductWithImagesRequest {
  name: string;
  description?: string;
  price: number;
  vatRate: number;
  categoryId: number;
  isActive?: boolean;
  images?: File[];
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  vatRate?: number;
  categoryId?: number;
  isActive?: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  message: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
  message: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// ===========================================
// IMAGE UPLOAD TYPES
// ===========================================

export interface ImageUploadResponse {
  id: number;
  filename: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  altText?: string;
  description?: string;
  orderIndex: number;
  createdAt: string;
}

export interface CreateProductWithImagesResponse {
  message: string;
  product: Product;
  images: ImageUploadResponse[];
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
}

// ===========================================
// EVENT TYPES
// ===========================================

export interface DomainEvent {
  eventId: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  eventData: any;
  metadata: {
    correlationId: string;
    causationId?: string;
    timestamp: string;
    version: number;
  };
}

export interface OrderConfirmedEvent {
  orderId: number;
  customerId: number;
  totalAmount: number;
  items: OrderItem[];
  timestamp: string;
}

export interface PaymentProcessedEvent {
  paymentIntentId: string;
  orderId: number;
  customerId: number;
  amount: number;
  status: string;
  timestamp: string;
}

export interface EmailSentEvent {
  emailId: number;
  customerId: number;
  type: string;
  status: string;
  timestamp: string;
}
