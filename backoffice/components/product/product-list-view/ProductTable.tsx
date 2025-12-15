import React from "react";
import { ProductPublicDTO } from "dto";
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
    { label: "Produit", width: "30%" },
    { label: "Catégorie", width: "15%" },
    { label: "Prix", width: "10%", align: "right" },
    { label: "TVA", width: "8%", className: "mobile-hide", align: "center" },
    { label: "Statut", width: "10%", align: "center" },
    { label: "Date création", width: "12%", className: "mobile-hide" },
    { label: "Actions", align: "right", width: "15%" },
  ];

  return (
    <TableLayout headers={headers} minWidth="1000px" headerGradient="teal">
      {products.length === 0 && (
        <TableRow>
          <TableCell
            colSpan={headers.length}
            align="center"
            style={{ color: "#6b7280", padding: "2rem" }}
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
          formatDate={formatDate}
        />
      ))}
    </TableLayout>
  );
};

export default ProductTable;
