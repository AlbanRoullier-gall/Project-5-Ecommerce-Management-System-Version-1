"use client";

import { useState } from "react";

// URL de l'API pour l'envoi d'emails (depuis les variables d'environnement ou valeur par défaut)
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";

/**
 * Composant formulaire de contact
 * Permet aux utilisateurs d'envoyer un message via le formulaire
 * Gère l'état du formulaire, la soumission et l'affichage des messages de statut
 */
export default function ContactForm() {
  // État du formulaire : stocke les valeurs des champs
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    subject: "",
    message: "",
  });

  // État de soumission : indique si le formulaire est en cours d'envoi
  const [isSubmitting, setIsSubmitting] = useState(false);

  // État du statut de soumission : message de succès ou d'erreur
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  /**
   * Gère la soumission du formulaire
   * Envoie les données du formulaire à l'API d'envoi d'email
   * Affiche un message de succès ou d'erreur selon le résultat
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Empêche le rechargement de la page
    setIsSubmitting(true); // Active l'état de chargement
    setSubmitStatus({ type: null, message: "" }); // Réinitialise le statut

    try {
      // Préparation des données à envoyer à l'API
      const emailData = {
        to: { email: "u4999410740@gmail.com", name: "Nature de Pierre" },
        subject: formData.subject || "Nouveau message de contact",
        message: formData.message,
        clientName: formData.name,
        clientEmail: formData.email,
      };

      // Envoi de la requête POST à l'API d'envoi d'email
      const response = await fetch(`${API_URL}/api/email/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Erreur d'envoi");

      // Succès : affichage du message de confirmation et réinitialisation du formulaire
      setSubmitStatus({
        type: "success",
        message:
          "Votre message a été envoyé avec succès ! Nous vous répondrons bientôt.",
      });
      setFormData({ email: "", name: "", subject: "", message: "" });
    } catch (error: any) {
      // Erreur : affichage du message d'erreur
      setSubmitStatus({
        type: "error",
        message:
          error.message ||
          "Une erreur s'est produite lors de l'envoi du message. Veuillez réessayer.",
      });
    } finally {
      setIsSubmitting(false); // Désactive l'état de chargement
    }
  };

  /**
   * Gère les changements dans les champs du formulaire
   * Met à jour l'état formData avec la nouvelle valeur du champ modifié
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    // Conteneur principal du formulaire avec style de carte
    <div
      style={{
        background: "white",
        padding: "2rem",
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      {/* Titre du formulaire */}
      <h2
        style={{
          fontSize: "2rem",
          color: "#13686a",
          marginBottom: "1.5rem",
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        Envoyez-nous un message
      </h2>

      {/* Affichage conditionnel du message de statut (succès ou erreur) */}
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

      {/* Formulaire de contact */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        {/* Champ : Nom */}
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

        {/* Champ : Email (obligatoire) */}
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

        {/* Champ : Sujet */}
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

        {/* Champ : Message (textarea) */}
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

        {/* Bouton de soumission avec état de chargement */}
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
            // Effet de survol : légère élévation du bouton
            if (!isSubmitting) {
              e.currentTarget.style.transform = "translateY(-2px)";
            }
          }}
          onMouseOut={(e) => {
            // Retour à la position normale
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
        </button>
      </form>
    </div>
  );
}
