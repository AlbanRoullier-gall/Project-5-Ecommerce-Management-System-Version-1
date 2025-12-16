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

import { CartItemPublicDTO } from "../../../contexts/CartContext";
import { FormHeader, Alert, SummaryRow, ItemDisplay } from "../../shared";
import { useCheckoutOrderSummary } from "../../../hooks";

/**
 * Composant récapitulatif de commande et paiement
 * Utilise CheckoutContext et CartContext pour gérer l'état
 */
/**
 * Composant de présentation pur pour le récapitulatif de commande
 */
export default function CheckoutOrderSummary() {
  const {
    cart,
    totals,
    customerData,
    addressData,
    shippingAddress,
    billingAddress,
    isProcessing,
    error,
    handleCompleteOrder,
    handleBack,
    clearError,
  } = useCheckoutOrderSummary();

  // Les items du cart
  const cartItems = (cart?.items || []) as CartItemPublicDTO[];

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
      {error && <Alert type="error" message={error} onClose={clearError} />}

      {/* Grille principale : informations client à gauche, commande à droite */}
      <div
        className="checkout-summary-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "3rem",
          alignItems: "stretch",
        }}
      >
        {/* Colonne gauche : Informations client et adresses */}
        <div
          className="checkout-customer-info"
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
          <div
            className="checkout-info-section"
            style={{ marginBottom: "2.5rem" }}
          >
            <h3
              className="checkout-section-title"
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
              className="checkout-info-box"
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
          <div
            className="checkout-info-section"
            style={{ marginBottom: "2.5rem" }}
          >
            <h3
              className="checkout-section-title"
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
              className="checkout-info-box"
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
              <div
                className="checkout-info-section"
                style={{ marginBottom: "2.5rem" }}
              >
                <h3
                  className="checkout-section-title"
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
                  className="checkout-info-box"
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
          className="checkout-order-details"
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
            className="checkout-section-title"
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
          <div className="checkout-items-list" style={{ marginBottom: "2rem" }}>
            {cartItems.map((item, index) => (
              <ItemDisplay
                key={index}
                item={item}
                showImage={true}
                showDescription={false}
                showQuantityControls={false}
                showRemoveButton={false}
              />
            ))}
          </div>

          {/* Section des totaux */}
          <div
            className="checkout-totals-box"
            style={{
              padding: "2rem",
              background: "#f8f9fa",
              borderRadius: "12px",
              border: "2px solid #e0e0e0",
            }}
          >
            {/* Total HT */}
            <SummaryRow label="Total HT" value={totals.totalHT} />

            {/* Détail de la TVA par taux */}
            {totals.breakdown.map((b) => (
              <div
                key={b.rate}
                className="checkout-vat-breakdown"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.4rem 0",
                  fontSize: "1.4rem",
                  color: "#777",
                }}
              >
                <span>TVA ({b.rate}%)</span>
                <span>{Number(b.amount).toFixed(2)} €</span>
              </div>
            ))}

            {/* Total TVA (cumul de tous les taux) */}
            <SummaryRow label="Total TVA" value={totals.vatAmount} />

            {/* Total TTC (montant final à payer) */}
            <SummaryRow
              label="Total TTC"
              value={totals.totalTTC}
              variant="total"
            />
          </div>
        </div>
      </div>

      {/* Section d'information sur le paiement sécurisé */}
      <div
        className="checkout-payment-info"
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
          onClick={handleBack}
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
            padding: 2rem !important;
          }

          .checkout-summary-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }

          .checkout-customer-info {
            grid-column: 1 !important;
          }

          .checkout-order-details {
            grid-column: 1 !important;
          }

          .checkout-section-title {
            font-size: 1.4rem !important;
          }

          .checkout-info-box {
            font-size: 1.2rem !important;
            padding: 1.2rem !important;
          }

          .checkout-totals-box {
            padding: 1.5rem !important;
          }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .checkout-form-container {
            padding: 1.5rem !important;
            margin: 0 0.5rem !important;
          }

          .checkout-summary-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }

          .checkout-customer-info {
            grid-column: 1 !important;
            padding: 1.5rem !important;
            border-radius: 12px !important;
          }

          .checkout-order-details {
            grid-column: 1 !important;
            padding: 1.5rem !important;
            border-radius: 12px !important;
          }

          .checkout-info-section {
            margin-bottom: 1.5rem !important;
          }

          .checkout-section-title {
            font-size: 1.3rem !important;
            margin-bottom: 1rem !important;
          }

          .checkout-info-box {
            font-size: 1.1rem !important;
            padding: 1rem !important;
          }

          .checkout-items-list {
            margin-bottom: 1.5rem !important;
          }

          .checkout-totals-box {
            padding: 1.5rem !important;
            border-radius: 10px !important;
          }

          .checkout-vat-breakdown {
            font-size: 1.2rem !important;
            padding: 0.3rem 0 !important;
          }

          .checkout-payment-info {
            padding: 1.5rem !important;
            margin-top: 2rem !important;
            border-radius: 10px !important;
          }

          .checkout-payment-info h3 {
            font-size: 1.3rem !important;
          }

          .checkout-payment-info p {
            font-size: 1.1rem !important;
          }

          .checkout-form-actions {
            flex-direction: column !important;
            gap: 1rem !important;
            align-items: stretch !important;
            padding-top: 1.5rem !important;
            margin-top: 1.5rem !important;
          }

          .checkout-form-actions button {
            width: 100% !important;
            padding: 1rem 2rem !important;
            font-size: 1.2rem !important;
            justify-content: center !important;
          }
        }

        /* iPhone */
        @media (max-width: 480px) {
          .checkout-form-container {
            padding: 1rem !important;
            margin: 0 0.3rem !important;
            border-radius: 12px !important;
          }

          .checkout-summary-grid {
            gap: 1.2rem !important;
          }

          .checkout-customer-info {
            padding: 1.2rem !important;
            border-radius: 10px !important;
          }

          .checkout-order-details {
            padding: 1.2rem !important;
            border-radius: 10px !important;
          }

          .checkout-info-section {
            margin-bottom: 1.2rem !important;
          }

          .checkout-section-title {
            font-size: 1.2rem !important;
            margin-bottom: 0.8rem !important;
            flex-wrap: wrap !important;
          }

          .checkout-info-box {
            font-size: 1rem !important;
            padding: 0.9rem !important;
            border-radius: 6px !important;
          }

          .checkout-info-box p {
            font-size: 1rem !important;
            line-height: 1.4 !important;
            margin: 0.3rem 0 !important;
          }

          .checkout-items-list {
            margin-bottom: 1.2rem !important;
          }

          .checkout-totals-box {
            padding: 1.2rem !important;
            border-radius: 8px !important;
          }

          .checkout-vat-breakdown {
            font-size: 1.1rem !important;
            padding: 0.3rem 0 !important;
          }

          .checkout-payment-info {
            padding: 1.2rem !important;
            margin-top: 1.5rem !important;
            border-radius: 8px !important;
          }

          .checkout-payment-info h3 {
            font-size: 1.2rem !important;
            margin-bottom: 0.8rem !important;
          }

          .checkout-payment-info p {
            font-size: 1rem !important;
            line-height: 1.5 !important;
          }

          .checkout-form-actions {
            padding-top: 1rem !important;
            margin-top: 1rem !important;
            border-top-width: 1px !important;
          }

          .checkout-form-actions button {
            padding: 0.9rem 1.5rem !important;
            font-size: 1.1rem !important;
            border-radius: 8px !important;
          }
        }

        /* Très petits écrans */
        @media (max-width: 360px) {
          .checkout-form-container {
            padding: 0.8rem !important;
            margin: 0 0.2rem !important;
          }

          .checkout-customer-info,
          .checkout-order-details {
            padding: 1rem !important;
          }

          .checkout-section-title {
            font-size: 1.1rem !important;
          }

          .checkout-info-box {
            font-size: 0.95rem !important;
            padding: 0.8rem !important;
          }

          .checkout-totals-box {
            padding: 1rem !important;
          }

          .checkout-vat-breakdown {
            font-size: 1rem !important;
            padding: 0.25rem 0 !important;
          }

          .checkout-payment-info {
            padding: 1rem !important;
          }

          .checkout-payment-info h3 {
            font-size: 1.1rem !important;
          }

          .checkout-payment-info p {
            font-size: 0.95rem !important;
          }

          .checkout-form-actions button {
            padding: 0.8rem 1.2rem !important;
            font-size: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}
