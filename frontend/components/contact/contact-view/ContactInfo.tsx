"use client";

/**
 * Composant d'affichage des informations de contact
 * Affiche l'adresse, le téléphone, l'email et les horaires d'ouverture
 * dans une carte avec des icônes Font Awesome
 */
export default function ContactInfo() {
  return (
    // Conteneur principal avec style de carte
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
      {/* Titre de la section */}
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

      {/* Conteneur des informations avec bordure supérieure */}
      <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        {/* Section : Adresse */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: "1.25rem 0",
          }}
        >
          {/* Icône de localisation */}
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

        {/* Section : Téléphone */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: "1.25rem 0",
            borderTop: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          {/* Icône de téléphone */}
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

        {/* Section : Email */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: "1.25rem 0",
            borderTop: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          {/* Icône d'email */}
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

        {/* Section : Horaires d'ouverture */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: "1.25rem 0",
            borderTop: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          {/* Icône d'horloge */}
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
            {/* Horaires semaine */}
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
            {/* Horaires samedi */}
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
