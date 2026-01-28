"use client";

import React, { useState, useEffect } from "react";
import {
  Home,
  Building2,
  Settings,
  ChevronDown,
  User,
  LogOut,
  Menu,
  X,
  Mail,
  Phone,
  MapPinned,
  Shield,
  UserCircle,
  Briefcase,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface UserProfile {
  userId: string;
  first_name: string;
  last_name: string;
  username: string;
  phone_number: string;
  role: string[];
  address: string;
  idcoordonneeGPS: string;
  email: string;
  organization_id?: string;
}

/**
 * DG Settings Page Component
 *
 * Displays user profile information in a clean, organized layout
 * Features readonly form with user details
 *
 * @author Thomas Djotio Ndié
 * @date 2025-01-14
 */
export default function DGSettingsPage() {
  const [user_profile, setUserProfile] = useState<UserProfile | null>(null);
  const [is_loading, setIsLoading] = useState(true);
  const [error_message, setErrorMessage] = useState("");
  const [show_profile_menu, setShowProfileMenu] = useState(false);
  const [show_mobile_menu, setShowMobileMenu] = useState(false);
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
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
      active: false,
    },
    {
      icon: Settings,
      label: "Mes paramètres",
      path: "/user/organization/settings",
      active: true,
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

    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const auth_token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
      console.log(auth_token);

      const response = await fetch(`${API_BASE_URL}/utilisateur/profil`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth_token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors du chargement du profil");
      }

      const data = await response.json();

      const stored_user_data =
        localStorage.getItem("user_data") ||
        sessionStorage.getItem("user_data");

      let email = "";
      let organization_id = "";

      if (stored_user_data) {
        const parsed_data = JSON.parse(stored_user_data);
        email = parsed_data.email || "";
        organization_id = parsed_data.organization_id || "";
      }

      // Combiner les données de l'API avec celles du storage
      setUserProfile({ ...data, email, organization_id });
    } catch (error: any) {
      setErrorMessage("Impossible de charger les informations du profil");
      console.error("Fetch Profile Error:", error);
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

  const getRoleLabel = (role: string) => {
    const role_labels: { [key: string]: string } = {
      USAGER: "Client",
      AGENCE_VOYAGE: "Agence de voyage",
      ORGANISATION: "Directeur Général",
      BSM: "Administrateur BSM",
    };
    return role_labels[role] || role;
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
                  alt="BusStation Logo"
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
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
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
      <div className="flex-1 lg:ml-64 min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => setShowMobileMenu(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
              </button>
              <h1 className="text-lg sm:text-2xl font-semibold text-gray-900">
                Mes paramètres
              </h1>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!show_profile_menu)}
                  className="flex items-center space-x-2 sm:space-x-3 hover:bg-gray-100 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 transition-colors"
                >
                  <img
                    src="/images/user-icon.png"
                    alt="Profile"
                    className="w-7 h-7 sm:w-8.5 sm:h-8.5 rounded-full object-cover"
                  />
                  <span className="font-medium text-gray-900 hidden md:block text-sm sm:text-base">
                    {user_profile?.username}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-600 hidden sm:block" />
                </button>

                {show_profile_menu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowProfileMenu(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
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
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 sm:p-6 max-w-5xl mx-auto">
          {is_loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Settings className="w-10 h-10 sm:w-12 sm:h-12 text-[#6149CD] animate-spin mx-auto mb-4" />
                <p className="text-gray-600 text-sm sm:text-base">
                  Chargement de votre profil...
                </p>
              </div>
            </div>
          )}

          {error_message && !is_loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 text-center">
              <p className="text-red-600 mb-4 text-sm sm:text-base">
                {error_message}
              </p>
              <button
                onClick={fetchUserProfile}
                style={{ backgroundColor: BUTTON_COLOR }}
                className="px-4 sm:px-6 py-2 text-white rounded-lg hover:opacity-90 transition-opacity text-sm sm:text-base"
              >
                Réessayer
              </button>
            </div>
          )}

          {!is_loading && !error_message && user_profile && (
            <div className="space-y-4 sm:space-y-6">
              {/* Profile Header */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold shrink-0"
                    style={{ backgroundColor: BUTTON_COLOR }}
                  >
                    {user_profile.last_name?.charAt(0).toUpperCase()}
                    {user_profile.first_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      {user_profile.last_name} {user_profile.first_name}
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base">
                      @{user_profile.username}
                    </p>
                    <div className="flex items-center justify-center sm:justify-start space-x-2 mt-1">
                      <Shield className="w-4 h-4 text-[#6149CD]" />
                      <span className="text-xs sm:text-sm text-gray-700">
                        {user_profile.role.map(getRoleLabel).join(", ")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <UserCircle className="w-5 h-5 text-[#6149CD]" />
                  <span>Informations personnelles</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom
                    </label>
                    <input
                      type="text"
                      value={user_profile?.last_name || ""}
                      readOnly
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={user_profile?.first_name || ""}
                      readOnly
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-[#6149CD]" />
                  <span>Coordonnées</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                      <input
                        type="text"
                        value={user_profile.phone_number || "Non renseigné"}
                        readOnly
                        className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 text-sm sm:text-base min-w-0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                      <input
                        type="email"
                        value={user_profile.email || "Non renseigné"}
                        readOnly
                        className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 text-sm sm:text-base min-w-0"
                      />
                    </div>
                  </div>
                </div>
                {user_profile.address && (
                  <div className="mt-4 sm:mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse
                    </label>
                    <div className="flex items-start space-x-2">
                      <MapPinned className="w-4 h-4 text-gray-400 mt-2.5 shrink-0" />
                      <input
                        type="text"
                        value={user_profile.address}
                        readOnly
                        className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 text-sm sm:text-base min-w-0"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Account Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <User className="w-5 h-5 text-[#6149CD]" />
                  <span>Informations du compte</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom d'utilisateur
                    </label>
                    <input
                      type="text"
                      value={user_profile.username}
                      readOnly
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID utilisateur
                    </label>
                    <input
                      type="text"
                      value={user_profile.userId}
                      readOnly
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 text-sm sm:text-base truncate"
                    />
                  </div>
                  {user_profile.organization_id && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ID Organisation
                      </label>
                      <div className="flex items-center space-x-2">
                        <Briefcase className="w-4 h-4 text-gray-400 shrink-0" />
                        <input
                          type="text"
                          value={user_profile.organization_id}
                          readOnly
                          className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 text-sm sm:text-base min-w-0"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                <button
                  onClick={() => router.push("/user/organization/dashboard")}
                  className="px-4 sm:px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors text-sm sm:text-base order-2 sm:order-1"
                >
                  Retour au dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 sm:px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors text-sm sm:text-base order-1 sm:order-2"
                >
                  Se déconnecter
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
