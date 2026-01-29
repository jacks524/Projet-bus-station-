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
import { useLanguage } from "../providers";
import { RAW_FAQ_CATEGORIES, RAW_FAQ_DATA } from "./faq-data";

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
  const [chat_messages, setChatMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [chat_input, setChatInput] = useState("");
  const [is_chat_loading, setIsChatLoading] = useState(false);
  const [chat_error, setChatError] = useState("");

  const router = useRouter();
  const { t, language } = useLanguage();

  const BUTTON_COLOR = "#6149CD";

  const FAQ_CATEGORIES = RAW_FAQ_CATEGORIES.map((category) => ({
    value: category.value,
    label: t(category.label_fr, category.label_en),
    icon:
      category.value === "account"
        ? User
        : category.value === "reservation"
          ? Calendar
          : category.value === "payment"
            ? CreditCard
            : category.value === "travel"
              ? Bus
              : category.value === "agency"
                ? Building2
                : category.value === "support"
                  ? Phone
                  : HelpCircle,
  }));

  const FAQ_DATA: FAQItem[] = RAW_FAQ_DATA.map((faq) => ({
    id: faq.id,
    question: t(faq.question_fr, faq.question_en),
    answer: t(faq.answer_fr, faq.answer_en),
    category: faq.category,
  }));

  const handleSendChat = async () => {
    const trimmed = chat_input.trim();
    if (!trimmed || is_chat_loading) return;

    const next_messages = [
      ...chat_messages,
      { role: "user" as const, content: trimmed },
    ];

    setChatMessages(next_messages);
    setChatInput("");
    setChatError("");
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/help-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: next_messages.slice(-6),
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
            t(
              "Impossible de joindre l'assistant",
              "Unable to reach the assistant"
            ),
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
                  <span className="font-medium">{t("Accueil", "Home")}</span>
                </button>
                <button
                  onClick={() => router.push("/contact")}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-medium">{t("Nous contacter", "Contact us")}</span>
                </button>
                <button
                  onClick={() => router.push("/login")}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">{t("Se connecter", "Sign in")}</span>
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

            <button onClick={() => router.push("/landing")}>
              <img
                src="/images/busstation.png"
                alt="BusStation Logo"
                className="h-10 w-auto transition-transform duration-300 hover:scale-105"
              />
            </button>

            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 hidden sm:block">
              {t("Centre d'aide", "Help center")}
            </h1>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => router.push("/contact")}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{t("Nous contacter", "Contact us")}</span>
            </button>
            <button
              onClick={() => router.push("/login")}
              style={{ backgroundColor: BUTTON_COLOR }}
              className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <User className="w-5 h-5" />
              <span>{t("Se connecter", "Sign in")}</span>
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
                  {t("Aucun résultat trouvé", "No results found")}
                </h3>
                <p className="text-gray-600">
                  {t("Essayez avec d'autres mots-clés ou une autre catégorie", "Try different keywords or another category")}
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

          {/* Chatbot Help Card */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  {t("Assistant d'aide", "Help assistant")}
                </h3>
                <p className="text-gray-600">
                  {t(
                    "Posez une question et l'assistant répond à partir des FAQ.",
                    "Ask a question and the assistant answers based on the FAQs."
                  )}
                </p>
              </div>
              <div
                className="hidden sm:flex w-12 h-12 rounded-full items-center justify-center"
                style={{ backgroundColor: `${BUTTON_COLOR}15` }}
              >
                <MessageCircle className="w-6 h-6" style={{ color: BUTTON_COLOR }} />
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 max-h-80 overflow-y-auto">
              {chat_messages.length === 0 ? (
                <div className="text-sm text-gray-600">
                  {t(
                    "Bonjour ! Posez votre question sur l'utilisation de BusStation.",
                    "Hi! Ask your question about using BusStation."
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {chat_messages.map((msg, index) => (
                    <div
                      key={`${msg.role}-${index}`}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-[#6149CD] text-white"
                            : "bg-white text-gray-800 border border-gray-200"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {is_chat_loading && (
                    <div className="flex justify-start">
                      <div className="bg-white text-gray-500 border border-gray-200 rounded-2xl px-4 py-2 text-sm">
                        {t("Assistant en train de répondre...", "Assistant is typing...")}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {chat_error && (
              <div className="mb-4 text-sm text-red-600">
                {chat_error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <textarea
                value={chat_input}
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
                className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6149CD]"
              />
              <button
                onClick={handleSendChat}
                disabled={is_chat_loading || !chat_input.trim()}
                style={{ backgroundColor: BUTTON_COLOR }}
                className="px-5 py-3 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("Envoyer", "Send")}
              </button>
            </div>
          </div>

          {/* Contact Support Card */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <div className="text-center mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                {t("Vous ne trouvez pas ce que vous cherchez ?", "Can't find what you're looking for?")}
              </h3>
              <p className="text-gray-600">
                {t("Notre équipe est là pour vous aider", "Our team is here to help")}
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
                <h4 className="font-semibold text-gray-900 mb-2">{t("Email", "Email")}</h4>
                <p className="text-sm text-gray-600 mb-3">
                  bryanngoupeyou9@gmail.com
                </p>
                <p className="text-xs text-gray-500">{t("Réponse sous 24h", "Reply within 24h")}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${BUTTON_COLOR}15` }}
                >
                  <Phone className="w-6 h-6" style={{ color: BUTTON_COLOR }} />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{t("Téléphone", "Phone")}</h4>
                <p className="text-sm text-gray-600 mb-3">+237 655 12 10 10</p>
                <p className="text-xs text-gray-500">{t("Lun-Ven 8h-18h", "Mon-Fri 8am-6pm")}</p>
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
                  {t("Nous contacter", "Contact us")}
                </h4>
                <button
                  onClick={() => router.push("/contact")}
                  style={{ backgroundColor: BUTTON_COLOR }}
                  className="text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity"
                >
                  {t("Envoyer un message", "Send a message")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
