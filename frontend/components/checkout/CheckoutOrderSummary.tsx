/**
 * Composant récapitulatif de commande et paiement
 */

import { useState, useEffect } from "react";
import {
  CartPublicDTO,
  CartItemPublicDTO,
  CustomerCreateDTO,
  CustomerPublicDTO,
  AddressCreateDTO,
  CompanyCreateDTO,
  OrderCreateDTO,
  ProductPublicDTO,
} from "../../dto";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";

interface CartItemWithProduct extends CartItemPublicDTO {
  product?: ProductPublicDTO;
}

interface CheckoutOrderSummaryProps {
  cart: CartPublicDTO | null;
  customerData: Partial<CustomerCreateDTO>;
  shippingAddress: Partial<AddressCreateDTO>;
  billingAddress: Partial<AddressCreateDTO>;
  companyData: Partial<CompanyCreateDTO> | null;
  onBack: () => void;
  onSuccess: (orderId: number) => void;
}

export default function CheckoutOrderSummary({
  cart,
  customerData,
  shippingAddress,
  billingAddress,
  companyData,
  onBack,
  onSuccess,
}: CheckoutOrderSummaryProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<CartItemWithProduct[]>([]);

  // Charger les détails des produits
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

  const handleCompleteOrder = async () => {
    if (!cart) {
      alert("Votre panier est vide");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // 1. Vérifier si le client existe déjà par email
      let customerId: number;
      let customer: CustomerPublicDTO;

      // Essayer de récupérer le client existant
      const emailEncoded = encodeURIComponent(customerData.email || "");
      const existingCustomerResponse = await fetch(
        `${API_URL}/api/customers/by-email/${emailEncoded}`
      );

      if (existingCustomerResponse.ok) {
        // Client existe déjà, on utilise son ID
        const existingData = await existingCustomerResponse.json();
        customer = existingData.customer;
        customerId = customer.customerId;
        console.log("✅ Client existant trouvé:", customerId);
      } else {
        // Client n'existe pas, on le crée
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
        console.log("✅ Nouveau client créé:", customerId);
      }

      // 2. Créer l'entreprise si nécessaire
      let companyId = null;
      if (companyData && companyData.companyName) {
        const companyResponse = await fetch(
          `${API_URL}/api/customers/${customerId}/companies`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(companyData),
          }
        );

        if (companyResponse.ok) {
          const { company } = await companyResponse.json();
          companyId = company.companyId;
        }
      }

      // 3. Créer la commande
      const orderData: OrderCreateDTO = {
        customerId,
        customerSnapshot: {
          ...customerData,
          companyId,
          companyData: companyData || null,
        },
        totalAmountHT: cart.subtotal,
        totalAmountTTC: cart.total,
        paymentMethod: "stripe",
        notes: companyData && companyData.companyName 
          ? `Commande entreprise: ${companyData.companyName}`
          : undefined,
      };

      const orderResponse = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(
          errorData.message || "Erreur lors de la création de la commande"
        );
      }

      const { order } = await orderResponse.json();
      const orderId = order.id;

      // 4. Créer les articles de commande
      for (const item of cart.items) {
        const product = products.find((p) => p.productId === item.productId);
        const vatRate = product?.product?.vatRate || 21; // Récupérer le taux de TVA du produit (en %)
        const vatMultiplier = 1 + vatRate / 100; // Convertir en multiplicateur (21 -> 1.21)

        const orderItemData = {
          orderId,
          productId: item.productId,
          productName: product?.product?.name || "Produit",
          quantity: item.quantity,
          unitPriceHT: item.price / vatMultiplier,
          unitPriceTTC: item.price,
          vatRate: vatRate, // Ajouter le taux de TVA (requis par le backend)
          totalPriceHT: (item.price * item.quantity) / vatMultiplier,
          totalPriceTTC: item.price * item.quantity,
        };

        await fetch(`${API_URL}/api/orders/${orderId}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderItemData),
        });
      }

      // 5. Créer les adresses de commande
      const shippingAddressData = {
        orderId,
        addressType: "shipping",
        addressSnapshot: {
          firstName: customerData.firstName || "",
          lastName: customerData.lastName || "",
          company: companyData?.companyName || "",
          address: shippingAddress.address || "",
          city: shippingAddress.city || "",
          postalCode: shippingAddress.postalCode || "",
          country: getCountryName(shippingAddress.countryId || 1),
          phone: customerData.phoneNumber || "",
        },
      };

      await fetch(`${API_URL}/api/orders/${orderId}/addresses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(shippingAddressData),
      });

      // Adresse de facturation (si différente)
      if (billingAddress.address !== shippingAddress.address) {
        const billingAddressData = {
          orderId,
          addressType: "billing",
          addressSnapshot: {
            firstName: customerData.firstName || "",
            lastName: customerData.lastName || "",
            company: companyData?.companyName || "",
            address: billingAddress.address || "",
            city: billingAddress.city || "",
            postalCode: billingAddress.postalCode || "",
            country: getCountryName(billingAddress.countryId || 1),
            phone: customerData.phoneNumber || "",
          },
        };

        await fetch(`${API_URL}/api/orders/${orderId}/addresses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(billingAddressData),
        });
      }

      // 6. Créer le paiement Stripe
      const paymentItems = cart.items.map((item) => {
        const product = products.find((p) => p.productId === item.productId);
        return {
          name: product?.product?.name || "Produit",
          description: product?.product?.description || "",
          price: Math.round(item.price * 100), // Convertir en centimes
          quantity: item.quantity,
          currency: "eur",
        };
      });

      const paymentData = {
        customer: {
          email: customerData.email || "",
          name: `${customerData.firstName} ${customerData.lastName}`,
          phone: customerData.phoneNumber,
        },
        items: paymentItems,
        successUrl: `${window.location.origin}/checkout/success?orderId=${orderId}`,
        cancelUrl: `${window.location.origin}/checkout/cancel?orderId=${orderId}`,
        metadata: {
          orderId: orderId.toString(),
          customerId: customerId.toString(),
        },
      };

      const paymentResponse = await fetch(`${API_URL}/api/payment/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(
          errorData.message || "Erreur lors de la création du paiement"
        );
      }

      const paymentResult = await paymentResponse.json();
      const url = paymentResult.payment?.url || paymentResult.url;

      console.log("Payment result:", paymentResult);
      console.log("Stripe Checkout URL:", url);

      // Rediriger vers Stripe
      if (url) {
        window.location.href = url;
      } else {
        console.error("No URL in payment response:", paymentResult);
        onSuccess(orderId);
      }
    } catch (err) {
      console.error("Error completing order:", err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      setIsProcessing(false);
    }
  };

  const getCountryName = (countryId: number): string => {
    const countries: Record<number, string> = {
      1: "Belgique",
      2: "France",
      3: "Luxembourg",
      4: "Pays-Bas",
      5: "Allemagne",
    };
    return countries[countryId] || "Belgique";
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
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "3rem",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <div
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
          style={{
            fontSize: "2.2rem",
            fontWeight: "700",
            color: "#333",
          }}
        >
          Récapitulatif et paiement
        </h2>
      </div>

      {/* Message d'erreur */}
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
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem" }}
      >
        {/* Colonne gauche - Informations */}
        <div>
          {/* Informations client */}
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

          {/* Adresse de livraison */}
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
              <p>{getCountryName(shippingAddress.countryId || 1)}</p>
            </div>
          </div>

          {/* Adresse de facturation */}
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
                <p>{getCountryName(billingAddress.countryId || 1)}</p>
              </div>
            </div>
          )}

          {/* Informations entreprise */}
          {companyData && companyData.companyName && (
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
                <i className="fas fa-building"></i>
                Informations entreprise
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
                  <strong>{companyData.companyName}</strong>
                </p>
                {companyData.siretNumber && (
                  <p style={{ color: "#666", marginBottom: "0.5rem" }}>
                    SIRET: {companyData.siretNumber}
                  </p>
                )}
                {companyData.vatNumber && (
                  <p style={{ color: "#666" }}>TVA: {companyData.vatNumber}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Colonne droite - Récapitulatif panier */}
        <div>
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

          {/* Articles */}
          <div style={{ marginBottom: "2rem" }}>
            {products.map((item, index) => (
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
                <div style={{ fontWeight: "700", color: "#13686a" }}>
                  {item.total.toFixed(2)} €
                </div>
              </div>
            ))}
          </div>

          {/* Totaux */}
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
                padding: "1rem 0",
                fontSize: "1.3rem",
                color: "#666",
              }}
            >
              <span>Sous-total</span>
              <span style={{ fontWeight: "600" }}>
                {cart?.subtotal.toFixed(2)} €
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "1rem 0",
                fontSize: "1.3rem",
                color: "#666",
              }}
            >
              <span>TVA (21%)</span>
              <span style={{ fontWeight: "600" }}>
                {cart?.tax.toFixed(2)} €
              </span>
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
              <span>Total</span>
              <span>{cart?.total.toFixed(2)} €</span>
            </div>
          </div>
        </div>
      </div>

      {/* Informations paiement */}
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
    </div>
  );
}
