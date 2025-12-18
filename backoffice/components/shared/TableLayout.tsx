import React, { createContext, useContext } from "react";
import styles from "../../styles/components/TableLayout.module.css";

const HeadersContext = createContext<TableHeader[]>([]);

export interface TableHeader {
  label: string;
  align?: "left" | "right" | "center";
  width?: string;
  className?: string;
}

export interface TableCellProps {
  children: React.ReactNode;
  align?: "left" | "right" | "center";
  width?: string;
  className?: string;
  colSpan?: number;
  dataLabel?: string;
}

interface TableLayoutProps {
  headers: TableHeader[];
  children: React.ReactNode;
  headerGradient?: "teal" | "gold";
  minWidth?: string;
}

interface TableRowProps {
  children: React.ReactNode;
  backgroundColor?: string;
}

const alignClassMap: Record<NonNullable<TableHeader["align"]>, string> = {
  left: styles.alignLeft,
  right: styles.alignRight,
  center: styles.alignCenter,
};

const TableLayout: React.FC<TableLayoutProps> = ({
  headers,
  children,
  headerGradient = "teal",
  minWidth,
}) => {
  return (
    <HeadersContext.Provider value={headers}>
      <div
        className={styles.tableContainer}
        style={minWidth ? { minWidth } : undefined}
      >
        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead
              className={`${styles.tableHead} ${
                headerGradient === "gold" ? styles.gold : styles.teal
              }`}
            >
              <tr>
                {headers.map((h, idx) => (
                  <th
                    key={`${h.label}-${idx}`}
                    style={h.width ? { width: h.width } : undefined}
                    className={`${styles.tableHeadCell} ${
                      headerGradient === "gold" ? styles.gold : styles.teal
                    } ${h.align ? alignClassMap[h.align] : styles.alignLeft} ${
                      h.className || ""
                    }`}
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={styles.tableBody}>{children}</tbody>
          </table>
        </div>
      </div>
    </HeadersContext.Provider>
  );
};

export const TableRow: React.FC<TableRowProps> = ({
  children,
  backgroundColor,
}) => {
  const headers = useContext(HeadersContext);
  return (
    <tr
      className={styles.tableRow}
      style={backgroundColor ? { backgroundColor } : undefined}
    >
      {React.Children.map(children, (cell, idx) => {
        if (React.isValidElement(cell)) {
          // Préserver le dataLabel s'il est déjà défini, sinon utiliser le header correspondant
          const existingLabel = (cell.props as TableCellProps).dataLabel;
          const label =
            existingLabel || headers[idx]?.label || headers.at(-1)?.label || "";
          return React.cloneElement(cell, { dataLabel: label });
        }
        return cell;
      })}
    </tr>
  );
};

export const TableCell: React.FC<TableCellProps> = ({
  children,
  align = "left",
  width,
  className,
  colSpan,
  dataLabel,
}) => {
  return (
    <td
      style={width ? { width } : undefined}
      className={`${styles.tableCell} ${
        align ? alignClassMap[align] : styles.alignLeft
      } ${className || ""}`}
      data-label={dataLabel ?? ""}
      colSpan={colSpan}
    >
      {children}
    </td>
  );
};

export default TableLayout;
