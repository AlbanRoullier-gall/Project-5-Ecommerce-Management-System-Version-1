"use client";

import {
  FormInput,
  FormTextarea,
  FormContainer,
  Button,
  Alert,
} from "../shared";
import { useContactForm } from "../../hooks/useContactForm";

/**
 * Composant de présentation du formulaire de contact
 * Utilise le hook useContactForm pour gérer la logique
 */
export default function ContactForm() {
  const {
    formData,
    isSubmitting,
    submitStatus,
    handleInputChange,
    handleTextareaChange,
    handleSubmit,
    resetForm,
  } = useContactForm();
  return (
    <FormContainer className="contact-form-container">
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
        <Alert
          type={submitStatus.type}
          message={submitStatus.message}
          onClose={resetForm}
        />
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
        <FormInput
          id="name"
          name="name"
          label="Nom"
          value={formData.name}
          onChange={handleInputChange}
        />

        {/* Champ : Email (obligatoire) */}
        <FormInput
          id="email"
          name="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />

        {/* Champ : Sujet */}
        <FormInput
          id="subject"
          name="subject"
          label="Sujet"
          value={formData.subject}
          onChange={handleInputChange}
        />

        {/* Champ : Message (textarea) */}
        <FormTextarea
          id="message"
          name="message"
          label="Message"
          value={formData.message}
          onChange={handleTextareaChange}
          rows={6}
        />

        {/* Bouton de soumission avec état de chargement */}
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          isLoading={isSubmitting}
          fullWidth
        >
          {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
        </Button>
      </form>
    </FormContainer>
  );
}
