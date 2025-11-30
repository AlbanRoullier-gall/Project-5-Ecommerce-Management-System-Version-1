/**
 * Index des composants partagés du frontend
 * Facilite l'import des composants
 */

// Composants de formulaire
export { default as FormInput } from "./form/FormInput";
export { default as FormTextarea } from "./form/FormTextarea";
export { default as FormSelect } from "./form/FormSelect";
export type { FormSelectOption } from "./form/FormSelect";
export { default as FormContainer } from "./form/FormContainer";

// Composants UI
export { default as Button } from "./Button";
export type { ButtonVariant } from "./Button";
export { default as LoadingSpinner } from "./LoadingSpinner";
export { default as Alert } from "./Alert";
export type { AlertType } from "./Alert";
export { default as StepIndicator } from "./StepIndicator";
export type { Step } from "./StepIndicator";
export { default as StepBadge } from "./StepBadge";
export { default as FormHeader } from "./FormHeader";
export { default as QuantitySelector } from "./QuantitySelector";
export { default as SummaryRow } from "./SummaryRow";
export type { SummaryRowVariant } from "./SummaryRow";

// Composants d'affichage
export { default as ItemDisplay } from "./ItemDisplay";

// Utilitaires
export { formatPrice, formatAmount, formatCurrency } from "./utils/formatPrice";
