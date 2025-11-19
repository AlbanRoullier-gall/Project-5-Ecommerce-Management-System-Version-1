"use client";

// Import des composants nécessaires pour la page de contact
import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ContactInfo from "../components/contact/ContactInfo";
import ContactForm from "../components/contact/ContactForm";

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
      <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
        {/* En-tête du site */}
        <Header />

        {/* Section principale contenant les informations et le formulaire */}
        <section style={{ padding: "4rem 2rem" }}>
          {/* Grille responsive : 2 colonnes sur desktop, 1 colonne sur mobile */}
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "minmax(0, 520px) minmax(0, 520px)",
              justifyContent: "center",
              gap: "4rem",
              alignItems: "stretch",
            }}
          >
            {/* Colonne gauche : Informations de contact */}
            <ContactInfo />
            {/* Colonne droite : Formulaire de contact */}
            <ContactForm />
          </div>
        </section>

        {/* Pied de page du site */}
        <Footer />
      </div>

      {/* Styles responsive pour les écrans mobiles */}
      <style jsx global>{`
        @media (max-width: 768px) {
          section > div {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
            justify-content: stretch !important;
          }
        }
      `}</style>
    </>
  );
}
