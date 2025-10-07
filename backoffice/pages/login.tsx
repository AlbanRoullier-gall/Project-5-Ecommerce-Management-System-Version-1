"use client";

import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AuthForm from "../components/auth/AuthForm";
import { UserLoginDTO } from "../dto";

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

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

      const data = await response.json();

      if (response.ok) {
        // Stocker le token d'authentification
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
      href: "/reset-password",
      label: "Réinitialiser le mot de passe",
    },
    {
      text: "Pas encore de compte ?",
      href: "/register",
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
