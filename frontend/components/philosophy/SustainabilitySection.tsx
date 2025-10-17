"use client";

export default function SustainabilitySection() {
  return (
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
            style={{ display: "flex", gap: "0.75rem", marginBottom: "0.9rem" }}
          >
            <i
              className="fas fa-seedling"
              style={{ color: "#13686a", marginTop: 4 }}
            ></i>
            <span>Matériaux durables et intemporels</span>
          </li>
          <li
            style={{ display: "flex", gap: "0.75rem", marginBottom: "0.9rem" }}
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
          La pierre est un matériau noble, fait pour durer. Nous nous engageons
          à réduire notre impact environnemental en favorisant des circuits
          maîtrisés, en optimisant nos transports et en valorisant des pratiques
          plus responsables.
        </p>
      </div>
    </section>
  );
}
