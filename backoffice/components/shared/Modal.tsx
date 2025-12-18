import React from "react";
import styles from "../../styles/components/Modal.module.css";

/**
 * Props du composant Modal
 */
interface ModalProps {
  /** Indique si la modal est ouverte */
  isOpen: boolean;
  /** Titre de la modal (affiché dans le header) */
  title: string;
  /** Contenu de la modal */
  children: React.ReactNode;
  /** Actions du header (boutons à droite du titre) */
  headerActions?: React.ReactNode;
  /** Actions du footer (boutons en bas) */
  footerActions?: React.ReactNode;
  /** Callback appelé lors de la fermeture */
  onClose: () => void;
  /** Afficher le bouton de fermeture dans le header (défaut: true) */
  showCloseButton?: boolean;
  /** Classe CSS personnalisée pour le conteneur */
  className?: string;
  /** Largeur maximale de la modal */
  maxWidth?: string;
}

/**
 * Composant Modal réutilisable
 * Affiche une modal avec overlay, header, body scrollable et footer optionnel
 *
 * @example
 * <Modal
 *   isOpen={isOpen}
 *   title="Titre de la modal"
 *   onClose={handleClose}
 *   headerActions={<Button>Action</Button>}
 *   footerActions={<Button>Valider</Button>}
 * >
 *   <p>Contenu de la modal</p>
 * </Modal>
 */
const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  children,
  headerActions,
  footerActions,
  onClose,
  showCloseButton = true,
  className = "",
  maxWidth,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`${styles.container} ${className}`}
        style={maxWidth ? { maxWidth } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <div className={styles.headerActions}>
            {headerActions}
            {showCloseButton && (
              <button
                onClick={onClose}
                className={styles.closeButton}
                aria-label="Fermer"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className={styles.content}>{children}</div>

        {/* Footer (optionnel) */}
        {footerActions && <div className={styles.footer}>{footerActions}</div>}
      </div>
    </div>
  );
};

export default Modal;
