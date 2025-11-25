import React, { useState, useEffect } from "react";
import {
  CustomerPublicDTO,
  AddressPublicDTO,
  AddressCreateDTO,
  AddressUpdateDTO,
} from "../../dto";
import Button from "../shared/Button";
import ErrorAlert from "../shared/ErrorAlert";
import FormInput from "../shared/form/FormInput";
import FormCheckbox from "../shared/form/FormCheckbox";
import FormActions from "../shared/form/FormActions";

/** URL de l'API depuis les variables d'environnement */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";

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
 * Composant de gestion des adresses d'un client
 * Permet de visualiser, ajouter, modifier et supprimer les adresses
 */
const AddressManagement: React.FC<AddressManagementProps> = ({
  customer,
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
  const handleCreateAddress = async (
    data: AddressCreateDTO | AddressUpdateDTO
  ) => {
    // S'assurer que les données sont de type AddressCreateDTO
    const createData: AddressCreateDTO = {
      addressType: (data as AddressCreateDTO).addressType || "shipping",
      address: (data as AddressCreateDTO).address || "",
      postalCode: (data as AddressCreateDTO).postalCode || "",
      city: (data as AddressCreateDTO).city || "",
      countryName: (data as AddressCreateDTO).countryName,
      isDefault: (data as AddressCreateDTO).isDefault || false,
    };
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
          body: JSON.stringify(createData),
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
          onSubmit={editingAddress ? handleUpdateAddress : handleCreateAddress}
          onCancel={handleCancelForm}
          isLoading={isLoading}
        />
      )}

      {!showAddressForm && (
        <AddressTable
          addresses={addresses}
          onEdit={handleEditAddress}
          onDelete={handleDeleteAddress}
        />
      )}
    </div>
  );
};

export default AddressManagement;

/**
 * Formulaire de création/édition d'adresse
 */
