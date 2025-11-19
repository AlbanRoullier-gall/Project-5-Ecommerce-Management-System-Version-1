import React from "react";
import { ProductPublicDTO } from "../../dto";
import { useCart } from "../../contexts/CartContext";

/**
 * Props du composant AddToCartButton
 */
interface AddToCartButtonProps {
  /** Produit à ajouter au panier */
  product: ProductPublicDTO;
  /** Quantité à ajouter/mettre à jour */
  quantity: number;
}

/**
 * Composant bouton d'ajout au panier
 * Utilise directement le contexte du panier pour gérer l'ajout et la mise à jour
 *
 * @example
 * <AddToCartButton product={product} quantity={2} />
 */
const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  quantity,
}) => {
  const { cart, addToCart, updateQuantity, isLoading } = useCart();

  /**
   * Vérifie si le produit est déjà dans le panier
   */
  const cartItem = cart?.items?.find((item) => item.productId === product.id);
  const isInCart = !!cartItem;

  /**
   * Calcule le prix TTC du produit
   */
  const priceWithVat = product.price * (1 + product.vatRate / 100);

  /**
   * Gère le clic sur le bouton
   * Ajoute le produit au panier ou met à jour la quantité selon la situation
   */
  const handleClick = async () => {
    try {
      if (isInCart) {
        // Le produit est déjà dans le panier, on met à jour la quantité
        await updateQuantity(product.id, quantity);
      } else {
        // Le produit n'est pas dans le panier, on l'ajoute
        await addToCart(
          product.id,
          quantity,
          priceWithVat,
          product.vatRate,
          product.name
        );
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout/mise à jour du panier:", error);
    }
  };

  /**
   * Le bouton est désactivé pendant le chargement
   */
  const disabled = isLoading;

  return (
    <button
      className="add-to-cart-button"
      onClick={handleClick}
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
