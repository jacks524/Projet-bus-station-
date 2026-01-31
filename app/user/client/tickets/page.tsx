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
  MapPin,
  Clock,
  Users,
  Compass,
  ChevronLeft,
  ChevronRight,
  Printer,
  X,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import MobileSidebar from "@/app/components/Mobilesidebar";
import Header from "@/app/components/Header";

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
  location: string;
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
 *
 * @author Félix DJOTIO NDIE
 * @date 2025-01-29
 */
export default function ClientTicketsPage() {
  const [tickets, setTickets] = useState<ReservationData[]>([]);
  const [is_loading, setIsLoading] = useState(true);
  const [error_message, setErrorMessage] = useState("");
  const [show_mobile_menu, setShowMobileMenu] = useState(false);
  const [user_data, setUserData] = useState<UserData | null>(null);
  const [current_page, setCurrentPage] = useState(0);
  const [total_pages, setTotalPages] = useState(0);

  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const TICKETS_PER_PAGE = 100;

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
        },
      );

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des billets");
      }

      const data = await response.json();
      const now = new Date();
      const all_reservations = data.content || [];

      const confirmed_tickets = all_reservations.filter(
        (item: ReservationData) => {
          const voyage_date = new Date(item.voyage.dateDepartPrev);
          return (
            item.reservation.statutReservation === "CONFIRMER" &&
            voyage_date >= now
          );
        },
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

  const handlePrintTicket = (ticket: ReservationData) => {
    const print_window = window.open("", "_blank");
    if (!print_window) return;

    const print_content = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Billet - ${ticket.reservation.idReservation}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          background: #f5f5f5;
          padding: 20px;
          color: #171717;
        }
        
        .ticket-wrapper {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .ticket-header {
          padding: 24px 24px 24px;
          border-bottom: 1px solid #e5e5e5;
        }
        
        .logo {
          width: 150px;
          height: 38px;
          margin-bottom: -10px;
        }
        
        .ticket-title {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 4px;
          color: #171717;
        }
        
        .ticket-subtitle {
          font-size: 14px;
          color: #737373;
        }
        
        .amount-section {
          background: #fafafa;
          padding: 32px 24px;
          text-align: center;
          border-bottom: 1px solid #e5e5e5;
        }
        
        .amount-label {
          font-size: 13px;
          color: #737373;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .amount-value {
          font-size: 36px;
          font-weight: 800;
          color: #7cab1b;
          line-height: 1;
        }
        
        .details-section {
          padding: 18px;
        }
        
        .section-title {
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          padding-bottom: 8px;
        }
        
        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 5px 0;
        }
        
        .detail-row:last-child {
          border-bottom: none;
        }
        
        .detail-label {
          font-size: 14px;
          color: #737373;
          font-weight: 500;
        }
        
        .detail-value {
          font-size: 14px;
          color: #171717;
          font-weight: 600;
          text-align: right;
          max-width: 60%;
        }
        
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          background: #0a9e4e;
          color: white;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .footer {
          background: #fafafa;
          padding: 20px 24px;
          text-align: center;
          border-top: 1px solid #e5e5e5;
        }
        
        .footer-text {
          font-size: 12px;
          color: #737373;
          line-height: 1.6;
        }
        
        .footer-highlight {
          font-weight: 600;
          color: #171717;
        }
        
        .divider {
          height: 1px;
          background: #e5e5e5;
          margin-bottom : 18px;
        }
        
        @media print {
          body {
            background: white;
            padding: 0;
          }
          
          .ticket-wrapper {
            box-shadow: none;
            border: 1px solid #e5e5e5;
          }
        }
      </style>
    </head>
    <body>
      <div class="ticket-wrapper">
        <!-- Header -->
        <div class="ticket-header">
          <img src="/images/busstation.png" alt="BusStation" class="logo">
        </div>
        
        <!-- Details Section -->
        <div class="details-section">
          <div class="section-title">Détails de l'agence de voyage</div>
          
          <div class="detail-row">
            <span class="detail-label">Nom de l'agence</span>
            <span class="detail-value">${ticket.agence.longName}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Addresse</span>
            <span class="detail-value">${ticket.agence.ville} - ${ticket.agence.location}</span>
          </div>
          
          <div class="divider"></div>
          
          <div class="section-title">Itinéraire du voyage</div>
          
          <div class="detail-row">
            <span class="detail-label">Départ</span>
            <span class="detail-value">${ticket.voyage.lieuDepart} - ${ticket.voyage.pointDeDepart}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Arrivée</span>
            <span class="detail-value">${ticket.voyage.lieuArrive} - ${ticket.voyage.pointArrivee}</span>
          </div>
          
          <div class="divider"></div>
          
          <div class="section-title">Détails de la réservation</div>
          
          <div class="detail-row">
            <span class="detail-label">Passagers</span>
            <span class="detail-value">${ticket.reservation.nbrPassager} personne${ticket.reservation.nbrPassager > 1 ? "s" : ""}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Date de départ</span>
            <span class="detail-value">${new Date(ticket.voyage.dateDepartPrev).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })} , ${new Date(ticket.voyage.dateDepartPrev).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Type de service</span>
            <span class="detail-value">Réservation de voyage</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Référence</span>
            <span class="detail-value">${ticket.reservation.idReservation}</span>
          </div>
          
          <div class="divider"></div>
          
          <div class="section-title">Détail du paiement</div>
          
          <div class="detail-row">
            <span class="detail-label">Date de paiement</span>
            <span class="detail-value">${new Date(ticket.reservation.dateConfirmation).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })} , ${new Date(ticket.reservation.dateConfirmation).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Montant du transfert</span>
            <span class="detail-value">${ticket.reservation.prixTotal.toLocaleString()} FCFA</span>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <p class="footer-text">
            <span class="footer-highlight">Merci d'avoir choisi BusStation</span>
          </p>
          <p class="footer-text">
            Veuillez présenter ce billet lors de l'embarquement
          </p>
          <p class="footer-text" style="margin-top: 12px; font-size: 11px;">
            Imprimé le ${new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })} à ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
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
    <div className="dashboard-layout">
      <Sidebar menuItems={MENU_ITEMS} activePath="/user/client/tickets" />
      <MobileSidebar
        isOpen={show_mobile_menu}
        onClose={() => setShowMobileMenu(false)}
        menuItems={MENU_ITEMS}
        activePath="/user/client/tickets"
      />

      <div className="dashboard-main">
        <Header
          title="Mes billets"
          userData={user_data}
          onMenuClick={() => setShowMobileMenu(true)}
        />

        <main className="dashboard-content">
          <div className="container" style={{ maxWidth: "1200px" }}>
            {/* Section Header */}
            <div
              className="section-header"
              style={{ marginBottom: "var(--spacing-2xl)" }}
            >
              <h2 className="section-title">Vos billets confirmés</h2>
              <p className="section-description">
                Consultez et imprimez vos billets pour vos prochains voyages
              </p>
            </div>

            {/* Loading State */}
            {is_loading && (
              <div className="loading-state">
                <RefreshCw className="spin" />
                <p>Chargement de vos billets...</p>
              </div>
            )}

            {/* Error State */}
            {!is_loading && error_message && (
              <div className="error-state">
                <X className="error-state-icon" />
                <p className="error-text">{error_message}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="btn modal-button modal-button-error"
                >
                  Réessayer
                </button>
              </div>
            )}

            {/* Empty State */}
            {!is_loading && !error_message && tickets.length === 0 && (
              <div className="empty-state">
                <Ticket className="empty-icon" />
                <h3 className="empty-title">Aucun billet disponible</h3>
                <p className="empty-description">
                  Vous n'avez pas encore de billets confirmés
                </p>
                <button
                  onClick={() => router.push("/user/client/reservations")}
                  className="btn btn-primary"
                  style={{ marginTop: "var(--spacing-lg)" }}
                >
                  Payer une réservation
                </button>
              </div>
            )}

            {/* Tickets List */}
            {!is_loading && !error_message && tickets.length > 0 && (
              <>
                <div className="voyage-results-list">
                  {tickets.map((data) => (
                    <div
                      key={data.reservation.idReservation}
                      className="voyage-result-item"
                    >
                      <div className="voyage-result-header">
                        <div className="voyage-result-agency">
                          <span className="voyage-result-label">Agence</span>
                          <h3 className="voyage-result-agency-name">
                            {data.agence.longName}
                          </h3>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "var(--spacing-md)",
                          }}
                        >
                          <span className="voyage-result-id">
                            #{data.reservation.idReservation.slice(0, 13)}
                          </span>
                          <span
                            style={{
                              padding: "4px 12px",
                              background: "#d1fae5",
                              color: "#065f46",
                              borderRadius: "var(--radius-full)",
                              fontSize: "var(--font-size-xs)",
                              fontWeight: "var(--font-weight-semibold)",
                            }}
                          >
                            ✓ Confirmé
                          </span>
                        </div>
                      </div>

                      <div className="voyage-result-content">
                        <div className="voyage-result-route">
                          <div className="voyage-result-location">
                            <MapPin />
                            <div>
                              <span className="voyage-result-location-label">
                                Départ
                              </span>
                              <span className="voyage-result-location-value">
                                {data.voyage.lieuDepart} -{" "}
                                {data.voyage.pointDeDepart}
                              </span>
                            </div>
                          </div>

                          <div className="voyage-result-location">
                            <MapPin />
                            <div>
                              <span className="voyage-result-location-label">
                                Arrivée
                              </span>
                              <span className="voyage-result-location-value">
                                {data.voyage.lieuArrive} -{" "}
                                {data.voyage.pointArrivee}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="voyage-result-details">
                          <div className="voyage-result-detail">
                            <Clock />
                            <span>
                              {formatDate(data.voyage.dateDepartPrev)}
                            </span>
                          </div>

                          <div className="voyage-result-detail">
                            <Users />
                            <span>
                              {data.reservation.nbrPassager} passager
                              {data.reservation.nbrPassager > 1 ? "s" : ""}
                            </span>
                          </div>

                          <div className="voyage-result-detail">
                            <Calendar />
                            <span>
                              Confirmé le{" "}
                              {formatDate(data.reservation.dateConfirmation)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="voyage-result-footer">
                        <div className="voyage-result-price">
                          <span className="voyage-result-price-label">
                            Montant payé
                          </span>
                          <span
                            className="voyage-result-price-value"
                            style={{ color: "#0a9e4e" }}
                          >
                            {data.reservation.prixTotal} FCFA
                          </span>
                        </div>
                        <button
                          onClick={() => handlePrintTicket(data)}
                          className="btn btn-primary"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "var(--spacing-xs)",
                          }}
                        >
                          <span>Imprimer le billet</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {total_pages > 1 && (
                  <div
                    className="widget-pagination"
                    style={{
                      justifyContent: "center",
                      marginTop: "var(--spacing-2xl)",
                    }}
                  >
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(0, current_page - 1))
                      }
                      disabled={current_page === 0}
                      className="btn-icon"
                    >
                      <ChevronLeft />
                    </button>
                    <span>
                      Page {current_page + 1} / {total_pages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage(
                          Math.min(total_pages - 1, current_page + 1),
                        )
                      }
                      disabled={current_page === total_pages - 1}
                      className="btn-icon"
                    >
                      <ChevronRight />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
