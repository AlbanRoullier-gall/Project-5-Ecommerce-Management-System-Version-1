import React from "react";
import Link from "next/link";
import styles from "../styles/components/Footer.module.css";

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.social}>
        <a
          className={styles.socialLink}
          href="#"
          onClick={(e) => e.preventDefault()}
        >
          <i className="fab fa-facebook"></i>
        </a>
        <a
          className={styles.socialLink}
          href="#"
          onClick={(e) => e.preventDefault()}
        >
          <i className="fab fa-instagram"></i>
        </a>
        <a
          className={styles.socialLink}
          href="#"
          onClick={(e) => e.preventDefault()}
        >
          <i className="fab fa-linkedin"></i>
        </a>
        <a
          className={styles.socialLink}
          href="#"
          onClick={(e) => e.preventDefault()}
        >
          <i className="fab fa-twitter"></i>
        </a>
      </div>
      <div className={styles.legal}>
        <Link href="/mentions-legales" className={styles.legalLink}>
          Mentions légales
        </Link>{" "}
        |
        <Link
          href="/politique-confidentialite"
          className={styles.legalLink}
        >
          Politique de confidentialité
        </Link>{" "}
        |
        <Link href="/conditions-generales" className={styles.legalLink}>
          Conditions générales
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
