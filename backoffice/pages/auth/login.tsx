"use client";

import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import AuthForm from "../../components/auth/AuthForm";
import { UserLoginDTO, UserPublicDTO } from "../../dto";

/**
 * Page de connexion au backoffice
 *
 * Fonctionnalités :
 * - Formulaire de connexion (email + password)
 * - Validation côté client
 * - Appel API d'authentification
 * - Stockage du token et des infos utilisateur dans localStorage
 * - Gestion des états d'approbation backoffice :
 *   * Rejeté → Redirection vers /access-rejected
 *   * En attente → Redirection vers /pending-approval
 *   * Approuvé → Redirection vers /dashboard
 * - Lien vers inscription et reset password
 */
const LoginPage: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * Gère la soumission du formulaire de connexion
   * @param formData - Données du formulaire (email, password)
   */
  const handleLogin = async (formData: any) => {
    setIsLoading(true);
    setError("");

    try {
      const loginRequest: UserLoginDTO = {
        email: formData.email,
        password: formData.password,
      };

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020"
        }/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginRequest),
        }
      );

      const data = (await response.json()) as {
        success: boolean;
        user: UserPublicDTO;
        token: string;
        message?: string;
      };

      if (response.ok) {
        // Stocker le token d'authentification et les données utilisateur
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Rediriger vers le dashboard
        router.push("/dashboard");
      } else {
        setError(data.message || "Erreur de connexion");
      }
    } catch (error) {
      setError("Erreur de connexion au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  const loginFields = [
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
      placeholder: "Votre mot de passe",
      required: true,
    },
  ];

  const loginLinks = [
    {
      text: "Mot de passe oublié ?",
      href: "/auth/reset-password",
      label: "Réinitialiser le mot de passe",
    },
    {
      text: "Pas encore de compte ?",
      href: "/auth/register",
      label: "Créer un compte",
    },
  ];

  return (
    <>
      <Head>
        <title>Connexion - Nature de Pierre</title>
        <meta
          name="description"
          content="Connexion à l'interface d'administration Nature de Pierre"
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
          <AuthForm
            title="Connexion"
            subtitle="Accédez à votre espace d'administration"
            onSubmit={handleLogin}
            submitText="Se connecter"
            fields={loginFields}
            links={loginLinks}
            isLoading={isLoading}
            globalError={error}
          />
        </div>
      </div>
    </>
  );
};

export default LoginPage;
