import React from "react";
import Link from "next/link";

const Footer: React.FC = () => {
  return (
    <footer>
      <div className="social-network-logos">
        <a href="#" onClick={(e) => e.preventDefault()}>
          <i className="fab fa-facebook"></i>
        </a>
        <a href="#" onClick={(e) => e.preventDefault()}>
          <i className="fab fa-instagram"></i>
        </a>
        <a href="#" onClick={(e) => e.preventDefault()}>
          <i className="fab fa-linkedin"></i>
        </a>
        <a href="#" onClick={(e) => e.preventDefault()}>
          <i className="fab fa-twitter"></i>
        </a>
      </div>
      <div className="textuel">
        <Link href="/mentions-legales">Mentions légales</Link> |
        <Link href="/politique-confidentialite">
          {" "}
          Politique de confidentialité
        </Link>{" "}
        |<Link href="/conditions-generales"> Conditions générales</Link>
      </div>
    </footer>
  );
};

export default Footer;
