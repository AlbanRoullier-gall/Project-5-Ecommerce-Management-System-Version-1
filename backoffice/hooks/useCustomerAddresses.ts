/**
 * Hook personnalisé pour gérer les adresses d'un client
 * Centralise la logique de récupération et de gestion des adresses
 */

import { useState, useEffect, useCallback } from "react";
import { AddressPublicDTO, AddressCreateDTO, AddressUpdateDTO } from "../dto";
import {
  getCustomerAddresses,
  createCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress as deleteCustomerAddressService,
} from "../services/customerService";
import { executeWithLoading } from "../utils";

interface UseCustomerAddressesReturn {
  addresses: AddressPublicDTO[];
  isLoading: boolean;
  error: string | null;
  loadAddresses: () => Promise<void>;
  handleCreateAddress: (data: AddressCreateDTO) => Promise<void>;
  handleUpdateAddress: (
    addressId: number,
    data: AddressUpdateDTO
  ) => Promise<void>;
  handleDeleteAddress: (addressId: number) => Promise<void>;
  setError: (error: string | null) => void;
}

export function useCustomerAddresses(
  customerId: number
): UseCustomerAddressesReturn {
  const [addresses, setAddresses] = useState<AddressPublicDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAddresses = useCallback(async () => {
    const result = await executeWithLoading(
      async () => await getCustomerAddresses(customerId),
      setIsLoading,
      setError,
      {
        notFoundMessage: "Adresses introuvables",
        defaultMessage: "Erreur lors du chargement",
      },
      (err) => console.error("Error loading addresses:", err)
    );

    if (result) {
      setAddresses(result.addresses);
    }
  }, [customerId]);

  const handleCreateAddress = useCallback(
    async (data: AddressCreateDTO) => {
      await executeWithLoading(
        async () => {
          await createCustomerAddress(customerId, data);
          await loadAddresses();
        },
        setIsLoading,
        setError,
        {
          notFoundMessage: "Adresse introuvable",
          defaultMessage: "Erreur lors de la création",
        },
        (err) => {
          console.error("Error creating address:", err);
          throw err;
        }
      );
    },
    [customerId, loadAddresses]
  );

  const handleUpdateAddress = useCallback(
    async (addressId: number, data: AddressUpdateDTO) => {
      await executeWithLoading(
        async () => {
          await updateCustomerAddress(customerId, addressId, data);
          await loadAddresses();
        },
        setIsLoading,
        setError,
        {
          notFoundMessage: "Adresse introuvable",
          defaultMessage: "Erreur lors de la mise à jour",
        },
        (err) => {
          console.error("Error updating address:", err);
          throw err;
        }
      );
    },
    [customerId, loadAddresses]
  );

  const handleDeleteAddress = useCallback(
    async (addressId: number) => {
      await executeWithLoading(
        async () => {
          await deleteCustomerAddressService(customerId, addressId);
          await loadAddresses();
        },
        setIsLoading,
        setError,
        {
          notFoundMessage: "Adresse introuvable",
          defaultMessage: "Erreur lors de la suppression",
        },
        (err) => {
          console.error("Error deleting address:", err);
          throw err;
        }
      );
    },
    [customerId, loadAddresses]
  );

  useEffect(() => {
    if (customerId) {
      loadAddresses();
    }
  }, [customerId, loadAddresses]);

  return {
    addresses,
    isLoading,
    error,
    loadAddresses,
    handleCreateAddress,
    handleUpdateAddress,
    handleDeleteAddress,
    setError,
  };
}
