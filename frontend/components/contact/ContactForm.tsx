"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const emailData = {
        to: { email: "u4999410740@gmail.com", name: "Nature de Pierre" },
        subject: formData.subject || "Nouveau message de contact",
        message: formData.message,
        clientName: formData.name,
        clientEmail: formData.email,
      };

      const response = await fetch(`${API_URL}/api/email/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Erreur d'envoi");

      setSubmitStatus({
        type: "success",
        message:
          "Votre message a été envoyé avec succès ! Nous vous répondrons bientôt.",
      });
      setFormData({ email: "", name: "", subject: "", message: "" });
    } catch (error: any) {
      setSubmitStatus({
        type: "error",
        message:
          error.message ||
          "Une erreur s'est produite lors de l'envoi du message. Veuillez réessayer.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div
      style={{
        background: "white",
        padding: "2rem",
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h2
        style={{
          fontSize: "2rem",
          color: "#13686a",
          marginBottom: "2rem",
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        Envoyez-nous un message
      </h2>

      {submitStatus.type && (
        <div
          style={{
            padding: "1rem",
            marginBottom: "1.5rem",
            borderRadius: "4px",
            backgroundColor:
              submitStatus.type === "success" ? "#d4edda" : "#f8d7da",
            color: submitStatus.type === "success" ? "#155724" : "#721c24",
            border: `1px solid ${
              submitStatus.type === "success" ? "#c3e6cb" : "#f5c6cb"
            }`,
          }}
        >
          {submitStatus.message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label
            htmlFor="name"
            style={{
              fontSize: "1rem",
              color: "#13686a",
              marginBottom: "0.5rem",
              fontWeight: "bold",
            }}
          >
            Nom
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={{
              padding: "0.75rem",
              fontSize: "1rem",
              border: "1px solid #ddd",
              borderRadius: "4px",
              transition: "border-color 0.3s ease",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#13686a";
              e.currentTarget.style.outline = "none";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#ddd";
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label
            htmlFor="email"
            style={{
              fontSize: "1rem",
              color: "#13686a",
              marginBottom: "0.5rem",
              fontWeight: "bold",
            }}
          >
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{
              padding: "0.75rem",
              fontSize: "1rem",
              border: "1px solid #ddd",
              borderRadius: "4px",
              transition: "border-color 0.3s ease",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#13686a";
              e.currentTarget.style.outline = "none";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#ddd";
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label
            htmlFor="subject"
            style={{
              fontSize: "1rem",
              color: "#13686a",
              marginBottom: "0.5rem",
              fontWeight: "bold",
            }}
          >
            Sujet
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            style={{
              padding: "0.75rem",
              fontSize: "1rem",
              border: "1px solid #ddd",
              borderRadius: "4px",
              transition: "border-color 0.3s ease",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#13686a";
              e.currentTarget.style.outline = "none";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#ddd";
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label
            htmlFor="message"
            style={{
              fontSize: "1rem",
              color: "#13686a",
              marginBottom: "0.5rem",
              fontWeight: "bold",
            }}
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            value={formData.message}
            onChange={handleChange}
            style={{
              padding: "0.75rem",
              fontSize: "1rem",
              border: "1px solid #ddd",
              borderRadius: "4px",
              resize: "vertical",
              fontFamily: "inherit",
              transition: "border-color 0.3s ease",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#13686a";
              e.currentTarget.style.outline = "none";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#ddd";
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: "1rem 2rem",
            background: isSubmitting
              ? "#ccc"
              : "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "1.1rem",
            fontWeight: "600",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            transition: "transform 0.2s ease",
            opacity: isSubmitting ? 0.7 : 1,
          }}
          onMouseOver={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.transform = "translateY(-2px)";
            }
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
        </button>
      </form>
    </div>
  );
}
