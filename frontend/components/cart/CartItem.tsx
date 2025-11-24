import React, { useState } from "react";
import { CartItemPublicDTO } from "../../dto";
import { useCart } from "../../contexts/CartContext";

/**
 * URL de l'API depuis les variables d'environnement
 */
const API_URL = (() => {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_API_URL n'est pas définie. Veuillez configurer cette variable d'environnement."
    );
  }
  return url;
})();

interface CartItemProps {
  item: CartItemPublicDTO;
}

/**
 * Composant pour afficher un article du panier
 * Permet de modifier la quantité ou supprimer l'article
 */
const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);
  const [quantity, setQuantity] = useState(item.quantity);

  // Utiliser directement item.product si disponible
  const product = item.product;

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
    if (!confirm("Voulez-vous vraiment supprimer cet article du panier ?")) {
      return;
    }

    setIsUpdating(true);
    try {
      await removeFromCart(item.productId);
    } catch (err) {
      console.error("Error removing item:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Image du produit
  const productImage = product?.images?.[0]
    ? `${API_URL}/${product.images[0].filePath}`
    : "/images/placeholder.svg";
  // Prix HTVA unitaire (utilise directement le champ calculé)
  const unitPriceHT = item.unitPriceHT;

  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "2.4rem",
        marginBottom: "2rem",
        boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
        border: "1px solid #eaeaea",
        minHeight: "180px",
        opacity: isUpdating ? 0.6 : 1,
        transition: "opacity 0.3s ease",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "150px 1fr auto",
          gridTemplateRows: "auto auto",
          columnGap: "2.4rem",
          rowGap: "1.6rem",
          alignItems: "center",
        }}
      >
        {/* Image */}
        <div
          style={{
            width: "150px",
            height: "150px",
            borderRadius: "12px",
            overflow: "hidden",
            background: "#ffffff",
            border: "1px solid #eee",
            gridRow: "1 / span 2",
          }}
        >
          <img
            src={productImage}
            alt={item.product?.name || "Produit"}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              backgroundColor: "#fff",
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/placeholder.svg";
            }}
          />
        </div>

        {/* Ligne 1: conteneur aligné (nom ↔ prix unitaire) */}
        <div
          style={{
            gridColumn: "2 / 4",
            gridRow: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1.2rem",
          }}
        >
          <h3
            style={{
              fontSize: "2rem",
              fontWeight: "600",
              margin: 0,
              color: "#333",
            }}
          >
            {item.product?.name || "Chargement..."}
          </h3>
          <div
            style={{
              textAlign: "right",
              whiteSpace: "nowrap",
            }}
          >
            <div
              style={{
                fontSize: "1.2rem",
                color: "#333",
                fontWeight: 600,
              }}
            >
              {unitPriceHT.toFixed(2)} € HTVA / unité
            </div>
            <div
              style={{
                fontSize: "1.1rem",
                color: "#7a7a7a",
                marginTop: "0.2rem",
              }}
            >
              TVA (Belgique) {item.vatRate}%
            </div>
          </div>
        </div>

        {/* Ligne 2: conteneur aligné (quantité ↔ Retirer) */}
        <div
          style={{
            gridColumn: "2 / 4",
            gridRow: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1.2rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={isUpdating || quantity <= 1}
              style={{
                width: "44px",
                height: "44px",
                border: "2px solid #13686a",
                background: "white",
                color: "#13686a",
                borderRadius: "10px",
                cursor: quantity <= 1 || isUpdating ? "not-allowed" : "pointer",
                fontSize: "1.5rem",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: quantity <= 1 || isUpdating ? 0.5 : 1,
                transition: "all 0.2s ease",
              }}
            >
              <i className="fas fa-minus"></i>
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1;
                handleQuantityChange(val);
              }}
              min="1"
              disabled={isUpdating}
              style={{
                width: "100px",
                height: "44px",
                textAlign: "center",
                border: "2px solid #ddd",
                fontSize: "1.4rem",
                borderRadius: "10px",
                fontWeight: "600",
              }}
            />
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={isUpdating}
              style={{
                width: "44px",
                height: "44px",
                border: "2px solid #13686a",
                background: isUpdating ? "#ccc" : "#13686a",
                color: "white",
                borderRadius: "10px",
                cursor: isUpdating ? "not-allowed" : "pointer",
                fontSize: "1.5rem",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
              }}
            >
              <i className="fas fa-plus"></i>
            </button>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "0.6rem",
            }}
          >
            <div
              style={{
                fontSize: "2.2rem",
                color: "#13686a",
                fontWeight: "700",
                whiteSpace: "nowrap",
              }}
            >
              {item.totalPriceTTC.toFixed(2)} €
            </div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "#94a3b8",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginTop: "-0.3rem",
              }}
            >
              TTC (Belgique)
            </div>
            <button
              onClick={handleRemove}
              disabled={isUpdating}
              style={{
                padding: "0.6rem 1.2rem",
                background: "#fff5f5",
                color: "#c33",
                border: "2px solid #f5b7b7",
                borderRadius: "8px",
                cursor: isUpdating ? "not-allowed" : "pointer",
                fontSize: "1.1rem",
                fontWeight: "600",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => {
                if (!isUpdating) {
                  e.currentTarget.style.background = "#c33";
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.borderColor = "#c33";
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "#fff5f5";
                e.currentTarget.style.color = "#c33";
                e.currentTarget.style.borderColor = "#f5b7b7";
              }}
              title="Supprimer"
            >
              <i className="fas fa-trash"></i> Retirer
            </button>
          </div>
        </div>

        {/* Total et action intégrés à la ligne 2 (à droite) */}
      </div>

      <style jsx>{`
        /* Responsive Design pour iPhone et mobiles */
        @media (max-width: 768px) {
          div[style*="display: grid"] {
            display: flex !important;
            flex-direction: column !important;
            gap: 1rem !important;
            align-items: center !important;
            padding: 1.2rem !important;
          }

          /* FORCER tous les éléments à être l'un en dessous de l'autre */
          div[style*="display: grid"] > * {
            width: 100% !important;
            max-width: 100% !important;
            flex: none !important;
          }

          div[style*="width: 150px"] {
            width: 100px !important;
            height: 100px !important;
            grid-column: unset !important;
            grid-row: unset !important;
            margin-bottom: 0.8rem !important;
            border-radius: 8px !important;
          }

          /* Nom du produit */
          h3[style*="font-size: 2rem"] {
            font-size: 1.2rem !important;
            margin-bottom: 0.8rem !important;
            text-align: center !important;
            line-height: 1.3 !important;
            font-weight: 600 !important;
            color: #2d3748 !important;
          }

          /* Section prix unitaire et TVA - DISPOSITION VERTICALE */
          div[style*="textAlign: right"] {
            text-align: center !important;
            white-space: normal !important;
            width: 100% !important;
            background: linear-gradient(
              135deg,
              #f7fafc 0%,
              #edf2f7 100%
            ) !important;
            padding: 1rem !important;
            border-radius: 12px !important;
            border: 1px solid #e2e8f0 !important;
            margin-bottom: 1rem !important;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: 0.4rem !important;
          }

          /* Prix unitaire HTVA - sur sa propre ligne */
          div[style*="fontSize: 1.2rem"][style*="color: #333"] {
            font-size: 1rem !important;
            margin-bottom: 0.4rem !important;
            color: #4a5568 !important;
            font-weight: 600 !important;
            text-align: center !important;
            display: block !important;
            width: 100% !important;
            order: 1 !important;
          }

          /* TVA - sur sa propre ligne */
          div[style*="fontSize: 1.1rem"][style*="color: #7a7a7a"] {
            font-size: 0.85rem !important;
            margin-bottom: 0.8rem !important;
            color: #718096 !important;
            text-align: center !important;
            display: block !important;
            font-weight: 500 !important;
            width: 100% !important;
            order: 2 !important;
          }

          /* Prix total TTC */
          div[style*="textAlign: right"]::after {
            content: "${item.totalPriceTTC.toFixed(2)} €";
            display: block !important;
            font-size: 1.4rem !important;
            color: #13686a !important;
            font-weight: 700 !important;
            margin-top: 0.6rem !important;
            padding-top: 0.6rem !important;
            border-top: 1px solid #cbd5e0 !important;
            text-align: center !important;
          }

          div[style*="textAlign: right"]::before {
            content: "TTC (BELGIQUE)";
            display: block !important;
            font-size: 0.75rem !important;
            color: #a0aec0 !important;
            font-weight: 500 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.05em !important;
            margin-bottom: 0.2rem !important;
            text-align: center !important;
          }

          /* Contrôles de quantité */
          div[style*="display: flex"][style*="alignItems: center"][style*="gap: 1rem"] {
            gap: 0.6rem !important;
            margin-bottom: 1rem !important;
            justify-content: center !important;
            margin-left: 0 !important;
            width: 100% !important;
          }

          button[style*="width: 44px"] {
            width: 36px !important;
            height: 36px !important;
            font-size: 1rem !important;
            padding: 0 !important;
            border-radius: 8px !important;
            border: 2px solid #13686a !important;
            background: white !important;
            color: #13686a !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            transition: all 0.2s ease !important;
          }

          button[style*="width: 44px"]:hover:not(:disabled) {
            background: #13686a !important;
            color: white !important;
            transform: scale(1.05) !important;
          }

          input[style*="width: 100px"] {
            width: 70px !important;
            height: 36px !important;
            font-size: 1rem !important;
            padding: 0 !important;
            text-align: center !important;
            border: 2px solid #e2e8f0 !important;
            border-radius: 8px !important;
            font-weight: 600 !important;
            background: white !important;
          }

          /* Bouton Retirer */
          button[style*="padding: 0.6rem 1.2rem"] {
            padding: 0.8rem 1.5rem !important;
            font-size: 0.9rem !important;
            width: 100% !important;
            text-align: center !important;
            margin-top: 0 !important;
            background: linear-gradient(
              135deg,
              #fed7d7 0%,
              #feb2b2 100%
            ) !important;
            color: #c53030 !important;
            border: 2px solid #feb2b2 !important;
            border-radius: 10px !important;
            font-weight: 600 !important;
            transition: all 0.2s ease !important;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
          }

          button[style*="padding: 0.6rem 1.2rem"]:hover:not(:disabled) {
            background: linear-gradient(
              135deg,
              #c53030 0%,
              #e53e3e 100%
            ) !important;
            color: white !important;
            border-color: #c53030 !important;
            transform: translateY(-1px) !important;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
          }

          /* FORCER disposition verticale complète sur iPhone */

          /* Ligne 1: Nom et prix unitaire - FORCER VERTICAL */
          div[style*="grid-column: 2 / 4"][style*="grid-row: 1"] {
            grid-column: unset !important;
            grid-row: unset !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 0.8rem !important;
            text-align: center !important;
            width: 100% !important;
            margin-bottom: 1rem !important;
            display: flex !important;
          }

          /* Ligne 2: Contrôles et prix total - FORCER VERTICAL */
          div[style*="grid-column: 2 / 4"][style*="grid-row: 2"] {
            grid-column: unset !important;
            grid-row: unset !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 1rem !important;
            width: 100% !important;
            display: flex !important;
          }

          /* FORCER tous les enfants à être en vertical */
          div[style*="grid-column: 2 / 4"][style*="grid-row: 1"] > *,
          div[style*="grid-column: 2 / 4"][style*="grid-row: 2"] > * {
            width: 100% !important;
            max-width: 100% !important;
            flex: none !important;
            display: block !important;
            margin: 0.5rem auto !important;
          }

          /* Disposition verticale pour le groupe de contrôles */
          div[style*="display: flex"][style*="alignItems: center"][style*="gap: 1rem"] {
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            width: 100% !important;
            margin: 0 auto !important;
            gap: 0.8rem !important;
          }

          /* Disposition VERTICALE pour la section prix total et bouton retirer */
          div[style*="flexDirection: column"][style*="alignItems: flex-end"] {
            align-items: center !important;
            text-align: center !important;
            width: 100% !important;
            justify-content: center !important;
            flex-direction: column !important;
            gap: 0.8rem !important;
          }

          /* Forcer chaque élément prix à être sur sa propre ligne */
          div[style*="flexDirection: column"][style*="alignItems: flex-end"]
            > div {
            display: block !important;
            margin: 0.2rem auto !important;
            text-align: center !important;
          }

          /* Forcer le bouton retirer à être sur sa propre ligne */
          div[style*="flexDirection: column"][style*="alignItems: flex-end"]
            > button {
            display: block !important;
            margin: 0.4rem auto !important;
            width: 100% !important;
            text-align: center !important;
          }

          /* Disposition VERTICALE pour les contrôles de quantité sur iPhone */
          div[style*="display: flex"][style*="alignItems: center"][style*="gap: 1rem"] {
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            width: 100% !important;
            margin: 0 auto !important;
            gap: 0.6rem !important;
          }

          /* Forcer chaque contrôle à être sur sa propre ligne */
          div[style*="display: flex"][style*="alignItems: center"][style*="gap: 1rem"]
            > button,
          div[style*="display: flex"][style*="alignItems: center"][style*="gap: 1rem"]
            > input {
            display: block !important;
            margin: 0.3rem auto !important;
            width: auto !important;
          }

          /* Bouton - - CENTRÉ */
          button[style*="width: 44px"] {
            margin: 0.3rem auto !important;
            display: block !important;
            order: 1 !important;
            align-self: center !important;
            justify-self: center !important;
          }

          /* Input quantité - CENTRÉ */
          input[style*="width: 100px"] {
            margin: 0.3rem auto !important;
            display: block !important;
            order: 2 !important;
            align-self: center !important;
            justify-self: center !important;
          }

          /* Bouton + - CENTRÉ */
          button[style*="width: 44px"]:last-of-type {
            margin: 0.3rem auto !important;
            display: block !important;
            order: 3 !important;
            align-self: center !important;
            justify-self: center !important;
          }

          /* Centrer le bouton retirer */
          button[style*="padding: 0.6rem 1.2rem"] {
            margin: 0 auto !important;
            display: block !important;
          }

          /* Prix total TTC - DISPOSITION VERTICALE */
          div[style*="fontSize: 2.2rem"][style*="color: #13686a"] {
            font-size: 1.4rem !important;
            text-align: center !important;
            margin: 0 auto 0.4rem auto !important;
            display: block !important;
            width: 100% !important;
            order: 1 !important;
          }

          /* Label TTC - sur sa propre ligne */
          div[style*="fontSize: 0.85rem"][style*="color: #94a3b8"] {
            font-size: 0.75rem !important;
            text-align: center !important;
            margin: 0 auto 0.8rem auto !important;
            display: block !important;
            width: 100% !important;
            order: 2 !important;
          }

          /* Nom du produit aligné à gauche sur iPhone */
          h3 {
            display: block !important;
            width: 100% !important;
            margin: 0.5rem 0 !important;
            text-align: left !important;
            align-self: flex-start !important;
          }

          /* FORCER les prix à être l'un en dessous de l'autre */
          div[style*="textAlign: right"] {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            width: 100% !important;
            margin: 0.5rem auto !important;
          }

          /* FORCER les contrôles de quantité à être verticaux et centrés */
          div[style*="display: flex"][style*="alignItems: center"][style*="gap: 1rem"] {
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
            margin: 0.5rem auto !important;
            align-items: center !important;
            justify-content: center !important;
          }

          /* Centrer spécifiquement les boutons +/- et input */
          div[style*="display: flex"][style*="alignItems: center"][style*="gap: 1rem"]
            > button,
          div[style*="display: flex"][style*="alignItems: center"][style*="gap: 1rem"]
            > input {
            margin: 0.3rem auto !important;
            display: block !important;
            align-self: center !important;
          }

          /* FORCER les prix total et bouton à être verticaux */
          div[style*="flexDirection: column"][style*="alignItems: flex-end"] {
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
            margin: 0.5rem auto !important;
            align-items: center !important;
          }

          /* S'assurer que tous les textes sont centrés sauf le nom du produit */
          * {
            text-align: center !important;
          }

          /* Exception pour le nom du produit - aligné à gauche */
          h3 {
            text-align: left !important;
          }

          /* Exception pour les inputs qui doivent rester centrés */
          input[type="number"] {
            text-align: center !important;
          }
        }

        /* Optimisation spécifique pour iPhone (écrans très petits) */
        @media (max-width: 480px) {
          div[style*="padding: 2.4rem"] {
            padding: 1rem !important;
            margin-bottom: 1rem !important;
            border-radius: 12px !important;
          }

          div[style*="width: 100px"] {
            width: 80px !important;
            height: 80px !important;
            margin-bottom: 0.6rem !important;
          }

          h3[style*="font-size: 1.2rem"] {
            font-size: 1rem !important;
            margin-bottom: 0.6rem !important;
            line-height: 1.2 !important;
          }

          div[style*="textAlign: center"] {
            padding: 0.8rem !important;
            margin-bottom: 0.8rem !important;
          }

          div[style*="fontSize: 1rem"][style*="color: #4a5568"] {
            font-size: 0.9rem !important;
            margin-bottom: 0.3rem !important;
          }

          div[style*="fontSize: 0.85rem"][style*="color: #718096"] {
            font-size: 0.75rem !important;
            margin-bottom: 0.6rem !important;
          }

          div[style*="textAlign: center"]::after {
            font-size: 1.2rem !important;
            padding-top: 0.4rem !important;
          }

          div[style*="textAlign: center"]::before {
            font-size: 0.7rem !important;
            margin-bottom: 0.2rem !important;
          }

          div[style*="gap: 0.6rem"] {
            gap: 0.4rem !important;
            margin-bottom: 0.8rem !important;
          }

          button[style*="width: 36px"] {
            width: 32px !important;
            height: 32px !important;
            font-size: 0.9rem !important;
          }

          input[style*="width: 70px"] {
            width: 60px !important;
            height: 32px !important;
            font-size: 0.9rem !important;
          }

          button[style*="padding: 0.8rem 1.5rem"] {
            padding: 0.7rem 1.2rem !important;
            font-size: 0.85rem !important;
          }
        }

        /* Optimisation pour iPhone en mode paysage */
        @media (max-width: 768px) and (orientation: landscape) {
          div[style*="display: flex"] {
            flex-direction: row !important;
            align-items: flex-start !important;
            gap: 1rem !important;
          }

          div[style*="width: 100px"] {
            width: 80px !important;
            height: 80px !important;
            flex-shrink: 0 !important;
            margin-bottom: 0 !important;
          }

          div[style*="flex-direction: column"] {
            flex: 1 !important;
            min-width: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CartItem;
