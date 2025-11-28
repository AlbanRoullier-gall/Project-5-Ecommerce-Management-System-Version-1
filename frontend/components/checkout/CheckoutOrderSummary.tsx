/**
 * Composant récapitulatif de commande et paiement
 *
 * Ce composant représente la dernière étape du processus de checkout.
 * Il affiche :
 * - Un récapitulatif des informations client
 * - Les adresses de livraison et de facturation
 * - Le détail des produits commandés avec leurs prix
 * - Le calcul des totaux (HT, TVA, TTC)
 *
 * Lors du clic sur "Procéder au paiement", le composant :
 * - Appelle la fonction `completeOrder` du contexte CheckoutContext
 *   qui gère toute la logique métier (création du client, sauvegarde
 *   des adresses, création de la session Stripe)
 * - Redirige l'utilisateur vers la page de paiement Stripe si succès
 * - Affiche les erreurs éventuelles à l'utilisateur
 */

import { useState } from "react";
import { useRouter } from "next/router";
import { useCart, CartItemPublicDTO } from "../../contexts/CartContext";
import { useCheckout } from "../../contexts/CheckoutContext";
import { FormHeader, Alert, SummaryRow, ItemDisplay } from "../shared";

/**
 * Composant récapitulatif de commande et paiement
 * Utilise CheckoutContext et CartContext pour gérer l'état
 */
