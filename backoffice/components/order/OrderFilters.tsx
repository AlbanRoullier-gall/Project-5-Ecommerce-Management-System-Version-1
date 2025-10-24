import React, { useState } from "react";
import SearchInput from "../product/filters/SearchInput";

interface OrderFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  deliveryFilter: string;
  onDeliveryFilterChange: (value: string) => void;
  yearFilter: string;
  onYearFilterChange: (value: string) => void;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({
  searchTerm,
  onSearchChange,
  deliveryFilter,
  onDeliveryFilterChange,
  yearFilter,
  onYearFilterChange,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  // Générer les années disponibles (de 2025 à l'année actuelle + 5)
  const currentYear = new Date().getFullYear();
  const availableYears = [];
  for (let year = 2025; year <= currentYear + 5; year++) {
    availableYears.push(year);
  }

  const handleExportPDF = async () => {
    if (!yearFilter) {
      alert("Veuillez sélectionner une année pour l'export");
      return;
    }

    setIsExporting(true);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        alert("Non authentifié");
        return;
      }

      const response = await fetch(
        `/api/admin/exports/orders-year/${yearFilter}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "2rem",
        marginBottom: "2rem",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        border: "2px solid rgba(19, 104, 106, 0.1)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "2rem",
          alignItems: "start",
        }}
      >
        <SearchInput
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Rechercher par ID, client ou email..."
        />

        {/* Filtre par état de livraison */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <label
            style={{
              fontSize: "1rem",
              fontWeight: "600",
              color: "#13686a",
              marginBottom: "0.5rem",
            }}
          >
            État de livraison
          </label>
          <select
            value={deliveryFilter}
            onChange={(e) => onDeliveryFilterChange(e.target.value)}
            style={{
              padding: "0.75rem 1rem",
              border: "2px solid #e0e0e0",
              borderRadius: "8px",
              fontSize: "1rem",
              backgroundColor: "white",
              color: "#333",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#13686a";
              e.target.style.boxShadow = "0 0 0 3px rgba(19, 104, 106, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e0e0e0";
              e.target.style.boxShadow = "none";
            }}
          >
            <option value="">Toutes les commandes</option>
            <option value="delivered">Livrées</option>
            <option value="pending">En attente</option>
          </select>
        </div>

        {/* Filtre par année */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <label
            style={{
              fontSize: "1rem",
              fontWeight: "600",
              color: "#13686a",
              marginBottom: "0.5rem",
            }}
          >
            Année
          </label>
          <select
            value={yearFilter}
            onChange={(e) => onYearFilterChange(e.target.value)}
            style={{
              padding: "0.75rem 1rem",
              border: "2px solid #e0e0e0",
              borderRadius: "8px",
              fontSize: "1rem",
              backgroundColor: "white",
              color: "#333",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#13686a";
              e.target.style.boxShadow = "0 0 0 3px rgba(19, 104, 106, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e0e0e0";
              e.target.style.boxShadow = "none";
            }}
          >
            <option value="">Toutes les années</option>
            {availableYears.map((year) => (
              <option key={year} value={year.toString()}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Bouton d'export PDF */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <label
            style={{
              fontSize: "1rem",
              fontWeight: "600",
              color: "#13686a",
              marginBottom: "0.5rem",
            }}
          >
            Export HTML
          </label>
          <button
            onClick={handleExportPDF}
            disabled={isExporting || !yearFilter}
            style={{
              padding: "0.75rem 1rem",
              border: "2px solid #13686a",
              borderRadius: "8px",
              fontSize: "1rem",
              backgroundColor: yearFilter ? "#13686a" : "#e0e0e0",
              color: yearFilter ? "white" : "#666",
              cursor: yearFilter ? "pointer" : "not-allowed",
              transition: "all 0.2s ease",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
            onMouseEnter={(e) => {
              if (yearFilter) {
                e.currentTarget.style.backgroundColor = "#0dd3d1";
                e.currentTarget.style.borderColor = "#0dd3d1";
              }
            }}
            onMouseLeave={(e) => {
              if (yearFilter) {
                e.currentTarget.style.backgroundColor = "#13686a";
                e.currentTarget.style.borderColor = "#13686a";
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
        </div>
      </div>
    </div>
  );
};

export default OrderFilters;
