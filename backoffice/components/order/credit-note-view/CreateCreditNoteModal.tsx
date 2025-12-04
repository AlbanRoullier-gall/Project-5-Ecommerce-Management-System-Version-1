import React from "react";
import { Button, Modal, ErrorAlert, ItemDisplayTable } from "../../shared";
import { BaseItemDTO } from "@tfe/shared-types/common/BaseItemDTO";
import {
  OrderPublicDTO,
  CreditNotePublicDTO,
  OrderItemPublicDTO,
} from "../../../dto";
import { useCreateCreditNote } from "../../../hooks";

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
  const {
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
  } = useCreateCreditNote({ order, orders, isOpen });

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  const onSubmit = async () => {
    await handleSubmit((created) => {
      onCreated(created);
      onClose();
    });
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
            onClick={onSubmit}
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
                onSelectionChange={handleSelectionChange}
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
