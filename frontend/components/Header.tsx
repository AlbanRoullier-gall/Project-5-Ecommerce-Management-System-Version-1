"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCart } from "../contexts/CartContext";
import Hero from "./Hero";

interface HeaderProps {
  hero?: React.ReactNode;
}

// Configuration des Hero par route
const HERO_CONFIG: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: "NATURE DE PIERRE",
    subtitle: "Découvrez notre collection exclusive de pierres naturelles",
  },
  "/philosophy": {
    title: "NOTRE PHILOSOPHIE",
    subtitle: "Une vision artisanale, durable et respectueuse de la nature.",
  },
  "/contact": {
    title: "CONTACTEZ-NOUS",
    subtitle: "Notre équipe est à votre disposition pour tous vos projets",
  },
};

const Header: React.FC<HeaderProps> = ({ hero: customHero }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const router = useRouter();

  // Détection automatique de la Hero selon la route
  const heroConfig = HERO_CONFIG[router.pathname];

  return (
    <>
      <header className="modern-header">
        <div className="header-container">
          <div className="brand-section">
            <Link href="/" className="brand-link">
              <img
                className="logo"
                src="/images/logoNatureDePierreIcon.svg"
                alt="Logo Nature de Pierre"
                width={50}
                height={50}
              />
              <span className="brand-text">NATURE DE PIERRE</span>
            </Link>
          </div>

          {/* Cart Section */}
          <div className="cart-section">
            <Link href="/cart" className="cart-link">
              <div className="cart-icon">
                <i className="fas fa-shopping-cart"></i>
                {itemCount > 0 && (
                  <span className="cart-count">{itemCount}</span>
                )}
              </div>
            </Link>
          </div>

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
            <Link href="/#catalog" className="nav-item">
              <i className="fas fa-th-large"></i>
              <span>CATALOGUE</span>
            </Link>
            <Link href="/philosophy" className="nav-item">
              <i className="fas fa-leaf"></i>
              <span>PHILOSOPHIE</span>
            </Link>
            <Link href="/contact" className="nav-item">
              <i className="fas fa-envelope"></i>
              <span>CONTACT</span>
            </Link>
          </div>
        </nav>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="mobile-nav">
            <Link
              href="/#catalog"
              className="mobile-nav-item"
              onClick={() => setIsMenuOpen(false)}
            >
              <i className="fas fa-th-large"></i>
              <span>CATALOGUE</span>
            </Link>
            <Link
              href="/philosophy"
              className="mobile-nav-item"
              onClick={() => setIsMenuOpen(false)}
            >
              <i className="fas fa-leaf"></i>
              <span>PHILOSOPHIE</span>
            </Link>
            <Link
              href="/contact"
              className="mobile-nav-item"
              onClick={() => setIsMenuOpen(false)}
            >
              <i className="fas fa-envelope"></i>
              <span>CONTACT</span>
            </Link>
          </nav>
        )}
      </header>
      {customHero
        ? customHero
        : heroConfig && (
            <Hero title={heroConfig.title} subtitle={heroConfig.subtitle} />
          )}
    </>
  );
};

export default Header;
