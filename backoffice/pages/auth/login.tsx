"use client";

import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Page de connexion au backoffice
 *
 * Fonctionnalités :
 * - Formulaire de connexion (email + password)
 * - Validation côté client
 * - Utilisation du contexte d'authentification pour l'appel API et le stockage
 * - Redirection vers /dashboard après connexion (AuthGuard gérera les cas rejeté/pending)
 * - Lien vers inscription et reset password
 */
const LoginPage: React.FC = () => {
  const router = useRouter();
  const { loginWithCredentials } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
              <div className="auth-header">
                <h1 className="auth-title">Connexion</h1>
                <p className="auth-subtitle">
                  Accédez à votre espace d'administration
                </p>
              </div>

              {/* Message d'erreur global */}
              {error && (
                <div className="auth-error-global">
                  <i className="fas fa-exclamation-triangle"></i>
                  <div className="error-content">
                    <strong>Erreur :</strong>
                    <div className="error-message-text">{error}</div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
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
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`form-input ${errors.email ? "error" : ""}`}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <div className="error-message-field">
                      <i className="fas fa-exclamation-circle"></i>
                      <span>{errors.email}</span>
                    </div>
                  )}
                </div>

                {/* Champ mot de passe */}
                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    Mot de passe
                    <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Votre mot de passe"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`form-input ${errors.password ? "error" : ""}`}
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <div className="error-message-field">
                      <i className="fas fa-exclamation-circle"></i>
                      <span>{errors.password}</span>
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
                    "Se connecter"
                  )}
                </button>
              </form>

              {/* Liens supplémentaires */}
              <div className="auth-links">
                <Link href="/auth/reset-password" className="auth-link">
                  Mot de passe oublié ?
                </Link>
                <Link href="/auth/register" className="auth-link">
                  Pas encore de compte ?
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
