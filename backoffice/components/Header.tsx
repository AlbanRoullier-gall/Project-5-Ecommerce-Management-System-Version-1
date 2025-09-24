"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header>
      <div className="container-menu">
        <div className="container-brand">
          <h1 className="title">
            <Link href={isAuthenticated ? "/dashboard" : "/"}>
              NATURE DE PIERRE
            </Link>
          </h1>
          <Image
            className="logo logo-responsive"
            src="/images/logoNatureDePierreIcon.svg"
            alt="Logo Nature de Pierre"
            width={50}
            height={50}
          />
        </div>

        {/* Navigation and User Menu */}
        {isAuthenticated && user && (
          <nav className="header-nav">
            <div className="nav-links">
              <Link href="/dashboard" className="nav-link">
                <i className="fas fa-tachometer-alt"></i>
                <span>Dashboard</span>
              </Link>
              <Link href="/products" className="nav-link">
                <i className="fas fa-box"></i>
                <span>Produits</span>
              </Link>
            </div>

            <div className="user-menu">
              <button
                className="user-menu-button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                onBlur={() => setTimeout(() => setShowUserMenu(false), 200)}
              >
                <span className="user-name">
                  {user.firstName} {user.lastName}
                </span>
                <span className="user-role">({user.role})</span>
                <span className="dropdown-arrow">▼</span>
              </button>

              {showUserMenu && (
                <div className="user-menu-dropdown">
                  <button
                    onClick={handleLogout}
                    className="dropdown-item logout"
                  >
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
