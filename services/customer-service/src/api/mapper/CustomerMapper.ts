/**
 * Customer Mapper
 * Mapper pour convertir entre DTOs et Models
 *
 * Architecture : Mapper pattern (simplified like auth-service)
 * - Conversion DTO ↔ Model
 * - Séparation claire des responsabilités
 */
import Customer, { CustomerData } from "../../models/Customer";
import CustomerAddress, { CustomerAddressData } from "../../models/CustomerAddress";
import CustomerCompany, { CustomerCompanyData } from "../../models/CustomerCompany";
import {
  CustomerCreateDTO,
  CustomerUpdateDTO,
  CustomerPublicDTO,
  AddressCreateDTO,
  AddressUpdateDTO,
  AddressPublicDTO,
  CompanyCreateDTO,
  CompanyUpdateDTO,
  CompanyPublicDTO,
} from "../dto";

export class CustomerMapper {
  // ===== CUSTOMER MAPPING =====

  /**
   * Convertir un CustomerCreateDTO en données Customer
   */
  static customerCreateDTOToCustomerData(dto: CustomerCreateDTO): Partial<CustomerData> {
    return {
      civilityId: dto.civilityId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      socioProfessionalCategoryId: dto.socioProfessionalCategoryId,
      phoneNumber: dto.phoneNumber || null,
      birthday: dto.birthday ? new Date(dto.birthday) : null,
    };
  }

  /**
   * Convertir un CustomerUpdateDTO en données Customer
   */
  static customerUpdateDTOToCustomerData(dto: CustomerUpdateDTO): Partial<CustomerData> {
    const updateData: Partial<CustomerData> = {};

    if (dto.firstName !== undefined) updateData.firstName = dto.firstName;
    if (dto.lastName !== undefined) updateData.lastName = dto.lastName;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.socioProfessionalCategoryId !== undefined)
      updateData.socioProfessionalCategoryId = dto.socioProfessionalCategoryId;
    if (dto.phoneNumber !== undefined) updateData.phoneNumber = dto.phoneNumber || null;
    if (dto.birthday !== undefined)
      updateData.birthday = dto.birthday ? new Date(dto.birthday) : null;

    return updateData;
  }

  /**
   * Convertir un Customer en CustomerPublicDTO
   */
  static customerToPublicDTO(customer: Customer): CustomerPublicDTO {
    return {
      customerId: customer.customerId,
      civilityId: customer.civilityId,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      socioProfessionalCategoryId: customer.socioProfessionalCategoryId,
      phoneNumber: customer.phoneNumber,
      birthday: customer.birthday,
      isActive: customer.isActive,
      fullName: customer.fullName(),
    };
  }

  /**
   * Convertir un tableau de Customer en tableau de CustomerPublicDTO
   */
  static customersToPublicDTOs(customers: Customer[]): CustomerPublicDTO[] {
    return customers.map((customer) => this.customerToPublicDTO(customer));
  }

  // ===== ADDRESS MAPPING =====

  /**
   * Convertir un AddressCreateDTO en données Address
   */
  static addressCreateDTOToAddressData(dto: AddressCreateDTO): Partial<CustomerAddressData> {
    return {
      addressType: dto.addressType,
      address: dto.address,
      postalCode: dto.postalCode,
      city: dto.city,
      countryId: dto.countryId,
      isDefault: dto.isDefault || false,
    };
  }

  /**
   * Convertir un AddressUpdateDTO en données Address
   */
  static addressUpdateDTOToAddressData(dto: AddressUpdateDTO): Partial<CustomerAddressData> {
    const updateData: Partial<CustomerAddressData> = {};

    if (dto.addressType !== undefined) updateData.addressType = dto.addressType;
    if (dto.address !== undefined) updateData.address = dto.address;
    if (dto.postalCode !== undefined) updateData.postalCode = dto.postalCode;
    if (dto.city !== undefined) updateData.city = dto.city;
    if (dto.countryId !== undefined) updateData.countryId = dto.countryId;
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
      countryId: address.countryId,
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

  // ===== COMPANY MAPPING =====

  /**
   * Convertir un CompanyCreateDTO en données Company
   */
  static companyCreateDTOToCompanyData(dto: CompanyCreateDTO): Partial<CustomerCompanyData> {
    return {
      companyName: dto.companyName,
      siretNumber: dto.siretNumber || "",
      vatNumber: dto.vatNumber || "",
    };
  }

  /**
   * Convertir un CompanyUpdateDTO en données Company
   */
  static companyUpdateDTOToCompanyData(dto: CompanyUpdateDTO): Partial<CustomerCompanyData> {
    const updateData: Partial<CustomerCompanyData> = {};

    if (dto.companyName !== undefined) updateData.companyName = dto.companyName;
    if (dto.siretNumber !== undefined) updateData.siretNumber = dto.siretNumber || "";
    if (dto.vatNumber !== undefined) updateData.vatNumber = dto.vatNumber || "";

    return updateData;
  }

  /**
   * Convertir un CustomerCompany en CompanyPublicDTO
   */
  static companyToPublicDTO(company: CustomerCompany): CompanyPublicDTO {
    return {
      companyId: company.companyId,
      customerId: company.customerId,
      companyName: company.companyName,
      siretNumber: company.siretNumber,
      vatNumber: company.vatNumber,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };
  }

  /**
   * Convertir un tableau de CustomerCompany en tableau de CompanyPublicDTO
   */
  static companiesToPublicDTOs(
    companies: CustomerCompany[]
  ): CompanyPublicDTO[] {
    return companies.map((company) => this.companyToPublicDTO(company));
  }
}
