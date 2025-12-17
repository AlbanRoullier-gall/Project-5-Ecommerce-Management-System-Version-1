import React from "react";
import { Button, Modal, ErrorAlert, ItemDisplayTable } from "../../shared";
import { BaseItemDTO } from "@tfe/shared-types/common/BaseItemDTO";
import { OrderPublicDTO, CreditNotePublicDTO, OrderItemPublicDTO } from "dto";
import { useCreateCreditNote } from "../../../hooks";
import styles from "../../../styles/components/CreateCreditNoteModal.module.css";

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

      <div className={styles.creditNoteForm}>
        {selectedOrder ? (
          <div className={styles.orderSelect}>Commande #{selectedOrder.id}</div>
        ) : (
          <div>
            <label className={styles.label}>Sélectionner une commande</label>
            <select
              className={styles.select}
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
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
          <div className={styles.orderCard}>
            <div className={styles.orderCardHeader}>
              <div className={styles.orderCardTitle}>
                Articles de la commande
              </div>
              {itemsLoading && (
                <div className={styles.loadingText}>Chargement…</div>
              )}
            </div>

            {itemsError && (
              <div className={styles.itemsError}>{itemsError}</div>
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

        <div className={styles.formFields}>
          <div className={styles.formField}>
            <label className={styles.label}>Motif</label>
            <input
              className={styles.input}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Retour produit, geste commercial..."
            />
          </div>

          <div className={styles.formField}>
            <label className={styles.label}>Date d'émission</label>
            <input
              type="date"
              className={`${styles.input} ${styles.inputDisabled}`}
              value={issueDate}
              disabled
            />
          </div>

          <div className={`${styles.formField} ${styles.formFieldFull}`}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Détails supplémentaires"
              rows={3}
            />
          </div>

          <div className={styles.formField}>
            <label className={styles.label}>Paiement</label>
            <input
              className={styles.input}
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              placeholder="Ex: carte, virement"
            />
          </div>

          <div className={styles.formField}>
            <label className={styles.label}>Notes</label>
            <input
              className={styles.input}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes internes"
            />
          </div>

          <div className={styles.totalsGrid}>
            <div className={styles.totalField}>
              <label className={styles.label}>Total HT</label>
              <input
                type="number"
                step="0.01"
                className={`${styles.input} ${
                  selectedItems.length > 0 ? styles.inputDisabled : ""
                }`}
                value={
                  selectedItems.length > 0
                    ? calculatedTotals.totalHT.toFixed(2)
                    : totalHT
                }
                onChange={(e) => setTotalHT(e.target.value)}
                placeholder="0.00"
                disabled={selectedItems.length > 0}
              />
              {selectedItems.length > 0 && (
                <div className={styles.helperText}>
                  {isCalculatingTotals ? (
                    <>
                      <i
                        className={`fas fa-spinner fa-spin ${styles.helperIcon}`}
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
            <div className={styles.totalField}>
              <label className={styles.label}>Total TTC</label>
              <input
                type="number"
                step="0.01"
                className={`${styles.input} ${
                  selectedItems.length > 0 ? styles.inputDisabled : ""
                }`}
                value={
                  selectedItems.length > 0
                    ? calculatedTotals.totalTTC.toFixed(2)
                    : totalTTC
                }
                onChange={(e) => setTotalTTC(e.target.value)}
                placeholder="0.00"
                disabled={selectedItems.length > 0}
              />
              {selectedItems.length > 0 && (
                <div className={styles.helperText}>
                  {isCalculatingTotals ? (
                    <>
                      <i
                        className={`fas fa-spinner fa-spin ${styles.helperIcon}`}
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
