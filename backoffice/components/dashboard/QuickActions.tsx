import React from "react";
import Link from "next/link";
import styles from "../../styles/components/DashboardCards.module.css";

const QuickActions: React.FC = () => {
  return (
    <div className={styles.quickActions}>
      <h2 className={styles.quickActionsTitle}>Actions Rapides</h2>
      <div className={styles.actionsGrid}>
        <Link href="/products" className={styles.actionCard}>
          <i className={`fas fa-box ${styles.actionIcon}`}></i>
          <span className={styles.actionTitle}>Gérer les Produits</span>
        </Link>

        <Link href="/customers" className={styles.actionCard}>
          <i className={`fas fa-users ${styles.actionIcon}`}></i>
          <span className={styles.actionTitle}>Gérer les Clients</span>
        </Link>

        <Link href="/orders" className={styles.actionCard}>
          <i className={`fas fa-shopping-bag ${styles.actionIcon}`}></i>
          <span className={styles.actionTitle}>Voir les Commandes</span>
        </Link>
      </div>
    </div>
  );
};

export default QuickActions;
