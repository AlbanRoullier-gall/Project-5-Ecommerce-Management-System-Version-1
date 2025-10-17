"use client";

export default function ValuesSection() {
  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: "1.1fr 0.9fr",
        gap: "2.5rem",
        alignItems: "center",
        marginBottom: "3.5rem",
      }}
    >
      <div>
        <h2
          style={{
            fontSize: "2.25rem",
            color: "#0d4f51",
            marginBottom: "1rem",
            fontWeight: 700,
          }}
        >
          Authenticité & Sélection
        </h2>
        <p
          style={{
            fontSize: "1.2rem",
            color: "#374151",
            lineHeight: 2,
            marginBottom: "1rem",
          }}
        >
          Chaque pierre est sélectionnée avec exigence pour sa beauté
          intrinsèque, sa durabilité et son histoire géologique. Nous
          privilégions des provenances contrôlées, des carrières respectueuses
          et une traçabilité claire, afin de préserver la qualité et l’éthique
          au cœur de notre démarche.
        </p>
      </div>
      <div
        style={{
          background: "#ffffff",
          borderRadius: 16,
          padding: "2rem",
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
          border: "1px solid rgba(13, 79, 81, 0.12)",
        }}
      >
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            fontSize: "1.15rem",
            lineHeight: 1.9,
          }}
        >
          <li
            style={{
              display: "flex",
              gap: "0.75rem",
              marginBottom: "0.9rem",
              alignItems: "start",
            }}
          >
            <i
              className="fas fa-gem"
              style={{ color: "#13686a", marginTop: 2, minWidth: 18 }}
            ></i>
            <span style={{ color: "#1f2937", lineHeight: 1.9 }}>
              Pièces uniques, veinages et textures naturels
            </span>
          </li>
          <li
            style={{
              display: "flex",
              gap: "0.75rem",
              marginBottom: "0.9rem",
              alignItems: "start",
            }}
          >
            <i
              className="fas fa-certificate"
              style={{ color: "#13686a", marginTop: 2, minWidth: 18 }}
            ></i>
            <span style={{ color: "#1f2937", lineHeight: 1.9 }}>
              Qualité certifiée et contrôlée
            </span>
          </li>
          <li
            style={{
              display: "flex",
              gap: "0.75rem",
              alignItems: "start",
              marginBottom: "0.25rem",
            }}
          >
            <i
              className="fas fa-route"
              style={{ color: "#13686a", marginTop: 2, minWidth: 18 }}
            ></i>
            <span style={{ color: "#1f2937", lineHeight: 1.9 }}>
              Traçabilité et sélection responsable
            </span>
          </li>
        </ul>
      </div>
    </section>
  );
}
