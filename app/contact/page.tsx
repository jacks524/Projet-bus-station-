"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/providers";
import SuccessModal from "@/app/components/SuccessModal";
import ErrorModal from "@/app/components/ErrorModal";

/**
 * BusStation Contact Page
 * Professional contact page matching landing page aesthetics
 *
 * @author Félix DJOTIO NDIE
 * @date 2025-01-29
 */

interface ContactFormData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  sujet: string;
  message: string;
}

export default function ContactPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { t } = useLanguage();

  const [formData, setFormData] = useState<ContactFormData>({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    sujet: "",
    message: "",
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const SUBJECTS = [
    t("Question générale", "General question"),
    t("Problème de réservation", "Booking issue"),
    t("Problème de paiement", "Payment issue"),
    t("Annulation/Remboursement", "Cancellation/Refund"),
    t("Problème technique", "Technical issue"),
    t("Partenariat", "Partnership"),
    t("Suggestion d'amélioration", "Improvement suggestion"),
    t("Autre", "Other"),
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const emailData = {
        subject: `[BusStation Contact] ${formData.sujet}`,
        senderName: `${formData.prenom} ${formData.nom}`,
        senderEmail: formData.email,
        senderPhone: formData.telephone || "",
        message: formData.message,
      };

      const response = await fetch(`${API_BASE_URL}/contact/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        throw new Error(
          t("Erreur lors de l'envoi du message", "Error sending the message"),
        );
      }

      setShowSuccessModal(true);
      setFormData({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        sujet: "",
        message: "",
      });
    } catch (error: any) {
      console.error("Contact Error:", error);
      setErrorMessage(
        t(
          "Une erreur est survenue lors de l'envoi du message. Veuillez réessayer.",
          "An error occurred while sending the message. Please try again."
        ),
      );
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.nom.trim() &&
      formData.prenom.trim() &&
      formData.email.trim() &&
      formData.sujet &&
      formData.message.trim().length >= 10
    );
  };

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
              <a href="/landing" className="nav-link">
                {t("Accueil", "Home")}
              </a>
              <a href="/help" className="nav-link">
                {t("Centre d'aide", "Help center")}
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
              <a href="/landing" className="mobile-menu-link">
                {t("Accueil", "Home")}
              </a>
              <a href="/help" className="mobile-menu-link">
                {t("Centre d'aide", "Help center")}
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
              {t("Besoin d'aide ?", "Need help?")}
            </h1>
            <p className="hero-help-description">
              {t(
                "Écrivez-nous, nous sommes là pour vous accompagner",
                "Write to us, we are here to help"
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="container">
          <div className="contact-content">
            {/* Contact Information */}
            <div className="contact-info">
              <div className="contact-item">
                <div className="contact-item-icon">
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
                </div>
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
                <div className="contact-item-icon">
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
                </div>
                <div className="contact-item-content">
                  <div className="contact-item-label">
                    {t("Contact", "Contact")}
                  </div>
                  <div className="contact-item-value">(+237) 655 12 10 10</div>
                  <div className="contact-item-note">
                    {t(
                      "De Lundi à Vendredi 8h-18h",
                      "Monday to Friday 8am-6pm"
                    )}
                  </div>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-item-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div className="contact-item-content">
                  <div className="contact-item-label">
                    {t("Adresse", "Address")}
                  </div>
                  <div className="contact-item-value">
                    {t(
                      "Pharmacie EMIA, Rte de Melen, Yaoundé Cameroun",
                      "Pharmacie EMIA, Rte de Melen, Yaounde Cameroon"
                    )}
                  </div>
                  <div className="contact-item-note">
                    {t("Siège social", "Head office")}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-container">
              <div className="contact-form-header">
                <h2 className="contact-form-title">
                  {t("Envoyez-nous un message", "Send us a message")}
                </h2>
                <p className="contact-form-description">
                  {t(
                    "Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais",
                    "Fill out the form below and we will get back to you as soon as possible"
                  )}
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Nom et Prénom */}
                <div className="form-row">
                  <div>
                    <label className="form-label">
                      {t("Nom *", "Last name *")}
                    </label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder={t("Votre nom", "Your last name")}
                    />
                  </div>

                  <div>
                    <label className="form-label">
                      {t("Prénom *", "First name *")}
                    </label>
                    <input
                      type="text"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder={t("Votre prénom", "Your first name")}
                    />
                  </div>
                </div>

                {/* Email et Téléphone */}
                <div className="form-row">
                  <div>
                    <label className="form-label">{t("Email *", "Email *")}</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder={t("exemple@email.com", "example@email.com")}
                    />
                  </div>

                  <div>
                    <label className="form-label">{t("Téléphone", "Phone")}</label>
                    <input
                      type="tel"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder={t("+237 6XX XX XX XX", "+237 6XX XX XX XX")}
                    />
                  </div>
                </div>

                {/* Sujet */}
                <div className="form-group">
                  <label className="form-label">{t("Sujet *", "Subject *")}</label>
                  <select
                    name="sujet"
                    value={formData.sujet}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="">{t("Sélectionnez un sujet", "Select a subject")}</option>
                    {SUBJECTS.map((subject, index) => (
                      <option key={index} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div className="form-group">
                  <label className="form-label">{t("Message *", "Message *")}</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="form-textarea"
                    placeholder={t(
                      "Décrivez votre demande en détail...",
                      "Describe your request in detail..."
                    )}
                  />
                  <p className="form-helper-text">
                    {t(
                      `${formData.message.length} / 10 caractères minimum`,
                      `${formData.message.length} / 10 characters minimum`
                    )}
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !isFormValid()}
                  className={`btn btn-primary btn-full-width ${
                    isSubmitting || !isFormValid() ? "btn-disabled" : ""
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner" />
                      <span>{t("Envoi en cours...", "Sending...")}</span>
                    </>
                  ) : (
                    <>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                      <span>{t("Envoyer le message", "Send message")}</span>
                    </>
                  )}
                </button>

                <p className="form-footer-text">
                  {t(
                    "En envoyant ce message, vous acceptez notre politique de confidentialité",
                    "By sending this message, you accept our privacy policy"
                  )}
                </p>
              </form>
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
                  "La plateforme de réservation et de gestion d'agences de transport la plus complète du Cameroun.",
                  "The most complete booking and transport agency management platform in Cameroon."
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
                    {t("Devenir partenaire", "Become a partner")}
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

      {/* Success Modal */}
      <SuccessModal
        show={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push("/landing");
        }}
        title={t("Message envoyé", "Message sent")}
        message={t(
          "Nous vous répondrons dans les plus brefs délais.",
          "We will get back to you as soon as possible."
        )}
        buttonText={t("OK", "OK")}
      />

      {/* Error Modal */}
      <ErrorModal
        show={showErrorModal}
        onClose={() => {
          setShowErrorModal(false);
          setErrorMessage("");
        }}
        message={errorMessage}
        buttonText={t("Réessayer", "Try again")}
      />
    </div>
  );
}
