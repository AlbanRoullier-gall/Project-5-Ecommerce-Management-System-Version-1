"use client";

import React from "react";

interface FormFieldProps {
  label: string;
  name: string;
  type?: "text" | "email" | "password" | "number" | "textarea" | "select";
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  options?: Array<{ value: string | number; label: string }>;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  helpText,
  options = [],
  min,
  max,
  step,
  rows = 3,
  className = "",
}) => {
  const inputClasses = `
    form-input w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
    focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500
    disabled:bg-gray-100 disabled:cursor-not-allowed
    ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""}
    ${className}
  `.trim();

  const renderInput = () => {
    switch (type) {
      case "textarea":
        return (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            rows={rows}
            className={inputClasses}
          />
        );

      case "select":
        return (
          <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className={inputClasses}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      default:
        return (
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            className={inputClasses}
          />
        );
    }
  };

  return (
    <div className="form-group">
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {renderInput()}
      
      {error && (
        <div className="error-message text-red-600 text-sm mt-1">
          {error}
        </div>
      )}
      
      {helpText && !error && (
        <div className="text-gray-500 text-sm mt-1">
          {helpText}
        </div>
      )}
    </div>
  );
};

export default FormField;
