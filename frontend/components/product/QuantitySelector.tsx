import React from "react";

interface QuantitySelectorProps {
  quantity: number;
  onChange: (newQuantity: number) => void;
  disabled?: boolean;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onChange,
  disabled = false,
}) => {
  return (
    <section style={{ display: "grid", rowGap: "0.5rem" }}>
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
        <i className="fas fa-box"></i>
        <span>Quantité</span>
      </div>
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e6eef5",
          borderRadius: "12px",
          padding: "0.9rem 1rem",
          boxShadow: "0 8px 24px rgba(16, 42, 67, 0.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
          }}
        >
          <button
            className="quantity-button"
            onClick={() => onChange(quantity - 1)}
            disabled={quantity <= 1 || disabled}
            style={{
              width: "52px",
              height: "52px",
              background:
                quantity <= 1 || disabled
                  ? "#f3f4f6"
                  : "rgba(19, 104, 106, 0.95)",
              color: quantity <= 1 || disabled ? "#9aa5b1" : "white",
              border: "none",
              fontSize: "1.4rem",
              cursor: quantity <= 1 || disabled ? "not-allowed" : "pointer",
              borderRadius: "12px",
              fontWeight: 800,
              transition: "all 0.2s ease",
              boxShadow:
                quantity <= 1 || disabled
                  ? "none"
                  : "0 8px 20px rgba(19, 104, 106, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              if (quantity > 1) {
                e.currentTarget.style.transform = "scale(1.05)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <i className="fas fa-minus"></i>
          </button>

          <div
            className="quantity-display"
            style={{
              flex: 1,
              textAlign: "center",
              padding: "1rem",
              background:
                "linear-gradient(135deg, rgba(19,104,106,0.06) 0%, rgba(13, 211, 209, 0.06) 100%)",
              borderRadius: "12px",
              border: "1px solid #e6eef5",
              fontSize: "1.6rem",
              fontWeight: 800,
              color: "#13686a",
            }}
          >
            {quantity}
          </div>

          <button
            className="quantity-button"
            onClick={() => onChange(quantity + 1)}
            disabled={disabled}
            style={{
              width: "52px",
              height: "52px",
              background: disabled ? "#f3f4f6" : "rgba(19, 104, 106, 1)",
              color: disabled ? "#9aa5b1" : "white",
              border: "none",
              fontSize: "1.4rem",
              cursor: disabled ? "not-allowed" : "pointer",
              borderRadius: "12px",
              fontWeight: 800,
              transition: "all 0.2s ease",
              boxShadow: disabled
                ? "none"
                : "0 8px 20px rgba(19, 104, 106, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <i className="fas fa-plus"></i>
          </button>
        </div>
      </div>
    </section>
  );
};

export default QuantitySelector;
