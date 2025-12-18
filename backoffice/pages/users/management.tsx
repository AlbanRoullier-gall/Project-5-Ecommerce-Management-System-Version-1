"use client";

import { useState } from "react";
import { UserList } from "../../components/user";
import { PageLayout, PageHeader, Button } from "../../components/shared";

/**
 * Page de gestion des utilisateurs
 * Permet au super admin de gérer les utilisateurs
 */
const UserManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");

  return (
    <PageLayout
      title="Utilisateurs"
      description="Gestion des utilisateurs du backoffice"
    >
      <PageHeader title="Utilisateurs">
        <Button
          onClick={() => setActiveTab("pending")}
          variant={activeTab === "pending" ? "primary" : "secondary"}
          icon="fas fa-clock"
        >
          En attente
        </Button>
        <Button
          onClick={() => setActiveTab("all")}
          variant={activeTab === "all" ? "primary" : "secondary"}
          icon="fas fa-users"
        >
          Tous
        </Button>
      </PageHeader>

      <UserList mode={activeTab} />
    </PageLayout>
  );
};

export default UserManagementPage;
