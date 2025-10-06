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
}

const AuthForm: React.FC<AuthFormProps> = ({
  title,
  subtitle,
  onSubmit,
  submitText,
  fields,
  links = [],
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

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
                <span className="error-message">{errors[field.name]}</span>
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
