import Head from "next/head";
import { ReactNode } from "react";
import Header from "../../Header";
import Footer from "../../Footer";
import CheckoutProgress from "./CheckoutProgress";
import LoadingSpinner from "../../shared/LoadingSpinner";
import styles from "../../../styles/components/CheckoutPageLayout.module.css";

interface CheckoutPageLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  showProgress?: boolean;
  isLoading?: boolean;
}

export default function CheckoutPageLayout({
  title,
  description,
  children,
  showProgress = true,
  isLoading = false,
}: CheckoutPageLayoutProps) {
  if (isLoading) {
    return (
      <>
        <Head>
          <title>Chargement... - Nature de Pierre</title>
        </Head>
        <div className={styles.page}>
          <Header />
          <LoadingSpinner fullscreen message="Chargement..." />
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{title} - Nature de Pierre</title>
        <meta name="description" content={description} />
      </Head>

      <div className={styles.page}>
        <Header />

        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>Finaliser votre commande</h1>
            <p className={styles.subtitle}>
              Complétez les étapes ci-dessous pour passer votre commande
            </p>
          </div>

          {showProgress && <CheckoutProgress />}

          {children}
        </div>

        <Footer />
      </div>
    </>
  );
}
