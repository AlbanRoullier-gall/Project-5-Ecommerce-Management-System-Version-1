import React from "react";
import Head from "next/head";
import CategoryList from "../../components/CategoryList";

const CategoriesPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Gestion des Catégories - Nature de Pierre</title>
        <meta name="description" content="Gérez les catégories de produits" />
      </Head>

      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Gestion des Catégories</h1>
          <p className="page-description">
            Organisez vos produits en catégories pour une meilleure navigation
          </p>
        </div>

        <CategoryList />
      </div>
    </>
  );
};

export default CategoriesPage;
