"use client";

import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCart } from "../contexts/CartContext";
import {
  CheckoutCustomerForm,
  CheckoutAddressForm,
  CheckoutCompanyForm,
  CheckoutOrderSummary,
} from "../components/checkout";
import { CustomerCreateDTO, AddressCreateDTO, CompanyCreateDTO } from "../dto";

interface AddressFormData {
  shipping: Partial<AddressCreateDTO>;
  billing: Partial<AddressCreateDTO>;
  useSameAddress: boolean;
}

/**
 * Page de passage de commande (checkout)
 * Processus en plusieurs étapes avec validation
 */
export default function CheckoutPage() {
  const router = useRouter();
  const { cart, isLoading } = useCart();
  const [currentStep, setCurrentStep] = useState(1);

  // États pour les données du formulaire
  const [customerData, setCustomerData] = useState<Partial<CustomerCreateDTO>>(
    {}
  );
  const [addressData, setAddressData] = useState<AddressFormData>({
    shipping: {} as Partial<AddressCreateDTO>,
    billing: {} as Partial<AddressCreateDTO>,
    useSameAddress: true,
  });
  const [companyData, setCompanyData] =
    useState<Partial<CompanyCreateDTO> | null>(null);

  // Vérifier si le panier est vide
  useEffect(() => {
    if (!isLoading && (!cart || !cart.items || cart.items.length === 0)) {
      router.push("/cart");
    }
  }, [cart, isLoading, router]);

  const handleCustomerNext = (data: Partial<CustomerCreateDTO>) => {
    setCustomerData(data);
    setCurrentStep(2);
  };

  const handleAddressNext = (data: AddressFormData) => {
    setAddressData(data);
    setCurrentStep(3);
  };

  const handleCompanyNext = (data: Partial<CompanyCreateDTO> | null) => {
    setCompanyData(data);
    setCurrentStep(4);
  };

  const handleOrderSuccess = (orderId: number) => {
    console.log("Commande créée avec succès:", orderId);
    // Redirection gérée par Stripe
  };

  // Indicateur de progression
  const steps = [
    { number: 1, label: "Informations", icon: "fa-user" },
    { number: 2, label: "Adresses", icon: "fa-map-marker-alt" },
    { number: 3, label: "Entreprise", icon: "fa-building" },
    { number: 4, label: "Paiement", icon: "fa-credit-card" },
  ];

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Chargement... - Nature de Pierre</title>
        </Head>
        <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
          <Header />
          <div
            style={{
              textAlign: "center",
              padding: "5rem 2rem",
            }}
          >
            <i
              className="fas fa-spinner fa-spin"
              style={{
                fontSize: "4rem",
                color: "#13686a",
                marginBottom: "2rem",
              }}
            ></i>
            <p style={{ fontSize: "1.4rem", color: "#666" }}>Chargement...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Passer la commande - Nature de Pierre</title>
        <meta name="description" content="Finalisez votre commande" />
      </Head>

      <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
        <Header />

        {/* Breadcrumb */}
        <div
          style={{
            background: "#fff",
            padding: "1.5rem 2rem",
            borderBottom: "2px solid #e0e0e0",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              fontSize: "1.2rem",
              color: "#666",
            }}
          >
            <Link
              href="/"
              style={{
                color: "#13686a",
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              <i className="fas fa-home" style={{ marginRight: "0.5rem" }}></i>
              Accueil
            </Link>
            <span style={{ margin: "0 1rem", color: "#ccc" }}>/</span>
            <Link
              href="/cart"
              style={{
                color: "#13686a",
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              Panier
            </Link>
            <span style={{ margin: "0 1rem", color: "#ccc" }}>/</span>
            <span style={{ color: "#333", fontWeight: "600" }}>Commande</span>
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            maxWidth: "1200px",
            margin: "3rem auto",
            padding: "0 2rem",
            minHeight: "60vh",
          }}
        >
          {/* En-tête */}
          <div style={{ marginBottom: "3rem", textAlign: "center" }}>
            <h1
              style={{
                fontSize: "3rem",
                color: "#333",
                fontWeight: "700",
                marginBottom: "1rem",
              }}
            >
              Finaliser votre commande
            </h1>
            <p style={{ fontSize: "1.4rem", color: "#666" }}>
              Complétez les étapes ci-dessous pour passer votre commande
            </p>
          </div>

          {/* Indicateur de progression */}
          <div
            className="checkout-progress"
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "4rem",
              padding: "0 2rem",
            }}
          >
            {steps.map((step, index) => (
              <div
                key={step.number}
                style={{
                  flex: 1,
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {/* Ligne de connexion */}
                {index < steps.length - 1 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "25px",
                      left: "50%",
                      right: "-50%",
                      height: "4px",
                      background:
                        currentStep > step.number
                          ? "linear-gradient(90deg, #13686a 0%, #0dd3d1 100%)"
                          : "#e0e0e0",
                      zIndex: 0,
                    }}
                  />
                )}

                {/* Icône étape */}
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background:
                      currentStep >= step.number
                        ? "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)"
                        : "#e0e0e0",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.8rem",
                    fontWeight: "700",
                    position: "relative",
                    zIndex: 1,
                    marginBottom: "1rem",
                    boxShadow:
                      currentStep >= step.number
                        ? "0 4px 12px rgba(19, 104, 106, 0.3)"
                        : "none",
                    transition: "all 0.3s ease",
                  }}
                >
                  {currentStep > step.number ? (
                    <i className="fas fa-check"></i>
                  ) : (
                    <i className={`fas ${step.icon}`}></i>
                  )}
                </div>

                {/* Label étape */}
                <div
                  className="checkout-step-label"
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: currentStep === step.number ? "700" : "500",
                    color: currentStep >= step.number ? "#13686a" : "#999",
                    textAlign: "center",
                  }}
                >
                  {step.label}
                </div>
              </div>
            ))}
          </div>

          {/* Formulaires des étapes */}
          <div style={{ marginBottom: "4rem" }}>
            {currentStep === 1 && (
              <CheckoutCustomerForm
                formData={customerData}
                onChange={setCustomerData}
                onNext={() => handleCustomerNext(customerData)}
              />
            )}

            {currentStep === 2 && (
              <CheckoutAddressForm
                formData={addressData}
                onChange={setAddressData}
                onNext={() => handleAddressNext(addressData)}
                onBack={() => setCurrentStep(1)}
              />
            )}

            {currentStep === 3 && (
              <CheckoutCompanyForm
                formData={companyData}
                onChange={setCompanyData}
                onNext={() => handleCompanyNext(companyData)}
                onBack={() => setCurrentStep(2)}
              />
            )}

            {currentStep === 4 && (
              <CheckoutOrderSummary
                cart={cart}
                customerData={customerData}
                shippingAddress={addressData.shipping}
                billingAddress={
                  addressData.useSameAddress
                    ? addressData.shipping
                    : addressData.billing
                }
                companyData={companyData}
                onBack={() => setCurrentStep(3)}
                onSuccess={handleOrderSuccess}
              />
            )}
          </div>

          {/* Informations de sécurité */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "2rem",
              marginBottom: "4rem",
            }}
          >
            <div
              className="checkout-info-card"
              style={{
                textAlign: "center",
                padding: "2rem",
                background: "white",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <i
                className="fas fa-lock"
                style={{
                  fontSize: "3rem",
                  color: "#13686a",
                  marginBottom: "1rem",
                }}
              ></i>
              <h3
                style={{
                  fontSize: "1.4rem",
                  fontWeight: "600",
                  marginBottom: "0.5rem",
                }}
              >
                Paiement sécurisé
              </h3>
              <p style={{ fontSize: "1.2rem", color: "#666" }}>
                Transaction cryptée SSL
              </p>
            </div>

            <div
              className="checkout-info-card"
              style={{
                textAlign: "center",
                padding: "2rem",
                background: "white",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <i
                className="fas fa-truck"
                style={{
                  fontSize: "3rem",
                  color: "#13686a",
                  marginBottom: "1rem",
                }}
              ></i>
              <h3
                style={{
                  fontSize: "1.4rem",
                  fontWeight: "600",
                  marginBottom: "0.5rem",
                }}
              >
                Livraison rapide
              </h3>
              <p style={{ fontSize: "1.2rem", color: "#666" }}>
                Gratuite dès 50 €
              </p>
            </div>

            <div
              className="checkout-info-card"
              style={{
                textAlign: "center",
                padding: "2rem",
                background: "white",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <i
                className="fas fa-headset"
                style={{
                  fontSize: "3rem",
                  color: "#13686a",
                  marginBottom: "1rem",
                }}
              ></i>
              <h3
                style={{
                  fontSize: "1.4rem",
                  fontWeight: "600",
                  marginBottom: "0.5rem",
                }}
              >
                Support client
              </h3>
              <p style={{ fontSize: "1.2rem", color: "#666" }}>
                7j/7 à votre écoute
              </p>
            </div>
          </div>
        </div>

        <Footer />
      </div>

      <style jsx global>{`
        @media (max-width: 1024px) {
          .checkout-progress {
            padding: 0 1rem !important;
          }

          .checkout-step-label {
            font-size: 1.1rem !important;
          }
        }

        @media (max-width: 768px) {
          .checkout-progress {
            padding: 0 !important;
          }

          .checkout-progress > div {
            flex-direction: column;
          }

          .checkout-step-label {
            font-size: 1rem !important;
          }

          /* Grille des cartes info en 1 colonne sur mobile */
          .checkout-info-card {
            grid-column: 1 / -1 !important;
          }
        }

        @media (max-width: 480px) {
          .checkout-progress {
            flex-wrap: wrap;
            gap: 2rem;
          }

          .checkout-progress > div {
            flex: 1 1 calc(50% - 1rem);
          }
        }
      `}</style>
    </>
  );
}
