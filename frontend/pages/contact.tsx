"use client";

import { useState } from "react";
import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ContactFormData } from "../shared-types";
import { ContactService } from "../lib/services/contactService";

export default function Contact() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
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
      const response = await ContactService.sendContactEmail(formData);
      setSubmitStatus({
        type: "success",
        message:
          "Votre message a été envoyé avec succès ! Nous vous répondrons bientôt.",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de l'envoi de votre message.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <Head>
        <title>Contact - Nature de Pierre</title>
        <meta
          name="description"
          content="Contactez Nature de Pierre pour vos besoins en pierres naturelles"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen">
        {/* HEADER */}
        <Header />

        {/* HERO SECTION */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">CONTACTEZ-NOUS</h1>
            <p className="hero-subtitle">
              Notre équipe est à votre disposition pour tous vos projets
            </p>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section className="contact-section">
          <div className="contact-container">
            <div className="contact-info">
              <h2>Informations de Contact</h2>
              <div className="contact-details">
                <div className="contact-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <div>
                    <h3>Adresse</h3>
                    <p>Votre adresse ici</p>
                  </div>
                </div>

                <div className="contact-item">
                  <i className="fas fa-phone"></i>
                  <div>
                    <h3>Téléphone</h3>
                    <p>+33 1 23 45 67 89</p>
                  </div>
                </div>

                <div className="contact-item">
                  <i className="fas fa-envelope"></i>
                  <div>
                    <h3>Email</h3>
                    <p>contact@naturedepierre.com</p>
                  </div>
                </div>

                <div className="contact-item">
                  <i className="fas fa-clock"></i>
                  <div>
                    <h3>Horaires</h3>
                    <p>Lun - Ven : 9h00 - 18h00</p>
                    <p>Sam : 9h00 - 12h00</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-form-container">
              <h2>Envoyez-nous un message</h2>

              {/* Status Message */}
              {submitStatus.type && (
                <div
                  className={`status-message ${
                    submitStatus.type === "success" ? "success" : "error"
                  }`}
                  style={{
                    padding: "1rem",
                    marginBottom: "1.5rem",
                    borderRadius: "4px",
                    backgroundColor:
                      submitStatus.type === "success" ? "#d4edda" : "#f8d7da",
                    color:
                      submitStatus.type === "success" ? "#155724" : "#721c24",
                    border: `1px solid ${
                      submitStatus.type === "success" ? "#c3e6cb" : "#f5c6cb"
                    }`,
                  }}
                >
                  {submitStatus.message}
                </div>
              )}

              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Nom</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Sujet</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isSubmitting}
                  style={{
                    opacity: isSubmitting ? 0.7 : 1,
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                  }}
                >
                  {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <Footer />
      </div>
    </>
  );
}
