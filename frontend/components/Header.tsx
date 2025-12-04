"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import Hero from "./Hero";
import { useHeader } from "../hooks";

interface HeaderProps {
  hero?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ hero: customHero }) => {
  const { isMenuOpen, toggleMenu, closeMenu, itemCount, heroConfig } =
    useHeader();

  return (
    <>
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
          <button className="mobile-menu-btn" onClick={toggleMenu}>
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
              onClick={closeMenu}
            >
              <i className="fas fa-th-large"></i>
              <span>CATALOGUE</span>
            </Link>
            <Link
              href="/philosophy"
              className="mobile-nav-item"
              onClick={closeMenu}
            >
              <i className="fas fa-leaf"></i>
              <span>PHILOSOPHIE</span>
            </Link>
            <Link
              href="/contact"
              className="mobile-nav-item"
              onClick={closeMenu}
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
