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
  CreditCard,
  X,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import MobileSidebar from "@/app/components/Mobilesidebar";
import Header from "@/app/components/Header";
import SuccessModal from "@/app/components/SuccessModal";
import ErrorModal from "@/app/components/ErrorModal";

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
 *
 * @author Félix DJOTIO NDIE
 * @date 2025-01-29
 */
export default function ClientReservationsPage() {
  const [reservations, setReservations] = useState<ReservationData[]>([]);
  const [is_loading, setIsLoading] = useState(true);
  const [error_message, setErrorMessage] = useState("");
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

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const RESERVATIONS_PER_PAGE = 6;

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
      active: true,
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
        throw new Error("Erreur lors du chargement des réservations");
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
      setErrorMessage("Impossible de charger vos réservations");
      console.error("Fetch Reservations Error:", error);
    } finally {
      setIsLoading(false);
    }
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
        throw new Error("Erreur lors du paiement");
      }

      setShowPaiementModal(false);
      if (user_data?.userId) {
        fetchReservations(user_data.userId);
      }
      setShowSuccessModal(true);
    } catch (error: any) {
      setErrorMessage(
        "Une erreur est survenue lors du paiement. Veuillez réessayer.",
      );
      setShowErrorModal(true);
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
    <div className="dashboard-layout">
      <Sidebar menuItems={MENU_ITEMS} activePath="/user/client/reservations" />
      <MobileSidebar
        isOpen={show_mobile_menu}
        onClose={() => setShowMobileMenu(false)}
        menuItems={MENU_ITEMS}
        activePath="/user/client/reservations"
      />

      <div className="dashboard-main">
        <Header
          title="Mes réservations"
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
              <h2 className="section-title">Vos réservations en attente</h2>
              <p className="section-description">
                Gérez et payez vos réservations pour obtenir vos billets
              </p>
            </div>

            {/* Loading State */}
            {is_loading && (
              <div className="loading-state">
                <RefreshCw className="spin" />
                <p>Chargement de vos réservations...</p>
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
            {!is_loading && !error_message && reservations.length === 0 && (
              <div className="empty-state">
                <FileText className="empty-icon" />
                <h3 className="empty-title">Aucune réservation en attente</h3>
                <p className="empty-description">
                  Toutes vos réservations ont été traitées
                </p>
                <button
                  onClick={() => router.push("/user/client/book")}
                  className="btn btn-primary"
                  style={{ marginTop: "var(--spacing-lg)" }}
                >
                  Réserver un voyage
                </button>
              </div>
            )}

            {/* Reservations List */}
            {!is_loading && !error_message && reservations.length > 0 && (
              <>
                <div className="voyage-results-list">
                  {reservations.map((data) => (
                    <div
                      key={data.reservation.idReservation}
                      className="voyage-result-item"
                    >
                      <div className="voyage-result-header">
                        <div className="voyage-result-agency">
                          <span className="voyage-result-label">
                            Nom de l'agence de voyage choisie
                          </span>
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
                              background: "#fef3c7",
                              color: "#92400e",
                              borderRadius: "var(--radius-full)",
                              fontSize: "var(--font-size-xs)",
                              fontWeight: "var(--font-weight-semibold)",
                            }}
                          >
                            En attente
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
                                Destination
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
                              Réservé le{" "}
                              {formatDate(data.reservation.dateReservation)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="voyage-result-footer">
                        <div className="voyage-result-price">
                          <span className="voyage-result-price-label">
                            Montant total
                          </span>
                          <span className="voyage-result-price-value">
                            {data.reservation.prixTotal} FCFA
                          </span>
                        </div>
                        <button
                          onClick={() => ouvrirModalPaiement(data)}
                          className="btn btn-primary"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "var(--spacing-xs)",
                          }}
                        >
                          <span>Payer maintenant</span>
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

      {/* Modal Paiement */}
      {show_paiement_modal && selected_reservation && (
        <div className="modal-overlay">
          <div className="payment-modal-content">
            <div className="payment-modal-header">
              <h2 className="payment-modal-title">
                Paiement de la réservation
              </h2>
              <button
                onClick={() => setShowPaiementModal(false)}
                className="payment-modal-close"
              >
                <X />
              </button>
            </div>

            <div className="payment-modal-body">
              {/* Résumé */}
              <div className="payment-summary">
                <h3 className="payment-summary-title">
                  Résumé de la réservation
                </h3>
                <div className="payment-summary-item">
                  <span className="payment-summary-label">Agence</span>
                  <span className="payment-summary-value">
                    {selected_reservation.agence.longName}
                  </span>
                </div>
                <div className="payment-summary-item">
                  <span className="payment-summary-label">Départ</span>
                  <span className="payment-summary-value">
                    {selected_reservation.voyage.lieuDepart} -{" "}
                    {selected_reservation.voyage.pointDeDepart}
                  </span>
                </div>
                <div className="payment-summary-item">
                  <span className="payment-summary-label">Destination</span>
                  <span className="payment-summary-value">
                    {selected_reservation.voyage.lieuArrive} -{" "}
                    {selected_reservation.voyage.pointArrivee}
                  </span>
                </div>
                <div className="payment-summary-item">
                  <span className="payment-summary-label">Date de départ</span>
                  <span className="payment-summary-value">
                    {formatDate(selected_reservation.voyage.dateDepartPrev)}
                  </span>
                </div>
                <div className="payment-summary-item-end payment-summary-item">
                  <span className="payment-summary-label">Passagers</span>
                  <span className="payment-summary-value">
                    {selected_reservation.reservation.nbrPassager}
                  </span>
                </div>
                <div className="payment-summary-total">
                  <span className="payment-summary-label">Montant à payer</span>
                  <span className="payment-summary-total-value">
                    {selected_reservation.reservation.prixTotal} FCFA
                  </span>
                </div>
              </div>

              {/* Formulaire */}
              <div className="payment-form">
                <div className="form-group">
                  <label className="form-label">Numéro de téléphone *</label>
                  <input
                    type="tel"
                    value={mobile_phone}
                    onChange={(e) => setMobilePhone(e.target.value)}
                    placeholder="(+237) 6XX XXX XXX"
                    className="form-input"
                    maxLength={9}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nom du propriétaire *</label>
                  <input
                    type="text"
                    value={mobile_phone_name}
                    onChange={(e) => setMobilePhoneName(e.target.value)}
                    placeholder="Nom complet"
                    className="form-input"
                  />
                </div>

                <div className="payment-info">
                  Une demande de paiement sera envoyée sur ce numéro pour
                  valider la transaction.
                </div>

                <button
                  onClick={effectuerPaiement}
                  disabled={is_loading_paiement || !isPaymentFormValid()}
                  className="btn btn-primary btn-full-width"
                >
                  {is_loading_paiement ? (
                    <>
                      <RefreshCw className="spin" />
                      <span>Paiement en cours...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard />
                      <span>Confirmer le paiement</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <SuccessModal
        show={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push("/user/client/tickets");
        }}
        title="Réservation payée"
        message="Votre réservation a été confirmée."
        buttonText="OK"
      />

      <ErrorModal
        show={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={error_message}
      />
    </div>
  );
}
