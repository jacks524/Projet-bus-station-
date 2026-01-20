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
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Coins,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Historique {
  idHistorique: string;
  statusHistorique: string;
  dateReservation: string;
  dateConfirmation: string;
  dateAnnulation: string;
  causeAnnulation: string;
  origineAnnulation: string;
  tauxAnnulation: number;
  compensation: number;
  idReservation: string;
}

interface UserData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  userId: string;
}

/**
 * Client History Page Component
 *
 * Display user's reservation history
 * Fetches from GET /historique/reservation/{idUtilisateur}
 *
 * @author Thomas Djotio Ndié
 * @date 2025-12-20
 */
export default function ClientHistoryPage() {
  const [historiques, setHistoriques] = useState<Historique[]>([]);
  const [is_loading, setIsLoading] = useState(true);
  const [error_message, setErrorMessage] = useState("");

  const [show_profile_menu, setShowProfileMenu] = useState(false);
  const [show_mobile_menu, setShowMobileMenu] = useState(false);
  const [user_data, setUserData] = useState<UserData | null>(null);

  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const BUTTON_COLOR = "#6149CD";

  const MENU_ITEMS = [
    { icon: Home, label: "Accueil", path: "/user/client/home", active: false },
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
      active: true,
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
      const parsed_user = JSON.parse(stored_user_data);
      setUserData(parsed_user);
      fetchHistoriques(parsed_user.userId);
    }
  }, []);

  const fetchHistoriques = async (user_id: string) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/historique/reservation/${user_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Erreur lors du chargement de l'historique");
      }

      const data = await response.json();
      setHistoriques(data || []);
    } catch (error: any) {
      setErrorMessage("Impossible de charger votre historique");
      console.error("Fetch Historiques Error:", error);
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

  const formatDate = (date_string: string) => {
    if (!date_string) return "N/A";
    const date = new Date(date_string);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatStatus = (status: string) => {
    const status_map: { [key: string]: string } = {
      ANNULER_PAR_AGENCE_APRES_RESERVATION:
        "Annulé par l'agence après réservation",
      ANNULER_PAR_USAGER_APRES_RESERVATION:
        "Annulé par l'usager après réservation",
      ANNULER_PAR_AGENCE_APRES_CONFIRMATION:
        "Annulé par l'agence après confirmation",
      ANNULER_PAR_USAGER_APRES_CONFIRMATION:
        "Annulé par l'usager après confirmation",
      VALIDER: "Reservation effectuée",
    };
    return status_map[status] || status;
  };

  const getStatusIcon = (status: string) => {
    if (status.includes("VALIDER")) {
      return <FileText className="w-5 h-5 text-gray-600" />;
    } else if (
      status.includes("ANNULER_PAR_AGENCE_APRES_RESERVATION") ||
      status.includes("ANNULER_PAR_USAGER_APRES_RESERVATION") ||
      status.includes("ANNULER_PAR_AGENCE_APRES_CONFIRMATION") ||
      status.includes("ANNULER_PAR_USAGER_APRES_CONFIRMATION")
    ) {
      return <XCircle className="w-5 h-5 text-red-600" />;
    } else {
      return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string, dateConfirmation: string) => {
    if (status.includes("VALIDER") && dateConfirmation) {
      return "bg-green-100 border-green-200";
    } else if (
      status.includes("ANNULER_PAR_AGENCE_APRES_RESERVATION") ||
      status.includes("ANNULER_PAR_USAGER_APRES_RESERVATION") ||
      status.includes("ANNULER_PAR_AGENCE_APRES_CONFIRMATION") ||
      status.includes("ANNULER_PAR_USAGER_APRES_CONFIRMATION")
    ) {
      return "bg-red-100 border-red-200";
    } else {
      return "bg-gray-50 border-gray-200";
    }
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
                      router.push("/user/client/home");
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
                Historique
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
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Image en haut */}
              <div className="relative h-64">
                <img
                  src="/images/cameroun1___.jpg"
                  alt="Historique"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1501139083538-0139583c060f?w=1200&h=300&fit=crop";
                  }}
                />
                <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-transparent"></div>
                <div className="absolute top-0 left-0 right-0 p-8">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                    Historique de vos réservations
                  </h2>
                  <p className="text-white/90 text-lg drop-shadow-md">
                    Consultez toutes vos activités passées
                  </p>
                </div>
              </div>

              {/* Liste des historiques */}
              <div className="p-8">
                {is_loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <History className="w-16 h-16 text-[#6149CD] animate-spin mx-auto mb-4" />
                      <p className="text-gray-600">
                        Chargement de l'historique...
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
                ) : historiques.length === 0 ? (
                  <div className="bg-white rounded-xl p-12 text-center">
                    <History
                      onClick={() => window.location.reload()}
                      className="w-16 h-16 text-gray-400 mx-auto mb-4 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                    />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Aucun historique
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Votre historique de réservations est vide
                    </p>
                    <button
                      onClick={() => router.push("/user/client/book")}
                      style={{ backgroundColor: BUTTON_COLOR }}
                      className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Réserver un voyage
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {historiques.map((item) => (
                      <div
                        key={item.idHistorique}
                        className={`flex items-start space-x-4 p-4 rounded-lg border-l-4 transition-all hover:shadow-md ${getStatusColor(
                          item.statusHistorique,
                          item.dateConfirmation,
                        )}`}
                      >
                        {/* Icône de statut */}
                        <div className="shrink-0 mt-1">
                          {getStatusIcon(item.statusHistorique)}
                        </div>

                        {/* Contenu */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="text-base font-semibold text-gray-900">
                                {formatStatus(item.statusHistorique)}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                Réservation N° {item.idReservation}
                              </p>
                            </div>
                            <span className="text-xs text-gray-500 ml-4 whitespace-nowrap">
                              {formatDate(
                                item.dateAnnulation ||
                                  item.dateConfirmation ||
                                  item.dateReservation,
                              )}
                            </span>
                          </div>

                          {/* Détails supplémentaires */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
                            {item.dateReservation && (
                              <div className="flex items-center space-x-2">
                                <Clock className="w-3.5 h-3.5" />
                                <span>
                                  Réservé le {formatDate(item.dateReservation)}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-3.5 h-3.5 text-gray-400" />
                              <span>
                                {item.dateConfirmation
                                  ? "Confirmé le " +
                                    formatDate(item.dateConfirmation)
                                  : "Pas encore confirmé"}
                              </span>
                            </div>
                            {item.causeAnnulation && (
                              <div className="col-span-full flex items-start space-x-2 mt-2 p-2 bg-white rounded border border-gray-200">
                                <AlertCircle className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-semibold text-gray-700">
                                    Cause : {item.causeAnnulation}
                                  </p>
                                  {item.origineAnnulation && (
                                    <p className="text-gray-600 mt-1">
                                      Origine : {item.origineAnnulation}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                            {item.compensation > 0 && (
                              <div className="col-span-full flex items-center space-x-2 mt-2 p-2 bg-green-50 rounded border border-green-200">
                                <Coins className="w-3.5 h-3.5 text-green-600" />
                                <span className="font-semibold text-green-700">
                                  Compensation :{" "}
                                  {(item.compensation * 100).toFixed(0)}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Image en bas */}
              <div className="relative h-30">
                <img
                  src="/images/cameroun3___.jpg"
                  alt="Historique"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=300&fit=crop";
                  }}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="max-w-4xl mx-auto text-center">
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-lg">
                      Votre parcours avec nous
                    </h3>
                    <p className="text-white/90 drop-shadow-md">
                      Merci de voyager avec SafaraPlace
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
