import React from "react";
import { CreditNotePublicDTO } from "../../dto";

interface CreditNoteTableProps {
  creditNotes: CreditNotePublicDTO[];
  isLoading?: boolean;
}

const CreditNoteTable: React.FC<CreditNoteTableProps> = ({
  creditNotes,
  isLoading,
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
              Commande
            </th>
            <th style={{ textAlign: "left", padding: "0.75rem 1rem" }}>
              Motif
            </th>
            <th style={{ textAlign: "right", padding: "0.75rem 1rem" }}>
              Total HT
            </th>
            <th style={{ textAlign: "right", padding: "0.75rem 1rem" }}>
              Total TTC
            </th>
            <th style={{ textAlign: "left", padding: "0.75rem 1rem" }}>
              Émise
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
          {!isLoading && creditNotes.length === 0 && (
            <tr>
              <td
                colSpan={7}
                style={{
                  padding: "1rem",
                  textAlign: "center",
                  color: "#6b7280",
                }}
              >
                Aucun avoir trouvé
              </td>
            </tr>
          )}
          {!isLoading &&
            creditNotes.map((c) => (
              <tr key={c.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                <td style={{ padding: "0.75rem 1rem", color: "#111827" }}>
                  {c.id}
                </td>
                <td style={{ padding: "0.75rem 1rem", color: "#111827" }}>
                  {c.customerId}
                </td>
                <td style={{ padding: "0.75rem 1rem" }}>{c.orderId}</td>
                <td style={{ padding: "0.75rem 1rem" }}>{c.reason}</td>
                <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                  {c.totalAmountHT.toFixed(2)} €
                </td>
                <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                  {c.totalAmountTTC.toFixed(2)} €
                </td>
                <td style={{ padding: "0.75rem 1rem" }}>
                  {c.issueDate
                    ? new Date(c.issueDate).toLocaleDateString()
                    : "—"}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default CreditNoteTable;
