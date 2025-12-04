"use client";

export default function CraftSection() {
  return (
    <>
      <section className="craft-section">
        <div className="craft-content">
          <h2 className="craft-title">Savoir‑faire & Accompagnement</h2>
          <p className="craft-description">
            Conseils techniques, finitions et entretien : nous vous accompagnons
            à chaque étape pour sublimer vos espaces, en respectant l'esprit des
            matériaux naturels.
          </p>
        </div>
        <div className="craft-features">
          <ul className="features-list">
            <li className="feature-item">
              <i className="fas fa-hands feature-icon"></i>
              <span className="feature-text">
                Conseils personnalisés selon vos usages
              </span>
            </li>
            <li className="feature-item">
              <i className="fas fa-ruler-combined feature-icon"></i>
              <span className="feature-text">
                Choix des formats, finitions et poses
              </span>
            </li>
            <li className="feature-item">
              <i className="fas fa-broom feature-icon"></i>
              <span className="feature-text">
                Entretien et pérennité des surfaces
              </span>
            </li>
          </ul>
        </div>
      </section>

      <style jsx>{`
        .craft-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2.5rem;
          align-items: start;
        }

        .craft-content {
          order: 1;
        }

        .craft-features {
          order: 2;
          background: #ffffff;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
          border: 1px solid rgba(13, 79, 81, 0.12);
        }

        .craft-title {
          font-size: 2.25rem;
          color: #0d4f51;
          margin-bottom: 1rem;
          font-weight: 700;
          line-height: 1.2;
        }

        .craft-description {
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
          .craft-section {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }

          .craft-content {
            order: 1 !important;
          }

          .craft-features {
            order: 2 !important;
          }

          .craft-title {
            font-size: 2.25rem;
            text-align: center;
          }

          .craft-description {
            font-size: 1.2rem;
            text-align: center;
            line-height: 1.8;
          }
        }

        @media (max-width: 768px) {
          .craft-section {
            gap: 1.5rem !important;
            margin-bottom: 2.5rem !important;
          }

          .craft-features {
            padding: 1.5rem !important;
          }

          .craft-title {
            font-size: 2.25rem;
            margin-bottom: 1rem;
          }

          .craft-description {
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
          .craft-section {
            gap: 1rem !important;
            margin-bottom: 2rem !important;
          }

          .craft-features {
            padding: 1.25rem !important;
          }

          .craft-title {
            font-size: 2.25rem;
          }

          .craft-description {
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
