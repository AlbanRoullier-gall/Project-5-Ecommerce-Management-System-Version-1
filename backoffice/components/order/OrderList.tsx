import React, { useEffect, useMemo, useState } from "react";
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
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState<OrderPublicDTO | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [isCreateCreditNoteOpen, setIsCreateCreditNoteOpen] = useState(false);
  const [isCreditNoteDetailOpen, setIsCreditNoteDetailOpen] = useState(false);
  const [detailCreditNote, setDetailCreditNote] = useState<any | null>(null);

  const getAuthToken = () => localStorage.getItem("auth_token");

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Non authentifié");

      const [ordersRes, creditNotesRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/admin/credit-notes`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!ordersRes.ok) throw new Error("Erreur chargement commandes");
      if (!creditNotesRes.ok) throw new Error("Erreur chargement avoirs");

      const ordersJson = await ordersRes.json();
      const creditNotesJson = await creditNotesRes.json();

      const ordersList =
        ordersJson?.data?.orders ??
        ordersJson?.orders ??
        (Array.isArray(ordersJson) ? ordersJson : []);

      const creditNotesList =
        creditNotesJson?.data?.creditNotes ??
        creditNotesJson?.creditNotes ??
        (Array.isArray(creditNotesJson) ? creditNotesJson : []);

      setOrders(ordersList);
      setCreditNotes(creditNotesList);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
        <Button onClick={loadData} variant="secondary" icon="fas fa-rotate">
          Actualiser
        </Button>
      </PageHeader>

      <OrderFilters searchTerm={search} onSearchChange={setSearch} />

      <div style={{ marginBottom: "2.5rem" }}>
        <OrderTable
          orders={filteredOrders}
          isLoading={isLoading}
          onView={openOrderDetail}
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
