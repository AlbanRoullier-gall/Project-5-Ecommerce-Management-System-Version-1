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
            fontSize: "2.25rem",
            color: "#0d4f51",
            marginBottom: "1rem",
            fontWeight: 700,
          }}
        >
          Savoir‑faire & Accompagnement
        </h2>
        <p
          style={{
            fontSize: "1.2rem",
            color: "#374151",
            lineHeight: 2,
          }}
        >
          Conseils techniques, finitions et entretien : nous vous accompagnons à
          chaque étape pour sublimer vos espaces, en respectant l’esprit des
          matériaux naturels.
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
              className="fas fa-hands"
              style={{ color: "#13686a", marginTop: 2, minWidth: 18 }}
            ></i>
            <span style={{ color: "#1f2937", lineHeight: 1.9 }}>
              Conseils personnalisés selon vos usages
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
              className="fas fa-ruler-combined"
              style={{ color: "#13686a", marginTop: 2, minWidth: 18 }}
            ></i>
            <span style={{ color: "#1f2937", lineHeight: 1.9 }}>
              Choix des formats, finitions et poses
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
              className="fas fa-broom"
              style={{ color: "#13686a", marginTop: 2, minWidth: 18 }}
            ></i>
            <span style={{ color: "#1f2937", lineHeight: 1.9 }}>
              Entretien et pérennité des surfaces
            </span>
          </li>
        </ul>
      </div>
    </section>
  );
}
