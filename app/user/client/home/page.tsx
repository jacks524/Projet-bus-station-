"use client";

import React, { useState, useEffect } from "react";
import {
  Home,
  Calendar,
  FileText,
  Ticket,
  Gift,
  History,
  MapPin,
  ChevronDown,
  User,
  LogOut,
  RefreshCw,
  Search,
  Menu,
  X,
  Settings,
  ChevronLeft,
  ChevronRight,
  Compass,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Agdasima } from "next/font/google";

interface Voyage {
  idVoyage: string;
  titre: string;
  lieuDepart: string;
  lieuArrive: string;
  pointDeDepart: string;
  pointArrivee: string;
  dateDepartPrev: string;
  prix: number;
  smallImage: string;
  nomAgence: string;
  nbrPlaceRestante: number;
}

interface UserData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface AgenceValidee {
  agency_id: string;
  organisation_id: string;
  long_name: string;
  short_name: string;
  location: string;
  ville: string;
  description: string;
  greeting_message: string;
  social_network: string;
  statut_validation: string;
  date_validation: string;
}

const font = Agdasima({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  style: "normal",
});

/**
 * Client Home Page Component
 *
 * A responsive home page displaying available trips for regular users
 * Features sidebar navigation, trip cards grid, and user profile menu
 *
 * @author Thomas Djotio Ndié
 * @date 2025-12-16
 */
