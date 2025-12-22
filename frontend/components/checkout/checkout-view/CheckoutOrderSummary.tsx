import Link from "next/link";
import { CartItemPublicDTO } from "../../../contexts/CartContext";
import { FormHeader, Alert, SummaryRow, ItemDisplay } from "../../shared";
import { useCheckoutOrderSummary } from "../../../hooks";
import styles from "../../../styles/components/CheckoutOrderSummary.module.css";

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
    termsAccepted,
    setTermsAccepted,
    handleCompleteOrder,
    handleBack,
    clearError,
  } = useCheckoutOrderSummary();

  const cartItems = (cart?.items || []) as CartItemPublicDTO[];

  return (
    <div className={styles.formContainer}>
      <FormHeader stepNumber={3} title="Récapitulatif et paiement" />

      {error && <Alert type="error" message={error} onClose={clearError} />}

      <div className={styles.summaryGrid}>
        <div className={styles.card}>
          <div className={styles.infoSection}>
            <h3 className={styles.sectionTitle}>
              <i className="fas fa-user"></i>
              Informations client
            </h3>
            <div className={styles.infoBox}>
              <p className={styles.infoLine}>
                <strong>
                  {customerData.firstName} {customerData.lastName}
                </strong>
              </p>
              <p className={`${styles.infoLine} ${styles.infoMuted}`}>
                <i className={`fas fa-envelope ${styles.infoIcon}`}></i>
                {customerData.email}
              </p>
              {customerData.phoneNumber && (
                <p className={styles.infoMuted}>
                  <i className={`fas fa-phone ${styles.infoIcon}`}></i>
                  {customerData.phoneNumber}
                </p>
              )}
            </div>
          </div>

          <div className={styles.infoSection}>
            <h3 className={styles.sectionTitle}>
              <i className="fas fa-truck"></i>
              Adresse de livraison
            </h3>
            <div className={styles.infoBox}>
              <p className={styles.infoLine}>{shippingAddress.address}</p>
              <p className={styles.infoLine}>
                {shippingAddress.postalCode} {shippingAddress.city}
              </p>
              <p className={styles.infoLine}>{shippingAddress.countryName}</p>
            </div>
          </div>

          {!addressData.useSameBillingAddress &&
            billingAddress.address !== shippingAddress.address && (
              <div className={styles.infoSection}>
                <h3 className={styles.sectionTitle}>
                  <i className="fas fa-file-invoice"></i>
                  Adresse de facturation
                </h3>
                <div className={styles.infoBox}>
                  <p className={styles.infoLine}>{billingAddress.address}</p>
                  <p className={styles.infoLine}>
                    {billingAddress.postalCode} {billingAddress.city}
                  </p>
                  <p className={styles.infoLine}>
                    {billingAddress.countryName}
                  </p>
                </div>
              </div>
            )}
        </div>

        <div className={styles.orderDetails}>
          <h3 className={styles.sectionTitle}>
            <i className="fas fa-shopping-cart"></i>
            Votre commande
          </h3>

          <div className={styles.itemsList}>
            {cartItems.map((item, index) => (
              <ItemDisplay
                key={index}
                item={item}
                showImage
                showDescription={false}
                showQuantityControls={false}
                showRemoveButton={false}
              />
            ))}
          </div>

          <div className={styles.totalsBox}>
            <div className={styles.totalsTitle}>Totaux</div>
            <SummaryRow label="Total HT" value={totals.totalHT} />
            {totals.breakdown.map((b) => (
              <div key={b.rate} className={styles.vatBreakdown}>
                <span>TVA ({b.rate}%)</span>
                <span>{Number(b.amount).toFixed(2)} €</span>
              </div>
            ))}
            <SummaryRow label="Total TVA" value={totals.vatAmount} />
            <SummaryRow
              label="Total TTC"
              value={totals.totalTTC}
              variant="total"
            />
          </div>
        </div>
      </div>

      <div className={styles.paymentInfo}>
        <div className={styles.paymentRow}>
          <i className={`fas fa-lock ${styles.paymentIcon}`}></i>
          <h3 className={styles.paymentTitle}>Paiement sécurisé</h3>
        </div>
        <p className={styles.paymentText}>
          Vous serez redirigé vers Stripe pour finaliser votre commande. Toutes
          les informations bancaires sont cryptées et sécurisées.
        </p>
      </div>

      <div className={styles.termsSection}>
        <label className={styles.termsLabel}>
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className={styles.termsCheckbox}
          />
          <span className={styles.termsText}>
            J'accepte les{" "}
            <Link
              href="/conditions-generales"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.termsLink}
            >
              conditions générales de vente
            </Link>
          </span>
        </label>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          onClick={handleBack}
          disabled={isProcessing}
          className={styles.secondary}
        >
          <i className={`fas fa-arrow-left ${styles.iconLeft}`}></i>
          Retour
        </button>
        <button
          type="button"
          onClick={handleCompleteOrder}
          disabled={isProcessing || !termsAccepted}
          className={styles.primary}
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
    </div>
  );
}
