"use client";

import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  CheckoutCustomerForm,
  CheckoutAddressForm,
  CheckoutOrderSummary,
} from "../components/checkout";
import { LoadingSpinner } from "../components/shared";
import { useCheckoutStep, useCheckoutPageGuard } from "../hooks";
import styles from "../styles/components/CheckoutPage.module.css";

/**
 * Page de passage de commande (checkout)
 * Processus en plusieurs étapes avec validation
 * Utilise CheckoutContext pour gérer l'état du checkout
 */
export default function CheckoutPage() {
  const { currentStep, steps } = useCheckoutStep();
  const { isLoading } = useCheckoutPageGuard();

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Chargement... - Nature de Pierre</title>
        </Head>
        <div className={styles.page}>
          <Header />
          <LoadingSpinner fullscreen message="Chargement..." />
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Passer la commande - Nature de Pierre</title>
        <meta name="description" content="Finalisez votre commande" />
      </Head>

      <div className={styles.page}>
        <Header />

        {/* Main Content */}
        <div className={styles.main}>
          {/* En-tête */}
          <div className={styles.header}>
            <h1 className={styles.title}>Finaliser votre commande</h1>
            <p className={styles.subtitle}>
              Complétez les étapes ci-dessous pour passer votre commande
            </p>
          </div>

          {/* Indicateur de progression */}
          <div className={styles.progress}>
            {steps.map((step, index) => (
              <div key={step.number} className={styles.step}>
                {/* Ligne de connexion */}
                {index < steps.length - 1 && (
                  <div
                    className={`${styles.connector} ${
                      currentStep > step.number ? styles.connectorActive : ""
                    }`}
                  />
                )}

                {/* Icône étape */}
                <div
                  className={`${styles.stepIcon} ${
                    currentStep >= step.number ? styles.stepIconActive : ""
                  }`}
                >
                  {currentStep > step.number ? (
                    <i className="fas fa-check"></i>
                  ) : (
                    <i className={`fas ${step.icon}`}></i>
                  )}
                </div>

                {/* Label étape */}
                <div
                  className={`${styles.stepLabel} ${
                    currentStep >= step.number ? styles.stepLabelActive : ""
                  }`}
                >
                  {step.label}
                </div>
              </div>
            ))}
          </div>

          {/* Formulaires des étapes */}
          <div className={styles.forms}>
            {currentStep === 1 && <CheckoutCustomerForm />}
            {currentStep === 2 && <CheckoutAddressForm />}
            {currentStep === 3 && <CheckoutOrderSummary />}
          </div>

          {/* Informations de sécurité */}
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <i className={`fas fa-lock ${styles.infoIcon}`}></i>
              <h3 className={styles.infoTitle}>Paiement sécurisé</h3>
              <p className={styles.infoText}>Transaction cryptée SSL</p>
            </div>

            <div className={styles.infoCard}>
              <i className={`fas fa-truck ${styles.infoIcon}`}></i>
              <h3 className={styles.infoTitle}>Livraison rapide</h3>
              <p className={styles.infoText}>Gratuite dès 50 €</p>
            </div>

            <div className={styles.infoCard}>
              <i className={`fas fa-headset ${styles.infoIcon}`}></i>
              <h3 className={styles.infoTitle}>Support client</h3>
              <p className={styles.infoText}>7j/7 à votre écoute</p>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
