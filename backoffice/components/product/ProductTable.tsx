import React from "react";
import { ProductPublicDTO } from "../../dto";
import ProductTableRow from "./table/ProductTableRow";

/**
 * Props du composant ProductTable
 */
interface ProductTableProps {
  /** Liste des produits à afficher */
  products: ProductPublicDTO[];
  /** Callback appelé pour éditer un produit */
  onEdit: (product: ProductPublicDTO) => void;
  /** Callback appelé pour supprimer un produit */
  onDelete: (productId: number) => void;
  /** Callback appelé pour changer le statut d'un produit */
  onToggleStatus: (productId: number, currentStatus: boolean) => void;
}

/**
 * Composant tableau de produits
 * Affiche la liste des produits dans un tableau avec colonnes :
 * - Produit (image + nom + description)
 * - Catégorie
 * - Prix
 * - TVA
 * - Statut
 * - Date de création
 * - Actions (éditer/supprimer)
 *
 * Affiche un message si aucun produit n'est trouvé
 *
 * @example
 * <ProductTable
 *   products={filteredProducts}
 *   onEdit={handleEditProduct}
 *   onDelete={handleDeleteProduct}
 *   onToggleStatus={handleToggleProductStatus}
 * />
 */
const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  /**
   * Formate un prix en euros (fr-BE)
   * @param price - Prix à formater
   * @returns Prix formaté avec symbole €
   */
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-BE", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  /**
   * Formate une date au format DD/MM/YYYY (fr-BE)
   * @param date - Date à formater
   * @returns Date formatée
   */
  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat("fr-BE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  };

  if (products.length === 0) {
    return (
      <div
        style={{
          background: "white",
          padding: "4rem 2rem",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
          textAlign: "center",
          border: "2px solid rgba(19, 104, 106, 0.1)",
        }}
      >
        <i
          className="fas fa-inbox"
          style={{ fontSize: "4rem", color: "#d1d5db", marginBottom: "1rem" }}
        ></i>
        <p style={{ fontSize: "1.2rem", color: "#6b7280" }}>
          Aucun produit trouvé
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        border: "2px solid rgba(19, 104, 106, 0.1)",
      }}
    >
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            fontSize: "1rem",
          }}
        >
          <thead
            style={{
              background: "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
              color: "white",
            }}
          >
            <tr>
              <th
                style={{
                  padding: "1.5rem 1.25rem",
                  textAlign: "left",
                  fontSize: "1rem",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Produit
              </th>
              <th
                style={{
                  padding: "1.5rem 1.25rem",
                  textAlign: "left",
                  fontSize: "1rem",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Catégorie
              </th>
              <th
                style={{
                  padding: "1.5rem 1.25rem",
                  textAlign: "left",
                  fontSize: "1rem",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Prix
              </th>
              <th
                style={{
                  padding: "1.5rem 1.25rem",
                  textAlign: "left",
                  fontSize: "1rem",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                TVA
              </th>
              <th
                style={{
                  padding: "1.5rem 1.25rem",
                  textAlign: "left",
                  fontSize: "1rem",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Statut
              </th>
              <th
                style={{
                  padding: "1.5rem 1.25rem",
                  textAlign: "left",
                  fontSize: "1rem",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Date création
              </th>
              <th
                style={{
                  padding: "1.5rem 1.25rem",
                  textAlign: "left",
                  fontSize: "1rem",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <ProductTableRow
                key={product.id}
                product={product}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleStatus={onToggleStatus}
                formatPrice={formatPrice}
                formatDate={formatDate}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
