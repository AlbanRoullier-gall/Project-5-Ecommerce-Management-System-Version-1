import React from "react";
import { Button, Modal, ItemDisplayTable } from "../../shared";
import { CreditNotePublicDTO, OrderPublicDTO } from "dto";
import { BaseItemDTO } from "@tfe/shared-types/common/BaseItemDTO";
import { useCreditNoteDetail } from "../../../hooks";
import styles from "../../../styles/components/OrderDetailSections.module.css";

interface CreditNoteDetailModalProps {
  isOpen: boolean;
  creditNote: CreditNotePublicDTO | null;
  order: OrderPublicDTO | null;
  onClose: () => void;
  onDelete?: (creditNoteId: number) => void;
}

/**
 * Composant d'affichage du détail d'un avoir
 * Toute la logique métier est gérée par le hook useCreditNoteDetail
 */
const CreditNoteDetailModal: React.FC<CreditNoteDetailModalProps> = ({
  isOpen,
  creditNote,
  order,
  onClose,
  onDelete,
}) => {
  const { items, itemsLoading, itemsError } = useCreditNoteDetail(
    creditNote?.id || null
  );

  if (!isOpen || !creditNote) return null;

  const customerName = (() => {
    if (!order) return `Client #${creditNote.customerId}`;
    const first = order.customerFirstName || "";
    const last = order.customerLastName || "";
    return (
      `${first} ${last}`.trim() ||
      order.customerEmail ||
      `Client #${creditNote.customerId}`
    );
  })();

  const emitted = creditNote.issueDate
    ? new Date(creditNote.issueDate as any).toLocaleDateString()
    : creditNote.createdAt
    ? new Date(creditNote.createdAt as any).toLocaleDateString()
    : "—";

  return (
    <Modal
      isOpen={isOpen}
      title={`Détail de l'avoir #${creditNote.id}`}
      onClose={onClose}
      maxWidth="900px"
      headerActions={
        <>
          {onDelete && (
            <Button
              variant="danger"
              icon="fas fa-trash"
              onClick={() => onDelete(creditNote.id)}
            >
              Supprimer
            </Button>
          )}
        </>
      }
    >
      <div className={styles.contentGrid}>
        {/* Informations principales */}
        <div className={styles.infoSection}>
          <h4 className={styles.totalsTitle}>Informations générales</h4>
          <div className={styles.infoGrid}>
            <div>
              <div className={styles.amountLabel}>Client</div>
              <div className={styles.amountValue}>{customerName}</div>
            </div>

            <div>
              <div className={styles.amountLabel}>Commande associée</div>
              <div className={styles.amountValue}>#{creditNote.orderId}</div>
            </div>

            <div>
              <div className={styles.amountLabel}>Date d'émission</div>
              <div className={styles.amountValue}>{emitted}</div>
            </div>

            <div>
              <div className={styles.amountLabel}>Méthode de paiement</div>
              <div className={styles.amountValue}>
                {creditNote.paymentMethod || "—"}
              </div>
            </div>
          </div>
        </div>

        {/* Détails de l'avoir */}
        <div className={styles.infoSection}>
          <h4 className={styles.totalsTitle}>Détails de l'avoir</h4>
          <div className={styles.contentGrid}>
            <div>
              <div className={styles.amountLabel}>Motif</div>
              <div className={styles.amountValue}>{creditNote.reason}</div>
            </div>

            {creditNote.description && (
              <div>
                <div className={styles.amountLabel}>Description</div>
                <div className={styles.sectionTitle}>
                  {creditNote.description}
                </div>
              </div>
            )}

            {creditNote.notes && (
              <div>
                <div className={styles.amountLabel}>Notes internes</div>
                <div className={styles.sectionTitle}>{creditNote.notes}</div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>Articles de l'avoir</div>
            {itemsLoading && (
              <div className={styles.loadingText}>Chargement…</div>
            )}
          </div>

          {itemsError && <div className={styles.errorAlert}>{itemsError}</div>}

          {!itemsLoading && !itemsError && (
            <ItemDisplayTable
              items={
                items.map((it) => ({
                  productId: it.productId,
                  productName: it.productName,
                  description: null,
                  imageUrl: null,
                  quantity: it.quantity,
                  vatRate: 21, // Valeur par défaut pour les avoirs
                  unitPriceHT: it.unitPriceHT,
                  unitPriceTTC: it.unitPriceTTC,
                  totalPriceHT: it.totalPriceHT,
                  totalPriceTTC: it.totalPriceTTC,
                  createdAt: it.createdAt,
                })) as BaseItemDTO[]
              }
              variant="credit-note"
              showDescription={false}
              showImage={false}
              columns={{
                product: true,
                quantity: true,
                unitPriceHT: true,
                vatRate: false,
                totalPriceHT: true,
                totalPriceTTC: true,
              }}
            />
          )}
        </div>

        {/* Date de commande */}
        {order && (
          <div className={styles.dateCard}>
            <div>
              <div className={styles.dateLabel}>Date de commande</div>
              <div className={styles.dateValue}>
                {order.createdAt
                  ? new Date(order.createdAt as any).toLocaleDateString()
                  : "—"}
              </div>
            </div>
          </div>
        )}

        {/* Totaux */}
        <div className={styles.totalsSectionGradient}>
          <h4 className={styles.totalsTitle}>Montants</h4>
          <div className={styles.amountsGrid}>
            <div className={styles.amountCard}>
              <div className={styles.amountLabel}>Total HT</div>
              <div className={styles.amountValue}>
                {Number(Number(creditNote.totalAmountHT) || 0).toFixed(2)} €
              </div>
            </div>
            <div className={styles.amountCard}>
              <div className={styles.amountLabel}>Total TTC</div>
              <div className={styles.amountValue}>
                {Number(Number(creditNote.totalAmountTTC) || 0).toFixed(2)} €
              </div>
            </div>
            <div className={styles.amountCard}>
              <div className={styles.amountLabel}>TVA</div>
              <div className={styles.amountValue}>
                {Number(creditNote.totalVAT || 0).toFixed(2)} €
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CreditNoteDetailModal;
