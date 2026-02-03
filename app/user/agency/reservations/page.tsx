"use client";

import React, { useState, useEffect } from "react";
import {
  Home,
  Bus,
  Calendar,
  Users,
  Settings,
  MapPin,
  Clock,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ChevronDown,
  Building2,
  X,
  CreditCard,
  User,
  Compass,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import MobileSidebar from "@/app/components/Mobilesidebar";
import Header from "@/app/components/Header";
import ConfirmModal from "@/app/components/ConfirmModal";
import SuccessModal from "@/app/components/SuccessModal";
import ErrorModal from "@/app/components/ErrorModal";
import { useLanguage } from "@/app/providers";

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
}

/**
 * Agency Reservations Page Component
 *
 * Display and manage agency reservations
 *
 * @author Félix DJOTIO NDIE
 * @date 2025-01-29
 */
export default function AgencyReservationsPage() {
  const router = useRouter();

  const [reservations, setReservations] = useState<ReservationData[]>([]);
  const [agences, setAgences] = useState<AgenceValidee[]>([]);
  const [selectedAgence, setSelectedAgence] = useState<AgenceValidee | null>(
    null,
  );
  const [userData, setUserData] = useState<UserData | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAgences, setIsLoadingAgences] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAgenceSelector, setShowAgenceSelector] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<ReservationData | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<string | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { t, language } = useLanguage();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const RESERVATIONS_PER_PAGE = 6;

  const menuItems = [
    {
      icon: Home,
      label: t("Dashboard", "Dashboard"),
      path: "/user/agency/dashboard",
      active: false,
    },
    {
      icon: Bus,
      label: t("Voyages", "Trips"),
      path: "/user/agency/travels",
      active: false,
    },
    {
      icon: Calendar,
      label: t("Réservations", "Reservations"),
      path: "/user/agency/reservations",
      active: true,
    },
    {
      icon: Users,
      label: t("Chauffeurs", "Drivers"),
      path: "/user/agency/drivers",
      active: false,
    },
    {
      icon: Settings,
      label: t("Mes paramètres", "My settings"),
      path: "/user/agency/settings",
      active: false,
    },
  ];

  useEffect(() => {
    const authToken =
      localStorage.getItem("auth_token") ||
      sessionStorage.getItem("auth_token");
    if (!authToken) {
      router.push("/login");
      return;
    }

    const storedUserData =
      localStorage.getItem("user_data") || sessionStorage.getItem("user_data");
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (userData?.userId) {
      fetchAgences();
    }
  }, [userData?.userId]);

  useEffect(() => {
    if (selectedAgence?.agency_id) {
      fetchReservations(selectedAgence.agency_id);
    }
  }, [selectedAgence?.agency_id, currentPage]);

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
      const authToken = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/agence/validated?page=0&size=1000`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      if (!response.ok)
        throw new Error(
          t("Erreur lors du chargement des agences", "Failed to load agencies"),
        );

      const data = await response.json();
      const allAgences = data.content || data || [];
      const myAgences = allAgences.filter(
        (agence: AgenceValidee) => agence.user_id === userData?.userId,
      );

      setAgences(myAgences);
      if (myAgences.length > 0 && !selectedAgence) {
        setSelectedAgence(myAgences[0]);
      }
      if (myAgences.length === 0) {
        setIsLoading(false);
      }
    } catch (error: any) {
      setErrorMessage(
        t("Impossible de charger vos agences", "Unable to load your agencies"),
      );
      setIsLoading(false);
    } finally {
      setIsLoadingAgences(false);
    }
  };

  const fetchReservations = async (agenceId: string) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const authToken = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/reservation/agence/${agenceId}?page=${currentPage}&size=${RESERVATIONS_PER_PAGE}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      if (!response.ok)
        throw new Error(
          t(
            "Erreur lors du chargement des réservations",
            "Failed to load reservations",
          ),
        );

      const data = await response.json();

      if (Array.isArray(data)) {
        setReservations(data);
        setTotalPages(1);
      } else {
        setReservations(data.content || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error: any) {
      setErrorMessage(
        t("Impossible de charger les réservations", "Unable to load reservations"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAgence = (agence: AgenceValidee) => {
    setSelectedAgence(agence);
    setShowAgenceSelector(false);
    setCurrentPage(0);
  };

  const handleDeleteReservation = async () => {
    if (!reservationToDelete) return;

    setIsDeleting(true);
    try {
      const authToken = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/reservation/${reservationToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      if (!response.ok) throw new Error("Erreur lors de la suppression");

      setShowDeleteModal(false);
      setReservationToDelete(null);
      setSuccessMessage(
        t("Réservation supprimée avec succès", "Reservation deleted successfully"),
      );
      setShowSuccessModal(true);

      if (selectedAgence?.agency_id) {
        fetchReservations(selectedAgence.agency_id);
      }
    } catch (error: any) {
      setErrorMessage(
        t(
          "Erreur lors de la suppression de la réservation",
          "Failed to delete reservation",
        ),
      );
      setShowErrorModal(true);
    } finally {
      setIsDeleting(false);
    }
  };

  const openDetailModal = (reservation: ReservationData) => {
    setSelectedReservation(reservation);
    setShowDetailModal(true);
  };

  const formatDate = (dateString: string) => {
    const locale = language === "fr" ? "fr-FR" : "en-US";
    return new Date(dateString).toLocaleDateString(locale, {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRevenue = (amount: number) => {
    const locale = language === "fr" ? "fr-FR" : "en-US";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadgeClass = (status: string) => {
    const classes: Record<string, string> = {
      RESERVER: "badge-warning",
      CONFIRMER: "badge-success",
      ANNULER: "badge-error",
      VALIDER: "badge-info",
    };
    return classes[status] || "badge-info";
  };

  const getPaymentBadgeClass = (status: string) => {
    const classes: Record<string, string> = {
      NO_PAYMENT: "badge-warning",
      PAID: "badge-success",
      FAILED: "badge-error",
      PENDING: "badge-info",
    };
    return classes[status] || "badge-info";
  };

  const stats = {
    total: reservations.length,
    reserved: reservations.filter(
      (r) => r.reservation.statutReservation === "RESERVER",
    ).length,
    confirmed: reservations.filter(
      (r) => r.reservation.statutReservation === "CONFIRMER",
    ).length,
    totalRevenue: reservations
      .filter((r) => r.reservation.statutPayement === "PAID")
      .reduce((sum, r) => sum + r.reservation.prixTotal, 0),
  };

  return (
    <div className="dashboard-layout">
      <Sidebar menuItems={menuItems} activePath="/user/agency/reservations" />
      <MobileSidebar
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        menuItems={menuItems}
        activePath="/user/agency/reservations"
      />

      <div className="dashboard-main">
        <Header
          title={t("Réservations", "Reservations")}
          userData={userData}
          onMenuClick={() => setShowMobileMenu(true)}
          userType="agency"
        />

        <main className="dashboard-content">
          {isLoadingAgences && agences.length === 0 && (
            <div className="loading-state">
              <RefreshCw className="spin" />
              <p>{t("Chargement en cours...", "Loading...")}</p>
            </div>
          )}

          {!isLoadingAgences && errorMessage && (
            <>
              <div className="error-state">
                <X className="error-state-icon" />
                <p className="error-text">{errorMessage}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="btn modal-button modal-button-error"
                >
                  {t("Réessayer", "Try again")}
                </button>
              </div>
            </>
          )}

          {!isLoadingAgences && agences.length === 0 && !errorMessage && (
            <>
              <div className="empty-state">
                <Building2 className="empty-icon" />
                <h3 className="empty-title">
                  {t("Aucune agence validée", "No validated agency")}
                </h3>
                <p className="empty-description">
                  {t(
                    "Vous n'avez pas encore d'agence validée",
                    "You don't have any validated agency yet",
                  )}
                </p>
                <button
                  onClick={() => router.push("/user/agency/dashboard")}
                  className="btn btn-primary"
                >
                  {t("Retour au dashboard", "Back to dashboard")}
                </button>
              </div>
            </>
          )}

          {!isLoadingAgences && agences.length > 0 && (
            <>
              <div
                className="section-header"
                style={{ marginBottom: "var(--spacing-2xl)" }}
              >
                <h2 className="section-title">
                  {t("Gestion des réservations", "Reservation management")}
                </h2>
                <p className="section-description">
                  {t(
                    "Gérer les différentes réservations de votre agence de voyage",
                    "Manage your agency reservations",
                  )}
                </p>
              </div>

              {/* Agence Header */}
              <div className="agency-header-card">
                <div className="agency-info">
                  <h2 className="agency-name">
                    {t("Nom de votre agence de voyage :", "Agency name:")}{" "}
                    {selectedAgence?.long_name}
                  </h2>
                  <p className="agency-location">
                    {t(
                      "Adresse de votre agence de voyage :",
                      "Agency address:",
                    )}{" "}
                    {selectedAgence?.ville} - {selectedAgence?.location}
                  </p>
                </div>

                {agences.length > 1 && (
                  <div className="agency-selector">
                    <button
                      onClick={() => setShowAgenceSelector(!showAgenceSelector)}
                      className="btn btn-secondary"
                    >
                      {t("Changer", "Change")}
                      <ChevronDown />
                    </button>

                    {showAgenceSelector && (
                      <>
                        <div
                          className="selector-overlay"
                          onClick={() => setShowAgenceSelector(false)}
                        ></div>
                        <div className="selector-dropdown">
                          {agences.map((agence) => (
                            <button
                              key={agence.agency_id}
                              onClick={() => handleSelectAgence(agence)}
                              className={`selector-item ${selectedAgence?.agency_id === agence.agency_id ? "active" : ""}`}
                            >
                              <div>
                                <p className="selector-item-name">
                                  {agence.long_name}
                                </p>
                                <p className="selector-item-city">
                                  {agence.ville}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                <button
                  onClick={() => {
                    if (selectedAgence?.agency_id) {
                      fetchReservations(selectedAgence.agency_id);
                    }
                  }}
                  className="btn-icon"
                  title={t("Actualiser", "Refresh")}
                >
                  <RefreshCw />
                </button>
              </div>

              {/* Stats Card */}
              <div className="summary-card">
                <div className="summary-item">
                  <div>
                    <div className="summary-value">{stats.total}</div>
                    <div className="summary-label">{t("Total", "Total")}</div>
                  </div>
                </div>

                <div className="summary-item">
                  <div>
                    <div className="summary-value">{stats.reserved}</div>
                    <div className="summary-label">
                      {t("En attente", "Pending")}
                    </div>
                  </div>
                </div>

                <div className="summary-item">
                  <div>
                    <div className="summary-value">{stats.confirmed}</div>
                    <div className="summary-label">
                      {t("Confirmées", "Confirmed")}
                    </div>
                  </div>
                </div>

                <div className="summary-item">
                  <div>
                    <div className="summary-value">
                      {formatRevenue(stats.totalRevenue)}
                    </div>
                    <div className="summary-label">
                      {t("Revenus", "Revenue")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Loading */}
              {isLoading && (
                <div className="loading-state">
                  <RefreshCw className="spin" />
                  <p>{t("Chargement des réservations...", "Loading reservations...")}</p>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !errorMessage && reservations.length === 0 && (
                <div className="empty-state">
                  <FileText className="empty-icon" />
                  <h3 className="empty-title">
                    {t("Aucune réservation", "No reservations")}
                  </h3>
                  <p className="empty-description">
                    {t(
                      "Il n'y a pas encore de réservations pour cette agence",
                      "There are no reservations for this agency yet",
                    )}
                  </p>
                </div>
              )}

              {/* Reservations List */}
              {!isLoading && !errorMessage && reservations.length > 0 && (
                <>
                  <div className="section-header">
                    <h2 className="section-title">
                      {t("Toutes les réservations", "All reservations")}
                    </h2>
                    <p className="section-description">
                      {t(
                        "Cliquez sur une réservation pour voir les détails",
                        "Click a reservation to view details",
                      )}
                    </p>
                  </div>

                  <div className="voyage-results-list">
                    {reservations.map((data) => (
                      <div
                        key={data.reservation.idReservation}
                        className="voyage-result-item clickable"
                        onClick={() => openDetailModal(data)}
                      >
                        <div className="voyage-result-header">
                          <div className="voyage-result-agency">
                            <span className="voyage-result-label">
                              {t("Réservation", "Reservation")}
                            </span>
                            <h3 className="voyage-result-agency-name">
                              #{data.reservation.idReservation.slice(0, 13)}
                            </h3>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "var(--spacing-sm)",
                            }}
                          >
                            <span
                              className={`status-badge ${getStatusBadgeClass(data.reservation.statutReservation)}`}
                            >
                              {data.reservation.statutReservation}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setReservationToDelete(
                                  data.reservation.idReservation,
                                );
                                setShowDeleteModal(true);
                              }}
                              className="btn-icon-danger"
                              title={t("Supprimer", "Delete")}
                            >
                              <Trash2 />
                            </button>
                          </div>
                        </div>

                        <div className="voyage-result-content">
                          <div className="voyage-result-route">
                            <div className="voyage-result-location">
                              <MapPin />
                              <div>
                                <span className="voyage-result-location-label">
                                  {t("Départ", "Departure")}
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
                                  {t("Arrivée", "Arrival")}
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
                                {data.reservation.nbrPassager}{" "}
                                {data.reservation.nbrPassager > 1
                                  ? t("passagers", "passengers")
                                  : t("passager", "passenger")}
                              </span>
                            </div>

                            <div className="voyage-result-detail">
                              <Calendar />
                              <span>
                                {t("Réservé le", "Booked on")}{" "}
                                {formatDate(data.reservation.dateReservation)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="voyage-result-footer">
                          <div className="voyage-result-price">
                            <span className="voyage-result-price-label">
                              {t("Montant", "Amount")}
                            </span>
                            <span className="voyage-result-price-value">
                              {formatRevenue(data.reservation.prixTotal)}
                            </span>
                          </div>
                          <span
                            className={`status-badge ${getPaymentBadgeClass(data.reservation.statutPayement)}`}
                          >
                            {data.reservation.statutPayement}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div
                      className="widget-pagination"
                      style={{
                        justifyContent: "center",
                        marginTop: "var(--spacing-2xl)",
                      }}
                    >
                      <button
                        onClick={() =>
                          setCurrentPage(Math.max(0, currentPage - 1))
                        }
                        disabled={currentPage === 0}
                        className="btn-icon"
                      >
                        <ChevronLeft />
                      </button>
                      <span>
                        {t("Page", "Page")} {currentPage + 1} / {totalPages}
                      </span>
                      <button
                        onClick={() =>
                          setCurrentPage(
                            Math.min(totalPages - 1, currentPage + 1),
                          )
                        }
                        disabled={currentPage === totalPages - 1}
                        className="btn-icon"
                      >
                        <ChevronRight />
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </main>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedReservation && (
        <div className="modal-overlay">
          <div className="payment-modal-content">
            <div className="payment-modal-header">
              <h2 className="payment-modal-title">
                {t("Détails de la réservation", "Reservation details")}
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="payment-modal-close"
              >
                <X />
              </button>
            </div>

            <div className="payment-modal-body">
              {/* Informations réservation */}
              <div className="payment-summary">
                <h3 className="payment-summary-title">
                  {t("Informations de la réservation", "Reservation information")}
                </h3>
                <div className="payment-summary-item">
                  <span className="payment-summary-label">
                    {t("ID Réservation", "Reservation ID")}
                  </span>
                  <span
                    className="payment-summary-value"
                    style={{
                      fontFamily: "monospace",
                      fontSize: "var(--font-size-sm)",
                    }}
                  >
                    {selectedReservation.reservation.idReservation}
                  </span>
                </div>
                <div className="payment-summary-item">
                  <span className="payment-summary-label">
                    {t("Date de réservation", "Reservation date")}
                  </span>
                  <span className="payment-summary-value">
                    {formatDate(
                      selectedReservation.reservation.dateReservation,
                    )}
                  </span>
                </div>
                <div className="payment-summary-item">
                  <span className="payment-summary-label">
                    {t("Statut", "Status")}
                  </span>
                  <span
                    className={`status-badge ${getStatusBadgeClass(selectedReservation.reservation.statutReservation)}`}
                  >
                    {selectedReservation.reservation.statutReservation}
                  </span>
                </div>
                <div className="payment-summary-item">
                  <span className="payment-summary-label">
                    {t("Nombre de passagers", "Passengers")}
                  </span>
                  <span className="payment-summary-value">
                    {selectedReservation.reservation.nbrPassager}
                  </span>
                </div>
              </div>

              {/* Informations voyage */}
              <div
                className="payment-summary"
                style={{ marginTop: "var(--spacing-lg)" }}
              >
                <h3 className="payment-summary-title">
                  {t("Informations du voyage", "Trip information")}
                </h3>
                <div className="payment-summary-item">
                  <span className="payment-summary-label">
                    {t("Trajet", "Route")}
                  </span>
                  <span className="payment-summary-value">
                    {selectedReservation.voyage.lieuDepart} {t("vers", "to")}{" "}
                    {selectedReservation.voyage.lieuArrive}
                  </span>
                </div>
                <div className="payment-summary-item">
                  <span className="payment-summary-label">
                    {t("Itinéraire", "Itinerary")}
                  </span>
                  <span className="payment-summary-value">
                    {selectedReservation.voyage.pointDeDepart} {t("vers", "to")}{" "}
                    {selectedReservation.voyage.pointArrivee}
                  </span>
                </div>
                <div className="payment-summary-item">
                  <span className="payment-summary-label">
                    {t("Date de départ", "Departure date")}
                  </span>
                  <span className="payment-summary-value">
                    {formatDate(selectedReservation.voyage.dateDepartPrev)}
                  </span>
                </div>
                {selectedReservation.voyage.titre && (
                  <div className="payment-summary-item">
                    <span className="payment-summary-label">
                      {t("Titre du voyage", "Trip title")}
                    </span>
                    <span className="payment-summary-value">
                      {selectedReservation.voyage.titre}
                    </span>
                  </div>
                )}
              </div>

              {/* Informations paiement */}
              <div
                className="payment-summary"
                style={{ marginTop: "var(--spacing-lg)" }}
              >
                <h3 className="payment-summary-title">
                  {t("Informations de paiement", "Payment information")}
                </h3>
                <div className="payment-summary-item">
                  <span className="payment-summary-label">
                    {t("Prix total", "Total price")}
                  </span>
                  <span
                    className="payment-summary-value"
                    style={{
                      color: "var(--color-primary)",
                      fontWeight: "var(--font-weight-bold)",
                    }}
                  >
                    {formatRevenue(selectedReservation.reservation.prixTotal)}
                  </span>
                </div>
                <div className="payment-summary-item">
                  <span className="payment-summary-label">
                    {t("Montant payé", "Amount paid")}
                  </span>
                  <span
                    className="payment-summary-value"
                    style={{
                      color: "#10B981",
                      fontWeight: "var(--font-weight-bold)",
                    }}
                  >
                    {formatRevenue(selectedReservation.reservation.montantPaye)}
                  </span>
                </div>
                <div className="payment-summary-item">
                  <span className="payment-summary-label">
                    {t("Statut du paiement", "Payment status")}
                  </span>
                  <span
                    className={`status-badge ${getPaymentBadgeClass(selectedReservation.reservation.statutPayement)}`}
                  >
                    {selectedReservation.reservation.statutPayement}
                  </span>
                </div>
                {selectedReservation.reservation.transactionCode && (
                  <div className="payment-summary-item">
                    <span className="payment-summary-label">
                      {t("Code de transaction", "Transaction code")}
                    </span>
                    <span
                      className="payment-summary-value"
                      style={{
                        fontFamily: "monospace",
                        fontSize: "var(--font-size-sm)",
                      }}
                    >
                      {selectedReservation.reservation.transactionCode}
                    </span>
                  </div>
                )}
              </div>

              {/* Client */}
              <div
                className="payment-summary"
                style={{ marginTop: "var(--spacing-lg)" }}
              >
                <h3 className="payment-summary-title">{t("Client", "Client")}</h3>
                <div className="payment-summary-item">
                  <span className="payment-summary-label">
                    {t("ID Utilisateur", "User ID")}
                  </span>
                  <span
                    className="payment-summary-value"
                    style={{
                      fontFamily: "monospace",
                      fontSize: "var(--font-size-sm)",
                    }}
                  >
                    {selectedReservation.reservation.idUser}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setReservationToDelete(null);
        }}
        onConfirm={handleDeleteReservation}
        title={t("Supprimer la réservation", "Delete reservation")}
        message={t(
          "Êtes-vous sûr de vouloir supprimer cette réservation ? Cette action est irréversible.",
          "Are you sure you want to delete this reservation? This action cannot be undone.",
        )}
        confirmText={t("Supprimer", "Delete")}
        cancelText={t("Annuler", "Cancel")}
        isLoading={isDeleting}
      />

      {/* Success Modal */}
      <SuccessModal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={t("Succès", "Success")}
        message={successMessage}
        buttonText={t("OK", "OK")}
      />

      {/* Error Modal */}
      <ErrorModal
        show={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={errorMessage}
      />
    </div>
  );
}
