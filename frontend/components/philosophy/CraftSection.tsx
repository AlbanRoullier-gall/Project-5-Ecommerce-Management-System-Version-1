"use client";

export default function CraftSection() {
  return (
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
          Conseils techniques, finitions et entretien : nous vous accompagnons à
          chaque étape pour sublimer vos espaces, en respectant l’esprit des
          matériaux naturels.
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
              className="fas fa-hands"
              style={{ color: "#13686a", marginTop: 4 }}
            ></i>
            <span>Conseils personnalisés selon vos usages</span>
          </li>
          <li
            style={{ display: "flex", gap: "0.75rem", marginBottom: "0.9rem" }}
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
  );
}
