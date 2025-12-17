import React from "react";
import { AddressPublicDTO } from "dto";
import TableLayout, { TableHeader } from "../../shared/TableLayout";
import tableStyles from "../../../styles/components/TableLayout.module.css";
import styles from "../../../styles/components/AddressTable.module.css";
import AddressTableRow from "./AddressTableRow";

/**
 * Props du composant AddressTable
 */
interface AddressTableProps {
  /** Liste des adresses à afficher */
  addresses: AddressPublicDTO[];
  /** Callback appelé pour éditer une adresse */
  onEdit: (address: AddressPublicDTO) => void;
  /** Callback appelé pour supprimer une adresse */
  onDelete: (addressId: number) => void;
}

/**
 * Composant tableau des adresses
 */
const AddressTable: React.FC<AddressTableProps> = ({
  addresses,
  onEdit,
  onDelete,
}) => {
  if (addresses.length === 0) {
    return (
      <div className={styles.emptyState}>
        <i className={`fas fa-map-marker-alt ${styles.emptyIcon}`}></i>
        <p className={styles.emptyText}>Aucune adresse enregistrée</p>
      </div>
    );
  }

  const headers: TableHeader[] = [
    { label: "Adresse", align: "left" },
    { label: "Code postal", align: "center", width: "130px" },
    { label: "Ville", align: "left" },
    { label: "Pays", align: "left", className: tableStyles.mobileHide },
    { label: "Par défaut", align: "center", width: "140px" },
    { label: "Actions", align: "center", width: "160px" },
  ];

  return (
    <TableLayout headers={headers} minWidth="800px">
      {addresses.map((address) => (
        <AddressTableRow
          key={address.addressId}
          address={address}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </TableLayout>
  );
};

export default AddressTable;
