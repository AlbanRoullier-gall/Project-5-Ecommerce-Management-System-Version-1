import React from "react";
import Link from "next/link";

const QuickActions: React.FC = () => {
  return (
    <div className="quick-actions">
      <h2>Actions Rapides</h2>
      <div className="actions-grid">
        <Link href="/products" className="action-card">
          <i className="fas fa-box"></i>
          <span>Gérer les Produits</span>
        </Link>

        <Link href="/customers" className="action-card">
          <i className="fas fa-users"></i>
          <span>Gérer les Clients</span>
        </Link>

        <Link href="/orders" className="action-card">
          <i className="fas fa-shopping-bag"></i>
          <span>Voir les Commandes</span>
        </Link>
      </div>
    </div>
  );
};

export default QuickActions;
