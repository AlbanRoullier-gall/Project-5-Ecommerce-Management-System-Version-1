import React from "react";
import { OrderPublicDTO } from "../../dto";

interface OrderTableProps {
  orders: OrderPublicDTO[];
  isLoading?: boolean;
  onView?: (orderId: number) => void;
  onToggleDelivery?: (orderId: number, delivered: boolean) => void;
}

const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  isLoading,
  onView,
  onToggleDelivery,
}) => {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        border: "2px solid rgba(19, 104, 106, 0.1)",
      }}
    >
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
              background: "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
              color: "white",
            }}
          >
            <tr>
              <th
                style={{
                  padding: "1.25rem 1.25rem",
                  textAlign: "left",
                  fontSize: "1rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                #
              </th>
              <th
                style={{
                  padding: "1.25rem 1.25rem",
                  textAlign: "left",
                  fontSize: "1rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Client
              </th>
              <th
                style={{
                  padding: "1.25rem 1.25rem",
                  textAlign: "left",
                  fontSize: "1rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Email
              </th>
              <th
                style={{
                  padding: "1.25rem 1.25rem",
                  textAlign: "right",
                  fontSize: "1rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Total HT
              </th>
              <th
                style={{
                  padding: "1.25rem 1.25rem",
                  textAlign: "right",
                  fontSize: "1rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Total TTC
              </th>
              <th
                style={{
                  padding: "1.25rem 1.25rem",
                  textAlign: "left",
                  fontSize: "1rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Paiement
              </th>
              <th
                style={{
                  padding: "1.25rem 1.25rem",
                  textAlign: "left",
                  fontSize: "1rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Créée
              </th>
              <th
                style={{
                  padding: "1.25rem 1.25rem",
                  textAlign: "left",
                  fontSize: "1rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Livré
              </th>
              <th
                style={{
                  padding: "1.25rem 1.25rem",
                  textAlign: "left",
                  fontSize: "1rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    padding: "1rem",
                    textAlign: "center",
                    color: "#6b7280",
                  }}
                >
                  Chargement...
                </td>
              </tr>
            )}
            {!isLoading && orders.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    padding: "1rem",
                    textAlign: "center",
                    color: "#6b7280",
                  }}
                >
                  Aucune commande trouvée
                </td>
              </tr>
            )}
            {!isLoading &&
              orders.map((o) => {
                const customerName =
                  `${o.customerFirstName || ""} ${
                    o.customerLastName || ""
                  }`.trim() || "—";
                return (
                  <tr key={o.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "0.75rem 1rem", color: "#111827" }}>
                      {o.id}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "#111827" }}>
                      {customerName}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "#6b7280" }}>
                      {o.customerEmail || "—"}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                      {(Number(o.totalAmountHT) || 0).toFixed(2)} €
                    </td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                      {(Number(o.totalAmountTTC) || 0).toFixed(2)} €
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      {o.paymentMethod || "—"}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      {new Date(o.createdAt).toLocaleString()}
                    </td>
                    <td
                      style={{ padding: "0.75rem 1rem", textAlign: "center" }}
                    >
                      {o.delivered ? (
                        <span
                          style={{
                            padding: "0.25rem 0.75rem",
                            borderRadius: "6px",
                            fontSize: "0.9rem",
                            fontWeight: "500",
                            background:
                              "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
                            color: "white",
                          }}
                        >
                          Livré
                        </span>
                      ) : (
                        <span
                          style={{
                            padding: "0.25rem 0.75rem",
                            borderRadius: "6px",
                            fontSize: "0.9rem",
                            fontWeight: "500",
                            background:
                              "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
                            color: "white",
                          }}
                        >
                          En attente
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <div style={{ display: "flex", gap: "0.75rem" }}>
                        <button
                          onClick={() => onView && onView(o.id)}
                          title="Voir"
                          style={{
                            padding: "0.75rem",
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            color: "#3b82f6",
                            transition: "all 0.2s ease",
                            borderRadius: "8px",
                            fontSize: "1.2rem",
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background =
                              "rgba(59, 130, 246, 0.1)";
                            e.currentTarget.style.transform = "scale(1.1)";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = "none";
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        {onToggleDelivery && (
                          <button
                            onClick={() => onToggleDelivery(o.id, !o.delivered)}
                            title={
                              o.delivered
                                ? "Marquer comme non livré"
                                : "Marquer comme livré"
                            }
                            style={{
                              padding: "0.75rem",
                              border: "none",
                              background: "none",
                              cursor: "pointer",
                              color: o.delivered ? "#ef4444" : "#10b981",
                              transition: "all 0.2s ease",
                              borderRadius: "8px",
                              fontSize: "1.2rem",
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.background = o.delivered
                                ? "rgba(239, 68, 68, 0.1)"
                                : "rgba(16, 185, 129, 0.1)";
                              e.currentTarget.style.transform = "scale(1.1)";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.background = "none";
                              e.currentTarget.style.transform = "scale(1)";
                            }}
                          >
                            <i
                              className={
                                o.delivered ? "fas fa-undo" : "fas fa-check"
                              }
                            ></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderTable;
