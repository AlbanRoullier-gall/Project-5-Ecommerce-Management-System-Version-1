import React from "react";

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
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "3rem",
        paddingBottom: "2rem",
        borderBottom: "3px solid #d9b970",
      }}
    >
      <h1
        style={{
          fontSize: "3rem",
          color: "#13686a",
          fontWeight: "bold",
          textShadow: "1px 1px 2px rgba(0, 0, 0, 0.05)",
          margin: 0,
        }}
      >
        {title}
      </h1>
      {children && (
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
