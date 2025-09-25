import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user: {
    customerId: number;
    email: string;
    role: string;
  };
}

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
