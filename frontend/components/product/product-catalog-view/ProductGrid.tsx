import React from "react";
import { ProductPublicDTO } from "../../../dto";
import ProductCard from "./ProductCard";

/**
 * Props du composant ProductGrid
 */
interface ProductGridProps {
  /** Liste des produits à afficher */
  products: ProductPublicDTO[];
  /** Indique si les produits sont en cours de chargement */
  isLoading?: boolean;
}

/**
 * Composant grille de produits
 * Affiche les produits dans une grille responsive
 *
 * @example
 * <ProductGrid products={products} isLoading={false} />
 */
const ProductGrid: React.FC<ProductGridProps> = ({ products, isLoading }) => {
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-wrapper">
          <div className="loading-content">
            <i className="fas fa-spinner fa-spin loading-icon"></i>
            <span className="loading-text">Chargement des produits...</span>
          </div>
        </div>

        <style jsx>{`
          .loading-container {
            padding: 4rem 0;
            background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
            min-height: 60vh;
          }

          .loading-wrapper {
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 2rem;
          }

          .loading-content {
            text-align: center;
            padding: 4rem;
            font-size: 1.5rem;
            color: #13686a;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
          }

          .loading-icon {
            font-size: 1.5rem;
          }

          .loading-text {
            font-size: 1.5rem;
          }

          /* Responsive Design */
          @media (max-width: 768px) {
            .loading-container {
              padding: 3rem 0;
            }

            .loading-wrapper {
              padding: 0 1rem;
            }

            .loading-content {
              padding: 3rem 1rem;
              font-size: 1.3rem;
            }

            .loading-icon {
              font-size: 1.3rem;
            }

            .loading-text {
              font-size: 1.3rem;
            }
          }

          @media (max-width: 480px) {
            .loading-container {
              padding: 2rem 0;
            }

            .loading-wrapper {
              padding: 0 0.75rem;
            }

            .loading-content {
              padding: 2rem 0.75rem;
              font-size: 1.1rem;
              flex-direction: column;
              gap: 0.75rem;
            }

            .loading-icon {
              font-size: 1.1rem;
            }

            .loading-text {
              font-size: 1.1rem;
            }
          }
        `}</style>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="empty-container">
        <div className="empty-wrapper">
          <div className="empty-content">
            <i className="fas fa-inbox empty-icon"></i>
            <span className="empty-text">Aucun produit disponible pour le moment</span>
          </div>
        </div>

        <style jsx>{`
          .empty-container {
            padding: 4rem 0;
            background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
            min-height: 60vh;
          }

          .empty-wrapper {
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 2rem;
          }

          .empty-content {
            text-align: center;
            padding: 4rem;
            font-size: 1.5rem;
            color: #666;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
          }

          .empty-icon {
            font-size: 3rem;
            color: #d1d5db;
          }

          .empty-text {
            font-size: 1.5rem;
          }

          /* Responsive Design */
          @media (max-width: 768px) {
            .empty-container {
              padding: 3rem 0;
            }

            .empty-wrapper {
              padding: 0 1rem;
            }

            .empty-content {
              padding: 3rem 1rem;
              font-size: 1.3rem;
            }

            .empty-icon {
              font-size: 2.5rem;
            }

            .empty-text {
              font-size: 1.3rem;
            }
          }

          @media (max-width: 480px) {
            .empty-container {
              padding: 2rem 0;
            }

            .empty-wrapper {
              padding: 0 0.75rem;
            }

            .empty-content {
              padding: 2rem 0.75rem;
              font-size: 1.1rem;
            }

            .empty-icon {
              font-size: 2rem;
            }

            .empty-text {
              font-size: 1.1rem;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="product-grid-container">
      <div className="product-grid-wrapper">
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      <style jsx>{`
        .product-grid-container {
          padding: 4rem 0;
          background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
          min-height: 60vh;
        }

        .product-grid-wrapper {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2.5rem;
          justify-items: center;
          align-items: start;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .product-grid-container {
            padding: 3rem 0;
          }

          .product-grid-wrapper {
            padding: 0 1rem;
          }

          .product-grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 2rem;
          }
        }

        @media (max-width: 480px) {
          .product-grid-container {
            padding: 2rem 0;
          }

          .product-grid-wrapper {
            padding: 0 0.75rem;
          }

          .product-grid {
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 1.5rem;
          }
        }

        @media (max-width: 360px) {
          .product-grid {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductGrid;
