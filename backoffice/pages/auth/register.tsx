"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AuthForm from "../../components/AuthForm";
import { useAuth } from "../../contexts/AuthContext";
import { RegisterData } from "../../../../shared-types";

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const { register, isAuthenticated, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleRegister = async (data: RegisterData) => {
    setIsSubmitting(true);
    setError("");

    try {
      await register(data);
      // Redirect will be handled by useEffect
    } catch (error: any) {
      setError(error.message || "Erreur d'inscription");
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
        <title>Inscription - Back Office Nature de Pierre</title>
        <meta
          name="description"
          content="Création de compte administrateur pour Nature de Pierre"
        />
      </Head>

      <div className="app">
        <Header />

        <main className="main-content auth-main">
          <div className="auth-page-container">
            <AuthForm
              mode="register"
              onSubmit={handleRegister as any}
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

export default RegisterPage;
