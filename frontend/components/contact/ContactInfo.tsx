"use client";

export default function ContactInfo() {
  return (
    <div
      style={{
        background: "white",
        padding: "2rem",
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h2
        style={{
          fontSize: "2rem",
          color: "#13686a",
          marginBottom: "1.5rem",
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        Informations de Contact
      </h2>
      <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        {/* Adresse */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: "1.25rem 0",
          }}
        >
          <i
            className="fas fa-map-marker-alt"
            style={{ fontSize: "1.6rem", color: "#13686a", minWidth: "1.6rem" }}
          ></i>
          <div>
            <h3
              style={{
                fontSize: "1.35rem",
                color: "#0d4f51",
                marginBottom: "0.25rem",
                fontWeight: 700,
              }}
            >
              Adresse
            </h3>
            <p
              style={{
                fontSize: "1.1rem",
                color: "#374151",
                margin: 0,
                lineHeight: 1.8,
              }}
            >
              Votre adresse ici
            </p>
          </div>
        </div>

        {/* Téléphone */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: "1.25rem 0",
            borderTop: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <i
            className="fas fa-phone"
            style={{ fontSize: "1.6rem", color: "#13686a", minWidth: "1.6rem" }}
          ></i>
          <div>
            <h3
              style={{
                fontSize: "1.35rem",
                color: "#0d4f51",
                marginBottom: "0.25rem",
                fontWeight: 700,
              }}
            >
              Téléphone
            </h3>
            <p
              style={{
                fontSize: "1.1rem",
                color: "#374151",
                margin: 0,
                lineHeight: 1.8,
              }}
            >
              +33 1 23 45 67 89
            </p>
          </div>
        </div>

        {/* Email */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: "1.25rem 0",
            borderTop: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <i
            className="fas fa-envelope"
            style={{ fontSize: "1.6rem", color: "#13686a", minWidth: "1.6rem" }}
          ></i>
          <div>
            <h3
              style={{
                fontSize: "1.35rem",
                color: "#0d4f51",
                marginBottom: "0.25rem",
                fontWeight: 700,
              }}
            >
              Email
            </h3>
            <p
              style={{
                fontSize: "1.1rem",
                color: "#374151",
                margin: 0,
                lineHeight: 1.8,
              }}
            >
              contact@naturedepierre.com
            </p>
          </div>
        </div>

        {/* Horaires */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: "1.25rem 0",
            borderTop: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <i
            className="fas fa-clock"
            style={{ fontSize: "1.6rem", color: "#13686a", minWidth: "1.6rem" }}
          ></i>
          <div>
            <h3
              style={{
                fontSize: "1.35rem",
                color: "#0d4f51",
                marginBottom: "0.25rem",
                fontWeight: 700,
              }}
            >
              Horaires
            </h3>
            <p
              style={{
                fontSize: "1.1rem",
                color: "#374151",
                margin: 0,
                lineHeight: 1.8,
              }}
            >
              Lun - Ven : 9h00 - 18h00
            </p>
            <p
              style={{
                fontSize: "1.1rem",
                color: "#374151",
                margin: "0.25rem 0 0 0",
                lineHeight: 1.8,
              }}
            >
              Sam : 9h00 - 12h00
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
