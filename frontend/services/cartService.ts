/**
 * Service pour le panier
 * Gère tous les appels API liés au panier
 */

import { apiClient } from "./apiClient";
import {
  CartPublicDTO,
  CartItemCreateDTO,
  CartItemUpdateDTO,
  CartClearDTO,
} from "../dto";

/**
 * Récupère le panier actuel
 */
export async function getCart(): Promise<CartPublicDTO | null> {
  try {
    const response = await apiClient.get<{ cart: CartPublicDTO }>("/api/cart");

    return response.cart || null;
  } catch (error: any) {
    // Si 404, c'est normal (pas de panier) - ne pas propager l'erreur
    if (error.status === 404) {
      return null;
    }
    // Pour les autres erreurs, vérifier si c'est un message "Panier non trouvé"
    // qui peut arriver même avec un statut différent
    if (error.message && error.message.includes("Panier non trouvé")) {
      return null;
    }
    throw error;
  }
}

/**
 * Ajoute un article au panier
 */
export async function addCartItem(
  itemData: CartItemCreateDTO
): Promise<CartPublicDTO> {
  const response = await apiClient.post<{ cart: CartPublicDTO }>(
    "/api/cart/items",
    itemData
  );

  // Retourner le panier mis à jour depuis la réponse, ou recharger si absent
  if (response.cart) {
    return response.cart;
  }

  // Si pas de panier dans la réponse, recharger
  const cart = await getCart();
  if (!cart) {
    throw new Error("Erreur lors de l'ajout au panier");
  }
  return cart;
}

/**
 * Met à jour la quantité d'un article du panier
 */
export async function updateCartItem(
  productId: number,
  updateData: CartItemUpdateDTO
): Promise<CartPublicDTO | null> {
  try {
    await apiClient.put(`/api/cart/items/${productId}`, updateData);

    // Recharger le panier pour avoir les totaux à jour
    // Attendre un peu pour laisser le temps au backend de persister
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    const cart = await getCart();
    if (!cart) {
      // Si le panier n'existe pas, retourner null (sera géré par le contexte)
      console.warn("Panier non trouvé après la mise à jour, peut-être qu'il a été supprimé");
      return null;
    }
    return cart;
  } catch (error: any) {
    // Si l'erreur contient "Panier non trouvé" ou 404, essayer de récupérer le panier
    if (error.status === 404 || (error.message && error.message.includes("Panier non trouvé"))) {
      // Attendre un peu avant de réessayer
      await new Promise((resolve) => setTimeout(resolve, 200));
      const cart = await getCart();
      if (cart) {
        return cart;
      }
      // Si toujours pas de panier, retourner null plutôt que lancer une erreur
      return null;
    }
    throw error;
  }
}

/**
 * Supprime un article du panier
 */
export async function removeCartItem(productId: number): Promise<void> {
  try {
  await apiClient.delete(`/api/cart/items/${productId}`);
  // Le panier sera rechargé par le contexte si nécessaire
  } catch (error: any) {
    // Si l'erreur contient "Panier non trouvé", c'est peut-être que le panier a expiré
    if (error.status === 404 || (error.message && error.message.includes("Panier non trouvé"))) {
      // Ne pas propager l'erreur, le contexte rechargera le panier
      console.warn("Panier non trouvé lors de la suppression, sera rechargé");
      return;
    }
    throw error;
  }
}

/**
 * Vide complètement le panier
 */
export async function clearCart(clearData: CartClearDTO): Promise<void> {
  await apiClient.delete("/api/cart", {
    body: clearData,
  });
}
