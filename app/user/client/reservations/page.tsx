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
  CreditCard,
  MapPin,
  Clock,
  Users,
  Compass,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../../providers";

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
}

interface Agence {
  agencyId: string;
  longName: string;
  shortName: string;
  ville: string;
}

interface Reservation {
  idReservation: string;
  dateReservation: string;
  nbrPassager: number;
  prixTotal: number;
  statutReservation: string;
  statutPayement: string;
  montantPaye: number;
}

interface ReservationData {
  reservation: Reservation;
  voyage: Voyage;
  agence: Agence;
}

interface UserData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  userId: string;
}

/**
 * Client Reservations Page Component
 *
 * Display user's pending reservations with payment option
 * Shows only reservations with status "RESERVER"
 *
 * @author Thomas Djotio Ndié
 * @date 2025-12-20
 */
export default function ClientReservationsPage() {
  const [reservations, setReservations] = useState<ReservationData[]>([]);
  const [is_loading, setIsLoading] = useState(true);
  const [error_message, setErrorMessage] = useState("");

  const [show_profile_menu, setShowProfileMenu] = useState(false);
  const [show_mobile_menu, setShowMobileMenu] = useState(false);
  const [user_data, setUserData] = useState<UserData | null>(null);

  const [show_paiement_modal, setShowPaiementModal] = useState(false);
  const [selected_reservation, setSelectedReservation] =
    useState<ReservationData | null>(null);
  const [is_loading_paiement, setIsLoadingPaiement] = useState(false);

  const [mobile_phone, setMobilePhone] = useState("");
  const [mobile_phone_name, setMobilePhoneName] = useState("");

  const [current_page, setCurrentPage] = useState(0);
  const [total_pages, setTotalPages] = useState(0);
  const [total_elements, setTotalElements] = useState(0);

  const router = useRouter();
  const { t } = useLanguage();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const BUTTON_COLOR = "#6149CD";
  const RESERVATIONS_PER_PAGE = 3;

  const MENU_ITEMS = [
    { icon: Home, label: t("Accueil", "Home"), path: "/user/client/home", active: false },
    {
      icon: Calendar,
      label: t("Réserver", "Book"),
      path: "/user/client/book",
      active: false,
    },
    {
      icon: FileText,
      label: t("Réservations", "Bookings"),
      path: "/user/client/reservations",
      active: true,
    },
    {
      icon: Ticket,
      label: t("Billets", "Tickets"),
      path: "/user/client/tickets",
      active: false,
    },
    {
      icon: Gift,
      label: t("Coupons", "Vouchers"),
      path: "/user/client/vouchers",
      active: false,
    },
    {
      icon: History,
      label: t("Historique", "History"),
      path: "/user/client/history",
      active: false,
    },
    {
      icon: Settings,
      label: t("Mes paramètres", "Settings"),
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
      const parsed_user = JSON.parse(stored_user_data);
      setUserData(parsed_user);
      fetchReservations(parsed_user.userId);
    }
  }, []);

  useEffect(() => {
    if (user_data?.userId) {
      fetchReservations(user_data.userId);
    }
  }, [current_page]);

  const fetchReservations = async (user_id: string) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const auth_token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");

      const response = await fetch(
        `${API_BASE_URL}/reservation/utilisateur/${user_id}?page=${current_page}&size=${RESERVATIONS_PER_PAGE}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth_token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(t("Erreur lors du chargement des réservations", "Error loading reservations"));
      }

      const data = await response.json();

      const all_reservations = data.content || [];

      const now = new Date();

      const pending_reservations = all_reservations.filter(
        (item: ReservationData) => {
          const is_pending = item.reservation.statutReservation === "RESERVER";
          const departure_date = new Date(item.voyage.dateDepartPrev);
          const is_future = departure_date > now;

          return is_pending && is_future;
        },
      );

      setReservations(pending_reservations);
      setTotalPages(data.totalPages || 0);
      setTotalElements(pending_reservations.length);
    } catch (error: any) {
      setErrorMessage(t("Impossible de charger vos réservations", "Unable to load your reservations"));
      console.error("Fetch Reservations Error:", error);
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

  const ouvrirModalPaiement = (reservation: ReservationData) => {
    setSelectedReservation(reservation);
    setMobilePhone("");
    setMobilePhoneName("");
    setShowPaiementModal(true);
  };

  const effectuerPaiement = async () => {
    if (!mobile_phone.trim() || !mobile_phone_name.trim()) {
      return;
    }

    setIsLoadingPaiement(true);

    try {
      const auth_token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");

      const payment_data = {
        amount: selected_reservation?.reservation.prixTotal || 0,
        reservation_id: selected_reservation?.reservation.idReservation || "",
        simulate_success: true,
      };

      const response = await fetch(
        `${API_BASE_URL}/reservation/simulate-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth_token}`,
          },
          body: JSON.stringify(payment_data),
        },
      );

      if (!response.ok) {
        throw new Error(t("Erreur lors du paiement", "Payment error"));
      }

      setShowPaiementModal(false);
      if (user_data?.userId) {
        fetchReservations(user_data.userId);
      }
      router.push("/user/client/tickets");
    } catch (error: any) {
      alert(t("Une erreur est survenue lors du paiement. Veuillez réessayer.", "An error occurred during payment. Please try again."));
      console.error("Payment Error:", error);
    } finally {
      setIsLoadingPaiement(false);
    }
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

  const isPaymentFormValid = () => {
    if (mobile_phone_name.trim() === "") return false;
    const cleaned_phone = mobile_phone.replace(/\s|-|\+/g, "");
    const phone_regex = /^\d{9}$/;
    return phone_regex.test(cleaned_phone);
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
                {t("Mes réservations", "My reservations")}
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
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Carte fusionnée : Image à gauche + Réservations à droite */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-3">
                {/* Partie gauche - Image avec overlay */}
                <div className="lg:col-span-1 relative min-h-125">
                  <img
                    src="/images/cameroun5.jpg"
                    alt={t("Réservations", "Reservations")}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=800&fit=crop";
                    }}
                  />
                  <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/50 to-black/70"></div>
                  <div className="absolute inset-0 flex flex-col justify-between p-8">
                    <div>
                      <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
                        {t("Vos réservations", "Your reservations")}
                      </h2>
                      <p className="text-white/90 text-lg mb-6 drop-shadow-md">
                        {t("Gérez et payez vos réservations en attente", "Manage and pay your pending reservations")}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <FileText className="w-6 h-6 text-white" />
                          <span className="text-white font-semibold">
                            {t("Réservations en attente", "Pending reservations")}
                          </span>
                        </div>
                        <p className="text-3xl font-bold text-white">
                          {t("Nombre par page", "Count per page")} : {total_elements}
                        </p>
                      </div>

                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                        <p className="text-sm text-white/90">
                          {t("Payez vos réservations pour obtenir vos billets", "Pay your reservations to get your tickets")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Partie droite - Liste des réservations */}
                <div className="lg:col-span-2 p-8 bg-linear-to-br from-white to-purple-50">
                  {is_loading ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="text-center">
                        <FileText className="w-16 h-16 text-[#6149CD] animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">
                          {t("Chargement de vos réservations...", "Loading your reservations...")}
                        </p>
                      </div>
                    </div>
                  ) : error_message ? (
                    <div
                      onClick={() => window.location.reload()}
                      className="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
                    >
                      <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
                      <p className="text-red-600">{error_message}</p>
                    </div>
                  ) : reservations.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center">
                      <FileText
                        onClick={() => window.location.reload()}
                        className="w-16 h-16 text-gray-400 mx-auto mb-4 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                      />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {t("Aucune réservation en attente", "No pending reservations")}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {t("Toutes vos réservations ont été traitées", "All your reservations have been processed")}
                      </p>
                      <button
                        onClick={() => router.push("/user/client/book")}
                        style={{ backgroundColor: BUTTON_COLOR }}
                        className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity"
                      >
                        {t("Réserver un voyage", "Book a trip")}
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center space-x-3 mb-6">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg"
                          style={{ backgroundColor: BUTTON_COLOR }}
                        >
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            {t("Liste de vos réservations", "Your reservations list")}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {t(
                              `${reservations.length} réservation${reservations.length > 1 ? "s" : ""} sur cette page`,
                              `${reservations.length} reservation${reservations.length > 1 ? "s" : ""} on this page`
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4 mb-6">
                        {reservations.map((data) => (
                          <div
                            key={data.reservation.idReservation}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                  {data.agence.longName}
                                </h3>
                                <p className="text-sm text-gray-400 mb-2">
                                  ID: {data.reservation.idReservation}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {t("Réservé le", "Booked on")}{" "}
                                  {formatDate(data.reservation.dateReservation)}
                                </p>
                              </div>
                              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                                {t("En attente", "Pending")}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="space-y-3">
                                <div className="flex items-center space-x-2 text-sm">
                                  <MapPin className="w-4 h-4 text-gray-500" />
                                  <span className="text-gray-700">
                                    <span className="font-semibold">
                                      {t("De", "From")} {data.voyage.lieuDepart} {t("vers", "to")}{" "}
                                      {data.voyage.lieuArrive}
                                    </span>
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 text-xs text-gray-600">
                                  <Compass className="w-3.5 h-3.5 text-gray-400" />
                                  <span>
                                    {t("Itinéraire", "Route")} : {t("De", "From")} {data.voyage.pointDeDepart}{" "}
                                    {t("vers", "to")} {data.voyage.pointArrivee}
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-center space-x-2 text-sm">
                                  <Clock className="w-4 h-4 text-gray-500" />
                                  <span className="text-gray-700">
                                    {t("Départ", "Departure")} :{" "}
                                    {formatDate(data.voyage.dateDepartPrev)}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                  <Users className="w-4 h-4 text-gray-500" />
                                  <span className="text-gray-700">
                                    {t(
                                      `${data.reservation.nbrPassager} passager${data.reservation.nbrPassager > 1 ? "s" : ""}`,
                                      `${data.reservation.nbrPassager} passenger${data.reservation.nbrPassager > 1 ? "s" : ""}`
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                              <div>
                                <p className="text-sm text-gray-600 mb-1">
                                  {t("Montant total", "Total amount")}
                                </p>
                                <p className="text-2xl font-bold text-[#6149CD]">
                                  {data.reservation.prixTotal} FCFA
                                </p>
                              </div>
                              <button
                                onClick={() => ouvrirModalPaiement(data)}
                                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 active:bg-green-700 transition-colors font-semibold flex items-center space-x-2"
                              >
                                <CreditCard className="w-5 h-5" />
                                <span>{t("Payer maintenant", "Pay now")}</span>
                              </button>
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
                            <span>{t("Précédent", "Previous")}</span>
                          </button>

                          <span className="text-sm text-gray-600">
                            {t("Page", "Page")} {current_page + 1} {t("sur", "of")} {total_pages}
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
                            <span>{t("Suivant", "Next")}</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Paiement */}
      {show_paiement_modal && selected_reservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {t("Paiement", "Payment")}
              </h2>
              <button
                onClick={() => setShowPaiementModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  {t("Résumé du paiement", "Payment summary")}
                </h3>
                <p className="text-sm text-gray-700 mb-2">
                  {t("Agence", "Agency")} : {selected_reservation.agence.longName}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  {t("De", "From")} {selected_reservation.voyage.lieuDepart} {t("vers", "to")}{" "}
                  {selected_reservation.voyage.lieuArrive}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  {t("Itinéraire", "Route")} : {selected_reservation.voyage.pointDeDepart} {t("vers", "to")}{" "}
                  {selected_reservation.voyage.pointArrivee}
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  {t("Date", "Date")} :{" "}
                  {formatDate(selected_reservation.voyage.dateDepartPrev)}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-sm font-semibold text-gray-700">
                    {t("Montant à payer", "Amount to pay")}
                  </span>
                  <span className="text-xl font-bold text-[#6149CD]">
                    {selected_reservation.reservation.prixTotal} FCFA
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("Numéro de téléphone *", "Phone number *")}
                  </label>
                  <input
                    type="tel"
                    value={mobile_phone}
                    onChange={(e) => setMobilePhone(e.target.value)}
                    placeholder={t("+237 🇨🇲", "+237 🇨🇲")}
                    className="w-full px-4 py-3 border-2 text-gray-700 placeholder:text-gray-400 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("Nom du propriétaire *", "Owner name *")}
                  </label>
                  <input
                    type="text"
                    value={mobile_phone_name}
                    onChange={(e) => setMobilePhoneName(e.target.value)}
                    placeholder={t("Nom complet", "Full name")}
                    className="w-full px-4 py-3 border-2 text-gray-700 placeholder:text-gray-400 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-800">
                  {t(
                    "Une demande de paiement sera envoyée sur ce numéro pour valider le paiement",
                    "A payment request will be sent to this number to validate the payment"
                  )}
                </p>
              </div>

              <button
                onClick={effectuerPaiement}
                disabled={is_loading_paiement || !isPaymentFormValid()}
                style={{ backgroundColor: BUTTON_COLOR }}
                className="w-full py-4 text-white rounded-xl font-bold text-lg hover:opacity-90 active:opacity-80 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {is_loading_paiement ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{t("Paiement en cours...", "Payment in progress...")}</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-6 h-6" />
                    <span>{t("Confirmer le paiement", "Confirm payment")}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
