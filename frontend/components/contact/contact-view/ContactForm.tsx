"use client";

import {
  FormInput,
  FormTextarea,
  FormContainer,
  Button,
  Alert,
} from "../../shared";
import { useContactForm } from "../../../hooks";
import styles from "../../../styles/components/ContactForm.module.css";

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
      <h2 className={styles.title}>Envoyez-nous un message</h2>

      {submitStatus.type && (
        <Alert
          type={submitStatus.type}
          message={submitStatus.message}
          onClose={resetForm}
        />
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <FormInput
          id="name"
          name="name"
          label="Nom"
          value={formData.name}
          onChange={handleInputChange}
        />

        <FormInput
          id="email"
          name="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />

        <FormInput
          id="subject"
          name="subject"
          label="Sujet"
          value={formData.subject}
          onChange={handleInputChange}
        />

        <FormTextarea
          id="message"
          name="message"
          label="Message"
          value={formData.message}
          onChange={handleTextareaChange}
          rows={6}
        />

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
