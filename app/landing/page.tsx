"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Shield,
  Clock,
  Star,
  Users,
  Zap,
  CheckCircle,
  ArrowRight,
  ChevronDown,
  Bus,
  CreditCard,
  Smartphone,
  TrendingUp,
  Award,
  Globe,
  Menu,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

/**
 * BusStation Landing Page
 *
 * A modern, vibrant landing page with African-inspired aesthetics
 * Features smooth animations, asymmetric layouts, and bold visual elements
 *
 * @author Félix DJOTIO NDIE
 * @date 2025-01-22
 */

export default function LandingPage() {
  const [is_scrolled, setIsScrolled] = useState(false);
  const [show_mobile_menu, setShowMobileMenu] = useState(false);
  const [active_faq, setActiveFaq] = useState<number | null>(null);
  const router = useRouter();

  const PRIMARY_COLOR = "#6149CD";
  const ACCENT_GREEN = "#10B981";
  const ACCENT_RED = "#EF4444";
  const ACCENT_YELLOW = "#F59E0B";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: Calendar,
      title: "Réservation Instantanée",
      description:
        "Réservez votre voyage en quelques clics. Simple, rapide et sécurisé.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Shield,
      title: "Paiement Sécurisé",
      description:
        "Vos transactions sont protégées avec les dernières technologies de sécurité.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Clock,
      title: "Disponible 24/7",
      description:
        "Réservez à tout moment, de n'importe où. Notre plateforme ne dort jamais.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Star,
      title: "Agences Vérifiées",
      description:
        "Toutes nos agences sont validées et notées par nos utilisateurs.",
      color: "from-orange-500 to-red-500",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Recherchez votre destination",
      description:
        "Parcourez nos voyages disponibles vers toutes les villes du Cameroun.",
      icon: MapPin,
    },
    {
      number: "02",
      title: "Sélectionnez votre voyage",
      description:
        "Comparez les prix, horaires et agences pour trouver le meilleur choix.",
      icon: Bus,
    },
    {
      number: "03",
      title: "Réservez en toute sécurité",
      description:
        "Payez en ligne et imprimer votre billet.",
      icon: CreditCard,
    },
    {
      number: "04",
      title: "Voyagez sereinement",
      description:
        "Présentez votre billet électronique et profitez de votre voyage.",
      icon: CheckCircle,
    },
  ];

  const stats = [
    { value: "50,000+", label: "Voyageurs satisfaits", icon: Users },
    { value: "100+", label: "Agences partenaires", icon: Award },
    { value: "20+", label: "Villes desservies", icon: Globe },
    { value: "98%", label: "Taux de satisfaction", icon: Star },
  ];

  const faqs = [
    {
      question: "Comment puis-je réserver un voyage ?",
      answer:
        "Créez un compte, recherchez votre destination, sélectionnez votre voyage et procédez au paiement. Vous recevrez votre billet par email instantanément.",
    },
    {
      question: "Les paiements sont-ils sécurisés ?",
      answer:
        "Oui, nous utilisons les dernières technologies de cryptage SSL et nos partenaires de paiement sont certifiés PCI-DSS.",
    },
    {
      question: "Puis-je payer ma réservation ?",
      answer:
        "Oui, il est tout à fait possible de payer votre réservation en ligne.",
    },
    {
      question: "Comment devenir une organisation ?",
      answer:
        "Soumettez vos documents et notre équipe validera votre profil sous 48h.",
    },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          is_scrolled
            ? "bg-white/95 backdrop-blur-lg shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="shrink-0">
              <img
                src="/images/busstation.png"
                alt="busstation"
                className="h-10 sm:h-12 w-auto transition-transform duration-300 hover:scale-105"
              />
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
              <a
                href="#features"
                className="text-gray-700 hover:text-[#6149CD] font-medium transition-colors duration-300 text-sm lg:text-base"
              >
                Fonctionnalités
              </a>
              <a
                href="#how-it-works"
                className="text-gray-700 hover:text-[#6149CD] font-medium transition-colors duration-300 text-sm lg:text-base"
              >
                Comment ça marche
              </a>
              <a
                href="#stats"
                className="text-gray-700 hover:text-[#6149CD] font-medium transition-colors duration-300 text-sm lg:text-base"
              >
                À propos
              </a>
              <a
                href="#faq"
                className="text-gray-700 hover:text-[#6149CD] font-medium transition-colors duration-300 text-sm lg:text-base"
              >
                FAQ
              </a>
              <button
                onClick={() => router.push("/login")}
                className="text-gray-700 hover:text-[#6149CD] font-medium transition-colors duration-300 text-sm lg:text-base"
              >
                Connexion
              </button>
              <button
                onClick={() => router.push("/signup")}
                style={{ backgroundColor: PRIMARY_COLOR }}
                className="px-4 lg:px-6 py-2 lg:py-3 text-white rounded-full font-semibold hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm lg:text-base"
              >
                S'inscrire
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!show_mobile_menu)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:ring-opacity-50"
              aria-label="Menu"
              aria-expanded={show_mobile_menu}
            >
              {show_mobile_menu ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden bg-white border-t border-gray-200 shadow-lg overflow-hidden transition-all duration-300 ease-in-out ${
            show_mobile_menu ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-4 py-4 space-y-3">
            <a
              href="#features"
              onClick={() => setShowMobileMenu(false)}
              className="block py-2 text-gray-700 hover:text-[#6149CD] font-medium transition-colors active:bg-gray-50 rounded-lg px-2"
            >
              Fonctionnalités
            </a>
            <a
              href="#how-it-works"
              onClick={() => setShowMobileMenu(false)}
              className="block py-2 text-gray-700 hover:text-[#6149CD] font-medium transition-colors active:bg-gray-50 rounded-lg px-2"
            >
              Comment ça marche
            </a>
            <a
              href="#stats"
              onClick={() => setShowMobileMenu(false)}
              className="block py-2 text-gray-700 hover:text-[#6149CD] font-medium transition-colors active:bg-gray-50 rounded-lg px-2"
            >
              À propos
            </a>
            <a
              href="#faq"
              onClick={() => setShowMobileMenu(false)}
              className="block py-2 text-gray-700 hover:text-[#6149CD] font-medium transition-colors active:bg-gray-50 rounded-lg px-2"
            >
              FAQ
            </a>
            <div className="pt-3 border-t border-gray-200 space-y-3">
              <button
                onClick={() => {
                  setShowMobileMenu(false);
                  router.push("/login");
                }}
                className="w-full py-3 text-gray-700 hover:text-[#6149CD] font-medium transition-colors border border-gray-300 rounded-full hover:border-[#6149CD]"
              >
                Connexion
              </button>
              <button
                onClick={() => {
                  setShowMobileMenu(false);
                  router.push("/signup");
                }}
                style={{ backgroundColor: PRIMARY_COLOR }}
                className="w-full py-3 text-white rounded-full font-semibold hover:opacity-90 transition-opacity shadow-md"
              >
                S'inscrire
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-linear-to-br from-purple-50 via-white to-blue-50">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-fade-in-up">
              <div className="inline-block">
                <span
                  style={{ backgroundColor: PRIMARY_COLOR }}
                  className="px-4 py-2 rounded-full text-white text-sm font-semibold animate-bounce-slow"
                >
                  La révolution du transport au Cameroun
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 leading-tight">
                Voyagez{" "}
                <span
                  style={{ color: PRIMARY_COLOR }}
                  className="relative inline-block"
                >
                  Plus Simple
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    height="12"
                    viewBox="0 0 200 12"
                    fill="none"
                  >
                    <path
                      d="M0 6C50 2 150 2 200 6C150 10 50 10 0 6Z"
                      fill={PRIMARY_COLOR}
                      opacity="0.3"
                    />
                  </svg>
                </span>
                <br />
                Plus Rapide
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                Réservez vos voyages en quelques clics avec BusStation.
                Connectez-vous aux meilleures agences de transport du Cameroun
                et voyagez en toute sérénité.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push("/signup")}
                  style={{ backgroundColor: PRIMARY_COLOR }}
                  className="group px-8 py-4 text-white rounded-full font-bold text-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center justify-center space-x-2"
                >
                  <span>Commencer maintenant</span>
                </button>
                <button
                  onClick={() => router.push("/login")}
                  className="px-8 py-4 border-2 border-gray-900 text-gray-900 rounded-full font-bold text-lg hover:bg-gray-900 hover:text-white transition-all duration-300 transform hover:scale-105"
                >
                  Se connecter
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle
                    className="w-5 h-5"
                    style={{ color: ACCENT_GREEN }}
                  />
                  <span className="text-gray-600 font-medium">
                    100% Sécurisé
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle
                    className="w-5 h-5"
                    style={{ color: ACCENT_GREEN }}
                  />
                  <span className="text-gray-600 font-medium">
                    Support 24/7
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle
                    className="w-5 h-5"
                    style={{ color: ACCENT_GREEN }}
                  />
                  <span className="text-gray-600 font-medium">
                    Agences vérifiées
                  </span>
                </div>
              </div>
            </div>

            {/* Right Content - Hero Image */}
            <div className="relative animate-fade-in-right">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                <Image
                  src="/images/landing.jpg"
                  alt="Voyager au Cameroun"
                  width={600}
                  height={700}
                  className="w-full h-auto object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent"></div>

                {/* Floating Stats Card */}
                <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p
                        className="text-2xl font-black"
                        style={{ color: PRIMARY_COLOR }}
                      >
                        50K+
                      </p>
                      <p className="text-xs text-gray-600 font-medium">
                        Utilisateurs
                      </p>
                    </div>
                    <div className="text-center border-x border-gray-200">
                      <p
                        className="text-2xl font-black"
                        style={{ color: ACCENT_GREEN }}
                      >
                        100+
                      </p>
                      <p className="text-xs text-gray-600 font-medium">
                        Agences
                      </p>
                    </div>
                    <div className="text-center">
                      <p
                        className="text-2xl font-black"
                        style={{ color: ACCENT_YELLOW }}
                      >
                        98%
                      </p>
                      <p className="text-xs text-gray-600 font-medium">
                        Satisfaction
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div
                className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-50 blur-2xl"
                style={{ backgroundColor: PRIMARY_COLOR }}
              ></div>
              <div
                className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-50 blur-2xl"
                style={{ backgroundColor: ACCENT_YELLOW }}
              ></div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-gray-400" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
              Pourquoi choisir{" "}
              <span style={{ color: PRIMARY_COLOR }}>BusStation</span> ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une expérience de réservation pensée pour vous simplifier la vie
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`w-16 h-16 rounded-2xl bg-linear-to-br ${feature.color} flex items-center justify-center mb-6 transform group-hover:rotate-6 transition-transform duration-300`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Quatre étapes simples pour réserver votre voyage
            </p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-linear-to-r from-purple-200 via-blue-200 to-pink-200 transform -translate-y-1/2"></div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-fade-in-up"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {/* Step Number */}
                  <div className="absolute -top-6 left-8">
                    <div
                      style={{ backgroundColor: PRIMARY_COLOR }}
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg shadow-lg"
                    >
                      {index + 1}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                      style={{ backgroundColor: `${PRIMARY_COLOR}15` }}
                    >
                      <step.icon
                        className="w-8 h-8"
                        style={{ color: PRIMARY_COLOR }}
                      />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-16">
            <button
              onClick={() => router.push("/signup")}
              style={{ backgroundColor: PRIMARY_COLOR }}
              className="group px-10 py-5 text-white rounded-full font-bold text-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-2xl inline-flex items-center space-x-3"
            >
              <span>Commencer maintenant</span>
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        id="stats"
        className="py-20 bg-linear-to-br from-purple-600 to-blue-600 text-white relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              BusStation en chiffres
            </h2>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              La confiance de milliers d'utilisateurs à travers le Cameroun
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center transform hover:scale-105 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-4xl sm:text-5xl font-black mb-2">
                  {stat.value}
                </h3>
                <p className="text-purple-100 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
              Questions fréquentes
            </h2>
            <p className="text-xl text-gray-600">
              Tout ce que vous devez savoir sur BusStation
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
              >
                <button
                  onClick={() =>
                    setActiveFaq(active_faq === index ? null : index)
                  }
                  className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg font-bold text-gray-900 pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-6 h-6 text-gray-400 shrink-0 transition-transform duration-300 ${
                      active_faq === index ? "transform rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    active_faq === index ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <div className="px-8 pb-6 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-3xl p-12 sm:p-16 text-center relative overflow-hidden"
            style={{ backgroundColor: PRIMARY_COLOR }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full filter blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full filter blur-3xl"></div>
            </div>

            <div className="relative">
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
                Prêt à voyager autrement ?
              </h2>
              <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto">
                Rejoignez des milliers de voyageurs qui ont choisi BusStation
                pour leurs déplacements au Cameroun.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push("/signup")}
                  className="px-10 py-5 bg-white text-[#6149CD] rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl"
                >
                  Créer mon compte gratuit
                </button>
                <button
                  onClick={() => router.push("/login")}
                  className="px-10 py-5 border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white hover:text-[#6149CD] transition-all duration-300 transform hover:scale-105"
                >
                  Me connecter
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <img
                src="/images/busstation.png"
                alt="BusStation"
                className="h-12 w-auto mb-4 brightness-0 invert"
              />
              <p className="text-gray-400 text-sm leading-relaxed">
                La plateforme de réservation de voyages la plus simple et
                sécurisée au Cameroun.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Produit</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    Fonctionnalités
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="hover:text-white transition-colors"
                  >
                    Comment ça marche
                  </a>
                </li>
                <li>
                  <a
                    href="#stats"
                    className="hover:text-white transition-colors"
                  >
                    Nos chiffres
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    À propos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Agences partenaires
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Carrières
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="#faq" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Centre d'aide
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Nous contacter
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">
                © 2025 BusStation. Tous droits réservés.
              </p>
              <div className="flex space-x-6 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors">
                  Mentions légales
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Confidentialité
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Conditions
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        .animate-fade-in-right {
          animation: fade-in-right 0.8s ease-out forwards;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }

        @keyframes bounce {
          0%,
          100% {
            transform: translateY(-5%);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
