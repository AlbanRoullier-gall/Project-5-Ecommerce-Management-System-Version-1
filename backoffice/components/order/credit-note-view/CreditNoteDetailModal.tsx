import React from "react";
import { Button, Modal, ItemDisplayTable } from "../../shared";
import { CreditNotePublicDTO, OrderPublicDTO } from "../../../dto";
import { BaseItemDTO } from "@tfe/shared-types/common/BaseItemDTO";
import { useCreditNoteDetail } from "../../../hooks";

interface CreditNoteDetailModalProps {
  isOpen: boolean;
  creditNote: CreditNotePublicDTO | null;
  order: OrderPublicDTO | null;
  onClose: () => void;
  onDelete?: (creditNoteId: number) => void;
}

/**
 * Composant d'affichage du détail d'un avoir
 * Toute la logique métier est gérée par le hook useCreditNoteDetail
 */
const CreditNoteDetailModal: React.FC<CreditNoteDetailModalProps> = ({
  isOpen,
  creditNote,
  order,
  onClose,
  onDelete,
}) => {
  const { items, itemsLoading, itemsError } = useCreditNoteDetail(
    creditNote?.id || null
  );

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
    <Modal
      isOpen={isOpen}
      title={`Détail de l'avoir #${creditNote.id}`}
      onClose={onClose}
      maxWidth="900px"
      headerActions={
        <>
          {onDelete && (
            <Button
              variant="danger"
              icon="fas fa-trash"
              onClick={() => onDelete(creditNote.id)}
            >
              Supprimer
            </Button>
          )}
        </>
      }
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
            <ItemDisplayTable
              items={
                items.map((it) => ({
                  productId: it.productId,
                  productName: it.productName,
                  description: null,
                  imageUrl: null,
                  quantity: it.quantity,
                  vatRate: 21, // Valeur par défaut pour les avoirs
                  unitPriceHT: it.unitPriceHT,
                  unitPriceTTC: it.unitPriceTTC,
                  totalPriceHT: it.totalPriceHT,
                  totalPriceTTC: it.totalPriceTTC,
                  createdAt: it.createdAt,
                })) as BaseItemDTO[]
              }
              variant="credit-note"
              showDescription={false}
              showImage={false}
              columns={{
                product: true,
                quantity: true,
                unitPriceHT: true,
                vatRate: false,
                totalPriceHT: true,
                totalPriceTTC: true,
              }}
            />
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
                {Number(Number(creditNote.totalAmountHT) || 0).toFixed(2)} €
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
                {Number(Number(creditNote.totalAmountTTC) || 0).toFixed(2)} €
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
                {Number(creditNote.totalVAT || 0).toFixed(2)} €
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CreditNoteDetailModal;
