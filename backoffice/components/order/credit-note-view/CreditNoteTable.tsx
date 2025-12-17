import React from "react";
import { CreditNotePublicDTO, OrderPublicDTO } from "dto";
import TableLayout, {
  TableHeader,
  TableRow,
  TableCell,
} from "../../shared/TableLayout";
import { Badge } from "../../shared";
import CreditNoteActionButtons from "./CreditNoteActionButtons";
import styles from "../../../styles/components/CreditNoteTable.module.css";

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
    { label: "REFERENCE" },
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
    <TableLayout headers={headers} headerGradient="teal">
      {isLoading && (
        <TableRow>
          <TableCell colSpan={9} align="center" className={styles.empty}>
            Chargement...
          </TableCell>
        </TableRow>
      )}
      {!isLoading && creditNotes.length === 0 && (
        <TableRow>
          <TableCell colSpan={9} align="center" className={styles.empty}>
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
              <TableCell className={styles.cellDark}>{c.id}</TableCell>
              <TableCell className={styles.cellDark}>{customerName}</TableCell>
              <TableCell align="center">{c.orderId}</TableCell>
              <TableCell className="mobile-hide">{c.reason}</TableCell>
              <TableCell className="mobile-hide" align="right">
                {Number(Number(c.totalAmountHT) || 0).toFixed(2)} €
              </TableCell>
              <TableCell align="right">
                {Number(Number(c.totalAmountTTC) || 0).toFixed(2)} €
              </TableCell>
              <TableCell className="mobile-hide">{emitted}</TableCell>
              <TableCell align="center">
                <Badge
                  type={
                    (c.status || "pending") === "refunded"
                      ? "success"
                      : "warning"
                  }
                  label={
                    (c.status || "pending") === "refunded"
                      ? "Remboursé"
                      : "En attente"
                  }
                  variant="compact"
                />
              </TableCell>
              <TableCell width="160px">
                <div className={styles.actions}>
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
