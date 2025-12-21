"use client";

import { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useCart } from "../../contexts/CartContext";
import { usePaymentFinalization } from "../../hooks";
import styles from "../../styles/components/CheckoutStatusPage.module.css";

/**
 * Page de confirmation de commande réussie
 */
export default function CheckoutSuccessPage() {
  const { refreshCart } = useCart();
  const { isProcessing, error } = usePaymentFinalization(async () => {
    // Callback appelé après succès de la finalisation
    // Le panier a déjà été vidé côté serveur lors de la finalisation du paiement
    // Il suffit de recharger le panier pour voir qu'il est vide
    console.log(
      "[Checkout Success] Rechargement du panier après finalisation du paiement"
    );
    // Attendre suffisamment pour que le serveur ait le temps de vider le panier et que Redis propage
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // Recharger le panier pour voir qu'il est vide
    await refreshCart();
    console.log("[Checkout Success] Panier rechargé");

    // Vérifier à nouveau après un court délai pour s'assurer que le panier est bien vide
    await new Promise((resolve) => setTimeout(resolve, 500));
    await refreshCart();
    console.log(
      "[Checkout Success] Panier rechargé une deuxième fois pour vérification"
    );
  });

  // Recharger aussi le panier au montage de la page pour s'assurer qu'il est à jour
  useEffect(() => {
    const reloadCart = async () => {
      console.log(
        "[Checkout Success] Rechargement du panier au montage de la page"
      );
      // Attendre suffisamment pour que le serveur ait le temps de vider le panier et que Redis propage
      await new Promise((resolve) => setTimeout(resolve, 2500));
      await refreshCart();
      console.log("[Checkout Success] Panier rechargé au montage");

      // Vérifier à nouveau après un court délai
      await new Promise((resolve) => setTimeout(resolve, 500));
      await refreshCart();
      console.log(
        "[Checkout Success] Panier rechargé une deuxième fois au montage"
      );
    };
    reloadCart();
  }, [refreshCart]);

  return (
    <>
      <Head>
        <title>Commande réussie - Nature de Pierre</title>
        <meta name="description" content="Votre commande a été confirmée" />
      </Head>

      <div className={styles.page}>
        <Header />

        {/* Main Content */}
        <div className={styles.container}>
          {/* Icône de succès */}
          <div className={`${styles.icon} ${styles.iconSuccess}`}>
            <i className="fas fa-check"></i>
          </div>

          {/* Titre */}
          <h1 className={styles.title}>Commande confirmée !</h1>

          {/* Message de confirmation */}
          <div className={styles.card}>
            <div className={styles.textBlock}>
              <p className={styles.textParagraph}>
                <i className={`fas fa-check-circle ${styles.iconSuccess}`}></i>
                Votre paiement a été traité avec succès
              </p>
              <p className={styles.textParagraph}>
                <i className={`fas fa-envelope ${styles.iconAccent}`}></i>
                Un email de confirmation vous a été envoyé
              </p>
              <p>
                <i className={`fas fa-truck ${styles.iconAccent}`}></i>
                Votre commande sera traitée dans les plus brefs délais
              </p>
            </div>

            <div className={styles.mutedBox}>
              <h3 className={styles.sectionTitle}>
                Que se passe-t-il maintenant ?
              </h3>
              <ul className={styles.list}>
                <li>Nous préparons votre commande avec soin</li>
                <li>Vous recevrez un email avec les détails de livraison</li>
                <li>Vous pourrez suivre votre colis en temps réel</li>
                <li>
                  Notre équipe reste à votre disposition pour toute question
                </li>
              </ul>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className={styles.actions}>
            <Link href="/" className={styles.primaryButton}>
              <i className="fas fa-home"></i>
              Retour à l'accueil
            </Link>

            <Link href="/#catalog" className={styles.secondaryButton}>
              <i className="fas fa-shopping-bag"></i>
              Continuer mes achats
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
