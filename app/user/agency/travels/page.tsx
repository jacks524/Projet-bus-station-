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
  Bus,
  Calendar,
  MapPin,
  Clock,
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Ticket,
  UserPlus,
  BarChart3,
  PieChart as PieChartIcon,
  Compass,
  Wifi,
  Coffee,
  Package,
  Music,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface Voyage {
  idVoyage: string;
  nomAgence: string;
  lieuDepart: string;
  lieuArrive: string;
  pointDeDepart: string;
  pointArrivee: string;
  nbrPlaceRestante: number;
  nbrPlaceReservable: number;
  nbrPlaceConfirm: number;
  nbrPlaceReserve: number;
  dateDepartPrev: string;
  nomClasseVoyage: string;
  prix: number;
  smallImage: string;
  bigImage: string;
  amenities: string[];
  statusVoyage: string;
}

interface VoyageStatistics {
  titre: string;
  description: string;
  prix: number;
  voyage_id: string;
  lieu_depart: string;
  lieu_arrive: string;
  point_depart: string;
  point_arrivee: string;
  date_depart_prev: string;
  date_depart_effectif: string;
  statut_voyage: string;
  nom_agence: string;
  nom_classe_voyage: string;
  nom_chauffeur: string;
  vehicule_nom: string;
  vehicule_plaque: string;
  total_places: number;
  places_reservees: number;
  places_confirmees: number;
  places_restantes: number;
  taux_occupation: number;
  total_reservations: number;
  total_passagers: number;
  revenus_totaux: number;
  revenus_confirmes: number;
  reservations_by_status: { [key: string]: number };
  passengers_by_gender: { [key: string]: number };
  passengers_by_age_group: { [key: string]: number };
  reservations_per_day: { [key: string]: number };
  revenue_per_day: { [key: string]: number };
  baggage_distribution: { [key: string]: number };
  passengers_origin_city: { [key: string]: number };
}

interface AgenceValidee {
  agency_id: string;
  user_id: string;
  long_name: string;
  short_name: string;
  ville: string;
}

interface UserData {
  username: string;
  userId: string;
}

