"use client";

export default function CatalogHero() {
  return (
    <section
      style={{
        background: "linear-gradient(135deg, #13686a 0%, #0d4f51 100%)",
        color: "white",
        textAlign: "center",
        padding: "4rem 2rem",
        marginBottom: "2rem",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: "4rem",
            fontWeight: "lighter",
            marginBottom: "1rem",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
          }}
        >
          NATURE DE PIERRE
        </h1>
        <p
          style={{
            fontSize: "1.8rem",
            opacity: 0.9,
            lineHeight: 1.4,
          }}
        >
          Découvrez notre collection exclusive de pierres naturelles
        </p>
      </div>
    </section>
  );
}
