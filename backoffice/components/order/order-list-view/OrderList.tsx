import React, { useEffect, useRef, useState } from "react";
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
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [deliveryFilter, setDeliveryFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [totalFilter, setTotalFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);

  const handleResetFilters = async () => {
    setSearch("");
    setDeliveryFilter("");
    setYearFilter("");
    setTotalFilter("");
    setDateFilter("");
    setPage(1);
    // Recharger les commandes après réinitialisation
    try {
      await loadOrdersPage(1);
    } catch (err) {
      console.error("Error reloading orders after reset:", err);
    }
  };
  const [limit] = useState(20);
  const [hasMore, setHasMore] = useState(true);
  const [totalOrders, setTotalOrders] = useState<number | null>(null);

  // États pour la pagination des avoirs
  const [creditNotesPage, setCreditNotesPage] = useState(1);
  const [hasMoreCreditNotes, setHasMoreCreditNotes] = useState(true);
  const [isLoadingMoreCreditNotes, setIsLoadingMoreCreditNotes] =
    useState(false);
  const [isCreateCreditNoteOpen, setIsCreateCreditNoteOpen] = useState(false);
  const [isCreditNoteDetailOpen, setIsCreditNoteDetailOpen] = useState(false);
  const [detailCreditNote, setDetailCreditNote] = useState<any | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const creditNotesSentinelRef = useRef<HTMLDivElement | null>(null);
  const creditNotesContainerRef = useRef<HTMLDivElement | null>(null);

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

  const loadOrdersPage = async (targetPage: number) => {
    // Construire les query params directement avec les valeurs brutes
    // Le service order-service fera le parsing et la validation
    const queryParams = new URLSearchParams();
    queryParams.set("page", String(targetPage));
    queryParams.set("limit", String(limit));
    if (search) queryParams.set("search", search);
    // Envoyer les valeurs brutes - le service fera le parsing
    if (yearFilter && yearFilter !== "") {
      queryParams.set("year", yearFilter);
    }
    if (totalFilter && totalFilter !== "") {
      queryParams.set("total", totalFilter);
    }
    if (dateFilter && dateFilter !== "") {
      queryParams.set("date", dateFilter);
    }
    // Envoyer la valeur brute - le service convertira en boolean
    if (deliveryFilter && deliveryFilter !== "") {
      queryParams.set("delivered", deliveryFilter);
    }

    const response = await apiCall<{
      data: {
        orders: OrderPublicDTO[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
          hasMore: boolean; // Calculé côté serveur
        };
      };
      message: string;
      timestamp: string;
      status: number;
    }>({
      url: `/api/admin/orders?${queryParams.toString()}`,
      method: "GET",
      requireAuth: true,
    });

    // Format standardisé : { data: { orders: [], pagination: {} }, ... }
    const ordersList = response.data?.orders || [];
    const pagination = response.data?.pagination;

    // Pour l'infinite scroll : append les nouvelles données
    // Le serveur garantit l'unicité des données entre les pages, pas besoin de déduplication
    setOrders((prev) => {
      if (targetPage === 1) {
        // Première page : remplacer
        return ordersList;
      }
      // Pages suivantes : append (le serveur garantit l'unicité)
      return [...prev, ...ordersList];
    });

    // Utiliser les métadonnées de pagination du serveur
    if (pagination) {
      setHasMore(pagination.hasMore);
      setTotalOrders(pagination.total);
    } else {
      setHasMore(false);
      setTotalOrders(ordersList.length);
    }

    setPage(targetPage);
  };

  const loadCreditNotesPage = async (targetPage: number) => {
    // Construire les query params directement avec les valeurs brutes
    // Le service order-service fera le parsing et la validation
    const queryParams = new URLSearchParams();
    queryParams.set("page", String(targetPage));
    queryParams.set("limit", String(limit));
    // Envoyer la valeur brute - le service fera le parsing
    if (yearFilter && yearFilter !== "") {
      queryParams.set("year", yearFilter);
    }

    const response = await apiCall<{
      data: {
        creditNotes: CreditNotePublicDTO[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
          hasMore: boolean; // Calculé côté serveur
        };
      };
      message: string;
      timestamp: string;
      status: number;
    }>({
      url: `/api/admin/credit-notes?${queryParams.toString()}`,
      method: "GET",
      requireAuth: true,
    });

    // Format standardisé : { data: { creditNotes: [], pagination: {} }, ... }
    const creditNotesList = response.data?.creditNotes || [];
    const pagination = response.data?.pagination;

    // Pour l'infinite scroll : append les nouvelles données
    // Le serveur garantit l'unicité des données entre les pages, pas besoin de déduplication
    setCreditNotes((prev) => {
      if (targetPage === 1) {
        // Première page : remplacer
        return creditNotesList;
      }
      // Pages suivantes : append (le serveur garantit l'unicité)
      return [...prev, ...creditNotesList];
    });

    // Utiliser les métadonnées de pagination du serveur
    if (pagination) {
      setHasMoreCreditNotes(pagination.hasMore);
    } else {
      setHasMoreCreditNotes(false);
    }

    setCreditNotesPage(targetPage);
  };

  const loadInitial = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loadOrdersPage(1);
      await loadCreditNotesPage(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitial();
  }, []);

  // Reload when search changes (debounced behavior kept simple)
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasMore(true);
      setPage(1);
      setTotalOrders(null); // Réinitialiser le total
      setHasMoreCreditNotes(true);
      setCreditNotesPage(1);
      loadInitial();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Reload when delivery filter changes
  useEffect(() => {
    setHasMore(true);
    setPage(1);
    setTotalOrders(null); // Réinitialiser le total
    setHasMoreCreditNotes(true);
    setCreditNotesPage(1);
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryFilter]);

  // Reload when year filter changes
  useEffect(() => {
    setHasMore(true);
    setPage(1);
    setTotalOrders(null); // Réinitialiser le total
    setHasMoreCreditNotes(true);
    setCreditNotesPage(1);
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yearFilter]);

  // Reload when total filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasMore(true);
      setPage(1);
      setTotalOrders(null);
      loadInitial();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalFilter]);

  // Reload when date filter changes
  useEffect(() => {
    setHasMore(true);
    setPage(1);
    setTotalOrders(null);
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFilter]);

  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore || isLoading || isLoadingMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first && first.isIntersecting) {
          setIsLoadingMore(true);
          loadOrdersPage(page + 1)
            .catch(() => {
              /* noop, error handled elsewhere via setError if needed */
            })
            .finally(() => setIsLoadingMore(false));
        }
      },
      { root: containerRef.current, rootMargin: "200px", threshold: 0 }
    );
    const node = sentinelRef.current;
    if (node) observer.observe(node);
    return () => {
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hasMore,
    isLoading,
    isLoadingMore,
    page,
    search,
    yearFilter,
    deliveryFilter,
  ]);

  // Infinite scroll observer for credit notes
  useEffect(() => {
    if (!hasMoreCreditNotes || isLoading || isLoadingMoreCreditNotes) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first && first.isIntersecting) {
          setIsLoadingMoreCreditNotes(true);
          loadCreditNotesPage(creditNotesPage + 1)
            .catch(() => {
              /* noop, error handled elsewhere via setError if needed */
            })
            .finally(() => setIsLoadingMoreCreditNotes(false));
        }
      },
      {
        root: creditNotesContainerRef.current,
        rootMargin: "200px",
        threshold: 0,
      }
    );
    const node = creditNotesSentinelRef.current;
    if (node) observer.observe(node);
    return () => {
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hasMoreCreditNotes,
    isLoading,
    isLoadingMoreCreditNotes,
    creditNotesPage,
    search,
    yearFilter,
  ]);

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
    // Reload credit notes list with pagination
    try {
      setHasMoreCreditNotes(true);
      setCreditNotesPage(1);
      await loadCreditNotesPage(1);
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
              {totalOrders !== null ? totalOrders : orders.length} commande
              {(totalOrders !== null ? totalOrders : orders.length) !== 1
                ? "s"
                : ""}{" "}
              trouvée
              {(totalOrders !== null ? totalOrders : orders.length) !== 1
                ? "s"
                : ""}
              {deliveryFilter && (
                <span style={{ marginLeft: "0.5rem", opacity: 0.9 }}>
                  • {deliveryFilter === "delivered" ? "Livrées" : "En attente"}
                </span>
              )}
            </span>
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        style={{ marginBottom: "2.5rem", height: "60vh", overflowY: "auto" }}
      >
        <OrderTable
          orders={orders}
          isLoading={isLoading}
          onView={openOrderDetail}
          onToggleDelivery={toggleDeliveryStatus}
        />
        {isLoadingMore && (
          <div
            style={{ padding: "1rem", textAlign: "center", color: "#6b7280" }}
          >
            Chargement...
          </div>
        )}
        <div ref={sentinelRef} />
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
      <div
        ref={creditNotesContainerRef}
        style={{ marginBottom: "2.5rem", height: "60vh", overflowY: "auto" }}
      >
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
              const json = await apiCall<{
                data?: { creditNote?: any };
                creditNote?: any;
              }>({
                url: `/api/admin/credit-notes/${creditNoteId}`,
                method: "GET",
                requireAuth: true,
              });
              const creditNote =
                json?.data?.creditNote || json?.creditNote || json;
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
        {isLoadingMoreCreditNotes && (
          <div
            style={{ padding: "1rem", textAlign: "center", color: "#6b7280" }}
          >
            Chargement...
          </div>
        )}
        <div ref={creditNotesSentinelRef} />
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
