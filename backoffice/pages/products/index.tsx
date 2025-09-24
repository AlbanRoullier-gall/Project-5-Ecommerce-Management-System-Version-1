"use client";

import React, { useState } from "react";
import Head from "next/head";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProductList from "../../components/ProductList";
import CategoryList from "../../components/CategoryList";

const ProductsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"products" | "categories">(
    "products"
  );

  return (
    <>
      <Head>
        <title>Gestion des Produits - Nature de Pierre</title>
        <meta
          name="description"
          content="Gestion des produits et catégories du catalogue Nature de Pierre"
        />
      </Head>

      <div className="app">
        <Header />

        <main className="main-content">
          <div className="container">
            <div className="page-header">
              <h1 className="page-title">Gestion du Catalogue</h1>
              <p className="page-description">
                Gérez vos produits et catégories pour organiser votre catalogue
              </p>
            </div>

            <div className="tabs-container">
              <div className="tabs-nav">
                <button
                  className={`tab-button ${
                    activeTab === "products" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("products")}
                >
                  Produits
                </button>
                <button
                  className={`tab-button ${
                    activeTab === "categories" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("categories")}
                >
                  Catégories
                </button>
              </div>

              <div className="tab-content">
                {activeTab === "products" && <ProductList />}
                {activeTab === "categories" && <CategoryList />}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ProductsPage;
