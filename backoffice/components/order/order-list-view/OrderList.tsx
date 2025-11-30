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
  OrderListRequestDTO,
  CreditNoteListRequestDTO,
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
      await loadOrdersPage(1, false);
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
      // Pour les fichiers binaires, on doit utiliser fetch directement
      const token = localStorage.getItem("auth_token");
      if (!token) {
        alert("Non authentifié");
        return;
      }

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020"
        }/api/admin/exports/orders-year/${yearFilter}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/pdf",
          },
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

  const loadOrdersPage = async (targetPage: number, append: boolean) => {
    // Construire le DTO de requête avec typage explicite
    const requestDTO: Partial<OrderListRequestDTO> = {
      page: targetPage,
      limit: limit,
      ...(search && { search }),
      ...(yearFilter && { year: parseInt(yearFilter) }),
      ...(totalFilter &&
        totalFilter !== "" && { total: parseFloat(totalFilter) }),
      ...(dateFilter && dateFilter !== "" && { date: dateFilter }),
      // Convertir le filtre de livraison en boolean pour le serveur
      ...(deliveryFilter &&
        deliveryFilter !== "" && {
          delivered: deliveryFilter === "delivered",
        }),
    };

    // Construire les query params à partir du DTO
    const queryParams = new URLSearchParams();
    if (requestDTO.page) queryParams.set("page", String(requestDTO.page));
    if (requestDTO.limit) queryParams.set("limit", String(requestDTO.limit));
    if (requestDTO.search) queryParams.set("search", requestDTO.search);
    if (requestDTO.year) queryParams.set("year", String(requestDTO.year));
    if (requestDTO.total) queryParams.set("total", String(requestDTO.total));
    if (requestDTO.date) queryParams.set("date", requestDTO.date);
    if (requestDTO.delivered !== undefined) {
      queryParams.set("delivered", String(requestDTO.delivered));
    }

    const json = await apiCall<{
      data?: { orders?: OrderPublicDTO[]; pagination?: any };
      orders?: OrderPublicDTO[];
      pagination?: any;
    }>({
      url: `/api/admin/orders?${queryParams.toString()}`,
      method: "GET",
      requireAuth: true,
    });
    const ordersList: OrderPublicDTO[] =
      json?.data?.orders ?? json?.orders ?? (Array.isArray(json) ? json : []);

    const pagination = json?.data?.pagination ?? json?.pagination ?? null;

    setOrders((prev) => {
      if (!append) return ordersList;
      const map = new Map<number, OrderPublicDTO>();
      for (const o of prev) map.set(o.id, o);
      for (const o of ordersList) map.set(o.id, o);
      return Array.from(map.values());
    });

    if (pagination) {
      const hasNext = targetPage < (pagination.pages ?? targetPage);
      setHasMore(hasNext);
      // Stocker le total de la pagination
      if (pagination.total !== undefined) {
        setTotalOrders(pagination.total);
      }
    } else {
      // If no pagination info, assume no more when we received empty page
      setHasMore(ordersList.length > 0);
      // Si pas de pagination, utiliser le nombre de commandes chargées
      if (!append) {
        setTotalOrders(ordersList.length);
      }
    }

    setPage(targetPage);
  };

  const loadCreditNotesPage = async (targetPage: number, append: boolean) => {
    // Construire le DTO de requête avec typage explicite
    const requestDTO: Partial<CreditNoteListRequestDTO> = {
      page: targetPage,
      limit: limit,
      ...(yearFilter && { year: parseInt(yearFilter) }),
    };

    // Construire les query params à partir du DTO
    const queryParams = new URLSearchParams();
    if (requestDTO.page) queryParams.set("page", String(requestDTO.page));
    if (requestDTO.limit) queryParams.set("limit", String(requestDTO.limit));
    if (requestDTO.year) queryParams.set("year", String(requestDTO.year));

    const json = await apiCall<{
      data?: { creditNotes?: CreditNotePublicDTO[]; pagination?: any };
      creditNotes?: CreditNotePublicDTO[];
      pagination?: any;
    }>({
      url: `/api/admin/credit-notes?${queryParams.toString()}`,
      method: "GET",
      requireAuth: true,
    });
    const creditNotesList: CreditNotePublicDTO[] =
      json?.data?.creditNotes ??
      json?.creditNotes ??
      (Array.isArray(json) ? json : []);

    const pagination = json?.data?.pagination ?? json?.pagination ?? null;

    setCreditNotes((prev) => {
      if (!append) return creditNotesList;
      const map = new Map<number, CreditNotePublicDTO>();
      for (const c of prev) map.set(c.id, c);
      for (const c of creditNotesList) map.set(c.id, c);
      return Array.from(map.values());
    });

    if (pagination) {
      const hasNext = targetPage < (pagination.pages ?? targetPage);
      setHasMoreCreditNotes(hasNext);
    } else {
      setHasMoreCreditNotes(creditNotesList.length > 0);
    }

    setCreditNotesPage(targetPage);
  };

  const loadInitial = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loadOrdersPage(1, false);
      await loadCreditNotesPage(1, false);
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
          loadOrdersPage(page + 1, true)
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
          loadCreditNotesPage(creditNotesPage + 1, true)
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
      await loadCreditNotesPage(1, false);
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
