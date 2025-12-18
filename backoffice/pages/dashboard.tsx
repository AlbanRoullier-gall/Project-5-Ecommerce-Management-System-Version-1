"use client";

import StatsOverview from "../components/dashboard/StatsOverview";
import { PageLayout } from "../components/shared";

/**
 * Page Dashboard du backoffice
 * Affiche les statistiques principales
 */
const DashboardPage: React.FC = () => {
  return (
    <PageLayout
      title="Tableau de Bord"
      description="Interface d'administration pour Nature de Pierre"
      pageTitle="Tableau de Bord"
      showPageHeader={true}
    >
      <StatsOverview />
    </PageLayout>
  );
};

export default DashboardPage;
