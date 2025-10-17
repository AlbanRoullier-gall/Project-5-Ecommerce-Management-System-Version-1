import React from "react";

interface AddToCartButtonProps {
  isInCart: boolean;
  disabled: boolean;
  onClick: () => void;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  isInCart,
  disabled,
  onClick,
}) => {
  return (
    <button
      className="add-to-cart-button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "1.6rem",
        background: disabled ? "#9aa5b1" : "#13686a",
        color: "white",
        border: "none",
        borderRadius: "14px",
        fontSize: "1.4rem",
        fontWeight: 900,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        boxShadow: disabled
          ? "0 4px 10px rgba(0, 0, 0, 0.08)"
          : "0 10px 28px rgba(19, 104, 106, 0.35)",
        opacity: disabled ? 0.8 : 1,
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow =
            "0 16px 38px rgba(19, 104, 106, 0.4)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          "0 10px 28px rgba(19, 104, 106, 0.35)";
      }}
    >
      {disabled ? (
        <>
          <i
            className="fas fa-spinner fa-spin"
            style={{ marginRight: "0.8rem" }}
          ></i>
          {isInCart ? "Mise à jour..." : "Ajout en cours..."}
        </>
      ) : (
        <>
          <i
            className={isInCart ? "fas fa-sync-alt" : "fas fa-shopping-cart"}
            style={{ marginRight: "0.8rem" }}
          ></i>
          {isInCart ? "Mettre à jour le panier" : "Ajouter au panier"}
        </>
      )}
    </button>
  );
};

export default AddToCartButton;
