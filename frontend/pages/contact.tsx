"use client";

// Import des composants nécessaires pour la page de contact
import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ContactInfo, ContactForm } from "../components/contact";
import styles from "../styles/components/ContactPage.module.css";

/**
 * Page de contact principale
 * Affiche les informations de contact et le formulaire de contact
 * dans une mise en page en deux colonnes (responsive)
 */
export default function Contact() {
  return (
    <>
      {/* Métadonnées de la page pour le SEO */}
      <Head>
        <title>Contact - Nature de Pierre</title>
        <meta
          name="description"
          content="Contactez Nature de Pierre pour vos besoins en pierres naturelles"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Conteneur principal avec fond gris clair */}
      <div className={styles.page}>
        {/* En-tête du site */}
        <Header />

        {/* Section principale contenant les informations et le formulaire */}
        <section className={styles.section}>
          {/* Grille responsive : 2 colonnes sur desktop, 1 colonne sur mobile */}
          <div className={styles.grid}>
            {/* Colonne gauche : Informations de contact */}
            <ContactInfo />
            {/* Colonne droite : Formulaire de contact */}
            <ContactForm />
          </div>
        </section>

        {/* Pied de page du site */}
        <Footer />
      </div>
    </>
  );
}
