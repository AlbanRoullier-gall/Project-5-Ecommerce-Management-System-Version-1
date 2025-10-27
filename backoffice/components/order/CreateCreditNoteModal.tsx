import React, { useMemo, useState } from "react";
import Button from "../product/ui/Button";
import {
  CreditNoteCreateDTO,
  OrderPublicDTO,
  CreditNotePublicDTO,
  OrderItemPublicDTO,
} from "../../dto";

interface CreateCreditNoteModalProps {
  isOpen: boolean;
  order: OrderPublicDTO | null;
  orders?: OrderPublicDTO[];
  onClose: () => void;
  onCreated: (created: CreditNotePublicDTO) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";

const CreateCreditNoteModal: React.FC<CreateCreditNoteModalProps> = ({
  isOpen,
  order,
  orders = [],
  onClose,
  onCreated,
}) => {
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
  const [lockTotals, setLockTotals] = useState(true);

  const selectedOrder: OrderPublicDTO | null = useMemo(() => {
    if (order) return order;
    const id = Number(selectedOrderId);
    if (!Number.isFinite(id)) return null;
    return orders.find((o) => o.id === id) || null;
  }, [order, orders, selectedOrderId]);

  const canSubmit = useMemo(() => {
    if (!selectedOrder) return false;
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
  }, [selectedOrder, reason, paymentMethod, totalHT, totalTTC]);

  const selectedItems = useMemo(() => {
    const set = new Set(selectedItemIds);
    return orderItems.filter((it) => set.has(it.id));
  }, [orderItems, selectedItemIds]);

  const totalsFromSelection = useMemo(() => {
    const sumHT = selectedItems.reduce(
      (acc, it) => acc + Number(it.totalPriceHT || 0),
      0
    );
    const sumTTC = selectedItems.reduce(
      (acc, it) => acc + Number(it.totalPriceTTC || 0),
      0
    );
    return { sumHT, sumTTC };
  }, [selectedItems]);

  React.useEffect(() => {
    if (!lockTotals) return;
    const { sumHT, sumTTC } = totalsFromSelection;
    setTotalHT(sumHT ? String(sumHT.toFixed(2)) : "");
    setTotalTTC(sumTTC ? String(sumTTC.toFixed(2)) : "");
  }, [totalsFromSelection, lockTotals]);

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
        const token = localStorage.getItem("auth_token");
        if (!token) throw new Error("Non authentifié");
        const res = await fetch(
          `${API_URL}/api/admin/orders/${selectedOrder.id}/items`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error("Erreur chargement des articles");
        const json = await res.json();
        const list: OrderItemPublicDTO[] =
          json?.data?.orderItems || json?.orderItems || [];
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
    setLockTotals(true);
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
      const token = localStorage.getItem("auth_token");
      if (!token) throw new Error("Non authentifié");

      const payload: CreditNoteCreateDTO = {
        customerId: selectedOrder.customerId,
        orderId: selectedOrder.id,
        reason: reason.trim(),
        description: description.trim() || undefined,
        paymentMethod: paymentMethod || undefined,
        totalAmountHT: Number(totalHT),
        totalAmountTTC: Number(totalTTC),
        notes: notes.trim() || undefined,
      };

      const res = await fetch(`${API_URL}/api/admin/credit-notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(
          json?.message || "Erreur lors de la création de l'avoir"
        );
      }

      const created: CreditNotePublicDTO =
        json?.data?.creditNote || json?.creditNote || json;

      if (selectedItems.length > 0) {
        const itemPayloads = selectedItems.map((it) => ({
          creditNoteId: created.id,
          productId: it.productId,
          productName: it.productName,
          quantity: it.quantity,
          unitPriceHT: it.unitPriceHT,
          unitPriceTTC: it.unitPriceTTC,
          vatRate: it.vatRate,
          totalPriceHT: it.totalPriceHT,
          totalPriceTTC: it.totalPriceTTC,
        }));
        await Promise.all(
          itemPayloads.map((p) =>
            fetch(`${API_URL}/api/admin/credit-note-items`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(p),
            })
          )
        );
      }

      onCreated(created);
      resetForm();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur réseau");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

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
        className="create-credit-note-modal"
        style={{
          width: "100%",
          maxWidth: "min(98vw, 800px)",
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
            flexWrap: "wrap",
            gap: "0.75rem",
            minHeight: "60px",
          }}
        >
          <h3 style={{ margin: 0, color: "white" }}>Créer un avoir</h3>
          <Button variant="gold" onClick={handleClose} icon="fas fa-times">
            Fermer
          </Button>
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
          {error && (
            <div
              style={{
                background: "#FEF2F2",
                color: "#B91C1C",
                border: "1px solid #FECACA",
                padding: "0.75rem 1rem",
                borderRadius: 12,
                marginBottom: "0.75rem",
              }}
            >
              {error}
            </div>
          )}

          <div
            className="credit-note-form"
            style={{ display: "grid", gap: "1rem" }}
          >
            {selectedOrder ? (
              <div style={{ color: "#6b7280" }}>
                Commande #{selectedOrder.id}
              </div>
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
                  <div
                    className="table-responsive"
                    style={{ overflowX: "auto" }}
                  >
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "separate",
                        borderSpacing: 0,
                        fontSize: "0.95rem",
                        minWidth: "500px",
                      }}
                    >
                      <thead
                        style={{ background: "#f3f4f6", color: "#374151" }}
                      >
                        <tr>
                          <th style={{ textAlign: "left", padding: "0.5rem" }}>
                            Sélection
                          </th>
                          <th style={{ textAlign: "left", padding: "0.5rem" }}>
                            Produit
                          </th>
                          <th style={{ textAlign: "right", padding: "0.5rem" }}>
                            Qté
                          </th>
                          <th
                            className="mobile-hide"
                            style={{ textAlign: "right", padding: "0.5rem" }}
                          >
                            Total HT
                          </th>
                          <th style={{ textAlign: "right", padding: "0.5rem" }}>
                            Total TTC
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderItems.length === 0 && (
                          <tr>
                            <td
                              colSpan={5}
                              style={{
                                padding: "0.5rem",
                                textAlign: "center",
                                color: "#6b7280",
                              }}
                            >
                              Aucun article
                            </td>
                          </tr>
                        )}
                        {orderItems.map((it) => {
                          const checked = selectedItemIds.includes(it.id);
                          return (
                            <tr
                              key={it.id}
                              style={{ borderTop: "1px solid #f3f4f6" }}
                            >
                              <td style={{ padding: "0.5rem" }}>
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) => {
                                    setSelectedItemIds((prev) => {
                                      const set = new Set(prev);
                                      if (e.target.checked) set.add(it.id);
                                      else set.delete(it.id);
                                      return Array.from(set);
                                    });
                                  }}
                                />
                              </td>
                              <td
                                style={{ padding: "0.5rem", color: "#111827" }}
                              >
                                {it.productName || `Produit #${it.productId}`}
                              </td>
                              <td
                                style={{
                                  padding: "0.5rem",
                                  textAlign: "right",
                                }}
                              >
                                {it.quantity}
                              </td>
                              <td
                                className="mobile-hide"
                                style={{
                                  padding: "0.5rem",
                                  textAlign: "right",
                                }}
                              >
                                {(Number(it.totalPriceHT) || 0).toFixed(2)} €
                              </td>
                              <td
                                style={{
                                  padding: "0.5rem",
                                  textAlign: "right",
                                }}
                              >
                                {(Number(it.totalPriceTTC) || 0).toFixed(2)} €
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
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
                    value={totalHT}
                    onChange={(e) => {
                      setTotalHT(e.target.value);
                      setLockTotals(false);
                    }}
                    placeholder="0.00"
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
                    value={totalTTC}
                    onChange={(e) => {
                      setTotalTTC(e.target.value);
                      setLockTotals(false);
                    }}
                    placeholder="0.00"
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
              </div>
            </div>
          </div>
        </div>

        <div
          className="modal-actions"
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.5rem",
            padding: "0.75rem 1.25rem",
            borderTop: "1px solid #e5e7eb",
            flexWrap: "wrap",
          }}
        >
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
        </div>
      </div>
    </div>
  );
};

export default CreateCreditNoteModal;
