"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AuthForm from "../../components/AuthForm";
import { useAuth } from "../../contexts/AuthContext";
import { LoginData } from "../../../shared-types";

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogin = async (data: LoginData) => {
    setIsSubmitting(true);
    setError("");

    try {
      await login(data.email, data.password);
      // Redirect will be handled by useEffect
    } catch (error: any) {
      setError(error.message || "Erreur de connexion");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="app">
        <Header />
        <main className="main-content auth-main">
          <div className="auth-page-container">
            <div className="auth-container">
              <div className="auth-card">
                <div className="auth-header">
                  <h2 className="auth-title">Chargement...</h2>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Connexion - Back Office Nature de Pierre</title>
        <meta
          name="description"
          content="Connexion à l'interface d'administration Nature de Pierre"
        />
      </Head>

      <div className="app">
        <Header />

        <main className="main-content auth-main">
          <div className="auth-page-container">
            <AuthForm
              mode="login"
              onSubmit={handleLogin}
              isLoading={isSubmitting}
              error={error}
            />
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default LoginPage;
