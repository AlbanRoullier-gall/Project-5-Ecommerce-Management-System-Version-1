import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import PageHeader from "../../shared/PageHeader";
import Button from "../../shared/Button";
import ErrorAlert from "../../shared/ErrorAlert";
import OrderTable from "./OrderTable";
import OrderFilters from "./OrderFilters";
import {
  OrderPublicDTO,
  CreditNotePublicDTO,
  OrderUpdateDeliveryStatusDTO,
  OrderUpdateCreditNoteStatusDTO,
} from "../../../dto";
import {
  CreateCreditNoteModal,
  CreditNoteDetailModal,
  CreditNoteTable,
} from "../credit-note-view";
import { useAuth } from "../../../contexts/AuthContext";

const OrderList: React.FC = () => {
  const router = useRouter();
  const { apiCall } = useAuth();
  const [orders, setOrders] = useState<OrderPublicDTO[]>([]);
  const [creditNotes, setCreditNotes] = useState<CreditNotePublicDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [deliveryFilter, setDeliveryFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [totalFilter, setTotalFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const handleResetFilters = async () => {
    setSearch("");
    setDeliveryFilter("");
    setYearFilter("");
    setTotalFilter("");
    setDateFilter("");
    // Recharger les commandes après réinitialisation
    try {
      await loadOrders();
    } catch (err) {
      console.error("Error reloading orders after reset:", err);
    }
  };

  const [isCreateCreditNoteOpen, setIsCreateCreditNoteOpen] = useState(false);
  const [isCreditNoteDetailOpen, setIsCreditNoteDetailOpen] = useState(false);
  const [detailCreditNote, setDetailCreditNote] = useState<any | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    if (!yearFilter) {
      alert("Veuillez sélectionner une année pour l'export");
      return;
    }

    setIsExporting(true);
    try {
      // Appeler directement l'endpoint d'export qui récupère TOUTES les commandes de l'année
      // Pour les fichiers binaires, on doit utiliser fetch directement avec credentials
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";
      const response = await fetch(
        `${API_URL}/api/admin/exports/orders-year/${yearFilter}`,
        {
          method: "GET",
          headers: {
            Accept: "application/pdf",
          },
          credentials: "include", // Important pour envoyer les cookies httpOnly
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de l'export");
      }

      // Créer un blob et télécharger le fichier
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `export-commandes-${yearFilter}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
      alert("Erreur lors de l'export du fichier");
    } finally {
      setIsExporting(false);
    }
  };

  const loadOrders = async () => {
    // Construire les query params
    const queryParams = new URLSearchParams();
    if (search) queryParams.set("search", search);
    if (yearFilter && yearFilter !== "") {
      queryParams.set("year", yearFilter);
    }
    if (totalFilter && totalFilter !== "") {
      queryParams.set("total", totalFilter);
    }
    if (dateFilter && dateFilter !== "") {
      queryParams.set("date", dateFilter);
    }
    if (deliveryFilter && deliveryFilter !== "") {
      queryParams.set("delivered", deliveryFilter);
    }

    const response = await apiCall<{
      data: {
        orders: OrderPublicDTO[];
      };
      message: string;
      timestamp: string;
      status: number;
    }>({
      url: `/api/admin/orders${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`,
      method: "GET",
      requireAuth: true,
    });

    // Format standardisé : { data: { orders: [] }, ... }
    if (!response.data || !Array.isArray(response.data.orders)) {
      throw new Error("Format de réponse invalide pour les commandes");
    }

    setOrders(response.data.orders);
  };

  const loadCreditNotes = async () => {
    // Construire les query params
    const queryParams = new URLSearchParams();
    if (yearFilter && yearFilter !== "") {
      queryParams.set("year", yearFilter);
    }

    const response = await apiCall<{
      data: {
        creditNotes: CreditNotePublicDTO[];
      };
      message: string;
      timestamp: string;
      status: number;
    }>({
      url: `/api/admin/credit-notes${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`,
      method: "GET",
      requireAuth: true,
    });

    // Format standardisé : { data: { creditNotes: [] }, ... }
    if (!response.data || !Array.isArray(response.data.creditNotes)) {
      throw new Error("Format de réponse invalide pour les avoirs");
    }

    setCreditNotes(response.data.creditNotes);
  };

  const loadInitial = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loadOrders();
      await loadCreditNotes();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitial();
  }, []);

  // Reload when search changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadInitial();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Reload when filters change
  useEffect(() => {
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryFilter, yearFilter, dateFilter]);

  // Reload when total filter changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadInitial();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalFilter]);

  const toggleDeliveryStatus = async (orderId: number, delivered: boolean) => {
    try {
      // Utiliser le DTO avec typage explicite
      const updateDTO: OrderUpdateDeliveryStatusDTO = {
        delivered,
      };

      await apiCall({
        url: `/api/admin/orders/${orderId}/delivery-status`,
        method: "PATCH",
        body: updateDTO,
        requireAuth: true,
      });

      // Mettre à jour l'état local
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, delivered } : order
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la mise à jour"
      );
      console.error("Error toggling delivery status:", err);
    }
  };

  /**
   * Navigue vers la page de détail d'une commande
   */
  const openOrderDetail = (orderId: number) => {
    router.push(`/orders/${orderId}`);
  };

  const handleCreditNoteCreated = async () => {
    // Reload credit notes list
    try {
      await loadCreditNotes();
    } catch (e) {
      // Silent reload failure
    }
  };

  // Le filtrage est maintenant fait côté serveur, plus besoin de useMemo

  return (
    <div>
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      <PageHeader title="Commandes" />

      <OrderFilters
        searchTerm={search}
        onSearchChange={setSearch}
        deliveryFilter={deliveryFilter}
        onDeliveryFilterChange={setDeliveryFilter}
        yearFilter={yearFilter}
        onYearFilterChange={setYearFilter}
        totalFilter={totalFilter}
        onTotalFilterChange={setTotalFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        onResetFilters={handleResetFilters}
      />

      {/* Indicateur de filtrage */}
      {(search || deliveryFilter || yearFilter) && (
        <div
          style={{
            background: "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
            color: "white",
            padding: "1rem 1.5rem",
            borderRadius: "12px",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            boxShadow: "0 4px 12px rgba(19, 104, 106, 0.3)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <i className="fas fa-filter" style={{ fontSize: "1.2rem" }}></i>
            <span style={{ fontWeight: "600" }}>
              {orders.length} commande{orders.length !== 1 ? "s" : ""} trouvée
              {orders.length !== 1 ? "s" : ""}
              {deliveryFilter && (
                <span style={{ marginLeft: "0.5rem", opacity: 0.9 }}>
                  • {deliveryFilter === "delivered" ? "Livrées" : "En attente"}
                </span>
              )}
            </span>
          </div>
        </div>
      )}

      <div style={{ marginBottom: "2.5rem" }}>
        <OrderTable
          orders={orders}
          isLoading={isLoading}
          onView={openOrderDetail}
          onToggleDelivery={toggleDeliveryStatus}
        />
      </div>

      <PageHeader title="Avoirs" />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.75rem",
        }}
      >
        <div />
        <Button
          variant="primary"
          icon="fas fa-file-invoice-dollar"
          onClick={() => setIsCreateCreditNoteOpen(true)}
        >
          Créer un avoir
        </Button>
      </div>
      <div style={{ marginBottom: "2.5rem" }}>
        <CreditNoteTable
          creditNotes={creditNotes}
          isLoading={isLoading}
          orders={orders}
          onToggleStatus={async (creditNoteId, newStatus) => {
            try {
              // Mise à jour optimiste de l'interface
              setCreditNotes((prevCreditNotes) =>
                prevCreditNotes.map((cn) =>
                  cn.id === creditNoteId ? { ...cn, status: newStatus } : cn
                )
              );

              // Utiliser le DTO avec typage explicite
              const updateDTO: OrderUpdateCreditNoteStatusDTO = {
                status: newStatus as "pending" | "refunded",
              };

              try {
                await apiCall({
                  url: `/api/admin/credit-notes/${creditNoteId}/status`,
                  method: "PATCH",
                  body: updateDTO,
                  requireAuth: true,
                });
              } catch (err) {
                // Revenir à l'état précédent en cas d'erreur
                setCreditNotes((prevCreditNotes) =>
                  prevCreditNotes.map((cn) =>
                    cn.id === creditNoteId
                      ? {
                          ...cn,
                          status:
                            newStatus === "refunded" ? "pending" : "refunded",
                        }
                      : cn
                  )
                );
                throw new Error("Erreur lors de la mise à jour du statut");
              }

              // Recharger la liste des avoirs pour s'assurer de la cohérence
              await handleCreditNoteCreated();
            } catch (error) {
              console.error("Toggle credit note status error:", error);
              alert("Erreur lors de la mise à jour du statut de l'avoir");
            }
          }}
          onView={async (creditNoteId) => {
            try {
              // Format standardisé : { data: { creditNote }, ... }
              const json = await apiCall<{
                data: { creditNote: any };
                message?: string;
                timestamp?: string;
                status?: number;
              }>({
                url: `/api/admin/credit-notes/${creditNoteId}`,
                method: "GET",
                requireAuth: true,
              });
              if (!json.data || !json.data.creditNote) {
                throw new Error("Format de réponse invalide pour l'avoir");
              }
              const creditNote = json.data.creditNote;
              setDetailCreditNote(creditNote);
              setIsCreditNoteDetailOpen(true);
            } catch (e) {
              // noop
            }
          }}
          onDelete={async (creditNoteId) => {
            if (!window.confirm("Supprimer cet avoir ?")) return;
            try {
              await apiCall({
                url: `/api/admin/credit-notes/${creditNoteId}`,
                method: "DELETE",
                requireAuth: true,
              });
              await handleCreditNoteCreated();
            } catch (e) {
              // noop (optionally show toast)
            }
          }}
        />
      </div>

      {/* Section Export - Après les avoirs */}
      <div
        style={{
          marginTop: "2rem",
          padding: "1.5rem",
          backgroundColor: "#f8f9fa",
          borderRadius: "12px",
          border: "2px solid #e9ecef",
          textAlign: "center",
        }}
      >
        <h3
          style={{
            margin: "0 0 1rem 0",
            color: "#13686a",
            fontSize: "1.2rem",
            fontWeight: "600",
          }}
        >
          📊 Export des données
        </h3>
        <p
          style={{
            margin: "0 0 1.5rem 0",
            color: "#666",
            fontSize: "0.9rem",
          }}
        >
          Exportez les commandes et avoirs pour une année spécifique
        </p>
        <button
          onClick={handleExportPDF}
          disabled={isExporting || !yearFilter}
          style={{
            padding: "1rem 2rem",
            border: "2px solid #13686a",
            borderRadius: "8px",
            fontSize: "1.1rem",
            backgroundColor: yearFilter ? "#13686a" : "#e0e0e0",
            color: yearFilter ? "white" : "#666",
            cursor: yearFilter ? "pointer" : "not-allowed",
            transition: "all 0.3s ease",
            fontWeight: "600",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            minWidth: "200px",
            boxShadow: yearFilter
              ? "0 4px 12px rgba(19, 104, 106, 0.2)"
              : "none",
          }}
          onMouseEnter={(e) => {
            if (yearFilter) {
              e.currentTarget.style.backgroundColor = "#0dd3d1";
              e.currentTarget.style.borderColor = "#0dd3d1";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 6px 16px rgba(19, 104, 106, 0.3)";
            }
          }}
          onMouseLeave={(e) => {
            if (yearFilter) {
              e.currentTarget.style.backgroundColor = "#13686a";
              e.currentTarget.style.borderColor = "#13686a";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(19, 104, 106, 0.2)";
            }
          }}
        >
          {isExporting ? (
            <>
              <span>Génération...</span>
              <span>⏳</span>
            </>
          ) : (
            <>
              <span>Exporter HTML</span>
              <span>📄</span>
            </>
          )}
        </button>
        {!yearFilter && (
          <p
            style={{
              margin: "1rem 0 0 0",
              color: "#e74c3c",
              fontSize: "0.85rem",
              fontStyle: "italic",
            }}
          >
            ⚠️ Veuillez sélectionner une année pour activer l'export
          </p>
        )}
      </div>

      <CreateCreditNoteModal
        isOpen={isCreateCreditNoteOpen}
        order={null}
        orders={orders}
        onClose={() => setIsCreateCreditNoteOpen(false)}
        onCreated={() => {
          setIsCreateCreditNoteOpen(false);
          handleCreditNoteCreated();
        }}
      />

      <CreditNoteDetailModal
        isOpen={isCreditNoteDetailOpen}
        creditNote={detailCreditNote}
        order={
          detailCreditNote
            ? orders.find((o) => o.id === detailCreditNote.orderId) || null
            : null
        }
        onClose={() => setIsCreditNoteDetailOpen(false)}
        onDelete={async (creditNoteId) => {
          if (!window.confirm("Supprimer cet avoir ?")) return;
          try {
            await apiCall({
              url: `/api/admin/credit-notes/${creditNoteId}`,
              method: "DELETE",
              requireAuth: true,
            });
            setIsCreditNoteDetailOpen(false);
            setDetailCreditNote(null);
            await handleCreditNoteCreated();
          } catch (e) {
            // noop
          }
        }}
      />
    </div>
  );
};

export default OrderList;
