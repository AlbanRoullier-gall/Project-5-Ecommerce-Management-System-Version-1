"use client";

import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import AuthForm from "../../components/auth/AuthForm";
import { useAuth } from "../../contexts/AuthContext";
import { UserCreateDTO } from "../../dto";

/**
 * Page d'inscription au backoffice
 *
 * Fonctionnalités :
 * - Formulaire d'inscription (prénom, nom, email, password, confirmation)
 * - Validation côté client via le contexte :
 *   * Correspondance des mots de passe
 *   * Longueur minimale du mot de passe (6 caractères)
 * - Utilisation du contexte d'authentification pour l'appel API
 * - Message de succès après inscription
 * - Redirection automatique vers login après 3 secondes
 * - Lien vers la page de connexion
 *
 * Note : L'accès au backoffice nécessite une approbation admin
 * après l'inscription
 */
const RegisterPage: React.FC = () => {
  const router = useRouter();
  const { register, validatePassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /**
   * Gère la soumission du formulaire d'inscription
   * @param formData - Données du formulaire (email, password, firstName, lastName, confirmPassword)
   */
  const handleRegister = async (formData: any) => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Validation côté client via le contexte
    const validation = validatePassword(
      formData.password,
      formData.confirmPassword
    );

    if (!validation.isValid) {
      setError(validation.error || "Erreur de validation");
      setIsLoading(false);
      return;
    }

    const registerRequest: UserCreateDTO = {
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
    };

    const result = await register(registerRequest);

    if (result.success) {
      setSuccess(result.message || "Compte créé avec succès !");
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } else {
      setError(result.error || "Erreur lors de la création du compte");
    }

    setIsLoading(false);
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
      href: "/auth/login",
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
          <AuthForm
            title="Créer un compte"
            subtitle="Rejoignez l'équipe d'administration"
            onSubmit={handleRegister}
            submitText="Créer le compte"
            fields={registerFields}
            links={registerLinks}
            isLoading={isLoading}
            globalError={error}
            globalSuccess={success}
          />
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
