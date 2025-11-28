/**
 * Contrôleur d'Adresses
 * Gère les opérations de gestion des adresses clients
 *
 * Architecture : Pattern Contrôleur
 * - Gestion des requêtes HTTP
 * - Orchestration de la logique métier
 * - Formatage des réponses
 */

import { Request, Response } from "express";
import CustomerService from "../../services/CustomerService";
import { AddressCreateDTO, AddressUpdateDTO, AddressesCreateDTO } from "../dto";
import { CustomerMapper, ResponseMapper } from "../mapper";

export class AddressController {
  constructor(private customerService: CustomerService) {}

  /**
   * Récupérer les adresses d'un client
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
      const response = {
        message: "Adresses récupérées avec succès",
        addresses: CustomerMapper.addressesToPublicDTOs(addresses),
        timestamp: new Date().toISOString(),
        status: 200,
      };

      res.json(response);
    } catch (error: any) {
      console.error("Get addresses error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Créer une nouvelle adresse
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
      if (
        error.message === "Address already exists" ||
        (typeof error.message === "string" &&
          error.message.toLowerCase().includes("already exists"))
      ) {
        res
          .status(409)
          .json(ResponseMapper.conflictError("Address already exists"));
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
   * Mettre à jour une adresse
   */
  async updateAddress(req: Request, res: Response): Promise<void> {
    try {
      const { id: addressId } = req.params;

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
   * Créer plusieurs adresses pour un client (shipping + billing)
   */
  async createAddresses(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;

      if (!customerId) {
        res.status(400).json({ error: "Customer ID is required" });
        return;
      }

      const addressesCreateDTO: AddressesCreateDTO = req.body;

      // Valider que shipping ou billing est fourni
      if (!addressesCreateDTO.shipping && !addressesCreateDTO.billing) {
        res
          .status(400)
          .json(
            ResponseMapper.validationError(
              "Au moins une adresse (shipping ou billing) doit être fournie"
            )
          );
        return;
      }

      const result = await this.customerService.addAddresses(
        parseInt(customerId),
        {
          ...(addressesCreateDTO.shipping && {
            shipping: {
              address: addressesCreateDTO.shipping.address || "",
              postalCode: addressesCreateDTO.shipping.postalCode || "",
              city: addressesCreateDTO.shipping.city || "",
              ...(addressesCreateDTO.shipping.countryName && {
                countryName: addressesCreateDTO.shipping.countryName,
              }),
            },
          }),
          ...(addressesCreateDTO.billing && {
            billing: {
              address: addressesCreateDTO.billing.address || "",
              postalCode: addressesCreateDTO.billing.postalCode || "",
              city: addressesCreateDTO.billing.city || "",
              ...(addressesCreateDTO.billing.countryName && {
                countryName: addressesCreateDTO.billing.countryName,
              }),
            },
          }),
          ...(addressesCreateDTO.useSameBillingAddress !== undefined && {
            useSameBillingAddress: addressesCreateDTO.useSameBillingAddress,
          }),
        }
      );

      const response = {
        message: "Adresses créées avec succès",
        addresses: {
          ...(result.shipping && {
            shipping: CustomerMapper.addressToPublicDTO(result.shipping),
          }),
          ...(result.billing && {
            billing: CustomerMapper.addressToPublicDTO(result.billing),
          }),
        },
        timestamp: new Date().toISOString(),
        status: 201,
      };

      res.status(201).json(response);
    } catch (error: any) {
      console.error("Create addresses error:", error);
      if (
        error.message === "Client non trouvé" ||
        error.message === "Customer not found"
      ) {
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
   * Supprimer une adresse
   */
  async deleteAddress(req: Request, res: Response): Promise<void> {
    try {
      const { id: addressId } = req.params;

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
