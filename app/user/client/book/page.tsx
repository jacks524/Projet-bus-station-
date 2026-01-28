"use client";

import React, { useState, useEffect } from "react";
import {
  Home,
  Calendar,
  FileText,
  Ticket,
  Gift,
  History,
  Settings,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  MapPin,
  Compass,
} from "lucide-react";
import { useRouter } from "next/navigation";

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
  dateDepartPrev: string;
  nomClasseVoyage: string;
  prix: number;
  smallImage: string;
  statusVoyage: string;
}

interface UserData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

/**
 * Client Reserve/Book Page Component
 *
 * Search and book trips with filters
 * Features search form and paginated results
 *
 * @author Thomas Djotio Ndié
 * @date 2025-12-19
 */
export default function ClientReservePage() {
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [is_loading, setIsLoading] = useState(false);
  const [error_message, setErrorMessage] = useState("");
  const [show_profile_menu, setShowProfileMenu] = useState(false);
  const [show_mobile_menu, setShowMobileMenu] = useState(false);
  const [user_data, setUserData] = useState<UserData | null>(null);
  const [current_page, setCurrentPage] = useState(0);
  const [total_pages, setTotalPages] = useState(0);
  const [has_searched, setHasSearched] = useState(false);

  const [ville_depart, setVilleDepart] = useState("");
  const [ville_arrive, setVilleArrive] = useState("");
  const [zone_depart, setZoneDepart] = useState("");
  const [zone_arrive, setZoneArrive] = useState("");
  const [date_depart, setDateDepart] = useState("");

  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const BUTTON_COLOR = "#6149CD";
  const VOYAGES_PER_PAGE = 12;

  const MENU_ITEMS = [
    { icon: Home, label: "Accueil", path: "/user/client/home", active: false },
    {
      icon: Calendar,
      label: "Réserver",
      path: "/user/client/book",
      active: true,
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
  }, []);

  useEffect(() => {
    if (has_searched) {
      searchVoyages();
    }
  }, [current_page]);

  const searchVoyages = async () => {
    if (!ville_depart || !ville_arrive) {
      setErrorMessage(
        "Veuillez renseigner au moins la ville de départ et d'arrivée",
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/voyage/all?page=0&size=1000`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json; charset=UTF-8",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la recherche");
      }

      const data = await response.json();
      let filtered_voyages = data.content || [];

      filtered_voyages = filtered_voyages.filter((voyage: Voyage) => {
        const match_depart = voyage.lieuDepart
          .toLowerCase()
          .includes(ville_depart.toLowerCase());

        const match_arrive = voyage.lieuArrive
          .toLowerCase()
          .includes(ville_arrive.toLowerCase());

        const match_zone_depart = zone_depart
          ? voyage.pointDeDepart
              .toLowerCase()
              .includes(zone_depart.toLowerCase())
          : true;

        const match_zone_arrive = zone_arrive
          ? voyage.pointArrivee
              .toLowerCase()
              .includes(zone_arrive.toLowerCase())
          : true;

        let match_date = true;
        if (date_depart) {
          const search_date = new Date(date_depart);
          const voyage_date = new Date(voyage.dateDepartPrev);

          match_date =
            search_date.getFullYear() === voyage_date.getFullYear() &&
            search_date.getMonth() === voyage_date.getMonth() &&
            search_date.getDate() === voyage_date.getDate();
        }

        return (
          match_depart &&
          match_arrive &&
          match_zone_depart &&
          match_zone_arrive &&
          match_date
        );
      });

      const total_results = filtered_voyages.length;
      const total_pages_calculated = Math.ceil(
        total_results / VOYAGES_PER_PAGE,
      );
      const start_index = current_page * VOYAGES_PER_PAGE;
      const end_index = start_index + VOYAGES_PER_PAGE;
      const paginated_voyages = filtered_voyages.slice(start_index, end_index);

      setVoyages(paginated_voyages);
      setTotalPages(total_pages_calculated);
      setHasSearched(true);
    } catch (error: any) {
      setErrorMessage("Une erreur est survenue lors de la recherche");
      console.error("Search Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    searchVoyages();
    setTimeout(() => {
      window.scrollTo(0, document.body.scrollHeight);
    }, 0);
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

  const formatTime = (date_string: string) => {
    const date = new Date(date_string);
    return date.toLocaleTimeString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAgencyInitials = (agency_name: string) => {
    const words = agency_name.split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return agency_name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <>
        <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200 fixed h-full">
          <div className="p-6">
            <div className="mb-8">
              <button
                onClick={() => router.push("/user/client/home")}
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
                Rechercher un voyage
              </h1>
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
        </header>

        {/* Content */}
        <main className="p-6 max-w-7xl mx-auto">
          {/* Carte fusionnée : Hero Banner + Search Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-6">
            {/* Hero Banner Image */}
            <div className="relative h-80">
              <img
                src="/images/cameroun4.jpg"
                alt="Voyage"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&h=400&fit=crop";
                }}
              />
              <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/50 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-12">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                  Voyagez en toute sérénité
                </h1>
                <p className="text-xl md:text-2xl text-white/90 mb-6 max-w-2xl drop-shadow-md">
                  Trouvez et réservez votre prochain voyage en quelques clics
                </p>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                    <Calendar className="w-6 h-6 text-white" />
                    <span className="text-white font-medium">
                      Réservation simple
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                    <MapPin className="w-6 h-6 text-white" />
                    <span className="text-white font-medium">
                      Multiples destinations
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Form */}
            <div className="bg-linear-to-br from-white to-purple-50 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg"
                  style={{ backgroundColor: BUTTON_COLOR }}
                >
                  <Search className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Trouvez un voyage
                  </h2>
                  <p className="text-sm text-gray-600">
                    Remplissez les champs pour rechercher
                  </p>
                </div>
              </div>

              <form onSubmit={handleSearch}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Ville de départ */}
                  <div className="group">
                    <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-[#6149CD]" />
                      <span>Ville de départ *</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MapPin className="w-5 h-5 text-gray-400 group-focus-within:text-[#6149CD] transition-colors" />
                      </div>
                      <input
                        type="text"
                        value={ville_depart}
                        onChange={(e) => setVilleDepart(e.target.value)}
                        placeholder="Ex: Yaoundé"
                        required
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all bg-white hover:border-gray-300"
                      />
                    </div>
                  </div>

                  {/* Ville d'arrivée */}
                  <div className="group">
                    <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-[#6149CD]" />
                      <span>Ville d'arrivée *</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MapPin className="w-5 h-5 text-gray-400 group-focus-within:text-[#6149CD] transition-colors" />
                      </div>
                      <input
                        type="text"
                        value={ville_arrive}
                        onChange={(e) => setVilleArrive(e.target.value)}
                        placeholder="Ex: Douala"
                        required
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all bg-white hover:border-gray-300"
                      />
                    </div>
                  </div>

                  {/* Zone de départ */}
                  <div className="group">
                    <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                      <Compass className="w-4 h-4 text-[#6149CD]" />
                      <span>Zone de départ</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Compass className="w-5 h-5 text-gray-400 group-focus-within:text-[#6149CD] transition-colors" />
                      </div>
                      <input
                        type="text"
                        value={zone_depart}
                        onChange={(e) => setZoneDepart(e.target.value)}
                        placeholder="Ex: Mvan"
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all bg-white hover:border-gray-300"
                      />
                    </div>
                  </div>

                  {/* Zone d'arrivée */}
                  <div className="group">
                    <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                      <Compass className="w-4 h-4 text-[#6149CD]" />
                      <span>Zone d'arrivée</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Compass className="w-5 h-5 text-gray-400 group-focus-within:text-[#6149CD] transition-colors" />
                      </div>
                      <input
                        type="text"
                        value={zone_arrive}
                        onChange={(e) => setZoneArrive(e.target.value)}
                        placeholder="Ex: Akwa"
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all bg-white hover:border-gray-300"
                      />
                    </div>
                  </div>

                  {/* Date de départ */}
                  <div className="group md:col-span-2">
                    <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-[#6149CD]" />
                      <span>Date de départ</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Calendar className="w-5 h-5 text-gray-400 group-focus-within:text-[#6149CD] transition-colors" />
                      </div>
                      <input
                        type="date"
                        value={date_depart}
                        onChange={(e) => setDateDepart(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full pl-12 pr-4 py-3 border-2 placeholder:text-gray-400 border-gray-200 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all bg-white hover:border-gray-300"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={is_loading}
                  style={{ backgroundColor: BUTTON_COLOR }}
                  className="w-full px-8 py-4 text-white rounded-xl hover:opacity-90 active:opacity-80 transition-all flex items-center justify-center space-x-3 disabled:opacity-50 shadow-lg hover:shadow-xl font-semibold text-lg"
                >
                  <Search className="w-6 h-6" />
                  <span>
                    {is_loading
                      ? "Recherche en cours..."
                      : "Rechercher mon voyage"}
                  </span>
                </button>
              </form>
            </div>
          </div>

          {/* Error Message */}
          {error_message && (
            <div
              onClick={() => window.location.reload()}
              className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
            >
              <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">{error_message}</p>
            </div>
          )}

          {/* Results */}
          {is_loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Search className="w-12 h-12 text-[#6149CD] animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Recherche en cours...</p>
              </div>
            </div>
          )}

          {!is_loading && has_searched && voyages.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucun voyage trouvé
              </h3>
              <p className="text-gray-600">
                Essayez de modifier vos critères de recherche
              </p>
            </div>
          )}

          {!is_loading && voyages.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {voyages.map((voyage) => (
                  <div
                    key={voyage.idVoyage}
                    onClick={() => handleReserver(voyage.idVoyage)}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md hover:scale-101 transition-shadow"
                  >
                    {/* En-tête avec agence et ID */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                          style={{ backgroundColor: BUTTON_COLOR }}
                        >
                          {getAgencyInitials(voyage.nomAgence)}
                        </div>
                        <div className="flex-1">
                          <span className="text-gray-600">Nom de l'agence</span>
                          <h3 className="font-bold text-gray-900 mb-1">
                            {voyage.nomAgence}
                          </h3>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 font-mono">
                        #{voyage.idVoyage.slice(0, 13)}
                      </span>
                    </div>

                    {/* Informations de trajet */}
                    <div className="space-y-2 mb-4">
                      {/* Villes */}
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 text-gray-500 mr-2 shrink-0" />
                        <span className="font-semibold text-gray-800">
                          De {voyage.lieuDepart} vers {voyage.lieuArrive}
                        </span>
                      </div>

                      {/* Itinéraire */}
                      <div className="flex items-center text-xs text-gray-600">
                        <Compass className="w-3.5 h-3.5 text-gray-400 mr-2 shrink-0" />
                        <span>
                          Itinéraire : De {voyage.pointDeDepart} vers{" "}
                          {voyage.pointArrivee}
                        </span>
                      </div>
                    </div>

                    {/* Heure et places */}
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-700">
                          {formatTime(voyage.dateDepartPrev)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>
                          {voyage.nbrPlaceReservable} /{" "}
                          {voyage.nbrPlaceRestante + voyage.nbrPlaceConfirm}{" "}
                          places restantes
                        </span>
                      </div>
                    </div>

                    {/* Classe et prix */}
                    <div className="space-y-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {voyage.nomClasseVoyage}
                      </span>

                      <div className="flex items-center justify-between pt-2">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Prix du ticket
                          </p>
                          <p className="text-xl font-bold text-gray-900">
                            {voyage.prix} FCFA
                          </p>
                        </div>
                        <button
                          onClick={() => handleReserver(voyage.idVoyage)}
                          className="px-6 py-2 bg-[#6149CD] text-white rounded-lg hover:opacity-80 active:opacity-90 transition-colors font-medium"
                        >
                          Réserver
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {total_pages > 1 && (
                <div className="flex items-center justify-center space-x-4">
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
        </main>
      </div>
    </div>
  );
}
