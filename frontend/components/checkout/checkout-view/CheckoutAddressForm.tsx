import React from "react";
import { AddressCreateDTO } from "../../../dto";
import {
  FormInput,
  FormContainer,
  Button,
  FormHeader,
  Alert,
  FieldError,
} from "../../shared";
import { useCheckoutAddressForm } from "../../../hooks";
import styles from "../../../styles/components/CheckoutAddressForm.module.css";

interface AddressFieldsProps {
  address: Partial<AddressCreateDTO>;
  onChange: (field: string, value: string) => void;
  errors?: { [key: string]: string };
  prefix?: string;
}

const AddressFields: React.FC<AddressFieldsProps> = ({
  address,
  onChange,
  errors = {},
  prefix = "",
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.name, e.target.value);
  };

  const getError = (fieldName: string): string | undefined => {
    const errorKey = prefix ? `${prefix}.${fieldName}` : fieldName;
    return errors[errorKey];
  };

  return (
    <>
      <div>
        <FormInput
          name="address"
          label="Adresse complète"
          value={address.address || ""}
          onChange={handleInputChange}
          required
          placeholder="Numéro et nom de rue"
          fullWidth
        />
        {getError("address") && <FieldError message={getError("address")!} />}
      </div>
      <div>
        <FormInput
          name="postalCode"
          label="Code postal"
          value={address.postalCode || ""}
          onChange={handleInputChange}
          required
        />
        {getError("postalCode") && (
          <FieldError message={getError("postalCode")!} />
        )}
      </div>
      <div>
        <FormInput
          name="city"
          label="Ville"
          value={address.city || ""}
          onChange={handleInputChange}
          required
        />
        {getError("city") && <FieldError message={getError("city")!} />}
      </div>
      <div>
        <FormInput
          name="countryName"
          label="Pays"
          value={address.countryName || ""}
          onChange={handleInputChange}
          readOnly
          fullWidth
        />
        {getError("countryName") && (
          <FieldError message={getError("countryName")!} />
        )}
      </div>
    </>
  );
};

export default function CheckoutAddressForm() {
  const {
    addressData,
    isLoading,
    error,
    fieldErrors,
    handleShippingFieldChange,
    handleBillingFieldChange,
    handleUseSameBillingAddressChange,
    handleSubmit,
    handleBack,
    clearError,
  } = useCheckoutAddressForm();

  return (
    <FormContainer>
      <FormHeader stepNumber={2} title="Adresse de livraison" />

      {error && Object.keys(fieldErrors).length === 0 && (
        <Alert type="error" message={error} onClose={clearError} />
      )}

      <form onSubmit={handleSubmit}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <i className="fas fa-truck"></i>
            Adresse de livraison
          </h3>
          <div className={styles.grid}>
            <AddressFields
              address={addressData?.shipping || {}}
              onChange={handleShippingFieldChange}
              errors={fieldErrors}
              prefix="shipping"
            />
          </div>
        </div>

        <div className={styles.sameAddress}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={addressData?.useSameBillingAddress ?? true}
              onChange={(e) =>
                handleUseSameBillingAddressChange(e.target.checked)
              }
              className={styles.checkbox}
            />
            <span>
              <i className={`fas fa-check-square ${styles.iconLeft}`}></i>
              Utiliser la même adresse pour la facturation
            </span>
          </label>
        </div>

        {!(addressData?.useSameBillingAddress ?? true) && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <i className="fas fa-file-invoice"></i>
              Adresse de facturation
            </h3>
            <div className={styles.grid}>
              <AddressFields
                address={addressData?.billing || {}}
                onChange={handleBillingFieldChange}
                errors={fieldErrors}
                prefix="billing"
              />
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <Button type="button" variant="outline" onClick={handleBack}>
            <i className={`fas fa-arrow-left ${styles.iconLeft}`}></i>
            Retour
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            isLoading={isLoading}
          >
            Continuer
            <i className={`fas fa-arrow-right ${styles.iconLeft}`}></i>
          </Button>
        </div>
      </form>
    </FormContainer>
  );
}
