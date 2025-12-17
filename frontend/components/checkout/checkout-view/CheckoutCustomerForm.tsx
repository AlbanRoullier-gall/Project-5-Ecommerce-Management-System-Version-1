import {
  FormInput,
  FormContainer,
  Button,
  FormHeader,
  Alert,
  FieldError,
} from "../../shared";
import { useCheckoutCustomerForm } from "../../../hooks";
import styles from "../../../styles/components/CheckoutCustomerForm.module.css";

export default function CheckoutCustomerForm() {
  const {
    customerData,
    isLoading,
    errors,
    generalError,
    handleChange,
    handleSubmit,
    clearError,
  } = useCheckoutCustomerForm();

  return (
    <FormContainer>
      <FormHeader stepNumber={1} title="Vos informations personnelles" />

      {generalError && (
        <Alert type="error" message={generalError} onClose={clearError} />
      )}

      <form onSubmit={handleSubmit}>
        <div className={styles.grid}>
          <div>
            <FormInput
              name="firstName"
              label="Prénom"
              value={customerData.firstName || ""}
              onChange={handleChange}
              required
              placeholder="Votre prénom"
            />
            {errors.firstName && <FieldError message={errors.firstName} />}
          </div>

          <div>
            <FormInput
              name="lastName"
              label="Nom"
              value={customerData.lastName || ""}
              onChange={handleChange}
              required
              placeholder="Votre nom"
            />
            {errors.lastName && <FieldError message={errors.lastName} />}
          </div>

          <div>
            <FormInput
              name="email"
              label="Email"
              type="email"
              value={customerData.email || ""}
              onChange={handleChange}
              required
              placeholder="votre.email@exemple.com"
            />
            {errors.email && <FieldError message={errors.email} />}
          </div>

          <div>
            <FormInput
              name="phoneNumber"
              label="Téléphone"
              type="tel"
              value={customerData.phoneNumber || ""}
              onChange={handleChange}
              placeholder="+32 123 45 67 89"
            />
            {errors.phoneNumber && <FieldError message={errors.phoneNumber} />}
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            isLoading={isLoading}
          >
            Continuer
            <i className={`fas fa-arrow-right ${styles.iconRight}`}></i>
          </Button>
        </div>
      </form>
    </FormContainer>
  );
}
