import React from "react";
import { ProductPublicDTO } from "../../dto";

interface PriceBoxProps {
  product: ProductPublicDTO;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
  }).format(price);
};

const getPriceWithVat = (price: number, vatRate: number) => {
  return price * (1 + vatRate / 100);
};

const PriceBox: React.FC<PriceBoxProps> = ({ product }) => {
  const priceWithVat = getPriceWithVat(product.price, product.vatRate);
  return (
    <section
      style={{
        display: "grid",
        rowGap: "0.5rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          color: "#13686a",
          fontWeight: 800,
          fontSize: "0.95rem",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        <i className="fas fa-euro-sign"></i>
        <span>Prix</span>
      </div>
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e6eef5",
          borderRadius: "12px",
          padding: "1rem 1.25rem",
          boxShadow: "0 10px 30px rgba(16,42,67,0.06)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-20px",
            right: "-20px",
            width: "80px",
            height: "80px",
            background: "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
            borderRadius: "50%",
            opacity: 0.1,
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <div
            className="price-value"
            style={{
              fontSize: "3rem",
              fontWeight: 900,
              color: "#13686a",
              marginBottom: "0.25rem",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              textAlign: "right",
            }}
          >
            {formatPrice(priceWithVat)}
          </div>

          <div
            style={{
              display: "inline-block",
              padding: "0.4rem 1rem",
              background: "rgba(19, 104, 106, 0.1)",
              borderRadius: "20px",
              fontSize: "1rem",
              color: "#13686a",
              fontWeight: "600",
              marginBottom: "1rem",
            }}
          >
            TTC
          </div>
        </div>

        <div
          style={{
            fontSize: "1rem",
            color: "#52606d",
            display: "flex",
            gap: "1.25rem",
            paddingTop: "0.75rem",
            borderTop: "1px solid #edf2f7",
          }}
        >
          <span>
            <i
              className="fas fa-receipt"
              style={{ marginRight: "0.5rem", color: "#13686a" }}
            ></i>
            HT : {formatPrice(product.price)}
          </span>
          <span>
            <i
              className="fas fa-percentage"
              style={{ marginRight: "0.5rem", color: "#13686a" }}
            ></i>
            TVA : {product.vatRate}%
          </span>
        </div>
      </div>
    </section>
  );
};

export default PriceBox;
