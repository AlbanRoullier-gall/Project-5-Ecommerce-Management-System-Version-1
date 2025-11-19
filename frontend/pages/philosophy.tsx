"use client";

import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ValuesSection from "../components/philosophy/ValuesSection";
import SustainabilitySection from "../components/philosophy/SustainabilitySection";
import CraftSection from "../components/philosophy/CraftSection";

export default function PhilosophyPage() {
  return (
    <>
      <Head>
        <title>Notre Philosophie - Nature de Pierre</title>
        <meta
          name="description"
          content="Découvrez la philosophie de Nature de Pierre : authenticité, durabilité, savoir-faire."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
        <Header />

        <main style={{ padding: "3.5rem 2rem 4rem" }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <ValuesSection />
            <SustainabilitySection />
            <CraftSection />
          </div>
        </main>

        <Footer />
      </div>

      <style jsx global>{`
        @media (max-width: 900px) {
          main > div section {
            grid-template-columns: 1fr !important;
          }
          main {
            padding: 2.5rem 1.5rem 3rem !important;
          }
        }
      `}</style>
    </>
  );
}
