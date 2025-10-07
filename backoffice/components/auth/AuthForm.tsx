"use client";

import React, { useState } from "react";
import Link from "next/link";

interface AuthFormProps {
  title: string;
  subtitle?: string;
  onSubmit: (data: any) => void;
  submitText: string;
  fields: Array<{
    name: string;
    type: string;
    label: string;
    placeholder?: string;
    required?: boolean;
  }>;
  links?: Array<{
    text: string;
    href: string;
    label: string;
  }>;
  isLoading?: boolean;
  globalError?: string;
  globalSuccess?: string;
}

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

  // Fonction pour formater les messages d'erreur longs
  const formatErrorMessage = (message: string) => {
    if (!message) return message;

    // Diviser le message en phrases et les formater
    const sentences = message.split(/[.!?]+/).filter((s) => s.trim());
    return sentences.map((sentence) => sentence.trim()).join("\n");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
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
        {globalError && (
          <div className="auth-error-global">
            <i className="fas fa-exclamation-triangle"></i>
            <div className="error-content">
              <strong>Erreur :</strong>
              <div className="error-message-text">
                {formatErrorMessage(globalError)}
              </div>
            </div>
          </div>
        )}

        {globalSuccess && (
          <div className="auth-success-global">
            <i className="fas fa-check-circle"></i>
            <div className="success-content">
              <strong>Succès :</strong>
              <div className="success-message-text">
                {formatErrorMessage(globalSuccess)}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {fields.map((field) => (
            <div key={field.name} className="form-group">
              <label htmlFor={field.name} className="form-label">
                {field.label}
                {field.required && <span className="required">*</span>}
              </label>
              <input
                type={field.type}
                id={field.name}
                name={field.name}
                placeholder={field.placeholder}
                value={formData[field.name] || ""}
                onChange={handleInputChange}
                className={`form-input ${errors[field.name] ? "error" : ""}`}
                disabled={isLoading}
              />
              {errors[field.name] && (
                <div className="error-message-field">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>{errors[field.name]}</span>
                </div>
              )}
            </div>
          ))}

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
              submitText
            )}
          </button>
        </form>

        {links.length > 0 && (
          <div className="auth-links">
            {links.map((link, index) => (
              <Link key={index} href={link.href} className="auth-link">
                {link.text}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
