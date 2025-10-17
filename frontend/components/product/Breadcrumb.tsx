import React from "react";
import { useRouter } from "next/router";

interface BreadcrumbProps {
  productName: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ productName }) => {
  const router = useRouter();
  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(10px)",
        padding: "1rem 2rem",
        borderBottom: "1px solid rgba(19, 104, 106, 0.08)",
        boxShadow: "0 4px 18px rgba(0, 0, 0, 0.06)",
      }}
    >
      <div
        className="breadcrumb-container"
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          fontSize: "1.2rem",
          color: "#666",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <button
          onClick={() => router.push("/")}
          style={{
            background: "rgba(19,104,106,0.06)",
            border: "1px solid rgba(19,104,106,0.15)",
            color: "#13686a",
            cursor: "pointer",
            fontSize: "1.05rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.4rem 0.9rem",
            borderRadius: "10px",
            transition: "all 0.25s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(19, 104, 106, 0.14)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "none";
          }}
        >
          <i className="fas fa-home"></i>
          Accueil
        </button>
        <i
          className="fas fa-chevron-right"
          style={{ fontSize: "0.9rem", color: "#999" }}
        ></i>
        <span style={{ color: "#999" }}>Produits</span>
        <i
          className="fas fa-chevron-right"
          style={{ fontSize: "0.9rem", color: "#999" }}
        ></i>
        <span style={{ color: "#13686a", fontWeight: "600" }}>
          {productName}
        </span>
      </div>
    </div>
  );
};

export default Breadcrumb;
