import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { OrderPublicDTO } from "../dto";
import { getOrder } from "../services/orderService";
import { normalizeRouterId, executeWithLoading } from "../utils";

interface UseOrderDetailPageReturn {
  order: OrderPublicDTO | null;
  isLoading: boolean;
  error: string | null;
  handleClose: () => void;
  setError: (error: string | null) => void;
}

export function useOrderDetailPage(
  orderId: number | string | string[] | undefined
): UseOrderDetailPageReturn {
  const router = useRouter();
  const [order, setOrder] = useState<OrderPublicDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    const id = normalizeRouterId(orderId);
    if (!id) return;

    const result = await executeWithLoading(
      async () => await getOrder(id),
      setIsLoading,
      setError,
      {
        notFoundMessage: "Commande introuvable",
        defaultMessage: "Erreur lors du chargement",
      },
      (err) => console.error("Error loading order:", err)
    );

    if (result) {
      setOrder(result);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId, loadOrder]);

  const handleClose = useCallback(() => {
    router.push("/orders");
  }, [router]);

  return {
    order,
    isLoading,
    error,
    handleClose,
    setError,
  };
}
