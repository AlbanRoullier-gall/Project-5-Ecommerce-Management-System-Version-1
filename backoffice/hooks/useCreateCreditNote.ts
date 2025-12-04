import { useState, useEffect, useMemo, useCallback } from "react";
import {
  OrderPublicDTO,
  CreditNotePublicDTO,
  CreditNoteCreateDTO,
  OrderItemPublicDTO,
} from "../dto";
import { getOrderItems, createCreditNote } from "../services/orderService";
import { calculateCreditNoteTotals } from "../services/creditNoteService";
import { executeWithLoading } from "../utils";

interface UseCreateCreditNoteProps {
  order: OrderPublicDTO | null;
  orders?: OrderPublicDTO[];
  isOpen: boolean;
}

interface UseCreateCreditNoteReturn {
  // Form state
  reason: string;
  description: string;
  issueDate: string;
  paymentMethod: string;
  totalHT: string;
  totalTTC: string;
  notes: string;
  selectedOrderId: string;

  // Setters
  setReason: (value: string) => void;
  setDescription: (value: string) => void;
  setIssueDate: (value: string) => void;
  setPaymentMethod: (value: string) => void;
  setTotalHT: (value: string) => void;
  setTotalTTC: (value: string) => void;
  setNotes: (value: string) => void;
  setSelectedOrderId: (value: string) => void;

  // Selected order
  selectedOrder: OrderPublicDTO | null;

  // Order items
  orderItems: OrderItemPublicDTO[];
  itemsLoading: boolean;
  itemsError: string | null;

  // Selected items
  selectedItemIds: number[];
  selectedItems: OrderItemPublicDTO[];
  handleSelectionChange: (itemId: number | string, checked: boolean) => void;

  // Calculated totals
  calculatedTotals: { totalHT: number; totalTTC: number };
  isCalculatingTotals: boolean;

  // Submission
  isSubmitting: boolean;
  error: string | null;
  canSubmit: boolean;

  // Actions
  handleSubmit: (
    onCreated: (creditNote: CreditNotePublicDTO) => void
  ) => Promise<void>;
  resetForm: () => void;
  setError: (error: string | null) => void;
}

