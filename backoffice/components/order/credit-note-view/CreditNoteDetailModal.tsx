import React from "react";
import Button from "../../shared/Button";
import {
  CreditNotePublicDTO,
  CreditNoteItemPublicDTO,
  OrderPublicDTO,
} from "../../../dto";

interface CreditNoteDetailModalProps {
  isOpen: boolean;
  creditNote: CreditNotePublicDTO | null;
  order: OrderPublicDTO | null;
  onClose: () => void;
  onDelete?: (creditNoteId: number) => void;
}

const CreditNoteDetailModal: React.FC<CreditNoteDetailModalProps> = ({
  isOpen,
  creditNote,
  order,
  onClose,
  onDelete,
}) => {
  const [items, setItems] = React.useState<CreditNoteItemPublicDTO[]>([]);
  const [itemsLoading, setItemsLoading] = React.useState(false);
  const [itemsError, setItemsError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";
    const getAuthToken = () => localStorage.getItem("auth_token");
    const loadItems = async () => {
      if (!creditNote?.id) return;
      setItems([]);
      setItemsError(null);
      setItemsLoading(true);
      try {
        const token = getAuthToken();
        if (!token) throw new Error("Non authentifié");
        const res = await fetch(
          `${API_URL}/api/admin/credit-notes/${creditNote.id}/items`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Erreur chargement des articles d'avoir");
        const json = await res.json();
        const list: CreditNoteItemPublicDTO[] =
          json?.data?.creditNoteItems || json?.creditNoteItems || [];
        setItems(list);
      } catch (e) {
        setItemsError(
          e instanceof Error
            ? e.message
            : "Erreur chargement des articles d'avoir"
        );
      } finally {
        setItemsLoading(false);
      }
    };
    loadItems();
  }, [creditNote?.id]);

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
        className="credit-note-detail-modal"
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
            Détail de l'avoir #{creditNote.id}
          </h3>
          <div
            className="modal-header-actions"
            style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
          >
            {onDelete && (
              <Button
                variant="danger"
                icon="fas fa-trash"
                onClick={() => onDelete(creditNote.id)}
              >
                Supprimer
              </Button>
            )}
            <Button variant="gold" onClick={onClose} icon="fas fa-times">
              Fermer
            </Button>
          </div>
        </div>

        <div
          className="modal-content"
          style={{
            padding: "1rem",
            overflowY: "auto",
            flex: 1,
            minHeight: 0,
          }}
        >
          <div style={{ display: "grid", gap: "1.5rem" }}>
            {/* Informations principales */}
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: "1.25rem",
                background: "#f9fafb",
              }}
            >
              <h4
                style={{
                  margin: "0 0 1rem 0",
                  fontSize: "1.1rem",
                  color: "#111827",
                  fontWeight: 600,
                }}
              >
                Informations générales
              </h4>
              <div
                className="credit-note-info-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1rem",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#6b7280",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Client
                  </div>
                  <div
                    style={{
                      fontSize: "1rem",
                      color: "#111827",
                      fontWeight: 500,
                    }}
                  >
                    {customerName}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#6b7280",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Commande associée
                  </div>
                  <div
                    style={{
                      fontSize: "1rem",
                      color: "#111827",
                      fontWeight: 500,
                    }}
                  >
                    #{creditNote.orderId}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#6b7280",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Date d'émission
                  </div>
                  <div
                    style={{
                      fontSize: "1rem",
                      color: "#111827",
                      fontWeight: 500,
                    }}
                  >
                    {emitted}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#6b7280",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Méthode de paiement
                  </div>
                  <div
                    style={{
                      fontSize: "1rem",
                      color: "#111827",
                      fontWeight: 500,
                    }}
                  >
                    {creditNote.paymentMethod || "—"}
                  </div>
                </div>
              </div>
            </div>

            {/* Détails de l'avoir */}
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: "1.25rem",
              }}
            >
              <h4
                style={{
                  margin: "0 0 1rem 0",
                  fontSize: "1.1rem",
                  color: "#111827",
                  fontWeight: 600,
                }}
              >
                Détails de l'avoir
              </h4>
              <div style={{ display: "grid", gap: "1rem" }}>
                <div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#6b7280",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Motif
                  </div>
                  <div
                    style={{
                      fontSize: "1rem",
                      color: "#111827",
                      fontWeight: 500,
                    }}
                  >
                    {creditNote.reason}
                  </div>
                </div>

                {creditNote.description && (
                  <div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "#6b7280",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Description
                    </div>
                    <div
                      style={{
                        fontSize: "1rem",
                        color: "#111827",
                        lineHeight: "1.5",
                      }}
                    >
                      {creditNote.description}
                    </div>
                  </div>
                )}

                {creditNote.notes && (
                  <div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "#6b7280",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Notes internes
                    </div>
                    <div
                      style={{
                        fontSize: "1rem",
                        color: "#111827",
                        lineHeight: "1.5",
                      }}
                    >
                      {creditNote.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>

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
                  Articles de l'avoir
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
                <div className="table-responsive" style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "separate",
                      borderSpacing: 0,
                      fontSize: "1rem",
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
                          className="mobile-hide"
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
                          className="mobile-hide"
                          style={{
                            textAlign: "right",
                            padding: "1rem 1.25rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Prix unit. TTC
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
                              padding: "0.75rem 1rem",
                              color: "#111827",
                              fontWeight: 500,
                            }}
                          >
                            {it.productName}
                          </td>
                          <td
                            style={{
                              padding: "0.75rem 1rem",
                              textAlign: "right",
                              color: "#111827",
                            }}
                          >
                            {it.quantity}
                          </td>
                          <td
                            className="mobile-hide"
                            style={{
                              padding: "0.75rem 1rem",
                              textAlign: "right",
                              color: "#111827",
                            }}
                          >
                            {(Number(it.unitPriceHT) || 0).toFixed(2)} €
                          </td>
                          <td
                            className="mobile-hide"
                            style={{
                              padding: "0.75rem 1rem",
                              textAlign: "right",
                              color: "#111827",
                            }}
                          >
                            {(Number(it.unitPriceTTC) || 0).toFixed(2)} €
                          </td>
                          <td
                            style={{
                              padding: "0.75rem 1rem",
                              textAlign: "right",
                              color: "#13686a",
                              fontWeight: 600,
                            }}
                          >
                            {(Number(it.totalPriceHT) || 0).toFixed(2)} €
                          </td>
                          <td
                            style={{
                              padding: "0.75rem 1rem",
                              textAlign: "right",
                              color: "#13686a",
                              fontWeight: 600,
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

            {/* Date de commande */}
            {order && (
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: "1.25rem",
                  background: "#f8fafc",
                  textAlign: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#6b7280",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Date de commande
                  </div>
                  <div
                    style={{
                      fontSize: "1rem",
                      color: "#111827",
                      fontWeight: 500,
                    }}
                  >
                    {order.createdAt
                      ? new Date(order.createdAt as any).toLocaleDateString()
                      : "—"}
                  </div>
                </div>
              </div>
            )}

            {/* Totaux */}
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: "1.25rem",
                background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
              }}
            >
              <h4
                style={{
                  margin: "0 0 1rem 0",
                  fontSize: "1.1rem",
                  color: "#111827",
                  fontWeight: 600,
                }}
              >
                Montants
              </h4>
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
                      fontWeight: 700,
                    }}
                  >
                    {(Number(creditNote.totalAmountHT) || 0).toFixed(2)} €
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
                      fontWeight: 700,
                    }}
                  >
                    {(Number(creditNote.totalAmountTTC) || 0).toFixed(2)} €
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
                      fontWeight: 700,
                    }}
                  >
                    {(
                      (Number(creditNote.totalAmountTTC) || 0) -
                      (Number(creditNote.totalAmountHT) || 0)
                    ).toFixed(2)}{" "}
                    €
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditNoteDetailModal;
