/**
 * Hook pour gérer les détails d'une commande
 * Centralise la logique de récupération des items et adresses d'une commande
 */

import { useState, useEffect } from "react";
import { OrderItemPublicDTO, OrderAddressPublicDTO } from "../dto";
import { getOrderItems, getOrderAddresses } from "../services/orderService";
import { executeWithLoading } from "../utils";

interface UseOrderDetailReturn {
  items: OrderItemPublicDTO[];
  itemsLoading: boolean;
  itemsError: string | null;
  addresses: OrderAddressPublicDTO[];
  addressesLoading: boolean;
  addressesError: string | null;
}

export function useOrderDetail(orderId: number | null): UseOrderDetailReturn {
  const [items, setItems] = useState<OrderItemPublicDTO[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<OrderAddressPublicDTO[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressesError, setAddressesError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!orderId) {
        setItems([]);
        setAddresses([]);
        return;
      }

      // Charger les items et adresses en parallèle
      const [itemsList, addressesList] = await Promise.all([
        executeWithLoading(
          async () => await getOrderItems(orderId),
          setItemsLoading,
          setItemsError,
          {
            defaultMessage: "Erreur chargement des articles",
          }
        ),
        executeWithLoading(
          async () => await getOrderAddresses(orderId),
          setAddressesLoading,
          setAddressesError,
          {
            defaultMessage: "Erreur chargement des adresses",
          }
        ),
      ]);

      if (itemsList) {
        setItems(itemsList);
      }
      if (addressesList) {
        setAddresses(addressesList);
      }
    };

    loadData();
  }, [orderId]);

  return {
    items,
    itemsLoading,
    itemsError,
    addresses,
    addressesLoading,
    addressesError,
  };
}
