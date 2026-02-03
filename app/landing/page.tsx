"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/providers";
import Header from "@/app/components/HeaderHome"
import Footer from "@/app/components/Footer"

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
  const { t } = useLanguage();

  const landingNavLinks = [
    { label: 'Fonctionnalités', labelEn: 'Features', href: '#features' },
    { label: 'Comment ça marche', labelEn: 'How it works', href: '#process' },
    { label: 'Nos chiffres', labelEn: 'Our numbers', href: '#stats' },
    { label: 'FAQ', labelEn: 'FAQ', href: '#faq' },
  ];

  useEffect(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <div className="page">
      {/* Header */}
      <Header 
        navLinks={landingNavLinks} 
        showAuthButtons={true}
        t={t} 
      />

      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              <span className="hero-badge">
                {t("Plateforme N°1 au Cameroun", "No.1 platform in Cameroon")}
              </span>
              <h1 className="hero-title">
                {t(
                  "Réservez vos voyages et pilotez vos agences en toute simplicité",
                  "Book your trips and manage your agencies with ease"
                )}
              </h1>
              <p className="hero-description">
                {t(
                  "Pour les voyageurs : réservez vos billets en ligne auprès des meilleures agences de transport avec paiement sécurisé et confirmation instantanée. Pour les professionnels : gérez vos agences, organisez vos trajets et suivez vos performances depuis un tableau de bord unifié.",
                  "For travelers: book your tickets online with the best transport agencies with secure payment and instant confirmation. For professionals: manage your agencies, organize your routes, and track performance from a unified dashboard."
                )}
              </p>
              <div className="hero-buttons">
                <button
                  onClick={() => router.push("/signup")}
                  className="btn btn-primary"
                >
                  {t("Créer un compte", "Create an account")}
                </button>
                <button
                  onClick={() => router.push("/login")}
                  className="btn btn-secondary"
                >
                  {t("Se connecter", "Sign in")}
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
                  <span>{t("Réservation en ligne 24/7", "Online booking 24/7")}</span>
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
                  <span>{t("Gestion complète d'agences", "Full agency management")}</span>
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
                  <span>{t("Paiement sécurisé SSL", "SSL secure payment")}</span>
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
                  <span>{t("Statistiques en temps réel", "Real-time analytics")}</span>
                </div>
              </div>
            </div>
            <div className="hero-image-container">
              <img
                src="/images/landing2.jpg"
                alt={t("Transport au Cameroun", "Transport in Cameroon")}
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
            <h2 className="section-title">
              {t("Pourquoi choisir BusStation ?", "Why choose BusStation?")}
            </h2>
            <p className="section-description">
              {t(
                "Une solution complète pour les voyageurs et les professionnels du transport",
                "A complete solution for travelers and transport professionals"
              )}
            </p>
          </div>

          <div className="features-split">
            <div className="features-column">
              <h3 className="features-column-title">
                {t("Pour les voyageurs", "For travelers")}
              </h3>
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
                      {t("Réservation simplifiée", "Simplified booking")}
                    </h4>
                  </div>
                  <p className="feature-item-text">
                    {t(
                      "Recherchez, comparez et réservez vos billets en quelques clics, 24h/24 et 7j/7 depuis n'importe quel appareil.",
                      "Search, compare and book your tickets in a few clicks, 24/7 from any device."
                    )}
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
                    <h4 className="feature-item-title">
                      {t("Paiement sécurisé", "Secure payment")}
                    </h4>
                  </div>
                  <p className="feature-item-text">
                    {t(
                      "Transactions protégées par cryptage SSL. Payez par carte bancaire ou Mobile Money en toute confiance.",
                      "Transactions protected by SSL encryption. Pay by card or Mobile Money with confidence."
                    )}
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
                      {t("Confirmation instantanée", "Instant confirmation")}
                    </h4>
                  </div>
                  <p className="feature-item-text">
                    {t(
                      "Recevez votre billet électronique par email immédiatement après le paiement. Plus de files d'attente aux gares.",
                      "Receive your e-ticket by email immediately after payment. No more waiting in line at stations."
                    )}
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
                    <h4 className="feature-item-title">
                      {t("Agences certifiées", "Certified agencies")}
                    </h4>
                  </div>
                  <p className="feature-item-text">
                    {t(
                      "Toutes nos agences partenaires sont vérifiées et notées par les utilisateurs pour garantir votre sécurité.",
                      "All partner agencies are verified and rated by users to ensure your safety."
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="features-column">
              <h3 className="features-column-title">
                {t("Pour les professionnels", "For professionals")}
              </h3>
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
                    <h4 className="feature-item-title">
                      {t("Gestion d'agence", "Agency management")}
                    </h4>
                  </div>
                  <p className="feature-item-text">
                    {t(
                      "Gérez votre flotte, vos trajets, vos tarifs et vos équipes depuis un tableau de bord unique et intuitif.",
                      "Manage your fleet, routes, pricing and teams from a single intuitive dashboard."
                    )}
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
                      {t("Organisation multi-sites", "Multi-site organization")}
                    </h4>
                  </div>
                  <p className="feature-item-text">
                    {t(
                      "Pilotez plusieurs agences simultanément avec des rôles et permissions personnalisés pour chaque membre.",
                      "Manage multiple agencies simultaneously with custom roles and permissions for each member."
                    )}
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
                    <h4 className="feature-item-title">
                      {t("Suivi financier", "Financial tracking")}
                    </h4>
                  </div>
                  <p className="feature-item-text">
                    {t(
                      "Consultez vos revenus en temps réel, gérez les remboursements et exportez vos rapports comptables.",
                      "View revenue in real time, manage refunds, and export accounting reports."
                    )}
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
                      {t("Statistiques détaillées", "Detailed statistics")}
                    </h4>
                  </div>
                  <p className="feature-item-text">
                    {t(
                      "Analysez vos performances avec des tableaux de bord avancés : taux de remplissage, trajets populaires, KPIs.",
                      "Analyze performance with advanced dashboards: occupancy rate, popular routes, KPIs."
                    )}
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
            <h2 className="section-title">
              {t("Comment ça marche ?", "How does it work?")}
            </h2>
            <p className="section-description">
              {t(
                "Réservez votre voyage en 4 étapes simples",
                "Book your trip in 4 simple steps"
              )}
            </p>
          </div>
          <div className="process-steps">
            <div className="process-step">
              <div className="step-number">1</div>
              <h3 className="step-title">
                {t("Recherchez", "Search")}
              </h3>
              <p className="step-description">
                {t(
                  "Saisissez votre ville de départ et d'arrivée, puis sélectionnez votre date de voyage.",
                  "Enter your departure and arrival cities, then select your travel date."
                )}
              </p>
            </div>

            <div className="process-step">
              <div className="step-number">2</div>
              <h3 className="step-title">
                {t("Comparez", "Compare")}
              </h3>
              <p className="step-description">
                {t(
                  "Consultez les horaires, prix et disponibilités des différentes agences de transport.",
                  "Check schedules, prices and availability of different transport agencies."
                )}
              </p>
            </div>

            <div className="process-step">
              <div className="step-number">3</div>
              <h3 className="step-title">
                {t("Réservez", "Book")}
              </h3>
              <p className="step-description">
                {t(
                  "Sélectionnez votre place, renseignez vos informations et procédez au paiement sécurisé.",
                  "Select your seat, enter your details and proceed to secure payment."
                )}
              </p>
            </div>

            <div className="process-step">
              <div className="step-number">4</div>
              <h3 className="step-title">
                {t("Voyagez", "Travel")}
              </h3>
              <p className="step-description">
                {t(
                  "Recevez votre billet électronique par email et présentez-le à l'embarquement.",
                  "Receive your e-ticket by email and present it at boarding."
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="section section-bg-primary">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              {t("BusStation en chiffres", "BusStation in numbers")}
            </h2>
            <p className="section-description">
              {t(
                "La confiance de milliers d'utilisateurs et de professionnels",
                "Trusted by thousands of users and professionals"
              )}
            </p>
          </div>
          <div className="stats-grid">
            <div>
              <div className="stat-value">50 000+</div>
              <div className="stat-label">
                {t("Voyageurs satisfaits", "Satisfied travelers")}
              </div>
            </div>
            <div>
              <div className="stat-value">100+</div>
              <div className="stat-label">
                {t("Agences partenaires", "Partner agencies")}
              </div>
            </div>
            <div>
              <div className="stat-value">20+</div>
              <div className="stat-label">
                {t("Villes desservies", "Cities served")}
              </div>
            </div>
            <div>
              <div className="stat-value">98%</div>
              <div className="stat-label">
                {t("Taux de satisfaction", "Satisfaction rate")}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              {t("Questions fréquentes", "Frequently asked questions")}
            </h2>
            <p className="section-description">
              {t("Tout ce que vous devez savoir", "Everything you need to know")}
            </p>
          </div>
          <div className="faq-container">
            <div className="faq-list">
              {[
                {
                  q: t("Comment réserver un billet ?", "How do I book a ticket?"),
                  a: t(
                    "Créez un compte, recherchez votre trajet, sélectionnez l'horaire qui vous convient et procédez au paiement. Vous recevrez votre billet par email immédiatement.",
                    "Create an account, search your route, select the schedule that suits you and proceed to payment. You will receive your ticket by email immediately."
                  ),
                },
                {
                  q: t(
                    "Quels moyens de paiement acceptez-vous ?",
                    "Which payment methods do you accept?"
                  ),
                  a: t(
                    "Nous acceptons les cartes bancaires (Visa, Mastercard), Mobile Money (MTN Mobile Money, Orange Money) et PayPal.",
                    "We accept bank cards (Visa, Mastercard), Mobile Money (MTN Mobile Money, Orange Money) and PayPal."
                  ),
                },
                {
                  q: t(
                    "Comment créer mon agence sur la plateforme ?",
                    "How do I create my agency on the platform?"
                  ),
                  a: t(
                    "Inscrivez-vous en tant que professionnel, remplissez les informations de votre agence et soumettez votre demande. Notre équipe validera votre profil sous 48h.",
                    "Sign up as a professional, fill in your agency information and submit your request. Our team will validate your profile within 48h."
                  ),
                },
                {
                  q: t(
                    "Puis-je gérer plusieurs agences avec un seul compte ?",
                    "Can I manage multiple agencies with a single account?"
                  ),
                  a: t(
                    "Oui, notre système d'organisation multi-sites vous permet de gérer plusieurs agences depuis un tableau de bord centralisé avec des rôles différenciés.",
                    "Yes, our multi-site organization system lets you manage multiple agencies from a centralized dashboard with differentiated roles."
                  ),
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
            <h2 className="section-title">
              {t("Prêt à démarrer ?", "Ready to get started?")}
            </h2>
            <p className="section-description">
              {t(
                "Rejoignez des milliers d'utilisateurs qui font confiance à BusStation",
                "Join thousands of users who trust BusStation"
              )}
            </p>
          </div>
          <div className="cta-buttons">
            <button
              onClick={() => router.push("/signup")}
              className="btn btn-white"
            >
              {t("Créer un compte gratuit", "Create a free account")}
            </button>
            <button
              onClick={() => router.push("/login")}
              className="btn btn-outline"
            >
              {t("Se connecter", "Sign in")}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer showDefaultSections={true} t={t} />
    </div>
  );
}
