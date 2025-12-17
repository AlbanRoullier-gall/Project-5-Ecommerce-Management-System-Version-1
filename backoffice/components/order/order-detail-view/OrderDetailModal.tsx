import React, { useState } from "react";
import { OrderPublicDTO } from "dto";
import { Button, Modal, ItemDisplayTable } from "../../shared";
import { CreateCreditNoteModal } from "../credit-note-view";
import { BaseItemDTO } from "@tfe/shared-types/common/BaseItemDTO";
import { useOrderDetail } from "../../../hooks";
import { exportOrderInvoice } from "../../../services/orderService";
import styles from "../../../styles/components/OrderDetailSections.module.css";

interface OrderDetailModalProps {
  isOpen: boolean;
  order: OrderPublicDTO | null;
  isLoading?: boolean;
  error?: string | null;
  onClose: () => void;
}

/**
 * Composant d'affichage du détail d'une commande
 * Toute la logique métier est gérée par le hook useOrderDetail
 */
const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  isOpen,
  order,
  isLoading = false,
  error = null,
  onClose,
}) => {
  const [isCreateCreditNoteOpen, setIsCreateCreditNoteOpen] = useState(false);
  const [isExportingInvoice, setIsExportingInvoice] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const {
    items,
    itemsLoading,
    itemsError,
    addresses,
    addressesLoading,
    addressesError,
  } = useOrderDetail(order?.id || null);

  const customerName = (() => {
    if (!order) return "";
    const first = order.customerFirstName || "";
    const last = order.customerLastName || "";
    return `${first} ${last}`.trim();
  })();

  const handleExportInvoice = async () => {
    if (!order) return;

    setIsExportingInvoice(true);
    setExportError(null);

    try {
      const blob = await exportOrderInvoice(order.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `facture-commande-${order.id}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Erreur lors de l'export de la facture:", err);
      setExportError(err.message || "Erreur lors de l'export de la facture");
    } finally {
      setIsExportingInvoice(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        title={
          order ? `Détail de la commande #${order.id}` : "Détail de la commande"
        }
        onClose={onClose}
        headerActions={
          <>
            <Button
              variant="secondary"
              icon="fas fa-file-pdf"
              onClick={handleExportInvoice}
              disabled={!order || isExportingInvoice}
            >
              {isExportingInvoice ? "Export..." : "Exporter la facture"}
            </Button>
            <Button
              variant="primary"
              icon="fas fa-file-invoice-dollar"
              onClick={() => setIsCreateCreditNoteOpen(true)}
              disabled={!order}
            >
              Créer un avoir
            </Button>
          </>
        }
      >
        {isLoading && (
          <div className={styles.loadingText}>Chargement du détail…</div>
        )}

        {!isLoading && error && <div className={styles.errorBox}>{error}</div>}

        {exportError && (
          <div className={`${styles.errorBox} ${styles.errorSpacer}`}>
            {exportError}
          </div>
        )}

        {!isLoading && !error && order && (
          <div className={styles.contentGridTight}>
            {/* Informations principales */}
            <div className={styles.mainInfoGrid}>
              <div className={styles.mainCard}>
                <div className={styles.cardLabel}>Client</div>
                {customerName && (
                  <div className={styles.cardValue}>{customerName}</div>
                )}
                {order.customerEmail && (
                  <div className={styles.cardValueMuted}>
                    {order.customerEmail}
                  </div>
                )}
                {order.customerPhoneNumber && (
                  <div className={styles.cardValueMuted}>
                    {order.customerPhoneNumber}
                  </div>
                )}
              </div>

              <div className={styles.mainCard}>
                <div className={styles.cardLabel}>Paiement</div>
                <div className={styles.cardValue}>
                  {order.paymentMethod || "—"}
                </div>
              </div>
            </div>

            {/* Adresses */}
            <div className={styles.addressesSection}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>
                  Adresses de la commande
                </div>
                {addressesLoading && (
                  <div className={styles.loadingText}>Chargement…</div>
                )}
              </div>

              {addressesError && (
                <div className={styles.errorAlert}>{addressesError}</div>
              )}

              {!addressesLoading && !addressesError && (
                <div className={styles.addressesGrid}>
                  {addresses.length === 0 && (
                    <div className={styles.addressEmpty}>Aucune adresse</div>
                  )}
                  {addresses.map((addr) => (
                    <div key={addr.id} className={styles.addressCard}>
                      <div className={styles.addressTitle}>
                        {addr.addressType === "shipping"
                          ? "Livraison"
                          : "Facturation"}
                      </div>
                      <div className={styles.addressName}>
                        {addr.firstName} {addr.lastName}
                      </div>
                      <div className={styles.addressLine}>{addr.address}</div>
                      <div className={styles.addressLine}>
                        {addr.postalCode} {addr.city}
                      </div>
                      <div className={styles.addressLine}>
                        {addr.countryName}
                      </div>
                      {addr.phone && (
                        <div className={styles.addressPhone}>{addr.phone}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Items */}
            <div className={styles.itemsSection}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>
                  Articles de la commande
                </div>
                {itemsLoading && (
                  <div className={styles.loadingText}>Chargement…</div>
                )}
              </div>

              {itemsError && (
                <div className={styles.errorAlert}>{itemsError}</div>
              )}

              {!itemsLoading && !itemsError && (
                <ItemDisplayTable
                  items={items as BaseItemDTO[]}
                  variant="order"
                  showDescription={false}
                  showImage={false}
                />
              )}
            </div>

            {/* Créée le */}
            <div className={styles.createdSection}>
              <div className={styles.createdText}>
                <strong>Créée le :</strong>{" "}
                {order.createdAt
                  ? new Date(order.createdAt as any).toLocaleString("fr-FR")
                  : "—"}
              </div>
            </div>

            {/* Montants */}
            <div className={styles.totalsSection}>
              <div className={styles.totalsTitle}>Montants</div>
              <div className={styles.amountsGrid}>
                <div className={styles.amountCard}>
                  <div className={styles.amountLabel}>Total HT</div>
                  <div className={styles.amountValue}>
                    {Number(order.totalAmountHT || 0).toFixed(2)} €
                  </div>
                </div>
                <div className={styles.amountCard}>
                  <div className={styles.amountLabel}>Total TTC</div>
                  <div className={styles.amountValue}>
                    {Number(order.totalAmountTTC || 0).toFixed(2)} €
                  </div>
                </div>
                <div className={styles.amountCard}>
                  <div className={styles.amountLabel}>TVA</div>
                  <div className={styles.amountValue}>
                    {Number(order.totalVAT || 0).toFixed(2)} €
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
      {/* Create Credit Note Modal */}
      <CreateCreditNoteModal
        isOpen={isCreateCreditNoteOpen}
        order={order}
        onClose={() => setIsCreateCreditNoteOpen(false)}
        onCreated={() => {
          setIsCreateCreditNoteOpen(false);
        }}
      />
    </>
  );
};

export default OrderDetailModal;
