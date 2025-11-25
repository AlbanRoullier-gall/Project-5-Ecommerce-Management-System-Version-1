"use client";

import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth, AUTH_ERROR_MESSAGES } from "../../contexts/AuthContext";

/**
 * Page de réinitialisation de mot de passe
 *
 * Processus en 2 étapes :
 *
 * 1. Étape "email" :
 *    - Formulaire de demande avec email
 *    - Utilisation du contexte pour l'appel API
 *    - Affiche message de succès
 *
 * 2. Étape "reset" (avec token dans URL) :
 *    - Formulaire de nouveau mot de passe + confirmation
 *    - Validation via le contexte
 *    - Utilisation du contexte pour l'appel API
 *    - Redirection vers login après succès
 *
 * La détection du token dans l'URL détermine l'étape affichée
 */
const ResetPasswordPage: React.FC = () => {
  const router = useRouter();
  const { requestPasswordReset, confirmPasswordReset, validatePassword } =
    useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState<"email" | "reset">("email");
  const [emailFormData, setEmailFormData] = useState({
    email: "",
  });
  const [resetFormData, setResetFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [emailErrors, setEmailErrors] = useState<Record<string, string>>({});
  const [resetErrors, setResetErrors] = useState<Record<string, string>>({});

  /**
   * Détecte le token de reset dans l'URL au montage
   * Si présent, passe à l'étape de reset
   */
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");

    if (tokenFromUrl) {
      console.log("Token détecté dans l'URL:", tokenFromUrl);
      setStep("reset");
    }
  }, []);

  /**
   * Gère les changements dans les champs du formulaire email
   */
  const handleEmailInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmailFormData((prev) => ({ ...prev, [name]: value }));
    if (emailErrors[name]) {
      setEmailErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  /**
   * Gère les changements dans les champs du formulaire reset
   */
  const handleResetInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResetFormData((prev) => ({ ...prev, [name]: value }));
    if (resetErrors[name]) {
      setResetErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  /**
   * Gère la soumission du formulaire email
   */
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Validation de base
    const newErrors: Record<string, string> = {};
    if (!emailFormData.email) {
      newErrors.email = "Adresse email est requise";
    }

    if (Object.keys(newErrors).length > 0) {
      setEmailErrors(newErrors);
      setIsLoading(false);
      return;
    }

    const result = await requestPasswordReset(emailFormData.email);

    if (result.success) {
      setSuccess(result.message || "Email envoyé avec succès");
    } else {
      setError(result.error || "Erreur lors de l'envoi de l'email");
    }

    setIsLoading(false);
  };

  /**
   * Gère la soumission du formulaire reset
   */
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Validation de base
    const newErrors: Record<string, string> = {};
    if (!resetFormData.password) {
      newErrors.password = "Nouveau mot de passe est requis";
    }
    if (!resetFormData.confirmPassword) {
      newErrors.confirmPassword = "Confirmation du mot de passe est requise";
    }

    if (Object.keys(newErrors).length > 0) {
      setResetErrors(newErrors);
      setIsLoading(false);
      return;
    }

    // Validation via le contexte
    const validation = validatePassword(
      resetFormData.password,
      resetFormData.confirmPassword
    );

    if (!validation.isValid) {
      setError(validation.error || "Erreur de validation");
      setIsLoading(false);
      return;
    }

    // Récupérer le token depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");

    if (!tokenFromUrl) {
      setError(AUTH_ERROR_MESSAGES.TOKEN_MISSING);
      setIsLoading(false);
      return;
    }

    const result = await confirmPasswordReset(
      tokenFromUrl,
      resetFormData.password
    );

    if (result.success) {
      setSuccess(result.message || "Mot de passe réinitialisé avec succès !");
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } else {
      setError(result.error || "Erreur lors de la réinitialisation");
    }

    setIsLoading(false);
  };

  return (
    <>
      <Head>
        <title>Réinitialisation - Nature de Pierre</title>
        <meta
          name="description"
          content="Réinitialiser votre mot de passe pour Nature de Pierre"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="auth-page">
        <div className="auth-background">
          <div className="auth-logo">
            <img
              src="/images/logoNatureDePierreIcon.svg"
              alt="Logo Nature de Pierre"
              className="auth-logo-img"
            />
            <h2 className="auth-logo-text">NATURE DE PIERRE</h2>
            <p className="auth-logo-subtitle">Interface d'administration</p>
          </div>
        </div>

        <div className="auth-content">
          <div className="auth-container">
            <div className="auth-card">
              {step === "email" ? (
                <>
                  <div className="auth-header">
                    <h1 className="auth-title">Mot de passe oublié</h1>
                    <p className="auth-subtitle">
                      Entrez votre adresse email pour recevoir un code de
                      réinitialisation
                    </p>
                  </div>

                  {/* Messages globaux */}
                  {error && (
                    <div className="auth-error-global">
                      <i className="fas fa-exclamation-triangle"></i>
                      <div className="error-content">
                        <strong>Erreur :</strong>
                        <div className="error-message-text">{error}</div>
                      </div>
                    </div>
                  )}
                  {success && (
                    <div className="auth-success-global">
                      <i className="fas fa-check-circle"></i>
                      <div className="success-content">
                        <strong>Succès :</strong>
                        <div className="success-message-text">{success}</div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleEmailSubmit} className="auth-form">
                    {/* Champ email */}
                    <div className="form-group">
                      <label htmlFor="email" className="form-label">
                        Adresse email
                        <span className="required">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="votre@email.com"
                        value={emailFormData.email}
                        onChange={handleEmailInputChange}
                        className={`form-input ${
                          emailErrors.email ? "error" : ""
                        }`}
                        disabled={isLoading}
                      />
                      {emailErrors.email && (
                        <div className="error-message-field">
                          <i className="fas fa-exclamation-circle"></i>
                          <span>{emailErrors.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Bouton de soumission */}
                    <button
                      type="submit"
                      className="auth-submit-btn"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          Chargement...
                        </>
                      ) : (
                        "Envoyer le code"
                      )}
                    </button>
                  </form>

                  {/* Liens supplémentaires */}
                  <div className="auth-links">
                    <Link href="/auth/login" className="auth-link">
                      Retour à la connexion
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="auth-header">
                    <h1 className="auth-title">Nouveau mot de passe</h1>
                    <p className="auth-subtitle">
                      Entrez le code reçu par email et votre nouveau mot de
                      passe
                    </p>
                  </div>

                  {/* Messages globaux */}
                  {error && (
                    <div className="auth-error-global">
                      <i className="fas fa-exclamation-triangle"></i>
                      <div className="error-content">
                        <strong>Erreur :</strong>
                        <div className="error-message-text">{error}</div>
                      </div>
                    </div>
                  )}
                  {success && (
                    <div className="auth-success-global">
                      <i className="fas fa-check-circle"></i>
                      <div className="success-content">
                        <strong>Succès :</strong>
                        <div className="success-message-text">{success}</div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handlePasswordReset} className="auth-form">
                    {/* Champ nouveau mot de passe */}
                    <div className="form-group">
                      <label htmlFor="password" className="form-label">
                        Nouveau mot de passe
                        <span className="required">*</span>
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Au moins 6 caractères"
                        value={resetFormData.password}
                        onChange={handleResetInputChange}
                        className={`form-input ${
                          resetErrors.password ? "error" : ""
                        }`}
                        disabled={isLoading}
                      />
                      {resetErrors.password && (
                        <div className="error-message-field">
                          <i className="fas fa-exclamation-circle"></i>
                          <span>{resetErrors.password}</span>
                        </div>
                      )}
                    </div>

                    {/* Champ confirmation mot de passe */}
                    <div className="form-group">
                      <label htmlFor="confirmPassword" className="form-label">
                        Confirmer le nouveau mot de passe
                        <span className="required">*</span>
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="Répétez votre nouveau mot de passe"
                        value={resetFormData.confirmPassword}
                        onChange={handleResetInputChange}
                        className={`form-input ${
                          resetErrors.confirmPassword ? "error" : ""
                        }`}
                        disabled={isLoading}
                      />
                      {resetErrors.confirmPassword && (
                        <div className="error-message-field">
                          <i className="fas fa-exclamation-circle"></i>
                          <span>{resetErrors.confirmPassword}</span>
                        </div>
                      )}
                    </div>

                    {/* Bouton de soumission */}
                    <button
                      type="submit"
                      className="auth-submit-btn"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          Chargement...
                        </>
                      ) : (
                        "Réinitialiser le mot de passe"
                      )}
                    </button>
                  </form>

                  {/* Liens supplémentaires */}
                  <div className="auth-links">
                    <Link href="/auth/login" className="auth-link">
                      Retour à la connexion
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordPage;
