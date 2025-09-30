/**
 * Address Controller
 * Handles customer address management operations
 *
 * Architecture : Controller pattern
 * - HTTP request handling
 * - Business logic orchestration
 * - Response formatting
 */

import { Request, Response } from "express";
import CustomerService from "../../services/CustomerService";
import { AddressCreateDTO, AddressUpdateDTO } from "../dto";
import { CustomerMapper, ResponseMapper } from "../mapper";

export class AddressController {
  constructor(private customerService: CustomerService) {}

  /**
   * Get customer addresses
   */
  async getCustomerAddresses(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;
      
      if (!customerId) {
        res.status(400).json({ error: "Customer ID is required" });
        return;
      }
      
      const addresses = await this.customerService.listCustomerAddresses(
        parseInt(customerId)
      );
      const addressesDTO = CustomerMapper.addressesToPublicDTOs(addresses);

      res.json({
        message: "Adresses récupérées avec succès",
        addresses: addressesDTO,
      });
    } catch (error: any) {
      console.error("Get addresses error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Create new address
   */
  async createAddress(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;
      
      if (!customerId) {
        res.status(400).json({ error: "Customer ID is required" });
        return;
      }
      
      const addressCreateDTO: AddressCreateDTO = req.body;
      const addressData =
        CustomerMapper.addressCreateDTOToAddressData(addressCreateDTO);

      const address = await this.customerService.addAddress(
        parseInt(customerId),
        addressData
      );
      const addressDTO = CustomerMapper.addressToPublicDTO(address);

      res.status(201).json(ResponseMapper.addressCreated(addressDTO));
    } catch (error: any) {
      console.error("Create address error:", error);
      if (error.message === "Customer not found") {
        res.status(404).json(ResponseMapper.notFoundError("Customer"));
        return;
      }
      if (error.message.includes("validation")) {
        res.status(400).json(ResponseMapper.validationError(error.message));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Update address
   */
  async updateAddress(req: Request, res: Response): Promise<void> {
    try {
      const { addressId } = req.params;
      
      if (!addressId) {
        res.status(400).json({ error: "Address ID is required" });
        return;
      }
      
      const addressUpdateDTO: AddressUpdateDTO = req.body;
      const updateData =
        CustomerMapper.addressUpdateDTOToAddressData(addressUpdateDTO);

      const address = await this.customerService.updateAddress(
        parseInt(addressId),
        updateData
      );
      const addressDTO = CustomerMapper.addressToPublicDTO(address);

      res.json(ResponseMapper.addressUpdated(addressDTO));
    } catch (error: any) {
      console.error("Update address error:", error);
      if (error.message === "Address not found") {
        res.status(404).json(ResponseMapper.notFoundError("Address"));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Delete address
   */
  async deleteAddress(req: Request, res: Response): Promise<void> {
    try {
      const { addressId } = req.params;
      
      if (!addressId) {
        res.status(400).json({ error: "Address ID is required" });
        return;
      }
      
      const success = await this.customerService.deleteAddress(
        parseInt(addressId)
      );

      if (!success) {
        res.status(404).json(ResponseMapper.notFoundError("Address"));
        return;
      }

      res.json(ResponseMapper.addressDeleted());
    } catch (error: any) {
      console.error("Delete address error:", error);
      if (error.message === "Address not found") {
        res.status(404).json(ResponseMapper.notFoundError("Address"));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }
}
