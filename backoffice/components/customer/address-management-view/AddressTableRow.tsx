import React from "react";
import { AddressPublicDTO } from "dto";
import { TableRow, TableCell } from "../../shared/TableLayout";
import tableStyles from "../../../styles/components/TableLayout.module.css";
import styles from "../../../styles/components/AddressTable.module.css";

/**
 * Props du composant AddressTableRow
 */
interface AddressTableRowProps {
  /** Adresse à afficher */
  address: AddressPublicDTO;
  /** Callback appelé pour éditer une adresse */
  onEdit: (address: AddressPublicDTO) => void;
  /** Callback appelé pour supprimer une adresse */
  onDelete: (addressId: number) => void;
}

/**
 * Composant ligne du tableau d'adresses
 */
const AddressTableRow: React.FC<AddressTableRowProps> = ({
  address,
  onEdit,
  onDelete,
}) => {
  return (
    <TableRow>
      <TableCell align="left">
        <span className={styles.addressText}>{address.address}</span>
      </TableCell>

      <TableCell align="center">
        <span className={styles.metaText}>{address.postalCode}</span>
      </TableCell>

      <TableCell align="left">
        <span className={styles.metaText}>{address.city}</span>
      </TableCell>

      <TableCell align="left" className={tableStyles.mobileHide}>
        <span className={styles.metaText}>{address.countryName}</span>
      </TableCell>

      <TableCell align="center">
        {address.isDefault ? (
          <span className={styles.badgeYes}>Oui</span>
        ) : (
          <span className={styles.badgeNo}>Non</span>
        )}
      </TableCell>

      <TableCell align="center">
        <div className={styles.actions}>
          <button
            onClick={() => onEdit(address)}
            className={`${styles.actionButton} ${styles.edit}`}
            title="Éditer"
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            onClick={() => onDelete(address.addressId)}
            className={`${styles.actionButton} ${styles.delete}`}
            title="Supprimer"
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default AddressTableRow;
