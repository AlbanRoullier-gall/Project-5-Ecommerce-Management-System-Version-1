"use client";

export default function ValuesSection() {
  return (
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
          privilégions des provenances contrôlées, des carrières respectueuses
          et une traçabilité claire, afin de préserver la qualité et l’éthique
          au cœur de notre démarche.
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
            style={{ display: "flex", gap: "0.75rem", marginBottom: "0.9rem" }}
          >
            <i
              className="fas fa-gem"
              style={{ color: "#13686a", marginTop: 4 }}
            ></i>
            <span>Pièces uniques, veinages et textures naturels</span>
          </li>
          <li
            style={{ display: "flex", gap: "0.75rem", marginBottom: "0.9rem" }}
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
  );
}
