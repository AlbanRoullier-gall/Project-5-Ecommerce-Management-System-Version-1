"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

/**
 * Composant Header du backoffice
 *
 * Fonctionnalités :
 * - Logo et nom de marque
 * - Navigation principale (Dashboard, Produits, Clients, Commandes)
 * - Bouton de déconnexion (si authentifié)
 * - Menu mobile responsive
 * - Détection automatique de l'état d'authentification
 *
 * Navigation desktop affichée sous le header
 * Navigation mobile affichée dans un menu déroulant
 */
const Header: React.FC = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Vérifie l'état d'authentification au montage
   */
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setIsAuthenticated(!!token);
  }, []);

  /**
   * Déconnecte l'utilisateur et redirige vers la page de connexion
   */
  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  return (
    <header className="modern-header">
      <div className="header-container">
        <div className="brand-section">
          <Link href="/" className="brand-link">
            <Image
              className="logo"
              src="/images/logoNatureDePierreIcon.svg"
              alt="Logo Nature de Pierre"
              width={50}
              height={50}
            />
            <span className="brand-text">NATURE DE PIERRE</span>
          </Link>
        </div>

        {/* User Actions */}
        {isAuthenticated && (
          <div className="user-actions">
            <button onClick={handleLogout} className="logout-btn">
              <i className="fas fa-sign-out-alt"></i>
              <span>Déconnexion</span>
            </button>
          </div>
        )}

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <i className={`fas ${isMenuOpen ? "fa-times" : "fa-bars"}`}></i>
        </button>
      </div>

      {/* Desktop Navigation - Below Title */}
      <nav className="desktop-nav">
        <div className="nav-container">
          <Link href="/dashboard" className="nav-item">
            <i className="fas fa-tachometer-alt"></i>
            <span>DASHBOARD</span>
          </Link>
          <Link href="/products" className="nav-item">
            <i className="fas fa-box"></i>
            <span>PRODUITS</span>
          </Link>
          <Link href="/customers" className="nav-item">
            <i className="fas fa-users"></i>
            <span>CLIENTS</span>
          </Link>
          <Link href="/orders" className="nav-item">
            <i className="fas fa-shopping-bag"></i>
            <span>COMMANDES</span>
          </Link>
          {/* Website content link removed */}
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="mobile-nav">
          <Link
            href="/dashboard"
            className="mobile-nav-item"
            onClick={() => setIsMenuOpen(false)}
          >
            <i className="fas fa-tachometer-alt"></i>
            <span>DASHBOARD</span>
          </Link>
          <Link
            href="/products"
            className="mobile-nav-item"
            onClick={() => setIsMenuOpen(false)}
          >
            <i className="fas fa-box"></i>
            <span>PRODUITS</span>
          </Link>
          <Link
            href="/customers"
            className="mobile-nav-item"
            onClick={() => setIsMenuOpen(false)}
          >
            <i className="fas fa-users"></i>
            <span>CLIENTS</span>
          </Link>
          <Link
            href="/orders"
            className="mobile-nav-item"
            onClick={() => setIsMenuOpen(false)}
          >
            <i className="fas fa-shopping-bag"></i>
            <span>COMMANDES</span>
          </Link>
          {/* Website content link removed from mobile nav */}
        </nav>
      )}
    </header>
  );
};

export default Header;
