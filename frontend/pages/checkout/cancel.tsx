"use client";

import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import styles from "../../styles/components/CheckoutStatusPage.module.css";

/**
 * Page d'annulation de paiement
 */
export default function CheckoutCancelPage() {
  const router = useRouter();
  const { csid } = router.query;

  return (
    <>
      <Head>
        <title>Paiement annulé - Nature de Pierre</title>
        <meta name="description" content="Votre paiement a été annulé" />
      </Head>

      <div className={styles.page}>
        <Header />

        {/* Main Content */}
        <div className={styles.container}>
          {/* Icône d'annulation */}
          <div className={`${styles.icon} ${styles.iconCancel}`}>
            <i className="fas fa-times"></i>
          </div>

          {/* Titre */}
          <h1 className={styles.title}>Paiement annulé</h1>

          {/* Identifiant de session */}
          {/* csid && (
            <div className={styles.sessionInfo}>
              Session de paiement:{" "}
              <strong className={styles.sessionId}>#{csid}</strong>
            </div>
          ) */}

          {/* Message d'information */}
          <div className={styles.card}>
            <div className={styles.textBlock}>
              <p className={`${styles.textBlock} ${styles.textParagraph}`}>
                <i className={`fas fa-info-circle ${styles.iconWarning}`}></i>
                Votre paiement a été annulé
              </p>
              <p className={`${styles.textBlock} ${styles.textParagraphTight}`}>
                Aucun montant n'a été débité de votre compte. Vos articles sont
                toujours dans votre panier.
              </p>
            </div>

            <div className={styles.warningBox}>
              <h3 className={styles.sectionTitle}>Que puis-je faire ?</h3>
              <ul className={styles.list}>
                <li>Retourner à votre panier pour vérifier vos articles</li>
                <li>Réessayer le paiement avec une autre méthode</li>
                <li>
                  Contacter notre service client si vous rencontrez des
                  difficultés
                </li>
                <li>Continuer vos achats et finaliser plus tard</li>
              </ul>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className={styles.actions}>
            <Link href="/cart" className={styles.primaryButton}>
              <i className="fas fa-shopping-cart"></i>
              Retour au panier
            </Link>

            <Link
              href="/checkout/information"
              className={styles.secondaryButton}
            >
              <i className="fas fa-redo"></i>
              Réessayer le paiement
            </Link>
          </div>

          {/* Aide supplémentaire */}
          <div className={styles.support}>
            <h3 className={styles.supportTitle}>
              <i className={`fas fa-headset ${styles.iconAccent}`}></i>
              Besoin d'aide ?
            </h3>
            <p className={styles.supportText}>
              Notre équipe est disponible pour vous assister
            </p>
            <Link href="/contact" className={styles.linkButton}>
              <i className="fas fa-envelope"></i>
              Contacter le support
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
