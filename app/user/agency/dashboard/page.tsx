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
  Users,
  Car,
  TrendingUp,
  RefreshCw,
  Calendar,
  Bus,
  Ticket,
  AlertCircle,
  UserPlus,
  BarChart3,
  PieChart,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../../providers";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

/**
 * Agency Dashboard Page Component
 *
 * Dashboard for agency managers (Chef d'agence)
 * Displays agency statistics, evolution charts, and key metrics
 *
 * @author Thomas Djotio Ndié
 * @date 2025-01-16
 */

interface GeneralStatistics {
  nombreEmployes: number;
  nombreChauffeurs: number;
  nombreVoyages: number;
  voyagesParStatut: Record<string, number>;
  nombreReservations: number;
  reservationsParStatut: Record<string, number>;
  revenus: number;
  nouveauxUtilisateurs: number;
  tauxOccupation: number;
  revenue_by_class: { [key: string]: number };
  top_destinations: { [key: string]: number };
  top_origins: { [key: string]: number };
  reservations_by_day_of_week: { [key: string]: number };
  trips_by_driver: { [key: string]: number };
}

interface EvolutionData {
  date: string;
  valeur: number;
  montant: number;
}

interface EvolutionStatistics {
  evolutionReservations: EvolutionData[];
  evolutionVoyages: EvolutionData[];
  evolutionRevenus: EvolutionData[];
  evolutionUtilisateurs: EvolutionData[];
  evolution_taux_occupation: EvolutionData[];
  evolution_annulations: EvolutionData[];
  revenue_per_month: { [key: string]: number };
  reservations_per_month: { [key: string]: number };
}

interface AgenceValidee {
  agency_id: string;
  organisation_id: string;
  user_id: string;
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

interface UserData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  userId: string;
  role: string[];
  token: string;
}

