import React from "react";
import { OrderPublicDTO } from "dto";
import TableLayout, {
  TableHeader,
  TableRow,
  TableCell,
} from "../../shared/TableLayout";
import { Badge } from "../../shared";
import OrderActionButtons from "./OrderActionButtons";
import styles from "../../../styles/components/OrderTable.module.css";

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
  const headers: TableHeader[] = [
    { label: "REFERENCE" },
    { label: "Client" },
    { label: "Email", className: "mobile-hide" },
    { label: "Total HT", align: "right", className: "mobile-hide" },
    { label: "Total TTC", align: "right" },
    { label: "Paiement", className: "mobile-hide" },
    { label: "Créée", className: "mobile-hide" },
    { label: "Livré", align: "center" },
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
      {!isLoading && orders.length === 0 && (
        <TableRow>
          <TableCell colSpan={9} align="center" className={styles.empty}>
            Aucune commande trouvée
          </TableCell>
        </TableRow>
      )}
      {!isLoading &&
        orders.map((o) => {
          const customerName =
            `${o.customerFirstName || ""} ${o.customerLastName || ""}`.trim() ||
            "—";
          return (
            <TableRow key={o.id}>
              <TableCell className={styles.cellDark}>{o.id}</TableCell>
              <TableCell className={styles.cellDark}>{customerName}</TableCell>
              <TableCell className={`mobile-hide ${styles.cellMuted}`}>
                {o.customerEmail || "—"}
              </TableCell>
              <TableCell className="mobile-hide" align="right">
                {Number(Number(o.totalAmountHT) || 0).toFixed(2)} €
              </TableCell>
              <TableCell align="right">
                {Number(Number(o.totalAmountTTC) || 0).toFixed(2)} €
              </TableCell>
              <TableCell className="mobile-hide">
                {o.paymentMethod || "—"}
              </TableCell>
              <TableCell className="mobile-hide">
                {new Date(o.createdAt).toLocaleString()}
              </TableCell>
              <TableCell align="center">
                <Badge
                  type={o.delivered ? "success" : "warning"}
                  label={o.delivered ? "Livré" : "En attente"}
                  variant="compact"
                />
              </TableCell>
              <TableCell width="160px">
                <div className={styles.actions}>
                  <OrderActionButtons
                    onView={() => onView && onView(o.id)}
                    onToggleDelivery={() =>
                      onToggleDelivery && onToggleDelivery(o.id, !o.delivered)
                    }
                    delivered={o.delivered}
                  />
                </div>
              </TableCell>
            </TableRow>
          );
        })}
    </TableLayout>
  );
};

export default OrderTable;