interface AddressFormProps {
  address: AddressPublicDTO | null;
  onSubmit: (data: AddressCreateDTO | AddressUpdateDTO) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({
  address,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState<Partial<AddressCreateDTO>>({
    address: "",
    postalCode: "",
    city: "",
    countryName: "",
    isDefault: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (address) {
      setFormData({
        address: address.address,
        postalCode: address.postalCode,
        city: address.city,
        countryName: address.countryName,
        isDefault: address.isDefault,
      });
    } else {
      setFormData({
        address: "",
        postalCode: "",
        city: "",
        countryName: "",
        isDefault: false,
      });
    }
  }, [address]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.address?.trim()) {
      newErrors.address = "L'adresse est requise";
    }

    if (!formData.postalCode?.trim()) {
      newErrors.postalCode = "Le code postal est requis";
    }

    if (!formData.city?.trim()) {
      newErrors.city = "La ville est requise";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (address) {
      const updateData: AddressUpdateDTO = {};
      if (formData.address !== address.address) {
        updateData.address = formData.address;
      }
      if (formData.postalCode !== address.postalCode) {
        updateData.postalCode = formData.postalCode;
      }
      if (formData.city !== address.city) {
        updateData.city = formData.city;
      }
      if (formData.isDefault !== address.isDefault) {
        updateData.isDefault = formData.isDefault;
      }

      onSubmit(updateData);
    } else {
      const createData: AddressCreateDTO = {
        addressType: "shipping",
        address: formData.address || "",
        postalCode: formData.postalCode || "",
        city: formData.city || "",
        countryName: formData.countryName,
        isDefault: formData.isDefault || false,
      };
      onSubmit(createData);
    }
  };

  return (
    <div
      style={{
        background: "#f9fafb",
        borderRadius: "12px",
        padding: "1.5rem",
        marginBottom: "2rem",
        border: "1px solid #e5e7eb",
      }}
    >
      <h3
        style={{
          fontSize: "1.4rem",
          fontWeight: "600",
          color: "#13686a",
          marginBottom: "1.5rem",
        }}
      >
        {address ? "Modifier l'adresse" : "Nouvelle adresse"}
      </h3>

      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <div style={{ gridColumn: "1 / -1" }}>
            <FormInput
              id="address"
              label="Adresse"
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
              required
              error={errors.address}
            />
          </div>

          <FormInput
            id="postalCode"
            label="Code postal"
            name="postalCode"
            value={formData.postalCode || ""}
            onChange={handleChange}
            required
            error={errors.postalCode}
          />
          <FormInput
            id="city"
            label="Ville"
            name="city"
            value={formData.city || ""}
            onChange={handleChange}
            required
            error={errors.city}
          />
          <div className="form-group">
            <label htmlFor="countryDisplay" className="form-label">
              Pays <span className="required">*</span>
            </label>
            <input
              type="text"
              id="countryDisplay"
              name="countryName"
              value={formData.countryName || ""}
              readOnly
              className="form-input"
              style={{
                backgroundColor: "#f8f9fa",
                color: "#666",
                cursor: "not-allowed",
                border: "1px solid #e0e0e0",
              }}
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <FormCheckbox
              id="isDefault"
              label="Adresse par défaut"
              name="isDefault"
              checked={formData.isDefault || false}
              onChange={handleChange}
            />
          </div>
        </div>
        <FormActions
          onCancel={onCancel}
          isLoading={isLoading}
          submitLabel={address ? "Mettre à jour" : "Créer l'adresse"}
        />
      </form>
    </div>
  );
};

/**
 * Tableau des adresses
 */
interface AddressTableProps {
  addresses: AddressPublicDTO[];
  onEdit: (address: AddressPublicDTO) => void;
  onDelete: (addressId: number) => void;
}

const AddressTable: React.FC<AddressTableProps> = ({
  addresses,
  onEdit,
  onDelete,
}) => {
  if (addresses.length === 0) {
    return (
      <div
        style={{
          background: "#f9fafb",
          padding: "3rem 2rem",
          borderRadius: "12px",
          textAlign: "center",
          border: "1px solid #e5e7eb",
        }}
      >
        <i
          className="fas fa-map-marker-alt"
          style={{ fontSize: "3rem", color: "#d1d5db", marginBottom: "1rem" }}
        ></i>
        <p style={{ fontSize: "1.1rem", color: "#6b7280" }}>
          Aucune adresse enregistrée
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        border: "2px solid rgba(19, 104, 106, 0.1)",
      }}
    >
      <div className="table-responsive" style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            fontSize: "1rem",
            minWidth: "800px",
          }}
        >
          <thead
            style={{
              background: "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
              color: "white",
            }}
          >
            <tr>
              <th style={headerCellStyle}>Adresse</th>
              <th style={{ ...headerCellStyle, textAlign: "center" }}>
                Code postal
              </th>
              <th style={headerCellStyle}>Ville</th>
              <th className="mobile-hide" style={headerCellStyle}>
                Pays
              </th>
              <th style={{ ...headerCellStyle, textAlign: "center" }}>
                Par défaut
              </th>
              <th style={{ ...headerCellStyle, textAlign: "center" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {addresses.map((address) => (
              <AddressTableRow
                key={address.addressId}
                address={address}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const headerCellStyle: React.CSSProperties = {
  padding: "1.25rem 1.25rem",
  textAlign: "left",
  fontSize: "1rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

interface AddressTableRowProps {
  address: AddressPublicDTO;
  onEdit: (address: AddressPublicDTO) => void;
  onDelete: (addressId: number) => void;
}

const AddressTableRow: React.FC<AddressTableRowProps> = ({
  address,
  onEdit,
  onDelete,
}) => {
  const buttonBaseStyle: React.CSSProperties = {
    padding: "0.75rem",
    border: "none",
    borderRadius: "8px",
    fontSize: "1.2rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "44px",
    minHeight: "44px",
  };

  return (
    <tr
      style={{
        borderBottom: "1px solid #e5e7eb",
        transition: "background-color 0.2s",
        backgroundColor: "white",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#f3f4f6";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "white";
      }}
    >
      <td style={{ padding: "1rem 1rem" }}>
        <span style={{ color: "#1f2937", fontSize: "0.95rem" }}>
          {address.address}
        </span>
      </td>
      <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
        <span style={{ color: "#6b7280", fontSize: "1rem" }}>
          {address.postalCode}
        </span>
      </td>
      <td style={{ padding: "0.75rem 1rem" }}>
        <span style={{ color: "#6b7280", fontSize: "1rem" }}>
          {address.city}
        </span>
      </td>
      <td className="mobile-hide" style={{ padding: "0.75rem 1rem" }}>
        <span style={{ color: "#6b7280", fontSize: "1rem" }}>
          {address.countryName}
        </span>
      </td>
      <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
        {address.isDefault ? (
          <span
            style={{
              padding: "0.25rem 0.75rem",
              borderRadius: "6px",
              fontSize: "0.9rem",
              fontWeight: "500",
              background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
              color: "white",
            }}
          >
            Oui
          </span>
        ) : (
          <span
            style={{
              padding: "0.25rem 0.75rem",
              borderRadius: "6px",
              fontSize: "0.9rem",
              fontWeight: "500",
              background: "linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)",
              color: "white",
            }}
          >
            Non
          </span>
        )}
      </td>
      <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
        <div
          className="action-buttons"
          style={{
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => onEdit(address)}
            className="action-btn action-btn-edit"
            title="Éditer"
            style={{
              ...buttonBaseStyle,
              background: "none",
              color: "#3b82f6",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(59, 130, 246, 0.1)";
              e.currentTarget.style.transform = "scale(1.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            onClick={() => onDelete(address.addressId)}
            className="action-btn action-btn-delete"
            title="Supprimer"
            style={{
              ...buttonBaseStyle,
              background: "none",
              color: "#ef4444",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
              e.currentTarget.style.transform = "scale(1.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  );
};
