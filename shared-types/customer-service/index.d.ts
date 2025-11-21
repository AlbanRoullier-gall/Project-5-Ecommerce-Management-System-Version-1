export interface CustomerCreateDTO {
  civilityId: number;
  firstName: string;
  lastName: string;
  email: string;
  socioProfessionalCategoryId: number;
  phoneNumber?: string;
  birthday?: string;
}
export interface CustomerUpdateDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  socioProfessionalCategoryId?: number;
  phoneNumber?: string;
  birthday?: string;
}
export interface CustomerPublicDTO {
  customerId: number;
  civilityId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  socioProfessionalCategoryId: number;
  phoneNumber: string | null;
  birthday: Date | null;
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
export interface CompanyCreateDTO {
  companyName: string;
  siretNumber?: string;
  vatNumber?: string;
}
export interface CompanyUpdateDTO {
  companyName?: string;
  siretNumber?: string;
  vatNumber?: string;
}
export interface CompanyPublicDTO {
  companyId: number | null;
  customerId: number | null;
  companyName: string;
  siretNumber: string;
  vatNumber: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}
export interface CompanyListResponse {
  message: string;
  companies: CompanyPublicDTO[];
}
export interface CivilityDTO {
  civilityId: number;
  label: string;
}
export interface CountryDTO {
  countryName: string;
}
export interface SocioProfessionalCategoryDTO {
  categoryId: number;
  label: string;
}
//# sourceMappingURL=index.d.ts.map