export default function AgenceDashboardPage() {
  const [general_stats, setGeneralStats] = useState<GeneralStatistics | null>(
    null,
  );
  const [evolution_stats, setEvolutionStats] =
    useState<EvolutionStatistics | null>(null);
  const [agences, setAgences] = useState<AgenceValidee[]>([]);
  const [selected_agence, setSelectedAgence] = useState<AgenceValidee | null>(
    null,
  );

  const [is_loading_stats, setIsLoadingStats] = useState(true);
  const [is_loading_agences, setIsLoadingAgences] = useState(true);
  const [error_message, setErrorMessage] = useState("");

  const [show_profile_menu, setShowProfileMenu] = useState(false);
  const [show_mobile_menu, setShowMobileMenu] = useState(false);
  const [user_data, setUserData] = useState<UserData | null>(null);

  const [show_agence_selector, setShowAgenceSelector] = useState(false);
  const [active_chart, setActiveChart] = useState<
    "reservations" | "voyages" | "revenus" | "utilisateurs"
  >("reservations");

  const router = useRouter();
  const { t } = useLanguage();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const BUTTON_COLOR = "#6149CD";

  const MENU_ITEMS = [
    {
      icon: Home,
      label: t("Dashboard", "Dashboard"),
      path: "/user/agency/dashboard",
      active: true,
    },
    {
      icon: Bus,
      label: t("Voyages", "Trips"),
      path: "/user/agency/travels",
      active: false,
    },
    {
      icon: Calendar,
      label: t("Réservations", "Bookings"),
      path: "/user/agency/reservations",
      active: false,
    },
    {
      icon: Users,
      label: t("Chauffeurs", "Drivers"),
      path: "/user/agency/drivers",
      active: false,
    },
    {
      icon: Settings,
      label: t("Mes paramètres", "Settings"),
      path: "/user/agency/settings",
      active: false,
    },
  ];

  const CHART_COLORS = ["#6149CD", "#8B7BE8", "#A594F9", "#C4B5FD", "#E9E3FF"];
  const PIE_COLORS = ["#10B981", "#F59E0B", "#EF4444", "#6366F1", "#8B5CF6"];

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
      setUserData(parsed_user);
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (user_data?.userId) {
      fetchAgences();
    }
  }, [user_data?.userId]);

  useEffect(() => {
    if (selected_agence?.agency_id) {
      fetchGeneralStatistics(selected_agence.agency_id);
      fetchEvolutionStatistics(selected_agence.agency_id);
    }
  }, [selected_agence?.agency_id]);

  const getAuthToken = () => {
    return (
      localStorage.getItem("auth_token") ||
      sessionStorage.getItem("auth_token") ||
      ""
    );
  };

  const fetchAgences = async () => {
    setIsLoadingAgences(true);
    setErrorMessage("");

    try {
      const auth_token = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/agence/validated?page=0&size=1000`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth_token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(t("Erreur lors du chargement des agences", "Error loading agencies"));
      }

      const data = await response.json();
      const all_agences = data.content || data || [];

      const my_agences = all_agences.filter(
        (agence: AgenceValidee) => agence.user_id === user_data?.userId,
      );

      setAgences(my_agences);

      if (my_agences.length > 0 && !selected_agence) {
        setSelectedAgence(my_agences[0]);
      }

      if (my_agences.length === 0) {
        setIsLoadingStats(false);
      }
    } catch (error: any) {
      console.error("Fetch Agences Error:", error);
      setErrorMessage(t("Impossible de charger vos agences", "Unable to load your agencies"));
      setIsLoadingStats(false);
    } finally {
      setIsLoadingAgences(false);
    }
  };

  const fetchGeneralStatistics = async (agence_id: string) => {
    setIsLoadingStats(true);
    setErrorMessage("");

    try {
      const auth_token = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/statistics/agence/${agence_id}/general`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth_token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(t("Erreur lors du chargement des statistiques", "Error loading statistics"));
      }

      const data = await response.json();
      setGeneralStats(data);
    } catch (error: any) {
      console.error("Fetch General Stats Error:", error);
      setErrorMessage(t("Impossible de charger les statistiques générales", "Unable to load general statistics"));
    } finally {
      setIsLoadingStats(false);
    }
  };

  const fetchEvolutionStatistics = async (agence_id: string) => {
    try {
      const auth_token = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/statistics/agence/${agence_id}/evolution`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth_token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(t("Erreur lors du chargement des évolutions", "Error loading trends"));
      }

      const data = await response.json();
      setEvolutionStats(data);
    } catch (error: any) {
      console.error("Fetch Evolution Stats Error:", error);
    }
  };

  const handleSelectAgence = (agence: AgenceValidee) => {
    setSelectedAgence(agence);
    setShowAgenceSelector(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("user_data");
    router.push("/login");
  };

  const handleRefresh = () => {
    if (selected_agence?.agency_id) {
      fetchGeneralStatistics(selected_agence.agency_id);
      fetchEvolutionStatistics(selected_agence.agency_id);
    }
    fetchAgences();
  };

  const formatRevenue = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      month: "numeric",
      year: "numeric",
    });
  };

  const formatDateFull = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Préparer les données pour les graphiques
  const getChartData = () => {
    if (!evolution_stats) return [];

    switch (active_chart) {
      case "reservations":
        return (
          evolution_stats.evolutionReservations?.map((item) => ({
            date: formatDate(item.date),
            valeur: item.valeur,
            montant: item.montant,
          })) || []
        );
      case "voyages":
        return (
          evolution_stats.evolutionVoyages?.map((item) => ({
            date: formatDate(item.date),
            valeur: item.valeur,
            montant: item.montant,
          })) || []
        );
      case "revenus":
        return (
          evolution_stats.evolutionRevenus?.map((item) => ({
            date: formatDate(item.date),
            valeur: item.valeur,
            montant: item.montant,
          })) || []
        );
      case "utilisateurs":
        return (
          evolution_stats.evolutionUtilisateurs?.map((item) => ({
            date: formatDate(item.date),
            valeur: item.valeur,
            montant: item.montant,
          })) || []
        );
      default:
        return [];
    }
  };

  const getVoyagesStatusData = () => {
    if (!general_stats?.voyagesParStatut) return [];
    return Object.entries(general_stats.voyagesParStatut).map(
      ([name, value], index) => ({
        name: name,
        value: value,
        color: PIE_COLORS[index % PIE_COLORS.length],
      }),
    );
  };

  const getChartTitle = () => {
    switch (active_chart) {
      case "reservations":
        return t("Évolution des réservations", "Reservations trend");
      case "voyages":
        return t("Évolution des voyages", "Trips trend");
      case "revenus":
        return t("Évolution des revenus", "Revenue trend");
      case "utilisateurs":
        return t("Évolution des utilisateurs", "Users trend");
      default:
        return "";
    }
  };

  // Préparer les données pour le graphique en camembert des réservations par statut
  const getReservationsStatusData = () => {
    if (!general_stats?.reservationsParStatut) return [];
    return Object.entries(general_stats.reservationsParStatut).map(
      ([name, value], index) => ({
        name: name,
        value: value,
        color: PIE_COLORS[index % PIE_COLORS.length],
      }),
    );
  };

  // Nouvelles fonctions utilitaires
  const prepareBarChartData = (data: { [key: string]: number }) => {
    return Object.entries(data)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({
        name: name.length > 15 ? name.substring(0, 15) + "..." : name,
        value,
      }));
  };

  const prepareDayOfWeekData = (data: { [key: string]: number }) => {
    const daysOrder = [
      t("Lundi", "Monday"),
      t("Mardi", "Tuesday"),
      t("Mercredi", "Wednesday"),
      t("Jeudi", "Thursday"),
      t("Vendredi", "Friday"),
      t("Samedi", "Saturday"),
      t("Dimanche", "Sunday"),
    ];
    return daysOrder
      .map((day) => ({
        day,
        value: data[day] || 0,
      }))
      .filter((item) => item.value > 0);
  };

  const prepareMonthlyData = (data: { [key: string]: number }) => {
    return Object.entries(data)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, value]) => ({
        month,
        value,
      }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <>
        <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200 fixed h-full">
          <div className="p-6">
            <div className="mb-8">
              <button
                onClick={() => router.push("/user/agency/dashboard")}
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
                      router.push("/user/agency/dashboard");
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
                {t("Dashboard Agence", "Agency dashboard")}
              </h1>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={handleRefresh}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={t("Actualiser", "Refresh")}
              >
                <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
              </button>

              <button
                onClick={() => router.push("/user/agency/settings")}
                className="hidden sm:block p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-6 h-6 text-gray-600" />
              </button>

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
                    {user_data?.username}
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
                          router.push("/user/agency/settings");
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">
                          {t("Paramètres", "Settings")}
                        </span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 transition-colors text-red-600"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t("Se déconnecter", "Sign out")}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-3 sm:p-4 md:p-6">
          {/* Loading State */}
          {(is_loading_agences || is_loading_stats) && agences.length === 0 && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-[#6149CD] animate-spin mx-auto mb-4" />
                <p className="text-gray-600">
                  {t("Chargement en cours...", "Loading...")}
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {!is_loading_agences && error_message && (
            <div className="bg-red-50 border border-red-200 rounded-xl shadow-sm p-6 sm:p-12 text-center">
              <p className="text-sm sm:text-base text-red-600 mb-6">
                {error_message}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#6149CD] text-white rounded-lg hover:opacity-75 transition-colors text-sm sm:text-base"
              >
                {t("Réessayer", "Try again")}
              </button>
            </div>
          )}

          {/* No Agences State */}
          {!is_loading_agences && agences.length === 0 && !error_message && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-12 text-center">
              <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                {t("Aucune agence validée", "No validated agency")}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                {t(
                  "Vous n'avez pas encore d'agence validée ou en attente",
                  "You don't have any validated or pending agency yet"
                )}
              </p>
              <button
                onClick={() => router.push("/user/agency/create")}
                style={{ backgroundColor: BUTTON_COLOR }}
                className="px-4 sm:px-6 py-2.5 sm:py-3 text-white rounded-lg hover:opacity-90 transition-opacity text-sm sm:text-base"
              >
                {t("Créer une agence", "Create an agency")}
              </button>
            </div>
          )}

          {/* Main Dashboard Content */}
          {!is_loading_agences && agences.length > 0 && (
            <div className="space-y-4 sm:space-y-6">
              {/* Agence Selector */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 sm:p-3 bg-linear-to-br from-[#6149CD] to-[#8B7BE8] rounded-lg sm:rounded-xl">
                      <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-600">
                        {t("Agence sélectionnée", "Selected agency")}
                      </p>
                      <h2 className="text-base sm:text-xl font-bold text-gray-900 truncate">
                        {selected_agence?.long_name || t("Aucune", "None")}
                      </h2>
                      <p className="text-xs text-gray-500">
                        {selected_agence?.ville} - {selected_agence?.location}
                      </p>
                    </div>
                  </div>

                  {agences.length > 1 && (
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowAgenceSelector(!show_agence_selector)
                        }
                        className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-gray-700 text-sm sm:text-base">
                          {t("Changer", "Switch")}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                      </button>

                      {show_agence_selector && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowAgenceSelector(false)}
                          ></div>
                          <div className="absolute right-0 sm:right-0 left-0 sm:left-auto mt-2 w-full sm:w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 max-h-60 overflow-y-auto">
                            {agences.map((agence) => (
                              <button
                                key={agence.agency_id}
                                onClick={() => handleSelectAgence(agence)}
                                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                                  selected_agence?.agency_id ===
                                  agence.agency_id
                                    ? "bg-purple-50 border-l-4 border-[#6149CD]"
                                    : ""
                                }`}
                              >
                                <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                                  {agence.long_name}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-600">
                                  {agence.short_name} - {agence.ville}
                                </p>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Loading Stats */}
              {is_loading_stats && (
                <div className="flex items-center justify-center py-10">
                  <RefreshCw className="w-8 h-8 text-[#6149CD] animate-spin" />
                </div>
              )}

              {/* Error Message */}
              {error_message && !is_loading_stats && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 text-center">
                  <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 text-sm sm:text-base">
                    {error_message}
                  </p>
                  <button
                    onClick={handleRefresh}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
                  >
                    {t("Réessayer", "Try again")}
                  </button>
                </div>
              )}

              {/* Stats Content */}
              {!is_loading_stats && !error_message && general_stats && (
                <>
                  {/* Top Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
                      <div className="flex items-center justify-between mb-2 sm:mb-4">
                        <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                          <Users className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
                        </div>
                      </div>
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                        {general_stats.nombreEmployes}
                      </h3>
                      <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">
                        {t("Employés", "Employees")}
                      </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
                      <div className="flex items-center justify-between mb-2 sm:mb-4">
                        <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                          <Car className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
                        </div>
                      </div>
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                        {general_stats.nombreChauffeurs}
                      </h3>
                      <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">
                        {t("Chauffeurs", "Drivers")}
                      </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
                      <div className="flex items-center justify-between mb-2 sm:mb-4">
                        <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
                          <Bus className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
                        </div>
                      </div>
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                        {general_stats.nombreVoyages}
                      </h3>
                      <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">
                        {t("Voyages", "Trips")}
                      </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
                      <div className="flex items-center justify-between mb-2 sm:mb-4">
                        <div className="p-2 sm:p-3 bg-orange-100 rounded-lg">
                          <Ticket className="w-4 h-4 sm:w-6 sm:h-6 text-orange-600" />
                        </div>
                      </div>
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                        {general_stats.nombreReservations}
                      </h3>
                      <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">
                        {t("Réservations", "Bookings")}
                      </p>
                    </div>
                  </div>

                  {/* Revenue and Metrics Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                    <div className="bg-linear-to-br from-green-400 to-green-600 rounded-xl shadow-lg p-4 sm:p-6 text-white">
                      <div className="flex items-center justify-between mb-2 sm:mb-4">
                        <h3 className="text-sm sm:text-lg font-semibold">
                        {t("Revenus totaux potentiels", "Potential total revenue")}
                        </h3>
                        <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <p className="text-lg sm:text-2xl md:text-3xl font-bold break-all">
                        {formatRevenue(general_stats.revenus)}
                      </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                      <div className="flex items-center space-x-2 mb-2">
                        <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-[#6149CD]" />
                        <h3 className="text-gray-600 text-xs sm:text-base">
                          {t("Nouveaux utilisateurs", "New users")}
                        </h3>
                      </div>
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                        {general_stats.nouveauxUtilisateurs}
                      </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 sm:col-span-2 md:col-span-1">
                      <h3 className="text-gray-600 mb-2 text-xs sm:text-base">
                        {t("Taux d'occupation", "Occupancy rate")}
                      </h3>
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                            <div
                              className="bg-[#6149CD] h-2 sm:h-3 rounded-full transition-all duration-300"
                              style={{
                                width: `${general_stats.tauxOccupation}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-lg sm:text-2xl font-bold text-gray-900">
                          {general_stats.tauxOccupation.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Evolution Chart Section */}
                  {evolution_stats && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="w-5 h-5 text-[#6149CD]" />
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                            {getChartTitle()}
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setActiveChart("reservations")}
                            className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg transition-colors ${
                              active_chart === "reservations"
                                ? "bg-[#6149CD] text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {t("Réservations", "Bookings")}
                          </button>
                          <button
                            onClick={() => setActiveChart("voyages")}
                            className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg transition-colors ${
                              active_chart === "voyages"
                                ? "bg-[#6149CD] text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {t("Voyages", "Trips")}
                          </button>
                          <button
                            onClick={() => setActiveChart("revenus")}
                            className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg transition-colors ${
                              active_chart === "revenus"
                                ? "bg-[#6149CD] text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {t("Revenus", "Revenue")}
                          </button>
                          <button
                            onClick={() => setActiveChart("utilisateurs")}
                            className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg transition-colors ${
                              active_chart === "utilisateurs"
                                ? "bg-[#6149CD] text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {t("Utilisateurs", "Users")}
                          </button>
                        </div>
                      </div>

                      <div className="h-64 sm:h-80">
                        {getChartData().length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={getChartData()}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#E5E7EB"
                              />
                              <XAxis
                                dataKey="date"
                                stroke="#6B7280"
                                fontSize={12}
                                tickLine={false}
                              />
                              <YAxis
                                stroke="#6B7280"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "#fff",
                                  border: "1px solid #E5E7EB",
                                  borderRadius: "8px",
                                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                                }}
                                labelStyle={{ color: "#374151" }}
                              />
                              <Line
                                type="monotone"
                                dataKey="valeur"
                                stroke="#6149CD"
                                strokeWidth={3}
                                dot={{ fill: "#6149CD", strokeWidth: 2, r: 4 }}
                                activeDot={{
                                  r: 6,
                                  fill: "#6149CD",
                                  stroke: "#fff",
                                  strokeWidth: 2,
                                }}
                              />
                              {active_chart === "revenus" && (
                                <Line
                                  type="monotone"
                                  dataKey="montant"
                                  stroke="#10B981"
                                  strokeWidth={2}
                                  dot={{
                                    fill: "#10B981",
                                    strokeWidth: 2,
                                    r: 3,
                                  }}
                                />
                              )}
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">
                              {t("Aucune donnée disponible", "No data available")}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Status Charts Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Voyages par statut
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <PieChart className="w-5 h-5 text-[#6149CD]" />
                        <h3 className="text-base sm:text-lg font-bold text-gray-900">
                          {t("Voyages par statut", "Trips by status")}
                        </h3>
                      </div>
                      <div className="h-48 sm:h-64">
                        {getVoyagesStatusData().length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={getVoyagesStatusData()}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={70}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {getVoyagesStatusData().map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                  />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "#fff",
                                  border: "1px solid #E5E7EB",
                                  borderRadius: "8px",
                                }}
                              />
                              <Legend
                                verticalAlign="bottom"
                                height={36}
                                formatter={(value) => (
                                  <span className="text-xs sm:text-sm text-gray-700">
                                    {value}
                                  </span>
                                )}
                              />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500 text-sm">
                              Aucun voyage
                            </p>
                          </div>
                        )}
                      </div>
                    </div> */}

                    {/* Réservations par statut
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <PieChart className="w-5 h-5 text-[#6149CD]" />
                        <h3 className="text-base sm:text-lg font-bold text-gray-900">
                          {t("Réservations par statut", "Bookings by status")}
                        </h3>
                      </div>
                      <div className="h-48 sm:h-64">
                        {getReservationsStatusData().length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={getReservationsStatusData()}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={70}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {getReservationsStatusData().map(
                                  (entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={entry.color}
                                    />
                                  )
                                )}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "#fff",
                                  border: "1px solid #E5E7EB",
                                  borderRadius: "8px",
                                }}
                              />
                              <Legend
                                verticalAlign="bottom"
                                height={36}
                                formatter={(value) => (
                                  <span className="text-xs sm:text-sm text-gray-700">
                                    {value}
                                  </span>
                                )}
                              />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500 text-sm">
                              {t("Aucune réservation", "No bookings")}
                            </p>
                          </div>
                        )}
                      </div>
                    </div> */}
                  </div>

                  {/* New Charts Section - Statistiques avancées */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Revenus par classe */}
                    {general_stats.revenue_by_class &&
                      Object.keys(general_stats.revenue_by_class).length >
                        0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                            {t("Revenus par classe", "Revenue by class")}
                          </h3>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={prepareBarChartData(
                                  general_stats.revenue_by_class,
                                )}
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke="#E5E7EB"
                                />
                                <XAxis
                                  dataKey="name"
                                  stroke="#6B7280"
                                  fontSize={12}
                                />
                                <YAxis stroke="#6B7280" fontSize={12} />
                                <Tooltip
                                  formatter={(value) =>
                                    formatRevenue(value as number)
                                  }
                                  contentStyle={{
                                    backgroundColor: "#fff",
                                    border: "1px solid #E5E7EB",
                                    borderRadius: "8px",
                                  }}
                                />
                                <Legend />
                                <Bar
                                  dataKey="value"
                                  fill="#6149CD"
                                  name={t("Revenu", "Revenue")}
                                  radius={[8, 8, 0, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}

                    {/* Top destinations */}
                    {general_stats.top_destinations &&
                      Object.keys(general_stats.top_destinations).length >
                        0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                            {t("Top 10 destinations", "Top 10 destinations")}
                          </h3>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={prepareBarChartData(
                                  general_stats.top_destinations,
                                )}
                                layout="vertical"
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke="#E5E7EB"
                                />
                                <XAxis
                                  type="number"
                                  stroke="#6B7280"
                                  fontSize={12}
                                />
                                <YAxis
                                  dataKey="name"
                                  type="category"
                                  width={100}
                                  stroke="#6B7280"
                                  fontSize={12}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "#fff",
                                    border: "1px solid #E5E7EB",
                                    borderRadius: "8px",
                                  }}
                                />
                                <Legend />
                                <Bar
                                  dataKey="value"
                                  fill="#10B981"
                                  name={t("Voyages", "Trips")}
                                  radius={[0, 8, 8, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}

                    {/* Top origines
                    {general_stats.top_origins &&
                      Object.keys(general_stats.top_origins).length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                            {t("Top 10 villes d'origine", "Top 10 origin cities")}
                          </h3>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={prepareBarChartData(
                                  general_stats.top_origins,
                                )}
                                layout="vertical"
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke="#E5E7EB"
                                />
                                <XAxis
                                  type="number"
                                  stroke="#6B7280"
                                  fontSize={12}
                                />
                                <YAxis
                                  dataKey="name"
                                  type="category"
                                  width={100}
                                  stroke="#6B7280"
                                  fontSize={12}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "#fff",
                                    border: "1px solid #E5E7EB",
                                    borderRadius: "8px",
                                  }}
                                />
                                <Legend />
                                <Bar
                                  dataKey="value"
                                  fill="#F59E0B"
                                  name={t("Voyages", "Trips")}
                                  radius={[0, 8, 8, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )} */}

                    {/* Réservations par jour de la semaine */}
                    {general_stats.reservations_by_day_of_week &&
                      Object.keys(general_stats.reservations_by_day_of_week)
                        .length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                            {t("Réservations par jour", "Bookings by day")}
                          </h3>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={prepareDayOfWeekData(
                                  general_stats.reservations_by_day_of_week,
                                )}
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke="#E5E7EB"
                                />
                                <XAxis
                                  dataKey="day"
                                  stroke="#6B7280"
                                  fontSize={12}
                                />
                                <YAxis stroke="#6B7280" fontSize={12} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "#fff",
                                    border: "1px solid #E5E7EB",
                                    borderRadius: "8px",
                                  }}
                                />
                                <Legend />
                                <Bar
                                  dataKey="value"
                                  fill="#8B5CF6"
                                  name={t("Réservations", "Bookings")}
                                  radius={[8, 8, 0, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}

                    {/* Voyages par chauffeur */}
                    {general_stats.trips_by_driver &&
                      Object.keys(general_stats.trips_by_driver).length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:col-span-2">
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                            {t("Top 10 chauffeurs (par nombre de voyages)", "Top 10 drivers (by trips)")}
                          </h3>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={prepareBarChartData(
                                  general_stats.trips_by_driver,
                                )}
                                layout="vertical"
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke="#E5E7EB"
                                />
                                <XAxis
                                  type="number"
                                  stroke="#6B7280"
                                  fontSize={12}
                                />
                                <YAxis
                                  dataKey="name"
                                  type="category"
                                  width={120}
                                  stroke="#6B7280"
                                  fontSize={12}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "#fff",
                                    border: "1px solid #E5E7EB",
                                    borderRadius: "8px",
                                  }}
                                />
                                <Legend />
                                <Bar
                                  dataKey="value"
                                  fill="#EF4444"
                                  name={t("Voyages", "Trips")}
                                  radius={[0, 8, 8, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Evolution Charts - Nouveaux graphiques */}
                  {evolution_stats && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      {/* Evolution taux d'occupation */}
                      {evolution_stats.evolution_taux_occupation &&
                        evolution_stats.evolution_taux_occupation.length >
                          0 && (
                          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                              {t("Évolution du taux d'occupation", "Occupancy rate trend")}
                            </h3>
                            <div className="h-64">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                  data={evolution_stats.evolution_taux_occupation.map(
                                    (item) => ({
                                      date: formatDate(item.date),
                                      valeur: item.valeur,
                                    }),
                                  )}
                                >
                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#E5E7EB"
                                  />
                                  <XAxis
                                    dataKey="date"
                                    stroke="#6B7280"
                                    fontSize={12}
                                  />
                                  <YAxis stroke="#6B7280" fontSize={12} />
                                  <Tooltip
                                    contentStyle={{
                                      backgroundColor: "#fff",
                                      border: "1px solid #E5E7EB",
                                      borderRadius: "8px",
                                    }}
                                  />
                                  <Legend />
                                  <Line
                                    type="monotone"
                                    dataKey="valeur"
                                    stroke="#6149CD"
                                    strokeWidth={2}
                                    dot={{ fill: "#6149CD", r: 3 }}
                                    name={t("Taux (%)", "Rate (%)")}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}

                      {/* Evolution annulations */}
                      {evolution_stats.evolution_annulations &&
                        evolution_stats.evolution_annulations.length > 0 && (
                          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                              {t("Évolution des annulations", "Cancellations trend")}
                            </h3>
                            <div className="h-64">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                  data={evolution_stats.evolution_annulations.map(
                                    (item) => ({
                                      date: formatDate(item.date),
                                      valeur: item.valeur,
                                    }),
                                  )}
                                >
                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#E5E7EB"
                                  />
                                  <XAxis
                                    dataKey="date"
                                    stroke="#6B7280"
                                    fontSize={12}
                                  />
                                  <YAxis stroke="#6B7280" fontSize={12} />
                                  <Tooltip
                                    contentStyle={{
                                      backgroundColor: "#fff",
                                      border: "1px solid #E5E7EB",
                                      borderRadius: "8px",
                                    }}
                                  />
                                  <Legend />
                                  <Line
                                    type="monotone"
                                    dataKey="valeur"
                                    stroke="#EF4444"
                                    strokeWidth={2}
                                    dot={{ fill: "#EF4444", r: 3 }}
                                    name={t("Annulations", "Cancellations")}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}

                      {/* Revenus par mois */}
                      {evolution_stats.revenue_per_month &&
                        Object.keys(evolution_stats.revenue_per_month).length >
                          0 && (
                          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                              {t("Revenus par mois", "Revenue per month")}
                            </h3>
                            <div className="h-64">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={prepareMonthlyData(
                                    evolution_stats.revenue_per_month,
                                  )}
                                >
                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#E5E7EB"
                                  />
                                  <XAxis
                                    dataKey="month"
                                    stroke="#6B7280"
                                    fontSize={12}
                                  />
                                  <YAxis stroke="#6B7280" fontSize={12} />
                                  <Tooltip
                                    formatter={(value) =>
                                      formatRevenue(value as number)
                                    }
                                    contentStyle={{
                                      backgroundColor: "#fff",
                                      border: "1px solid #E5E7EB",
                                      borderRadius: "8px",
                                    }}
                                  />
                                  <Legend />
                                  <Bar
                                    dataKey="value"
                                    fill="#10B981"
                                    name={t("Revenu", "Revenue")}
                                    radius={[8, 8, 0, 0]}
                                  />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}

                      {/* Réservations par mois */}
                      {evolution_stats.reservations_per_month &&
                        Object.keys(evolution_stats.reservations_per_month)
                          .length > 0 && (
                          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                              {t("Réservations par mois", "Bookings per month")}
                            </h3>
                            <div className="h-64">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={prepareMonthlyData(
                                    evolution_stats.reservations_per_month,
                                  )}
                                >
                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#E5E7EB"
                                  />
                                  <XAxis
                                    dataKey="month"
                                    stroke="#6B7280"
                                    fontSize={12}
                                  />
                                  <YAxis stroke="#6B7280" fontSize={12} />
                                  <Tooltip
                                    contentStyle={{
                                      backgroundColor: "#fff",
                                      border: "1px solid #E5E7EB",
                                      borderRadius: "8px",
                                    }}
                                  />
                                  <Legend />
                                  <Bar
                                    dataKey="value"
                                    fill="#6149CD"
                                    name={t("Réservations", "Bookings")}
                                    radius={[8, 8, 0, 0]}
                                  />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                  {/* Agence Info Card */}
                  {selected_agence && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                        {t("Informations de l'agence", "Agency information")}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {t("Nom complet", "Full name")}
                          </p>
                          <p className="text-sm sm:text-base font-semibold text-gray-900">
                            {selected_agence.long_name}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {t("Abréviation", "Abbreviation")}
                          </p>
                          <p className="text-sm sm:text-base font-semibold text-gray-900">
                            {selected_agence.short_name}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {t("Ville", "City")}
                          </p>
                          <p className="text-sm sm:text-base font-semibold text-gray-900">
                            {selected_agence.ville}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {t("Localisation", "Location")}
                          </p>
                          <p className="text-sm sm:text-base font-semibold text-gray-900">
                            {selected_agence.location}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {t("Statut", "Status")}
                          </p>
                          <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 text-xs sm:text-sm rounded-full font-semibold">
                            {selected_agence.statut_validation}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {t("Date de validation", "Validation date")}
                          </p>
                          <p className="text-sm sm:text-base font-semibold text-gray-900">
                            {formatDateFull(selected_agence.date_validation)}
                          </p>
                        </div>
                        {selected_agence.description && (
                          <div className="sm:col-span-2 md:col-span-3">
                            <p className="text-xs sm:text-sm text-gray-600">
                              {t("Description", "Description")}
                            </p>
                            <p className="text-sm sm:text-base text-gray-900">
                              {selected_agence.description}
                            </p>
                          </div>
                        )}
                        {selected_agence.social_network && (
                          <div>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {t("Réseau social", "Social network")}
                            </p>
                            <a
                              href={selected_agence.social_network}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm sm:text-base text-[#6149CD] hover:underline"
                            >
                              {selected_agence.social_network}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <button
                      onClick={() => router.push("/user/agency/travels")}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow text-center"
                    >
                      <Bus className="w-6 h-6 sm:w-8 sm:h-8 text-[#6149CD] mx-auto mb-2" />
                      <p className="text-xs sm:text-sm font-medium text-gray-900">
                        {t("Gérer les voyages", "Manage trips")}
                      </p>
                    </button>
                    <button
                      onClick={() => router.push("/user/agency/reservations")}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow text-center"
                    >
                      <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-[#6149CD] mx-auto mb-2" />
                      <p className="text-xs sm:text-sm font-medium text-gray-900">
                        {t("Réservations", "Bookings")}
                      </p>
                    </button>
                    <button
                      onClick={() => router.push("/user/agency/drivers")}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow text-center"
                    >
                      <Users className="w-6 h-6 sm:w-8 sm:h-8 text-[#6149CD] mx-auto mb-2" />
                      <p className="text-xs sm:text-sm font-medium text-gray-900">
                        {t("Chauffeurs", "Drivers")}
                      </p>
                    </button>
                    <button
                      onClick={() => router.push("/user/agency/settings")}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow text-center"
                    >
                      <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-[#6149CD] mx-auto mb-2" />
                      <p className="text-xs sm:text-sm font-medium text-gray-900">
                        {t("Paramètres", "Settings")}
                      </p>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
