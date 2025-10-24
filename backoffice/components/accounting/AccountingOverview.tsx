"use client";

import React, { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:13000";

interface ActiveYear {
  id: number;
  year: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface YearStats {
  year: number;
  orders: {
    total_orders: number;
    total_amount_ht: number;
    total_amount_ttc: number;
    average_order_ht: number;
    average_order_ttc: number;
  };
  credit_notes: {
    total_credit_notes: number;
    total_amount_ht: number;
    total_amount_ttc: number;
    average_credit_note_ht: number;
    average_credit_note_ttc: number;
  };
  net_revenue_ht: number;
  net_revenue_ttc: number;
}

const AccountingOverview: React.FC = () => {
  const [activeYear, setActiveYear] = useState<ActiveYear | null>(null);
  const [yearStats, setYearStats] = useState<YearStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = () => localStorage.getItem("auth_token");

  const loadActiveYear = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Non authentifié");

      const response = await fetch(
        `${API_URL}/api/admin/accounting/active-year`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Erreur chargement année active");

      const data = await response.json();
      setActiveYear(data.data);

      // Charger les statistiques de l'année active
      if (data.data) {
        await loadYearStats(data.data.year);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadYearStats = async (year: number) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(
        `${API_URL}/api/admin/accounting/years/${year}/stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setYearStats(data.data);
      }
    } catch (err) {
      console.error("Erreur chargement statistiques:", err);
    }
  };

  useEffect(() => {
    loadActiveYear();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount || 0);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <div className="text-red-600 mb-2">⚠️ Erreur</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={loadActiveYear}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Année Comptable Active
      </h2>

      {activeYear ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-blue-600">Année</div>
            <div className="text-2xl font-bold text-blue-900">
              {activeYear.year}
            </div>
            <div className="text-sm text-blue-600">
              {activeYear.status === "active" ? "Active" : "Archivée"}
            </div>
          </div>

          {yearStats && (
            <>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-green-600">
                  Commandes
                </div>
                <div className="text-2xl font-bold text-green-900">
                  {yearStats.orders.total_orders}
                </div>
                <div className="text-sm text-green-600">
                  {formatCurrency(yearStats.orders.total_amount_ttc)}
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-orange-600">
                  Avoirs
                </div>
                <div className="text-2xl font-bold text-orange-900">
                  {yearStats.credit_notes.total_credit_notes}
                </div>
                <div className="text-sm text-orange-600">
                  {formatCurrency(yearStats.credit_notes.total_amount_ttc)}
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-purple-600">
                  Chiffre Net
                </div>
                <div className="text-2xl font-bold text-purple-900">
                  {formatCurrency(yearStats.net_revenue_ttc)}
                </div>
                <div className="text-sm text-purple-600">
                  HT: {formatCurrency(yearStats.net_revenue_ht)}
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">
            Aucune année comptable active
          </div>
          <p className="text-sm text-gray-400">
            Créez une nouvelle année comptable pour commencer
          </p>
        </div>
      )}
    </div>
  );
};

export default AccountingOverview;
