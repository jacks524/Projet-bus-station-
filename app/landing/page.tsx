"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * BusStation Landing Page - Updated
 * Professional transport booking and agency management platform
 *
 * @author Félix DJOTIO NDIE
 * @date 2025-01-29
 */

export default function BusStationLanding() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <div className="page">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <img
              src="/images/busstation.png"
              alt="BusStation"
              className="logo"
            />

            <nav className="nav-desktop">
              <a href="#features" className="nav-link">
                Fonctionnalités
              </a>
              <a href="#process" className="nav-link">
                Comment ça marche
              </a>
              <a href="#stats" className="nav-link">
                Nos chiffres
              </a>
              <a href="#faq" className="nav-link">
                FAQ
              </a>
              <button
                onClick={() => router.push("/login")}
                className="nav-link"
                style={{ background: "none", padding: 0 }}
              >
                Connexion
              </button>
              <button
                onClick={() => router.push("/signup")}
                className="btn btn-primary"
              >
                S'inscrire
              </button>
            </nav>

            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
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
              <a href="#features" className="mobile-menu-link">
                Fonctionnalités
              </a>
              <a href="#process" className="mobile-menu-link">
                Comment ça marche
              </a>
              <a href="#stats" className="mobile-menu-link">
                Nos chiffres
              </a>
              <a href="#faq" className="mobile-menu-link">
                FAQ
              </a>
              <div className="mobile-menu-buttons">
                <button
                  onClick={() => router.push("/login")}
                  className="btn btn-secondary"
                  style={{ width: "100%" }}
                >
                  Connexion
                </button>
                <button
                  onClick={() => router.push("/signup")}
                  className="btn btn-primary"
                  style={{ width: "100%" }}
                >
                  S'inscrire
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              <span className="hero-badge">Plateforme N°1 au Cameroun</span>
              <h1 className="hero-title">
                Réservez vos voyages et pilotez vos agences en toute simplicité
              </h1>
              <p className="hero-description">
                Pour les voyageurs : réservez vos billets en ligne auprès des
                meilleures agences de transport avec paiement sécurisé et
                confirmation instantanée. Pour les professionnels : gérez vos
                agences, organisez vos trajets et suivez vos performances depuis
                un tableau de bord unifié.
              </p>
              <div className="hero-buttons">
                <button
                  onClick={() => router.push("/signup")}
                  className="btn btn-primary"
                >
                  Créer un compte
                </button>
                <button
                  onClick={() => router.push("/login")}
                  className="btn btn-secondary"
                >
                  Se connecter
                </button>
              </div>
              <div className="hero-features">
                <div className="hero-feature">
                  <svg
                    className="check-icon"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Réservation en ligne 24/7</span>
                </div>
                <div className="hero-feature">
                  <svg
                    className="check-icon"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Gestion complète d'agences</span>
                </div>
                <div className="hero-feature">
                  <svg
                    className="check-icon"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Paiement sécurisé SSL</span>
                </div>
                <div className="hero-feature">
                  <svg
                    className="check-icon"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Statistiques en temps réel</span>
                </div>
              </div>
            </div>
            <div className="hero-image-container">
              <img
                src="/images/landing2.jpg"
                alt="Transport au Cameroun"
                className="hero-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Pourquoi choisir BusStation ?</h2>
            <p className="section-description">
              Une solution complète pour les voyageurs et les professionnels du
              transport
            </p>
          </div>

          <div className="features-split">
            <div className="features-column">
              <h3 className="features-column-title">Pour les voyageurs</h3>
              <div className="feature-list">
                <div className="feature-item">
                  <div className="feature-item-header">
                    <svg
                      className="feature-item-icon"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <h4 className="feature-item-title">
                      Réservation simplifiée
                    </h4>
                  </div>
                  <p className="feature-item-text">
                    Recherchez, comparez et réservez vos billets en quelques
                    clics, 24h/24 et 7j/7 depuis n'importe quel appareil.
                  </p>
                </div>

                <div className="feature-item">
                  <div className="feature-item-header">
                    <svg
                      className="feature-item-icon"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <h4 className="feature-item-title">Paiement sécurisé</h4>
                  </div>
                  <p className="feature-item-text">
                    Transactions protégées par cryptage SSL. Payez par carte
                    bancaire ou Mobile Money en toute confiance.
                  </p>
                </div>

                <div className="feature-item">
                  <div className="feature-item-header">
                    <svg
                      className="feature-item-icon"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <h4 className="feature-item-title">
                      Confirmation instantanée
                    </h4>
                  </div>
                  <p className="feature-item-text">
                    Recevez votre billet électronique par email immédiatement
                    après le paiement. Plus de files d'attente aux gares.
                  </p>
                </div>

                <div className="feature-item">
                  <div className="feature-item-header">
                    <svg
                      className="feature-item-icon"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <h4 className="feature-item-title">Agences certifiées</h4>
                  </div>
                  <p className="feature-item-text">
                    Toutes nos agences partenaires sont vérifiées et notées par
                    les utilisateurs pour garantir votre sécurité.
                  </p>
                </div>
              </div>
            </div>

            <div className="features-column">
              <h3 className="features-column-title">Pour les professionnels</h3>
              <div className="feature-list">
                <div className="feature-item">
                  <div className="feature-item-header">
                    <svg
                      className="feature-item-icon"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                      <path d="M9 22v-4h6v4" />
                      <path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
                    </svg>
                    <h4 className="feature-item-title">Gestion d'agence</h4>
                  </div>
                  <p className="feature-item-text">
                    Gérez votre flotte, vos trajets, vos tarifs et vos équipes
                    depuis un tableau de bord unique et intuitif.
                  </p>
                </div>

                <div className="feature-item">
                  <div className="feature-item-header">
                    <svg
                      className="feature-item-icon"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                      <line x1="12" y1="22.08" x2="12" y2="12" />
                    </svg>
                    <h4 className="feature-item-title">
                      Organisation multi-sites
                    </h4>
                  </div>
                  <p className="feature-item-text">
                    Pilotez plusieurs agences simultanément avec des rôles et
                    permissions personnalisés pour chaque membre.
                  </p>
                </div>

                <div className="feature-item">
                  <div className="feature-item-header">
                    <svg
                      className="feature-item-icon"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                    <h4 className="feature-item-title">Suivi financier</h4>
                  </div>
                  <p className="feature-item-text">
                    Consultez vos revenus en temps réel, gérez les
                    remboursements et exportez vos rapports comptables.
                  </p>
                </div>

                <div className="feature-item">
                  <div className="feature-item-header">
                    <svg
                      className="feature-item-icon"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 3v18h18" />
                      <path d="m19 9-5 5-4-4-3 3" />
                    </svg>
                    <h4 className="feature-item-title">
                      Statistiques détaillées
                    </h4>
                  </div>
                  <p className="feature-item-text">
                    Analysez vos performances avec des tableaux de bord avancés
                    : taux de remplissage, trajets populaires, KPIs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="section section-bg-gray">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Comment ça marche ?</h2>
            <p className="section-description">
              Réservez votre voyage en 4 étapes simples
            </p>
          </div>
          <div className="process-steps">
            <div className="process-step">
              <div className="step-number">1</div>
              <h3 className="step-title">Recherchez</h3>
              <p className="step-description">
                Saisissez votre ville de départ et d'arrivée, puis sélectionnez
                votre date de voyage.
              </p>
            </div>

            <div className="process-step">
              <div className="step-number">2</div>
              <h3 className="step-title">Comparez</h3>
              <p className="step-description">
                Consultez les horaires, prix et disponibilités des différentes
                agences de transport.
              </p>
            </div>

            <div className="process-step">
              <div className="step-number">3</div>
              <h3 className="step-title">Réservez</h3>
              <p className="step-description">
                Sélectionnez votre place, renseignez vos informations et
                procédez au paiement sécurisé.
              </p>
            </div>

            <div className="process-step">
              <div className="step-number">4</div>
              <h3 className="step-title">Voyagez</h3>
              <p className="step-description">
                Recevez votre billet électronique par email et présentez-le à
                l'embarquement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="section section-bg-primary">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">BusStation en chiffres</h2>
            <p className="section-description">
              La confiance de milliers d'utilisateurs et de professionnels
            </p>
          </div>
          <div className="stats-grid">
            <div>
              <div className="stat-value">50 000+</div>
              <div className="stat-label">Voyageurs satisfaits</div>
            </div>
            <div>
              <div className="stat-value">100+</div>
              <div className="stat-label">Agences partenaires</div>
            </div>
            <div>
              <div className="stat-value">20+</div>
              <div className="stat-label">Villes desservies</div>
            </div>
            <div>
              <div className="stat-value">98%</div>
              <div className="stat-label">Taux de satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Questions fréquentes</h2>
            <p className="section-description">Tout ce que vous devez savoir</p>
          </div>
          <div className="faq-container">
            <div className="faq-list">
              {[
                {
                  q: "Comment réserver un billet ?",
                  a: "Créez un compte, recherchez votre trajet, sélectionnez l'horaire qui vous convient et procédez au paiement. Vous recevrez votre billet par email immédiatement.",
                },
                {
                  q: "Quels moyens de paiement acceptez-vous ?",
                  a: "Nous acceptons les cartes bancaires (Visa, Mastercard), Mobile Money (MTN Mobile Money, Orange Money) et PayPal.",
                },
                {
                  q: "Comment créer mon agence sur la plateforme ?",
                  a: "Inscrivez-vous en tant que professionnel, remplissez les informations de votre agence et soumettez votre demande. Notre équipe validera votre profil sous 48h.",
                },
                {
                  q: "Puis-je gérer plusieurs agences avec un seul compte ?",
                  a: "Oui, notre système d'organisation multi-sites vous permet de gérer plusieurs agences depuis un tableau de bord centralisé avec des rôles différenciés.",
                },
              ].map((faq, index) => (
                <div key={index} className="faq-item">
                  <button
                    className="faq-question"
                    onClick={() =>
                      setActiveQuestion(activeQuestion === index ? null : index)
                    }
                  >
                    <span>{faq.q}</span>
                    <svg
                      className={`faq-icon ${
                        activeQuestion === index ? "open" : ""
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  {activeQuestion === index && (
                    <div className="faq-answer">{faq.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section section-bg-primary">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Prêt à démarrer ?</h2>
            <p className="section-description">
              Rejoignez des milliers d'utilisateurs qui font confiance à
              BusStation
            </p>
          </div>
          <div className="cta-buttons">
            <button
              onClick={() => router.push("/signup")}
              className="btn btn-white"
            >
              Créer un compte gratuit
            </button>
            <button
              onClick={() => router.push("/login")}
              className="btn btn-outline"
            >
              Se connecter
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <img
                src="/images/busstation.png"
                alt="BusStation"
                className="footer-logo"
              />
              <p className="footer-description">
                La plateforme de réservation et de gestion d'agences de
                transport la plus complète du Cameroun.
              </p>
            </div>
            <div>
              <h4 className="footer-title">Produit</h4>
              <ul className="footer-links">
                <li>
                  <a href="#features" className="footer-link">
                    Fonctionnalités
                  </a>
                </li>
                <li>
                  <a href="#process" className="footer-link">
                    Comment ça marche
                  </a>
                </li>
                <li>
                  <a href="#stats" className="footer-link">
                    Nos chiffres
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="footer-title">Entreprise</h4>
              <ul className="footer-links">
                <li>
                  <a href="#" className="footer-link">
                    À propos
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    Devenir partenaire
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="footer-title">Support</h4>
              <ul className="footer-links">
                <li>
                  <a href="/help" className="footer-link">
                    Centre d'aide
                  </a>
                </li>
                <li>
                  <a href="/contact" className="footer-link">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#faq" className="footer-link">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <div>© 2025 BusStation. Tous droits réservés.</div>
            <div className="footer-legal">
              <a href="#" className="footer-link">
                Mentions légales
              </a>
              <a href="#" className="footer-link">
                Confidentialité
              </a>
              <a
                onClick={() =>
                  window.open(
                    "https://www.termsfeed.com/live/2b6bd548-23a3-47e6-aee9-0e5dd0edb278",
                    "_blank",
                  )
                }
                className="footer-link"
              >
                CGU
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
