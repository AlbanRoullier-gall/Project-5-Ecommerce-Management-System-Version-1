"use client";

import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import authStyles from "../../styles/components/Auth.module.css";
import pageStyles from "../../styles/components/AuthPage.module.css";
import alertsStyles from "../../styles/components/Alerts.module.css";
import formErrorStyles from "../../styles/components/FormError.module.css";

/**
 * Page de réinitialisation de mot de passe (2 étapes)
 */
const ResetPasswordPage: React.FC = () => {
  const router = useRouter();
  const {
    requestPasswordReset,
    confirmPasswordReset,
    validatePassword,
    isAuthenticated,
  } = useAuth();

  const [step, setStep] = useState<"email" | "reset">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [emailFormData, setEmailFormData] = useState({ email: "" });
  const [emailErrors, setEmailErrors] = useState<Record<string, string>>({});

  const [resetFormData, setResetFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [resetErrors, setResetErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmailFormData((prev) => ({ ...prev, [name]: value }));
    if (emailErrors[name]) {
      setEmailErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleResetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResetFormData((prev) => ({ ...prev, [name]: value }));
    if (resetErrors[name]) {
      setResetErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    const newErrors: Record<string, string> = {};
    if (!emailFormData.email) newErrors.email = "Adresse email est requise";

    if (Object.keys(newErrors).length > 0) {
      setEmailErrors(newErrors);
      setIsLoading(false);
      return;
    }

    const result = await requestPasswordReset(emailFormData.email);
    if (result.success) {
      setSuccess(result.message || "Email envoyé avec succès");
      setStep("reset");
    } else {
      setError(result.error || "Erreur lors de l'envoi de l'email");
    }

    setIsLoading(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    const newErrors: Record<string, string> = {};
    if (!resetFormData.password)
      newErrors.password = "Nouveau mot de passe est requis";
    if (!resetFormData.confirmPassword)
      newErrors.confirmPassword = "Confirmation du mot de passe est requise";

    if (Object.keys(newErrors).length > 0) {
      setResetErrors(newErrors);
      setIsLoading(false);
      return;
    }

    const validation = await validatePassword(
      resetFormData.password,
      resetFormData.confirmPassword
    );
    if (!validation.isValid) {
      setError(validation.error || "Erreur de validation");
      setIsLoading(false);
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");
    if (!tokenFromUrl) {
      setError("Token de réinitialisation manquant");
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

      <div className={pageStyles.page}>
        <div className={pageStyles.brandPanel}>
          <div className={pageStyles.brandLogo}>
            <img
              src={`${process.env.NEXT_PUBLIC_BASE_PATH || (process.env.NODE_ENV === "production" ? "" : "/admin")}/images/logoNatureDePierreIcon.svg`}
              alt="Logo Nature de Pierre"
              className="auth-logo-img"
            />
            <h2 className="auth-logo-text">NATURE DE PIERRE</h2>
            <p className="auth-logo-subtitle">Interface d'administration</p>
          </div>
        </div>

        <div className={pageStyles.contentPanel}>
          <div className={authStyles.authContent}>
            <div className={authStyles.authContainer}>
              <div className={authStyles.authCard}>
                {step === "email" ? (
                  <>
                    <div className={authStyles.authHeader}>
                      <h1 className={authStyles.authTitle}>
                        Mot de passe oublié
                      </h1>
                      <p className={authStyles.authSubtitle}>
                        Entrez votre adresse email pour recevoir un code de
                        réinitialisation
                      </p>
                    </div>

                    {error && (
                      <div
                        className={`${alertsStyles.alert} ${alertsStyles.error}`}
                      >
                        <i
                          className={`fas fa-exclamation-triangle ${alertsStyles.alertIcon}`}
                        ></i>
                        <div className={alertsStyles.alertContent}>
                          <span className={alertsStyles.alertTitle}>
                            Erreur :
                          </span>
                          <div>{error}</div>
                        </div>
                      </div>
                    )}
                    {success && (
                      <div
                        className={`${alertsStyles.alert} ${alertsStyles.success}`}
                      >
                        <i
                          className={`fas fa-check-circle ${alertsStyles.alertIcon}`}
                        ></i>
                        <div className={alertsStyles.alertContent}>
                          <span className={alertsStyles.alertTitle}>
                            Succès :
                          </span>
                          <div>{success}</div>
                        </div>
                      </div>
                    )}

                    <form
                      onSubmit={handleEmailSubmit}
                      className={authStyles.authForm}
                    >
                      <div className={authStyles.formGroup}>
                        <label htmlFor="email" className={authStyles.formLabel}>
                          Adresse email
                          <span className={authStyles.required}>*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={emailFormData.email}
                          onChange={handleEmailChange}
                          className={`${authStyles.formInput} ${
                            emailErrors.email ? authStyles.formInputError : ""
                          }`}
                          disabled={isLoading}
                        />
                        {emailErrors.email && (
                          <div className={formErrorStyles.error}>
                            <i
                              className={`fas fa-exclamation-circle ${formErrorStyles.icon}`}
                            ></i>
                            <span className={formErrorStyles.text}>
                              {emailErrors.email}
                            </span>
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        className={authStyles.authSubmit}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <i className="fas fa-spinner fa-spin"></i>
                            Chargement...
                          </>
                        ) : (
                          "Envoyer"
                        )}
                      </button>
                    </form>

                    <div className={authStyles.authLinks}>
                      <Link href="/auth/login" className={authStyles.authLink}>
                        Retour à la connexion
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={authStyles.authHeader}>
                      <h1 className={authStyles.authTitle}>
                        Réinitialiser le mot de passe
                      </h1>
                      <p className={authStyles.authSubtitle}>
                        Saisissez votre nouveau mot de passe
                      </p>
                    </div>

                    {error && (
                      <div
                        className={`${alertsStyles.alert} ${alertsStyles.error}`}
                      >
                        <i
                          className={`fas fa-exclamation-triangle ${alertsStyles.alertIcon}`}
                        ></i>
                        <div className={alertsStyles.alertContent}>
                          <span className={alertsStyles.alertTitle}>
                            Erreur :
                          </span>
                          <div>{error}</div>
                        </div>
                      </div>
                    )}
                    {success && (
                      <div
                        className={`${alertsStyles.alert} ${alertsStyles.success}`}
                      >
                        <i
                          className={`fas fa-check-circle ${alertsStyles.alertIcon}`}
                        ></i>
                        <div className={alertsStyles.alertContent}>
                          <span className={alertsStyles.alertTitle}>
                            Succès :
                          </span>
                          <div>{success}</div>
                        </div>
                      </div>
                    )}

                    <form
                      onSubmit={handlePasswordReset}
                      className={authStyles.authForm}
                    >
                      <div className={authStyles.formGroup}>
                        <label
                          htmlFor="password"
                          className={authStyles.formLabel}
                        >
                          Nouveau mot de passe
                          <span className={authStyles.required}>*</span>
                        </label>
                        <input
                          type="password"
                          id="password"
                          name="password"
                          value={resetFormData.password}
                          onChange={handleResetChange}
                          className={`${authStyles.formInput} ${
                            resetErrors.password
                              ? authStyles.formInputError
                              : ""
                          }`}
                          disabled={isLoading}
                        />
                        {resetErrors.password && (
                          <div className={formErrorStyles.error}>
                            <i
                              className={`fas fa-exclamation-circle ${formErrorStyles.icon}`}
                            ></i>
                            <span className={formErrorStyles.text}>
                              {resetErrors.password}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className={authStyles.formGroup}>
                        <label
                          htmlFor="confirmPassword"
                          className={authStyles.formLabel}
                        >
                          Confirmer le mot de passe
                          <span className={authStyles.required}>*</span>
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={resetFormData.confirmPassword}
                          onChange={handleResetChange}
                          className={`${authStyles.formInput} ${
                            resetErrors.confirmPassword
                              ? authStyles.formInputError
                              : ""
                          }`}
                          disabled={isLoading}
                        />
                        {resetErrors.confirmPassword && (
                          <div className={formErrorStyles.error}>
                            <i
                              className={`fas fa-exclamation-circle ${formErrorStyles.icon}`}
                            ></i>
                            <span className={formErrorStyles.text}>
                              {resetErrors.confirmPassword}
                            </span>
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        className={authStyles.authSubmit}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <i className="fas fa-spinner fa-spin"></i>
                            Chargement...
                          </>
                        ) : (
                          "Réinitialiser"
                        )}
                      </button>
                    </form>

                    <div className={authStyles.authLinks}>
                      <Link href="/auth/login" className={authStyles.authLink}>
                        Retour à la connexion
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordPage;
