"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/providers";
import { RAW_FAQ_DATA } from "./faq-data";

/**
 * BusStation Help/FAQ Page - Redesigned
 * Professional help center matching landing page aesthetics
 * Uses system fonts configured in layout.tsx
 *
 * @author Redesigned to match landing page
 * @date 2025-01-29
 */

export default function ClientHelpPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [chatMessages, setChatMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const { t, language } = useLanguage();

  const categories = [
    { id: "all", name: t("Toutes", "All"), icon: "grid" },
    { id: "account", name: t("Compte", "Account"), icon: "user" },
    { id: "reservation", name: t("Réservations", "Bookings"), icon: "calendar" },
    { id: "payment", name: t("Paiements", "Payments"), icon: "credit-card" },
    { id: "travel", name: t("Voyages", "Trips"), icon: "bus" },
    { id: "agency", name: t("Agences", "Agencies"), icon: "building" },
    { id: "support", name: t("Support", "Support"), icon: "help" },
  ];

  const faqs = RAW_FAQ_DATA.map((faq) => ({
    id: faq.id,
    question: t(faq.question_fr, faq.question_en),
    answer: t(faq.answer_fr, faq.answer_en),
    category: faq.category,
  }));

  const handleSendChat = async () => {
    const trimmed = chatInput.trim();
    if (!trimmed || isChatLoading) return;

    const nextMessages = [
      ...chatMessages,
      { role: "user" as const, content: trimmed },
    ];

    setChatMessages(nextMessages);
    setChatInput("");
    setChatError("");
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/help-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: nextMessages.slice(-6),
          language,
        }),
      });

      if (!response.ok) {
        let detail = "";
        try {
          const err = await response.json();
          detail =
            err?.detail?.error?.message ||
            err?.detail?.message ||
            err?.error ||
            "";
        } catch {
          // ignore JSON parse errors
        }
        throw new Error(
          detail ||
            t("Impossible de joindre l'assistant", "Unable to reach the assistant")
        );
      }

      const data = await response.json();
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "" },
      ]);
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : t(
              "Une erreur est survenue, réessayez plus tard.",
              "An error occurred, please try again later."
            );
      setChatError(message);
    } finally {
      setIsChatLoading(false);
    }
  };