export default function AgencyTravelsPage() {
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [agences, setAgences] = useState<AgenceValidee[]>([]);
  const [selected_agence, setSelectedAgence] = useState<AgenceValidee | null>(
    null,
  );

  const [is_loading, setIsLoading] = useState(true);
  const [is_loading_agences, setIsLoadingAgences] = useState(true);
  const [error_message, setErrorMessage] = useState("");

  const [show_profile_menu, setShowProfileMenu] = useState(false);
  const [show_mobile_menu, setShowMobileMenu] = useState(false);
  const [show_agence_selector, setShowAgenceSelector] = useState(false);
  const [user_data, setUserData] = useState<UserData | null>(null);

  const [show_delete_modal, setShowDeleteModal] = useState(false);
  const [selected_voyage_to_delete, setSelectedVoyageToDelete] = useState<
    string | null
  >(null);
  const [is_deleting, setIsDeleting] = useState(false);

  const [show_stats_modal, setShowStatsModal] = useState(false);
  const [selected_voyage_stats, setSelectedVoyageStats] =
    useState<VoyageStatistics | null>(null);
  const [is_loading_stats, setIsLoadingStats] = useState(false);

  const [current_page, setCurrentPage] = useState(0);
  const [total_pages, setTotalPages] = useState(0);

  const router = useRouter();

  const API_BASE_URL = "http://localhost:8081/api";
  const BUTTON_COLOR = "#6149CD";
  const VOYAGES_PER_PAGE = 6;

  const MENU_ITEMS = [
    {
      icon: Home,
      label: "Dashboard",
      path: "/user/agency/dashboard",
      active: false,
    },
    { icon: Bus, label: "Voyages", path: "/user/agency/travels", active: true },
    {
      icon: Calendar,
      label: "Réservations",
      path: "/user/agency/reservations",
      active: false,
    },
    {
      icon: Users,
      label: "Chauffeurs",
      path: "/user/agency/chauffeurs",
      active: false,
    },
    {
      icon: Settings,
      label: "Mes paramètres",
      path: "/user/agency/settings",
      active: false,
    },
  ];

  const AMENITIES_ICONS: { [key: string]: any } = {
    WIFI: Wifi,
    CAFE: Coffee,
    BAGAGE: Package,
    MUSIQUE: Music,
  };

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
      fetchVoyages(selected_agence.agency_id);
    }
  }, [selected_agence?.agency_id, current_page]);

  const fetchAgences = async () => {
    setIsLoadingAgences(true);
    try {
      const auth_token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
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

      if (!response.ok)
        throw new Error("Erreur lors du chargement des agences");

      const data = await response.json();
      const all_agences = data.content || data || [];
      const my_agences = all_agences.filter(
        (agence: AgenceValidee) => agence.user_id === user_data?.userId,
      );

      setAgences(my_agences);
      if (my_agences.length > 0 && !selected_agence) {
        setSelectedAgence(my_agences[0]);
      }
    } catch (error: any) {
      console.error("Fetch Agences Error:", error);
      setErrorMessage("Impossible de charger vos agences");
    } finally {
      setIsLoadingAgences(false);
    }
  };

  const fetchVoyages = async (agence_id: string) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const auth_token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
      const response = await fetch(
        `${API_BASE_URL}/voyage/agence/${agence_id}?page=${current_page}&size=${VOYAGES_PER_PAGE}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth_token}`,
          },
        },
      );

      if (!response.ok)
        throw new Error("Erreur lors du chargement des voyages");

      const data = await response.json();
      setVoyages(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (error: any) {
      console.error("Fetch Voyages Error:", error);
      setErrorMessage("Impossible de charger les voyages");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVoyageStatistics = async (voyage_id: string) => {
    setIsLoadingStats(true);
    try {
      const auth_token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
      const response = await fetch(
        `${API_BASE_URL}/statistics/voyage/${voyage_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth_token}`,
          },
        },
      );

      if (!response.ok)
        throw new Error("Erreur lors du chargement des statistiques");

      const data = await response.json();
      setSelectedVoyageStats(data);
      setShowStatsModal(true);
    } catch (error: any) {
      console.error("Fetch Stats Error:", error);
      alert("Impossible de charger les statistiques du voyage");
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleDeleteVoyage = async () => {
    if (!selected_voyage_to_delete) return;

    setIsDeleting(true);
    try {
      const auth_token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
      const response = await fetch(
        `${API_BASE_URL}/voyage/${selected_voyage_to_delete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${auth_token}`,
          },
        },
      );

      if (!response.ok) throw new Error("Erreur lors de la suppression");

      setShowDeleteModal(false);
      setSelectedVoyageToDelete(null);
      if (selected_agence?.agency_id) {
        fetchVoyages(selected_agence.agency_id);
      }
    } catch (error: any) {
      console.error("Delete Voyage Error:", error);
      alert("Erreur lors de la suppression du voyage");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("user_data");
    router.push("/login");
  };

  const handleSelectAgence = (agence: AgenceValidee) => {
    setSelectedAgence(agence);
    setShowAgenceSelector(false);
    setCurrentPage(0);
  };

  const formatDate = (date_string: string) => {
    return new Date(date_string).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateShort = (date_string: string) => {
    return new Date(date_string).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  };

  const formatRevenue = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const isVoyageEffectue = (date_depart: string) => {
    return new Date(date_depart) < new Date();
  };

  const prepareBarChartData = (data: { [key: string]: number }) => {
    return Object.entries(data)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({
        name: name.length > 15 ? name.substring(0, 15) + "..." : name,
        value,
      }));
  };

  const preparePieChartData = (data: { [key: string]: number }) => {
    return Object.entries(data).map(([name, value], index) => ({
      name,
      value,
      color: PIE_COLORS[index % PIE_COLORS.length],
    }));
  };

  const voyages_effectues = voyages.filter((v) =>
    isVoyageEffectue(v.dateDepartPrev),
  );
  const voyages_a_venir = voyages.filter(
    (v) => !isVoyageEffectue(v.dateDepartPrev),
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar navigation */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200 fixed h-full">
        <div className="p-6">
          <div className="mb-8">
            <button
              onClick={() => router.push("/user/agency/dashboard")}
              className="group relative transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <img
                src="/images/busstation.png"
                alt="SafaraPlace Logo"
                className="h-12 w-auto"
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

      {/* Mobile menu */}
      {show_mobile_menu && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setShowMobileMenu(false)}
          ></div>
          <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-2xl z-50 lg:hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <button onClick={() => router.push("/user/agency/dashboard")}>
                  <img
                    src="/images/busstation.png"
                    alt="Logo"
                    className="h-9.5 w-auto"
                  />
                </button>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
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

      {/* Main content area */}
      <div className="flex-1 lg:ml-64 min-w-0">
        {/* Page header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => setShowMobileMenu(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
              </button>
              <h1 className="text-lg sm:text-2xl font-semibold text-gray-900">
                Gestion des voyages
              </h1>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => router.push("/user/agency/travel")}
                style={{ backgroundColor: BUTTON_COLOR }}
                className="flex items-center space-x-2 px-3 sm:px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Créer un voyage</span>
                <span className="sm:hidden">Créer</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!show_profile_menu)}
                  className="flex items-center space-x-2 sm:space-x-3 hover:bg-gray-100 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 transition-colors"
                >
                  <img
                    src="/images/user-icon.png"
                    alt="Profile"
                    className="w-7 h-7 sm:w-8.5 sm:h-8.5 rounded-full"
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

        {/* Main content */}
        <main className="p-3 sm:p-4 md:p-6">
          {/* Loading agencies */}
          {is_loading_agences && agences.length === 0 && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Bus className="w-8 h-8 text-[#6149CD] animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Chargement en cours...</p>
              </div>
            </div>
          )}

          {/* No agencies available */}
          {!is_loading_agences && agences.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-12 text-center">
              <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Aucune agence validée
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Vous devez avoir une agence pour créer des voyages
              </p>
            </div>
          )}

          {/* Main content */}
          {!is_loading_agences && agences.length > 0 && (
            <div className="space-y-4 sm:space-y-6">
              {/* Agency selector */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 sm:p-3 bg-linear-to-br from-[#6149CD] to-[#8B7BE8] rounded-lg sm:rounded-xl">
                      <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-600">
                        Agence sélectionnée
                      </p>
                      <h2 className="text-base sm:text-xl font-bold text-gray-900 truncate">
                        {selected_agence?.long_name || "Aucune"}
                      </h2>
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
                          Changer
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                      </button>

                      {show_agence_selector && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowAgenceSelector(false)}
                          ></div>
                          <div className="absolute right-0 left-0 sm:left-auto mt-2 w-full sm:w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 max-h-60 overflow-y-auto">
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
                                  {agence.ville}
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

              {/* Loading travels */}
              {is_loading && (
                <div className="flex items-center justify-center py-10">
                  <Bus className="w-8 h-8 text-[#6149CD] animate-spin" />
                </div>
              )}

              {/* Error message */}
              {error_message && !is_loading && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 text-center">
                  <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 text-sm sm:text-base">
                    {error_message}
                  </p>
                </div>
              )}

              {/* Travels content */}
              {!is_loading && !error_message && (
                <>
                  {/* Upcoming travels */}
                  {voyages_a_venir.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center space-x-2">
                        <Clock className="w-6 h-6 text-[#6149CD]" />
                        <span>Voyages à venir ({voyages_a_venir.length})</span>
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {voyages_a_venir.map((voyage) => (
                          <div
                            key={voyage.idVoyage}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                          >
                            <div className="relative h-48">
                              <img
                                src={
                                  voyage.smallImage ||
                                  "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800"
                                }
                                alt={voyage.lieuDepart}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-3 right-3">
                                <span className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                                  {voyage.statusVoyage}
                                </span>
                              </div>
                            </div>

                            <div className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-bold text-gray-900">
                                  De {voyage.lieuDepart} vers{" "}
                                  {voyage.lieuArrive}
                                </h3>
                              </div>

                              <div className="space-y-2 mb-4">
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <Compass className="w-4 h-4" />
                                  <span>
                                    De {voyage.pointDeDepart} vers{" "}
                                    {voyage.pointArrivee}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <Clock className="w-4 h-4" />
                                  <span>
                                    {formatDate(voyage.dateDepartPrev)}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <Users className="w-4 h-4" />
                                  <span>
                                    {voyage.nbrPlaceReservable} /{" "}
                                    {voyage.nbrPlaceRestante +
                                      voyage.nbrPlaceConfirm}{" "}
                                    places restantes
                                  </span>
                                </div>
                              </div>

                              {voyage.amenities &&
                                voyage.amenities.length > 0 && (
                                  <div className="flex items-center space-x-2 mb-4">
                                    {voyage.amenities.map((amenity, idx) => {
                                      const Icon =
                                        AMENITIES_ICONS[amenity] || Package;
                                      return (
                                        <div
                                          key={idx}
                                          className="p-2 bg-gray-100 rounded-lg"
                                          title={amenity}
                                        >
                                          <Icon className="w-4 h-4 text-gray-600" />
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                <div>
                                  <p className="text-xs text-gray-600">Prix</p>
                                  <p className="text-lg font-bold text-[#6149CD]">
                                    {formatRevenue(voyage.prix)}
                                  </p>
                                </div>
                                <button
                                  onClick={() => {
                                    setSelectedVoyageToDelete(voyage.idVoyage);
                                    setShowDeleteModal(true);
                                  }}
                                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Supprimer</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Completed travels */}
                  {voyages_effectues.length > 0 && (
                    <div className="space-y-4 mt-8">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center space-x-2">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <span>
                          Voyages effectués ({voyages_effectues.length})
                        </span>
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {voyages_effectues.map((voyage) => (
                          <div
                            key={voyage.idVoyage}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                          >
                            <div className="relative h-48">
                              <img
                                src={
                                  voyage.smallImage ||
                                  "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800"
                                }
                                alt={voyage.lieuDepart}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-3 right-3">
                                <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                                  Effectué
                                </span>
                              </div>
                            </div>

                            <div className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-bold text-gray-900">
                                  De {voyage.lieuDepart} vers{" "}
                                  {voyage.lieuArrive}
                                </h3>
                              </div>

                              <div className="space-y-2 mb-4">
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <Compass className="w-4 h-4" />
                                  <span>
                                    De {voyage.pointDeDepart} vers{" "}
                                    {voyage.pointArrivee}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <Clock className="w-4 h-4" />
                                  <span>
                                    {formatDate(voyage.dateDepartPrev)}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <Users className="w-4 h-4" />
                                  <span>
                                    {voyage.nbrPlaceReservable +
                                      voyage.nbrPlaceConfirm -
                                      voyage.nbrPlaceRestante}{" "}
                                    passager(s)
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                <div>
                                  <p className="text-xs text-gray-600">
                                    Prix unitaire
                                  </p>
                                  <p className="text-lg font-bold text-[#6149CD]">
                                    {formatRevenue(voyage.prix)}
                                  </p>
                                </div>
                                <button
                                  onClick={() =>
                                    fetchVoyageStatistics(voyage.idVoyage)
                                  }
                                  disabled={is_loading_stats}
                                  style={{ backgroundColor: BUTTON_COLOR }}
                                  className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                  <BarChart3 className="w-4 h-4" />
                                  <span>Stats</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No travels available */}
                  {voyages.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                      <Bus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Aucun voyage
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Créez votre premier voyage pour commencer
                      </p>
                      <button
                        onClick={() => router.push("/user/agency/travel")}
                        style={{ backgroundColor: BUTTON_COLOR }}
                        className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity"
                      >
                        Créer un voyage
                      </button>
                    </div>
                  )}

                  {/* Pagination controls */}
                  {total_pages > 1 && (
                    <div className="flex items-center justify-center space-x-4 mt-8">
                      <button
                        onClick={() =>
                          setCurrentPage(Math.max(0, current_page - 1))
                        }
                        disabled={current_page === 0}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Précédent</span>
                      </button>

                      <span className="text-sm text-gray-600">
                        Page {current_page + 1} sur {total_pages}
                      </span>

                      <button
                        onClick={() =>
                          setCurrentPage(
                            Math.min(total_pages - 1, current_page + 1),
                          )
                        }
                        disabled={current_page === total_pages - 1}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <span>Suivant</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </main>

        {/* Statistics modal */}
        {show_stats_modal && selected_voyage_stats && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full my-8">
              {/* Modal header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Statistiques du voyage
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    De {selected_voyage_stats.lieu_depart} vers{" "}
                    {selected_voyage_stats.lieu_arrive}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowStatsModal(false);
                    setSelectedVoyageStats(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Modal content */}
              <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                {/* Principal information */}
                <div className="bg-linear-to-br from-[#6149CD] to-[#8B7BE8] rounded-xl p-6 text-white">
                  <h3 className="text-xl font-bold mb-4">
                    {selected_voyage_stats.titre}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-white/80 text-sm">Chauffeur</p>
                      <p className="font-semibold">
                        {selected_voyage_stats.nom_chauffeur}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/80 text-sm">Véhicule</p>
                      <p className="font-semibold">
                        {selected_voyage_stats.vehicule_nom}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/80 text-sm">Plaque</p>
                      <p className="font-semibold">
                        {selected_voyage_stats.vehicule_plaque}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/80 text-sm">Classe</p>
                      <p className="font-semibold">
                        {selected_voyage_stats.nom_classe_voyage}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Main statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {selected_voyage_stats.total_passagers}
                    </h3>
                    <p className="text-sm text-gray-600">Passagers</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Ticket className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {selected_voyage_stats.total_reservations}
                    </h3>
                    <p className="text-sm text-gray-600">Réservations</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Ticket className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {selected_voyage_stats.places_confirmees}
                    </h3>
                    <p className="text-sm text-gray-600">tickets payés</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {selected_voyage_stats.taux_occupation.toFixed(5)}%
                    </h3>
                    <p className="text-sm text-gray-600">Occupation</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Calendar className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {selected_voyage_stats.places_restantes}
                    </h3>
                    <p className="text-sm text-gray-600">Places restantes</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Calendar className="w-5 h-5 text-orange-900" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {selected_voyage_stats.total_places}
                    </h3>
                    <p className="text-sm text-gray-600">Places totales</p>
                  </div>
                </div>

                {/* Revenue section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-linear-to-br from-green-400 to-green-600 rounded-xl p-6 text-white">
                    <h3 className="text-sm font-semibold mb-2">
                      Revenus potentiels
                    </h3>
                    <p className="text-3xl font-bold">
                      {formatRevenue(selected_voyage_stats.revenus_totaux)}
                    </p>
                  </div>

                  <div className="bg-linear-to-br from-blue-400 to-blue-600 rounded-xl p-6 text-white">
                    <h3 className="text-sm font-semibold mb-2">
                      Revenus confirmés
                    </h3>
                    <p className="text-3xl font-bold">
                      {formatRevenue(selected_voyage_stats.revenus_confirmes)}
                    </p>
                  </div>
                </div>

                {/* Charts section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Revenus par jour */}
                  {Object.keys(selected_voyage_stats.revenue_per_day || {})
                    .length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Revenus par jour
                      </h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={Object.entries(
                              selected_voyage_stats.revenue_per_day,
                            )
                              .sort((a, b) => a[0].localeCompare(b[0]))
                              .map(([date, revenue]) => ({
                                date: formatDateShort(date),
                                revenue,
                              }))}
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
                            <Line
                              type="monotone"
                              dataKey="revenue"
                              stroke="#10B981"
                              strokeWidth={3}
                              dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                              activeDot={{
                                r: 6,
                                fill: "#10B981",
                                stroke: "#fff",
                                strokeWidth: 2,
                              }}
                              name="Revenu"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Passengers by gender */}
                  {Object.keys(selected_voyage_stats.passengers_by_gender || {})
                    .length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Passagers par genre
                      </h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={prepareBarChartData(
                              selected_voyage_stats.passengers_by_gender,
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
                            <Tooltip />
                            <Bar
                              dataKey="value"
                              fill="#6149CD"
                              radius={[8, 8, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Passengers by age group */}
                  {Object.keys(
                    selected_voyage_stats.passengers_by_age_group || {},
                  ).length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Passagers par âge
                      </h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={prepareBarChartData(
                              selected_voyage_stats.passengers_by_age_group,
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
                            <Tooltip />
                            <Bar
                              dataKey="value"
                              fill="#10B981"
                              radius={[8, 8, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Baggage distribution */}
                  {Object.keys(selected_voyage_stats.baggage_distribution || {})
                    .length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Distribution des bagages
                      </h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={prepareBarChartData(
                              selected_voyage_stats.baggage_distribution,
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
                            <Tooltip />
                            <Bar
                              dataKey="value"
                              fill="#F59E0B"
                              radius={[8, 8, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Passengers origin cities */}
                  {Object.keys(
                    selected_voyage_stats.passengers_origin_city || {},
                  ).length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Villes d'origine des passagers
                      </h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={prepareBarChartData(
                              selected_voyage_stats.passengers_origin_city,
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
                            <Tooltip />
                            <Bar
                              dataKey="value"
                              fill="#8B5CF6"
                              radius={[0, 8, 8, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete confirmation modal */}
        {show_delete_modal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-20 h-20 text-red-600" />
                </div>
                <p className="text-gray-700 mb-6 align-center text-center">
                  Êtes-vous sûr de vouloir supprimer ce voyage ?
                </p>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedVoyageToDelete(null);
                    }}
                    disabled={is_deleting}
                    className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDeleteVoyage}
                    disabled={is_deleting}
                    className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {is_deleting ? "Suppression..." : "Supprimer"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
