import React, { useState } from "react";

interface NavLink {
  label: string;
  labelEn: string;
  href: string;
}

interface HeaderProps {
  logoSrc?: string;
  logoAlt?: string;
  navLinks?: NavLink[];
  showAuthButtons?: boolean;
  onLoginClick?: () => void;
  onSignupClick?: () => void;
  t: (fr: string, en: string) => string;
}

const Header: React.FC<HeaderProps> = ({
  logoSrc = "/images/busstation.png",
  logoAlt = "BusStation",
  navLinks = [],
  showAuthButtons = true,
  onLoginClick,
  onSignupClick,
  t,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      window.location.href = "/login";
    }
  };

  const handleSignupClick = () => {
    if (onSignupClick) {
      onSignupClick();
    } else {
      window.location.href = "/signup";
    }
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <img src={logoSrc} alt={logoAlt} className="logo" />

          <nav className="nav-desktop">
            {navLinks.map((link, index) => (
              <a key={index} href={link.href} className="nav-link">
                {t(link.label, link.labelEn)}
              </a>
            ))}

            {showAuthButtons && (
              <>
                <button
                  onClick={handleLoginClick}
                  className="nav-link"
                  style={{ background: "none", padding: 0 }}
                >
                  {t("Connexion", "Sign in")}
                </button>
                <button onClick={handleSignupClick} className="btn btn-primary">
                  {t("S'inscrire", "Sign up")}
                </button>
              </>
            )}
          </nav>

          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={t("Menu", "Menu")}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {mobileMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="mobile-menu">
            {navLinks.map((link, index) => (
              <a key={index} href={link.href} className="mobile-menu-link">
                {t(link.label, link.labelEn)}
              </a>
            ))}

            {showAuthButtons && (
              <div className="mobile-menu-buttons">
                <button
                  onClick={handleLoginClick}
                  className="btn btn-secondary"
                  style={{ width: "100%" }}
                >
                  {t("Connexion", "Sign in")}
                </button>
                <button
                  onClick={handleSignupClick}
                  className="btn btn-primary"
                  style={{ width: "100%" }}
                >
                  {t("S'inscrire", "Sign up")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
