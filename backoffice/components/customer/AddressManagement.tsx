import React, { useState, useEffect } from "react";
import {
  CustomerPublicDTO,
  AddressPublicDTO,
  AddressCreateDTO,
  AddressUpdateDTO,
  CountryDTO,
} from "../../dto";
import AddressForm from "./address/AddressForm";
import AddressTable from "./address/AddressTable";
import Button from "../product/ui/Button";
import ErrorAlert from "../product/ui/ErrorAlert";

/** URL de l'API depuis les variables d'environnement */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";

/**
 * Props du composant AddressManagement
 */
interface AddressManagementProps {
  /** Client dont on gère les adresses */
  customer: CustomerPublicDTO;
  /** Liste des pays disponibles */
  countries: CountryDTO[];
  /** Callback appelé pour fermer la gestion des adresses */
  onClose: () => void;
}

/**
 * Composant de gestion des adresses d'un client
 * Permet de visualiser, ajouter, modifier et supprimer les adresses
 */
const AddressManagement: React.FC<AddressManagementProps> = ({
  customer,
  countries,
  onClose,
}) => {
  const [addresses, setAddresses] = useState<AddressPublicDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressPublicDTO | null>(
    null
  );

  // Charger les adresses au montage du composant
  useEffect(() => {
    loadAddresses();
  }, [customer.customerId]);

  /**
   * Récupère le token d'authentification du localStorage
   */
  const getAuthToken = () => {
    return localStorage.getItem("auth_token");
  };

  /**
   * Charge la liste des adresses du client
   */
  const loadAddresses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const response = await fetch(
        `${API_URL}/api/admin/customers/${customer.customerId}/addresses`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Erreur lors du chargement des adresses"
        );
      }

      const data = await response.json();
      setAddresses(data.addresses || data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors du chargement"
      );
      console.error("Error loading addresses:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Crée une nouvelle adresse
   */
  const handleCreateAddress = async (data: AddressCreateDTO) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();

      const response = await fetch(
        `${API_URL}/api/admin/customers/${customer.customerId}/addresses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Erreur lors de la création de l'adresse"
        );
      }

      await loadAddresses();
      setShowAddressForm(false);
      setEditingAddress(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la création"
      );
      console.error("Error creating address:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Met à jour une adresse existante
   */
  const handleUpdateAddress = async (data: AddressUpdateDTO) => {
    if (!editingAddress) return;

    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();

      const response = await fetch(
        `${API_URL}/api/admin/customers/${customer.customerId}/addresses/${editingAddress.addressId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Erreur lors de la mise à jour de l'adresse"
        );
      }

      await loadAddresses();
      setShowAddressForm(false);
      setEditingAddress(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la mise à jour"
      );
      console.error("Error updating address:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Supprime une adresse
   */
  const handleDeleteAddress = async (addressId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette adresse ?")) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();

      const response = await fetch(
        `${API_URL}/api/admin/customers/${customer.customerId}/addresses/${addressId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Erreur lors de la suppression de l'adresse"
        );
      }

      await loadAddresses();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la suppression"
      );
      console.error("Error deleting address:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Ouvre le formulaire d'édition d'une adresse
   */
  const handleEditAddress = (address: AddressPublicDTO) => {
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  /**
   * Ouvre le formulaire de nouvelle adresse
   */
  const handleNewAddress = () => {
    setEditingAddress(null);
    setShowAddressForm(!showAddressForm);
  };

  /**
   * Ferme le formulaire d'adresse
   */
  const handleCancelForm = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
  };

  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "2rem",
        marginBottom: "2rem",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        border: "2px solid rgba(19, 104, 106, 0.1)",
      }}
    >
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      <div
        className="address-management-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "1.8rem",
              fontWeight: "700",
              color: "#13686a",
              marginBottom: "0.5rem",
            }}
          >
            Adresses de {customer.fullName}
          </h2>
          <p style={{ color: "#6b7280", fontSize: "1rem" }}>
            {addresses.length} adresse(s) enregistrée(s)
          </p>
        </div>
        <div
          className="address-management-actions"
          style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}
        >
          <Button
            onClick={handleNewAddress}
            variant="primary"
            icon="fas fa-plus"
          >
            Nouvelle adresse
          </Button>
          <Button onClick={onClose} variant="secondary" icon="fas fa-times">
            Fermer
          </Button>
        </div>
      </div>

      {showAddressForm && (
        <AddressForm
          address={editingAddress}
          countries={countries}
          onSubmit={editingAddress ? handleUpdateAddress : handleCreateAddress}
          onCancel={handleCancelForm}
          isLoading={isLoading}
        />
      )}

      {!showAddressForm && (
        <AddressTable
          addresses={addresses}
          countries={countries}
          onEdit={handleEditAddress}
          onDelete={handleDeleteAddress}
        />
      )}
    </div>
  );
};

export default AddressManagement;