const filteredFAQs = faqs.filter((faq) => {
    const matchesCategory =
      selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: React.ReactElement } = {
      grid: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
      user: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      calendar: (
        <svg
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
      ),
      "credit-card": (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      ),
      bus: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5 11a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2" />
          <path d="M6 11V7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v4" />
          <circle cx="8.5" cy="16.5" r="1.5" />
          <circle cx="15.5" cy="16.5" r="1.5" />
        </svg>
      ),
      building: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
          <path d="M9 22v-4h6v4" />
          <path d="M8 6h.01" />
          <path d="M16 6h.01" />
          <path d="M12 6h.01" />
          <path d="M12 10h.01" />
          <path d="M12 14h.01" />
          <path d="M16 10h.01" />
          <path d="M16 14h.01" />
          <path d="M8 10h.01" />
          <path d="M8 14h.01" />
        </svg>
      ),
      help: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
      search: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      ),
      menu: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      ),
      x: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      ),
      mail: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      ),
      phone: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
      message: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    };
    return icons[iconName] || icons.help;
  };

  return (
    <>
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
                <a href="/landing" className="nav-link">
                  {t("Accueil", "Home")}
                </a>
                <a href="/contact" className="nav-link">
                  {t("Contact", "Contact")}
                </a>
                <button
                  onClick={() => router.push("/login")}
                  className="nav-link"
                  style={{ background: "none", padding: 0 }}
                >
                  {t("Connexion", "Sign in")}
                </button>
                <button
                  onClick={() => router.push("/signup")}
                  className="btn btn-primary"
                >
                  {t("S'inscrire", "Sign up")}
                </button>
              </nav>

              <button
                className="mobile-menu-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={t("Menu", "Menu")}
              >
                {mobileMenuOpen ? getIcon("x") : getIcon("menu")}
              </button>
            </div>

            {mobileMenuOpen && (
              <div className="mobile-menu">
                <a href="/landing" className="mobile-menu-link">
                  {t("Accueil", "Home")}
                </a>
                <a href="/contact" className="mobile-menu-link">
                  {t("Contact", "Contact")}
                </a>
                <div className="mobile-menu-buttons">
                  <button
                    onClick={() => router.push("/login")}
                    className="btn btn-secondary"
                    style={{ width: "100%" }}
                  >
                    {t("Connexion", "Sign in")}
                  </button>
                  <button
                    onClick={() => router.push("/signup")}
                    className="btn btn-primary"
                    style={{ width: "100%" }}
                  >
                    {t("S'inscrire", "Sign up")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Hero Contact */}
        <section className="hero-help">
          <div className="container">
            <div className="hero-help-content">
              <h1 className="hero-help-title">
                {t("Centre d'aide", "Help center")}
              </h1>
              <p className="hero-help-description">
                {t(
                  "Trouvez des réponses à vos questions fréquentes",
                  "Find answers to your most common questions"
                )}
              </p>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="categories-section">
          <div className="container">
            <div className="categories-wrapper">
              <div className="categories-list">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`category-btn ${selectedCategory === category.id ? "active" : ""}`}
                  >
                    <span className="category-icon">
                      {getIcon(category.icon)}
                    </span>
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="faq-section">
          <div className="container">
            {filteredFAQs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">{getIcon("search")}</div>
                <h3 className="empty-title">
                  {t("Aucun résultat trouvé", "No results found")}
                </h3>
                <p className="empty-description">
                  {t(
                    "Essayez avec d'autres mots-clés ou sélectionnez une autre catégorie",
                    "Try different keywords or select another category"
                  )}
                </p>
              </div>
            ) : (
              <div className="faq-list">
                {filteredFAQs.map((faq, index) => (
                  <div key={faq.id} className="faq-item">
                    <button
                      className="faq-question"
                      onClick={() =>
                        setActiveQuestion(
                          activeQuestion === index ? null : index,
                        )
                      }
                    >
                      <span>{faq.question}</span>
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
                      <div className="faq-answer">{faq.answer}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Chatbot */}
        <section className="faq-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">
                {t("Assistant d'aide", "Help assistant")}
              </h2>
              <p className="section-description">
                {t(
                  "Posez une question et l'assistant répond à partir des FAQ.",
                  "Ask a question and the assistant answers based on the FAQs."
                )}
              </p>
            </div>

            <div className="chatbot-card">
              <div className="chatbot-messages">
                {chatMessages.length === 0 ? (
                  <div className="chatbot-empty">
                    {t(
                      "Bonjour ! Posez votre question sur l'utilisation de BusStation.",
                      "Hi! Ask your question about using BusStation."
                    )}
                  </div>
                ) : (
                  chatMessages.map((msg, index) => (
                    <div
                      key={`${msg.role}-${index}`}
                      className={`chatbot-message ${msg.role}`}
                    >
                      <div className="chatbot-bubble">{msg.content}</div>
                    </div>
                  ))
                )}
                {isChatLoading && (
                  <div className="chatbot-message assistant">
                    <div className="chatbot-bubble">
                      {t(
                        "Assistant en train de répondre...",
                        "Assistant is typing..."
                      )}
                    </div>
                  </div>
                )}
              </div>

              {chatError && (
                <div className="chatbot-error">{chatError}</div>
              )}

              <div className="chatbot-input">
                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendChat();
                    }
                  }}
                  placeholder={t(
                    "Ex: Comment réserver un billet ?",
                    "e.g., How do I book a ticket?"
                  )}
                  rows={2}
                />
                <button
                  type="button"
                  onClick={handleSendChat}
                  disabled={isChatLoading || !chatInput.trim()}
                >
                  {t("Envoyer", "Send")}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="contact-section">
          <div className="container">
            <div className="contact-content">
              <div className="section-header">
                <h2 className="section-title">
                  {t(
                    "Besoin d'une aide personnalisée ?",
                    "Need personalized help?"
                  )}
                </h2>
                <p className="section-description">
                  {t(
                    "Notre équipe est là pour vous accompagner",
                    "Our team is here to assist you"
                  )}
                </p>
              </div>

              <div className="contact-info">
                <div className="contact-item">
                  <div className="contact-item-icon">{getIcon("mail")}</div>
                  <div className="contact-item-content">
                    <div className="contact-item-label">
                      {t("Support", "Support")}
                    </div>
                    <div className="contact-item-value">
                      bryanngoupeyou9@gmail.com
                    </div>
                    <div className="contact-item-note">
                      {t("Réponse sous 24h", "Reply within 24h")}
                    </div>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-item-icon">{getIcon("phone")}</div>
                  <div className="contact-item-content">
                    <div className="contact-item-label">
                      {t("Contact", "Contact")}
                    </div>
                    <div className="contact-item-value">
                      (+237) 655 12 10 10
                    </div>
                    <div className="contact-item-note">
                      {t(
                        "De Lundi à Vendredi 8h-18h",
                        "Monday to Friday 8am-6pm"
                      )}
                    </div>
                  </div>
                </div>

                <div className="contact-cta">
                  <p className="contact-cta-text">
                    {t(
                      "Pour toute demande spécifique ou question détaillée",
                      "For any specific request or detailed question"
                    )}
                  </p>
                  <button
                    onClick={() => router.push("/contact")}
                    className="btn btn-primary"
                  >
                    {t("Contactez le service client", "Contact customer service")}
                  </button>
                </div>
              </div>
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
                  {t(
                    "La plateforme de réservation de voyages la plus simple du Cameroun. Voyagez en toute sérénité.",
                    "The simplest travel booking platform in Cameroon. Travel with peace of mind."
                  )}
                </p>
              </div>
              <div>
                <h4 className="footer-title">{t("Produit", "Product")}</h4>
                <ul className="footer-links">
                  <li>
                    <a href="/landing#features" className="footer-link">
                      {t("Fonctionnalités", "Features")}
                    </a>
                  </li>
                  <li>
                    <a href="/landing#process" className="footer-link">
                      {t("Comment ça marche", "How it works")}
                    </a>
                  </li>
                  <li>
                    <a href="/landing#stats" className="footer-link">
                      {t("Nos chiffres", "Our numbers")}
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="footer-title">{t("Entreprise", "Company")}</h4>
                <ul className="footer-links">
                  <li>
                    <a href="#" className="footer-link">
                      {t("À propos", "About")}
                    </a>
                  </li>
                  <li>
                    <a href="#" className="footer-link">
                      {t("Agences", "Agencies")}
                    </a>
                  </li>
                  <li>
                    <a href="#" className="footer-link">
                      {t("Blog", "Blog")}
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="footer-title">{t("Support", "Support")}</h4>
                <ul className="footer-links">
                  <li>
                    <a href="/help" className="footer-link">
                      {t("Centre d'aide", "Help center")}
                    </a>
                  </li>
                  <li>
                    <a href="/contact" className="footer-link">
                      {t("Contact", "Contact")}
                    </a>
                  </li>
                  <li>
                    <a href="/landing#faq" className="footer-link">
                      FAQ
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="footer-bottom">
              <div>
                {t(
                  "© 2025 BusStation. Tous droits réservés.",
                  "© 2025 BusStation. All rights reserved."
                )}
              </div>
              <div className="footer-legal">
                <a href="#" className="footer-link">
                  {t("Mentions légales", "Legal notice")}
                </a>
                <a href="#" className="footer-link">
                  {t("Confidentialité", "Privacy")}
                </a>
                <a href="#" className="footer-link">
                  {t("CGU", "Terms")}
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
