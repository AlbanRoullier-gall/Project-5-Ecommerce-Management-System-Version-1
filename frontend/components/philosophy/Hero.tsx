"use client";

export default function PhilosophyHero() {
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
  );
}
