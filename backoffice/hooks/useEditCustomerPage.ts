import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { CustomerPublicDTO, CustomerUpdateDTO } from "../dto";
import { getCustomer, updateCustomer } from "../services/customerService";
import { normalizeRouterId, executeWithLoading } from "../utils";

interface UseEditCustomerPageReturn {
  customer: CustomerPublicDTO | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  handleUpdateCustomer: (data: CustomerUpdateDTO) => Promise<void>;
  handleCancel: () => void;
  reloadCustomer: () => Promise<void>;
  setError: (error: string | null) => void;
}

export function useEditCustomerPage(
  customerId: number | string | string[] | undefined
): UseEditCustomerPageReturn {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerPublicDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCustomer = useCallback(async () => {
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
  }, [customerId]);

  useEffect(() => {
    if (customerId) {
      loadCustomer();
    }
  }, [customerId, loadCustomer]);

  const handleUpdateCustomer = useCallback(
    async (data: CustomerUpdateDTO) => {
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
    },
    [customer, loadCustomer]
  );

  const handleCancel = useCallback(() => {
    router.push("/customers");
  }, [router]);

  return {
    customer,
    isLoading,
    isSaving,
    error,
    handleUpdateCustomer,
    handleCancel,
    reloadCustomer: loadCustomer,
    setError,
  };
}
