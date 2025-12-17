"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import Hero from "./Hero";
import styles from "../styles/components/Header.module.css";
import { useHeader } from "../hooks";

interface HeaderProps {
  hero?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ hero: customHero }) => {
  const { isMenuOpen, toggleMenu, closeMenu, itemCount, heroConfig } =
    useHeader();

  return (
    <>
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

          {/* Cart Section */}
          <div className={styles.cartSection}>
            <Link href="/cart" className={styles.cartLink}>
              <div className={styles.cartIconWrapper}>
                <i className={`fas fa-shopping-cart ${styles.cartIcon}`}></i>
                {itemCount > 0 && (
                  <span className={styles.cartCount}>{itemCount}</span>
                )}
              </div>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className={styles.mobileMenuBtn} onClick={toggleMenu}>
            <i
              className={`fas ${isMenuOpen ? "fa-times" : "fa-bars"} ${styles.mobileMenuIcon}`}
            ></i>
          </button>
        </div>

        {/* Desktop Navigation - Below Title */}
        <nav className={styles.desktopNav}>
          <div className={styles.navContainer}>
            <Link href="/#catalog" className={styles.navItem}>
              <i className={`fas fa-th-large ${styles.navIcon}`}></i>
              <span>CATALOGUE</span>
            </Link>
            <Link href="/philosophy" className={styles.navItem}>
              <i className={`fas fa-leaf ${styles.navIcon}`}></i>
              <span>PHILOSOPHIE</span>
            </Link>
            <Link href="/contact" className={styles.navItem}>
              <i className={`fas fa-envelope ${styles.navIcon}`}></i>
              <span>CONTACT</span>
            </Link>
          </div>
        </nav>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className={styles.mobileNav}>
            <Link
              href="/#catalog"
              className={styles.mobileNavItem}
              onClick={closeMenu}
            >
              <i className={`fas fa-th-large ${styles.mobileNavIcon}`}></i>
              <span>CATALOGUE</span>
            </Link>
            <Link
              href="/philosophy"
              className={styles.mobileNavItem}
              onClick={closeMenu}
            >
              <i className={`fas fa-leaf ${styles.mobileNavIcon}`}></i>
              <span>PHILOSOPHIE</span>
            </Link>
            <Link
              href="/contact"
              className={styles.mobileNavItem}
              onClick={closeMenu}
            >
              <i className={`fas fa-envelope ${styles.mobileNavIcon}`}></i>
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
