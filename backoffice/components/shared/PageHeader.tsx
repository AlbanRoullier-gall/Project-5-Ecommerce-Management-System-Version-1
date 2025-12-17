import React from "react";
import styles from "../../styles/components/PageHeader.module.css";

/**
 * Props du composant PageHeader
 */
interface PageHeaderProps {
  /** Titre de la page */
  title: string;
  /** Boutons d'action à afficher à droite du titre (optionnel) */
  children?: React.ReactNode;
}

/**
 * En-tête de page avec titre et boutons d'action
 * Affiche un titre principal avec une bordure en bas et permet d'ajouter des boutons d'action à droite
 *
 * @example
 * <PageHeader title="Produits">
 *   <Button>Nouveau produit</Button>
 * </PageHeader>
 */
const PageHeader: React.FC<PageHeaderProps> = ({ title, children }) => {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      {children && <div className={styles.actions}>{children}</div>}
    </div>
  );
};

export default PageHeader;
