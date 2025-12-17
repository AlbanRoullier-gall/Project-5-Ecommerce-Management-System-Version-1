import React from "react";
import { CustomerPublicDTO, CustomerCreateDTO, CustomerUpdateDTO } from "dto";
import FormInput from "../../shared/form/FormInput";
import FormActions from "../../shared/form/FormActions";
import { useCustomerForm } from "../../../hooks";
import styles from "../../../styles/components/CustomerForm.module.css";

/**
 * Props du composant CustomerForm
 */
interface CustomerFormProps {
  /** Client à éditer (null si création) */
  customer: CustomerPublicDTO | null;
  /** Callback appelé lors de la soumission */
  onSubmit: (data: CustomerCreateDTO | CustomerUpdateDTO) => void;
  /** Callback appelé lors de l'annulation */
  onCancel: () => void;
  /** État de chargement */
  isLoading: boolean;
}

/**
 * Composant formulaire de création/édition de client
 * Composant présentatif uniquement - toute la logique est dans useCustomerForm
 */
const CustomerForm: React.FC<CustomerFormProps> = ({
  customer,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const { formData, errors, handleChange, handleSubmit } = useCustomerForm({
    customer,
  });

  const onSubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(onSubmit);
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>
        {customer ? "✏️ Modifier le client" : "➕ Nouveau client"}
      </h2>

      <form onSubmit={onSubmitHandler} className={styles.form}>
        <div className={styles.grid}>
          {/* Prénom */}
          <FormInput
            id="firstName"
            label="Prénom"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            error={errors.firstName}
          />

          {/* Nom */}
          <FormInput
            id="lastName"
            label="Nom"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            error={errors.lastName}
          />

          {/* Email */}
          <FormInput
            id="email"
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            error={errors.email}
          />

          {/* Téléphone */}
          <FormInput
            id="phoneNumber"
            label="Téléphone"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber || ""}
            onChange={handleChange}
            error={errors.phoneNumber}
          />
        </div>

        <FormActions
          onCancel={onCancel}
          isLoading={isLoading}
          isEdit={!!customer}
          submitLabel={customer ? "💾 Mettre à jour" : "➕ Créer le client"}
        />
      </form>
    </div>
  );
};

export default CustomerForm;
