"use client";

export default function ContactInfo() {
  return (
    <div>
      <h2
        style={{
          fontSize: "2rem",
          color: "#13686a",
          marginBottom: "2rem",
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        Informations de Contact
      </h2>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
        }}
      >
        {/* Adresse */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "1rem",
            padding: "1.5rem",
            background: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <i
            className="fas fa-map-marker-alt"
            style={{ fontSize: "2rem", color: "#13686a", minWidth: "2rem" }}
          ></i>
          <div>
            <h3
              style={{
                fontSize: "1.2rem",
                color: "#13686a",
                marginBottom: "0.5rem",
                fontWeight: "600",
              }}
            >
              Adresse
            </h3>
            <p style={{ fontSize: "1rem", color: "#666", margin: 0 }}>
              Votre adresse ici
            </p>
          </div>
        </div>

        {/* Téléphone */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "1rem",
            padding: "1.5rem",
            background: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <i
            className="fas fa-phone"
            style={{ fontSize: "2rem", color: "#13686a", minWidth: "2rem" }}
          ></i>
          <div>
            <h3
              style={{
                fontSize: "1.2rem",
                color: "#13686a",
                marginBottom: "0.5rem",
                fontWeight: "600",
              }}
            >
              Téléphone
            </h3>
            <p style={{ fontSize: "1rem", color: "#666", margin: 0 }}>
              +33 1 23 45 67 89
            </p>
          </div>
        </div>

        {/* Email */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "1rem",
            padding: "1.5rem",
            background: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <i
            className="fas fa-envelope"
            style={{ fontSize: "2rem", color: "#13686a", minWidth: "2rem" }}
          ></i>
          <div>
            <h3
              style={{
                fontSize: "1.2rem",
                color: "#13686a",
                marginBottom: "0.5rem",
                fontWeight: "600",
              }}
            >
              Email
            </h3>
            <p style={{ fontSize: "1rem", color: "#666", margin: 0 }}>
              contact@naturedepierre.com
            </p>
          </div>
        </div>

        {/* Horaires */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "1rem",
            padding: "1.5rem",
            background: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <i
            className="fas fa-clock"
            style={{ fontSize: "2rem", color: "#13686a", minWidth: "2rem" }}
          ></i>
          <div>
            <h3
              style={{
                fontSize: "1.2rem",
                color: "#13686a",
                marginBottom: "0.5rem",
                fontWeight: "600",
              }}
            >
              Horaires
            </h3>
            <p style={{ fontSize: "1rem", color: "#666", margin: 0 }}>
              Lun - Ven : 9h00 - 18h00
            </p>
            <p
              style={{
                fontSize: "1rem",
                color: "#666",
                margin: "0.25rem 0 0 0",
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
