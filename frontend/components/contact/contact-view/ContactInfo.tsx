"use client";

import styles from "../../../styles/components/ContactInfo.module.css";

export default function ContactInfo() {
  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Informations de Contact</h2>

      <div className={styles.sectionGroup}>
        <div className={styles.row}>
          <i className={`fas fa-map-marker-alt ${styles.icon}`}></i>
          <div>
            <h3 className={styles.rowTitle}>Adresse</h3>
            <p className={styles.rowText}>Votre adresse ici</p>
          </div>
        </div>

        <div className={styles.row}>
          <i className={`fas fa-phone ${styles.icon}`}></i>
          <div>
            <h3 className={styles.rowTitle}>Téléphone</h3>
            <p className={styles.rowText}>+33 1 23 45 67 89</p>
          </div>
        </div>

        <div className={styles.row}>
          <i className={`fas fa-envelope ${styles.icon}`}></i>
          <div>
            <h3 className={styles.rowTitle}>Email</h3>
            <p className={styles.rowText}>contact@naturedepierre.com</p>
          </div>
        </div>

        <div className={styles.row}>
          <i className={`fas fa-clock ${styles.icon}`}></i>
          <div>
            <h3 className={styles.rowTitle}>Horaires</h3>
            <p className={styles.rowText}>Lun - Ven : 9h00 - 18h00</p>
            <p className={styles.rowText}>Sam : 9h00 - 12h00</p>
          </div>
        </div>
      </div>
    </div>
  );
}
