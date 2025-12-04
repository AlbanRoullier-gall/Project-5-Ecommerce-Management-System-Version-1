import { useState, useCallback } from "react";

interface UseHoverResult {
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  hoverProps: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  };
}

/**
 * Hook réutilisable pour gérer l'état hover d'un élément
 * Retourne l'état et les handlers, ainsi qu'un objet props pour faciliter l'utilisation
 *
 * @example
 * const { isHovered, hoverProps } = useHover();
 * <div {...hoverProps}>Content</div>
 *
 * @example
 * const { isHovered, onMouseEnter, onMouseLeave } = useHover();
 * <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>Content</div>
 */
export function useHover(): UseHoverResult {
  const [isHovered, setIsHovered] = useState(false);

  const onMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const onMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return {
    isHovered,
    onMouseEnter,
    onMouseLeave,
    hoverProps: {
      onMouseEnter,
      onMouseLeave,
    },
  };
}
