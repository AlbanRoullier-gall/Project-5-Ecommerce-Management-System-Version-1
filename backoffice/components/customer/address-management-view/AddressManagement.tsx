import React, { useState } from "react";
import {
  CustomerPublicDTO,
  AddressPublicDTO,
  AddressCreateDTO,
  AddressUpdateDTO,
} from "dto";
import AddressForm from "./AddressForm";
import AddressTable from "./AddressTable";
import { ManagementSection } from "../../shared";
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
      // Rediriger vers la page de gestion des clients après création réussie
      onClose();
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
      // Rediriger vers la page de gestion des clients après mise à jour réussie
      onClose();
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
    <ManagementSection
      title={`📍 Adresses de ${customer.fullName}`}
      addButtonText="Nouvelle adresse"
      onAdd={handleNewAddress}
      onClose={onClose}
      isFormOpen={showAddressForm}
      error={error}
      onErrorClose={() => setError(null)}
      formContent={
        <AddressForm
          address={editingAddress}
          onSubmit={editingAddress ? handleUpdate : handleCreate}
          onCancel={handleCancelForm}
          isLoading={isLoading}
        />
      }
      listContent={
        <AddressTable
          addresses={addresses}
          onEdit={handleEditAddress}
          onDelete={handleDelete}
        />
      }
    />
  );
};

export default AddressManagement;