export default function CheckoutOrderSummary() {
  const router = useRouter();

  // Consolider les appels de hooks - une seule fois chacun
  const { cart, totals } = useCart();
  const { customerData, addressData, completeOrder } = useCheckout();

  // Les items du cart
  const cartItems = (cart?.items || []) as CartItemPublicDTO[];

  // Utiliser les adresses depuis le contexte
  const shippingAddress = addressData.shipping;
  const billingAddress = addressData.useSameBillingAddress
    ? addressData.shipping
    : addressData.billing;

  // État local du composant
  const [isProcessing, setIsProcessing] = useState(false); // Indicateur de traitement en cours
  const [error, setError] = useState<string | null>(null); // Message d'erreur éventuel

  /**
   * Fonction pour finaliser la commande
   * Utilise la fonction du contexte CheckoutContext
   */
  const handleCompleteOrder = async () => {
    setIsProcessing(true);
    setError(null);

    const result = await completeOrder(cart);

    if (result.success && result.paymentUrl) {
      // Rediriger vers la page de paiement Stripe
      window.location.href = result.paymentUrl;
    } else {
      // Afficher l'erreur
      setError(result.error || "Une erreur est survenue");
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="checkout-form-container"
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "3rem",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      {/* En-tête du formulaire avec numéro d'étape */}
      <FormHeader stepNumber={3} title="Récapitulatif et paiement" />

      {/* Affichage des erreurs éventuelles */}
      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      {/* Grille principale : informations client à gauche, commande à droite */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "3rem",
          alignItems: "stretch",
        }}
      >
        {/* Colonne gauche : Informations client et adresses */}
        <div
          style={{
            gridColumn: 1,
            background: "white",
            borderRadius: "16px",
            padding: "2rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Section informations client */}
          <div style={{ marginBottom: "2.5rem" }}>
            <h3
              style={{
                fontSize: "1.6rem",
                fontWeight: "600",
                color: "#13686a",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.8rem",
              }}
            >
              <i className="fas fa-user"></i>
              Informations client
            </h3>
            <div
              style={{
                padding: "1.5rem",
                background: "#f8f9fa",
                borderRadius: "8px",
                fontSize: "1.3rem",
              }}
            >
              <p style={{ marginBottom: "0.5rem" }}>
                <strong>
                  {customerData.firstName} {customerData.lastName}
                </strong>
              </p>
              <p style={{ marginBottom: "0.5rem", color: "#666" }}>
                <i
                  className="fas fa-envelope"
                  style={{ marginRight: "0.5rem" }}
                ></i>
                {customerData.email}
              </p>
              {customerData.phoneNumber && (
                <p style={{ color: "#666" }}>
                  <i
                    className="fas fa-phone"
                    style={{ marginRight: "0.5rem" }}
                  ></i>
                  {customerData.phoneNumber}
                </p>
              )}
            </div>
          </div>

          {/* Section adresse de livraison */}
          <div style={{ marginBottom: "2.5rem" }}>
            <h3
              style={{
                fontSize: "1.6rem",
                fontWeight: "600",
                color: "#13686a",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.8rem",
              }}
            >
              <i className="fas fa-truck"></i>
              Adresse de livraison
            </h3>
            <div
              style={{
                padding: "1.5rem",
                background: "#f8f9fa",
                borderRadius: "8px",
                fontSize: "1.3rem",
                color: "#666",
              }}
            >
              <p>{shippingAddress.address}</p>
              <p>
                {shippingAddress.postalCode} {shippingAddress.city}
              </p>
              <p>{shippingAddress.countryName}</p>
            </div>
          </div>

          {/* Section adresse de facturation (affichée uniquement si différente de l'adresse de livraison) */}
          {!addressData.useSameBillingAddress &&
            billingAddress.address !== shippingAddress.address && (
              <div style={{ marginBottom: "2.5rem" }}>
                <h3
                  style={{
                    fontSize: "1.6rem",
                    fontWeight: "600",
                    color: "#13686a",
                    marginBottom: "1.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.8rem",
                  }}
                >
                  <i className="fas fa-file-invoice"></i>
                  Adresse de facturation
                </h3>
                <div
                  style={{
                    padding: "1.5rem",
                    background: "#f8f9fa",
                    borderRadius: "8px",
                    fontSize: "1.3rem",
                    color: "#666",
                  }}
                >
                  <p>{billingAddress.address}</p>
                  <p>
                    {billingAddress.postalCode} {billingAddress.city}
                  </p>
                  <p>{billingAddress.countryName}</p>
                </div>
              </div>
            )}
        </div>

        {/* Colonne droite : Détail de la commande et totaux */}
        <div
          style={{
            gridColumn: 2,
            background: "white",
            borderRadius: "16px",
            padding: "2rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <h3
            style={{
              fontSize: "1.6rem",
              fontWeight: "600",
              color: "#13686a",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.8rem",
            }}
          >
            <i className="fas fa-shopping-cart"></i>
            Votre commande
          </h3>

          {/* Liste des produits commandés - Utilise ItemDisplay */}
          <div style={{ marginBottom: "2rem" }}>
            {cartItems.map((item, index) => (
              <ItemDisplay
                key={index}
                item={item}
                variant="checkout"
                showImage={true}
                showDescription={false}
                showQuantityControls={false}
                showRemoveButton={false}
              />
            ))}
          </div>

          {/* Section des totaux */}
          <div
            style={{
              padding: "2rem",
              background: "#f8f9fa",
              borderRadius: "12px",
              border: "2px solid #e0e0e0",
            }}
          >
            {/* Total HT */}
            <SummaryRow
              label="Total HT"
              value={totals.totalHT}
              formatValue={(val) => `${Number(val).toFixed(2)} €`}
            />

            {/* Détail de la TVA par taux */}
            {totals.breakdown.map((b) => (
              <div
                key={b.rate}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.4rem 0",
                  fontSize: "1.4rem",
                  color: "#777",
                }}
              >
                <span>TVA ({b.rate}%)</span>
                <span>{b.amount.toFixed(2)} €</span>
              </div>
            ))}

            {/* Total TVA (cumul de tous les taux) */}
            <SummaryRow
              label="Total TVA"
              value={totals.vatAmount}
              formatValue={(val) => `${Number(val).toFixed(2)} €`}
            />

            {/* Total TTC (montant final à payer) */}
            <SummaryRow
              label="Total TTC"
              value={cart?.total || 0}
              variant="total"
              formatValue={(val) => `${Number(val).toFixed(2)} €`}
            />
          </div>
        </div>
      </div>

      {/* Section d'information sur le paiement sécurisé */}
      <div
        style={{
          marginTop: "3rem",
          padding: "2rem",
          background: "#f0f9ff",
          borderRadius: "12px",
          border: "2px solid #bfdbfe",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "1rem",
          }}
        >
          <i
            className="fas fa-lock"
            style={{ color: "#13686a", fontSize: "1.8rem" }}
          ></i>
          <h3 style={{ fontSize: "1.6rem", fontWeight: "600", color: "#333" }}>
            Paiement sécurisé
          </h3>
        </div>
        <p style={{ fontSize: "1.3rem", color: "#666", lineHeight: "1.6" }}>
          Vous allez être redirigé vers notre plateforme de paiement sécurisée
          Stripe pour finaliser votre commande. Toutes les informations
          bancaires sont cryptées et sécurisées.
        </p>
      </div>

      {/* Boutons de navigation */}
      <div
        className="checkout-form-actions"
        style={{
          display: "flex",
          gap: "1.5rem",
          justifyContent: "space-between",
          paddingTop: "2rem",
          marginTop: "2rem",
          borderTop: "2px solid #e0e0e0",
        }}
      >
        {/* Bouton retour */}
        <button
          type="button"
          onClick={() => router.push("/checkout/address")}
          disabled={isProcessing}
          style={{
            padding: "1.2rem 3rem",
            fontSize: "1.4rem",
            fontWeight: "600",
            border: "2px solid #ddd",
            background: "white",
            color: "#666",
            borderRadius: "8px",
            cursor: isProcessing ? "not-allowed" : "pointer",
            opacity: isProcessing ? 0.5 : 1,
            transition: "all 0.3s ease",
          }}
          onMouseOver={(e) => {
            if (!isProcessing) {
              e.currentTarget.style.borderColor = "#13686a";
              e.currentTarget.style.color = "#13686a";
            }
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = "#ddd";
            e.currentTarget.style.color = "#666";
          }}
        >
          <i
            className="fas fa-arrow-left"
            style={{ marginRight: "0.8rem" }}
          ></i>
          Retour
        </button>
        {/* Bouton procéder au paiement */}
        <button
          type="button"
          onClick={handleCompleteOrder}
          disabled={isProcessing}
          style={{
            padding: "1.5rem 4rem",
            fontSize: "1.6rem",
            fontWeight: "700",
            border: "none",
            background: isProcessing
              ? "#ccc"
              : "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
            color: "white",
            borderRadius: "12px",
            cursor: isProcessing ? "not-allowed" : "pointer",
            transition: "transform 0.2s ease",
            boxShadow: "0 4px 12px rgba(19, 104, 106, 0.3)",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
          onMouseOver={(e) => {
            if (!isProcessing) {
              e.currentTarget.style.transform = "translateY(-2px)";
            }
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          {isProcessing ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Traitement en cours...
            </>
          ) : (
            <>
              <i className="fas fa-credit-card"></i>
              Procéder au paiement
            </>
          )}
        </button>
      </div>

      {/* Styles CSS pour le responsive design */}
      <style jsx>{`
        /* Responsive Design pour CheckoutOrderSummary */

        /* Tablette */
        @media (max-width: 1024px) {
          .checkout-form-container {
            padding: 2.5rem !important;
          }

          .checkout-form-title {
            font-size: 2rem !important;
          }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .checkout-form-container {
            padding: 2rem !important;
            margin: 0 1rem !important;
          }

          .checkout-form-header {
            flex-direction: column !important;
            text-align: center !important;
            gap: 1rem !important;
            margin-bottom: 2rem !important;
          }

          .checkout-form-title {
            font-size: 1.8rem !important;
            line-height: 1.3 !important;
          }

          .checkout-form-actions {
            flex-direction: column !important;
            gap: 1rem !important;
            align-items: stretch !important;
          }

          .checkout-form-actions button {
            width: 100% !important;
            padding: 1rem 2rem !important;
            font-size: 1.3rem !important;
            justify-content: center !important;
          }

          /* Grilles responsives */
          div[style*="display: grid"][style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }

          /* Cartes d'information */
          div[style*="background: #f0f9ff"] {
            padding: 1.5rem !important;
            margin-top: 2rem !important;
          }

          div[style*="background: #f0f9ff"] h3 {
            font-size: 1.4rem !important;
          }

          div[style*="background: #f0f9ff"] p {
            font-size: 1.2rem !important;
          }
        }

        /* iPhone - Design complètement revu */
        @media (max-width: 480px) {
          .checkout-form-container {
            padding: 0.8rem !important;
            margin: 0 0.2rem !important;
            border-radius: 8px !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
          }

          .checkout-form-header {
            margin-bottom: 0.8rem !important;
            text-align: center !important;
          }

          .checkout-form-title {
            font-size: 1.6rem !important;
            line-height: 1.3 !important;
          }

          .checkout-form-actions {
            padding-top: 0.8rem !important;
            margin-top: 0.8rem !important;
          }

          .checkout-form-actions button {
            padding: 0.6rem 1rem !important;
            font-size: 1rem !important;
            border-radius: 6px !important;
            width: 100% !important;
          }

          /* Récapitulatif - Design en cartes */
          div[style*="marginBottom: 3rem"] {
            margin-bottom: 1rem !important;
          }

          h3[style*="fontSize: 1.8rem"] {
            font-size: 1.1rem !important;
            margin-bottom: 0.8rem !important;
            text-align: center !important;
            color: #13686a !important;
            border-bottom: 2px solid #e0e0e0 !important;
            padding-bottom: 0.5rem !important;
          }

          /* Informations client - Design en carte */
          div[style*="display: grid"][style*="grid-template-columns: 1fr 1fr"] {
            display: block !important;
            background: #f8f9fa !important;
            padding: 0.8rem !important;
            border-radius: 6px !important;
            margin-bottom: 0.8rem !important;
            border-left: 4px solid #13686a !important;
          }

          /* Texte des informations */
          p[style*="fontSize: 1.3rem"] {
            font-size: 0.85rem !important;
            line-height: 1.3 !important;
            margin: 0.2rem 0 !important;
            color: #333 !important;
          }

          /* Totaux - Design en carte */
          div[style*="background: #f0f9ff"] {
            background: #f8f9fa !important;
            padding: 0.8rem !important;
            margin-top: 0.8rem !important;
            border-radius: 6px !important;
            border: 1px solid #e0e0e0 !important;
          }

          div[style*="background: #f0f9ff"] h3 {
            font-size: 0.9rem !important;
            margin-bottom: 0.4rem !important;
            color: #13686a !important;
            text-align: center !important;
          }

          div[style*="background: #f0f9ff"] p {
            font-size: 0.8rem !important;
            line-height: 1.2 !important;
            margin: 0.2rem 0 !important;
            text-align: center !important;
          }

          /* Grilles de totaux */
          div[style*="display: grid"][style*="grid-template-columns: 1fr 1fr"] {
            display: block !important;
            text-align: center !important;
          }

          div[style*="display: grid"][style*="grid-template-columns: 1fr 1fr"]
            > div {
            margin: 0.3rem 0 !important;
            padding: 0.3rem !important;
            background: white !important;
            border-radius: 4px !important;
            border: 1px solid #e0e0e0 !important;
          }

          /* Total final */
          div[style*="fontSize: 1.8rem"] {
            font-size: 1.2rem !important;
            font-weight: 700 !important;
            color: #13686a !important;
            text-align: center !important;
            margin: 0.5rem 0 !important;
            padding: 0.5rem !important;
            background: linear-gradient(
              135deg,
              #13686a 0%,
              #0dd3d1 100%
            ) !important;
            color: white !important;
            border-radius: 6px !important;
          }
        }

        /* Très petits écrans */
        @media (max-width: 360px) {
          .checkout-form-container {
            padding: 1rem !important;
            margin: 0 0.3rem !important;
          }

          .checkout-form-title {
            font-size: 1.4rem !important;
          }

          .checkout-form-actions button {
            padding: 0.7rem 1.2rem !important;
            font-size: 1.1rem !important;
          }

          div[style*="background: #f0f9ff"] {
            padding: 1rem !important;
          }

          div[style*="background: #f0f9ff"] h3 {
            font-size: 1.1rem !important;
          }

          div[style*="background: #f0f9ff"] p {
            font-size: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}
