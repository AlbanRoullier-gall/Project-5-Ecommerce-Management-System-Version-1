"use client";

import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "../styles/components/MentionsLegalesPage.module.css";

export default function MentionsLegalesPage() {
  return (
    <>
      <Head>
        <title>Mentions légales - Nature de Pierre</title>
        <meta
          name="description"
          content="Mentions légales de Nature de Pierre : informations sur l'entreprise, coordonnées et hébergement."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.page}>
        <Header />

        <main className={styles.main}>
          <div className={styles.content}>
            <h1 className={styles.title}>Mentions légales</h1>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                1. Identité de l'entreprise
              </h2>
              <div className={styles.sectionContent}>
                <p>
                  <strong>Forme juridique :</strong> [À compléter - ex: SARL,
                  SAS, etc.]
                </p>
                <p>
                  <strong>Nom de l'entreprise :</strong> Nature de Pierre
                </p>
                <p>
                  <strong>Siège social :</strong> [À compléter - adresse
                  complète]
                </p>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                2. Numéros d'identification
              </h2>
              <div className={styles.sectionContent}>
                <p>
                  <strong>Numéro d'entreprise :</strong> [À compléter - numéro
                  BCE/BCE-KBO]
                </p>
                <p>
                  <strong>Numéro de TVA intracommunautaire :</strong> [À
                  compléter - format BE XXX.XXX.XXX]
                </p>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>3. Coordonnées de contact</h2>
              <div className={styles.sectionContent}>
                <p>
                  <strong>E-mail :</strong>{" "}
                  <a href="mailto:contact@naturedepierre.be">
                    contact@naturedepierre.be
                  </a>
                </p>
                <p>
                  <strong>Téléphone :</strong> [À compléter]
                </p>
                <p>
                  <strong>Autres moyens de contact :</strong> [À compléter si
                  applicable]
                </p>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                4. Hébergement et responsable de publication
              </h2>
              <div className={styles.sectionContent}>
                <p>
                  <strong>Nom de l'hébergeur :</strong> [À compléter - nom de
                  l'hébergeur du site]
                </p>
                <p>
                  <strong>Adresse de l'hébergeur :</strong> [À compléter -
                  adresse complète de l'hébergeur]
                </p>
                <p>
                  <strong>Responsable de publication :</strong> [À compléter -
                  nom du responsable de publication selon la LCEN]
                </p>
              </div>
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
