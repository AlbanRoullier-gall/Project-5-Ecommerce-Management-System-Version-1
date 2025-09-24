"use client";

import React from "react";
import Link from "next/link";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

const Header: React.FC = () => {
  return (
    <header>
      <div className="container-menu">
        <div className="container-brand">
          <h1 className="title">
            <Link href="/">NATURE DE PIERRE</Link>
          </h1>
          <img
            className="logo logo-responsive"
            src="/images/logoNatureDePierreIcon.svg"
            alt="Logo Nature de Pierre"
            width={50}
            height={50}
          />
        </div>
        <nav className="menu">
          <ul>
            <li>
              <Link href="/#catalog">CATALOGUE</Link>
            </li>
            <li>
              <Link href="/philosophie">PHILOSOPHIE</Link>
            </li>
            <li>
              <Link href="/contact">CONTACT</Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="container-services">
        <div style={{ position: "relative", margin: 0, padding: 0 }}>
          <Link href="/cart">
            <ShoppingCartIcon className="w-12 h-12" />
            <span className="cart-count">0</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
