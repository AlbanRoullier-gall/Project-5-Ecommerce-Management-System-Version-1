import { useState } from "react";
import { useRouter } from "next/router";
import { useCart } from "../../contexts/CartContext";

// Configuration des Hero par route
const HERO_CONFIG: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: "NATURE DE PIERRE",
    subtitle: "Découvrez notre collection exclusive de pierres naturelles",
  },
  "/philosophy": {
    title: "NOTRE PHILOSOPHIE",
    subtitle: "Une vision artisanale, durable et respectueuse de la nature.",
  },
  "/contact": {
    title: "CONTACTEZ-NOUS",
    subtitle: "Notre équipe est à votre disposition pour tous vos projets",
  },
};

interface UseHeaderResult {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  toggleMenu: () => void;
  closeMenu: () => void;
  itemCount: number;
  heroConfig: { title: string; subtitle: string } | undefined;
}

/**
 * Hook pour gérer la logique du Header
 * Encapsule l'état du menu mobile, le panier et la configuration Hero
 */
export function useHeader(): UseHeaderResult {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const router = useRouter();

  const heroConfig = HERO_CONFIG[router.pathname];

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return {
    isMenuOpen,
    setIsMenuOpen,
    toggleMenu,
    closeMenu,
    itemCount,
    heroConfig,
  };
}
