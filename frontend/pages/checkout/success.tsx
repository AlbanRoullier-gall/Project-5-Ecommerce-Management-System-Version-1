"use client";

import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useCart } from "../../contexts/CartContext";
import { OrderAddressPublicDTO, OrderItemPublicDTO } from "../../dto";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";

/**
 * Page de confirmation de commande réussie
 */
export default function CheckoutSuccessPage() {
  const router = useRouter();
  const { orderId } = router.query;
  const { clearCart } = useCart();
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Vider le panier et envoyer l'email de confirmation (une seule fois)
  useEffect(() => {
    if (orderId && !emailSent && !isProcessing) {
      setIsProcessing(true);
      clearCart();
      sendOrderConfirmationEmail(Number(orderId));
    }
  }, [orderId]);

  // Fonction pour envoyer l'email de confirmation de commande
  const sendOrderConfirmationEmail = async (orderIdNum: number) => {
    try {
      console.log("📧 Fetching order details for order:", orderIdNum);

      // 1. Récupérer les détails de la commande
      const orderResponse = await fetch(`${API_URL}/api/orders/${orderIdNum}`);
      if (!orderResponse.ok) {
        throw new Error("Impossible de récupérer les détails de la commande");
      }
      const orderData = await orderResponse.json();
      const order = orderData.order;

      console.log("📦 Order details:", order);

      // 2. Récupérer les articles de commande
      const itemsResponse = await fetch(
        `${API_URL}/api/orders/${orderIdNum}/items`
      );
      if (!itemsResponse.ok) {
        throw new Error("Impossible de récupérer les articles de la commande");
      }
      const itemsData = await itemsResponse.json();
      const orderItems = itemsData.data?.orderItems || itemsData.items || [];

      console.log("🛍️ Order items:", orderItems);

      // 3. Récupérer les adresses
      const addressesResponse = await fetch(
        `${API_URL}/api/orders/${orderIdNum}/addresses`
      );
      if (!addressesResponse.ok) {
        throw new Error("Impossible de récupérer les adresses de la commande");
      }
      const addressesData = await addressesResponse.json();
      const addresses =
        addressesData.data?.orderAddresses || addressesData.addresses || [];

      console.log("📍 Addresses:", addresses);

      // Trouver l'adresse de livraison
      const shippingAddress = addresses.find(
        (addr: OrderAddressPublicDTO) => addr.addressType === "shipping"
      );

      if (!shippingAddress?.addressSnapshot) {
        throw new Error("Adresse de livraison introuvable");
      }

      // Extraire les informations du customer snapshot
      const customerSnapshot = order.customerSnapshot || {};
      const customerName =
        `${customerSnapshot.firstName || ""} ${
          customerSnapshot.lastName || ""
        }`.trim() || "Client";
      const customerEmail = customerSnapshot.email || order.customerEmail || "";

      if (!customerEmail) {
        throw new Error("Email du client introuvable");
      }

      // 4. Préparer les données pour l'email
      const emailData = {
        customerEmail,
        customerName,
        orderId: orderIdNum,
        orderDate: order.createdAt || new Date().toISOString(),
        items: orderItems.map((item: OrderItemPublicDTO) => ({
          name: item.productName || "Produit",
          quantity: item.quantity,
          unitPrice: item.unitPriceTTC || 0,
          totalPrice: item.totalPriceTTC || 0,
        })),
        subtotal: order.totalAmountHT || 0,
        tax: (order.totalAmountTTC || 0) - (order.totalAmountHT || 0),
        total: order.totalAmountTTC || 0,
        shippingAddress: {
          firstName: shippingAddress.addressSnapshot.firstName || "",
          lastName: shippingAddress.addressSnapshot.lastName || "",
          address: shippingAddress.addressSnapshot.address || "",
          city: shippingAddress.addressSnapshot.city || "",
          postalCode: shippingAddress.addressSnapshot.postalCode || "",
          country: shippingAddress.addressSnapshot.country || "Belgique",
        },
      };

      console.log("📧 Sending order confirmation email:", emailData);

      // 5. Envoyer l'email de confirmation
      const emailResponse = await fetch(
        `${API_URL}/api/email/order-confirmation`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(emailData),
        }
      );

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        console.error("Email sending error:", errorData);
        throw new Error(
          errorData.message || "Erreur lors de l'envoi de l'email"
        );
      }

      const result = await emailResponse.json();
      console.log("✅ Order confirmation email sent:", result);
      setEmailSent(true);
      setIsProcessing(false);
    } catch (error) {
      console.error("Error sending order confirmation email:", error);
      setEmailError(true);
      setEmailSent(true); // Marquer comme traité même en erreur pour éviter la boucle
      setIsProcessing(false);
      // Ne pas bloquer l'affichage de la page si l'email échoue
    }
  };

  return (
    <>
      <Head>
        <title>Commande réussie - Nature de Pierre</title>
        <meta name="description" content="Votre commande a été confirmée" />
      </Head>

      <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
        <Header />

        {/* Main Content */}
        <div
          style={{
            maxWidth: "800px",
            margin: "5rem auto",
            padding: "0 2rem",
            textAlign: "center",
          }}
        >
          {/* Icône de succès */}
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "5rem",
              margin: "0 auto 3rem",
              boxShadow: "0 8px 24px rgba(16, 185, 129, 0.3)",
            }}
          >
            <i className="fas fa-check"></i>
          </div>

          {/* Titre */}
          <h1
            style={{
              fontSize: "3.5rem",
              fontWeight: "700",
              color: "#333",
              marginBottom: "1.5rem",
            }}
          >
            Commande confirmée !
          </h1>

          {/* Numéro de commande */}
          {orderId && (
            <div
              style={{
                fontSize: "1.6rem",
                color: "#666",
                marginBottom: "3rem",
              }}
            >
              Numéro de commande:{" "}
              <strong style={{ color: "#13686a" }}>#{orderId}</strong>
            </div>
          )}

          {/* Message de confirmation */}
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "3rem",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              marginBottom: "3rem",
            }}
          >
            <div
              style={{
                fontSize: "1.4rem",
                color: "#666",
                lineHeight: "1.8",
                marginBottom: "2rem",
              }}
            >
              <p style={{ marginBottom: "1.5rem" }}>
                <i
                  className="fas fa-check-circle"
                  style={{ color: "#10b981", marginRight: "0.8rem" }}
                ></i>
                Votre paiement a été traité avec succès
              </p>
              <p style={{ marginBottom: "1.5rem" }}>
                <i
                  className="fas fa-envelope"
                  style={{ color: "#13686a", marginRight: "0.8rem" }}
                ></i>
                Un email de confirmation vous a été envoyé
              </p>
              <p>
                <i
                  className="fas fa-truck"
                  style={{ color: "#13686a", marginRight: "0.8rem" }}
                ></i>
                Votre commande sera traitée dans les plus brefs délais
              </p>
            </div>

            <div
              style={{
                padding: "2rem",
                background: "#f8f9fa",
                borderRadius: "12px",
                border: "2px solid #e0e0e0",
              }}
            >
              <h3
                style={{
                  fontSize: "1.6rem",
                  fontWeight: "600",
                  color: "#333",
                  marginBottom: "1rem",
                }}
              >
                Que se passe-t-il maintenant ?
              </h3>
              <ul
                style={{
                  textAlign: "left",
                  fontSize: "1.3rem",
                  color: "#666",
                  lineHeight: "2",
                  paddingLeft: "2rem",
                }}
              >
                <li>Nous préparons votre commande avec soin</li>
                <li>Vous recevrez un email avec les détails de livraison</li>
                <li>Vous pourrez suivre votre colis en temps réel</li>
                <li>
                  Notre équipe reste à votre disposition pour toute question
                </li>
              </ul>
            </div>
          </div>

          {/* Boutons d'action */}
          <div
            style={{
              display: "flex",
              gap: "2rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "1rem",
                padding: "1.5rem 3rem",
                background: "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
                color: "white",
                textDecoration: "none",
                borderRadius: "12px",
                fontSize: "1.4rem",
                fontWeight: "600",
                boxShadow: "0 4px 12px rgba(19, 104, 106, 0.3)",
                transition: "transform 0.2s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <i className="fas fa-home"></i>
              Retour à l'accueil
            </Link>

            <Link
              href="/#catalog"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "1rem",
                padding: "1.5rem 3rem",
                background: "white",
                color: "#13686a",
                textDecoration: "none",
                borderRadius: "12px",
                fontSize: "1.4rem",
                fontWeight: "600",
                border: "2px solid #13686a",
                transition: "all 0.3s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#13686a";
                e.currentTarget.style.color = "white";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "white";
                e.currentTarget.style.color = "#13686a";
              }}
            >
              <i className="fas fa-shopping-bag"></i>
              Continuer mes achats
            </Link>
          </div>
        </div>

        <Footer />
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          h1 {
            font-size: 2.5rem !important;
          }

          .success-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
}
