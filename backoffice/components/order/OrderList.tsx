import React, { useEffect, useMemo, useRef, useState } from "react";
import PageHeader from "../product/ui/PageHeader";
import Button from "../product/ui/Button";
import ErrorAlert from "../product/ui/ErrorAlert";
import OrderTable from "./OrderTable";
import CreditNoteTable from "./CreditNoteTable";
import CreditNoteDetailModal from "./CreditNoteDetailModal";
import OrderFilters from "./OrderFilters";
import { OrderPublicDTO, CreditNotePublicDTO } from "../../dto";
import OrderDetailModal from "./OrderDetailModal";
import CreateCreditNoteModal from "./CreateCreditNoteModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";

const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<OrderPublicDTO[]>([]);
  const [creditNotes, setCreditNotes] = useState<CreditNotePublicDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [deliveryFilter, setDeliveryFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [hasMore, setHasMore] = useState(true);

  // États pour la pagination des avoirs
  const [creditNotesPage, setCreditNotesPage] = useState(1);
  const [hasMoreCreditNotes, setHasMoreCreditNotes] = useState(true);
  const [isLoadingMoreCreditNotes, setIsLoadingMoreCreditNotes] =
    useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState<OrderPublicDTO | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [isCreateCreditNoteOpen, setIsCreateCreditNoteOpen] = useState(false);
  const [isCreditNoteDetailOpen, setIsCreditNoteDetailOpen] = useState(false);
  const [detailCreditNote, setDetailCreditNote] = useState<any | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const creditNotesSentinelRef = useRef<HTMLDivElement | null>(null);
  const creditNotesContainerRef = useRef<HTMLDivElement | null>(null);

  const getAuthToken = () => localStorage.getItem("auth_token");

  const loadOrdersPage = async (targetPage: number, append: boolean) => {
    const token = getAuthToken();
    if (!token) throw new Error("Non authentifié");

    const url = new URL(`${API_URL}/api/admin/orders`);
    url.searchParams.set("page", String(targetPage));
    url.searchParams.set("limit", String(limit));
    if (search) url.searchParams.set("search", search);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Erreur chargement commandes");
    const json = await res.json();
    let ordersList: OrderPublicDTO[] =
      json?.data?.orders ?? json?.orders ?? (Array.isArray(json) ? json : []);

    // Appliquer le filtre par année côté client
    if (yearFilter) {
      ordersList = ordersList.filter((order) => {
        const orderYear = new Date(order.createdAt).getFullYear();
        return orderYear.toString() === yearFilter;
      });
    }

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
    } else {
      // If no pagination info, assume no more when we received empty page
      setHasMore(ordersList.length > 0);
    }

    setPage(targetPage);
  };

  const loadCreditNotesPage = async (targetPage: number, append: boolean) => {
    const token = getAuthToken();
    if (!token) throw new Error("Non authentifié");

    const url = new URL(`${API_URL}/api/admin/credit-notes`);
    url.searchParams.set("page", String(targetPage));
    url.searchParams.set("limit", String(limit));

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Erreur chargement avoirs");
    const json = await res.json();
    let creditNotesList: CreditNotePublicDTO[] =
      json?.data?.creditNotes ??
      json?.creditNotes ??
      (Array.isArray(json) ? json : []);

    // Appliquer le filtre par année côté client
    if (yearFilter) {
      creditNotesList = creditNotesList.filter((creditNote) => {
        const creditNoteYear = new Date(creditNote.createdAt).getFullYear();
        return creditNoteYear.toString() === yearFilter;
      });
    }

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
    setHasMoreCreditNotes(true);
    setCreditNotesPage(1);
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryFilter]);

  // Reload when year filter changes
  useEffect(() => {
    setHasMore(true);
    setPage(1);
    setHasMoreCreditNotes(true);
    setCreditNotesPage(1);
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yearFilter]);

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
  }, [hasMore, isLoading, isLoadingMore, page, search]);

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
  ]);

  const toggleDeliveryStatus = async (orderId: number, delivered: boolean) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Non authentifié");

      const response = await fetch(
        `${API_URL}/api/admin/orders/${orderId}/delivery-status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ delivered }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de l'état de livraison");
      }

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

  const openOrderDetail = async (orderId: number) => {
    setIsDetailOpen(true);
    setDetailOrder(null);
    setDetailError(null);
    setIsDetailLoading(true);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Non authentifié");

      const res = await fetch(`${API_URL}/api/admin/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur lors du chargement du détail");

      const json = await res.json();
      const order: OrderPublicDTO = json?.order || json?.data?.order || json;
      setDetailOrder(order);
    } catch (e) {
      setDetailError(
        e instanceof Error ? e.message : "Erreur lors du chargement du détail"
      );
    } finally {
      setIsDetailLoading(false);
    }
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

  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Filtre par recherche
    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter((o) => {
        const customerName = `${o.customerFirstName || ""} ${
          o.customerLastName || ""
        }`.trim();
        return (
          String(o.id).includes(term) ||
          customerName.toLowerCase().includes(term) ||
          (o.customerEmail || "").toLowerCase().includes(term)
        );
      });
    }

    // Filtre par état de livraison
    if (deliveryFilter) {
      filtered = filtered.filter((o) => {
        if (deliveryFilter === "delivered") {
          return o.delivered === true;
        } else if (deliveryFilter === "pending") {
          return o.delivered === false;
        }
        return true;
      });
    }

    return filtered;
  }, [orders, search, deliveryFilter]);

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
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 4px 12px rgba(19, 104, 106, 0.3)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <i className="fas fa-filter" style={{ fontSize: "1.2rem" }}></i>
            <span style={{ fontWeight: "600" }}>
              {filteredOrders.length} commande
              {filteredOrders.length !== 1 ? "s" : ""} trouvée
              {filteredOrders.length !== 1 ? "s" : ""}
              {deliveryFilter && (
                <span style={{ marginLeft: "0.5rem", opacity: 0.9 }}>
                  • {deliveryFilter === "delivered" ? "Livrées" : "En attente"}
                </span>
              )}
            </span>
          </div>
          <button
            onClick={() => {
              setSearch("");
              setDeliveryFilter("");
            }}
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: "500",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
            }}
          >
            <i className="fas fa-times" style={{ marginRight: "0.5rem" }}></i>
            Effacer les filtres
          </button>
        </div>
      )}

      <div
        ref={containerRef}
        style={{ marginBottom: "2.5rem", height: "60vh", overflowY: "auto" }}
      >
        <OrderTable
          orders={filteredOrders}
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
          onView={async (creditNoteId) => {
            const token = getAuthToken();
            if (!token) return;
            try {
              const res = await fetch(
                `${API_URL}/api/admin/credit-notes/${creditNoteId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              if (!res.ok)
                throw new Error("Erreur lors du chargement de l'avoir");
              const json = await res.json();
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
            const token = getAuthToken();
            if (!token) return;
            try {
              const res = await fetch(
                `${API_URL}/api/admin/credit-notes/${creditNoteId}`,
                {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              if (!res.ok) throw new Error("Suppression de l'avoir échouée");
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

      <OrderDetailModal
        isOpen={isDetailOpen}
        order={detailOrder}
        isLoading={isDetailLoading}
        error={detailError}
        onClose={() => {
          setIsDetailOpen(false);
          // If a credit note was just created, parent modal already closed; still reload list
          handleCreditNoteCreated();
        }}
      />

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
          const token = getAuthToken();
          if (!token) return;
          try {
            const res = await fetch(
              `${API_URL}/api/admin/credit-notes/${creditNoteId}`,
              {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            if (!res.ok) throw new Error("Suppression de l'avoir échouée");
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
