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
        padding: "0.5rem",
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="order-detail-modal"
        style={{
          width: "100%",
          maxWidth: "min(98vw, 900px)",
          maxHeight: "98vh",
          background: "white",
          borderRadius: 8,
          border: "2px solid rgba(19, 104, 106, 0.1)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          className="modal-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1rem",
            background: "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
            borderBottom: "1px solid #e5e7eb",
            flexWrap: "wrap",
            gap: "0.75rem",
            minHeight: "60px",
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
          <div
            className="modal-header-actions"
            style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
          >
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
        <div
          className="modal-content"
          style={{
            padding: "1rem",
            overflowY: "auto",
            flex: 1,
            minHeight: 0,
          }}
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
                  {/* Entreprise (si présente dans le snapshot client) */}
                  {(() => {
                    const snap: any = (order as any)?.customerSnapshot || {};
                    const company = snap.companyData || null;
                    const hasCompany = !!(company?.companyName || snap.company);
                    if (!hasCompany) return null;
                    return (
                      <div
                        style={{
                          marginTop: "0.75rem",
                          paddingTop: "0.75rem",
                          borderTop: "1px solid #e5e7eb",
                        }}
                      >
                        <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                          Entreprise
                        </div>
                        <div style={{ fontSize: "1.0rem", color: "#111827" }}>
                          {company?.companyName || snap.company}
                        </div>
                        {company?.siretNumber && (
                          <div
                            style={{ fontSize: "0.95rem", color: "#6b7280" }}
                          >
                            SIRET: {company.siretNumber}
                          </div>
                        )}
                        {company?.vatNumber && (
                          <div
                            style={{ fontSize: "0.95rem", color: "#6b7280" }}
                          >
                            TVA: {company.vatNumber}
                          </div>
                        )}
                      </div>
                    );
                  })()}
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
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(280px, 1fr))",
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
                        {addr.addressSnapshot.company && (
                          <div
                            style={{
                              color: "#6b7280",
                              marginBottom: "0.25rem",
                              fontSize: "0.8rem",
                            }}
                          >
                            {addr.addressSnapshot.company}
                          </div>
                        )}
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
                  <div
                    className="table-responsive"
                    style={{ overflowX: "auto" }}
                  >
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "separate",
                        borderSpacing: 0,
                        fontSize: "0.9rem",
                        minWidth: "700px",
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
                              padding: "0.75rem 1rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              fontSize: "0.85rem",
                            }}
                          >
                            Produit
                          </th>
                          <th
                            style={{
                              textAlign: "center",
                              padding: "0.75rem 1rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              fontSize: "0.85rem",
                            }}
                          >
                            Qté
                          </th>
                          <th
                            className="mobile-hide"
                            style={{
                              textAlign: "right",
                              padding: "0.75rem 1rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              fontSize: "0.85rem",
                            }}
                          >
                            Prix unit. HT
                          </th>
                          <th
                            className="mobile-hide"
                            style={{
                              textAlign: "right",
                              padding: "0.75rem 1rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              fontSize: "0.85rem",
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
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  <div
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                      padding: "0.75rem",
                      background: "white",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "#6b7280",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Total HT
                    </div>
                    <div
                      style={{
                        fontSize: "1.2rem",
                        color: "#111827",
                        fontWeight: "600",
                      }}
                    >
                      {(order.totalAmountHT || 0).toFixed(2)} €
                    </div>
                  </div>
                  <div
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                      padding: "0.75rem",
                      background: "white",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "#6b7280",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Total TTC
                    </div>
                    <div
                      style={{
                        fontSize: "1.2rem",
                        color: "#111827",
                        fontWeight: "600",
                      }}
                    >
                      {(order.totalAmountTTC || 0).toFixed(2)} €
                    </div>
                  </div>
                  <div
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                      padding: "0.75rem",
                      background: "white",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "#6b7280",
                        marginBottom: "0.5rem",
                      }}
                    >
                      TVA
                    </div>
                    <div
                      style={{
                        fontSize: "1.2rem",
                        color: "#111827",
                        fontWeight: "600",
                      }}
                    >
                      {(
                        (order.totalAmountTTC || 0) - (order.totalAmountHT || 0)
                      ).toFixed(2)}{" "}
                      €
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    marginTop: "1rem",
                    paddingTop: "1rem",
                    borderTop: "1px solid #e5e7eb",
                    fontSize: "0.9rem",
                    color: "#6b7280",
                  }}
                >
                  <div style={{ marginBottom: "0.25rem" }}>
                    <strong>Créée le :</strong>{" "}
                    {order.createdAt
                      ? new Date(order.createdAt as any).toLocaleString("fr-FR")
                      : "—"}
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
          // No-op: parent page will reload the credit notes list
          setIsCreateCreditNoteOpen(false);
        }}
      />
    </div>
  );
};

export default OrderDetailModal;
