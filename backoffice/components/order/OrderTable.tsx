import React from "react";
import { OrderPublicDTO } from "../../dto";

interface OrderTableProps {
  orders: OrderPublicDTO[];
  isLoading?: boolean;
  onView?: (orderId: number) => void;
}

const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  isLoading,
  onView,
}) => {
  return (
    <div
      style={{
        overflowX: "auto",
        borderRadius: 12,
        border: "1px solid #e5e7eb",
      }}
    >
      <table
        style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}
      >
        <thead>
          <tr style={{ background: "#f9fafb", color: "#374151" }}>
            <th style={{ textAlign: "left", padding: "0.75rem 1rem" }}>#</th>
            <th style={{ textAlign: "left", padding: "0.75rem 1rem" }}>
              Client
            </th>
            <th style={{ textAlign: "left", padding: "0.75rem 1rem" }}>
              Email
            </th>
            <th style={{ textAlign: "right", padding: "0.75rem 1rem" }}>
              Total HT
            </th>
            <th style={{ textAlign: "right", padding: "0.75rem 1rem" }}>
              Total TTC
            </th>
            <th style={{ textAlign: "left", padding: "0.75rem 1rem" }}>
              Paiement
            </th>
            <th style={{ textAlign: "left", padding: "0.75rem 1rem" }}>
              Créée
            </th>
            <th style={{ textAlign: "left", padding: "0.75rem 1rem" }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td
                colSpan={7}
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
                colSpan={7}
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
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <button
                      onClick={() => onView && onView(o.id)}
                      style={{
                        padding: "0.5rem 0.85rem",
                        borderRadius: 10,
                        border: "2px solid #e5e7eb",
                        background: "white",
                        color: "#13686a",
                        cursor: "pointer",
                      }}
                      title="Voir le détail"
                    >
                      <i className="fas fa-eye" style={{ marginRight: 6 }}></i>
                      Voir
                    </button>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;
