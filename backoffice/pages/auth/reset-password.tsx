"use client";

import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AuthForm from "../../components/auth/AuthForm";
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

  const handleEmailSubmit = async (formData: any) => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    const result = await requestPasswordReset(formData.email);

    if (result.success) {
      setSuccess(result.message || "Email envoyé avec succès");
    } else {
      setError(result.error || "Erreur lors de l'envoi de l'email");
    }

    setIsLoading(false);
  };

  const handlePasswordReset = async (formData: any) => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Validation via le contexte
    const validation = validatePassword(
      formData.password,
      formData.confirmPassword
    );

    if (!validation.isValid) {
      setError(validation.error || "Erreur de validation");
      setIsLoading(false);
      return;
    }

    // Récupérer le token depuis l'URL ou depuis formData
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");
    const token = tokenFromUrl || formData.token;

    if (!token) {
      setError(AUTH_ERROR_MESSAGES.TOKEN_MISSING);
      setIsLoading(false);
      return;
    }

    const result = await confirmPasswordReset(token, formData.password);

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

  const emailFields = [
    {
      name: "email",
      type: "email",
      label: "Adresse email",
      placeholder: "votre@email.com",
      required: true,
    },
  ];

  const resetFields = [
    {
      name: "password",
      type: "password",
      label: "Nouveau mot de passe",
      placeholder: "Au moins 6 caractères",
      required: true,
    },
    {
      name: "confirmPassword",
      type: "password",
      label: "Confirmer le nouveau mot de passe",
      placeholder: "Répétez votre nouveau mot de passe",
      required: true,
    },
  ];

  const emailLinks = [
    {
      text: "Retour à la connexion",
      href: "/auth/login",
      label: "Se connecter",
    },
  ];

  const resetLinks = [
    {
      text: "Retour à la connexion",
      href: "/auth/login",
      label: "Se connecter",
    },
  ];

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
          {step === "email" ? (
            <AuthForm
              title="Mot de passe oublié"
              subtitle="Entrez votre adresse email pour recevoir un code de réinitialisation"
              onSubmit={handleEmailSubmit}
              submitText="Envoyer le code"
              fields={emailFields}
              links={emailLinks}
              isLoading={isLoading}
              globalError={error}
              globalSuccess={success}
            />
          ) : (
            <AuthForm
              title="Nouveau mot de passe"
              subtitle="Entrez le code reçu par email et votre nouveau mot de passe"
              onSubmit={handlePasswordReset}
              submitText="Réinitialiser le mot de passe"
              fields={resetFields}
              links={resetLinks}
              isLoading={isLoading}
              globalError={error}
              globalSuccess={success}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default ResetPasswordPage;
