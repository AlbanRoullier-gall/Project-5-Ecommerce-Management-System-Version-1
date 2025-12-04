/**
 * Hook unifié pour gérer la création et l'édition de clients
 * Remplace useCreateCustomerPage et useEditCustomerPage
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import {
  CustomerPublicDTO,
  CustomerCreateDTO,
  CustomerUpdateDTO,
} from "../../dto";
import {
  getCustomer,
  createCustomer,
  updateCustomer,
} from "../../services/customerService";
import { normalizeRouterId, executeWithLoading } from "../../utils";

type CustomerFormMode = "create" | "edit";

interface UseCustomerFormPageReturn {
  mode: CustomerFormMode;
  customer: CustomerPublicDTO | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  handleSaveCustomer: (
    data: CustomerCreateDTO | CustomerUpdateDTO
  ) => Promise<void>;
  handleCancel: () => void;
  reloadCustomer: () => Promise<void>;
  setError: (error: string | null) => void;
}

export function useCustomerFormPage(
  customerId?: number | string | string[] | undefined
): UseCustomerFormPageReturn {
  const router = useRouter();
  const mode: CustomerFormMode = customerId ? "edit" : "create";

  const [customer, setCustomer] = useState<CustomerPublicDTO | null>(null);
  const [isLoading, setIsLoading] = useState(mode === "edit");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCustomer = useCallback(async () => {
    if (mode !== "edit" || !customerId) return;

    const id = normalizeRouterId(customerId);
    if (!id) return;

    const result = await executeWithLoading(
      async () => await getCustomer(id),
      setIsLoading,
      setError,
      {
        notFoundMessage: "Client introuvable",
        defaultMessage: "Erreur lors du chargement",
      },
      (err) => console.error("Error loading customer:", err)
    );

    if (result) {
      setCustomer(result);
    }
  }, [customerId, mode]);

  useEffect(() => {
    if (mode === "edit" && customerId) {
      loadCustomer();
    }
  }, [mode, customerId, loadCustomer]);

  const handleSaveCustomer = useCallback(
    async (data: CustomerCreateDTO | CustomerUpdateDTO) => {
      if (mode === "create") {
        await executeWithLoading(
          async () => {
            const createData = data as CustomerCreateDTO;
            await createCustomer(createData);
            router.push("/customers");
          },
          setIsSaving,
          setError,
          {
            notFoundMessage: "Client introuvable",
            defaultMessage: "Erreur lors de la création",
          },
          (err) => console.error("Error creating customer:", err)
        );
      } else {
        // Mode edit
        if (!customer) return;

        await executeWithLoading(
          async () => {
            await updateCustomer(customer.customerId, data);
            await loadCustomer();
          },
          setIsSaving,
          setError,
          {
            notFoundMessage: "Client introuvable",
            defaultMessage: "Erreur lors de la mise à jour",
          },
          (err) => console.error("Error updating customer:", err)
        );
      }
    },
    [mode, customer, router, loadCustomer]
  );

  const handleCancel = useCallback(() => {
    router.push("/customers");
  }, [router]);

  return {
    mode,
    customer,
    isLoading,
    isSaving,
    error,
    handleSaveCustomer,
    handleCancel,
    reloadCustomer: loadCustomer,
    setError,
  };
}
