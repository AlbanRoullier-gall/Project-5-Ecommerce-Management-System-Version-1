"use client";

export default function ValuesSection() {
  return (
    <>
      <section className="values-section">
        <div className="values-content">
          <h2 className="values-title">Authenticité & Sélection</h2>
          <p className="values-description">
            Chaque pierre est sélectionnée avec exigence pour sa beauté
            intrinsèque, sa durabilité et son histoire géologique. Nous
            privilégions des provenances contrôlées, des carrières respectueuses
            et une traçabilité claire, afin de préserver la qualité et l'éthique
            au cœur de notre démarche.
          </p>
        </div>
        <div className="values-features">
          <ul className="features-list">
            <li className="feature-item">
              <i className="fas fa-gem feature-icon"></i>
              <span className="feature-text">
                Pièces uniques, veinages et textures naturels
              </span>
            </li>
            <li className="feature-item">
              <i className="fas fa-certificate feature-icon"></i>
              <span className="feature-text">
                Qualité certifiée et contrôlée
              </span>
            </li>
            <li className="feature-item">
              <i className="fas fa-route feature-icon"></i>
              <span className="feature-text">
                Traçabilité et sélection responsable
              </span>
            </li>
          </ul>
        </div>
      </section>

      <style jsx>{`
        .values-section {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 2.5rem;
          align-items: center;
          margin-bottom: 3.5rem;
        }

        .values-content {
          order: 1;
        }

        .values-features {
          order: 2;
          background: #ffffff;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
          border: 1px solid rgba(13, 79, 81, 0.12);
        }

        .values-title {
          font-size: 2.25rem;
          color: #0d4f51;
          margin-bottom: 1rem;
          font-weight: 700;
          line-height: 1.2;
        }

        .values-description {
          font-size: 1.2rem;
          color: #374151;
          line-height: 1.8;
        }

        .features-list {
          list-style: none;
          margin: 0;
          padding: 0;
          font-size: 1.15rem;
          line-height: 1.9;
        }

        .feature-item {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 0.9rem;
          align-items: flex-start;
        }

        .feature-item:last-child {
          margin-bottom: 0.25rem;
        }

        .feature-icon {
          color: #13686a;
          margin-top: 2px;
          min-width: 18px;
        }

        .feature-text {
          color: #1f2937;
          line-height: 1.9;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .values-section {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }

          .values-content {
            order: 1 !important;
          }

          .values-features {
            order: 2 !important;
          }

          .values-title {
            font-size: 2rem;
            text-align: center;
          }

          .values-description {
            font-size: 1.1rem;
            text-align: center;
            line-height: 1.7;
          }
        }

        @media (max-width: 768px) {
          .values-section {
            gap: 1.5rem !important;
            margin-bottom: 2.5rem !important;
          }

          .values-features {
            padding: 1.5rem !important;
          }

          .values-title {
            font-size: 1.75rem;
            margin-bottom: 0.75rem;
          }

          .values-description {
            font-size: 1rem;
            line-height: 1.7;
          }

          .features-list {
            font-size: 1rem;
          }

          .feature-item {
            gap: 0.5rem;
            margin-bottom: 0.75rem;
          }

          .feature-icon {
            min-width: 16px;
            font-size: 0.9rem;
          }
        }

        @media (max-width: 480px) {
          .values-section {
            gap: 1rem !important;
            margin-bottom: 2rem !important;
          }

          .values-features {
            padding: 1.25rem !important;
          }

          .values-title {
            font-size: 1.5rem;
          }

          .values-description {
            font-size: 0.95rem;
            line-height: 1.6;
          }

          .features-list {
            font-size: 0.95rem;
          }

          .feature-item {
            gap: 0.4rem;
            margin-bottom: 0.6rem;
          }

          .feature-icon {
            min-width: 14px;
            font-size: 0.85rem;
          }
        }
      `}</style>
    </>
  );
}
