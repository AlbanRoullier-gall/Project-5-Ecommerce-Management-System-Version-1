"use client";

import { useState } from "react";
import {
  FormInput,
  FormTextarea,
  FormContainer,
  Button,
  Alert,
} from "../shared";
import { EmailClientSendDTO } from "../../dto";

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
      const emailData: EmailClientSendDTO = {
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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
          onClose={() => setSubmitStatus({ type: null, message: "" })}
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
