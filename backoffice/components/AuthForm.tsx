"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LoginData, RegisterData } from "../../shared-types";

interface AuthFormProps {
  mode: "login" | "register";
  onSubmit: (data: LoginData | RegisterData) => void;
  isLoading?: boolean;
  error?: string;
}

const AuthForm: React.FC<AuthFormProps> = ({
  mode,
  onSubmit,
  isLoading = false,
  error,
}) => {
  const [formData, setFormData] = useState<any>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

  const [errors, setErrors] = useState<any>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: any = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 6) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 6 caractères";
    }

    // Registration specific validations
    if (mode === "register") {
      if (!formData.firstName) {
        newErrors.firstName = "Le prénom est requis";
      }
      if (!formData.lastName) {
        newErrors.lastName = "Le nom est requis";
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword =
          "La confirmation du mot de passe est requise";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      if (mode === "login") {
        onSubmit({
          email: formData.email,
          password: formData.password,
        });
      } else {
        onSubmit({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName!,
          lastName: formData.lastName!,
          role: "admin",
        });
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">
            {mode === "login" ? "Connexion" : "Inscription"}
          </h2>
          <p className="auth-subtitle">
            {mode === "login"
              ? "Accédez à votre tableau de bord administrateur"
              : "Créez votre compte administrateur"}
          </p>
          {error && <div className="error-message auth-error">{error}</div>}
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <>
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">
                  Prénom *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`form-input ${errors.firstName ? "error" : ""}`}
                  placeholder="Votre prénom"
                />
                {errors.firstName && (
                  <span className="error-message">{errors.firstName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="lastName" className="form-label">
                  Nom *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`form-input ${errors.lastName ? "error" : ""}`}
                  placeholder="Votre nom"
                />
                {errors.lastName && (
                  <span className="error-message">{errors.lastName}</span>
                )}
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`form-input ${errors.email ? "error" : ""}`}
              placeholder="votre.email@exemple.com"
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Mot de passe *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`form-input ${errors.password ? "error" : ""}`}
              placeholder="Votre mot de passe"
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          {mode === "register" && (
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirmer le mot de passe *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`form-input ${
                  errors.confirmPassword ? "error" : ""
                }`}
                placeholder="Confirmez votre mot de passe"
              />
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>
          )}

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading
              ? mode === "login"
                ? "Connexion..."
                : "Inscription..."
              : mode === "login"
              ? "Se connecter"
              : "S'inscrire"}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-switch">
            {mode === "login" ? (
              <>
                Pas encore de compte ?{" "}
                <Link href="/auth/register" className="auth-link">
                  Créer un compte
                </Link>
              </>
            ) : (
              <>
                Déjà un compte ?{" "}
                <Link href="/auth/login" className="auth-link">
                  Se connecter
                </Link>
              </>
            )}
          </p>

          {mode === "login" && (
            <p className="auth-forgot">
              <Link href="/auth/forgot-password" className="auth-link">
                Mot de passe oublié ?
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
