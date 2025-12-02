import React, { useMemo, useState } from "react";
import { Button, Modal, ErrorAlert, ItemDisplayTable } from "../../shared";
import { BaseItemDTO } from "@tfe/shared-types/common/BaseItemDTO";
import {
  CreditNoteCreateDTO,
  OrderPublicDTO,
  CreditNotePublicDTO,
  OrderItemPublicDTO,
} from "../../../dto";
import { useAuth } from "../../../contexts/AuthContext";

interface CreateCreditNoteModalProps {
  isOpen: boolean;
  order: OrderPublicDTO | null;
  orders?: OrderPublicDTO[];
  onClose: () => void;
  onCreated: (created: CreditNotePublicDTO) => void;
}

const CreateCreditNoteModal: React.FC<CreateCreditNoteModalProps> = ({
  isOpen,
  order,
  orders = [],
  onClose,
  onCreated,
}) => {
  const { apiCall } = useAuth();
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [issueDate, setIssueDate] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [totalHT, setTotalHT] = useState<string>("");
  const [totalTTC, setTotalTTC] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [orderItems, setOrderItems] = useState<OrderItemPublicDTO[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const [calculatedTotals, setCalculatedTotals] = useState<{
    totalHT: number;
    totalTTC: number;
  }>({ totalHT: 0, totalTTC: 0 });
  const [isCalculatingTotals, setIsCalculatingTotals] = useState(false);

  const selectedOrder: OrderPublicDTO | null = useMemo(() => {
    if (order) return order;
    const id = Number(selectedOrderId);
    if (!Number.isFinite(id)) return null;
    return orders.find((o) => o.id === id) || null;
  }, [order, orders, selectedOrderId]);

  const selectedItems = useMemo(() => {
    const set = new Set(selectedItemIds);
    return orderItems.filter((it) => set.has(it.id));
  }, [orderItems, selectedItemIds]);

  const canSubmit = useMemo(() => {
    if (!selectedOrder) return false;

    // Si des items sont sélectionnés, les totaux seront calculés par le service
    if (selectedItems.length > 0) {
      return reason.trim().length > 0 && paymentMethod.trim().length > 0;
    }

    // Sinon, les totaux doivent être fournis manuellement
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

  // Calcul des totaux via l'API lorsque les items sélectionnés changent
  React.useEffect(() => {
    const calculateTotalsFromAPI = async () => {
      if (!selectedItems || selectedItems.length === 0) {
        setCalculatedTotals({ totalHT: 0, totalTTC: 0 });
        return;
      }

      setIsCalculatingTotals(true);
      try {
        // Envoyer uniquement les IDs des items sélectionnés
        // Le service récupérera les items depuis la base et calculera les totaux
        const itemIds = selectedItems.map((item) => item.id);

        const result = await apiCall<{
          data: {
            totalHT?: number;
            totalTTC?: number;
            totalVAT?: number;
          };
        }>({
          url: "/api/admin/credit-notes/calculate-totals",
          method: "POST",
          body: { itemIds },
          requireAuth: true,
        });

        console.log("Réponse calcul totaux:", result);

        // La réponse utilise ResponseMapper.success() qui retourne { message, data, status, timestamp }
        if (
          result.data &&
          typeof result.data.totalHT !== "undefined" &&
          typeof result.data.totalTTC !== "undefined"
        ) {
          setCalculatedTotals({
            totalHT: result.data.totalHT,
            totalTTC: result.data.totalTTC,
          });
        } else {
          console.error("Format de réponse inattendu:", result);
          setCalculatedTotals({ totalHT: 0, totalTTC: 0 });
        }
      } catch (error) {
        console.error("Erreur lors du calcul des totaux:", error);
        setCalculatedTotals({ totalHT: 0, totalTTC: 0 });
      } finally {
        setIsCalculatingTotals(false);
      }
    };

    calculateTotalsFromAPI();
  }, [selectedItems]);

  React.useEffect(() => {
    const loadItems = async () => {
      if (!selectedOrder) {
        setOrderItems([]);
        setSelectedItemIds([]);
        return;
      }
      setItemsLoading(true);
      setItemsError(null);
      setOrderItems([]);
      setSelectedItemIds([]);
      try {
        const json = await apiCall<{
          data?: { orderItems?: OrderItemPublicDTO[] };
          orderItems?: OrderItemPublicDTO[];
        }>({
          url: `/api/admin/orders/${selectedOrder.id}/items`,
          method: "GET",
          requireAuth: true,
        });
        // Format standardisé : { data: { orderItems: [], count } }, ... }
        if (!json.data || !Array.isArray(json.data.orderItems)) {
          throw new Error(
            "Format de réponse invalide pour les articles de commande"
          );
        }
        const list: OrderItemPublicDTO[] = json.data.orderItems;
        setOrderItems(list);
      } catch (e) {
        setItemsError(
          e instanceof Error ? e.message : "Erreur chargement des articles"
        );
      } finally {
        setItemsLoading(false);
      }
    };
    loadItems();
  }, [selectedOrder?.id]);

  const resetForm = () => {
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
  };

  React.useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().slice(0, 10);
      setIssueDate(today);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedOrder || !canSubmit) return;
    setIsSubmitting(true);
    setError(null);
    try {
      // Utiliser le même endpoint avec le DTO unifié
      const payload: CreditNoteCreateDTO = {
        customerId: selectedOrder.customerId,
        orderId: selectedOrder.id,
        reason: reason.trim(),
        description: description.trim() || undefined,
        paymentMethod: paymentMethod || undefined,
        notes: notes.trim() || undefined,
        // Si des items sont sélectionnés, les inclure (les totaux seront calculés automatiquement)
        // Sinon, inclure les totaux fournis
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

      const json = await apiCall<{
        data: { creditNote: CreditNotePublicDTO };
        message?: string;
        timestamp?: string;
        status?: number;
      }>({
        url: "/api/admin/credit-notes",
        method: "POST",
        body: payload,
        requireAuth: true,
      });

      // Format standardisé : { data: { creditNote }, ... }
      if (!json.data || !json.data.creditNote) {
        throw new Error("Format de réponse invalide pour l'avoir créé");
      }
      const created: CreditNotePublicDTO = json.data.creditNote;

      onCreated(created);

      resetForm();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur réseau");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Créer un avoir"
      onClose={handleClose}
      maxWidth="800px"
      footerActions={
        <>
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            variant="primary"
            icon="fas fa-file-invoice-dollar"
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? "Création…" : "Créer l'avoir"}
          </Button>
        </>
      }
    >
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      <div
        className="credit-note-form"
        style={{ display: "grid", gap: "1rem" }}
      >
        {selectedOrder ? (
          <div style={{ color: "#6b7280" }}>Commande #{selectedOrder.id}</div>
        ) : (
          <div>
            <label style={{ display: "block", fontWeight: 600 }}>
              Sélectionner une commande
            </label>
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: 10,
                border: "2px solid #e1e5e9",
                background: "white",
              }}
            >
              <option value="">— Choisir une commande —</option>
              {orders.map((o) => {
                const customerName = `${o.customerFirstName || ""} ${
                  o.customerLastName || ""
                }`.trim();
                return (
                  <option key={o.id} value={o.id}>
                    #{o.id} — {customerName || o.customerEmail || "Client"}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {selectedOrder && (
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: "0.75rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <div style={{ fontWeight: 600, color: "#111827" }}>
                Articles de la commande
              </div>
              {itemsLoading && (
                <div style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                  Chargement…
                </div>
              )}
            </div>

            {itemsError && (
              <div
                style={{
                  background: "#FEF2F2",
                  color: "#B91C1C",
                  border: "1px solid #FECACA",
                  padding: "0.5rem 0.75rem",
                  borderRadius: 10,
                  marginBottom: "0.5rem",
                }}
              >
                {itemsError}
              </div>
            )}

            {!itemsLoading && !itemsError && (
              <ItemDisplayTable
                items={orderItems as BaseItemDTO[]}
                variant="credit-note"
                showDescription={false}
                showImage={false}
                columns={{
                  selection: true,
                  product: true,
                  quantity: true,
                  unitPriceHT: false,
                  vatRate: false,
                  totalPriceHT: true,
                  totalPriceTTC: true,
                }}
                selectedItemIds={selectedItemIds}
                getItemId={(item) => (item as OrderItemPublicDTO).id}
                onSelectionChange={(itemId, checked) => {
                  setSelectedItemIds((prev) => {
                    const set = new Set(prev);
                    const numId =
                      typeof itemId === "number" ? itemId : Number(itemId);
                    if (checked) set.add(numId);
                    else set.delete(numId);
                    const newSelection = Array.from(set);
                    // Si des items sont sélectionnés, vider les totaux manuels (seront calculés par le service)
                    if (newSelection.length > 0) {
                      setTotalHT("");
                      setTotalTTC("");
                    }
                    return newSelection;
                  });
                }}
              />
            )}
          </div>
        )}

        <div
          className="form-fields"
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: "1rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1rem",
          }}
        >
          <div className="form-field">
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}
            >
              Motif
            </label>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Retour produit, geste commercial..."
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: 8,
                border: "2px solid #e1e5e9",
                fontSize: "1rem",
                transition: "border-color 0.2s ease",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#13686a";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e1e5e9";
              }}
            />
          </div>

          <div className="form-field">
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}
            >
              Date d'émission
            </label>
            <input
              type="date"
              value={issueDate}
              disabled
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: 8,
                border: "2px solid #e1e5e9",
                background: "#f9fafb",
                color: "#6b7280",
                fontSize: "1rem",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div className="form-field form-field-full">
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}
            >
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Détails supplémentaires"
              rows={3}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: 8,
                border: "2px solid #e1e5e9",
                fontSize: "1rem",
                resize: "vertical",
                minHeight: "80px",
                transition: "border-color 0.2s ease",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#13686a";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e1e5e9";
              }}
            />
          </div>

          <div className="form-field">
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}
            >
              Paiement
            </label>
            <input
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              placeholder="Ex: carte, virement"
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: 8,
                border: "2px solid #e1e5e9",
                fontSize: "1rem",
                transition: "border-color 0.2s ease",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#13686a";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e1e5e9";
              }}
            />
          </div>

          <div className="form-field">
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}
            >
              Notes
            </label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes internes"
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: 8,
                border: "2px solid #e1e5e9",
                fontSize: "1rem",
                transition: "border-color 0.2s ease",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#13686a";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e1e5e9";
              }}
            />
          </div>

          <div
            className="totals-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "1rem",
              gridColumn: "1 / -1",
              marginTop: "1rem",
            }}
          >
            <div className="total-field">
              <label
                style={{
                  display: "block",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                }}
              >
                Total HT
              </label>
              <input
                type="number"
                step="0.01"
                value={
                  selectedItems.length > 0
                    ? calculatedTotals.totalHT.toFixed(2)
                    : totalHT
                }
                onChange={(e) => setTotalHT(e.target.value)}
                placeholder="0.00"
                disabled={selectedItems.length > 0}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: 8,
                  border: "2px solid #e1e5e9",
                  fontSize: "1rem",
                  transition: "border-color 0.2s ease",
                  boxSizing: "border-box",
                  background: selectedItems.length > 0 ? "#f9fafb" : "white",
                  color: selectedItems.length > 0 ? "#6b7280" : "inherit",
                  cursor: selectedItems.length > 0 ? "not-allowed" : "text",
                }}
                onFocus={(e) => {
                  if (selectedItems.length === 0) {
                    e.target.style.borderColor = "#13686a";
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e1e5e9";
                }}
              />
              {selectedItems.length > 0 && (
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#6b7280",
                    marginTop: "0.25rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  {isCalculatingTotals ? (
                    <>
                      <i
                        className="fas fa-spinner fa-spin"
                        style={{ fontSize: "0.7rem" }}
                      ></i>
                      <span>Calcul en cours...</span>
                    </>
                  ) : (
                    <span>
                      Calculé automatiquement à partir des articles sélectionnés
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="total-field">
              <label
                style={{
                  display: "block",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                }}
              >
                Total TTC
              </label>
              <input
                type="number"
                step="0.01"
                value={
                  selectedItems.length > 0
                    ? calculatedTotals.totalTTC.toFixed(2)
                    : totalTTC
                }
                onChange={(e) => setTotalTTC(e.target.value)}
                placeholder="0.00"
                disabled={selectedItems.length > 0}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: 8,
                  border: "2px solid #e1e5e9",
                  fontSize: "1rem",
                  transition: "border-color 0.2s ease",
                  boxSizing: "border-box",
                  background: selectedItems.length > 0 ? "#f9fafb" : "white",
                  color: selectedItems.length > 0 ? "#6b7280" : "inherit",
                  cursor: selectedItems.length > 0 ? "not-allowed" : "text",
                }}
                onFocus={(e) => {
                  if (selectedItems.length === 0) {
                    e.target.style.borderColor = "#13686a";
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e1e5e9";
                }}
              />
              {selectedItems.length > 0 && (
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#6b7280",
                    marginTop: "0.25rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  {isCalculatingTotals ? (
                    <>
                      <i
                        className="fas fa-spinner fa-spin"
                        style={{ fontSize: "0.7rem" }}
                      ></i>
                      <span>Calcul en cours...</span>
                    </>
                  ) : (
                    <span>
                      Calculé automatiquement à partir des articles sélectionnés
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CreateCreditNoteModal;
