"use client";

import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  ValuesSection,
  SustainabilitySection,
  CraftSection,
} from "../components/philosophy";
import styles from "../styles/components/PhilosophyPage.module.css";

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

      <div className={styles.page}>
        <Header />

        <main className={styles.main}>
          <div className={styles.content}>
            <ValuesSection />
            <SustainabilitySection />
            <CraftSection />
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
