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
  const {
    quantity,
    isLoading,
    handleIncrement,
    handleDecrement,
    handleRemove,
    stockError,
  } = useCartItem(item);

  return (
    <ItemDisplay
      item={item}
      showImage={true}
      showDescription={false}
      showQuantityControls={true}
      showRemoveButton={true}
      onIncrement={handleIncrement}
      onDecrement={handleDecrement}
      onRemove={handleRemove}
      isUpdating={isLoading}
      currentQuantity={quantity}
      stockError={stockError}
    />
  );
};

export default CartItem;
