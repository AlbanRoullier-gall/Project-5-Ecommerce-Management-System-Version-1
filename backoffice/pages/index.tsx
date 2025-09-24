"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger automatiquement vers la page de connexion
    router.push("/auth/login");
  }, [router]);

  return (
    <>
      <Head>
        <title>Redirection - Nature de Pierre</title>
        <meta
          name="description"
          content="Redirection vers l'authentification"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin text-4xl text-teal-600"></i>
          </div>
          <p className="mt-4 text-gray-600">
            Redirection vers l'authentification...
          </p>
        </div>
      </div>
    </>
  );
}
