import React, { useEffect, useMemo, useState } from "react";
import PageHeader from "../product/ui/PageHeader";
import Button from "../product/ui/Button";
import ErrorAlert from "../product/ui/ErrorAlert";
import OrderTable from "./OrderTable";
import CreditNoteTable from "./CreditNoteTable";
import { OrderPublicDTO, CreditNotePublicDTO } from "../../dto";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";

const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<OrderPublicDTO[]>([]);
  const [creditNotes, setCreditNotes] = useState<CreditNotePublicDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

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

      const ordersData = await ordersRes.json();
      const creditNotesData = await creditNotesRes.json();

      setOrders(ordersData.orders || ordersData || []);
      setCreditNotes(creditNotesData.creditNotes || creditNotesData || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            placeholder="Rechercher (ID, client, email)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "0.85rem 1rem",
              borderRadius: 12,
              border: "2px solid #e1e5e9",
              minWidth: 320,
            }}
          />
          <Button onClick={loadData} variant="secondary" icon="fas fa-rotate">
            Actualiser
          </Button>
        </div>
      </PageHeader>

      <div style={{ marginBottom: "2.5rem" }}>
        <OrderTable orders={filteredOrders} isLoading={isLoading} />
      </div>

      <PageHeader title="Avoirs" />
      <CreditNoteTable creditNotes={creditNotes} isLoading={isLoading} />
    </div>
  );
};

export default OrderList;
