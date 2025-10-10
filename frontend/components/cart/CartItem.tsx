import React, { useState } from "react";
import { CartItemPublicDTO, ProductPublicDTO } from "../../dto";
import { useCart } from "../../contexts/CartContext";

/**
 * URL de l'API depuis les variables d'environnement
 */
const API_URL = (() => {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_API_URL n'est pas définie. Veuillez configurer cette variable d'environnement."
    );
  }
  return url;
})();

interface CartItemProps {
  item: CartItemPublicDTO;
}

/**
 * Composant pour afficher un article du panier
 * Permet de modifier la quantité ou supprimer l'article
 */
const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const [product, setProduct] = useState<ProductPublicDTO | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [quantity, setQuantity] = useState(item.quantity);

  // Charger les informations du produit
  React.useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/products/${item.productId}`
        );
        if (response.ok) {
          const data = await response.json();
          // L'API peut retourner { product: {...} } ou directement le produit
          const productData = data.product || data;
          setProduct(productData);
        }
      } catch (err) {
        console.error("Error loading product:", err);
      }
    };

    loadProduct();
  }, [item.productId]);

  /**
   * Met à jour la quantité
   */
  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;

    setQuantity(newQuantity);
    setIsUpdating(true);

    try {
      await updateQuantity(item.productId, newQuantity);
    } catch (err) {
      // Restaurer l'ancienne quantité en cas d'erreur
      setQuantity(item.quantity);
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Supprime l'article du panier
   */
  const handleRemove = async () => {
    if (!confirm("Voulez-vous vraiment supprimer cet article du panier ?")) {
      return;
    }

    setIsUpdating(true);
    try {
      await removeFromCart(item.productId);
    } catch (err) {
      console.error("Error removing item:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Image du produit (utilise filePath comme dans ProductCard)
  const productImage = product?.images?.[0]
    ? `${API_URL}/${product.images[0].filePath}`
    : "/images/placeholder.svg";

  return (
    <div className={`cart-item ${isUpdating ? "updating" : ""}`}>
      <div className="cart-item-image">
        <img
          src={productImage}
          alt={product?.name || "Produit"}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/images/placeholder.svg";
          }}
        />
      </div>

      <div className="cart-item-details">
        <h3 className="cart-item-name">{product?.name || "Chargement..."}</h3>
        {product?.description && (
          <p className="cart-item-description">
            {product.description.substring(0, 100)}
            {product.description.length > 100 ? "..." : ""}
          </p>
        )}
      </div>

      <div className="cart-item-quantity">
        <button
          onClick={() => handleQuantityChange(quantity - 1)}
          disabled={isUpdating || quantity <= 1}
          className="quantity-btn"
        >
          <i className="fas fa-minus"></i>
        </button>
        <input
          type="number"
          value={quantity}
          onChange={(e) => {
            const val = parseInt(e.target.value) || 1;
            handleQuantityChange(val);
          }}
          min="1"
          disabled={isUpdating}
          className="quantity-input"
        />
        <button
          onClick={() => handleQuantityChange(quantity + 1)}
          disabled={isUpdating}
          className="quantity-btn"
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>

      <div className="cart-item-price">
        <span className="item-unit-price">{item.price.toFixed(2)} €</span>
        <span className="item-total-price">{item.total.toFixed(2)} €</span>
      </div>

      <button
        onClick={handleRemove}
        disabled={isUpdating}
        className="cart-item-remove"
        title="Supprimer"
      >
        <i className="fas fa-trash"></i>
      </button>
    </div>
  );
};

export default CartItem;
