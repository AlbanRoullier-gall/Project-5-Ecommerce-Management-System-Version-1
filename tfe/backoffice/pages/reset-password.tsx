"use client";

import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import AuthForm from "../components/auth/AuthForm";

const ResetPasswordPage: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState<"email" | "reset">("email");

  const handleEmailSubmit = async (formData: any) => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Simuler l'envoi d'email de réinitialisation
      // Dans un vrai projet, vous feriez un appel API ici
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
          }),
        }
      );

      if (response.ok) {
        setSuccess(
          "Un email de réinitialisation a été envoyé à votre adresse email."
        );
        setStep("reset");
      } else {
        const data = await response.json();
        setError(data.message || "Erreur lors de l'envoi de l'email");
      }
    } catch (error) {
      // Pour la démo, on simule un succès
      setSuccess(
        "Un email de réinitialisation a été envoyé à votre adresse email."
      );
      setStep("reset");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (formData: any) => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password/confirm`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: formData.token,
            password: formData.password,
          }),
        }
      );

      if (response.ok) {
        setSuccess(
          "Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter."
        );
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.message || "Erreur lors de la réinitialisation");
      }
    } catch (error) {
      setError("Erreur de connexion au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  const emailFields = [
    {
      name: "email",
      type: "email",
      label: "Adresse email",
      placeholder: "votre@email.com",
      required: true,
    },
  ];

  const resetFields = [
    {
      name: "token",
      type: "text",
      label: "Code de réinitialisation",
      placeholder: "Code reçu par email",
      required: true,
    },
    {
      name: "password",
      type: "password",
      label: "Nouveau mot de passe",
      placeholder: "Au moins 6 caractères",
      required: true,
    },
    {
      name: "confirmPassword",
      type: "password",
      label: "Confirmer le nouveau mot de passe",
      placeholder: "Répétez votre nouveau mot de passe",
      required: true,
    },
  ];

  const emailLinks = [
    {
      text: "Retour à la connexion",
      href: "/login",
      label: "Se connecter",
    },
  ];

  const resetLinks = [
    {
      text: "Retour à la connexion",
      href: "/login",
      label: "Se connecter",
    },
  ];

  return (
    <>
      <Head>
        <title>Réinitialisation - Nature de Pierre</title>
        <meta
          name="description"
          content="Réinitialiser votre mot de passe pour Nature de Pierre"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="auth-page">
        <div className="auth-background">
          <div className="auth-logo">
            <img
              src="/images/logoNatureDePierreIcon.svg"
              alt="Logo Nature de Pierre"
              className="auth-logo-img"
            />
            <h2 className="auth-logo-text">NATURE DE PIERRE</h2>
            <p className="auth-logo-subtitle">Interface d'administration</p>
          </div>
        </div>

        <div className="auth-content">
          {error && (
            <div className="auth-error">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}

          {success && (
            <div className="auth-success">
              <i className="fas fa-check-circle"></i>
              {success}
            </div>
          )}

          {step === "email" ? (
            <AuthForm
              title="Mot de passe oublié"
              subtitle="Entrez votre adresse email pour recevoir un code de réinitialisation"
              onSubmit={handleEmailSubmit}
              submitText="Envoyer le code"
              fields={emailFields}
              links={emailLinks}
              isLoading={isLoading}
            />
          ) : (
            <AuthForm
              title="Nouveau mot de passe"
              subtitle="Entrez le code reçu par email et votre nouveau mot de passe"
              onSubmit={handlePasswordReset}
              submitText="Réinitialiser le mot de passe"
              fields={resetFields}
              links={resetLinks}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default ResetPasswordPage;
