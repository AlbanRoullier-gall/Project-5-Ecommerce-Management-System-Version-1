import React from "react";

export interface TableHeader {
  label: string;
  align?: "left" | "right" | "center";
  width?: string;
  className?: string;
}

export interface TableCell {
  children: React.ReactNode;
  align?: "left" | "right" | "center";
  width?: string;
  className?: string;
  style?: React.CSSProperties;
  colSpan?: number;
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
  const headerStyleBase: React.CSSProperties = {
    padding: "1.5rem 1.25rem",
    textAlign: "left",
    fontSize: "1rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  };

  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        border: "2px solid rgba(19, 104, 106, 0.1)",
        display: "flex",
        flexDirection: "column",
        maxHeight: "600px",
      }}
    >
      <div
        className="table-responsive"
        style={{
          overflowX: "auto",
          overflowY: "auto",
          flex: 1,
        }}
      >
        <table
          style={{
            width: "100%",
            tableLayout: "fixed",
            borderCollapse: "separate",
            borderSpacing: 0,
            fontSize: "1rem",
            minWidth,
          }}
        >
          <thead style={gradientMap[headerGradient]}>
            <tr>
              {headers.map((h, idx) => (
                <th
                  key={`${h.label}-${idx}`}
                  style={{
                    ...headerStyleBase,
                    textAlign: h.align || "left",
                    width: h.width,
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    ...gradientMap[headerGradient],
                  }}
                  className={h.className}
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
};

export const TableRow: React.FC<TableRowProps> = ({
  children,
  backgroundColor = "white",
}) => {
  return (
    <tr
      style={{
        borderBottom: "1px solid #e1e5e9",
        transition: "all 0.2s ease",
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
      {children}
    </tr>
  );
};

export const TableCell: React.FC<TableCell> = ({
  children,
  align = "left",
  width,
  className,
  style,
  colSpan,
}) => {
  return (
    <td
      style={{
        padding: "1.5rem 1.25rem",
        textAlign: align,
        width,
        ...style,
      }}
      className={className}
      colSpan={colSpan}
    >
      {children}
    </td>
  );
};

export default TableLayout;
