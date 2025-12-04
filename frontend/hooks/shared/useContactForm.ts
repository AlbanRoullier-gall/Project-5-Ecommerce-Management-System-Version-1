/**
 * Hook pour gérer le formulaire de contact
 */

import { useState } from "react";
import { ContactFormDTO } from "../../dto";
import { sendContactEmail } from "../../services/contactService";

interface ContactFormData {
  email: string;
  name: string;
  subject: string;
  message: string;
}

interface UseContactFormResult {
  formData: ContactFormData;
  isSubmitting: boolean;
  submitStatus: {
    type: "success" | "error" | null;
    message: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTextareaChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  resetForm: () => void;
}

/**
 * Hook pour gérer l'état et la soumission du formulaire de contact
 */
export function useContactForm(): UseContactFormResult {
  const [formData, setFormData] = useState<ContactFormData>({
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const contactData: ContactFormDTO = {
        subject: formData.subject || "Nouveau message de contact",
        message: formData.message,
        clientName: formData.name,
        clientEmail: formData.email,
      };

      await sendContactEmail(contactData);

      setSubmitStatus({
        type: "success",
        message:
          "Votre message a été envoyé avec succès ! Nous vous répondrons bientôt.",
      });
      resetForm();
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

  const resetForm = () => {
    setFormData({ email: "", name: "", subject: "", message: "" });
  };

  return {
    formData,
    isSubmitting,
    submitStatus,
    handleInputChange,
    handleTextareaChange,
    handleSubmit,
    resetForm,
  };
}
