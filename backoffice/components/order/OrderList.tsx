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
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [hasMore, setHasMore] = useState(true);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState<OrderPublicDTO | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [isCreateCreditNoteOpen, setIsCreateCreditNoteOpen] = useState(false);
  const [isCreditNoteDetailOpen, setIsCreditNoteDetailOpen] = useState(false);
  const [detailCreditNote, setDetailCreditNote] = useState<any | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

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
    } else {
      // If no pagination info, assume no more when we received empty page
      setHasMore(ordersList.length > 0);
    }

    setPage(targetPage);
  };

  const loadInitial = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loadOrdersPage(1, false);
      // Load credit notes separately
      const token = getAuthToken();
      if (token) {
        const creditNotesRes = await fetch(
          `${API_URL}/api/admin/credit-notes`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (creditNotesRes.ok) {
          const creditNotesJson = await creditNotesRes.json();
          const creditNotesList =
            creditNotesJson?.data?.creditNotes ??
            creditNotesJson?.creditNotes ??
            (Array.isArray(creditNotesJson) ? creditNotesJson : []);
          setCreditNotes(creditNotesList);
        }
      }
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
      loadInitial();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

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
    // Refresh credit notes list only
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await fetch(`${API_URL}/api/admin/credit-notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const json = await res.json();
      const creditNotesList =
        json?.data?.creditNotes ??
        json?.creditNotes ??
        (Array.isArray(json) ? json : []);
      setCreditNotes(creditNotesList);
    } catch (e) {
      // Silent refresh failure
    }
  };

  const filteredOrders = useMemo(() => {
    if (!search) return orders;
    const term = search.toLowerCase();
    return orders.filter((o) => {
      const customerName = `${o.customerFirstName || ""} ${
        o.customerLastName || ""
      }`.trim();
      return (
        String(o.id).includes(term) ||
        customerName.toLowerCase().includes(term) ||
        (o.customerEmail || "").toLowerCase().includes(term)
      );
    });
  }, [orders, search]);

  return (
    <div>
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      <PageHeader title="Commandes">
        <Button onClick={loadInitial} variant="secondary" icon="fas fa-rotate">
          Actualiser
        </Button>
      </PageHeader>

      <OrderFilters searchTerm={search} onSearchChange={setSearch} />

      <div
        ref={containerRef}
        style={{ marginBottom: "2.5rem", height: "60vh", overflowY: "auto" }}
      >
        <OrderTable
          orders={filteredOrders}
          isLoading={isLoading}
          onView={openOrderDetail}
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

      <OrderDetailModal
        isOpen={isDetailOpen}
        order={detailOrder}
        isLoading={isDetailLoading}
        error={detailError}
        onClose={() => {
          setIsDetailOpen(false);
          // If a credit note was just created, parent modal already closed; still refresh list
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
