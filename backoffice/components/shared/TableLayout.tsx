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
  style?: React.CSSProperties;
  colSpan?: number;
  dataLabel?: string;
}

interface TableLayoutProps {
  headers: TableHeader[];
  children: React.ReactNode;
  minWidth?: string;
  headerGradient?: "teal" | "gold";
}

interface TableRowProps {
  children: React.ReactNode;
  backgroundColor?: string;
}

const gradientMap: Record<
  NonNullable<TableLayoutProps["headerGradient"]>,
  React.CSSProperties
> = {
  teal: {
    background: "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
    color: "white",
  },
  gold: {
    background: "linear-gradient(135deg, #d9b970 0%, #f4d03f 100%)",
    color: "#13686a",
  },
};

const TableLayout: React.FC<TableLayoutProps> = ({
  headers,
  children,
  minWidth = "800px",
  headerGradient = "teal",
}) => {
  return (
    <HeadersContext.Provider value={headers}>
      <div className={styles.tableContainer}>
        <div
          className={styles.tableResponsive}
          style={{
            overflowX: "auto",
            overflowY: "auto",
            flex: 1,
          }}
        >
          <table
            className={styles.table}
            style={{
              minWidth,
            }}
          >
            <thead
              className={styles.tableHead}
              style={gradientMap[headerGradient]}
            >
              <tr>
                {headers.map((h, idx) => (
                  <th
                    key={`${h.label}-${idx}`}
                    style={{
                      textAlign: h.align || "left",
                      width: h.width,
                      ...gradientMap[headerGradient],
                    }}
                    className={`${styles.tableHeadCell} ${h.className || ""}`}
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
  backgroundColor = "white",
}) => {
  const headers = useContext(HeadersContext);
  return (
    <tr
      className={styles.tableRow}
      style={{
        background: backgroundColor,
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background =
          backgroundColor === "white"
            ? "linear-gradient(90deg, rgba(19, 104, 106, 0.05) 0%, rgba(13, 211, 209, 0.05) 100%)"
            : "#f9fafb";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = backgroundColor;
      }}
    >
      {React.Children.map(children, (cell, idx) => {
        if (React.isValidElement(cell)) {
          const label = headers[idx]?.label ?? headers.at(-1)?.label ?? "";
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
  style,
  colSpan,
  dataLabel,
}) => {
  return (
    <td
      style={{
        textAlign: align,
        width,
        ...style,
      }}
      className={`${styles.tableCell} ${className || ""}`}
      data-label={dataLabel ?? ""}
      colSpan={colSpan}
    >
      {children}
    </td>
  );
};

export default TableLayout;
