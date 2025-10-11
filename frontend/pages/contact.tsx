"use client";

import React, { useState } from "react";
import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";

export default function Contact() {
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
      // Préparer les données pour l'API email
      const emailData = {
        to: {
          email: "u4999410740@gmail.com", // Email de l'admin qui recevra les messages
          name: "Nature de Pierre",
        },
        subject: formData.subject || "Nouveau message de contact",
        message: formData.message,
        clientName: formData.name,
        clientEmail: formData.email,
      };

      console.log("📧 Envoi du message de contact:", emailData);

      // Envoyer l'email via l'API Gateway
      const response = await fetch(`${API_URL}/api/email/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });

      const result = await response.json();
      console.log("📧 Réponse de l'API:", result);

      if (!response.ok) {
        throw new Error(result.message || "Erreur lors de l'envoi du message");
      }

      // Succès
      setSubmitStatus({
        type: "success",
        message:
          "Votre message a été envoyé avec succès ! Nous vous répondrons bientôt.",
      });

      // Reset form
      setFormData({
        email: "",
        name: "",
        subject: "",
        message: "",
      });
    } catch (error: any) {
      console.error("❌ Erreur lors de l'envoi:", error);
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

      <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
        {/* HEADER */}
        <Header />

        {/* HERO SECTION */}
        <section
          style={{
            background: "linear-gradient(135deg, #13686a 0%, #0d4f51 100%)",
            color: "white",
            textAlign: "center",
            padding: "4rem 2rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              maxWidth: "800px",
              margin: "0 auto",
            }}
          >
            <h1
              style={{
                fontSize: "4rem",
                fontWeight: "lighter",
                marginBottom: "1rem",
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
              }}
            >
              CONTACTEZ-NOUS
            </h1>
            <p
              style={{
                fontSize: "1.8rem",
                opacity: 0.9,
                lineHeight: 1.4,
              }}
            >
              Notre équipe est à votre disposition pour tous vos projets
            </p>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section
          style={{
            padding: "4rem 2rem",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "4rem",
              alignItems: "start",
            }}
          >
            {/* Info de contact */}
            <div>
              <h2
                style={{
                  fontSize: "2rem",
                  color: "#13686a",
                  marginBottom: "2rem",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                Informations de Contact
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2rem",
                }}
              >
                {/* Adresse */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "1rem",
                    padding: "1.5rem",
                    background: "white",
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  <i
                    className="fas fa-map-marker-alt"
                    style={{
                      fontSize: "2rem",
                      color: "#13686a",
                      minWidth: "2rem",
                    }}
                  ></i>
                  <div>
                    <h3
                      style={{
                        fontSize: "1.2rem",
                        color: "#13686a",
                        marginBottom: "0.5rem",
                        fontWeight: "600",
                      }}
                    >
                      Adresse
                    </h3>
                    <p style={{ fontSize: "1rem", color: "#666", margin: 0 }}>
                      Votre adresse ici
                    </p>
                  </div>
                </div>

                {/* Téléphone */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "1rem",
                    padding: "1.5rem",
                    background: "white",
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  <i
                    className="fas fa-phone"
                    style={{
                      fontSize: "2rem",
                      color: "#13686a",
                      minWidth: "2rem",
                    }}
                  ></i>
                  <div>
                    <h3
                      style={{
                        fontSize: "1.2rem",
                        color: "#13686a",
                        marginBottom: "0.5rem",
                        fontWeight: "600",
                      }}
                    >
                      Téléphone
                    </h3>
                    <p style={{ fontSize: "1rem", color: "#666", margin: 0 }}>
                      +33 1 23 45 67 89
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "1rem",
                    padding: "1.5rem",
                    background: "white",
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  <i
                    className="fas fa-envelope"
                    style={{
                      fontSize: "2rem",
                      color: "#13686a",
                      minWidth: "2rem",
                    }}
                  ></i>
                  <div>
                    <h3
                      style={{
                        fontSize: "1.2rem",
                        color: "#13686a",
                        marginBottom: "0.5rem",
                        fontWeight: "600",
                      }}
                    >
                      Email
                    </h3>
                    <p style={{ fontSize: "1rem", color: "#666", margin: 0 }}>
                      contact@naturedepierre.com
                    </p>
                  </div>
                </div>

                {/* Horaires */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "1rem",
                    padding: "1.5rem",
                    background: "white",
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  <i
                    className="fas fa-clock"
                    style={{
                      fontSize: "2rem",
                      color: "#13686a",
                      minWidth: "2rem",
                    }}
                  ></i>
                  <div>
                    <h3
                      style={{
                        fontSize: "1.2rem",
                        color: "#13686a",
                        marginBottom: "0.5rem",
                        fontWeight: "600",
                      }}
                    >
                      Horaires
                    </h3>
                    <p style={{ fontSize: "1rem", color: "#666", margin: 0 }}>
                      Lun - Ven : 9h00 - 18h00
                    </p>
                    <p
                      style={{
                        fontSize: "1rem",
                        color: "#666",
                        margin: "0.25rem 0 0 0",
                      }}
                    >
                      Sam : 9h00 - 12h00
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulaire de contact */}
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

              {/* Status Message */}
              {submitStatus.type && (
                <div
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

              <form
                onSubmit={handleSubmit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                {/* Nom */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
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

                {/* Email */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
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

                {/* Sujet */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
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

                {/* Message */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
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
                  ></textarea>
                </div>

                {/* Bouton submit */}
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
          </div>
        </section>

        {/* FOOTER */}
        <Footer />
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          section > div {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </>
  );
}
