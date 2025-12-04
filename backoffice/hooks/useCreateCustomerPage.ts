import { useState, useCallback } from "react";
import { useRouter } from "next/router";
import { CustomerCreateDTO, CustomerUpdateDTO } from "../dto";
import { createCustomer } from "../services/customerService";
import { executeWithLoading } from "../utils";

interface UseCreateCustomerPageReturn {
  isLoading: boolean;
  error: string | null;
  handleCreateCustomer: (
    data: CustomerCreateDTO | CustomerUpdateDTO
  ) => Promise<void>;
  handleCancel: () => void;
  setError: (error: string | null) => void;
}

export function useCreateCustomerPage(): UseCreateCustomerPageReturn {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateCustomer = useCallback(
    async (data: CustomerCreateDTO | CustomerUpdateDTO) => {
      await executeWithLoading(
        async () => {
          const createData = data as CustomerCreateDTO;
          await createCustomer(createData);
          router.push("/customers");
        },
        setIsLoading,
        setError,
        {
          notFoundMessage: "Client introuvable",
          defaultMessage: "Erreur lors de la création",
        },
        (err) => console.error("Error creating customer:", err)
      );
    },
    [router]
  );

  const handleCancel = useCallback(() => {
    router.push("/customers");
  }, [router]);

  return {
    isLoading,
    error,
    handleCreateCustomer,
    handleCancel,
    setError,
  };
}
