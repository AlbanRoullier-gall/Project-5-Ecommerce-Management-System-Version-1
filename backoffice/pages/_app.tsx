import "../styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "../contexts/AuthContext";

/**
 * Application principale Next.js du backoffice
 *
 * Rôles :
 * - Point d'entrée de toutes les pages
 * - Inclusion des styles globaux
 * - Chargement de Font Awesome pour les icônes
 * - Wrapper commun pour toutes les pages
 * - Provider du contexte d'authentification
 *
 * Note : Head avec Font Awesome CDN pour disposer des icônes
 * dans tous les composants sans installation locale
 */
export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
