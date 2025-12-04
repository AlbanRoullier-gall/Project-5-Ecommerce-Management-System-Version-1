/**
 * Hook personnalisé pour gérer les commandes
 * Centralise la logique de récupération et de gestion des commandes
 */

import { useState, useCallback } from "react";
import { OrderPublicDTO, OrderListRequestDTO } from "../dto";
import {
  getOrders,
  updateDeliveryStatus as updateDeliveryStatusService,
} from "../services/orderService";
import { executeWithLoading, getErrorMessage } from "../utils";

interface UseOrdersFilters {
  search?: string;
  deliveryFilter?: string;
  yearFilter?: string;
  totalFilter?: string;
  dateFilter?: string;
}

interface UseOrdersReturn {
  orders: OrderPublicDTO[];
  isLoading: boolean;
  error: string | null;
  loadOrders: () => Promise<void>;
  toggleDeliveryStatus: (orderId: number, delivered: boolean) => Promise<void>;
  setError: (error: string | null) => void;
}

export function useOrders(filters: UseOrdersFilters): UseOrdersReturn {
  const [orders, setOrders] = useState<OrderPublicDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    const result = await executeWithLoading(
      async () => {
        const filtersDTO: Partial<OrderListRequestDTO> = {};
        if (filters.search) filtersDTO.search = filters.search;
        if (filters.yearFilter && filters.yearFilter !== "")
          filtersDTO.year = parseInt(filters.yearFilter);
        if (filters.totalFilter && filters.totalFilter !== "")
          filtersDTO.total = parseFloat(filters.totalFilter);
        if (filters.dateFilter && filters.dateFilter !== "")
          filtersDTO.date = filters.dateFilter;
        if (filters.deliveryFilter && filters.deliveryFilter !== "")
          filtersDTO.delivered = filters.deliveryFilter === "delivered";

        return await getOrders(filtersDTO);
      },
      setIsLoading,
      setError,
      {
        notFoundMessage: "Commandes introuvables",
        defaultMessage: "Erreur lors du chargement",
      },
      (err) => console.error("Error loading orders:", err)
    );

    if (result) {
      setOrders(result.orders);
    }
  }, [
    filters.search,
    filters.deliveryFilter,
    filters.yearFilter,
    filters.totalFilter,
    filters.dateFilter,
  ]);

  const toggleDeliveryStatus = useCallback(
    async (orderId: number, delivered: boolean) => {
      try {
        await updateDeliveryStatusService(orderId, delivered);
        // Mettre à jour l'état local
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, delivered } : order
          )
        );
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(
          err,
          "Commande introuvable",
          "Erreur lors de la mise à jour"
        );
        setError(errorMessage);
        console.error("Error toggling delivery status:", err);
        throw err;
      }
    },
    []
  );

  return {
    orders,
    isLoading,
    error,
    loadOrders,
    toggleDeliveryStatus,
    setError,
  };
}
