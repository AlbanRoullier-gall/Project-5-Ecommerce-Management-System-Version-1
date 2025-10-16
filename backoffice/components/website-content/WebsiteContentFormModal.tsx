import React, { useEffect, useState } from "react";
import Button from "../product/ui/Button";
import {
  WebsitePageCreateDTO,
  WebsitePageUpdateDTO,
  WebsitePagePublicDTO,
} from "../../dto";

interface WebsiteContentFormModalProps {
  isOpen: boolean;
  pageToEdit: WebsitePagePublicDTO | null;
  onClose: () => void;
  onSaved: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";

const WebsiteContentFormModal: React.FC<WebsiteContentFormModalProps> = ({
  isOpen,
  pageToEdit,
  onClose,
  onSaved,
}) => {
  const [pageSlug, setPageSlug] = useState("");
  const [pageTitle, setPageTitle] = useState("");
  const [markdownContent, setMarkdownContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (pageToEdit) {
        setPageSlug(pageToEdit.pageSlug);
        setPageTitle(pageToEdit.pageTitle);
        setMarkdownContent(pageToEdit.markdownContent || "");
      } else {
        setPageSlug("");
        setPageTitle("");
        setMarkdownContent("");
      }
    }
  }, [isOpen, pageToEdit]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) throw new Error("Non authentifié");

      if (pageToEdit) {
        const payload: WebsitePageUpdateDTO = {
          pageSlug: pageSlug || undefined,
          pageTitle: pageTitle || undefined,
          markdownContent: markdownContent || undefined,
        };
        const res = await fetch(
          `${API_URL}/api/admin/website-content/pages/${pageToEdit.pageSlug}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }
        );
        if (!res.ok)
          throw new Error("Erreur lors de la mise à jour de la page");
      } else {
        const payload: WebsitePageCreateDTO = {
          pageSlug,
          pageTitle,
          markdownContent,
        };
        const res = await fetch(`${API_URL}/api/admin/website-content/pages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Erreur lors de la création de la page");
      }

      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur réseau");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 860,
          background: "white",
          borderRadius: 16,
          border: "2px solid rgba(19, 104, 106, 0.1)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1.25rem 1.5rem",
            background: "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "1.35rem",
              color: "white",
              fontWeight: 700,
            }}
          >
            {pageToEdit ? "Modifier la page" : "Nouvelle page"}
          </h3>
          <Button variant="gold" onClick={onClose} icon="fas fa-times">
            Fermer
          </Button>
        </div>

        <div style={{ padding: "1.25rem", display: "grid", gap: "0.75rem" }}>
          {error && (
            <div
              style={{
                background: "#FEF2F2",
                color: "#B91C1C",
                border: "1px solid #FECACA",
                padding: "0.75rem 1rem",
                borderRadius: 12,
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
            }}
          >
            <div>
              <label style={{ display: "block", fontWeight: 600 }}>Slug</label>
              <input
                value={pageSlug}
                onChange={(e) => setPageSlug(e.target.value)}
                placeholder="ex: accueil, contact, conditions-generales"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: 10,
                  border: "2px solid #e1e5e9",
                }}
                disabled={!!pageToEdit}
              />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 600 }}>Titre</label>
              <input
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
                placeholder="Titre de la page"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: 10,
                  border: "2px solid #e1e5e9",
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 600 }}>
              Contenu (Markdown)
            </label>
            <textarea
              value={markdownContent}
              onChange={(e) => setMarkdownContent(e.target.value)}
              rows={12}
              placeholder={"## Titre\n\nContenu..."}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: 10,
                border: "2px solid #e1e5e9",
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.5rem",
            padding: "0.75rem 1.25rem",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            icon={pageToEdit ? "fas fa-save" : "fas fa-plus"}
            onClick={handleSubmit}
            disabled={isSubmitting || !pageTitle || !pageSlug}
          >
            {pageToEdit ? "Enregistrer" : "Créer"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WebsiteContentFormModal;
