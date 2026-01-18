"use client";

import React, { useState, useEffect } from "react";
import {
  Home,
  Building2,
  Settings,
  ChevronDown,
  LogOut,
  Menu,
  X,
  MapPin,
  Building,
  Globe,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Briefcase,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface AgencyFormData {
  organisation_id: string;
  user_id: string;
  long_name: string;
  short_name: string;
  location: string;
  ville: string;
  social_network: string;
  description: string;
  greeting_message: string;
}

interface UserData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  organization_id: string;
  userId: string;
}

/**
 * DG Agence Page Component
 *
 * Form to create a new agency for the organization
 * Features validation by BSM after submission
 *
 * @author Thomas Djotio Ndié
 * @date 2025-01-14
 */
export default function DGAgencePage() {
  const [form_data, setFormData] = useState<AgencyFormData>({
    organisation_id: "",
    user_id: "",
    long_name: "",
    short_name: "",
    location: "",
    ville: "",
    social_network: "",
    description: "",
    greeting_message: "",
  });

  const [is_loading, setIsLoading] = useState(false);
  const [show_success_modal, setShowSuccessModal] = useState(false);
  const [show_error_modal, setShowErrorModal] = useState(false);
  const [error_message, setErrorMessage] = useState("");
  const [agency_response, setAgencyResponse] = useState<any>(null);

  const [show_profile_menu, setShowProfileMenu] = useState(false);
  const [show_mobile_menu, setShowMobileMenu] = useState(false);
  const [user_data, setDgData] = useState<UserData | null>(null);

  const router = useRouter();

  const API_BASE_URL = "http://localhost:8081/api";
  const BUTTON_COLOR = "#6149CD";

  const MENU_ITEMS = [
    {
      icon: Home,
      label: "Dashboard",
      path: "/user/organization/dashboard",
      active: false,
    },
    {
      icon: Briefcase,
      label: "Organisation",
      path: "/user/organization/organization",
      active: false,
    },
    {
      icon: Building2,
      label: "Agence",
      path: "/user/organization/agencies",
      active: true,
    },
    {
      icon: Settings,
      label: "Mes paramètres",
      path: "/user/organization/settings",
      active: false,
    },
  ];

  useEffect(() => {
    const auth_token =
      localStorage.getItem("auth_token") ||
      sessionStorage.getItem("auth_token");

    if (!auth_token) {
      router.push("/login");
      return;
    }

    const stored_user_data =
      localStorage.getItem("user_data") || sessionStorage.getItem("user_data");
    if (stored_user_data) {
      const parsed_user = JSON.parse(stored_user_data);
      setDgData(parsed_user);

      setFormData((prev) => ({
        ...prev,
        organisation_id: parsed_user.organization_id || "",
        user_id: parsed_user.userId || "",
      }));
    }
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!form_data.long_name.trim()) {
      setErrorMessage("Le nom complet de l'agence est requis");
      return false;
    }
    if (!form_data.short_name.trim()) {
      setErrorMessage("L'abréviation de l'agence est requise");
      return false;
    }
    if (!form_data.location.trim()) {
      setErrorMessage("La localisation est requise");
      return false;
    }
    if (!form_data.ville.trim()) {
      setErrorMessage("La ville est requise");
      return false;
    }
    if (!form_data.organisation_id.trim()) {
      setErrorMessage("L'ID de l'organisation est requis");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setShowErrorModal(true);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const auth_token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");

      const response = await fetch(`${API_BASE_URL}/agence`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth_token}`,
        },
        body: JSON.stringify(form_data),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création de l'agence");
      }

      const data = await response.json();
      setAgencyResponse(data);
      setShowSuccessModal(true);

      // Réinitialiser le formulaire (sauf organisation_id et user_id)
      setFormData({
        organisation_id: form_data.organisation_id,
        user_id: form_data.user_id,
        long_name: "",
        short_name: "",
        location: "",
        ville: "",
        social_network: "",
        description: "",
        greeting_message: "",
      });
    } catch (error: any) {
      setErrorMessage(
        "Une erreur est survenue lors de la création de l'agence",
      );
      setShowErrorModal(true);
      console.error("Create Agency Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("user_data");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <>
        <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200 fixed h-full">
          <div className="p-6">
            <div className="mb-8">
              <button
                onClick={() => router.push("/user/organization/dashboard")}
                className="group relative transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-linear-to-r from-[#6149CD] to-[#8B7BE8] rounded-lg opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300"></div>
                <img
                  src="/images/busstation.png"
                  alt="SafaraPlace Logo"
                  className="h-12 w-auto relative z-10 drop-shadow-md group-hover:drop-shadow-xl transition-all duration-300"
                />
              </button>
            </div>

            <nav className="space-y-1">
              {MENU_ITEMS.map((item, index) => (
                <button
                  key={index}
                  onClick={() =>
                    item.active
                      ? window.location.reload()
                      : router.push(item.path)
                  }
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    item.active
                      ? "bg-[#6149CD] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {show_mobile_menu && (
          <>
            <div
              className="fixed inset-0 z-40 lg:hidden"
              onClick={() => setShowMobileMenu(false)}
            ></div>

            <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-2xl z-50 lg:hidden transform transition-transform duration-300">
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      router.push("/user/organization/dashboard");
                    }}
                    className="group relative transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    <img
                      src="/images/busstation.png"
                      alt="SafaraPlace Logo"
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

                <nav className="space-y-1">
                  {MENU_ITEMS.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setShowMobileMenu(false);
                        router.push(item.path);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        item.active
                          ? "bg-[#6149CD] text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </aside>
          </>
        )}
      </>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowMobileMenu(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6 text-gray-900" />
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">
                Créer une agence
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/user/organization/settings")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-6 h-6 text-gray-600" />
              </button>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!show_profile_menu)}
                  className="flex items-center space-x-3 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
                >
                  <img
                    src="/images/user-icon.png"
                    alt="Profile"
                    className="w-8.5 h-8.5 rounded-full object-cover"
                  />
                  <span className="font-medium text-gray-900 hidden md:block">
                    {user_data?.username}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>

                {show_profile_menu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        router.push("/user/organization/settings");
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">Paramètres</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 transition-colors text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Se déconnecter</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Info Box Validation BSM */}
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">
                    Validation BSM requise
                  </h3>
                  <p className="text-sm text-blue-800">
                    Après la création, votre agence sera soumise à validation
                    par le Bureau de Suivi et de Monitoring (BSM). Vous serez
                    notifié une fois la validation effectuée.
                  </p>
                </div>
              </div>
            </div>

            {/* Formulaire (fusionné avec image en haut) */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div
                className="relative h-64 bg-cover bg-center"
                style={{ backgroundImage: "url('/images/agencyy.jpg')" }}
              >
                <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/50 to-transparent"></div>
                <div className="absolute inset-0 flex flex-col justify-center px-8">
                  <h2 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">
                    Nouvelle agence
                  </h2>
                  <p className="text-xl text-white/90 drop-shadow-md">
                    Ajoutez une agence à votre organisation
                  </p>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="p-8">
                {/* Section 1 : Informations principales */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <Building className="w-6 h-6 text-[#6149CD]" />
                    <span>Informations principales</span>
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nom complet de l'agence *
                      </label>
                      <input
                        type="text"
                        name="long_name"
                        value={form_data.long_name}
                        onChange={handleInputChange}
                        placeholder="Ex: Agence SafaraPlace Yaoundé Centre"
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Abréviation *
                      </label>
                      <input
                        type="text"
                        name="short_name"
                        value={form_data.short_name}
                        onChange={handleInputChange}
                        placeholder="Ex: SP-YDE-CTR"
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2 : Localisation */}
                <div className="mb-8 pt-8 border-t border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <MapPin className="w-6 h-6 text-[#6149CD]" />
                    <span>Localisation</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ville *
                      </label>
                      <input
                        type="text"
                        name="ville"
                        value={form_data.ville}
                        onChange={handleInputChange}
                        placeholder="Ex: Yaoundé"
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Zone/Quartier *
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={form_data.location}
                        onChange={handleInputChange}
                        placeholder="Ex: Mvan, Marché Central"
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3 : Informations supplémentaires */}
                <div className="pt-8 border-t border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <Globe className="w-6 h-6 text-[#6149CD]" />
                    <span>Informations supplémentaires</span>
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Réseau social
                      </label>
                      <input
                        type="text"
                        name="social_network"
                        value={form_data.social_network}
                        onChange={handleInputChange}
                        placeholder="Ex: https://facebook.com/agence"
                        className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4 text-[#6149CD]" />
                        <span>Message d'accueil</span>
                      </label>
                      <textarea
                        name="greeting_message"
                        value={form_data.greeting_message}
                        onChange={handleInputChange}
                        placeholder="Message de bienvenue pour vos clients..."
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={form_data.description}
                        onChange={handleInputChange}
                        placeholder="Description détaillée de l'agence..."
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-between mt-8 pt-8 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => router.push("/user/organization/dashboard")}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 active:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>

                  <button
                    type="submit"
                    disabled={is_loading}
                    style={{ backgroundColor: BUTTON_COLOR }}
                    className="px-8 py-3 text-white rounded-xl font-semibold hover:opacity-90 active:opacity-80 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {is_loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Création en cours...</span>
                      </>
                    ) : (
                      <>
                        <Building2 className="w-5 h-5" />
                        <span>Créer l'agence</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Success */}
      {show_success_modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-linear-to-br from-green-400 to-green-600 p-8 text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Agence créée avec succès !
              </h2>
              <p className="text-green-50">
                Votre agence a été soumise pour validation
              </p>
            </div>

            <div className="p-6">
              {agency_response && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <h3 className="font-bold text-gray-900 mb-2">
                    Informations de l'agence
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID Agence :</span>
                      <span className="font-semibold text-gray-900">
                        {agency_response.agencyId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Statut :</span>
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-semibold">
                        {agency_response.statutValidation || "EN_ATTENTE"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  Votre agence est en attente de validation par le BSM. Vous
                  serez notifié du résultat.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    window.location.reload();
                  }}
                  style={{ backgroundColor: BUTTON_COLOR }}
                  className="w-full py-3 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                >
                  Créer une autre agence
                </button>

                <button
                  onClick={() => router.push("/user/organization/dashboard")}
                  className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                >
                  Retour au dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Error */}
      {show_error_modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-linear-to-br from-red-400 to-red-600 p-8 text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Erreur</h2>
              <p className="text-red-50">Une erreur est survenue</p>
            </div>

            <div className="p-6">
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
