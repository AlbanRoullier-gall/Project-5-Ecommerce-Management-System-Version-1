"use client";

import StatsOverview from "../components/dashboard/StatsOverview";
import QuickActions from "../components/dashboard/QuickActions";
import { PageLayout } from "../components/shared";
import styles from "../styles/components/DashboardPage.module.css";

/**
 * Page Dashboard du backoffice
 * Affiche les statistiques principales et les actions rapides
 */
const DashboardPage: React.FC = () => {
  return (
    <PageLayout
      title="Tableau de Bord"
      description="Interface d'administration pour Nature de Pierre"
      showPageHeader={false}
    >
      <h1 className={styles.pageTitle}>Tableau de Bord</h1>
      <StatsOverview />
      <QuickActions />
    </PageLayout>
  );
};

export default DashboardPage;
