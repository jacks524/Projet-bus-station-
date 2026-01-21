"use client";

import React, { useState, useEffect } from "react";
import {
  Home,
  Calendar,
  Settings,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Users,
  Bus,
  FileText,
  MapPin,
  Clock,
  Compass,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building2,
  CreditCard,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * Agency Reservations Page Component
 *
 * Displays all reservations for the agency manager
 * Features filtering, pagination, and reservation details
 *
 * @author Thomas Djotio Ndié
 * @date 2025-01-16
 */

interface Voyage {
  idVoyage: string;
  titre: string;
  description: string;
  dateDepartPrev: string;
  lieuDepart: string;
  lieuArrive: string;
  pointDeDepart: string;
  pointArrivee: string;
  statusVoyage: string;
  nbrPlaceRestante: number;
  nbrPlaceReservable: number;
  prix?: number;
}

interface Agence {
  agencyId: string;
  organisationId: string;
  user_id: string;
  userId: string;
  longName: string;
  shortName: string;
  location: string;
  ville: string;
  statutValidation: string;
}

interface Reservation {
  idReservation: string;
  dateReservation: string;
  dateConfirmation: string;
  nbrPassager: number;
  prixTotal: number;
  statutReservation: string;
  idUser: string;
  idVoyage: string;
  statutPayement: string;
  transactionCode: string;
  montantPaye: number;
}

interface ReservationData {
  reservation: Reservation;
  voyage: Voyage;
  agence: Agence;
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
  statut_validation: string;
  created_by: string;
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

export default function AgenceReservationsPage() {
  const [reservations, setReservations] = useState<ReservationData[]>([]);
  const [agences, setAgences] = useState<AgenceValidee[]>([]);
  const [selected_agence, setSelectedAgence] = useState<AgenceValidee | null>(
    null,
  );

  const [is_loading, setIsLoading] = useState(true);
  const [is_loading_agences, setIsLoadingAgences] = useState(true);
  const [error_message, setErrorMessage] = useState("");

  const [show_profile_menu, setShowProfileMenu] = useState(false);
  const [show_mobile_menu, setShowMobileMenu] = useState(false);
  const [user_data, setUserData] = useState<UserData | null>(null);

  const [show_agence_selector, setShowAgenceSelector] = useState(false);
  const [show_detail_modal, setShowDetailModal] = useState(false);
  const [selected_reservation, setSelectedReservation] =
    useState<ReservationData | null>(null);

  const [search_query, setSearchQuery] = useState("");
  const [status_filter, setStatusFilter] = useState<string>("ALL");
  const [payment_filter, setPaymentFilter] = useState<string>("ALL");

  const [current_page, setCurrentPage] = useState(0);
  const [total_pages, setTotalPages] = useState(0);
  const [total_elements, setTotalElements] = useState(0);

  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const BUTTON_COLOR = "#6149CD";
  const RESERVATIONS_PER_PAGE = 10;

  const MENU_ITEMS = [
    {
      icon: Home,
      label: "Dashboard",
      path: "/user/agency/dashboard",
      active: false,
    },
    {
      icon: Bus,
      label: "Voyages",
      path: "/user/agency/travels",
      active: false,
    },
    {
      icon: Calendar,
      label: "Réservations",
      path: "/user/agency/reservations",
      active: true,
    },
    {
      icon: Users,
      label: "Chauffeurs",
      path: "/user/agency/drivers",
      active: false,
    },
    {
      icon: Settings,
      label: "Mes paramètres",
      path: "/user/agency/settings",
      active: false,
    },
  ];

  const RESERVATION_STATUSES = [
    { value: "ALL", label: "Tous les statuts" },
    { value: "RESERVER", label: "Réservé" },
    { value: "CONFIRMER", label: "Confirmé" },
    { value: "ANNULER", label: "Annulé" },
    { value: "VALIDER", label: "Validé" },
  ];

  const PAYMENT_STATUSES = [
    { value: "ALL", label: "Tous les paiements" },
    { value: "NO_PAYMENT", label: "En attente" },
    { value: "PAID", label: "Payé" },
    { value: "FAILED", label: "Échoué" },
    { value: "PENDING", label: "Pending" },
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
      fetchReservations(selected_agence.agency_id);
    }
  }, [selected_agence?.agency_id, current_page]);

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
        throw new Error("Erreur lors du chargement des agences");
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
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error("Fetch Agences Error:", error);
      setErrorMessage("Impossible de charger vos agences");
      setIsLoading(false);
    } finally {
      setIsLoadingAgences(false);
    }
  };

  const fetchReservations = async (agence_id: string) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const auth_token = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/reservation/agence/${agence_id}?page=${current_page}&size=${RESERVATIONS_PER_PAGE}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth_token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des réservations");
      }

      const data = await response.json();

      // Handle both paginated and non-paginated responses
      if (Array.isArray(data)) {
        setReservations(data);
        setTotalPages(1);
        setTotalElements(data.length);
      } else {
        setReservations(data.content || []);
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements || 0);
      }
    } catch (error: any) {
      console.error("Fetch Reservations Error:", error);
      setErrorMessage("Impossible de charger les réservations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAgence = (agence: AgenceValidee) => {
    setSelectedAgence(agence);
    setShowAgenceSelector(false);
    setCurrentPage(0);
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
      fetchReservations(selected_agence.agency_id);
    }
  };

  const openDetailModal = (reservation: ReservationData) => {
    setSelectedReservation(reservation);
    setShowDetailModal(true);
  };

  const formatDate = (date_string: string) => {
    const date = new Date(date_string);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatShortDate = (date_string: string) => {
    const date = new Date(date_string);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      RESERVER: "bg-orange-100 text-orange-800",
      CONFIRMER: "bg-green-100 text-green-800",
      ANNULER: "bg-red-100 text-red-800",
      VALIDER: "bg-gray-100 text-gray-800",
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  const getPaymentBadge = (status: string) => {
    const styles: Record<string, string> = {
      NO_PAYMENT: "bg-yellow-100 text-yellow-800",
      PAID: "bg-green-100 text-green-800",
      FAILED: "bg-red-100 text-red-800",
      PENDING: "bg-blue-100 text-blue-800",
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      RESERVER: "Réservé",
      CONFIRMER: "Confirmé",
      ANNULER: "Annulé",
      EXPIRER: "Expiré",
    };
    return labels[status] || status;
  };

  const getPaymentLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: "En attente",
      COMPLETED: "Payé",
      FAILED: "Échoué",
      REFUNDED: "Remboursé",
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONFIRMER":
        return <CheckCircle className="w-4 h-4" />;
      case "ANNULER":
        return <XCircle className="w-4 h-4" />;
      case "RESERVER":
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Filter reservations
  const filteredReservations = reservations.filter((data) => {
    const matchesSearch =
      search_query === "" ||
      data.reservation.idReservation
        .toLowerCase()
        .includes(search_query.toLowerCase()) ||
      data.voyage.lieuDepart
        .toLowerCase()
        .includes(search_query.toLowerCase()) ||
      data.voyage.lieuArrive.toLowerCase().includes(search_query.toLowerCase());

    const matchesStatus =
      status_filter === "ALL" ||
      data.reservation.statutReservation === status_filter;

    const matchesPayment =
      payment_filter === "ALL" ||
      data.reservation.statutPayement === payment_filter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Calculate statistics
  const stats = {
    total: reservations.length,
    reserved: reservations.filter(
      (r) => r.reservation.statutReservation === "RESERVER",
    ).length,
    confirmed: reservations.filter(
      (r) => r.reservation.statutReservation === "CONFIRMER",
    ).length,
    cancelled: reservations.filter(
      (r) => r.reservation.statutReservation === "ANNULER",
    ).length,
    totalRevenue: reservations
      .filter((r) => r.reservation.statutPayement === "PAID")
      .reduce((sum, r) => sum + r.reservation.prixTotal, 0),
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
                Réservations
              </h1>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={handleRefresh}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Actualiser"
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
        <main className="p-3 sm:p-4 md:p-6">
          {/* Loading Agences */}
          {is_loading_agences && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-[#6149CD] animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Chargement en cours...</p>
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
                Réessayer
              </button>
            </div>
          )}

          {/* No Agences */}
          {!is_loading_agences && agences.length === 0 && !error_message && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-12 text-center">
              <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Aucune agence validée
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                Vous n'avez pas encore d'agence validée
              </p>
              <button
                onClick={() => router.push("/user/agency/dashboard")}
                style={{ backgroundColor: BUTTON_COLOR }}
                className="px-4 sm:px-6 py-2.5 sm:py-3 text-white rounded-lg hover:opacity-90 transition-opacity text-sm sm:text-base"
              >
                Retour au dashboard
              </button>
            </div>
          )}

          {/* Main Content */}
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

              {/* Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#6149CD]" />
                    <span className="text-xs sm:text-sm text-gray-600">
                      Total
                    </span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                    <span className="text-xs sm:text-sm text-gray-600">
                      En attente
                    </span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-orange-600">
                    {stats.reserved}
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                    <span className="text-xs sm:text-sm text-gray-600">
                      Confirmées
                    </span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">
                    {stats.confirmed}
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                    <span className="text-xs sm:text-sm text-gray-600">
                      Revenus
                    </span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-green-600 truncate">
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                </div>
              </div>

              {/* Filters and Search */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher par ID, départ, arrivée..."
                      value={search_query}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent text-gray-800 placeholder:text-gray-400 text-sm sm:text-base"
                    />
                  </div>

                  <div className="flex gap-2">
                    <select
                      value={status_filter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent text-gray-800 text-sm sm:text-base bg-white"
                    >
                      {RESERVATION_STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={payment_filter}
                      onChange={(e) => setPaymentFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent text-gray-800 text-sm sm:text-base bg-white"
                    >
                      {PAYMENT_STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Loading Reservations */}
              {is_loading && (
                <div className="flex items-center justify-center py-10">
                  <RefreshCw className="w-8 h-8 text-[#6149CD] animate-spin" />
                </div>
              )}

              {/* Error Message */}
              {error_message && !is_loading && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 text-center">
                  <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 text-sm sm:text-base">
                    {error_message}
                  </p>
                  <button
                    onClick={handleRefresh}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
                  >
                    Réessayer
                  </button>
                </div>
              )}

              {/* Reservations List */}
              {!is_loading && !error_message && (
                <>
                  {filteredReservations.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
                      <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                        Aucune réservation trouvée
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600">
                        {search_query ||
                        status_filter !== "ALL" ||
                        payment_filter !== "ALL"
                          ? "Aucune réservation ne correspond à vos critères de recherche"
                          : "Il n'y a pas encore de réservations pour cette agence"}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      {/* Desktop Table */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="text-left py-3 px-4 text-gray-600 font-semibold text-sm">
                                ID Réservation
                              </th>
                              <th className="text-left py-3 px-4 text-gray-600 font-semibold text-sm">
                                Trajet
                              </th>
                              <th className="text-left py-3 px-4 text-gray-600 font-semibold text-sm">
                                Date départ
                              </th>
                              <th className="text-left py-3 px-4 text-gray-600 font-semibold text-sm">
                                Passagers
                              </th>
                              <th className="text-left py-3 px-4 text-gray-600 font-semibold text-sm">
                                Montant
                              </th>
                              <th className="text-left py-3 px-4 text-gray-600 font-semibold text-sm">
                                Statut
                              </th>
                              <th className="text-left py-3 px-4 text-gray-600 font-semibold text-sm">
                                Paiement
                              </th>
                              <th className="text-left py-3 px-4 text-gray-600 font-semibold text-sm">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredReservations.map((data) => (
                              <tr
                                key={data.reservation.idReservation}
                                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                              >
                                <td className="py-3 px-4">
                                  <span className="text-sm font-mono text-gray-600">
                                    #
                                    {data.reservation.idReservation.slice(0, 8)}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="w-3 h-3 text-gray-400" />
                                    <span className="text-sm text-gray-900">
                                      {data.voyage.lieuDepart} vers{" "}
                                      {data.voyage.lieuArrive}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-600">
                                  {formatShortDate(data.voyage.dateDepartPrev)}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center space-x-1">
                                    <Users className="w-3 h-3 text-gray-400" />
                                    <span className="text-sm text-gray-900">
                                      {data.reservation.nbrPassager}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                                  {formatCurrency(data.reservation.prixTotal)}
                                </td>
                                <td className="py-3 px-4">
                                  <span
                                    className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                                      data.reservation.statutReservation,
                                    )}`}
                                  >
                                    {getStatusIcon(
                                      data.reservation.statutReservation,
                                    )}
                                    <span>
                                      {getStatusLabel(
                                        data.reservation.statutReservation,
                                      )}
                                    </span>
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getPaymentBadge(
                                      data.reservation.statutPayement,
                                    )}`}
                                  >
                                    {getPaymentLabel(
                                      data.reservation.statutPayement,
                                    )}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <button
                                    onClick={() => openDetailModal(data)}
                                    style={{ backgroundColor: BUTTON_COLOR }}
                                    className="p-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                                    title="Voir détails"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Cards */}
                      <div className="md:hidden space-y-3 p-4">
                        {filteredReservations.map((data) => (
                          <div
                            key={data.reservation.idReservation}
                            className="border border-gray-200 rounded-lg p-4"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="text-xs font-mono text-gray-500 mb-1">
                                  #{data.reservation.idReservation.slice(0, 8)}
                                </p>
                                <div className="flex items-center space-x-1">
                                  <MapPin className="w-3 h-3 text-gray-400" />
                                  <span className="text-sm font-semibold text-gray-900">
                                    {data.voyage.lieuDepart} vers{" "}
                                    {data.voyage.lieuArrive}
                                  </span>
                                </div>
                              </div>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                                  data.reservation.statutReservation,
                                )}`}
                              >
                                {getStatusLabel(
                                  data.reservation.statutReservation,
                                )}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="text-gray-600">
                                  {formatShortDate(data.voyage.dateDepartPrev)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="w-3 h-3 text-gray-400" />
                                <span className="text-gray-600">
                                  {data.reservation.nbrPassager} passager(s)
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                              <div>
                                <p className="text-xs text-gray-500">Montant</p>
                                <p className="text-sm font-bold text-gray-900">
                                  {formatCurrency(data.reservation.prixTotal)}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-semibold ${getPaymentBadge(
                                    data.reservation.statutPayement,
                                  )}`}
                                >
                                  {getPaymentLabel(
                                    data.reservation.statutPayement,
                                  )}
                                </span>
                                <button
                                  onClick={() => openDetailModal(data)}
                                  style={{ backgroundColor: BUTTON_COLOR }}
                                  className="p-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pagination */}
                      {total_pages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-gray-200">
                          <button
                            onClick={() =>
                              setCurrentPage(Math.max(0, current_page - 1))
                            }
                            disabled={current_page === 0}
                            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                          >
                            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>Précédent</span>
                          </button>

                          <span className="text-gray-600 text-sm sm:text-base order-first sm:order-0">
                            Page {current_page + 1} sur {total_pages} (
                            {total_elements} réservations)
                          </span>

                          <button
                            onClick={() =>
                              setCurrentPage(
                                Math.min(total_pages - 1, current_page + 1),
                              )
                            }
                            disabled={current_page === total_pages - 1}
                            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                          >
                            <span>Suivant</span>
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Detail Modal */}
      {show_detail_modal && selected_reservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Détails de la réservation
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {/* Reservation Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-[#6149CD]" />
                  <span>Informations de la réservation</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">ID Réservation</p>
                    <p className="text-sm font-mono text-gray-900">
                      {selected_reservation.reservation.idReservation}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date de réservation</p>
                    <p className="text-sm text-gray-900">
                      {formatDate(
                        selected_reservation.reservation.dateReservation,
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Statut</p>
                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                        selected_reservation.reservation.statutReservation,
                      )}`}
                    >
                      {getStatusIcon(
                        selected_reservation.reservation.statutReservation,
                      )}
                      <span>
                        {getStatusLabel(
                          selected_reservation.reservation.statutReservation,
                        )}
                      </span>
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Nombre de passagers</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selected_reservation.reservation.nbrPassager}
                    </p>
                  </div>
                </div>
              </div>

              {/* Voyage Info */}
              <div className="bg-purple-50 rounded-xl p-4">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center space-x-2">
                  <Bus className="w-5 h-5 text-[#6149CD]" />
                  <span>Informations du voyage</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-900">
                      <strong>Trajet :</strong>{" "}
                      {selected_reservation.voyage.lieuDepart} vers{" "}
                      {selected_reservation.voyage.lieuArrive}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Compass className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-900">
                      <strong>Itinéraire :</strong>{" "}
                      {selected_reservation.voyage.pointDeDepart} vers{" "}
                      {selected_reservation.voyage.pointArrivee}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-900">
                      <strong>Date de départ :</strong>{" "}
                      {formatDate(selected_reservation.voyage.dateDepartPrev)}
                    </span>
                  </div>
                  {selected_reservation.voyage.titre && (
                    <div>
                      <p className="text-xs text-gray-500">Titre du voyage</p>
                      <p className="text-sm text-gray-900">
                        {selected_reservation.voyage.titre}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-green-50 rounded-xl p-4">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  <span>Informations de paiement</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Prix total</p>
                    <p className="text-lg font-bold text-[#6149CD]">
                      {formatCurrency(
                        selected_reservation.reservation.prixTotal,
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Montant payé</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(
                        selected_reservation.reservation.montantPaye,
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Statut du paiement</p>
                    <span
                      className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-semibold ${getPaymentBadge(
                        selected_reservation.reservation.statutPayement,
                      )}`}
                    >
                      {getPaymentLabel(
                        selected_reservation.reservation.statutPayement,
                      )}
                    </span>
                  </div>
                  {selected_reservation.reservation.transactionCode && (
                    <div>
                      <p className="text-xs text-gray-500">
                        Code de transaction
                      </p>
                      <p className="text-sm font-mono text-gray-900">
                        {selected_reservation.reservation.transactionCode}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* User Info */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>Client</span>
                </h3>
                <div>
                  <p className="text-xs text-gray-500">ID Utilisateur</p>
                  <p className="text-sm font-mono text-gray-900">
                    {selected_reservation.reservation.idUser}
                  </p>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white p-4 sm:p-6 border-t border-gray-200">
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
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
