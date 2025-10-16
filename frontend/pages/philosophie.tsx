"use client";

import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Philosophie() {
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
        {/* HEADER */}
        <Header />

        {/* HERO */}
        <section
          style={{
            background: "linear-gradient(135deg, #13686a 0%, #0d4f51 100%)",
            color: "white",
            textAlign: "center",
            padding: "4rem 2rem",
            marginBottom: "2rem",
          }}
        >
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <h1
              style={{
                fontSize: "4rem",
                fontWeight: "lighter",
                marginBottom: "1rem",
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.25)",
                letterSpacing: 1,
              }}
            >
              NOTRE PHILOSOPHIE
            </h1>
            <p
              style={{
                fontSize: "1.8rem",
                opacity: 0.92,
                lineHeight: 1.5,
              }}
            >
              Une vision artisanale, durable et respectueuse de la nature.
            </p>
          </div>
        </section>

        {/* CONTENT SECTIONS */}
        <main style={{ padding: "3rem 2rem" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            {/* Valeurs */}
            <section
              style={{
                display: "grid",
                gridTemplateColumns: "1.1fr 0.9fr",
                gap: "2.5rem",
                alignItems: "center",
                marginBottom: "3rem",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "2rem",
                    color: "#13686a",
                    marginBottom: "1rem",
                    fontWeight: "bold",
                  }}
                >
                  Authenticité & Sélection
                </h2>
                <p
                  style={{
                    fontSize: "1.05rem",
                    color: "#555",
                    lineHeight: 1.8,
                  }}
                >
                  Chaque pierre est sélectionnée avec exigence pour sa beauté
                  intrinsèque, sa durabilité et son histoire géologique. Nous
                  privilégions des provenances contrôlées, des carrières
                  respectueuses et une traçabilité claire, afin de préserver la
                  qualité et l’éthique au cœur de notre démarche.
                </p>
              </div>
              <div
                style={{
                  background: "white",
                  borderRadius: 12,
                  padding: "2rem",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                  border: "2px solid rgba(19, 104, 106, 0.08)",
                }}
              >
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  <li
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      marginBottom: "0.9rem",
                    }}
                  >
                    <i
                      className="fas fa-gem"
                      style={{ color: "#13686a", marginTop: 4 }}
                    ></i>
                    <span>Pièces uniques, veinages et textures naturels</span>
                  </li>
                  <li
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      marginBottom: "0.9rem",
                    }}
                  >
                    <i
                      className="fas fa-certificate"
                      style={{ color: "#13686a", marginTop: 4 }}
                    ></i>
                    <span>Qualité certifiée et contrôlée</span>
                  </li>
                  <li style={{ display: "flex", gap: "0.75rem" }}>
                    <i
                      className="fas fa-route"
                      style={{ color: "#13686a", marginTop: 4 }}
                    ></i>
                    <span>Traçabilité et sélection responsable</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Durabilité */}
            <section
              style={{
                display: "grid",
                gridTemplateColumns: "0.9fr 1.1fr",
                gap: "2.5rem",
                alignItems: "center",
                marginBottom: "3rem",
              }}
            >
              <div
                style={{
                  background: "white",
                  borderRadius: 12,
                  padding: "2rem",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                  border: "2px solid rgba(19, 104, 106, 0.08)",
                }}
              >
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  <li
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      marginBottom: "0.9rem",
                    }}
                  >
                    <i
                      className="fas fa-seedling"
                      style={{ color: "#13686a", marginTop: 4 }}
                    ></i>
                    <span>Matériaux durables et intemporels</span>
                  </li>
                  <li
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      marginBottom: "0.9rem",
                    }}
                  >
                    <i
                      className="fas fa-recycle"
                      style={{ color: "#13686a", marginTop: 4 }}
                    ></i>
                    <span>Démarche écoresponsable, réduction des déchets</span>
                  </li>
                  <li style={{ display: "flex", gap: "0.75rem" }}>
                    <i
                      className="fas fa-solar-panel"
                      style={{ color: "#13686a", marginTop: 4 }}
                    ></i>
                    <span>Optimisation des ressources et de l’énergie</span>
                  </li>
                </ul>
              </div>
              <div>
                <h2
                  style={{
                    fontSize: "2rem",
                    color: "#13686a",
                    marginBottom: "1rem",
                    fontWeight: "bold",
                  }}
                >
                  Durabilité & Impact
                </h2>
                <p
                  style={{
                    fontSize: "1.05rem",
                    color: "#555",
                    lineHeight: 1.8,
                  }}
                >
                  La pierre est un matériau noble, fait pour durer. Nous nous
                  engageons à réduire notre impact environnemental en favorisant
                  des circuits maîtrisés, en optimisant nos transports et en
                  valorisant des pratiques plus responsables.
                </p>
              </div>
            </section>

            {/* Savoir-faire */}
            <section
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "2.5rem",
                alignItems: "start",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "2rem",
                    color: "#13686a",
                    marginBottom: "1rem",
                    fontWeight: "bold",
                  }}
                >
                  Savoir‑faire & Accompagnement
                </h2>
                <p
                  style={{
                    fontSize: "1.05rem",
                    color: "#555",
                    lineHeight: 1.8,
                  }}
                >
                  Conseils techniques, finitions et entretien : nous vous
                  accompagnons à chaque étape pour sublimer vos espaces, en
                  respectant l’esprit des matériaux naturels.
                </p>
              </div>
              <div
                style={{
                  background: "white",
                  borderRadius: 12,
                  padding: "2rem",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                  border: "2px solid rgba(19, 104, 106, 0.08)",
                }}
              >
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  <li
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      marginBottom: "0.9rem",
                    }}
                  >
                    <i
                      className="fas fa-hands"
                      style={{ color: "#13686a", marginTop: 4 }}
                    ></i>
                    <span>Conseils personnalisés selon vos usages</span>
                  </li>
                  <li
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      marginBottom: "0.9rem",
                    }}
                  >
                    <i
                      className="fas fa-ruler-combined"
                      style={{ color: "#13686a", marginTop: 4 }}
                    ></i>
                    <span>Choix des formats, finitions et poses</span>
                  </li>
                  <li style={{ display: "flex", gap: "0.75rem" }}>
                    <i
                      className="fas fa-broom"
                      style={{ color: "#13686a", marginTop: 4 }}
                    ></i>
                    <span>Entretien et pérennité des surfaces</span>
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </main>

        {/* FOOTER */}
        <Footer />
      </div>

      <style jsx global>{`
        @media (max-width: 900px) {
          main > div section {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