export function useCreateCreditNote({
  order,
  orders = [],
  isOpen,
}: UseCreateCreditNoteProps): UseCreateCreditNoteReturn {
  // Form state
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [issueDate, setIssueDate] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [totalHT, setTotalHT] = useState<string>("");
  const [totalTTC, setTotalTTC] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");

  // Order items
  const [orderItems, setOrderItems] = useState<OrderItemPublicDTO[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState<string | null>(null);

  // Selected items
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);

  // Calculated totals
  const [calculatedTotals, setCalculatedTotals] = useState<{
    totalHT: number;
    totalTTC: number;
  }>({ totalHT: 0, totalTTC: 0 });
  const [isCalculatingTotals, setIsCalculatingTotals] = useState(false);

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute selected order
  const selectedOrder: OrderPublicDTO | null = useMemo(() => {
    if (order) return order;
    const id = Number(selectedOrderId);
    if (!Number.isFinite(id)) return null;
    return orders.find((o) => o.id === id) || null;
  }, [order, orders, selectedOrderId]);

  // Compute selected items
  const selectedItems = useMemo(() => {
    const set = new Set(selectedItemIds);
    return orderItems.filter((it) => set.has(it.id));
  }, [orderItems, selectedItemIds]);

  // Compute canSubmit
  const canSubmit = useMemo(() => {
    if (!selectedOrder) return false;

    if (selectedItems.length > 0) {
      return reason.trim().length > 0 && paymentMethod.trim().length > 0;
    }

    const nHT = Number(totalHT);
    const nTTC = Number(totalTTC);
    return (
      reason.trim().length > 0 &&
      paymentMethod.trim().length > 0 &&
      Number.isFinite(nHT) &&
      Number.isFinite(nTTC) &&
      nHT > 0 &&
      nTTC > 0
    );
  }, [
    selectedOrder,
    reason,
    paymentMethod,
    totalHT,
    totalTTC,
    selectedItems.length,
  ]);

  // Load order items when selected order changes
  useEffect(() => {
    const loadItems = async () => {
      if (!selectedOrder) {
        setOrderItems([]);
        setSelectedItemIds([]);
        return;
      }

      setOrderItems([]);
      setSelectedItemIds([]);

      const items = await executeWithLoading(
        async () => await getOrderItems(selectedOrder.id),
        setItemsLoading,
        setItemsError,
        {
          defaultMessage: "Erreur chargement des articles",
        }
      );

      if (items) {
        setOrderItems(items);
      }
    };

    loadItems();
  }, [selectedOrder?.id]);

  // Calculate totals when selected items change
  useEffect(() => {
    const calculateTotals = async () => {
      if (selectedItems.length === 0) {
        setCalculatedTotals({ totalHT: 0, totalTTC: 0 });
        return;
      }

      const itemIds = selectedItems.map((item) => item.id);
      const totals = await executeWithLoading(
        async () => await calculateCreditNoteTotals(itemIds),
        setIsCalculatingTotals,
        () => {}, // Pas d'affichage d'erreur (valeurs par défaut à 0)
        {
          defaultMessage: "Erreur lors du calcul des totaux",
        },
        (err) => console.error("Erreur lors du calcul des totaux:", err)
      );

      if (totals) {
        setCalculatedTotals({
          totalHT: totals.totalHT,
          totalTTC: totals.totalTTC,
        });
      } else {
        // Valeurs par défaut en cas d'erreur
        setCalculatedTotals({ totalHT: 0, totalTTC: 0 });
      }
    };

    calculateTotals();
  }, [selectedItems]);

  // Set issue date when modal opens
  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().slice(0, 10);
      setIssueDate(today);
    }
  }, [isOpen]);

  // Reset form
  const resetForm = useCallback(() => {
    setReason("");
    setDescription("");
    setIssueDate("");
    setPaymentMethod("");
    setTotalHT("");
    setTotalTTC("");
    setNotes("");
    setError(null);
    setSelectedOrderId("");
    setOrderItems([]);
    setSelectedItemIds([]);
    setItemsError(null);
  }, []);

  // Handle selection change
  const handleSelectionChange = useCallback(
    (itemId: number | string, checked: boolean) => {
      setSelectedItemIds((prev) => {
        const set = new Set(prev);
        const numId = typeof itemId === "number" ? itemId : Number(itemId);
        if (checked) {
          set.add(numId);
        } else {
          set.delete(numId);
        }
        const newSelection = Array.from(set);
        // Clear manual totals when items are selected
        if (newSelection.length > 0) {
          setTotalHT("");
          setTotalTTC("");
        }
        return newSelection;
      });
    },
    []
  );

  // Handle submit
  const handleSubmit = useCallback(
    async (onCreated: (creditNote: CreditNotePublicDTO) => void) => {
      if (!selectedOrder || !canSubmit) return;

      const payload: CreditNoteCreateDTO = {
        customerId: selectedOrder.customerId,
        orderId: selectedOrder.id,
        reason: reason.trim(),
        description: description.trim() || undefined,
        paymentMethod: paymentMethod || undefined,
        notes: notes.trim() || undefined,
        ...(selectedItems.length > 0
          ? {
              items: selectedItems.map((it) => ({
                productId: it.productId,
                productName: it.productName,
                quantity: it.quantity,
                unitPriceHT: it.unitPriceHT,
                unitPriceTTC: it.unitPriceTTC,
                vatRate: it.vatRate,
                totalPriceHT: it.totalPriceHT,
                totalPriceTTC: it.totalPriceTTC,
              })),
            }
          : {
              totalAmountHT: Number(totalHT),
              totalAmountTTC: Number(totalTTC),
            }),
      };

      const created = await executeWithLoading(
        async () => await createCreditNote(payload),
        setIsSubmitting,
        setError,
        {
          defaultMessage: "Erreur lors de la création de l'avoir",
        }
      );

      if (created) {
        onCreated(created);
        resetForm();
      }
    },
    [
      selectedOrder,
      canSubmit,
      reason,
      description,
      paymentMethod,
      notes,
      selectedItems,
      totalHT,
      totalTTC,
      resetForm,
    ]
  );

  return {
    // Form state
    reason,
    description,
    issueDate,
    paymentMethod,
    totalHT,
    totalTTC,
    notes,
    selectedOrderId,

    // Setters
    setReason,
    setDescription,
    setIssueDate,
    setPaymentMethod,
    setTotalHT,
    setTotalTTC,
    setNotes,
    setSelectedOrderId,

    // Selected order
    selectedOrder,

    // Order items
    orderItems,
    itemsLoading,
    itemsError,

    // Selected items
    selectedItemIds,
    selectedItems,
    handleSelectionChange,

    // Calculated totals
    calculatedTotals,
    isCalculatingTotals,

    // Submission
    isSubmitting,
    error,
    canSubmit,

    // Actions
    handleSubmit,
    resetForm,
    setError,
  };
}
