"use client";

import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "../styles/components/ConditionsGeneralesPage.module.css";

/**
 * Page Conditions générales de vente du backoffice
 * Accessible publiquement (sans authentification requise)
 * Affiche les conditions générales de vente complètes
 */
export default function ConditionsGeneralesPage() {
  return (
    <>
      <Head>
        <title>Conditions générales de vente - Nature de Pierre</title>
        <meta
          name="description"
          content="Conditions générales de vente de Nature de Pierre : informations sur les prix, livraison, paiement, droit de rétractation et médiation."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.page}>
        <Header />

        <main className={styles.main}>
          <div className={styles.content}>
            <h1 className={styles.title}>Conditions générales de vente</h1>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                1. Objet et champ d'application
              </h2>
              <div className={styles.sectionContent}>
                <p>
                  Les présentes Conditions Générales de Vente (CGV) régissent
                  les relations contractuelles entre Nature de Pierre et tout
                  client effectuant un achat sur le site internet. Toute
                  commande implique l'acceptation sans réserve des présentes
                  CGV.
                </p>
                <p>
                  Les CGV sont accessibles à tout moment sur le site et
                  prévalent sur tout autre document, sauf accord écrit
                  contraire.
                </p>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                2. Informations précontractuelles obligatoires
              </h2>
              <div className={styles.sectionContent}>
                <h3 className={styles.subsectionTitle}>2.1. Prix</h3>
                <p>
                  Les prix de nos produits sont indiqués en euros, toutes taxes
                  comprises (TVA incluse). Les prix sont valables tant qu'ils
                  sont visibles sur le site. Nature de Pierre se réserve le
                  droit de modifier ses prix à tout moment, étant entendu que le
                  prix figurant au jour de la commande sera le seul applicable à
                  l'acheteur.
                </p>

                <h3 className={styles.subsectionTitle}>
                  2.2. Caractéristiques des produits
                </h3>
                <p>
                  Les caractéristiques essentielles de chaque produit
                  (dimensions, poids, matériaux, origine) sont indiquées sur la
                  fiche produit. Les photographies et graphiques présentés ne
                  sont pas contractuels et ne sauraient engager la
                  responsabilité de Nature de Pierre.
                </p>

                <h3 className={styles.subsectionTitle}>2.3. Frais</h3>
                <p>
                  Les frais de livraison sont indiqués lors du processus de
                  commande, avant la validation finale. Les frais de livraison
                  peuvent varier selon le poids, les dimensions et la
                  destination du colis. Aucun frais supplémentaire ne sera
                  facturé sans accord préalable du client.
                </p>

                <h3 className={styles.subsectionTitle}>
                  2.4. Modalités de livraison
                </h3>
                <p>
                  Les délais de livraison sont indiqués lors de la commande et
                  varient selon le mode de livraison choisi. Les livraisons sont
                  effectuées à l'adresse indiquée par le client lors de la
                  commande. Le client est tenu de vérifier l'état des produits à
                  la réception et de signaler toute anomalie dans les 48 heures
                  suivant la livraison.
                </p>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>3. Droit de rétractation</h2>
              <div className={styles.sectionContent}>
                <h3 className={styles.subsectionTitle}>
                  3.1. Délai de rétractation
                </h3>
                <p>
                  Conformément à la législation en vigueur, le client dispose
                  d'un délai de <strong>14 jours calendaires</strong> à compter
                  de la réception des produits pour exercer son droit de
                  rétractation, sans avoir à justifier de motifs ni à payer de
                  pénalité.
                </p>

                <h3 className={styles.subsectionTitle}>
                  3.2. Procédure de rétractation
                </h3>
                <p>
                  Pour exercer le droit de rétractation, le client doit notifier
                  sa décision de se rétracter par un moyen permettant d'en
                  obtenir un accusé de réception, notamment :
                </p>
                <ul>
                  <li>
                    Par e-mail à l'adresse :{" "}
                    <a href="mailto:contact@naturedepierre.be">
                      contact@naturedepierre.be
                    </a>
                  </li>
                  <li>
                    En utilisant le formulaire de rétractation disponible sur le
                    site
                  </li>
                  <li>
                    Par courrier postal à l'adresse du siège social indiquée
                    dans les mentions légales
                  </li>
                </ul>

                <h3 className={styles.subsectionTitle}>3.3. Frais de retour</h3>
                <p>
                  En cas de rétractation, les frais de retour sont à la charge
                  du client, sauf si les produits livrés ne correspondent pas à
                  la commande ou sont défectueux. Le remboursement sera effectué
                  dans un délai maximum de 14 jours à compter de la réception
                  des produits retournés.
                </p>

                <h3 className={styles.subsectionTitle}>
                  3.4. Conditions de retour
                </h3>
                <p>
                  Les produits doivent être retournés dans leur état d'origine,
                  non utilisés, non lavés, avec tous les accessoires et
                  emballages d'origine. Nature de Pierre se réserve le droit de
                  refuser le remboursement si les produits ne sont pas retournés
                  dans ces conditions.
                </p>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>4. Modalités de paiement</h2>
              <div className={styles.sectionContent}>
                <p>Le paiement s'effectue par l'un des moyens suivants :</p>
                <ul>
                  <li>Carte bancaire (Visa, Mastercard, etc.)</li>
                  <li>Virement bancaire</li>
                  <li>Autres moyens de paiement proposés sur le site</li>
                </ul>
                <p>
                  Le paiement est exigible immédiatement à la commande. En cas
                  de paiement par carte bancaire, la transaction est sécurisée
                  et les données bancaires sont cryptées.
                </p>
                <p>
                  En cas de défaut de paiement, Nature de Pierre se réserve le
                  droit d'annuler la commande ou de suspendre l'exécution de la
                  livraison.
                </p>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                5. Exécution de la commande
              </h2>
              <div className={styles.sectionContent}>
                <p>
                  La commande est considérée comme acceptée par Nature de Pierre
                  dès l'envoi d'un e-mail de confirmation. Cette confirmation
                  vaut acceptation de la commande et formation du contrat de
                  vente.
                </p>
                <p>
                  Nature de Pierre s'engage à livrer les produits commandés dans
                  les délais indiqués. En cas de retard de livraison, le client
                  sera informé et pourra annuler sa commande si le nouveau délai
                  proposé ne lui convient pas.
                </p>
                <p>
                  En cas d'indisponibilité d'un produit après passation de la
                  commande, le client en sera informé dans les plus brefs délais
                  et pourra soit annuler sa commande, soit commander un produit
                  de substitution.
                </p>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>6. Livraison</h2>
              <div className={styles.sectionContent}>
                <p>
                  Les livraisons sont effectuées à l'adresse indiquée par le
                  client lors de la commande. Les risques de perte ou
                  d'endommagement des produits sont transférés au client au
                  moment de la livraison.
                </p>
                <p>
                  En cas d'absence du client au moment de la livraison, le
                  transporteur laissera un avis de passage permettant de
                  récupérer le colis selon les modalités qu'il indiquera.
                </p>
                <p>
                  Les délais de livraison sont donnés à titre indicatif. Tout
                  retard de livraison ne pourra donner lieu à des dommages et
                  intérêts, à l'annulation de la commande ou au remboursement,
                  sauf en cas de faute lourde de Nature de Pierre.
                </p>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>7. Gestion des retours</h2>
              <div className={styles.sectionContent}>
                <p>
                  En dehors du droit de rétractation, les retours sont acceptés
                  dans les cas suivants :
                </p>
                <ul>
                  <li>Produit défectueux ou non conforme à la commande</li>
                  <li>Erreur de livraison</li>
                  <li>Produit endommagé lors du transport</li>
                </ul>
                <p>
                  Dans ces cas, les frais de retour sont à la charge de Nature
                  de Pierre. Le client doit contacter le service client dans les
                  48 heures suivant la réception pour signaler le problème.
                </p>
                <p>
                  Le remboursement ou l'échange sera effectué après réception et
                  vérification du produit retourné.
                </p>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                8. Remboursement dans les délais légaux
              </h2>
              <div className={styles.sectionContent}>
                <p>
                  Conformément à la législation en vigueur, le remboursement
                  sera effectué dans un délai maximum de{" "}
                  <strong>14 jours</strong> à compter :
                </p>
                <ul>
                  <li>
                    De la réception par Nature de Pierre de la notification de
                    rétractation du client, ou
                  </li>
                  <li>
                    De la réception des produits retournés, selon le premier de
                    ces événements
                  </li>
                </ul>
                <p>
                  Le remboursement sera effectué par le même moyen de paiement
                  que celui utilisé pour la transaction initiale, sauf accord
                  exprès du client pour un autre moyen de paiement.
                </p>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                9. Respect du Code de droit économique
              </h2>
              <div className={styles.sectionContent}>
                <p>
                  Nature de Pierre s'engage à respecter le Code de droit
                  économique belge, notamment en matière de :
                </p>
                <ul>
                  <li>
                    <strong>Communications claires :</strong> Toutes les
                    informations contractuelles sont communiquées de manière
                    claire, compréhensible et accessible avant la conclusion du
                    contrat.
                  </li>
                  <li>
                    <strong>Avenants contractuels transparents :</strong> Toute
                    modification des présentes CGV sera communiquée aux clients
                    de manière transparente et avec un préavis suffisant.
                  </li>
                  <li>
                    <strong>Absence de clauses abusives :</strong> Les présentes
                    CGV ne contiennent aucune clause abusive. Toute clause
                    contraire à la législation en vigueur sera réputée non
                    écrite.
                  </li>
                </ul>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                10. Médiation de la consommation
              </h2>
              <div className={styles.sectionContent}>
                <p>
                  Conformément à la législation en vigueur, Nature de Pierre
                  propose un dispositif de médiation de la consommation pour
                  régler les litiges de manière amiable.
                </p>
                <p>
                  <strong>Médiateur :</strong> [À compléter - nom du médiateur]
                </p>
                <p>
                  <strong>Coordonnées du médiateur :</strong>
                </p>
                <ul>
                  <li>
                    <strong>Adresse :</strong> [À compléter]
                  </li>
                  <li>
                    <strong>Téléphone :</strong> [À compléter]
                  </li>
                  <li>
                    <strong>E-mail :</strong> [À compléter]
                  </li>
                  <li>
                    <strong>Site web :</strong> [À compléter]
                  </li>
                </ul>
                <p>
                  La médiation est un service gratuit pour le consommateur. Le
                  consommateur peut saisir le médiateur à tout moment, mais
                  s'engage à avoir préalablement tenté de résoudre le litige
                  directement avec Nature de Pierre.
                </p>
                <p>
                  Le consommateur peut également introduire une plainte auprès
                  du Service de médiation pour le consommateur via le site{" "}
                  <a
                    href="https://www.mediationconsommateur.be"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    www.mediationconsommateur.be
                  </a>
                  .
                </p>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>11. Produits spécifiques</h2>
              <div className={styles.sectionContent}>
                <h3 className={styles.subsectionTitle}>
                  11.1. Équipements électroniques (WEEE)
                </h3>
                <p>
                  Si Nature de Pierre vend des équipements électroniques, elle
                  respecte les obligations de collecte et de recyclage prévues
                  par la directive WEEE (Waste Electrical and Electronic
                  Equipment). Les clients peuvent retourner leurs équipements
                  électroniques usagés selon les modalités indiquées sur le
                  site.
                </p>

                <h3 className={styles.subsectionTitle}>
                  11.2. Batteries et accumulateurs (UPV)
                </h3>
                <p>
                  Si Nature de Pierre vend des batteries ou accumulateurs, elle
                  respecte les obligations de reprise des déchets selon la
                  catégorie concernée. Les clients peuvent retourner leurs
                  batteries usagées selon les modalités indiquées sur le site.
                </p>

                <h3 className={styles.subsectionTitle}>
                  11.3. Autres produits réglementés
                </h3>
                <p>
                  Pour les produits alimentaires, cosmétiques ou de santé, des
                  règles particulières de sécurité, qualité et mentions
                  s'appliquent. Ces règles sont spécifiques à chaque catégorie
                  de produits et sont conformes à la législation en vigueur.
                </p>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                12. Propriété intellectuelle
              </h2>
              <div className={styles.sectionContent}>
                <p>
                  Tous les éléments du site Nature de Pierre (textes, images,
                  logos, etc.) sont la propriété exclusive de Nature de Pierre
                  et sont protégés par les lois relatives à la propriété
                  intellectuelle.
                </p>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                13. Droit applicable et juridiction
              </h2>
              <div className={styles.sectionContent}>
                <p>
                  Les présentes CGV sont régies par le droit belge. Tout litige
                  relatif à leur interprétation et/ou à leur exécution relève
                  des tribunaux compétents du ressort du siège social de Nature
                  de Pierre.
                </p>
                <p>
                  Conformément à la législation européenne, le consommateur
                  résidant dans un État membre de l'Union européenne peut
                  également saisir les tribunaux de son pays de résidence.
                </p>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>14. Contact</h2>
              <div className={styles.sectionContent}>
                <p>
                  Pour toute question relative aux présentes CGV, vous pouvez
                  nous contacter :
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
