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
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "2rem",
        marginBottom: "2rem",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        opacity: isUpdating ? 0.6 : 1,
        transition: "opacity 0.3s ease",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "150px 1fr auto",
          gap: "2rem",
          alignItems: "center",
        }}
      >
        {/* Image */}
        <div
          style={{
            width: "150px",
            height: "150px",
            borderRadius: "12px",
            overflow: "hidden",
            background: "#ffffff",
          }}
        >
          <img
            src={productImage}
            alt={product?.name || "Produit"}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              backgroundColor: "#fff",
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/placeholder.svg";
            }}
          />
        </div>

        {/* Infos produit */}
        <div>
          <h3
            style={{
              fontSize: "1.8rem",
              fontWeight: "600",
              marginBottom: "0.8rem",
              color: "#333",
            }}
          >
            {product?.name || "Chargement..."}
          </h3>

          {/* Contrôles quantité */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={isUpdating || quantity <= 1}
              style={{
                width: "40px",
                height: "40px",
                border: "2px solid #13686a",
                background: "white",
                color: "#13686a",
                borderRadius: "8px",
                cursor: quantity <= 1 || isUpdating ? "not-allowed" : "pointer",
                fontSize: "1.5rem",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: quantity <= 1 || isUpdating ? 0.5 : 1,
                transition: "all 0.2s ease",
              }}
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
              style={{
                width: "80px",
                height: "40px",
                textAlign: "center",
                border: "2px solid #ddd",
                fontSize: "1.4rem",
                borderRadius: "8px",
                fontWeight: "600",
              }}
            />
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={isUpdating}
              style={{
                width: "40px",
                height: "40px",
                border: "2px solid #13686a",
                background: isUpdating ? "#ccc" : "#13686a",
                color: "white",
                borderRadius: "8px",
                cursor: isUpdating ? "not-allowed" : "pointer",
                fontSize: "1.5rem",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
              }}
            >
              <i className="fas fa-plus"></i>
            </button>
          </div>
        </div>

        {/* Prix et suppression */}
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: "1.3rem",
              color: "#666",
              marginBottom: "0.5rem",
            }}
          >
            {item.price.toFixed(2)} € / unité
          </div>
          <div
            style={{
              fontSize: "2.2rem",
              color: "#13686a",
              fontWeight: "700",
              marginBottom: "2rem",
            }}
          >
            {item.total.toFixed(2)} €
          </div>

          <button
            onClick={handleRemove}
            disabled={isUpdating}
            style={{
              padding: "0.8rem 1.5rem",
              background: "#fee",
              color: "#c33",
              border: "2px solid #fcc",
              borderRadius: "8px",
              cursor: isUpdating ? "not-allowed" : "pointer",
              fontSize: "1.2rem",
              fontWeight: "600",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              if (!isUpdating) {
                e.currentTarget.style.background = "#c33";
                e.currentTarget.style.color = "white";
                e.currentTarget.style.borderColor = "#c33";
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#fee";
              e.currentTarget.style.color = "#c33";
              e.currentTarget.style.borderColor = "#fcc";
            }}
            title="Supprimer"
          >
            <i className="fas fa-trash"></i> Retirer
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
