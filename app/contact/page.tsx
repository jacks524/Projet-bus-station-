"use client";

import React, { useState } from "react";
import {
  Home,
  Menu,
  X,
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  AlertCircle,
  User,
  MessageSquare,
  Clock,
  Globe,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  HelpCircle,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ContactFormData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  sujet: string;
  message: string;
}

/**
 * Contact Page Component
 *
 * Contact form to reach BusStation support team
 * Sends emails to ngoupeyoubryan9@gmail.com
 * Public page - no authentication required
 *
 * @author Thomas Djotio Ndié
 * @date 2025-01-27
 */
export default function ContactPage() {
  const [show_mobile_menu, setShowMobileMenu] = useState(false);
  const [is_submitting, setIsSubmitting] = useState(false);
  const [show_success_modal, setShowSuccessModal] = useState(false);
  const [show_error_modal, setShowErrorModal] = useState(false);
  const [error_message, setErrorMessage] = useState("");

  const [form_data, setFormData] = useState<ContactFormData>({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    sujet: "",
    message: "",
  });

  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const BUTTON_COLOR = "#6149CD";

  const CONTACT_INFO = [
    {
      icon: Mail,
      label: "Email",
      value: "ngoupeyoubryan9@gmail.com",
      subtext: "Réponse sous 24h",
    },
    {
      icon: Phone,
      label: "Téléphone",
      value: "+237 655 12 10 10",
      subtext: "Lun-Ven 8h-18h",
    },
    {
      icon: MapPin,
      label: "Adresse",
      value: "Yaoundé, Cameroun",
      subtext: "Siège social",
    },
  ];

  const SUBJECTS = [
    "Question générale",
    "Problème de réservation",
    "Problème de paiement",
    "Annulation/Remboursement",
    "Problème technique",
    "Partenariat",
    "Suggestion d'amélioration",
    "Autre",
  ];

  const handleInputChange = (e: any) => {
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
      const email_data = {
        subject: `[BusStation Contact] ${form_data.sujet}`,
        senderName: `${form_data.prenom} ${form_data.nom}`,
        senderEmail: form_data.email,
        senderPhone: form_data.telephone || "",
        message: form_data.message,
      };

      const response = await fetch(`${API_BASE_URL}/contact/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(email_data),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi du message");
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
        "Une erreur est survenue lors de l'envoi du message. Veuillez réessayer.",
      );
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return (
      form_data.nom.trim() &&
      form_data.prenom.trim() &&
      form_data.email.trim() &&
      form_data.sujet &&
      form_data.message.trim().length >= 10
    );
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
                  onClick={() => router.push("/help")}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <HelpCircle className="w-5 h-5" />
                  <span className="font-medium">Aide</span>
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

            <button onClick={() => router.push("/")}>
              <img
                src="/images/busstation.png"
                alt="BusStation Logo"
                className="h-10 w-auto"
              />
            </button>

            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 hidden sm:block">
              Nous contacter
            </h1>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => router.push("/help")}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
              <span>Aide</span>
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
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-4 sm:space-y-6">
              {/* Contact Cards */}
              <div className="space-y-4">
                {CONTACT_INFO.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6"
                    >
                      <div className="flex items-start space-x-4">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${BUTTON_COLOR}15` }}
                        >
                          <Icon
                            className="w-6 h-6"
                            style={{ color: BUTTON_COLOR }}
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {info.label}
                          </h3>
                          <p className="text-gray-700 mb-1 text-sm sm:text-base break-all">
                            {info.value}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {info.subtext}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Business Hours */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${BUTTON_COLOR}15` }}
                  >
                    <Clock
                      className="w-5 h-5"
                      style={{ color: BUTTON_COLOR }}
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    Heures d'ouverture
                  </h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Lundi - Vendredi</span>
                    <span className="text-gray-900 font-medium">
                      8h00 - 18h00
                    </span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Samedi</span>
                    <span className="text-gray-900 font-medium">
                      9h00 - 14h00
                    </span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Dimanche</span>
                    <span className="text-red-600 font-medium">Fermé</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <div className="mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    Envoyez-nous un message
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Remplissez le formulaire ci-dessous et nous vous répondrons
                    dans les plus brefs délais
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nom et Prénom */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nom *
                      </label>
                      <input
                        type="text"
                        name="nom"
                        value={form_data.nom}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent text-gray-900 placeholder:text-gray-400"
                        placeholder="Votre nom"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        name="prenom"
                        value={form_data.prenom}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent text-gray-900 placeholder:text-gray-400"
                        placeholder="Votre prénom"
                      />
                    </div>
                  </div>

                  {/* Email et Téléphone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form_data.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent text-gray-900 placeholder:text-gray-400"
                        placeholder="exemple@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        name="telephone"
                        value={form_data.telephone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent text-gray-900 placeholder:text-gray-400"
                        placeholder="+237 6XX XX XX XX"
                        maxLength={9}
                      />
                    </div>
                  </div>

                  {/* Sujet */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Sujet *
                    </label>
                    <select
                      name="sujet"
                      value={form_data.sujet}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent text-gray-900"
                    >
                      <option value="">Sélectionnez un sujet</option>
                      {SUBJECTS.map((subject, index) => (
                        <option key={index} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={form_data.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400"
                      placeholder="Décrivez votre demande en détail (minimum 10 caractères)..."
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      {form_data.message.length} / 10 caractères minimum
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={is_submitting || !isFormValid()}
                    style={{ backgroundColor: BUTTON_COLOR }}
                    className="w-full py-3 sm:py-4 text-white rounded-xl font-semibold hover:opacity-90 active:opacity-80 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {is_submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Envoi en cours...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Envoyer le message</span>
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs sm:text-sm text-gray-500">
                    En envoyant ce message, vous acceptez notre politique de
                    confidentialité
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Success Modal */}
      {show_success_modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-linear-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Message envoyé !
              </h2>
              <p className="text-gray-600 mb-6">
                Votre message a été envoyé avec succès. Nous vous répondrons
                dans les plus brefs délais.
              </p>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push("/landing");
                }}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {show_error_modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-linear-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Erreur d'envoi
              </h2>
              <div className="bg-red-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-red-800">{error_message}</p>
              </div>
              <button
                onClick={() => {
                  setShowErrorModal(false);
                  setErrorMessage("");
                }}
                className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
