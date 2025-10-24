"use client";

import React, { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:13000";

interface ExportFormProps {
  year: number;
}

interface ExportOptions {
  format: "pdf" | "excel" | "csv";
  includeOrders: boolean;
  includeCreditNotes: boolean;
  includeStatistics: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

const ExportForm: React.FC<ExportFormProps> = ({ year }) => {
  const [options, setOptions] = useState<ExportOptions>({
    format: "pdf",
    includeOrders: true,
    includeCreditNotes: true,
    includeStatistics: true,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportData, setExportData] = useState<any>(null);

  const getAuthToken = () => localStorage.getItem("auth_token");

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    setExportData(null);

    try {
      const token = getAuthToken();
      if (!token) throw new Error("Non authentifié");

      const queryParams = new URLSearchParams({
        format: options.format,
        includeOrders: options.includeOrders.toString(),
        includeCreditNotes: options.includeCreditNotes.toString(),
        includeStatistics: options.includeStatistics.toString(),
      });

      if (options.dateRange?.start) {
        queryParams.append("startDate", options.dateRange.start);
      }
      if (options.dateRange?.end) {
        queryParams.append("endDate", options.dateRange.end);
      }

      const response = await fetch(
        `${API_URL}/api/admin/accounting/years/${year}/export?${queryParams}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'export");
      }

      const data = await response.json();
      setExportData(data.data);

      // Pour l'instant, on affiche les données dans la console
      // TODO: Implémenter le téléchargement réel de fichiers
      console.log("Données exportées:", data.data);

      alert(`Export ${options.format.toUpperCase()} généré avec succès !`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount || 0);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Options d'Export
      </h2>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Format d'export */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Format d'export
          </label>
          <select
            value={options.format}
            onChange={(e) =>
              setOptions({ ...options, format: e.target.value as any })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="pdf">PDF (Pour impression)</option>
            <option value="excel">Excel (Pour analyse)</option>
            <option value="csv">CSV (Pour import)</option>
          </select>
        </div>

        {/* Plage de dates */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Plage de dates (optionnel)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={options.dateRange?.start || ""}
              onChange={(e) =>
                setOptions({
                  ...options,
                  dateRange: { ...options.dateRange, start: e.target.value },
                })
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Date de début"
            />
            <input
              type="date"
              value={options.dateRange?.end || ""}
              onChange={(e) =>
                setOptions({
                  ...options,
                  dateRange: { ...options.dateRange, end: e.target.value },
                })
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Date de fin"
            />
          </div>
        </div>
      </div>

      {/* Options d'inclusion */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Données à inclure
        </label>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={options.includeOrders}
              onChange={(e) =>
                setOptions({ ...options, includeOrders: e.target.checked })
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              Commandes archivées
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={options.includeCreditNotes}
              onChange={(e) =>
                setOptions({ ...options, includeCreditNotes: e.target.checked })
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Avoirs archivés</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={options.includeStatistics}
              onChange={(e) =>
                setOptions({ ...options, includeStatistics: e.target.checked })
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              Statistiques de l'année
            </span>
          </label>
        </div>
      </div>

      {/* Bouton d'export */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleExport}
          disabled={
            isExporting ||
            (!options.includeOrders &&
              !options.includeCreditNotes &&
              !options.includeStatistics)
          }
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isExporting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Export en cours...
            </>
          ) : (
            <>
              <i className="fas fa-download mr-2"></i>
              Exporter {options.format.toUpperCase()}
            </>
          )}
        </button>
      </div>

      {/* Aperçu des données exportées */}
      {exportData && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Aperçu des données exportées
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exportData.statistics && (
              <div className="bg-white p-4 rounded border">
                <h4 className="font-medium text-gray-900 mb-2">Statistiques</h4>
                <div className="text-sm text-gray-600">
                  <div>
                    Commandes: {exportData.statistics.orders?.total_orders || 0}
                  </div>
                  <div>
                    Montant:{" "}
                    {formatCurrency(
                      exportData.statistics.orders?.total_amount_ttc || 0
                    )}
                  </div>
                  <div>
                    Avoirs:{" "}
                    {exportData.statistics.credit_notes?.total_credit_notes ||
                      0}
                  </div>
                </div>
              </div>
            )}
            {exportData.orders && (
              <div className="bg-white p-4 rounded border">
                <h4 className="font-medium text-gray-900 mb-2">Commandes</h4>
                <div className="text-sm text-gray-600">
                  {exportData.orders.length} commande
                  {exportData.orders.length > 1 ? "s" : ""} exportée
                  {exportData.orders.length > 1 ? "s" : ""}
                </div>
              </div>
            )}
            {exportData.credit_notes && (
              <div className="bg-white p-4 rounded border">
                <h4 className="font-medium text-gray-900 mb-2">Avoirs</h4>
                <div className="text-sm text-gray-600">
                  {exportData.credit_notes.length} avoir
                  {exportData.credit_notes.length > 1 ? "s" : ""} exporté
                  {exportData.credit_notes.length > 1 ? "s" : ""}
                </div>
              </div>
            )}
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Généré le{" "}
            {new Date(exportData.generated_at).toLocaleString("fr-FR")}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportForm;
