import React from "react";
import { ProductPublicDTO } from "../../../dto";
import ProductTableRow from "./table/ProductTableRow";
import TableLayout, {
  TableHeader,
  TableRow,
  TableCell,
} from "../../shared/TableLayout";

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
 *   products={products}
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

  // Empty state handled below inside TableLayout for consistency

  const headers: TableHeader[] = [
    { label: "Produit" },
    { label: "Catégorie" },
    { label: "Prix" },
    { label: "TVA", className: "mobile-hide" },
    { label: "Statut" },
    { label: "Date création", className: "mobile-hide" },
    { label: "Actions", align: "right", width: "160px" },
  ];

  return (
    <TableLayout headers={headers} minWidth="800px" headerGradient="teal">
      {products.length === 0 && (
        <TableRow>
          <TableCell
            colSpan={7}
            align="center"
            style={{ color: "#6b7280", padding: "1rem" }}
          >
            Aucun produit trouvé
          </TableCell>
        </TableRow>
      )}
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
    </TableLayout>
  );
};

export default ProductTable;
