"use client";

import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import { UserCreateDTO } from "dto";
import authStyles from "../../styles/components/Auth.module.css";
import pageStyles from "../../styles/components/AuthPage.module.css";
import alertsStyles from "../../styles/components/Alerts.module.css";
import formErrorStyles from "../../styles/components/FormError.module.css";

/**
 * Page d'inscription au backoffice
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    const newErrors: Record<string, string> = {};
    if (!formData.firstName) newErrors.firstName = "Prénom est requis";
    if (!formData.lastName) newErrors.lastName = "Nom est requis";
    if (!formData.email) newErrors.email = "Adresse email est requise";
    if (!formData.password) newErrors.password = "Mot de passe est requis";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Confirmation du mot de passe est requise";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    const validation = await validatePassword(
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
                  <h1 className={authStyles.authTitle}>Créer un compte</h1>
                  <p className={authStyles.authSubtitle}>
                    Rejoignez l'équipe d'administration
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
                      <span className={alertsStyles.alertTitle}>Erreur :</span>
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
                      <span className={alertsStyles.alertTitle}>Succès :</span>
                      <div>{success}</div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className={authStyles.authForm}>
                  <div className={authStyles.formGroup}>
                    <label htmlFor="firstName" className={authStyles.formLabel}>
                      Prénom
                      <span className={authStyles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      placeholder="Votre prénom"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`${authStyles.formInput} ${
                        errors.firstName ? authStyles.formInputError : ""
                      }`}
                      disabled={isLoading}
                    />
                    {errors.firstName && (
                      <div className={formErrorStyles.error}>
                        <i
                          className={`fas fa-exclamation-circle ${formErrorStyles.icon}`}
                        ></i>
                        <span className={formErrorStyles.text}>
                          {errors.firstName}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className={authStyles.formGroup}>
                    <label htmlFor="lastName" className={authStyles.formLabel}>
                      Nom
                      <span className={authStyles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      placeholder="Votre nom"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`${authStyles.formInput} ${
                        errors.lastName ? authStyles.formInputError : ""
                      }`}
                      disabled={isLoading}
                    />
                    {errors.lastName && (
                      <div className={formErrorStyles.error}>
                        <i
                          className={`fas fa-exclamation-circle ${formErrorStyles.icon}`}
                        ></i>
                        <span className={formErrorStyles.text}>
                          {errors.lastName}
                        </span>
                      </div>
                    )}
                  </div>

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

                  <div className={authStyles.formGroup}>
                    <label htmlFor="password" className={authStyles.formLabel}>
                      Mot de passe
                      <span className={authStyles.required}>*</span>
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      placeholder="Au moins 6 caractères"
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
                      placeholder="Répétez votre mot de passe"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`${authStyles.formInput} ${
                        errors.confirmPassword ? authStyles.formInputError : ""
                      }`}
                      disabled={isLoading}
                    />
                    {errors.confirmPassword && (
                      <div className={formErrorStyles.error}>
                        <i
                          className={`fas fa-exclamation-circle ${formErrorStyles.icon}`}
                        ></i>
                        <span className={formErrorStyles.text}>
                          {errors.confirmPassword}
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
                      "Créer le compte"
                    )}
                  </button>
                </form>

                <div className={authStyles.authLinks}>
                  <Link href="/auth/login" className={authStyles.authLink}>
                    Déjà un compte ?
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

export default RegisterPage;
