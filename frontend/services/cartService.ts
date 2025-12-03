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
    // Si 404, c'est normal (pas de panier)
    if (error.status === 404) {
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
): Promise<CartPublicDTO> {
  await apiClient.put(`/api/cart/items/${productId}`, updateData);

  // Recharger le panier pour avoir les totaux à jour
  const cart = await getCart();
  if (!cart) {
    throw new Error("Erreur lors de la mise à jour");
  }
  return cart;
}

/**
 * Supprime un article du panier
 */
export async function removeCartItem(productId: number): Promise<void> {
  await apiClient.delete(`/api/cart/items/${productId}`);

  // Le panier sera rechargé par le contexte si nécessaire
}

/**
 * Vide complètement le panier
 */
export async function clearCart(clearData: CartClearDTO): Promise<void> {
  await apiClient.delete("/api/cart", {
    body: clearData,
  });
}
