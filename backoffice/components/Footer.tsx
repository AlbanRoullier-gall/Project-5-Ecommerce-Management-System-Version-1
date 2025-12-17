import React from "react";
import Link from "next/link";
import styles from "../styles/components/Footer.module.css";

/**
 * Composant Footer du backoffice
 *
 * Affiche :
 * - Liens vers les réseaux sociaux (Facebook, Instagram, LinkedIn, Twitter)
 * - Liens légaux (Mentions légales, Politique de confidentialité, CGV)
 *
 * Style simple et épuré pour ne pas surcharger le backoffice
 */
const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.social}>
        <a href="#" onClick={(e) => e.preventDefault()}>
          <i className="fab fa-facebook"></i>
        </a>
        <a href="#" onClick={(e) => e.preventDefault()}>
          <i className="fab fa-instagram"></i>
        </a>
        <a href="#" onClick={(e) => e.preventDefault()}>
          <i className="fab fa-linkedin"></i>
        </a>
        <a href="#" onClick={(e) => e.preventDefault()}>
          <i className="fab fa-twitter"></i>
        </a>
      </div>
      <div className={styles.text}>
        <Link href="/mentions-legales">Mentions légales</Link> |
        <Link href="/politique-confidentialite">
          {" "}
          Politique de confidentialité
        </Link>{" "}
        |<Link href="/conditions-generales"> Conditions générales</Link>
      </div>
    </footer>
  );
};

export default Footer;
