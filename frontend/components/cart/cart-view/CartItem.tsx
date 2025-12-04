import React from "react";
import { CartItemPublicDTO } from "../../../contexts/CartContext";
import { ItemDisplay } from "../../shared";
import { useCartItem } from "../../../hooks";

interface CartItemProps {
  item: CartItemPublicDTO;
}

/**
 * Composant de présentation pur pour afficher un article du panier
 * Utilise le composant générique ItemDisplay
 * Permet de modifier la quantité ou supprimer l'article
 */
const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { quantity, isUpdating, handleQuantityChange, handleRemove } =
    useCartItem(item);

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
