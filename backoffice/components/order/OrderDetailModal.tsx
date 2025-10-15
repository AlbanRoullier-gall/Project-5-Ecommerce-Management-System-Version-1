import React, { useEffect, useState } from "react";
import {
  OrderPublicDTO,
  OrderItemPublicDTO,
  OrderAddressPublicDTO,
} from "../../dto";
import Button from "../product/ui/Button";
import CreateCreditNoteModal from "./CreateCreditNoteModal";

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
  if (!isOpen) return null;
  const [items, setItems] = useState<OrderItemPublicDTO[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<OrderAddressPublicDTO[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressesError, setAddressesError] = useState<string | null>(null);
  const [isCreateCreditNoteOpen, setIsCreateCreditNoteOpen] = useState(false);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";
    const getAuthToken = () => localStorage.getItem("auth_token");
    const loadItems = async () => {
      if (!order?.id) return;
      setItems([]);
      setItemsError(null);
      setItemsLoading(true);
      try {
        const token = getAuthToken();
        if (!token) throw new Error("Non authentifié");
        // Admin path proxied to service items list
        const res = await fetch(
          `${API_URL}/api/admin/orders/${order.id}/items`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Erreur chargement des articles");
        const json = await res.json();
        const list: OrderItemPublicDTO[] =
          json?.data?.orderItems || json?.orderItems || [];
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
  }, [order?.id]);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";
    const getAuthToken = () => localStorage.getItem("auth_token");
    const loadAddresses = async () => {
      if (!order?.id) return;
      setAddresses([]);
      setAddressesError(null);
      setAddressesLoading(true);
      try {
        const token = getAuthToken();
        if (!token) throw new Error("Non authentifié");
        const res = await fetch(
          `${API_URL}/api/admin/orders/${order.id}/addresses`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Erreur chargement des adresses");
        const json = await res.json();
        const list: OrderAddressPublicDTO[] =
          json?.data?.orderAddresses || json?.orderAddresses || [];
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
  }, [order?.id]);

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

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{
          width: "100%",
          maxWidth: 860,
          background: "white",
          borderRadius: 16,
          border: "2px solid rgba(19, 104, 106, 0.1)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1.25rem 1.5rem",
            background: "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "1.35rem",
              color: "white",
              fontWeight: 700,
            }}
          >
            Détail de la commande {order ? `#${order.id}` : ""}
          </h3>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button
              variant="primary"
              icon="fas fa-file-invoice-dollar"
              onClick={() => setIsCreateCreditNoteOpen(true)}
              disabled={!order}
            >
              Créer un avoir
            </Button>
            <Button variant="gold" onClick={onClose} icon="fas fa-times">
              Fermer
            </Button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "1.5rem" }}>
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
            <div style={{ display: "grid", gap: "1rem" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: "1rem",
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
                    borderRadius: 12,
                    padding: "1rem",
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

              {/* Client compact affiché une seule fois ci-dessus, bloc doublon supprimé */}
              {/* Adresses */}
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: "1rem",
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
                  <div style={{ display: "grid", gap: "0.75rem" }}>
                    {addresses.length === 0 && (
                      <div style={{ color: "#6b7280" }}>Aucune adresse</div>
                    )}
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        style={{
                          border: "1px solid #e5e7eb",
                          borderRadius: 10,
                          padding: "0.75rem 1rem",
                        }}
                      >
                        <div style={{ fontWeight: 600, color: "#111827" }}>
                          {addr.addressType === "shipping"
                            ? "Livraison"
                            : "Facturation"}
                        </div>
                        <div style={{ color: "#111827" }}>
                          {addr.addressSnapshot.firstName}{" "}
                          {addr.addressSnapshot.lastName}
                        </div>
                        {addr.addressSnapshot.company && (
                          <div style={{ color: "#6b7280" }}>
                            {addr.addressSnapshot.company}
                          </div>
                        )}
                        <div style={{ color: "#6b7280" }}>
                          {addr.addressSnapshot.address}
                        </div>
                        <div style={{ color: "#6b7280" }}>
                          {addr.addressSnapshot.postalCode}{" "}
                          {addr.addressSnapshot.city}
                        </div>
                        <div style={{ color: "#6b7280" }}>
                          {addr.addressSnapshot.country}
                        </div>
                        {addr.addressSnapshot.phone && (
                          <div style={{ color: "#6b7280" }}>
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
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: "1rem",
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
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "separate",
                        borderSpacing: 0,
                        fontSize: "1rem",
                      }}
                    >
                      <thead
                        style={{
                          background:
                            "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
                          color: "white",
                        }}
                      >
                        <tr>
                          <th
                            style={{
                              textAlign: "left",
                              padding: "1rem 1.25rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Produit
                          </th>
                          <th
                            style={{
                              textAlign: "right",
                              padding: "1rem 1.25rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Qté
                          </th>
                          <th
                            style={{
                              textAlign: "right",
                              padding: "1rem 1.25rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Prix unit. HT
                          </th>
                          <th
                            style={{
                              textAlign: "right",
                              padding: "1rem 1.25rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            TVA
                          </th>
                          <th
                            style={{
                              textAlign: "right",
                              padding: "1rem 1.25rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Total HT
                          </th>
                          <th
                            style={{
                              textAlign: "right",
                              padding: "1rem 1.25rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Total TTC
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.length === 0 && (
                          <tr>
                            <td
                              colSpan={6}
                              style={{
                                padding: "0.75rem",
                                textAlign: "center",
                                color: "#6b7280",
                              }}
                            >
                              Aucun article
                            </td>
                          </tr>
                        )}
                        {items.map((it) => (
                          <tr
                            key={it.id}
                            style={{ borderTop: "1px solid #f3f4f6" }}
                          >
                            <td
                              style={{
                                padding: "0.5rem 0.75rem",
                                color: "#111827",
                              }}
                            >
                              {it.productName || `Produit #${it.productId}`}
                            </td>
                            <td
                              style={{
                                padding: "0.5rem 0.75rem",
                                textAlign: "right",
                              }}
                            >
                              {it.quantity}
                            </td>
                            <td
                              style={{
                                padding: "0.5rem 0.75rem",
                                textAlign: "right",
                              }}
                            >
                              {(Number(it.unitPriceHT) || 0).toFixed(2)} €
                            </td>
                            <td
                              style={{
                                padding: "0.5rem 0.75rem",
                                textAlign: "right",
                              }}
                            >
                              {(Number(it.vatRate) || 0).toFixed(0)}%
                            </td>
                            <td
                              style={{
                                padding: "0.5rem 0.75rem",
                                textAlign: "right",
                              }}
                            >
                              {(Number(it.totalPriceHT) || 0).toFixed(2)} €
                            </td>
                            <td
                              style={{
                                padding: "0.5rem 0.75rem",
                                textAlign: "right",
                              }}
                            >
                              {(Number(it.totalPriceTTC) || 0).toFixed(2)} €
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: "1rem",
                  }}
                >
                  <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                    Total HT
                  </div>
                  <div
                    style={{
                      fontSize: "1.05rem",
                      color: "#13686a",
                      fontWeight: 600,
                    }}
                  >
                    {(Number(order.totalAmountHT) || 0).toFixed(2)} €
                  </div>
                </div>
                <div
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: "1rem",
                  }}
                >
                  <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                    Total TTC
                  </div>
                  <div
                    style={{
                      fontSize: "1.05rem",
                      color: "#13686a",
                      fontWeight: 600,
                    }}
                  >
                    {(Number(order.totalAmountTTC) || 0).toFixed(2)} €
                  </div>
                </div>
                <div
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: "1rem",
                  }}
                >
                  <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                    Créée le
                  </div>
                  <div style={{ fontSize: "1.05rem", color: "#111827" }}>
                    {new Date(order.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Create Credit Note Modal */}
      <CreateCreditNoteModal
        isOpen={isCreateCreditNoteOpen}
        order={order}
        onClose={() => setIsCreateCreditNoteOpen(false)}
        onCreated={() => {
          // No-op: parent page will refresh the credit notes list
          setIsCreateCreditNoteOpen(false);
        }}
      />
    </div>
  );
};

export default OrderDetailModal;
