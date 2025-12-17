import React from "react";
import { AddressPublicDTO, AddressCreateDTO, AddressUpdateDTO } from "dto";
import FormInput from "../../shared/form/FormInput";
import FormCheckbox from "../../shared/form/FormCheckbox";
import FormActions from "../../shared/form/FormActions";
import { useAddressForm } from "../../../hooks";
import styles from "../../../styles/components/AddressForm.module.css";

/**
 * Props du composant AddressForm
 */
interface AddressFormProps {
  /** Adresse à éditer (null si création) */
  address: AddressPublicDTO | null;
  /** Callback appelé lors de la soumission */
  onSubmit: (data: AddressCreateDTO | AddressUpdateDTO) => void;
  /** Callback appelé lors de l'annulation */
  onCancel: () => void;
  /** État de chargement */
  isLoading: boolean;
}

/**
 * Formulaire de création/édition d'adresse
 * Composant présentatif uniquement - toute la logique est dans useAddressForm
 */
const AddressForm: React.FC<AddressFormProps> = ({
  address,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const { formData, errors, handleChange, handleSubmit } = useAddressForm({
    address,
  });

  const onSubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(onSubmit);
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        {address ? "Modifier l'adresse" : "Nouvelle adresse"}
      </h3>

      <form onSubmit={onSubmitHandler}>
        <div className={styles.grid}>
          <div className={styles.fullRow}>
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
          <div>
            <label htmlFor="countryDisplay" className={styles.label}>
              Pays <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="countryDisplay"
              name="countryName"
              value={formData.countryName || ""}
              readOnly
              className={`${styles.input} ${styles.readOnly}`}
            />
          </div>
          <div className={styles.fullRow}>
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

export default AddressForm;
