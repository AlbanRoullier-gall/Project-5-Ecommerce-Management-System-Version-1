import React from "react";
import { OrderPublicDTO } from "../../../dto";
import TableLayout, {
  TableHeader,
  TableRow,
  TableCell,
} from "../../shared/TableLayout";
import OrderActionButtons from "./table/OrderActionButtons";

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
    { label: "#" },
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
    <TableLayout headers={headers} minWidth="900px" headerGradient="teal">
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
      {!isLoading && orders.length === 0 && (
        <TableRow>
          <TableCell
            colSpan={9}
            align="center"
            style={{ color: "#6b7280", padding: "1rem" }}
          >
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
              <TableCell style={{ color: "#111827" }}>{o.id}</TableCell>
              <TableCell style={{ color: "#111827" }}>{customerName}</TableCell>
              <TableCell className="mobile-hide" style={{ color: "#6b7280" }}>
                {o.customerEmail || "—"}
              </TableCell>
              <TableCell className="mobile-hide" align="right">
                {(Number(o.totalAmountHT) || 0).toFixed(2)} €
              </TableCell>
              <TableCell align="right">
                {(Number(o.totalAmountTTC) || 0).toFixed(2)} €
              </TableCell>
              <TableCell className="mobile-hide">
                {o.paymentMethod || "—"}
              </TableCell>
              <TableCell className="mobile-hide">
                {new Date(o.createdAt).toLocaleString()}
              </TableCell>
              <TableCell align="center">
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
              </TableCell>
              <TableCell width="160px">
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
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