export default function ClientHomePage() {
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [is_loading, setIsLoading] = useState(true);
  const [error_message, setErrorMessage] = useState("");
  const [show_profile_menu, setShowProfileMenu] = useState(false);
  const [user_data, setUserData] = useState<UserData | null>(null);
  const [current_page, setCurrentPage] = useState(0);
  const [show_mobile_menu, setShowMobileMenu] = useState(false);
  const [agences, setAgences] = useState<AgenceValidee[]>([]);
  const [agences_page, setAgencesPage] = useState(0);
  const [agences_total_pages, setAgencesTotalPages] = useState(0);
  const [is_loading_agences, setIsLoadingAgences] = useState(false);
  const [agences_search, setAgencesSearch] = useState("");
  const router = useRouter();

  const API_BASE_URL = "http://localhost:8081/api";
  const BUTTON_COLOR = "#6149CD";
  const VOYAGES_PER_PAGE = 15;
  const AGENCES_PER_PAGE = 6;
  const MENU_ITEMS = [
    { icon: Home, label: "Accueil", path: "/user/client/home", active: true },
    {
      icon: Calendar,
      label: "Réserver",
      path: "/user/client/book",
      active: false,
    },
    {
      icon: FileText,
      label: "Réservations",
      path: "/user/client/reservations",
      active: false,
    },
    {
      icon: Ticket,
      label: "Billets",
      path: "/user/client/tickets",
      active: false,
    },
    {
      icon: Gift,
      label: "Coupons",
      path: "/user/client/vouchers",
      active: false,
    },
    {
      icon: History,
      label: "Historique",
      path: "/user/client/history",
      active: false,
    },
    {
      icon: Settings,
      label: "Mes paramètres",
      path: "/user/client/settings",
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
      setUserData(JSON.parse(stored_user_data));
    }
    fetchVoyages();
    fetchAgences();
  }, [current_page, agences_page]);

  const fetchVoyages = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/voyage/all?page=${current_page}&size=${VOYAGES_PER_PAGE}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des voyages");
      }

      const data = await response.json();
      const all_voyages = data.content || [];

      // Filtrer pour ne garder que les voyages avec date future
      const date_actuelle = new Date();
      const voyages_futurs = all_voyages.filter((voyage: Voyage) => {
        const date_depart = new Date(voyage.dateDepartPrev);
        return date_depart > date_actuelle;
      });

      setVoyages(voyages_futurs);
    } catch (error: any) {
      setErrorMessage("Une erreur est survenue");
      console.error("Fetch Voyages Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAgences = async () => {
    setIsLoadingAgences(true);

    try {
      const auth_token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");

      const response = await fetch(
        `${API_BASE_URL}/agence/validated?page=${agences_page}&size=${AGENCES_PER_PAGE}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des agences");
      }

      const data = await response.json();
      setAgences(data.content || []);
      setAgencesTotalPages(data.totalPages || 0);
    } catch (error: any) {
      console.error("Fetch Agences Error:", error);
    } finally {
      setIsLoadingAgences(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("user_data");
    router.push("/login");
  };

  const handleReserver = (voyage_id: string) => {
    router.push(`/user/client/booking?voyage_id=${voyage_id}`);
  };

  const formatDate = (date_string: string) => {
    const date = new Date(date_string);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className={`min-h-screen bg-gray-50 flex ${font.className}`}>
      {/* Sidebar */}
      <>
        <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200 fixed h-full">
          <div className="p-6">
            <div className="mb-8">
              <button
                onClick={() => window.location.reload()}
                className="group relative transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-linear-to-r from-[#6149CD] to-[#8B7BE8] rounded-lg opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300"></div>
                <img
                  src="/images/safaraplace.png"
                  alt="SafaraPlace Logo"
                  className="h-12 w-auto relative z-10 drop-shadow-md group-hover:drop-shadow-xl transition-all duration-300"
                />
              </button>
            </div>

            <nav className="space-y-1">
              {MENU_ITEMS.map((item, index) => (
                <button
                  key={index}
                  onClick={
                    item.active
                      ? () => window.location.reload()
                      : () => router.push(item.path)
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
                      router.push("/user/client/home");
                    }}
                    className="group relative transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    <img
                      src="/images/safaraplace.png"
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
              <h1 className="text-2xl font-semibold text-gray-900">Voyages</h1>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/user/client/settings")}
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
                        router.push("/user/client/settings");
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

          {/* Tabs */}
          <div className="px-6 flex space-x-8 border-b border-gray-200">
            <button className="pb-3 border-b-2 border-[#6149CD] text-[#6149CD] font-medium">
              Tous les voyages
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {voyages.length === 0
                ? "Aucun voyage disponible"
                : "Voyages disponibles"}
            </h2>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchVoyages}
                disabled={is_loading}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-200 active:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${is_loading ? "animate-spin" : ""}`}
                />
                <span>Actualiser</span>
              </button>
              <button
                onClick={() => router.push("/user/client/book")}
                style={{ backgroundColor: BUTTON_COLOR }}
                className="flex items-center space-x-2 px-6 py-2 text-white rounded-lg hover:opacity-90 active:opacity-80 transition-opacity"
              >
                <Calendar className="w-5 h-5" />
                <span>Réserver</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              {is_loading && (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-[#6149CD] animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Chargement des voyages...</p>
                  </div>
                </div>
              )}

              {error_message && !is_loading && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <p className="text-red-600 mb-4">{error_message}</p>
                  <button
                    onClick={fetchVoyages}
                    style={{ backgroundColor: BUTTON_COLOR }}
                    className="px-6 py-2 text-white rounded-lg hover:opacity-90 active:opacity-80 transition-opacity"
                  >
                    Réessayer
                  </button>
                </div>
              )}

              {!is_loading && !error_message && voyages.length === 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3
                    onClick={() => window.location.reload()}
                    className="text-xl font-semibold text-gray-900 mb-2 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                  >
                    Aucun voyage disponible
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Il n'y a pas de voyages disponibles pour le moment.
                  </p>
                  <button
                    onClick={fetchVoyages}
                    style={{ backgroundColor: BUTTON_COLOR }}
                    className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Actualiser
                  </button>
                </div>
              )}

              {!is_loading && !error_message && voyages.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {voyages.map((voyage) => (
                    <div
                      key={voyage.idVoyage}
                      onClick={() => handleReserver(voyage.idVoyage)}
                      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:scale-103 transition-shadow border border-gray-200"
                    >
                      <div className="relative h-48 w-full">
                        <Image
                          src={voyage.smallImage || "/images/rectangle.png"}
                          alt={voyage.titre || "Voyage Image"}
                          fill
                          style={{ objectFit: "cover" }}
                          quality={75}
                        />
                        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                          #{voyage.idVoyage.slice(0, 13)}
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <MapPin className="w-4 h-4 shrink-0 text-gray-600" />
                          <h3 className="font-semibold text-gray-900">
                            De {voyage.lieuDepart} vers {voyage.lieuArrive}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Compass className="w-4 h-4 shrink-0 text-gray-600" />
                          <span className="line-clamp-1 text-gray-600 text-sm">
                            Itinéaire : {voyage.pointDeDepart} vers{" "}
                            {voyage.pointArrivee}
                          </span>
                        </div>
                        <div
                          style={{ backgroundColor: BUTTON_COLOR }}
                          className="flex items-center justify-between px-3 py-2 rounded-lg text-white"
                        >
                          <span className="text-sm">
                            Le {formatDate(voyage.dateDepartPrev)}
                          </span>
                          <span className="font-bold">{voyage.prix} FCFA</span>
                        </div>
                        <button
                          onClick={() => handleReserver(voyage.idVoyage)}
                          className="w-full mt-3 px-4 py-2 border-2 border-[#6149CD] text-[#6149CD] rounded-lg font-semibold hover:bg-[#6149CD] active:opacity-80 hover:text-white transition-colors"
                        >
                          Réserver maintenant
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="w-full lg:w-80 shrink-0">
              <div className="bg-white border border-gray-200 rounded-lg p-4 sticky top-24">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Agences validées
                </h3>

                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={agences_search}
                      onChange={(e) => setAgencesSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 placeholder:text-gray-400 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={fetchAgences}
                    disabled={is_loading_agences}
                    className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors shrink-0"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${
                        is_loading_agences ? "animate-spin" : ""
                      }`}
                    />
                  </button>
                </div>

                {is_loading_agences ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 text-[#6149CD] animate-spin" />
                  </div>
                ) : agences.length === 0 ? (
                  <p className="text-sm text-gray-600 text-center py-8">
                    Aucune agence validée
                  </p>
                ) : (
                  <>
                    <div className="space-y-3 mb-4">
                      {agences
                        .filter((agence) =>
                          agence.short_name
                            .toLowerCase()
                            .includes(agences_search.toLowerCase())
                        )
                        .map((agence) => (
                          <div
                            key={agence.agency_id}
                            className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                          >
                            <h4 className="font-semibold text-sm text-gray-900 mb-1 truncate">
                              Nom : {agence.long_name}
                            </h4>
                            <h3 className="font-semibold text-sm text-gray-900 mb-1 truncate">
                              Abriévation : {agence.short_name}
                            </h3>
                            <p className="text-xs text-gray-600 line-clamp-1">
                              Ville : {agence.ville}
                            </p>
                            <p className="text-xs text-gray-600 line-clamp-1">
                              Zone : {agence.location}
                            </p>
                            <p className="text-xs text-gray-600 line-clamp-1">
                              Réseau social : {agence.social_network}
                            </p>
                          </div>
                        ))}
                    </div>

                    {agences_total_pages > 1 && (
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <button
                          onClick={() =>
                            setAgencesPage(Math.max(0, agences_page - 1))
                          }
                          disabled={agences_page === 0}
                          className="p-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        <span className="text-sm text-gray-600">
                          {agences_page + 1} / {agences_total_pages}
                        </span>

                        <button
                          onClick={() =>
                            setAgencesPage(
                              Math.min(
                                agences_total_pages - 1,
                                agences_page + 1
                              )
                            )
                          }
                          disabled={agences_page === agences_total_pages - 1}
                          className="p-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
