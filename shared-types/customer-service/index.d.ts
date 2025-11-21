export interface CustomerCreateDTO {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
}
export interface CustomerUpdateDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}
export interface CustomerPublicDTO {
  customerId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
}
export interface CustomerSearchDTO {
  page?: number;
  limit?: number;
  search?: string;
}
export interface CustomerListDTO {
  customers: CustomerPublicDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export interface AddressCreateDTO {
  addressType: "shipping" | "billing";
  address: string;
  postalCode: string;
  city: string;
  countryName?: string;
  isDefault?: boolean;
}
export interface AddressUpdateDTO {
  addressType?: "shipping" | "billing";
  address?: string;
  postalCode?: string;
  city?: string;
  countryName?: string;
  isDefault?: boolean;
}
export interface AddressPublicDTO {
  addressId: number;
  customerId: number;
  addressType: string;
  address: string;
  postalCode: string;
  city: string;
  countryName: string;
  isDefault: boolean;
}
export interface AddressListResponse {
  message: string;
  addresses: AddressPublicDTO[];
}
export interface CountryDTO {
  countryName: string;
}
//# sourceMappingURL=index.d.ts.map
