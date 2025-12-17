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
import styles from "../../../styles/components/OrderList.module.css";

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
        <div className={styles.filterIndicator}>
          <div className={styles.filterInfo}>
            <i className={`fas fa-filter ${styles.filterIcon}`}></i>
            <span className={styles.filterLabel}>
              {orders.length} commande{orders.length !== 1 ? "s" : ""} trouvée
              {orders.length !== 1 ? "s" : ""}
              {deliveryFilter && (
                <span className={styles.filterBadge}>
                  • {deliveryFilter === "delivered" ? "Livrées" : "En attente"}
                </span>
              )}
            </span>
          </div>
        </div>
      )}

      <div className={styles.tableSection}>
        <OrderTable
          orders={orders}
          isLoading={isLoading}
          onView={openOrderDetail}
          onToggleDelivery={toggleDeliveryStatus}
        />
      </div>

      <PageHeader title="Avoirs" />
      <div className={styles.creditHeader}>
        <div />
        <Button
          variant="primary"
          icon="fas fa-file-invoice-dollar"
          onClick={() => setIsCreateCreditNoteOpen(true)}
        >
          Créer un avoir
        </Button>
      </div>
      <div className={styles.tableSection}>
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
      <div className={styles.exportCard}>
        <h3 className={styles.exportTitle}>📊 Export des données</h3>
        <p className={styles.exportText}>
          Exportez les commandes et avoirs pour une année spécifique
        </p>
        <button
          onClick={handleExportPDF}
          disabled={isExporting || !yearFilter}
          className={`${styles.exportButton} ${
            !yearFilter || isExporting ? styles.exportButtonDisabled : ""
          }`}
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
          <p className={styles.exportHint}>
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
