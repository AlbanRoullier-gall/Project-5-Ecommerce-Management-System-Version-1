import React from "react";
import Badge from "../../../shared/Badge";

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
    <Badge
      type={isActive ? "active" : "inactive"}
      label={isActive ? "Actif" : "Inactif"}
      icon={`fas fa-${isActive ? "check-circle" : "times-circle"}`}
      onClick={onClick}
    />
  );
};

export default StatusBadge;
