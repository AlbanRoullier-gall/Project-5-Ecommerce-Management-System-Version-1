"use client";

import React, { memo, useState, useCallback } from "react";
import Link from "next/link";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    price: number;
    images?: any[];
    primary_image?: any;
  };
  quantity: number;
  cartQuantity: number;
  isInCart: boolean;
  onQuantityChange: (productName: string, quantity: number) => void;
  onAddToCart: (productName: string) => void;
  onRemoveFromCart: (productName: string) => void;
}

/**
 * Composant ProductCard - Affiche un produit individuel
 * Composant réutilisable et isolé pour l'affichage des produits
 * Optimisé avec React.memo pour éviter les re-renders inutiles
 */
export const ProductCard: React.FC<ProductCardProps> = memo(
  ({
    product,
    quantity,
    cartQuantity,
    isInCart,
    onQuantityChange,
    onAddToCart,
    onRemoveFromCart,
  }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const price = parseFloat(product.price.toString());

    // Handlers optimisés avec useCallback
    const handleImageLoad = useCallback(() => {
      setImageLoaded(true);
    }, []);

    const handleImageError = useCallback(() => {
      setImageError(true);
      setImageLoaded(true);
    }, []);

    const handleQuantityChange = useCallback(
      (productName: string, newQuantity: number) => {
        onQuantityChange(productName, newQuantity);
      },
      [onQuantityChange]
    );

    const handleAddToCart = useCallback(() => {
      onAddToCart(product.name);
    }, [onAddToCart, product.name]);

    const handleRemoveFromCart = useCallback(() => {
      onRemoveFromCart(product.name);
    }, [onRemoveFromCart, product.name]);

    // Fonction pour obtenir l'URL de l'image
    const getImageUrl = () => {
      if (imageError) {
        return "/images/default-product.svg";
      }

      if (product.primary_image?.file_path) {
        return product.primary_image.file_path;
      }

      if (product.images && product.images.length > 0) {
        return product.images[0].file_path || "/images/default-product.svg";
      }

      return "/images/default-product.svg";
    };

    return (
      <div
        className="stone-description"
        style={{
          minWidth: "280px",
          flexShrink: 0,
          scrollSnapAlign: "start",
        }}
      >
        {/* Image du produit avec lien vers la description */}
        <Link
          href={`/product/${product.id}`}
          style={{ display: "block", textAlign: "center" }}
        >
          <div
            className="product-image-container"
            style={{ position: "relative", width: 300, height: 300 }}
          >
            {!imageLoaded && (
              <div
                className="image-placeholder"
                style={{
                  width: 300,
                  height: 300,
                  backgroundColor: "#f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#666",
                }}
              >
                Chargement...
              </div>
            )}
            <img
              src={getImageUrl()}
              alt={product.name}
              width={300}
              height={300}
              className="product-image"
              style={{
                objectFit: "cover",
                display: imageLoaded ? "block" : "none",
              }}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
          </div>
        </Link>

        {/* Informations du produit */}
        <div className="text-description">
          <h3>{product.name}</h3>
          <div className="price-container">
            <span className="price-eur">{price} €</span>
          </div>

          {/* Sélecteur de quantité */}
          <div className="quantity-selector">
            <label htmlFor={`quantity-${product.id}`}>Quantité:</label>
            <div className="quantity-controls">
              <button
                type="button"
                className="quantity-btn minus"
                onClick={() => handleQuantityChange(product.name, quantity - 1)}
                disabled={quantity <= 1}
              >
                -
              </button>
              <input
                type="number"
                id={`quantity-${product.id}`}
                className="quantity-input"
                value={quantity}
                onChange={(e) =>
                  handleQuantityChange(
                    product.name,
                    parseInt(e.target.value) || 1
                  )
                }
                min="1"
                max="99"
              />
              <button
                type="button"
                className="quantity-btn plus"
                onClick={() => handleQuantityChange(product.name, quantity + 1)}
                disabled={quantity >= 99}
              >
                +
              </button>
            </div>
          </div>

          {/* Actions du panier */}
          <div className="button-container">
            <div className="cart-actions">
              {isInCart && (
                <span className="in-cart-badge">
                  Dans le panier ({cartQuantity})
                </span>
              )}
              <div className="cart-buttons">
                <button className="add-to-cart-btn" onClick={handleAddToCart}>
                  {quantity === 1 ? "Ajouter" : `Ajouter ${quantity}`}
                </button>
                {isInCart && (
                  <button
                    className="remove-from-cart-btn"
                    onClick={handleRemoveFromCart}
                    disabled={cartQuantity === 0}
                  >
                    Retirer {Math.min(quantity, cartQuantity)}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ProductCard.displayName = "ProductCard";
