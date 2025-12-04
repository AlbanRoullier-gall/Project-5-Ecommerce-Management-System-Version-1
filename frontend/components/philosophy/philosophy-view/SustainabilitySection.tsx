"use client";

export default function SustainabilitySection() {
  return (
    <>
      <section className="sustainability-section">
        <div className="sustainability-features">
          <ul className="features-list">
            <li className="feature-item">
              <i className="fas fa-seedling feature-icon"></i>
              <span className="feature-text">
                Matériaux durables et intemporels
              </span>
            </li>
            <li className="feature-item">
              <i className="fas fa-recycle feature-icon"></i>
              <span className="feature-text">
                Démarche écoresponsable, réduction des déchets
              </span>
            </li>
            <li className="feature-item">
              <i className="fas fa-solar-panel feature-icon"></i>
              <span className="feature-text">
                Optimisation des ressources et de l'énergie
              </span>
            </li>
          </ul>
        </div>
        <div className="sustainability-content">
          <h2 className="sustainability-title">Durabilité & Impact</h2>
          <p className="sustainability-description">
            La pierre est un matériau noble, fait pour durer. Nous nous
            engageons à réduire notre impact environnemental en favorisant des
            circuits maîtrisés, en optimisant nos transports et en valorisant
            des pratiques plus responsables.
          </p>
        </div>
      </section>

      <style jsx>{`
        .sustainability-section {
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 2.5rem;
          align-items: center;
          margin-bottom: 3.5rem;
        }

        .sustainability-features {
          order: 1;
          background: #ffffff;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
          border: 1px solid rgba(13, 79, 81, 0.12);
        }

        .sustainability-content {
          order: 2;
        }

        .sustainability-title {
          font-size: 2.25rem;
          color: #0d4f51;
          margin-bottom: 1rem;
          font-weight: 700;
          line-height: 1.2;
        }

        .sustainability-description {
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
          .sustainability-section {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }

          .sustainability-content {
            order: 1 !important;
          }

          .sustainability-features {
            order: 2 !important;
          }

          .sustainability-title {
            font-size: 2.25rem;
            text-align: center;
          }

          .sustainability-description {
            font-size: 1.2rem;
            text-align: center;
            line-height: 1.8;
          }
        }

        @media (max-width: 768px) {
          .sustainability-section {
            gap: 1.5rem !important;
            margin-bottom: 2.5rem !important;
          }

          .sustainability-features {
            padding: 1.5rem !important;
          }

          .sustainability-title {
            font-size: 2.25rem;
            margin-bottom: 1rem;
          }

          .sustainability-description {
            font-size: 1.2rem;
            line-height: 1.8;
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
          .sustainability-section {
            gap: 1rem !important;
            margin-bottom: 2rem !important;
          }

          .sustainability-features {
            padding: 1.25rem !important;
          }

          .sustainability-title {
            font-size: 2.25rem;
          }

          .sustainability-description {
            font-size: 1.2rem;
            line-height: 1.8;
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
