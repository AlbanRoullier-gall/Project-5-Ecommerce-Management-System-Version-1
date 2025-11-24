"use client";

import React, { useState } from "react";
import FormField from "./form/FormField";
import FormButton from "./form/FormButton";
import FormLinks from "./form/FormLinks";
import GlobalMessage from "./GlobalMessage";

/**
 * Props du composant AuthForm
 */
interface AuthFormProps {
  /** Titre du formulaire (ex: "Connexion", "Inscription") */
  title: string;
  /** Sous-titre optionnel */
  subtitle?: string;
  /** Callback appelé lors de la soumission */
  onSubmit: (data: any) => void;
  /** Texte du bouton de soumission */
  submitText: string;
  /** Liste des champs du formulaire */
  fields: Array<{
    name: string;
    type: string;
    label: string;
    placeholder?: string;
    required?: boolean;
  }>;
  /** Liens supplémentaires (ex: "Mot de passe oublié ?") */
  links?: Array<{
    text: string;
    href: string;
    label: string;
  }>;
  /** Indique si une action est en cours */
  isLoading?: boolean;
  /** Message d'erreur global */
  globalError?: string;
  /** Message de succès global */
  globalSuccess?: string;
}

/**
 * Composant de formulaire d'authentification réutilisable
 *
 * Fonctionnalités :
 * - Génération dynamique des champs selon la prop `fields`
 * - Validation des champs requis
 * - Affichage des erreurs par champ et globales
 * - État de chargement avec bouton désactivé
 * - Liens additionnels configurables
 *
 * Utilisé pour : login, inscription, reset password
 *
 * @example
 * <AuthForm
 *   title="Connexion"
 *   fields={[
 *     { name: "email", type: "email", label: "Email", required: true },
 *     { name: "password", type: "password", label: "Mot de passe", required: true }
 *   ]}
 *   onSubmit={handleLogin}
 *   submitText="Se connecter"
 *   isLoading={isLoading}
 * />
 */
const AuthForm: React.FC<AuthFormProps> = ({
  title,
  subtitle,
  onSubmit,
  submitText,
  fields,
  links = [],
  isLoading = false,
  globalError,
  globalSuccess,
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Effacer l'erreur lorsque l'utilisateur commence à taper
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation de base
    const newErrors: Record<string, string> = {};
    fields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} est requis`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">{title}</h1>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        </div>

        {/* Messages globaux */}
        {globalError && <GlobalMessage message={globalError} type="error" />}
        {globalSuccess && (
          <GlobalMessage message={globalSuccess} type="success" />
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {fields.map((field) => (
            <FormField
              key={field.name}
              name={field.name}
              type={field.type}
              label={field.label}
              placeholder={field.placeholder}
              required={field.required}
              value={formData[field.name] || ""}
              error={errors[field.name]}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          ))}

          <FormButton text={submitText} isLoading={isLoading} type="submit" />
        </form>

        <FormLinks links={links} />
      </div>
    </div>
  );
};

export default AuthForm;
