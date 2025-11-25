import React from "react";
import { CreditNotePublicDTO, OrderPublicDTO } from "../../../dto";
import TableLayout, {
  TableHeader,
  TableRow,
  TableCell,
} from "../../shared/TableLayout";
import CreditNoteActionButtons from "../order-list-view/table/CreditNoteActionButtons";

interface CreditNoteTableProps {
  creditNotes: CreditNotePublicDTO[];
  isLoading?: boolean;
  orders?: OrderPublicDTO[];
  onView?: (creditNoteId: number) => void;
  onDelete?: (creditNoteId: number) => void;
  onToggleStatus?: (creditNoteId: number, newStatus: string) => void;
}

const CreditNoteTable: React.FC<CreditNoteTableProps> = ({
  creditNotes,
  isLoading,
  orders = [],
  onView,
  onDelete,
  onToggleStatus,
}) => {
  const orderById = React.useMemo(() => {
    const map = new Map<number, OrderPublicDTO>();
    orders.forEach((o) => map.set(o.id, o));
    return map;
  }, [orders]);

  const headers: TableHeader[] = [
    { label: "#" },
    { label: "Client" },
    { label: "Commande", align: "center" },
    { label: "Motif", className: "mobile-hide" },
    { label: "Total HT", align: "right", className: "mobile-hide" },
    { label: "Total TTC", align: "right" },
    { label: "Émise", className: "mobile-hide" },
    { label: "Statut", align: "center" },
    { label: "Actions", align: "right", width: "160px" },
  ];

  return (
    <TableLayout headers={headers} minWidth="800px" headerGradient="teal">
      {isLoading && (
        <TableRow>
          <TableCell
            colSpan={9}
            align="center"
            style={{ color: "#6b7280", padding: "1rem" }}
          >
            Chargement...
          </TableCell>
        </TableRow>
      )}
      {!isLoading && creditNotes.length === 0 && (
        <TableRow>
          <TableCell
            colSpan={9}
            align="center"
            style={{ color: "#6b7280", padding: "1rem" }}
          >
            Aucun avoir trouvé
          </TableCell>
        </TableRow>
      )}
      {!isLoading &&
        creditNotes.map((c) => {
          const order = orderById.get(c.orderId);
          const customerName = order
            ? `${order.customerFirstName || ""} ${
                order.customerLastName || ""
              }`.trim() ||
              order.customerEmail ||
              `Client #${c.customerId}`
            : `Client #${c.customerId}`;
          const emitted = c.issueDate
            ? new Date(c.issueDate as any).toLocaleDateString()
            : c.createdAt
            ? new Date(c.createdAt as any).toLocaleDateString()
            : "—";
          return (
            <TableRow key={c.id}>
              <TableCell style={{ color: "#111827" }}>{c.id}</TableCell>
              <TableCell style={{ color: "#111827" }}>{customerName}</TableCell>
              <TableCell align="center">{c.orderId}</TableCell>
              <TableCell className="mobile-hide">{c.reason}</TableCell>
              <TableCell className="mobile-hide" align="right">
                {(Number(c.totalAmountHT) || 0).toFixed(2)} €
              </TableCell>
              <TableCell align="right">
                {(Number(c.totalAmountTTC) || 0).toFixed(2)} €
              </TableCell>
              <TableCell className="mobile-hide">{emitted}</TableCell>
              <TableCell align="center">
                {(c.status || "pending") === "refunded" ? (
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
                    Remboursé
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
              </TableCell>
              <TableCell width="160px">
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <CreditNoteActionButtons
                    onView={() => onView && onView(c.id)}
                    onToggleStatus={() => {
                      if (onToggleStatus) {
                        const newStatus =
                          (c.status || "pending") === "refunded"
                            ? "pending"
                            : "refunded";
                        onToggleStatus(c.id, newStatus);
                      }
                    }}
                    onDelete={() => onDelete && onDelete(c.id)}
                    status={c.status || "pending"}
                  />
                </div>
              </TableCell>
            </TableRow>
          );
        })}
    </TableLayout>
  );
};

export default CreditNoteTable;
