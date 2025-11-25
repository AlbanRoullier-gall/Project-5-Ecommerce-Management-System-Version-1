"use client";

import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import { UserCreateDTO } from "../../dto";

/**
 * Page d'inscription au backoffice
 *
 * Fonctionnalités :
 * - Formulaire d'inscription (prénom, nom, email, password, confirmation)
 * - Validation côté client via le contexte :
 *   * Correspondance des mots de passe
 *   * Longueur minimale du mot de passe (6 caractères)
 * - Utilisation du contexte d'authentification pour l'appel API
 * - Message de succès après inscription
 * - Redirection automatique vers login après 3 secondes
 * - Lien vers la page de connexion
 *
 * Note : L'accès au backoffice nécessite une approbation admin
 * après l'inscription
 */
const RegisterPage: React.FC = () => {
  const router = useRouter();
  const { register, validatePassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
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
   * Gère la soumission du formulaire d'inscription
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Validation de base
    const newErrors: Record<string, string> = {};
    if (!formData.firstName) {
      newErrors.firstName = "Prénom est requis";
    }
    if (!formData.lastName) {
      newErrors.lastName = "Nom est requis";
    }
    if (!formData.email) {
      newErrors.email = "Adresse email est requise";
    }
    if (!formData.password) {
      newErrors.password = "Mot de passe est requis";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirmation du mot de passe est requise";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    // Validation côté client via le contexte
    const validation = validatePassword(
      formData.password,
      formData.confirmPassword
    );

    if (!validation.isValid) {
      setError(validation.error || "Erreur de validation");
      setIsLoading(false);
      return;
    }

    const registerRequest: UserCreateDTO = {
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
    };

    const result = await register(registerRequest);

    if (result.success) {
      setSuccess(result.message || "Compte créé avec succès !");
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } else {
      setError(result.error || "Erreur lors de la création du compte");
    }

    setIsLoading(false);
  };

  return (
    <>
      <Head>
        <title>Inscription - Nature de Pierre</title>
        <meta
          name="description"
          content="Créer un compte administrateur pour Nature de Pierre"
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
                <h1 className="auth-title">Créer un compte</h1>
                <p className="auth-subtitle">
                  Rejoignez l'équipe d'administration
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

              <form onSubmit={handleSubmit} className="auth-form">
                {/* Champ prénom */}
                <div className="form-group">
                  <label htmlFor="firstName" className="form-label">
                    Prénom
                    <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    placeholder="Votre prénom"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`form-input ${errors.firstName ? "error" : ""}`}
                    disabled={isLoading}
                  />
                  {errors.firstName && (
                    <div className="error-message-field">
                      <i className="fas fa-exclamation-circle"></i>
                      <span>{errors.firstName}</span>
                    </div>
                  )}
                </div>

                {/* Champ nom */}
                <div className="form-group">
                  <label htmlFor="lastName" className="form-label">
                    Nom
                    <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    placeholder="Votre nom"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`form-input ${errors.lastName ? "error" : ""}`}
                    disabled={isLoading}
                  />
                  {errors.lastName && (
                    <div className="error-message-field">
                      <i className="fas fa-exclamation-circle"></i>
                      <span>{errors.lastName}</span>
                    </div>
                  )}
                </div>

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
                    placeholder="Au moins 6 caractères"
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

                {/* Champ confirmation mot de passe */}
                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirmer le mot de passe
                    <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Répétez votre mot de passe"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`form-input ${
                      errors.confirmPassword ? "error" : ""
                    }`}
                    disabled={isLoading}
                  />
                  {errors.confirmPassword && (
                    <div className="error-message-field">
                      <i className="fas fa-exclamation-circle"></i>
                      <span>{errors.confirmPassword}</span>
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
                    "Créer le compte"
                  )}
                </button>
              </form>

              {/* Liens supplémentaires */}
              <div className="auth-links">
                <Link href="/auth/login" className="auth-link">
                  Déjà un compte ?
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
