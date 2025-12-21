"use client";

import Head from "next/head";
import authStyles from "../../styles/components/Auth.module.css";
import pageStyles from "../../styles/components/AuthPage.module.css";
import alertsStyles from "../../styles/components/Alerts.module.css";
import formErrorStyles from "../../styles/components/FormError.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import { LoadingSpinner } from "../../components/shared";

/**
 * Page de connexion au backoffice
 *
 * Fonctionnalités :
 * - Formulaire de connexion (email + password)
 * - Validation côté client
 * - Utilisation du contexte d'authentification pour l'appel API et le stockage
 * - Redirection vers /dashboard après connexion (AuthGuard gérera les cas rejeté/pending)
 * - Redirection automatique vers /dashboard si déjà authentifié
 * - Lien vers inscription et reset password
 */
const LoginPage: React.FC = () => {
  const router = useRouter();
  const {
    loginWithCredentials,
    isLoading: authLoading,
    isAuthenticated,
  } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Redirige vers le dashboard si l'utilisateur est déjà authentifié
   */
  useEffect(() => {
    // Ne faire la redirection que lorsque le chargement est terminé
    if (authLoading) {
      return;
    }

    // Si l'utilisateur est déjà authentifié, rediriger vers le dashboard
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [authLoading, isAuthenticated, router]);

  /**
   * Gère les changements dans les champs du formulaire
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Effacer l'erreur lorsque l'utilisateur commence à taper
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  /**
   * Gère la soumission du formulaire de connexion
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validation de base
    const newErrors: Record<string, string> = {};
    if (!formData.email) {
      newErrors.email = "Adresse email est requise";
    }
    if (!formData.password) {
      newErrors.password = "Mot de passe est requis";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    const result = await loginWithCredentials(
      formData.email,
      formData.password
    );

    if (result.success) {
      // Rediriger vers le dashboard
      // AuthGuard sur /dashboard gérera automatiquement les cas rejeté/pending
      router.push("/dashboard");
    } else {
      setError(result.error || "Erreur de connexion");
    }

    setIsLoading(false);
  };

  // Afficher un loader pendant la vérification de l'authentification
  if (authLoading) {
    return (
      <>
        <Head>
          <title>Connexion - Nature de Pierre</title>
          <meta
            name="description"
            content="Connexion à l'interface d'administration Nature de Pierre"
          />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <LoadingSpinner message="Vérification de l'authentification..." />
      </>
    );
  }

  // Si l'utilisateur est déjà authentifié, ne rien afficher (redirection en cours)
  if (isAuthenticated) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Connexion - Nature de Pierre</title>
        <meta
          name="description"
          content="Connexion à l'interface d'administration Nature de Pierre"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={pageStyles.page}>
        <div className={pageStyles.brandPanel}>
          <div className={pageStyles.brandLogo}>
            <img
              src="/images/logoNatureDePierreIcon.svg"
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
                <div className={authStyles.authHeader}>
                  <h1 className={authStyles.authTitle}>Connexion</h1>
                  <p className={authStyles.authSubtitle}>
                    Accédez à votre espace d'administration
                  </p>
                </div>

                {/* Message d'erreur global */}
                {error && (
                  <div
                    className={`${alertsStyles.alert} ${alertsStyles.error}`}
                  >
                    <i
                      className={`fas fa-exclamation-triangle ${alertsStyles.alertIcon}`}
                    ></i>
                    <div className={alertsStyles.alertContent}>
                      <span className={alertsStyles.alertTitle}>Erreur :</span>
                      <div>{error}</div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className={authStyles.authForm}>
                  {/* Champ email */}
                  <div className={authStyles.formGroup}>
                    <label htmlFor="email" className={authStyles.formLabel}>
                      Adresse email
                      <span className={authStyles.required}>*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="votre@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`${authStyles.formInput} ${
                        errors.email ? authStyles.formInputError : ""
                      }`}
                      disabled={isLoading}
                    />
                    {errors.email && (
                      <div className={formErrorStyles.error}>
                        <i
                          className={`fas fa-exclamation-circle ${formErrorStyles.icon}`}
                        ></i>
                        <span className={formErrorStyles.text}>
                          {errors.email}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Champ mot de passe */}
                  <div className={authStyles.formGroup}>
                    <label htmlFor="password" className={authStyles.formLabel}>
                      Mot de passe
                      <span className={authStyles.required}>*</span>
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      placeholder="Votre mot de passe"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`${authStyles.formInput} ${
                        errors.password ? authStyles.formInputError : ""
                      }`}
                      disabled={isLoading}
                    />
                    {errors.password && (
                      <div className={formErrorStyles.error}>
                        <i
                          className={`fas fa-exclamation-circle ${formErrorStyles.icon}`}
                        ></i>
                        <span className={formErrorStyles.text}>
                          {errors.password}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bouton de soumission */}
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
                      "Se connecter"
                    )}
                  </button>
                </form>

                {/* Liens supplémentaires */}
                <div className={authStyles.authLinks}>
                  <Link
                    href="/auth/reset-password"
                    className={authStyles.authLink}
                  >
                    Mot de passe oublié ?
                  </Link>
                  <Link href="/auth/register" className={authStyles.authLink}>
                    Pas encore de compte ?
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
