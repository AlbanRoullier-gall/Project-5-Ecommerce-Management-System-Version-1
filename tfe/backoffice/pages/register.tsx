"use client";

import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import AuthForm from "../components/auth/AuthForm";

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (formData: any) => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Validation côté client
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess(
          "Compte créé avec succès ! Vous pouvez maintenant vous connecter."
        );
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(data.message || "Erreur lors de la création du compte");
      }
    } catch (error) {
      setError("Erreur de connexion au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  const registerFields = [
    {
      name: "firstName",
      type: "text",
      label: "Prénom",
      placeholder: "Votre prénom",
      required: true,
    },
    {
      name: "lastName",
      type: "text",
      label: "Nom",
      placeholder: "Votre nom",
      required: true,
    },
    {
      name: "email",
      type: "email",
      label: "Adresse email",
      placeholder: "votre@email.com",
      required: true,
    },
    {
      name: "password",
      type: "password",
      label: "Mot de passe",
      placeholder: "Au moins 6 caractères",
      required: true,
    },
    {
      name: "confirmPassword",
      type: "password",
      label: "Confirmer le mot de passe",
      placeholder: "Répétez votre mot de passe",
      required: true,
    },
  ];

  const registerLinks = [
    {
      text: "Déjà un compte ?",
      href: "/login",
      label: "Se connecter",
    },
  ];

  return (
    <>
      <Head>
        <title>Inscription - Nature de Pierre</title>
        <meta
          name="description"
          content="Créer un compte administrateur pour Nature de Pierre"
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

          <AuthForm
            title="Créer un compte"
            subtitle="Rejoignez l'équipe d'administration"
            onSubmit={handleRegister}
            submitText="Créer le compte"
            fields={registerFields}
            links={registerLinks}
            isLoading={isLoading}
          />
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
