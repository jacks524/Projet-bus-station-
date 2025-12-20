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
  MapPin,
  Clock,
  Users,
  Compass,
  ChevronLeft,
  ChevronRight,
  Printer,
} from "lucide-react";
import { useRouter } from "next/navigation";

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
  dateConfirmation: string;
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
 * Client Tickets Page Component
 *
 * Display user's confirmed tickets with print option
 * Shows only reservations with status "CONFIRMER"
 *
 * @author Thomas Djotio Ndié
 * @date 2025-12-20
 */
export default function ClientTicketsPage() {
  const [tickets, setTickets] = useState<ReservationData[]>([]);
  const [is_loading, setIsLoading] = useState(true);
  const [error_message, setErrorMessage] = useState("");

  const [show_profile_menu, setShowProfileMenu] = useState(false);
  const [show_mobile_menu, setShowMobileMenu] = useState(false);
  const [user_data, setUserData] = useState<UserData | null>(null);

  const [current_page, setCurrentPage] = useState(0);
  const [total_pages, setTotalPages] = useState(0);

  const router = useRouter();

  const API_BASE_URL = "http://localhost:8081/api";
  const BUTTON_COLOR = "#6149CD";
  const TICKETS_PER_PAGE = 10;

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
      active: true,
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
      const parsed_user = JSON.parse(stored_user_data);
      setUserData(parsed_user);
      fetchTickets(parsed_user.userId);
    }
  }, []);

  useEffect(() => {
    if (user_data?.userId) {
      fetchTickets(user_data.userId);
    }
  }, [current_page]);

  const fetchTickets = async (user_id: string) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const auth_token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");

      const response = await fetch(
        `${API_BASE_URL}/reservation/utilisateur/${user_id}?page=${current_page}&size=${TICKETS_PER_PAGE}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des billets");
      }

      const data = await response.json();

      const all_reservations = data.content || [];
      // Filtrer uniquement les réservations confirmées
      const confirmed_tickets = all_reservations.filter(
        (item: ReservationData) =>
          item.reservation.statutReservation === "CONFIRMER"
      );

      setTickets(confirmed_tickets);
      setTotalPages(data.totalPages || 0);
    } catch (error: any) {
      setErrorMessage("Impossible de charger vos billets");
      console.error("Fetch Tickets Error:", error);
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

  const handlePrintTicket = (ticket: ReservationData) => {
    // Créer une fenêtre d'impression avec le contenu du ticket
    const print_window = window.open("", "_blank");
    if (!print_window) return;

    const print_content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Billet - ${ticket.reservation.idReservation}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          .ticket-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #6149CD;
            padding-bottom: 20px;
          }
          .ticket-title {
            font-size: 32px;
            font-weight: bold;
            color: #6149CD;
            margin-bottom: 10px;
          }
          .ticket-id {
            font-size: 14px;
            color: #666;
          }
          .ticket-section {
            margin: 20px 0;
            padding: 15px;
            background: #f9f9f9;
            border-radius: 8px;
          }
          .section-title {
            font-weight: bold;
            font-size: 16px;
            color: #333;
            margin-bottom: 10px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            padding: 5px 0;
          }
          .info-label {
            font-weight: 600;
            color: #555;
          }
          .info-value {
            color: #333;
          }
          .ticket-footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #999;
            border-top: 2px solid #eee;
            padding-top: 20px;
          }
          .status-badge {
            display: inline-block;
            padding: 8px 16px;
            background: #10b981;
            color: white;
            border-radius: 20px;
            font-weight: bold;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="ticket-header">
          <div class="ticket-title">🎫 BILLET DE VOYAGE</div>
          <div class="ticket-id">N° ${ticket.reservation.idReservation}</div>
          <div class="status-badge">CONFIRMÉ</div>
        </div>

        <div class="ticket-section">
          <div class="section-title">📍 Informations du voyage</div>
          <div class="info-row">
            <span class="info-label">Agence :</span>
            <span class="info-value">${ticket.agence.longName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">De :</span>
            <span class="info-value">${ticket.voyage.lieuDepart}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Vers :</span>
            <span class="info-value">${ticket.voyage.lieuArrive}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Point de départ :</span>
            <span class="info-value">${ticket.voyage.pointDeDepart}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Point d'arrivée :</span>
            <span class="info-value">${ticket.voyage.pointArrivee}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Date de départ :</span>
            <span class="info-value">${formatDate(
              ticket.voyage.dateDepartPrev
            )}</span>
          </div>
        </div>

        <div class="ticket-section">
          <div class="section-title">👤 Informations du passager</div>
          <div class="info-row">
            <span class="info-label">Nombre de passagers :</span>
            <span class="info-value">${ticket.reservation.nbrPassager}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Date de réservation :</span>
            <span class="info-value">${formatDate(
              ticket.reservation.dateReservation
            )}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Date de confirmation :</span>
            <span class="info-value">${formatDate(
              ticket.reservation.dateConfirmation
            )}</span>
          </div>
        </div>

        <div class="ticket-section">
          <div class="section-title">💰 Informations de paiement</div>
          <div class="info-row">
            <span class="info-label">Prix total :</span>
            <span class="info-value" style="font-size: 24px; font-weight: bold; color: #6149CD;">${
              ticket.reservation.prixTotal
            } FCFA</span>
          </div>
          <div class="info-row">
            <span class="info-label">Montant payé :</span>
            <span class="info-value">${
              ticket.reservation.montantPaye
            } FCFA</span>
          </div>
          <div class="info-row">
            <span class="info-label">Statut du paiement :</span>
            <span class="info-value">${ticket.reservation.statutPayement}</span>
          </div>
        </div>

        <div class="ticket-footer">
          <p>Merci d'avoir choisi SafaraPlace pour votre voyage</p>
          <p>Veuillez présenter ce billet lors de l'embarquement</p>
          <p>Imprimé le ${new Date().toLocaleDateString(
            "fr-FR"
          )} à ${new Date().toLocaleTimeString("fr-FR")}</p>
        </div>
      </body>
      </html>
    `;

    print_window.document.write(print_content);
    print_window.document.close();
    print_window.focus();
    setTimeout(() => {
      print_window.print();
      print_window.close();
    }, 250);
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
              <h1 className="text-2xl font-semibold text-gray-900">
                Mes billets
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
            {/* Carte fusionnée : Billets à gauche + Image à droite */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-3">
                {/* Partie gauche - Liste des billets */}
                <div className="lg:col-span-2 p-8 bg-linear-to-br from-white">
                  {is_loading ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="text-center">
                        <Ticket className="w-16 h-16 text-[#6149CD] animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">
                          Chargement de vos billets...
                        </p>
                      </div>
                    </div>
                  ) : error_message ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                      <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
                      <p className="text-red-600">{error_message}</p>
                    </div>
                  ) : tickets.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center">
                      <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Aucun billet disponible
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Vous n'avez pas encore de billets confirmés
                      </p>
                      <button
                        onClick={() => router.push("/user/client/reservations")}
                        style={{ backgroundColor: BUTTON_COLOR }}
                        className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity"
                      >
                        Payer une reservation
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center space-x-3 mb-6">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg"
                          style={{ backgroundColor: BUTTON_COLOR }}
                        >
                          <Ticket className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            Vos billets confirmés
                          </h3>
                          <p className="text-sm text-gray-600">
                            {tickets.length} billet
                            {tickets.length > 1 ? "s" : ""} sur cette page
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4 mb-6">
                        {tickets.map((data) => (
                          <div
                            key={data.reservation.idReservation}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                  {data.agence.longName}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  Confirmé le{" "}
                                  {formatDate(
                                    data.reservation.dateConfirmation
                                  )}
                                </p>
                              </div>
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                ✓ Confirmé
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="space-y-3">
                                <div className="flex items-center space-x-2 text-sm">
                                  <MapPin className="w-4 h-4 text-gray-500" />
                                  <span className="text-gray-700">
                                    <span className="font-semibold">
                                      De {data.voyage.lieuDepart} vers{" "}
                                      {data.voyage.lieuArrive}
                                    </span>
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 text-xs text-gray-600">
                                  <Compass className="w-3.5 h-3.5 text-gray-400" />
                                  <span>
                                    Itinéraire : De {data.voyage.pointDeDepart}{" "}
                                    vers {data.voyage.pointArrivee}
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-center space-x-2 text-sm">
                                  <Clock className="w-4 h-4 text-gray-500" />
                                  <span className="text-gray-700">
                                    {formatDate(data.voyage.dateDepartPrev)}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                  <Users className="w-4 h-4 text-gray-500" />
                                  <span className="text-gray-700">
                                    {data.reservation.nbrPassager} passager
                                    {data.reservation.nbrPassager > 1
                                      ? "s"
                                      : ""}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                              <div>
                                <p className="text-sm text-gray-600 mb-1">
                                  Montant payé
                                </p>
                                <p className="text-2xl font-bold text-green-600">
                                  {data.reservation.prixTotal} FCFA
                                </p>
                              </div>
                              <button
                                onClick={() => handlePrintTicket(data)}
                                className="px-6 py-3 bg-[#6149CD] text-white rounded-lg hover:opacity-90 active:opacity-80 transition-all font-semibold flex items-center space-x-2"
                              >
                                <Printer className="w-5 h-5" />
                                <span>Imprimer</span>
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
                            <span>Précédent</span>
                          </button>

                          <span className="text-sm text-gray-600">
                            Page {current_page + 1} sur {total_pages}
                          </span>

                          <button
                            onClick={() =>
                              setCurrentPage(
                                Math.min(total_pages - 1, current_page + 1)
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

                {/* Partie droite - Image avec overlay */}
                <div className="lg:col-span-1 relative min-h-125">
                  <img
                    src="/images/cameroun6.jpg"
                    alt="Billets"
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=800&fit=crop";
                    }}
                  />
                  <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/50 to-black/70"></div>
                  <div className="absolute inset-0 flex flex-col justify-between p-8">
                    <div>
                      <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
                        Vos billets
                      </h2>
                      <p className="text-white/90 text-lg mb-6 drop-shadow-md">
                        Consultez et imprimez vos billets confirmés
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <Ticket className="w-6 h-6 text-white" />
                          <span className="text-white font-semibold">
                            Billets confirmés
                          </span>
                        </div>
                        <p className="text-3xl font-bold text-white">
                          Nombre par page : {tickets.length}
                        </p>
                      </div>

                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                        <p className="text-sm text-white/90">
                          Imprimez vos billets pour l'embarquement
                        </p>
                      </div>
                    </div>
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
