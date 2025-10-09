import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";

/**
 * Application principale Next.js du backoffice
 *
 * Rôles :
 * - Point d'entrée de toutes les pages
 * - Inclusion des styles globaux
 * - Chargement de Font Awesome pour les icônes
 * - Wrapper commun pour toutes les pages
 *
 * Note : Head avec Font Awesome CDN pour disposer des icônes
 * dans tous les composants sans installation locale
 */
export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
