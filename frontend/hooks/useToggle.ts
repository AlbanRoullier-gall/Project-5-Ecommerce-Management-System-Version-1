import { useState, useCallback } from "react";

interface UseToggleResult {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/**
 * Hook réutilisable pour gérer l'état toggle (ouvert/fermé)
 * Utile pour les dropdowns, modals, menus, etc.
 *
 * @param initialValue - Valeur initiale (par défaut: false)
 * @returns Objet contenant l'état et les fonctions de contrôle
 *
 * @example
 * const { isOpen, toggle, close } = useToggle();
 * <button onClick={toggle}>Toggle</button>
 * {isOpen && <Dropdown onClose={close} />}
 *
 * @example
 * const { isOpen, open, close } = useToggle(true); // Commence ouvert
 * <button onClick={open}>Ouvrir</button>
 * <button onClick={close}>Fermer</button>
 */
export function useToggle(initialValue: boolean = false): UseToggleResult {
  const [isOpen, setIsOpen] = useState(initialValue);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}
