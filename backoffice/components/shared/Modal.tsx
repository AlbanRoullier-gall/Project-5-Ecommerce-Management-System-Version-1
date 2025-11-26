import React from "react";

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
  /** Largeur maximale de la modal (défaut: 800px) */
  maxWidth?: string;
  /** Afficher le bouton de fermeture dans le header (défaut: true) */
  showCloseButton?: boolean;
  /** Classe CSS personnalisée pour le conteneur */
  className?: string;
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
  maxWidth = "800px",
  showCloseButton = true,
  className = "",
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "0.5rem",
      }}
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        // Fermer si on clique sur l'overlay
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`modal-container ${className}`}
        style={{
          width: "100%",
          maxWidth: `min(98vw, ${maxWidth})`,
          maxHeight: "98vh",
          background: "white",
          borderRadius: 8,
          border: "2px solid rgba(19, 104, 106, 0.1)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="modal-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1rem",
            background: "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
            borderBottom: "1px solid #e5e7eb",
            flexWrap: "wrap",
            gap: "0.75rem",
            minHeight: "60px",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "1.35rem",
              color: "white",
              fontWeight: 700,
            }}
          >
            {title}
          </h3>
          <div
            className="modal-header-actions"
            style={{
              display: "flex",
              gap: "0.5rem",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {headerActions}
            {showCloseButton && (
              <button
                onClick={onClose}
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "none",
                  borderRadius: "6px",
                  color: "white",
                  padding: "0.5rem",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  transition: "background 0.2s ease",
                  minWidth: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                }}
                aria-label="Fermer"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div
          className="modal-content"
          style={{
            padding: "1rem",
            overflowY: "auto",
            flex: 1,
            minHeight: 0,
          }}
        >
          {children}
        </div>

        {/* Footer (optionnel) */}
        {footerActions && (
          <div
            className="modal-footer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "0.75rem",
              padding: "1rem",
              borderTop: "1px solid #e5e7eb",
              background: "#f9fafb",
              flexWrap: "wrap",
            }}
          >
            {footerActions}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
