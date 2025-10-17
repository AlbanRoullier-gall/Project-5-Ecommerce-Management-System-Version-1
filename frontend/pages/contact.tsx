"use client";

import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ContactHero from "../components/contact/Hero";
import ContactInfo from "../components/contact/ContactInfo";
import ContactForm from "../components/contact/ContactForm";

export default function Contact() {
  return (
    <>
      <Head>
        <title>Contact - Nature de Pierre</title>
        <meta
          name="description"
          content="Contactez Nature de Pierre pour vos besoins en pierres naturelles"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
        <Header />

        <ContactHero />

        <section style={{ padding: "4rem 2rem" }}>
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "minmax(0, 520px) minmax(0, 520px)",
              justifyContent: "center",
              gap: "4rem",
              alignItems: "stretch",
            }}
          >
            <ContactInfo />
            <ContactForm />
          </div>
        </section>

        <Footer />
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          section > div {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
            justify-content: stretch !important;
          }
        }
      `}</style>
    </>
  );
}
