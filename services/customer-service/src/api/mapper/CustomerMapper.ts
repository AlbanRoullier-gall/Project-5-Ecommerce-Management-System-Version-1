/**
 * Customer Mapper
 * Mapper pour convertir entre DTOs et Models
 *
 * Architecture : Mapper pattern (simplified like auth-service)
 * - Conversion DTO ↔ Model
 * - Séparation claire des responsabilités
 */
import Customer, { CustomerData } from "../../models/Customer";
import CustomerAddress, {
  CustomerAddressData,
} from "../../models/CustomerAddress";
import { BELGIUM_COUNTRY_NAME } from "../../constants/CountryConstants";
import {
  CustomerCreateDTO,
  CustomerUpdateDTO,
  CustomerPublicDTO,
  CustomerListDTO,
  AddressCreateDTO,
  AddressUpdateDTO,
  AddressPublicDTO,
} from "../dto";

export class CustomerMapper {
  // ===== CUSTOMER MAPPING =====

  /**
   * Convertir un CustomerCreateDTO en données Customer
   */
  static customerCreateDTOToCustomerData(
    dto: CustomerCreateDTO
  ): Partial<CustomerData> {
    return {
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phoneNumber: dto.phoneNumber ?? null,
    };
  }

  /**
   * Convertir un CustomerUpdateDTO en données Customer
   */
  static customerUpdateDTOToCustomerData(
    dto: CustomerUpdateDTO
  ): Partial<CustomerData> {
    const updateData: Partial<CustomerData> = {};

    if (dto.firstName !== undefined) updateData.firstName = dto.firstName;
    if (dto.lastName !== undefined) updateData.lastName = dto.lastName;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.phoneNumber !== undefined)
      updateData.phoneNumber = dto.phoneNumber || null;

    return updateData;
  }

  /**
   * Convertir un Customer en CustomerPublicDTO
   */
  static customerToPublicDTO(customer: Customer): CustomerPublicDTO {
    return {
      customerId: customer.customerId,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
      fullName: customer.fullName(),
    };
  }

  /**
   * Convertir un tableau de Customer en tableau de CustomerPublicDTO
   */
  static customersToPublicDTOs(customers: Customer[]): CustomerPublicDTO[] {
    return customers.map((customer) => this.customerToPublicDTO(customer));
  }

  /**
   * Créer une réponse de liste de clients
   */
  static createCustomerListResponse(
    customers: Customer[],
    pagination: any
  ): CustomerListDTO {
    return {
      customers: this.customersToPublicDTOs(customers),
      total: pagination.total || 0,
      page: pagination.page || 1,
      limit: pagination.limit || 10,
      totalPages: Math.ceil((pagination.total || 0) / (pagination.limit || 10)),
    };
  }

  // ===== ADDRESS MAPPING =====

  /**
   * Convertir un AddressCreateDTO en données Address
   */
  static addressCreateDTOToAddressData(
    dto: AddressCreateDTO
  ): Partial<CustomerAddressData> {
    return {
      addressType: dto.addressType,
      address: dto.address,
      postalCode: dto.postalCode,
      city: dto.city,
      countryName: dto.countryName || BELGIUM_COUNTRY_NAME, // Le backend garantit toujours "Belgique"
      isDefault: dto.isDefault || false,
    };
  }

  /**
   * Convertir un AddressUpdateDTO en données Address
   */
  static addressUpdateDTOToAddressData(
    dto: AddressUpdateDTO
  ): Partial<CustomerAddressData> {
    const updateData: Partial<CustomerAddressData> = {};

    if (dto.addressType !== undefined) updateData.addressType = dto.addressType;
    if (dto.address !== undefined) updateData.address = dto.address;
    if (dto.postalCode !== undefined) updateData.postalCode = dto.postalCode;
    if (dto.city !== undefined) updateData.city = dto.city;
    // countryName n'est jamais mis à jour car toujours "Belgique"
    if (dto.isDefault !== undefined) updateData.isDefault = dto.isDefault;

    return updateData;
  }

  /**
   * Convertir un CustomerAddress en AddressPublicDTO
   */
  static addressToPublicDTO(address: CustomerAddress): AddressPublicDTO {
    return {
      addressId: address.addressId,
      customerId: address.customerId,
      addressType: address.addressType,
      address: address.address,
      postalCode: address.postalCode,
      city: address.city,
      countryName: address.countryName,
      isDefault: address.isDefault,
    };
  }

  /**
   * Convertir un tableau de CustomerAddress en tableau de AddressPublicDTO
   */
  static addressesToPublicDTOs(
    addresses: CustomerAddress[]
  ): AddressPublicDTO[] {
    return addresses.map((address) => this.addressToPublicDTO(address));
  }
}
