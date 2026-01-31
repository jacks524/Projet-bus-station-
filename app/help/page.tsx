"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

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
  

  const categories = [
    { id: "all", name: "Toutes", icon: "grid" },
    { id: "account", name: "Compte", icon: "user" },
    { id: "reservation", name: "Réservations", icon: "calendar" },
    { id: "payment", name: "Paiements", icon: "credit-card" },
    { id: "travel", name: "Voyages", icon: "bus" },
    { id: "agency", name: "Agences", icon: "building" },
    { id: "support", name: "Support", icon: "help" },
  ];

  const faqs = [
    // Compte et connexion
    {
      id: 1,
      question: "Comment créer un compte sur BusStation ?",
      answer:
        "Pour créer un compte, cliquez sur le bouton 'S'inscrire' en haut de la page d'accueil. Remplissez le formulaire avec vos informations personnelles (nom, prénom, email, numéro de téléphone). Vous recevrez un email de confirmation pour activer votre compte.",
      category: "account",
    },
    {
      id: 2,
      question: "J'ai oublié mon mot de passe, que faire ?",
      answer:
        "Cliquez sur 'Mot de passe oublié' sur la page de connexion. Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe. Suivez les instructions dans l'email pour créer un nouveau mot de passe.",
      category: "account",
    },
    {
      id: 3,
      question: "Comment modifier mes informations personnelles ?",
      answer:
        "Connectez-vous à votre compte, puis accédez à 'Mes paramètres' dans le menu. Vous pouvez modifier votre nom, prénom, email, numéro de téléphone et adresse. N'oubliez pas de sauvegarder vos modifications.",
      category: "account",
    },
    {
      id: 4,
      question: "Est-ce que mes données personnelles sont sécurisées ?",
      answer:
        "Oui, nous utilisons les dernières technologies de cryptage pour protéger vos données personnelles. Vos informations sont stockées de manière sécurisée et ne sont jamais partagées avec des tiers sans votre consentement.",
      category: "account",
    },
    // Réservations
    {
      id: 5,
      question: "Comment réserver un billet de voyage ?",
      answer:
        "Allez dans la section 'Réserver', sélectionnez votre ville de départ et d'arrivée, choisissez la date de voyage. Parcourez les voyages disponibles, sélectionnez celui qui vous convient, choisissez vos places et remplissez les informations des passagers. Confirmez votre réservation et procédez au paiement.",
      category: "reservation",
    },
    {
      id: 6,
      question: "Puis-je choisir ma place dans le bus ?",
      answer:
        "Oui, lors de la réservation, vous aurez accès à un plan des places du bus. Les places disponibles sont affichées en blanc, les places déjà réservées en rouge, et vos sélections en vert. Cliquez sur les places que vous souhaitez réserver.",
      category: "reservation",
    },
    {
      id: 7,
      question: "Comment annuler ou modifier ma réservation ?",
      answer:
        "Pour annuler ou modifier une réservation, allez dans 'Mes réservations', sélectionnez la réservation concernée et cliquez sur 'Annuler' ou 'Modifier'. Notez que des frais d'annulation peuvent s'appliquer selon les conditions de l'agence et le délai d'annulation.",
      category: "reservation",
    },
    {
      id: 8,
      question: "Quel est le délai maximum pour annuler une réservation ?",
      answer:
        "Le délai d'annulation varie selon l'agence et la classe de voyage. Généralement, vous pouvez annuler jusqu'à 24-48 heures avant le départ. Consultez les conditions d'annulation spécifiques à votre réservation dans la section 'Mes réservations'.",
      category: "reservation",
    },
    {
      id: 9,
      question: "Puis-je réserver pour plusieurs passagers ?",
      answer:
        "Oui, lors de la sélection des places, vous pouvez choisir plusieurs sièges. Vous devrez ensuite renseigner les informations de chaque passager (nom, prénom, numéro de pièce d'identité, âge).",
      category: "reservation",
    },
    // Paiements
    {
      id: 10,
      question: "Quels sont les moyens de paiement acceptés ?",
      answer:
        "Nous acceptons les paiements par Mobile Money (MTN Mobile Money, Orange Money), ainsi que les cartes bancaires Visa et Mastercard. Le paiement est sécurisé et vos informations bancaires sont protégées.",
      category: "payment",
    },
    {
      id: 11,
      question: "Mon paiement a échoué, que faire ?",
      answer:
        "Si votre paiement échoue, vérifiez d'abord que vous avez suffisamment de fonds. Assurez-vous que vos informations de paiement sont correctes. Si le problème persiste, contactez notre support client ou essayez avec un autre moyen de paiement.",
      category: "payment",
    },
    {
      id: 12,
      question: "Puis-je obtenir un remboursement ?",
      answer:
        "Les remboursements sont possibles selon les conditions d'annulation de chaque agence. Si vous annulez dans les délais autorisés, vous serez remboursé selon le taux d'annulation applicable. Le remboursement est généralement effectué sous 5-10 jours ouvrables.",
      category: "payment",
    },
    {
      id: 13,
      question: "Où puis-je trouver ma facture ?",
      answer:
        "Après avoir effectué un paiement, vous pouvez télécharger votre facture depuis la section 'Mes billets' ou 'Historique'. Cliquez sur le voyage concerné et sélectionnez 'Télécharger la facture'.",
      category: "payment",
    },
    // Voyages
    {
      id: 14,
      question: "Comment puis-je suivre mon voyage en temps réel ?",
      answer:
        "Une fois votre billet confirmé, vous recevrez des notifications sur l'état de votre voyage. Vous pouvez également consulter les détails dans 'Mes billets' pour voir l'heure de départ prévue et toute mise à jour en temps réel.",
      category: "travel",
    },
    {
      id: 15,
      question: "Que dois-je faire le jour du voyage ?",
      answer:
        "Présentez-vous au point de départ au moins 30 minutes avant l'heure de départ. Munissez-vous de votre billet (version numérique ou imprimée) et d'une pièce d'identité valide. Le chauffeur vérifiera votre billet avant l'embarquement.",
      category: "travel",
    },
    {
      id: 16,
      question: "Puis-je emporter des bagages ?",
      answer:
        "Oui, chaque passager peut emporter des bagages. Le nombre et le poids autorisés dépendent de la classe de voyage et de l'agence. Généralement, 1 à 2 bagages de 20-25 kg sont autorisés. Consultez les détails lors de la réservation.",
      category: "travel",
    },
    {
      id: 17,
      question: "Que se passe-t-il si j'arrive en retard ?",
      answer:
        "Si vous arrivez après l'heure de départ, le bus ne vous attendra pas et votre billet sera considéré comme non utilisé. Nous vous recommandons d'arriver au moins 30 minutes à l'avance pour éviter tout problème.",
      category: "travel",
    },
    // Agences
    {
      id: 18,
      question: "Comment choisir une agence de confiance ?",
      answer:
        "Toutes les agences sur BusStation sont validées par notre équipe. Vous pouvez consulter les avis et notes laissés par d'autres voyageurs. Vérifiez également les équipements proposés (WiFi, climatisation, toilettes) et les conditions d'annulation avant de réserver.",
      category: "agency",
    },
    {
      id: 19,
      question: "Comment contacter une agence de voyage ?",
      answer:
        "Les coordonnées de chaque agence (téléphone, email, réseaux sociaux) sont disponibles dans la fiche détaillée du voyage. Vous pouvez les contacter directement pour toute question spécifique concernant votre réservation.",
      category: "agency",
    },
    {
      id: 20,
      question: "Puis-je créer ma propre agence sur BusStation ?",
      answer:
        "Oui, si vous êtes un professionnel du transport, vous pouvez créer un compte Chef d'Agence et enregistrer votre agence. Votre demande sera examinée par notre équipe de validation avant d'être approuvée. Contactez-nous pour plus d'informations.",
      category: "agency",
    },
    // Support
    {
      id: 21,
      question: "Comment contacter le support client ?",
      answer:
        "Vous pouvez nous contacter par email à bryanngoupeyou9@gmail.com, par téléphone au +237 655 12 10 10, ou via notre chat en direct disponible du lundi au vendredi de 8h à 18h. Nous nous engageons à répondre dans les 24 heures.",
      category: "support",
    },
    {
      id: 22,
      question: "J'ai un problème technique, qui contacter ?",
      answer:
        "Pour tout problème technique (erreur de chargement, bug, paiement bloqué), contactez immédiatement notre support technique à bryanngoupeyou9@gmail.com ou appelez notre hotline. Décrivez précisément le problème rencontré pour une résolution rapide.",
      category: "support",
    },
    {
      id: 23,
      question: "Proposez-vous une assistance en cas de litige ?",
      answer:
        "Oui, en cas de litige avec une agence, notre service client peut intervenir comme médiateur. Contactez-nous avec les détails de votre réservation et du problème rencontré. Nous ferons de notre mieux pour trouver une solution satisfaisante.",
      category: "support",
    },
  ];

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
                  Accueil
                </a>
                <a href="/contact" className="nav-link">
                  Contact
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
                {mobileMenuOpen ? getIcon("x") : getIcon("menu")}
              </button>
            </div>

            {mobileMenuOpen && (
              <div className="mobile-menu">
                <a href="/landing" className="mobile-menu-link">
                  Accueil
                </a>
                <a href="/contact" className="mobile-menu-link">
                  Contact
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

        {/* Hero Contact */}
        <section className="hero-help">
          <div className="container">
            <div className="hero-help-content">
              <h1 className="hero-help-title">Centre d'aide</h1>
              <p className="hero-help-description">
                Trouvez des réponses à vos questions fréquentes
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
                <h3 className="empty-title">Aucun résultat trouvé</h3>
                <p className="empty-description">
                  Essayez avec d'autres mots-clés ou sélectionnez une autre
                  catégorie
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

        {/* Contact */}
        <section className="contact-section">
          <div className="container">
            <div className="contact-content">
              <div className="section-header">
                <h2 className="section-title">
                  Besoin d'une aide personnalisée ?
                </h2>
                <p className="section-description">
                  Notre équipe est là pour vous accompagner
                </p>
              </div>

              <div className="contact-info">
                <div className="contact-item">
                  <div className="contact-item-icon">{getIcon("mail")}</div>
                  <div className="contact-item-content">
                    <div className="contact-item-label">Support</div>
                    <div className="contact-item-value">
                      bryanngoupeyou9@gmail.com
                    </div>
                    <div className="contact-item-note">Réponse sous 24h</div>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-item-icon">{getIcon("phone")}</div>
                  <div className="contact-item-content">
                    <div className="contact-item-label">Contact</div>
                    <div className="contact-item-value">
                      (+237) 655 12 10 10
                    </div>
                    <div className="contact-item-note">
                      De Lundi à Vendredi 8h-18h
                    </div>
                  </div>
                </div>

                <div className="contact-cta">
                  <p className="contact-cta-text">
                    Pour toute demande spécifique ou question détaillée
                  </p>
                  <button
                    onClick={() => router.push("/contact")}
                    className="btn btn-primary"
                  >
                    Contactez le service client
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
                  La plateforme de réservation de voyages la plus simple du
                  Cameroun. Voyagez en toute sérénité.
                </p>
              </div>
              <div>
                <h4 className="footer-title">Produit</h4>
                <ul className="footer-links">
                  <li>
                    <a href="/landing#features" className="footer-link">
                      Fonctionnalités
                    </a>
                  </li>
                  <li>
                    <a href="/landing#process" className="footer-link">
                      Comment ça marche
                    </a>
                  </li>
                  <li>
                    <a href="/landing#stats" className="footer-link">
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
                      Agences
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
                    <a href="/landing#faq" className="footer-link">
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
                <a href="#" className="footer-link">
                  CGU
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
