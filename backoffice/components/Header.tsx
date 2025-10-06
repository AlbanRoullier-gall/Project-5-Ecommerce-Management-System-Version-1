"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

const Header: React.FC = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            <span>Dashboard</span>
          </Link>
          <Link href="/products" className="nav-item">
            <i className="fas fa-box"></i>
            <span>Produits</span>
          </Link>
          <Link href="/customers" className="nav-item">
            <i className="fas fa-users"></i>
            <span>Clients</span>
          </Link>
          <Link href="/orders" className="nav-item">
            <i className="fas fa-shopping-bag"></i>
            <span>Commandes</span>
          </Link>
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
            <span>Dashboard</span>
          </Link>
          <Link
            href="/products"
            className="mobile-nav-item"
            onClick={() => setIsMenuOpen(false)}
          >
            <i className="fas fa-box"></i>
            <span>Produits</span>
          </Link>
          <Link
            href="/customers"
            className="mobile-nav-item"
            onClick={() => setIsMenuOpen(false)}
          >
            <i className="fas fa-users"></i>
            <span>Clients</span>
          </Link>
          <Link
            href="/orders"
            className="mobile-nav-item"
            onClick={() => setIsMenuOpen(false)}
          >
            <i className="fas fa-shopping-bag"></i>
            <span>Commandes</span>
          </Link>
        </nav>
      )}
    </header>
  );
};

export default Header;
