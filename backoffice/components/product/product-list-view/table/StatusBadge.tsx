import React from "react";

/**
 * Props du composant StatusBadge
 */
interface StatusBadgeProps {
  /** Indique si le produit est actif */
  isActive: boolean;
  /** Callback appelé lors du clic pour changer le statut */
  onClick: () => void;
}

/**
 * Composant de badge de statut cliquable
 * Affiche "Actif" (vert) ou "Inactif" (rouge) et permet de changer le statut au clic
 *
 * @example
 * <StatusBadge
 *   isActive={product.isActive}
 *   onClick={() => toggleStatus(product.id, product.isActive)}
 * />
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({ isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.5rem 1.25rem",
        borderRadius: "20px",
        fontSize: "0.9rem",
        fontWeight: "600",
        cursor: "pointer",
        border: "none",
        transition: "all 0.3s ease",
        background: isActive
          ? "linear-gradient(135deg, #10b981 0%, #34d399 100%)"
          : "linear-gradient(135deg, #ef4444 0%, #f87171 100%)",
        color: "white",
        boxShadow: isActive
          ? "0 2px 8px rgba(16, 185, 129, 0.3)"
          : "0 2px 8px rgba(239, 68, 68, 0.3)",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = isActive
          ? "0 2px 8px rgba(16, 185, 129, 0.3)"
          : "0 2px 8px rgba(239, 68, 68, 0.3)";
      }}
    >
      <i className={`fas fa-${isActive ? "check-circle" : "times-circle"}`}></i>
      {isActive ? "Actif" : "Inactif"}
    </button>
  );
};

export default StatusBadge;
