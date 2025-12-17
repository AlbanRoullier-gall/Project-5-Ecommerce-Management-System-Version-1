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
        maxWidth="900px"
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
          <div style={{ color: "#6b7280" }}>Chargement du détail…</div>
        )}

        {!isLoading && error && (
          <div
            style={{
              background: "#FEF2F2",
              color: "#B91C1C",
              border: "1px solid #FECACA",
              padding: "0.75rem 1rem",
              borderRadius: 12,
            }}
          >
            {error}
          </div>
        )}

        {exportError && (
          <div
            style={{
              background: "#FEF2F2",
              color: "#B91C1C",
              border: "1px solid #FECACA",
              padding: "0.75rem 1rem",
              borderRadius: 12,
              marginBottom: "1rem",
            }}
          >
            {exportError}
          </div>
        )}

        {!isLoading && !error && order && (
          <div
            className="order-detail-content"
            style={{ display: "grid", gap: "1rem" }}
          >
            {/* Informations principales */}
            <div
              className="order-main-info"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: "0.75rem",
                }}
              >
                <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                  Client
                </div>
                {customerName && (
                  <div style={{ fontSize: "1.05rem", color: "#111827" }}>
                    {customerName}
                  </div>
                )}
                {order.customerEmail && (
                  <div style={{ fontSize: "0.95rem", color: "#6b7280" }}>
                    {order.customerEmail}
                  </div>
                )}
                {order.customerPhoneNumber && (
                  <div style={{ fontSize: "0.95rem", color: "#6b7280" }}>
                    {order.customerPhoneNumber}
                  </div>
                )}
              </div>

              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: "0.75rem",
                }}
              >
                <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                  Paiement
                </div>
                <div style={{ fontSize: "1.05rem", color: "#111827" }}>
                  {order.paymentMethod || "—"}
                </div>
              </div>
            </div>

            {/* Adresses */}
            <div
              className="order-addresses-section"
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "0.75rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "0.75rem",
                }}
              >
                <div
                  style={{
                    fontSize: "1rem",
                    color: "#111827",
                    fontWeight: 600,
                  }}
                >
                  Adresses de la commande
                </div>
                {addressesLoading && (
                  <div style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                    Chargement…
                  </div>
                )}
              </div>

              {addressesError && (
                <div
                  style={{
                    background: "#FEF2F2",
                    color: "#B91C1C",
                    border: "1px solid #FECACA",
                    padding: "0.5rem 0.75rem",
                    borderRadius: 10,
                    marginBottom: "0.75rem",
                  }}
                >
                  {addressesError}
                </div>
              )}

              {!addressesLoading && !addressesError && (
                <div
                  className="addresses-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  {addresses.length === 0 && (
                    <div
                      style={{
                        color: "#6b7280",
                        gridColumn: "1 / -1",
                        textAlign: "center",
                        padding: "1rem",
                      }}
                    >
                      Aucune adresse
                    </div>
                  )}
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="address-card"
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 8,
                        padding: "0.75rem",
                        background: "#f9fafb",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 600,
                          color: "#111827",
                          marginBottom: "0.5rem",
                          fontSize: "0.9rem",
                        }}
                      >
                        {addr.addressType === "shipping"
                          ? "Livraison"
                          : "Facturation"}
                      </div>
                      <div
                        style={{
                          color: "#111827",
                          marginBottom: "0.25rem",
                          fontSize: "0.85rem",
                        }}
                      >
                        {addr.firstName} {addr.lastName}
                      </div>
                      <div
                        style={{
                          color: "#6b7280",
                          marginBottom: "0.25rem",
                          fontSize: "0.8rem",
                        }}
                      >
                        {addr.address}
                      </div>
                      <div
                        style={{
                          color: "#6b7280",
                          marginBottom: "0.25rem",
                          fontSize: "0.8rem",
                        }}
                      >
                        {addr.postalCode} {addr.city}
                      </div>
                      <div
                        style={{
                          color: "#6b7280",
                          marginBottom: "0.25rem",
                          fontSize: "0.8rem",
                        }}
                      >
                        {addr.countryName}
                      </div>
                      {addr.phone && (
                        <div style={{ color: "#6b7280", fontSize: "0.8rem" }}>
                          {addr.phone}
                        </div>
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
