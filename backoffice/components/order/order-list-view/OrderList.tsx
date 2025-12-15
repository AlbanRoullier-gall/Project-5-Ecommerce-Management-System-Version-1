import React, { useState } from "react";
import { useRouter } from "next/router";
import PageHeader from "../../shared/PageHeader";
import Button from "../../shared/Button";
import ErrorAlert from "../../shared/ErrorAlert";
import OrderTable from "./OrderTable";
import OrderFilters from "./OrderFilters";
import {
  CreateCreditNoteModal,
  CreditNoteDetailModal,
  CreditNoteTable,
} from "../credit-note-view";
import { useOrderList } from "../../../hooks";
import { CreditNotePublicDTO } from "dto";

/**
 * Composant d'affichage de la liste des commandes
 * Toute la logique métier est gérée par le hook useOrderList
 */
const OrderList: React.FC = () => {
  const router = useRouter();
  const {
    orders,
    ordersLoading,
    ordersError,
    creditNotes,
    creditNotesLoading,
    creditNotesError,
    search,
    deliveryFilter,
    yearFilter,
    totalFilter,
    dateFilter,
    setSearch,
    setDeliveryFilter,
    setYearFilter,
    setTotalFilter,
    setDateFilter,
    resetFilters,
    toggleDeliveryStatus,
    loadCreditNotes,
    loadCreditNote,
    toggleCreditNoteStatus,
    deleteCreditNote,
    setOrdersError,
    setCreditNotesError,
    isExporting,
    handleExportPDF,
  } = useOrderList();

  // États pour les modals
  const [isCreateCreditNoteOpen, setIsCreateCreditNoteOpen] = useState(false);
  const [isCreditNoteDetailOpen, setIsCreditNoteDetailOpen] = useState(false);
  const [detailCreditNote, setDetailCreditNote] =
    useState<CreditNotePublicDTO | null>(null);

  /**
   * Navigue vers la page de détail d'une commande
   */
  const openOrderDetail = (orderId: number) => {
    router.push(`/orders/${orderId}`);
  };

  /**
   * Charge un avoir et ouvre le modal de détail
   */
  const handleViewCreditNote = async (creditNoteId: number) => {
    try {
      const creditNote = await loadCreditNote(creditNoteId);
      setDetailCreditNote(creditNote);
      setIsCreditNoteDetailOpen(true);
    } catch (error) {
      console.error("Error loading credit note:", error);
    }
  };

  /**
   * Recharge les avoirs après création/modification
   */
  const handleCreditNoteCreated = async () => {
    await loadCreditNotes();
  };

  /**
   * Gère la suppression d'un avoir
   */
  const handleDeleteCreditNote = async (creditNoteId: number) => {
    if (!window.confirm("Supprimer cet avoir ?")) return;
    try {
      await deleteCreditNote(creditNoteId);
      setIsCreditNoteDetailOpen(false);
      setDetailCreditNote(null);
    } catch (error) {
      console.error("Error deleting credit note:", error);
    }
  };

  /**
   * Gère la mise à jour du statut d'un avoir
   */
  const handleToggleCreditNoteStatus = async (
    creditNoteId: number,
    newStatus: "pending" | "refunded"
  ) => {
    try {
      await toggleCreditNoteStatus(creditNoteId, newStatus);
    } catch (error) {
      alert("Erreur lors de la mise à jour du statut de l'avoir");
    }
  };

  const isLoading = ordersLoading || creditNotesLoading;
  const error = ordersError || creditNotesError;

  return (
    <div>
      {error && (
        <ErrorAlert
          message={error}
          onClose={() => {
            setOrdersError(null);
            setCreditNotesError(null);
          }}
        />
      )}

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
        onResetFilters={resetFilters}
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
          onToggleStatus={async (creditNoteId: number, newStatus: string) => {
            await handleToggleCreditNoteStatus(
              creditNoteId,
              newStatus as "pending" | "refunded"
            );
          }}
          onView={handleViewCreditNote}
          onDelete={async (creditNoteId) => {
            if (!window.confirm("Supprimer cet avoir ?")) return;
            try {
              await deleteCreditNote(creditNoteId);
              await handleCreditNoteCreated();
            } catch (error) {
              console.error("Error deleting credit note:", error);
            }
          }}
        />
      </div>

      {/* Section Export */}
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
        onClose={() => {
          setIsCreditNoteDetailOpen(false);
          setDetailCreditNote(null);
        }}
        onDelete={handleDeleteCreditNote}
      />
    </div>
  );
};

export default OrderList;
