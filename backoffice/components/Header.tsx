"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import { useAuth } from "../contexts/AuthContext";
import styles from "../styles/components/Header.module.css";

/**
 * Composant Header du backoffice
 *
 * Fonctionnalités :
 * - Logo et nom de marque
 * - Navigation principale (Dashboard, Produits, Clients, Commandes)
 * - Bouton de déconnexion (si authentifié)
 * - Menu mobile responsive
 * - Détection automatique de l'état d'authentification via le contexte
 *
 * Navigation desktop affichée sous le header
 * Navigation mobile affichée dans un menu déroulant
 */
const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const navContainerRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, logout, user, isLoading } = useAuth();

  // Éviter les erreurs d'hydratation en ne rendant les éléments conditionnels qu'après le montage
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fonction pour réinitialiser tous les états hover
  const resetHoverStates = () => {
    if (navContainerRef.current) {
      const navItems = navContainerRef.current.querySelectorAll("a");
      navItems.forEach((el) => {
        if (el instanceof HTMLElement) {
          el.blur();
          // Désactiver temporairement pointer-events pour forcer la réinitialisation
          el.style.pointerEvents = "none";
          // Utiliser requestAnimationFrame pour forcer le reflow
          requestAnimationFrame(() => {
            el.style.pointerEvents = "";
          });
        }
      });
    }
  };

  // Réinitialiser l'état hover après chaque navigation
  useEffect(() => {
    const handleRouteChangeStart = () => {
      resetHoverStates();
    };

    const handleRouteChangeComplete = () => {
      // Réinitialiser à nouveau après la navigation complète
      setTimeout(() => {
        resetHoverStates();
      }, 0);
    };

    router.events?.on("routeChangeStart", handleRouteChangeStart);
    router.events?.on("routeChangeComplete", handleRouteChangeComplete);

    return () => {
      router.events?.off("routeChangeStart", handleRouteChangeStart);
      router.events?.off("routeChangeComplete", handleRouteChangeComplete);
    };
  }, [router]);

  /**
   * Déconnecte l'utilisateur et redirige vers la page de connexion
   */
  const handleLogout = () => {
    logout();
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <div className={styles.brandSection}>
          <Link href="/" className={styles.brandLink}>
            <Image
              className={styles.logo}
              src="/images/logoNatureDePierreIcon.svg"
              alt="Logo Nature de Pierre"
              width={50}
              height={50}
            />
            <span className={styles.brandText}>NATURE DE PIERRE</span>
          </Link>
        </div>

        {/* User Actions */}
        {isMounted && !isLoading && isAuthenticated && (
          <div className={styles.userActions}>
            <button onClick={handleLogout} className={styles.logoutButton}>
              <i className={`fas fa-sign-out-alt ${styles.logoutIcon}`}></i>
              <span>Déconnexion</span>
            </button>
          </div>
        )}

        {/* Mobile Menu Button */}
        <button
          className={styles.mobileMenuBtn}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <i
            className={`fas ${isMenuOpen ? "fa-times" : "fa-bars"} ${
              styles.mobileMenuIcon
            }`}
          ></i>
        </button>
      </div>

      {/* Desktop Navigation - Below Title */}
      <nav className={styles.desktopNav}>
        <div className={styles.navContainer} ref={navContainerRef}>
          <Link
            href="/dashboard"
            className={styles.navItem}
            onMouseDown={(e) => {
              resetHoverStates();
              e.currentTarget.blur();
            }}
          >
            <i className={`fas fa-tachometer-alt ${styles.navIcon}`}></i>
            <span>TABLEAU DE BORD</span>
          </Link>
          <Link
            href="/products"
            className={styles.navItem}
            onMouseDown={(e) => {
              resetHoverStates();
              e.currentTarget.blur();
            }}
          >
            <i className={`fas fa-box ${styles.navIcon}`}></i>
            <span>PRODUITS</span>
          </Link>
          <Link
            href="/customers"
            className={styles.navItem}
            onMouseDown={(e) => {
              resetHoverStates();
              e.currentTarget.blur();
            }}
          >
            <i className={`fas fa-users ${styles.navIcon}`}></i>
            <span>CLIENTS</span>
          </Link>
          <Link
            href="/orders"
            className={styles.navItem}
            onMouseDown={(e) => {
              resetHoverStates();
              e.currentTarget.blur();
            }}
          >
            <i className={`fas fa-shopping-bag ${styles.navIcon}`}></i>
            <span>COMMANDES</span>
          </Link>
          {isMounted && !isLoading && user?.isSuperAdmin && (
            <Link
              href="/users/management"
              className={styles.navItem}
              onMouseDown={(e) => {
                resetHoverStates();
                e.currentTarget.blur();
              }}
            >
              <i className={`fas fa-user-shield ${styles.navIcon}`}></i>
              <span>UTILISATEURS</span>
            </Link>
          )}
          {/* Website content link removed */}
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className={styles.mobileNav}>
          <Link
            href="/dashboard"
            className={styles.mobileNavItem}
            onClick={() => setIsMenuOpen(false)}
          >
            <i className={`fas fa-tachometer-alt ${styles.mobileNavIcon}`}></i>
            <span>TABLEAU DE BORD</span>
          </Link>
          <Link
            href="/products"
            className={styles.mobileNavItem}
            onClick={() => setIsMenuOpen(false)}
          >
            <i className={`fas fa-box ${styles.mobileNavIcon}`}></i>
            <span>PRODUITS</span>
          </Link>
          <Link
            href="/customers"
            className={styles.mobileNavItem}
            onClick={() => setIsMenuOpen(false)}
          >
            <i className={`fas fa-users ${styles.mobileNavIcon}`}></i>
            <span>CLIENTS</span>
          </Link>
          <Link
            href="/orders"
            className={styles.mobileNavItem}
            onClick={() => setIsMenuOpen(false)}
          >
            <i className={`fas fa-shopping-bag ${styles.mobileNavIcon}`}></i>
            <span>COMMANDES</span>
          </Link>
          {isMounted && !isLoading && user?.isSuperAdmin && (
            <Link
              href="/users/management"
              className={styles.mobileNavItem}
              onClick={() => setIsMenuOpen(false)}
            >
              <i className={`fas fa-user-shield ${styles.mobileNavIcon}`}></i>
              <span>UTILISATEURS</span>
            </Link>
          )}
          {/* Website content link removed from mobile nav */}
        </nav>
      )}
    </header>
  );
};

export default Header;
