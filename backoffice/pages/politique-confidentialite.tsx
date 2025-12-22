"use client";

import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "../styles/components/PolitiqueConfidentialitePage.module.css";

/**
 * Page Politique de confidentialité du backoffice
 * Accessible publiquement (sans authentification requise)
 * Affiche la politique de confidentialité complète conforme au RGPD
 */
export default function PolitiqueConfidentialitePage() {
  return (
    <>
      <Head>
        <title>Politique de confidentialité - Nature de Pierre</title>
        <meta
          name="description"
          content="Politique de confidentialité de Nature de Pierre : protection des données personnelles et conformité RGPD."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.page}>
        <Header />

        <main className={styles.main}>
          <div className={styles.content}>
            <h1 className={styles.title}>Politique de confidentialité</h1>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>1. Introduction</h2>
              <div className={styles.sectionContent}>
                <p>
                  Nature de Pierre s'engage à protéger la confidentialité et la
                  sécurité de vos données personnelles. La présente politique de
                  confidentialité explique comment nous collectons, utilisons,
                  stockons et protégeons vos données personnelles conformément
                  au Règlement Général sur la Protection des Données (RGPD) et à
                  la législation belge en vigueur.
                </p>
                <p>
                  En utilisant notre site web, vous acceptez les pratiques
                  décrites dans cette politique de confidentialité.
                </p>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                2. Responsable du traitement
              </h2>
              <div className={styles.sectionContent}>
                <p>
                  Le responsable du traitement des données personnelles est :
                </p>
                <ul>
                  <li>
                    <strong>Nom :</strong> Nature de Pierre
                  </li>
                  <li>
                    <strong>Adresse :</strong> [À compléter - adresse du siège
                    social]
                  </li>
                  <li>
                    <strong>E-mail :</strong>{" "}
                    <a href="mailto:contact@naturedepierre.be">
                      contact@naturedepierre.be
                    </a>
                  </li>
                  <li>
                    <strong>Téléphone :</strong> [À compléter]
                  </li>
                </ul>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                3. Données personnelles collectées
              </h2>
              <div className={styles.sectionContent}>
                <p>
                  Conformément au principe de minimisation des données du RGPD,
                  nous collectons uniquement les données personnelles
                  strictement nécessaires aux finalités pour lesquelles elles
                  sont traitées.
                </p>

                <h3 className={styles.subsectionTitle}>
                  3.1. Données collectées lors de la création de compte
                </h3>
                <p>Lors de la création d'un compte, nous collectons :</p>
                <ul>
                  <li>Adresse e-mail</li>
                  <li>Mot de passe (stocké de manière cryptée)</li>
                  <li>Prénom et nom</li>
                  <li>Statut d'approbation backoffice (si applicable)</li>
                </ul>

                <h3 className={styles.subsectionTitle}>
                  3.2. Données collectées lors de la commande
                </h3>
                <p>Lors de la passation d'une commande, nous collectons :</p>
                <ul>
                  <li>Prénom et nom</li>
                  <li>Adresse e-mail</li>
                  <li>Numéro de téléphone (optionnel)</li>
                  <li>Adresse de livraison</li>
                  <li>
                    Informations de paiement (traitées par un prestataire
                    sécurisé)
                  </li>
                </ul>

                <h3 className={styles.subsectionTitle}>
                  3.3. Données collectées automatiquement
                </h3>
                <p>
                  Lors de votre navigation sur notre site, nous collectons
                  automatiquement certaines données techniques :
                </p>
                <ul>
                  <li>Adresse IP</li>
                  <li>Type de navigateur et version</li>
                  <li>Système d'exploitation</li>
                  <li>Pages visitées et durée de visite</li>
                  <li>Date et heure de connexion</li>
                </ul>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                4. Finalités du traitement
              </h2>
              <div className={styles.sectionContent}>
                <p>
                  Vos données personnelles sont traitées pour les finalités
                  suivantes :
                </p>
                <ul>
                  <li>
                    <strong>Gestion des commandes :</strong> Traitement et suivi
                    de vos commandes, gestion des livraisons
                  </li>
                  <li>
                    <strong>Gestion du compte client :</strong> Création et
                    gestion de votre compte, authentification
                  </li>
                  <li>
                    <strong>Gestion du panier :</strong> Sauvegarde de votre
                    panier d'achat
                  </li>
                  <li>
                    <strong>Communication :</strong> Réponse à vos demandes,
                    envoi d'informations relatives à votre commande
                  </li>
                  <li>
                    <strong>Amélioration du service :</strong> Analyse de
                    l'utilisation du site pour améliorer nos services
                  </li>
                  <li>
                    <strong>Obligations légales :</strong> Respect des
                    obligations comptables et fiscales
                  </li>
                </ul>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                5. Base légale du traitement
              </h2>
              <div className={styles.sectionContent}>
                <p>Le traitement de vos données personnelles est basé sur :</p>
                <ul>
                  <li>
                    <strong>Exécution d'un contrat :</strong> Pour la gestion de
                    vos commandes et de votre compte client
                  </li>
                  <li>
                    <strong>Consentement :</strong> Pour l'utilisation de
                    cookies non essentiels et l'envoi de communications
                    marketing (si applicable)
                  </li>
                  <li>
                    <strong>Obligation légale :</strong> Pour le respect des
                    obligations comptables et fiscales
                  </li>
                  <li>
                    <strong>Intérêt légitime :</strong> Pour l'amélioration de
                    nos services et la sécurité de notre site
                  </li>
                </ul>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                6. Cookies et technologies similaires
              </h2>
              <div className={styles.sectionContent}>
                <p>
                  Notre site utilise des cookies et technologies similaires pour
                  améliorer votre expérience de navigation et assurer le bon
                  fonctionnement de nos services.
                </p>

                <h3 className={styles.subsectionTitle}>
                  6.1. Cookies strictement nécessaires
                </h3>
                <p>
                  Ces cookies sont indispensables au fonctionnement du site et
                  ne nécessitent pas votre consentement :
                </p>
                <ul>
                  <li>
                    <strong>Cookie d'authentification (auth_token) :</strong>{" "}
                    Permet de maintenir votre session connectée. Durée : 24
                    heures. Cookie httpOnly sécurisé.
                  </li>
                  <li>
                    <strong>
                      Cookie de session panier (cart_session_id) :
                    </strong>{" "}
                    Permet de sauvegarder votre panier d'achat. Durée : 30
                    jours. Cookie httpOnly sécurisé.
                  </li>
                </ul>

                <h3 className={styles.subsectionTitle}>
                  6.2. Consentement aux cookies
                </h3>
                <p>
                  Pour tous les cookies non strictement nécessaires (cookies
                  analytiques, publicitaires, etc.), nous demandons votre
                  consentement explicite avant leur utilisation. Vous pouvez
                  retirer votre consentement à tout moment via les paramètres de
                  votre navigateur ou en nous contactant.
                </p>

                <h3 className={styles.subsectionTitle}>
                  6.3. Gestion des cookies
                </h3>
                <p>
                  Vous pouvez gérer vos préférences de cookies à tout moment :
                </p>
                <ul>
                  <li>
                    Via les paramètres de votre navigateur (désactiver,
                    supprimer les cookies)
                  </li>
                  <li>
                    En nous contactant à{" "}
                    <a href="mailto:contact@naturedepierre.be">
                      contact@naturedepierre.be
                    </a>
                  </li>
                </ul>
                <p>
                  <strong>Note importante :</strong> La désactivation de
                  certains cookies peut affecter le fonctionnement du site et
                  limiter certaines fonctionnalités.
                </p>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                7. Conservation des données
              </h2>
              <div className={styles.sectionContent}>
                <p>
                  Nous conservons vos données personnelles uniquement pendant la
                  durée nécessaire aux finalités pour lesquelles elles ont été
                  collectées :
                </p>
                <ul>
                  <li>
                    <strong>Données de compte :</strong> Pendant la durée de vie
                    de votre compte, puis 3 ans après sa fermeture
                  </li>
                  <li>
                    <strong>Données de commande :</strong> 10 ans (obligation
                    légale comptable)
                  </li>
                  <li>
                    <strong>Données de session :</strong> 30 jours maximum
                  </li>
                  <li>
                    <strong>Cookies :</strong> Selon la durée indiquée pour
                    chaque type de cookie
                  </li>
                </ul>
                <p>
                  Passé ces délais, vos données sont supprimées ou anonymisées
                  de manière sécurisée.
                </p>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>8. Sécurité des données</h2>
              <div className={styles.sectionContent}>
                <p>
                  Nous mettons en œuvre des mesures techniques et
                  organisationnelles appropriées pour protéger vos données
                  personnelles contre la perte, l'utilisation abusive, l'accès
                  non autorisé, la divulgation, l'altération ou la destruction :
                </p>
                <ul>
                  <li>
                    <strong>Chiffrement :</strong> Les mots de passe sont
                    stockés de manière cryptée (hashage bcrypt)
                  </li>
                  <li>
                    <strong>Cookies sécurisés :</strong> Utilisation de cookies
                    httpOnly et Secure pour l'authentification et les sessions
                  </li>
                  <li>
                    <strong>Protocoles sécurisés :</strong> Utilisation de HTTPS
                    pour toutes les communications
                  </li>
                  <li>
                    <strong>Accès restreint :</strong> Accès aux données
                    personnelles limité aux personnes autorisées
                  </li>
                  <li>
                    <strong>Sauvegardes régulières :</strong> Sauvegardes
                    sécurisées des données
                  </li>
                  <li>
                    <strong>Surveillance :</strong> Surveillance continue des
                    systèmes pour détecter les intrusions
                  </li>
                </ul>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>9. Partage des données</h2>
              <div className={styles.sectionContent}>
                <p>
                  Nous ne vendons jamais vos données personnelles à des tiers.
                  Nous pouvons partager vos données uniquement dans les cas
                  suivants :
                </p>
                <ul>
                  <li>
                    <strong>Prestataires de services :</strong> Avec des
                    prestataires de confiance qui nous aident à exploiter notre
                    site et à gérer nos services (hébergement, paiement,
                    livraison), sous contrat strict de confidentialité
                  </li>
                  <li>
                    <strong>Obligations légales :</strong> Si la loi l'exige ou
                    si nous pensons de bonne foi qu'une telle divulgation est
                    nécessaire pour se conformer à une procédure judiciaire
                  </li>
                  <li>
                    <strong>Avec votre consentement :</strong> Dans tous les
                    autres cas, uniquement avec votre consentement explicite
                  </li>
                </ul>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>10. Vos droits (RGPD)</h2>
              <div className={styles.sectionContent}>
                <p>
                  Conformément au RGPD, vous disposez des droits suivants
                  concernant vos données personnelles :
                </p>

                <h3 className={styles.subsectionTitle}>10.1. Droit d'accès</h3>
                <p>
                  Vous avez le droit d'obtenir une copie de vos données
                  personnelles que nous détenons.
                </p>

                <h3 className={styles.subsectionTitle}>
                  10.2. Droit de rectification
                </h3>
                <p>
                  Vous avez le droit de corriger toute donnée personnelle
                  inexacte ou incomplète.
                </p>

                <h3 className={styles.subsectionTitle}>
                  10.3. Droit à l'effacement ("droit à l'oubli")
                </h3>
                <p>
                  Vous avez le droit de demander la suppression de vos données
                  personnelles dans certains cas (par exemple, si elles ne sont
                  plus nécessaires aux finalités pour lesquelles elles ont été
                  collectées).
                </p>

                <h3 className={styles.subsectionTitle}>
                  10.4. Droit à la limitation du traitement
                </h3>
                <p>
                  Vous avez le droit de demander la limitation du traitement de
                  vos données personnelles dans certains cas.
                </p>

                <h3 className={styles.subsectionTitle}>
                  10.5. Droit à la portabilité des données
                </h3>
                <p>
                  Vous avez le droit de recevoir vos données personnelles dans
                  un format structuré et couramment utilisé, et de les
                  transmettre à un autre responsable du traitement.
                </p>

                <h3 className={styles.subsectionTitle}>
                  10.6. Droit d'opposition
                </h3>
                <p>
                  Vous avez le droit de vous opposer au traitement de vos
                  données personnelles pour des motifs légitimes.
                </p>

                <h3 className={styles.subsectionTitle}>
                  10.7. Droit de retirer votre consentement
                </h3>
                <p>
                  Si le traitement est basé sur votre consentement, vous avez le
                  droit de le retirer à tout moment, sans affecter la licéité du
                  traitement effectué avant le retrait.
                </p>

                <h3 className={styles.subsectionTitle}>
                  10.8. Comment exercer vos droits
                </h3>
                <p>
                  Pour exercer l'un de ces droits, vous pouvez nous contacter :
                </p>
                <ul>
                  <li>
                    <strong>Par e-mail :</strong>{" "}
                    <a href="mailto:contact@naturedepierre.be">
                      contact@naturedepierre.be
                    </a>
                  </li>
                  <li>
                    <strong>Par courrier :</strong> [À compléter - adresse du
                    siège social]
                  </li>
                </ul>
                <p>
                  Nous répondrons à votre demande dans un délai d'un mois. Si
                  votre demande est complexe ou si nous avons reçu de nombreuses
                  demandes, ce délai peut être prolongé de deux mois
                  supplémentaires. Nous vous en informerons.
                </p>
                <p>
                  Vous avez également le droit d'introduire une réclamation
                  auprès de l'Autorité de protection des données (APD) si vous
                  estimez que le traitement de vos données personnelles
                  constitue une violation du RGPD :
                </p>
                <ul>
                  <li>
                    <strong>Autorité de protection des données (APD) :</strong>{" "}
                    <a
                      href="https://www.autoriteprotectiondonnees.be"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      www.autoriteprotectiondonnees.be
                    </a>
                  </li>
                  <li>
                    <strong>Adresse :</strong> Rue de la Presse 35, 1000
                    Bruxelles
                  </li>
                  <li>
                    <strong>Téléphone :</strong> +32 (0)2 274 48 00
                  </li>
                </ul>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                11. Transferts internationaux
              </h2>
              <div className={styles.sectionContent}>
                <p>
                  Vos données personnelles sont stockées et traitées au sein de
                  l'Union européenne. Si nous devions transférer vos données
                  vers un pays tiers, nous nous assurerions que des garanties
                  appropriées sont en place conformément au RGPD.
                </p>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                12. Modifications de la politique de confidentialité
              </h2>
              <div className={styles.sectionContent}>
                <p>
                  Nous nous réservons le droit de modifier cette politique de
                  confidentialité à tout moment. Toute modification sera publiée
                  sur cette page avec une indication de la date de mise à jour.
                  Nous vous encourageons à consulter régulièrement cette page
                  pour prendre connaissance des éventuelles modifications.
                </p>
                <p>
                  <strong>Dernière mise à jour :</strong> [À compléter - date]
                </p>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>13. Contact</h2>
              <div className={styles.sectionContent}>
                <p>
                  Pour toute question concernant cette politique de
                  confidentialité ou le traitement de vos données personnelles,
                  vous pouvez nous contacter :
                </p>
                <ul>
                  <li>
                    <strong>E-mail :</strong>{" "}
                    <a href="mailto:contact@naturedepierre.be">
                      contact@naturedepierre.be
                    </a>
                  </li>
                  <li>
                    <strong>Téléphone :</strong> [À compléter]
                  </li>
                  <li>
                    <strong>Adresse :</strong> [À compléter - adresse du siège
                    social]
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
