"use client";

import React from "react";
import Link from "next/link";

/**
 * Type pour un lien du formulaire
 */
interface FormLink {
  text: string;
  href: string;
  label: string;
}

/**
 * Props du composant FormLinks
 */
interface FormLinksProps {
  /** Liste des liens à afficher */
  links: FormLink[];
}

/**
 * Composant FormLinks
 *
 * Affiche une liste de liens en bas du formulaire
 *
 * @example
 * <FormLinks
 *   links={[
 *     { text: "Mot de passe oublié ?", href: "/reset-password", label: "Reset" }
 *   ]}
 * />
 */
const FormLinks: React.FC<FormLinksProps> = ({ links }) => {
  if (links.length === 0) {
    return null;
  }

  return (
    <div className="auth-links">
      {links.map((link, index) => (
        <Link key={index} href={link.href} className="auth-link">
          {link.text}
        </Link>
      ))}
    </div>
  );
};

export default FormLinks;
