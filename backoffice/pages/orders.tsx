"use client";

import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AuthGuard from "../components/auth/AuthGuard";
import OrderList from "../components/order/OrderList";

const OrdersPage: React.FC = () => {
  return (
    <AuthGuard>
      <Head>
        <title>Gestion des Commandes - Nature de Pierre</title>
        <meta name="description" content="Gérer les commandes et avoirs" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen">
        <Header />

        <main className="main-content">
          <div className="page-container">
            <OrderList />
          </div>
        </main>

        <Footer />
      </div>
    </AuthGuard>
  );
};

export default OrdersPage;
