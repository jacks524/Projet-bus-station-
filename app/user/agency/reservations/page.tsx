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

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const RESERVATIONS_PER_PAGE = 6;

  const menuItems = [
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
        throw new Error("Erreur lors du chargement des agences");

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
      setErrorMessage("Impossible de charger vos agences");
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
        throw new Error("Erreur lors du chargement des réservations");

      const data = await response.json();

      if (Array.isArray(data)) {
        setReservations(data);
        setTotalPages(1);
      } else {
        setReservations(data.content || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error: any) {
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
      setSuccessMessage("Réservation supprimée avec succès");
      setShowSuccessModal(true);

      if (selectedAgence?.agency_id) {
        fetchReservations(selectedAgence.agency_id);
      }
    } catch (error: any) {
      setErrorMessage("Erreur lors de la suppression de la réservation");
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
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRevenue = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
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
          title="Réservations"
          userData={userData}
          onMenuClick={() => setShowMobileMenu(true)}
          userType="agency"
        />

        <main className="dashboard-content">
          {isLoadingAgences && agences.length === 0 && (
            <div className="loading-state">
              <RefreshCw className="spin" />
              <p>Chargement en cours...</p>
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
                  Réessayer
                </button>
              </div>
            </>
          )}

          {!isLoadingAgences && agences.length === 0 && !errorMessage && (
            <>
              <div className="empty-state">
                <Building2 className="empty-icon" />
                <h3 className="empty-title">Aucune agence validée</h3>
                <p className="empty-description">
                  Vous n'avez pas encore d'agence validée
                </p>
                <button
                  onClick={() => router.push("/user/agency/dashboard")}
                  className="btn btn-primary"
                >
                  Retour au dashboard
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
                <h2 className="section-title">Gestion des réservations</h2>
                <p className="section-description">
                  Gérer les différentes réservations de votre agence de voyage
                </p>
              </div>

              {/* Agence Header */}
              <div className="agency-header-card">
                <div className="agency-info">
                  <h2 className="agency-name">
                    Nom de votre agence de voyage : {selectedAgence?.long_name}
                  </h2>
                  <p className="agency-location">
                    Adresse de votre agence de voyage : {selectedAgence?.ville}{" "}
                    - {selectedAgence?.location}
                  </p>
                </div>

                {agences.length > 1 && (
                  <div className="agency-selector">
                    <button
                      onClick={() => setShowAgenceSelector(!showAgenceSelector)}
                      className="btn btn-secondary"
                    >
                      Changer
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
                  title="Actualiser"
                >
                  <RefreshCw />
                </button>
              </div>

              {/* Stats Card */}
              <div className="summary-card">
                <div className="summary-item">
                  <div>
                    <div className="summary-value">{stats.total}</div>
                    <div className="summary-label">Total</div>
                  </div>
                </div>

                <div className="summary-item">
                  <div>
                    <div className="summary-value">{stats.reserved}</div>
                    <div className="summary-label">En attente</div>
                  </div>
                </div>

                <div className="summary-item">
                  <div>
                    <div className="summary-value">{stats.confirmed}</div>
                    <div className="summary-label">Confirmées</div>
                  </div>
                </div>

                <div className="summary-item">
                  <div>
                    <div className="summary-value">
                      {formatRevenue(stats.totalRevenue)}
                    </div>
                    <div className="summary-label">Revenus</div>
                  </div>
                </div>
              </div>

              {/* Loading */}
              {isLoading && (
                <div className="loading-state">
                  <RefreshCw className="spin" />
                  <p>Chargement des réservations...</p>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !errorMessage && reservations.length === 0 && (
                <div className="empty-state">
                  <FileText className="empty-icon" />
                  <h3 className="empty-title">Aucune réservation</h3>
                  <p className="empty-description">
                    Il n'y a pas encore de réservations pour cette agence
                  </p>
                </div>
              )}

              {/* Reservations List */}
              {!isLoading && !errorMessage && reservations.length > 0 && (
                <>
                  <div className="section-header">
                    <h2 className="section-title">Toutes les réservations</h2>
                    <p className="section-description">
                      Cliquez sur une réservation pour voir les détails
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
                              Réservation
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
                              title="Supprimer"
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
                                Réservé le{" "}
                                {formatDate(data.reservation.dateReservation)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="voyage-result-footer">
                          <div className="voyage-result-price">
                            <span className="voyage-result-price-label">
                              Montant
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
                        Page {currentPage + 1} / {totalPages}
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
              <h2 className="payment-modal-title">Détails de la réservation</h2>
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
                  Informations de la réservation
                </h3>
                <div className="payment-summary-item">
                  <span className="payment-summary-label">ID Réservation</span>
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
                    Date de réservation
                  </span>
                  <span className="payment-summary-value">
                    {formatDate(
                      selectedReservation.reservation.dateReservation,
                    )}
                  </span>
                </div>
                <div className="payment-summary-item">
                  <span className="payment-summary-label">Statut</span>
                  <span
                    className={`status-badge ${getStatusBadgeClass(selectedReservation.reservation.statutReservation)}`}
                  >
                    {selectedReservation.reservation.statutReservation}
                  </span>
                </div>
                <div className="payment-summary-item">
                  <span className="payment-summary-label">
                    Nombre de passagers
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
                  Informations du voyage
                </h3>
                <div className="payment-summary-item">
                  <span className="payment-summary-label">Trajet</span>
                  <span className="payment-summary-value">
                    {selectedReservation.voyage.lieuDepart} vers{" "}
                    {selectedReservation.voyage.lieuArrive}
                  </span>
                </div>
                <div className="payment-summary-item">
                  <span className="payment-summary-label">Itinéraire</span>
                  <span className="payment-summary-value">
                    {selectedReservation.voyage.pointDeDepart} vers{" "}
                    {selectedReservation.voyage.pointArrivee}
                  </span>
                </div>
                <div className="payment-summary-item">
                  <span className="payment-summary-label">Date de départ</span>
                  <span className="payment-summary-value">
                    {formatDate(selectedReservation.voyage.dateDepartPrev)}
                  </span>
                </div>
                {selectedReservation.voyage.titre && (
                  <div className="payment-summary-item">
                    <span className="payment-summary-label">
                      Titre du voyage
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
                  Informations de paiement
                </h3>
                <div className="payment-summary-item">
                  <span className="payment-summary-label">Prix total</span>
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
                  <span className="payment-summary-label">Montant payé</span>
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
                    Statut du paiement
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
                      Code de transaction
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
                <h3 className="payment-summary-title">Client</h3>
                <div className="payment-summary-item">
                  <span className="payment-summary-label">ID Utilisateur</span>
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
        title="Supprimer la réservation"
        message="Êtes-vous sûr de vouloir supprimer cette réservation ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        isLoading={isDeleting}
      />

      {/* Success Modal */}
      <SuccessModal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Succès"
        message={successMessage}
        buttonText="OK"
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
