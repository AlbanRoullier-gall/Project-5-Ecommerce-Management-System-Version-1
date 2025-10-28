/**
 * Composant récapitulatif de commande et paiement
 */

import { useState, useEffect, useMemo } from "react";
import {
  CartPublicDTO,
  CartItemPublicDTO,
  CustomerCreateDTO,
  CustomerPublicDTO,
  AddressCreateDTO,
  ProductPublicDTO,
  CountryDTO,
} from "../../dto";
import { useCart } from "../../contexts/CartContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";

interface CartItemWithProduct extends CartItemPublicDTO {
  product?: ProductPublicDTO;
}

interface CheckoutOrderSummaryProps {
  cart: CartPublicDTO | null;
  customerData: Partial<CustomerCreateDTO>;
  shippingAddress: Partial<AddressCreateDTO>;
  billingAddress: Partial<AddressCreateDTO>;
  onBack: () => void;
  onSuccess: (orderId: number) => void;
}

export default function CheckoutOrderSummary({
  cart,
  customerData,
  shippingAddress,
  billingAddress,
  onBack,
  onSuccess,
}: CheckoutOrderSummaryProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<CartItemWithProduct[]>([]);
  const [countries, setCountries] = useState<CountryDTO[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      if (!cart?.items) return;

      try {
        const productPromises = cart.items.map(async (item) => {
          const response = await fetch(
            `${API_URL}/api/products/${item.productId}`
          );
          if (response.ok) {
            const data = await response.json();
            return { ...item, product: data.product || data };
          }
          return item;
        });

        const productsData = await Promise.all(productPromises);
        setProducts(productsData);
      } catch (err) {
        console.error("Error loading products:", err);
      }
    };

    loadProducts();
  }, [cart]);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const response = await fetch(`${API_URL}/api/customers/countries`);
        if (response.ok) {
          const data = await response.json();
          const allCountries = data.countries || [];
          // Filtrer pour ne garder que la Belgique
          const belgiumOnly = allCountries.filter(
            (country: any) =>
              country.countryName === "Belgique" || country.countryId === 11
          );
          setCountries(belgiumOnly);
        } else {
          // Fallback: définir la Belgique comme seul pays
          setCountries([{ countryId: 11, countryName: "Belgique" }]);
        }
      } catch (error) {
        console.error("Error loading countries:", error);
        // Fallback: définir la Belgique comme seul pays
        setCountries([{ countryId: 11, countryName: "Belgique" }]);
      }
    };

    loadCountries();
  }, []);

  const countryNameById = useMemo(() => {
    return (id?: number) => {
      if (!id) return "Pays non spécifié";
      const country = countries.find((c) => c.countryId === id);
      return country ? country.countryName : `Pays ID: ${id}`;
    };
  }, [countries]);

  // Utiliser les totaux calculés par le CartContext
  const { totals } = useCart();

  const handleCompleteOrder = async () => {
    if (!cart) {
      alert("Votre panier est vide");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      let customerId: number;
      let customer: CustomerPublicDTO;

      const emailEncoded = encodeURIComponent(customerData.email || "");
      const existingCustomerResponse = await fetch(
        `${API_URL}/api/customers/by-email/${emailEncoded}`
      );

      if (existingCustomerResponse.ok) {
        const existingData = await existingCustomerResponse.json();
        customer = existingData.customer;
        customerId = customer.customerId;
      } else {
        const customerResponse = await fetch(`${API_URL}/api/customers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(customerData),
        });

        if (!customerResponse.ok) {
          const errorData = await customerResponse.json();
          throw new Error(
            errorData.message || "Erreur lors de la création du client"
          );
        }

        const customerResponseData = await customerResponse.json();
        customer = customerResponseData.customer;
        customerId = customer.customerId;
      }

      // Sauvegarder les adresses dans le carnet d'adresses du client
      try {
        // Créer l'adresse de livraison (toujours par défaut)
        if (shippingAddress && shippingAddress.address) {
          const shippingAddressDTO = {
            addressType: "shipping",
            address: shippingAddress.address,
            postalCode: shippingAddress.postalCode,
            city: shippingAddress.city,
            countryId: shippingAddress.countryId,
            isDefault: true, // Toujours définir l'adresse de livraison comme par défaut
          };

          const shippingResponse = await fetch(
            `${API_URL}/api/customers/${customerId}/addresses`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(shippingAddressDTO),
            }
          );

          if (!shippingResponse.ok) {
            const errorData = await shippingResponse.json().catch(() => ({}));
            if (
              shippingResponse.status === 409 &&
              errorData.message?.includes("already exists")
            ) {
              console.log(
                "Shipping address already exists in customer address book"
              );
            } else {
              console.warn(
                "Failed to save shipping address to customer address book:",
                errorData.message
              );
            }
          } else {
            console.log("Shipping address saved to customer address book");
          }
        }

        // Créer l'adresse de facturation si elle est différente de l'adresse de livraison
        if (
          billingAddress &&
          billingAddress.address &&
          billingAddress.address !== shippingAddress?.address
        ) {
          const billingAddressDTO = {
            addressType: "billing",
            address: billingAddress.address,
            postalCode: billingAddress.postalCode,
            city: billingAddress.city,
            countryId: billingAddress.countryId,
            isDefault: false, // L'adresse de facturation n'est pas par défaut
          };

          const billingResponse = await fetch(
            `${API_URL}/api/customers/${customerId}/addresses`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(billingAddressDTO),
            }
          );

          if (!billingResponse.ok) {
            const errorData = await billingResponse.json().catch(() => ({}));
            if (
              billingResponse.status === 409 &&
              errorData.message?.includes("already exists")
            ) {
              console.log(
                "Billing address already exists in customer address book"
              );
            } else {
              console.warn(
                "Failed to save billing address to customer address book:",
                errorData.message
              );
            }
          } else {
            console.log("Billing address saved to customer address book");
          }
        }
      } catch (addressError) {
        console.error("Address book save error (non-blocking):", addressError);
      }

      const paymentItems = cart.items.map((item) => {
        const product = products.find((p) => p.productId === item.productId);
        return {
          name: product?.product?.name || "Produit",
          description: product?.product?.description || "",
          price: Math.round(item.price * 100),
          quantity: item.quantity,
          currency: "eur",
        };
      });

      // Construire le snapshot checkout à attacher au panier
      const snapshot = {
        customer: {
          ...customerData,
        },
        shippingAddress: {
          firstName: customerData.firstName || "",
          lastName: customerData.lastName || "",
          company: "",
          address: shippingAddress.address || "",
          city: shippingAddress.city || "",
          postalCode: shippingAddress.postalCode || "",
          country: countryNameById(shippingAddress.countryId),
          phone: customerData.phoneNumber || "",
        },
        billingAddress:
          billingAddress.address !== shippingAddress.address
            ? {
                firstName: customerData.firstName || "",
                lastName: customerData.lastName || "",
                company: "",
                address: billingAddress.address || "",
                city: billingAddress.city || "",
                postalCode: billingAddress.postalCode || "",
                country: countryNameById(billingAddress.countryId),
                phone: customerData.phoneNumber || "",
              }
            : null,
        notes: undefined,
      };

      const cartSessionId =
        (typeof window !== "undefined" &&
          window.localStorage.getItem("cart_session_id")) ||
        "";
      if (!cartSessionId) {
        throw new Error("Session panier introuvable");
      }

      const paymentCreatePayload = {
        cartSessionId,
        snapshot,
        payment: {
          customer: {
            email: customerData.email || "",
            name: `${customerData.firstName} ${customerData.lastName}`,
            phone: customerData.phoneNumber,
          },
          items: paymentItems,
          successUrl: `${window.location.origin}/checkout/success`,
          cancelUrl: `${window.location.origin}/checkout/cancel`,
          metadata: {
            customerId: customerId.toString(),
          },
        },
      };

      const paymentResponse = await fetch(`${API_URL}/api/payment/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentCreatePayload),
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(
          errorData.message || "Erreur lors de la création du paiement"
        );
      }

      const paymentResult = await paymentResponse.json();
      const url = paymentResult.url || paymentResult.payment?.url;

      if (url) {
        window.location.href = url;
      } else {
        throw new Error("URL de paiement non reçue");
      }
    } catch (err) {
      console.error("Error completing order:", err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      setIsProcessing(false);
    }
  };

  const getCivilityLabel = (civilityId: number): string => {
    const civilities: Record<number, string> = {
      1: "M.",
      2: "Mme",
      3: "Autre",
    };
    return civilities[civilityId] || "";
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
      <div
        className="checkout-form-header"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "2.5rem",
        }}
      >
        <div
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.8rem",
            fontWeight: "700",
          }}
        >
          4
        </div>
        <h2
          className="checkout-form-title"
          style={{
            fontSize: "2.2rem",
            fontWeight: "700",
            color: "#333",
          }}
        >
          Récapitulatif et paiement
        </h2>
      </div>

      {error && (
        <div
          style={{
            background: "#fee",
            border: "2px solid #fcc",
            color: "#c33",
            padding: "1.5rem",
            borderRadius: "12px",
            marginBottom: "2rem",
            fontSize: "1.2rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "3rem",
          alignItems: "stretch",
        }}
      >
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
                  {getCivilityLabel(customerData.civilityId || 1)}
                </strong>{" "}
                {customerData.firstName} {customerData.lastName}
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
              <p>{countryNameById(shippingAddress.countryId)}</p>
            </div>
          </div>

          {billingAddress.address !== shippingAddress.address && (
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
                <p>{countryNameById(billingAddress.countryId)}</p>
              </div>
            </div>
          )}
        </div>

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

          <div style={{ marginBottom: "2rem" }}>
            {products.map((item, index) => {
              const vatMultiplier = 1 + (item.vatRate || 0) / 100;
              const unitPriceHT = item.price / vatMultiplier;
              return (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "1.2rem",
                    background: "#f8f9fa",
                    borderRadius: "8px",
                    marginBottom: "1rem",
                    fontSize: "1.3rem",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "600", marginBottom: "0.3rem" }}>
                      {item.product?.name || "Produit"}
                    </div>
                    <div style={{ color: "#666", fontSize: "1.2rem" }}>
                      Quantité: {item.quantity} × {item.price.toFixed(2)} €
                    </div>
                  </div>
                  <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <div
                      style={{
                        fontSize: "1.2rem",
                        color: "#333",
                        fontWeight: 600,
                      }}
                    >
                      {unitPriceHT.toFixed(2)} € HTVA / unité
                    </div>
                    <div style={{ fontSize: "1.1rem", color: "#7a7a7a" }}>
                      TVA {item.vatRate}%
                    </div>
                    <div
                      style={{
                        fontWeight: "700",
                        color: "#13686a",
                        marginTop: "0.4rem",
                      }}
                    >
                      {item.total.toFixed(2)} €
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              padding: "2rem",
              background: "#f8f9fa",
              borderRadius: "12px",
              border: "2px solid #e0e0e0",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "0.6rem 0",
                fontSize: "1.5rem",
                color: "#555",
              }}
            >
              <span>Total HT</span>
              <span>{totals.totalHT.toFixed(2)} €</span>
            </div>

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

            {/* Total TVA (cumul) */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "0.8rem 0",
                fontSize: "1.6rem",
                color: "#333",
                fontWeight: 700,
              }}
            >
              <span>Total TVA</span>
              <span>{totals.vatAmount.toFixed(2)} €</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "1.5rem 0",
                fontSize: "1.8rem",
                color: "#13686a",
                fontWeight: "700",
                borderTop: "2px solid #e0e0e0",
                marginTop: "1rem",
              }}
            >
              <span>Total TTC</span>
              <span>{cart?.total.toFixed(2)} €</span>
            </div>
          </div>
        </div>
      </div>

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
        <button
          type="button"
          onClick={onBack}
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

          /* Tableaux responsives */
          table {
            font-size: 1.1rem !important;
          }

          table th,
          table td {
            padding: 0.8rem 0.5rem !important;
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
            font-size: 1.2rem !important;
            line-height: 1.1 !important;
            margin-bottom: 0.3rem !important;
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

          h4[style*="fontSize: 1.4rem"] {
            font-size: 0.9rem !important;
            margin-bottom: 0.5rem !important;
            color: #13686a !important;
            font-weight: 600 !important;
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

          /* Tableau des produits - Design simplifié */
          table {
            font-size: 0.75rem !important;
            width: 100% !important;
            border-collapse: collapse !important;
            margin: 0.5rem 0 !important;
          }

          table th {
            background: #13686a !important;
            color: white !important;
            padding: 0.4rem 0.2rem !important;
            font-size: 0.7rem !important;
            text-align: center !important;
          }

          table td {
            padding: 0.4rem 0.2rem !important;
            border-bottom: 1px solid #e0e0e0 !important;
            text-align: center !important;
            vertical-align: top !important;
          }

          /* Colonnes du tableau */
          table th:first-child,
          table td:first-child {
            width: 35% !important;
            text-align: left !important;
            font-weight: 600 !important;
          }

          table th:nth-child(2),
          table td:nth-child(2) {
            width: 25% !important;
            font-size: 0.65rem !important;
          }

          table th:last-child,
          table td:last-child {
            width: 40% !important;
            text-align: right !important;
            font-weight: 600 !important;
            color: #13686a !important;
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

          table {
            font-size: 0.9rem !important;
          }

          table th,
          table td {
            padding: 0.5rem 0.2rem !important;
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
