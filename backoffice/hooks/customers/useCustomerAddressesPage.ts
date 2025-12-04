import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { CustomerPublicDTO } from "../../dto";
import { getCustomer } from "../../services/customerService";
import { normalizeRouterId, executeWithLoading } from "../../utils";

interface UseCustomerAddressesPageReturn {
  customer: CustomerPublicDTO | null;
  isLoading: boolean;
  error: string | null;
  handleClose: () => void;
  setError: (error: string | null) => void;
}

export function useCustomerAddressesPage(
  customerId: number | string | string[] | undefined
): UseCustomerAddressesPageReturn {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerPublicDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

  const handleClose = useCallback(() => {
    router.push("/customers");
  }, [router]);

  return {
    customer,
    isLoading,
    error,
    handleClose,
    setError,
  };
}
