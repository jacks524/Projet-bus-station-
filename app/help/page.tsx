"use client";

import React, { useState } from "react";
import {
  Menu,
  X,
  HelpCircle,
  Search,
  User,
  CreditCard,
  Bus,
  Building2,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

/**
 * Client Help/FAQ Page Component
 *
 * Displays frequently asked questions organized by category
 * Features accordion-style questions with expandable answers
 *
 * @author Thomas Djotio Ndié
 * @date 2025-01-27
 */
export default function ClientHelpPage() {
  const [show_mobile_menu, setShowMobileMenu] = useState(false);
  const [search_query, setSearchQuery] = useState("");
  const [expanded_items, setExpandedItems] = useState<string[]>([]);
  const [selected_category, setSelectedCategory] = useState<string>("all");

  const router = useRouter();

  const BUTTON_COLOR = "#6149CD";

  const FAQ_CATEGORIES = [
    { value: "all", label: "Toutes les questions", icon: HelpCircle },
    { value: "account", label: "Compte et connexion", icon: User },
    { value: "reservation", label: "Réservations", icon: Calendar },
    { value: "payment", label: "Paiements", icon: CreditCard },
    { value: "travel", label: "Voyages", icon: Bus },
    { value: "agency", label: "Agences", icon: Building2 },
    { value: "support", label: "Support", icon: Phone },
  ];

  const FAQ_DATA: FAQItem[] = [
    // Compte et connexion
    {
      id: "1",
      question: "Comment créer un compte sur BusStation ?",
      answer:
        "Pour créer un compte, cliquez sur le bouton 'S'inscrire' en haut de la page d'accueil. Remplissez le formulaire avec vos informations personnelles (nom, prénom, email, numéro de téléphone). Vous recevrez un email de confirmation pour activer votre compte.",
      category: "account",
    },
    {
      id: "2",
      question: "J'ai oublié mon mot de passe, que faire ?",
      answer:
        "Cliquez sur 'Mot de passe oublié' sur la page de connexion. Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe. Suivez les instructions dans l'email pour créer un nouveau mot de passe.",
      category: "account",
    },
    {
      id: "3",
      question: "Comment modifier mes informations personnelles ?",
      answer:
        "Connectez-vous à votre compte, puis accédez à 'Mes paramètres' dans le menu. Vous pouvez modifier votre nom, prénom, email, numéro de téléphone et adresse. N'oubliez pas de sauvegarder vos modifications.",
      category: "account",
    },
    {
      id: "4",
      question: "Est-ce que mes données personnelles sont sécurisées ?",
      answer:
        "Oui, nous utilisons les dernières technologies de cryptage pour protéger vos données personnelles. Vos informations sont stockées de manière sécurisée et ne sont jamais partagées avec des tiers sans votre consentement.",
      category: "account",
    },

    // Réservations
    {
      id: "5",
      question: "Comment réserver un billet de voyage ?",
      answer:
        "Allez dans la section 'Réserver', sélectionnez votre ville de départ et d'arrivée, choisissez la date de voyage. Parcourez les voyages disponibles, sélectionnez celui qui vous convient, choisissez vos places et remplissez les informations des passagers. Confirmez votre réservation et procédez au paiement.",
      category: "reservation",
    },
    {
      id: "6",
      question: "Puis-je choisir ma place dans le bus ?",
      answer:
        "Oui, lors de la réservation, vous aurez accès à un plan des places du bus. Les places disponibles sont affichées en blanc, les places déjà réservées en rouge, et vos sélections en vert. Cliquez sur les places que vous souhaitez réserver.",
      category: "reservation",
    },
    {
      id: "7",
      question: "Comment annuler ou modifier ma réservation ?",
      answer:
        "Pour annuler ou modifier une réservation, allez dans 'Mes réservations', sélectionnez la réservation concernée et cliquez sur 'Annuler' ou 'Modifier'. Notez que des frais d'annulation peuvent s'appliquer selon les conditions de l'agence et le délai d'annulation.",
      category: "reservation",
    },
    {
      id: "8",
      question: "Quel est le délai maximum pour annuler une réservation ?",
      answer:
        "Le délai d'annulation varie selon l'agence et la classe de voyage. Généralement, vous pouvez annuler jusqu'à 24-48 heures avant le départ. Consultez les conditions d'annulation spécifiques à votre réservation dans la section 'Mes réservations'.",
      category: "reservation",
    },
    {
      id: "9",
      question: "Puis-je réserver pour plusieurs passagers ?",
      answer:
        "Oui, lors de la sélection des places, vous pouvez choisir plusieurs sièges. Vous devrez ensuite renseigner les informations de chaque passager (nom, prénom, numéro de pièce d'identité, âge).",
      category: "reservation",
    },

    // Paiements
    {
      id: "10",
      question: "Quels sont les moyens de paiement acceptés ?",
      answer:
        "Nous acceptons les paiements par Mobile Money (MTN Mobile Money, Orange Money), ainsi que les cartes bancaires Visa et Mastercard. Le paiement est sécurisé et vos informations bancaires sont protégées.",
      category: "payment",
    },
    {
      id: "11",
      question: "Mon paiement a échoué, que faire ?",
      answer:
        "Si votre paiement échoue, vérifiez d'abord que vous avez suffisamment de fonds. Assurez-vous que vos informations de paiement sont correctes. Si le problème persiste, contactez notre support client ou essayez avec un autre moyen de paiement.",
      category: "payment",
    },
    {
      id: "12",
      question: "Puis-je obtenir un remboursement ?",
      answer:
        "Les remboursements sont possibles selon les conditions d'annulation de chaque agence. Si vous annulez dans les délais autorisés, vous serez remboursé selon le taux d'annulation applicable. Le remboursement est généralement effectué sous 5-10 jours ouvrables.",
      category: "payment",
    },
    {
      id: "13",
      question: "Où puis-je trouver ma facture ?",
      answer:
        "Après avoir effectué un paiement, vous pouvez télécharger votre facture depuis la section 'Mes billets' ou 'Historique'. Cliquez sur le voyage concerné et sélectionnez 'Télécharger la facture'.",
      category: "payment",
    },

    // Voyages
    {
      id: "14",
      question: "Comment puis-je suivre mon voyage en temps réel ?",
      answer:
        "Une fois votre billet confirmé, vous recevrez des notifications sur l'état de votre voyage. Vous pouvez également consulter les détails dans 'Mes billets' pour voir l'heure de départ prévue et toute mise à jour en temps réel.",
      category: "travel",
    },
    {
      id: "15",
      question: "Que dois-je faire le jour du voyage ?",
      answer:
        "Présentez-vous au point de départ au moins 30 minutes avant l'heure de départ. Munissez-vous de votre billet (version numérique ou imprimée) et d'une pièce d'identité valide. Le chauffeur vérifiera votre billet avant l'embarquement.",
      category: "travel",
    },
    {
      id: "16",
      question: "Puis-je emporter des bagages ?",
      answer:
        "Oui, chaque passager peut emporter des bagages. Le nombre et le poids autorisés dépendent de la classe de voyage et de l'agence. Généralement, 1 à 2 bagages de 20-25 kg sont autorisés. Consultez les détails lors de la réservation.",
      category: "travel",
    },
    {
      id: "17",
      question: "Que se passe-t-il si j'arrive en retard ?",
      answer:
        "Si vous arrivez après l'heure de départ, le bus ne vous attendra pas et votre billet sera considéré comme non utilisé. Nous vous recommandons d'arriver au moins 30 minutes à l'avance pour éviter tout problème.",
      category: "travel",
    },

    // Agences
    {
      id: "18",
      question: "Comment choisir une agence de confiance ?",
      answer:
        "Toutes les agences sur BusStation sont validées par notre équipe. Vous pouvez consulter les avis et notes laissés par d'autres voyageurs. Vérifiez également les équipements proposés (WiFi, climatisation, toilettes) et les conditions d'annulation avant de réserver.",
      category: "agency",
    },
    {
      id: "19",
      question: "Comment contacter une agence de voyage ?",
      answer:
        "Les coordonnées de chaque agence (téléphone, email, réseaux sociaux) sont disponibles dans la fiche détaillée du voyage. Vous pouvez les contacter directement pour toute question spécifique concernant votre réservation.",
      category: "agency",
    },
    {
      id: "20",
      question: "Puis-je créer ma propre agence sur BusStation ?",
      answer:
        "Oui, si vous êtes un professionnel du transport, vous pouvez créer un compte Chef d'Agence et enregistrer votre agence. Votre demande sera examinée par notre équipe de validation avant d'être approuvée. Contactez-nous pour plus d'informations.",
      category: "agency",
    },

    // Support
    {
      id: "21",
      question: "Comment contacter le support client ?",
      answer:
        "Vous pouvez nous contacter par email à bryanngoupeyou9@gmail.com, par téléphone au +237 655 12 10 10, ou via notre chat en direct disponible du lundi au vendredi de 8h à 18h. Nous nous engageons à répondre dans les 24 heures.",
      category: "support",
    },
    {
      id: "22",
      question: "J'ai un problème technique, qui contacter ?",
      answer:
        "Pour tout problème technique (erreur de chargement, bug, paiement bloqué), contactez immédiatement notre support technique à bryanngoupeyou9@gmail.com.com ou appelez notre hotline. Décrivez précisément le problème rencontré pour une résolution rapide.",
      category: "support",
    },
    {
      id: "23",
      question: "Proposez-vous une assistance en cas de litige ?",
      answer:
        "Oui, en cas de litige avec une agence, notre service client peut intervenir comme médiateur. Contactez-nous avec les détails de votre réservation et du problème rencontré. Nous ferons de notre mieux pour trouver une solution satisfaisante.",
      category: "support",
    },
  ];

  const toggleItem = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const filteredFAQs = FAQ_DATA.filter((faq) => {
    const matchesCategory =
      selected_category === "all" || faq.category === selected_category;
    const matchesSearch =
      faq.question.toLowerCase().includes(search_query.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search_query.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    const cat = FAQ_CATEGORIES.find((c) => c.value === category);
    return cat?.icon || HelpCircle;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu */}
      {show_mobile_menu && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setShowMobileMenu(false)}
          ></div>

          <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    router.push("/");
                  }}
                >
                  <img
                    src="/images/busstation.png"
                    alt="BusStation Logo"
                    className="h-9.5 w-auto"
                  />
                </button>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-900" />
                </button>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => router.push("/landing")}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="font-medium">Accueil</span>
                </button>
                <button
                  onClick={() => router.push("/contact")}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-medium">Nous contacter</span>
                </button>
                <button
                  onClick={() => router.push("/login")}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Se connecter</span>
                </button>
              </nav>
            </div>
          </div>
        </>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowMobileMenu(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-900" />
            </button>

            <button>
              <img
                src="/images/busstation.png"
                alt="BusStation Logo"
                className="h-10 w-auto"
              />
            </button>

            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 hidden sm:block">
              Centre d'aide
            </h1>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => router.push("/contact")}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Nous contacter</span>
            </button>
            <button
              onClick={() => router.push("/login")}
              style={{ backgroundColor: BUTTON_COLOR }}
              className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <User className="w-5 h-5" />
              <span>Se connecter</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-4 sm:p-6">
        <div className="max-w-5xl mx-auto">
          {/* Category Filter */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {FAQ_CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                      selected_category === category.value
                        ? "bg-[#6149CD] text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{category.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {filteredFAQs.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Aucun résultat trouvé
                </h3>
                <p className="text-gray-600">
                  Essayez avec d'autres mots-clés ou une autre catégorie
                </p>
              </div>
            ) : (
              filteredFAQs.map((faq) => {
                const is_expanded = expanded_items.includes(faq.id);
                const CategoryIcon = getCategoryIcon(faq.category);

                return (
                  <div
                    key={faq.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <button
                      onClick={() => toggleItem(faq.id)}
                      className="w-full flex items-center justify-between p-4 sm:p-6 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${BUTTON_COLOR}15` }}
                        >
                          <CategoryIcon
                            className="w-5 h-5"
                            style={{ color: BUTTON_COLOR }}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                            {faq.question}
                          </h3>
                          <span className="text-xs text-gray-500 font-medium uppercase">
                            {
                              FAQ_CATEGORIES.find(
                                (c) => c.value === faq.category,
                              )?.label
                            }
                          </span>
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 sm:w-6 sm:h-6 text-gray-400 shrink-0 transition-transform duration-300 ${
                          is_expanded ? "transform rotate-180" : ""
                        }`}
                      />
                    </button>

                    {is_expanded && (
                      <div className="px-4 sm:px-6 pb-4 sm:pb-6 animate-fadeIn">
                        <div className="ml-0 sm:ml-14 p-4 bg-gray-50 rounded-lg border-l-4 border-[#6149CD]">
                          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Contact Support Card */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <div className="text-center mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Vous ne trouvez pas ce que vous cherchez ?
              </h3>
              <p className="text-gray-600">
                Notre équipe est là pour vous aider
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${BUTTON_COLOR}15` }}
                >
                  <Mail className="w-6 h-6" style={{ color: BUTTON_COLOR }} />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Email</h4>
                <p className="text-sm text-gray-600 mb-3">
                  equipstaf@bustation.com
                </p>
                <p className="text-xs text-gray-500">Réponse sous 24h</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${BUTTON_COLOR}15` }}
                >
                  <Phone className="w-6 h-6" style={{ color: BUTTON_COLOR }} />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Téléphone</h4>
                <p className="text-sm text-gray-600 mb-3">+237 655 12 10 10</p>
                <p className="text-xs text-gray-500">Lun-Ven 8h-18h</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${BUTTON_COLOR}15` }}
                >
                  <MessageCircle
                    className="w-6 h-6"
                    style={{ color: BUTTON_COLOR }}
                  />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Nous contacter
                </h4>
                <button
                  onClick={() => router.push("/contact")}
                  style={{ backgroundColor: BUTTON_COLOR }}
                  className="text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity"
                >
                  Envoyer un message
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
