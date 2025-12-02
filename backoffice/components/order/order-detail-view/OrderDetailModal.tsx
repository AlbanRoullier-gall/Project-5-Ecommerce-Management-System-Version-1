import React, { useEffect, useState } from "react";
import {
  OrderPublicDTO,
  OrderItemPublicDTO,
  OrderAddressPublicDTO,
} from "../../../dto";
import { Button, Modal, ItemDisplayTable } from "../../shared";
import { formatAmount } from "../../shared/utils/formatPrice";
import { CreateCreditNoteModal } from "../credit-note-view";
import { BaseItemDTO } from "@tfe/shared-types/common/BaseItemDTO";
import { useAuth } from "../../../contexts/AuthContext";

interface OrderDetailModalProps {
  isOpen: boolean;
  order: OrderPublicDTO | null;
  isLoading?: boolean;
  error?: string | null;
  onClose: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  isOpen,
  order,
  isLoading = false,
  error = null,
  onClose,
}) => {
  const { apiCall } = useAuth();
  const [items, setItems] = useState<OrderItemPublicDTO[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<OrderAddressPublicDTO[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressesError, setAddressesError] = useState<string | null>(null);
  const [isCreateCreditNoteOpen, setIsCreateCreditNoteOpen] = useState(false);

  useEffect(() => {
    const loadItems = async () => {
      if (!order?.id) return;
      setItems([]);
      setItemsError(null);
      setItemsLoading(true);
      try {
        // Admin path proxied to service items list
        const json = await apiCall<{
          data?: { orderItems?: OrderItemPublicDTO[] };
          orderItems?: OrderItemPublicDTO[];
        }>({
          url: `/api/admin/orders/${order.id}/items`,
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
        setItems(list);
      } catch (e) {
        setItemsError(
          e instanceof Error ? e.message : "Erreur chargement des articles"
        );
      } finally {
        setItemsLoading(false);
      }
    };

    loadItems();
  }, [order?.id, apiCall]);

  useEffect(() => {
    const loadAddresses = async () => {
      if (!order?.id) return;
      setAddresses([]);
      setAddressesError(null);
      setAddressesLoading(true);
      try {
        const json = await apiCall<{
          data?: { orderAddresses?: OrderAddressPublicDTO[] };
          orderAddresses?: OrderAddressPublicDTO[];
        }>({
          url: `/api/admin/orders/${order.id}/addresses`,
          method: "GET",
          requireAuth: true,
        });
        // Format standardisé : { data: { orderAddresses: [], count } }, ... }
        if (!json.data || !Array.isArray(json.data.orderAddresses)) {
          throw new Error(
            "Format de réponse invalide pour les adresses de commande"
          );
        }
        const list: OrderAddressPublicDTO[] = json.data.orderAddresses;
        setAddresses(list);
      } catch (e) {
        setAddressesError(
          e instanceof Error ? e.message : "Erreur chargement des adresses"
        );
      } finally {
        setAddressesLoading(false);
      }
    };

    loadAddresses();
  }, [order?.id, apiCall]);

  const customerName = (() => {
    if (!order) return "";
    const first =
      (order as any).customerFirstName ||
      (order as any).customerSnapshot?.firstName ||
      (order as any).customerSnapshot?.first_name ||
      "";
    const last =
      (order as any).customerLastName ||
      (order as any).customerSnapshot?.lastName ||
      (order as any).customerSnapshot?.last_name ||
      "";
    return `${first} ${last}`.trim();
  })();

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
          <Button
            variant="primary"
            icon="fas fa-file-invoice-dollar"
            onClick={() => setIsCreateCreditNoteOpen(true)}
            disabled={!order}
          >
            Créer un avoir
          </Button>
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
                {(order.customerEmail ||
                  (order as any)?.customerSnapshot?.email) && (
                  <div style={{ fontSize: "0.95rem", color: "#6b7280" }}>
                    {order.customerEmail ||
                      (order as any).customerSnapshot.email}
                  </div>
                )}
                {((order as any)?.customerSnapshot?.phoneNumber ||
                  (order as any)?.customerSnapshot?.phone) && (
                  <div style={{ fontSize: "0.95rem", color: "#6b7280" }}>
                    {(order as any).customerSnapshot.phoneNumber ||
                      (order as any).customerSnapshot.phone}
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
                        {addr.addressSnapshot.firstName}{" "}
                        {addr.addressSnapshot.lastName}
                      </div>
                      <div
                        style={{
                          color: "#6b7280",
                          marginBottom: "0.25rem",
                          fontSize: "0.8rem",
                        }}
                      >
                        {addr.addressSnapshot.address}
                      </div>
                      <div
                        style={{
                          color: "#6b7280",
                          marginBottom: "0.25rem",
                          fontSize: "0.8rem",
                        }}
                      >
                        {addr.addressSnapshot.postalCode}{" "}
                        {addr.addressSnapshot.city}
                      </div>
                      <div
                        style={{
                          color: "#6b7280",
                          marginBottom: "0.25rem",
                          fontSize: "0.8rem",
                        }}
                      >
                        {addr.addressSnapshot.country}
                      </div>
                      {addr.addressSnapshot.phone && (
                        <div style={{ color: "#6b7280", fontSize: "0.8rem" }}>
                          {addr.addressSnapshot.phone}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Items */}
            <div
              className="order-items-section"
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
                    marginBottom: "0.75rem",
                  }}
                >
                  {itemsError}
                </div>
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
            <div
              className="order-created-section"
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "1rem",
                background: "#f9fafb",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  fontSize: "0.9rem",
                  color: "#6b7280",
                  textAlign: "center",
                }}
              >
                <strong>Créée le :</strong>{" "}
                {order.createdAt
                  ? new Date(order.createdAt as any).toLocaleString("fr-FR")
                  : "—"}
              </div>
            </div>

            {/* Montants */}
            <div
              className="order-totals-section"
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "1rem",
                background: "#f9fafb",
              }}
            >
              <div
                style={{
                  fontSize: "1rem",
                  color: "#111827",
                  fontWeight: "600",
                  marginBottom: "1rem",
                }}
              >
                Montants
              </div>
              <div
                className="amounts-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    textAlign: "center",
                    padding: "0.75rem",
                    background: "white",
                    borderRadius: 8,
                    border: "1px solid #e1e5e9",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#6b7280",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Total HT
                  </div>
                  <div
                    style={{
                      fontSize: "1.25rem",
                      color: "#13686a",
                      fontWeight: "700",
                    }}
                  >
                    {formatAmount(order.totalAmountHT || 0)}
                  </div>
                </div>
                <div
                  style={{
                    textAlign: "center",
                    padding: "0.75rem",
                    background: "white",
                    borderRadius: 8,
                    border: "1px solid #e1e5e9",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#6b7280",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Total TTC
                  </div>
                  <div
                    style={{
                      fontSize: "1.25rem",
                      color: "#13686a",
                      fontWeight: "700",
                    }}
                  >
                    {formatAmount(order.totalAmountTTC || 0)}
                  </div>
                </div>
                <div
                  style={{
                    textAlign: "center",
                    padding: "0.75rem",
                    background: "white",
                    borderRadius: 8,
                    border: "1px solid #e1e5e9",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#6b7280",
                      marginBottom: "0.25rem",
                    }}
                  >
                    TVA
                  </div>
                  <div
                    style={{
                      fontSize: "1.25rem",
                      color: "#13686a",
                      fontWeight: "700",
                    }}
                  >
                    {formatAmount(
                      (order.totalAmountTTC || 0) - (order.totalAmountHT || 0)
                    )}
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
          // No-op: parent page will reload the credit notes list
          setIsCreateCreditNoteOpen(false);
        }}
      />
    </>
  );
};

export default OrderDetailModal;
