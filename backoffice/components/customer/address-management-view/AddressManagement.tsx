import React, { useState } from "react";
import {
  CustomerPublicDTO,
  AddressPublicDTO,
  AddressCreateDTO,
  AddressUpdateDTO,
} from "../../../dto";
import Button from "../../shared/Button";
import ErrorAlert from "../../shared/ErrorAlert";
import AddressForm from "./AddressForm";
import AddressTable from "./AddressTable";
import { useCustomerAddresses } from "../../../hooks";

/**
 * Props du composant AddressManagement
 */
interface AddressManagementProps {
  /** Client dont on gère les adresses */
  customer: CustomerPublicDTO;
  /** Callback appelé pour fermer la gestion des adresses */
  onClose: () => void;
}

/**
 * Composant d'affichage de la gestion des adresses d'un client
 * Toute la logique métier est gérée par le hook useCustomerAddresses
 */
const AddressManagement: React.FC<AddressManagementProps> = ({
  customer,
  onClose,
}) => {
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressPublicDTO | null>(
    null
  );

  const {
    addresses,
    isLoading,
    error,
    handleCreateAddress,
    handleUpdateAddress,
    handleDeleteAddress,
    setError,
  } = useCustomerAddresses(customer.customerId);

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

  /**
   * Gère la création d'une adresse
   */
  const handleCreate = async (data: AddressCreateDTO | AddressUpdateDTO) => {
    const createData: AddressCreateDTO = {
      addressType: (data as AddressCreateDTO).addressType || "shipping",
      address: (data as AddressCreateDTO).address || "",
      postalCode: (data as AddressCreateDTO).postalCode || "",
      city: (data as AddressCreateDTO).city || "",
      countryName: (data as AddressCreateDTO).countryName,
      isDefault: (data as AddressCreateDTO).isDefault || false,
    };

    try {
      await handleCreateAddress(createData);
      setShowAddressForm(false);
      setEditingAddress(null);
    } catch (error) {
      console.error("Error creating address:", error);
    }
  };

  /**
   * Gère la mise à jour d'une adresse
   */
  const handleUpdate = async (data: AddressUpdateDTO) => {
    if (!editingAddress) return;

    try {
      await handleUpdateAddress(editingAddress.addressId, data);
      setShowAddressForm(false);
      setEditingAddress(null);
    } catch (error) {
      console.error("Error updating address:", error);
    }
  };

  /**
   * Gère la suppression d'une adresse avec confirmation
   */
  const handleDelete = async (addressId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette adresse ?")) {
      return;
    }
    try {
      await handleDeleteAddress(addressId);
    } catch (error) {
      console.error("Error deleting address:", error);
    }
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
          onSubmit={editingAddress ? handleUpdate : handleCreate}
          onCancel={handleCancelForm}
          isLoading={isLoading}
        />
      )}

      {!showAddressForm && (
        <AddressTable
          addresses={addresses}
          onEdit={handleEditAddress}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default AddressManagement;
