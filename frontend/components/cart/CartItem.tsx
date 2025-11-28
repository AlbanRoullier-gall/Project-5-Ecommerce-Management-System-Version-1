import React, { useState } from "react";
import { useCart, CartItemPublicDTO } from "../../contexts/CartContext";
import { ItemDisplay } from "../shared";

interface CartItemProps {
  item: CartItemPublicDTO;
}

/**
 * Composant pour afficher un article du panier
 * Utilise le composant générique ItemDisplay
 * Permet de modifier la quantité ou supprimer l'article
 */
const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);
  const [quantity, setQuantity] = useState(item.quantity);

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
    setIsUpdating(true);
    try {
      await removeFromCart(item.productId);
    } catch (err) {
      console.error("Error removing item:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <ItemDisplay
      item={item}
      variant="cart"
      showImage={true}
      showDescription={false}
      showQuantityControls={true}
      showRemoveButton={true}
      onQuantityChange={handleQuantityChange}
      onRemove={handleRemove}
      isUpdating={isUpdating}
      currentQuantity={quantity}
    />
  );
};

export default CartItem;
