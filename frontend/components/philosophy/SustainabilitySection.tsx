"use client";

export default function SustainabilitySection() {
  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: "0.9fr 1.1fr",
        gap: "2.5rem",
        alignItems: "center",
        marginBottom: "3.5rem",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: 16,
          padding: "2rem",
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
          border: "1px solid rgba(13, 79, 81, 0.12)",
        }}
      >
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          <li
            style={{
              display: "flex",
              gap: "0.75rem",
              marginBottom: "0.9rem",
              alignItems: "start",
            }}
          >
            <i
              className="fas fa-seedling"
              style={{ color: "#13686a", marginTop: 2, minWidth: 18 }}
            ></i>
            <span
              style={{ color: "#1f2937", lineHeight: 1.9, fontSize: "1.15rem" }}
            >
              Matériaux durables et intemporels
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
              className="fas fa-recycle"
              style={{ color: "#13686a", marginTop: 2, minWidth: 18 }}
            ></i>
            <span
              style={{ color: "#1f2937", lineHeight: 1.9, fontSize: "1.15rem" }}
            >
              Démarche écoresponsable, réduction des déchets
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
              className="fas fa-solar-panel"
              style={{ color: "#13686a", marginTop: 2, minWidth: 18 }}
            ></i>
            <span
              style={{ color: "#1f2937", lineHeight: 1.9, fontSize: "1.15rem" }}
            >
              Optimisation des ressources et de l’énergie
            </span>
          </li>
        </ul>
      </div>
      <div>
        <h2
          style={{
            fontSize: "2.25rem",
            color: "#0d4f51",
            marginBottom: "1rem",
            fontWeight: 700,
          }}
        >
          Durabilité & Impact
        </h2>
        <p
          style={{
            fontSize: "1.2rem",
            color: "#374151",
            lineHeight: 2,
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
