"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
}) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        router.push("/auth/login");
      } else if (requireAdmin && !isAdmin) {
        // Redirect to dashboard if admin access required but user is not admin
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, router, requireAdmin]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="app">
        <div className="main-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Vérification de l'authentification...</p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated or if admin required but not admin
  if (!isAuthenticated || (requireAdmin && !isAdmin)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
