"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  Bus,
  Calendar,
  Users,
  Settings,
  MapPin,
  Clock,
  Trash2,
  Plus,
  RefreshCw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Building2,
  X,
} from "lucide-react";
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
import Sidebar from "@/app/components/Sidebar";
import MobileSidebar from "@/app/components/Mobilesidebar";
import Header from "@/app/components/Header";
import SuccessModal from "@/app/components/SuccessModal";
import ErrorModal from "@/app/components/ErrorModal";
import ConfirmModal from "@/app/components/ConfirmModal";

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
  statusVoyage: string;
}

interface VoyageStatistics {
  titre: string;
  voyage_id: string;
  lieu_depart: string;
  lieu_arrive: string;
  point_depart: string;
  point_arrivee: string;
  date_depart_prev: string;
  statut_voyage: string;
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
  first_name: string;
  last_name: string;
  email: string;
  userId: string;
}

export default function AgencyTravelsPage() {
  const router = useRouter();

  const [voyages, setVoyages] = useState<Voyage[]>([]);
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

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVoyageToDelete, setSelectedVoyageToDelete] = useState<
    string | null
  >(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedVoyageStats, setSelectedVoyageStats] =
    useState<VoyageStatistics | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const VOYAGES_PER_PAGE = 6;
  const PIE_COLORS = ["#10B981", "#F59E0B", "#EF4444", "#6366F1", "#8B5CF6"];

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
      fetchVoyages(selectedAgence.agency_id);
    }
  }, [selectedAgence?.agency_id, currentPage]);

  const fetchAgences = async () => {
    setIsLoadingAgences(true);
    try {
      const authToken =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
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
    } finally {
      setIsLoadingAgences(false);
    }
  };

  const fetchVoyages = async (agenceId: string) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const authToken =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
      const response = await fetch(
        `${API_BASE_URL}/voyage/agence/${agenceId}?page=${currentPage}&size=${VOYAGES_PER_PAGE}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      if (!response.ok)
        throw new Error("Erreur lors du chargement des voyages");

      const data = await response.json();
      setVoyages(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (error: any) {
      setErrorMessage("Impossible de charger les voyages");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVoyageStatistics = async (voyageId: string) => {
    setIsLoadingStats(true);
    try {
      const authToken =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
      const response = await fetch(
        `${API_BASE_URL}/statistics/voyage/${voyageId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      if (!response.ok)
        throw new Error("Erreur lors du chargement des statistiques");

      const data = await response.json();
      setSelectedVoyageStats(data);
      setShowStatsModal(true);
    } catch (error: any) {
      setErrorMessage("Impossible de charger les statistiques");
      setShowErrorModal(true);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleDeleteVoyage = async () => {
    if (!selectedVoyageToDelete) return;

    setIsDeleting(true);
    try {
      const authToken =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
      const response = await fetch(
        `${API_BASE_URL}/voyage/${selectedVoyageToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      if (!response.ok) throw new Error("Erreur lors de la suppression");

      setShowDeleteModal(false);
      setSelectedVoyageToDelete(null);
      setShowSuccessModal(true);
      if (selectedAgence?.agency_id) {
        fetchVoyages(selectedAgence.agency_id);
      }
    } catch (error: any) {
      setErrorMessage("Erreur lors de la suppression du voyage");
      setShowErrorModal(true);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectAgence = (agence: AgenceValidee) => {
    setSelectedAgence(agence);
    setShowAgenceSelector(false);
    setCurrentPage(0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
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

  const isVoyageEffectue = (dateDepart: string) => {
    return new Date(dateDepart) < new Date();
  };

  const voyagesEffectues = voyages.filter((v) =>
    isVoyageEffectue(v.dateDepartPrev),
  );
  const voyagesAVenir = voyages.filter(
    (v) => !isVoyageEffectue(v.dateDepartPrev),
  );

  return (
    <div className="dashboard-layout">
      <Sidebar menuItems={MENU_ITEMS} activePath="/user/agency/travels" />
      <MobileSidebar
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        menuItems={MENU_ITEMS}
        activePath="/user/agency/travels"
      />

      <div className="dashboard-main">
        <Header
          title="Voyages"
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
                  onClick={() => window.location.reload()}
                  className="btn btn-primary"
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
                  Vous devez avoir une agence pour créer des voyages
                </p>
              </div>
            </>
          )}

          {!isLoadingAgences && agences.length > 0 && (
            <>
              <div
                className="section-header"
                style={{ marginBottom: "var(--spacing-2xl)" }}
              >
                <h2 className="section-title">Gestion de voyages</h2>
                <p className="section-description">
                  Gérez vos voyages et examinez les statistiques générales des
                  voyages effectués
                </p>
              </div>

              <div className="agency-header-card">
                <div className="agency-info">
                  <h2 className="agency-name">
                    Nom de votre agence de voyage : {selectedAgence?.long_name}
                  </h2>
                  <p className="agency-location">
                    Adresse de votre agence de voyage : {selectedAgence?.ville}{" "}
                    - {selectedAgence?.short_name}
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
                  onClick={() => router.push("/user/agency/travel")}
                  className="btn btn-primary"
                >
                  <Plus />
                  Créer un voyage
                </button>
              </div>

              {isLoading && (
                <div className="loading-state">
                  <RefreshCw className="spin" />
                  <p>Chargement des voyages...</p>
                </div>
              )}

              {!isLoading && !errorMessage && (
                <>
                  {voyagesAVenir.length > 0 && (
                    <div style={{ marginBottom: "var(--spacing-2xl)" }}>
                      <h2
                        className="content-title"
                        style={{ marginBottom: "var(--spacing-lg)" }}
                      >
                        <Clock
                          style={{
                            width: "24px",
                            height: "24px",
                            color: "var(--color-primary)",
                            display: "inline",
                            marginRight: "var(--spacing-xs)",
                          }}
                        />
                        Voyages à venir ({voyagesAVenir.length})
                      </h2>

                      <div className="voyages-grid">
                        {voyagesAVenir.map((voyage) => (
                          <div key={voyage.idVoyage} className="voyage-card">
                            <div className="voyage-content">
                              <div className="voyage-info">
                                <MapPin />
                                <h3>
                                  {voyage.lieuDepart} vers {voyage.lieuArrive}
                                </h3>
                              </div>
                              <div className="voyage-info">
                                <MapPin
                                  style={{ width: "14px", height: "14px" }}
                                />
                                <span
                                  style={{ fontSize: "var(--font-size-sm)" }}
                                >
                                  {voyage.pointDeDepart} vers{" "}
                                  {voyage.pointArrivee}
                                </span>
                              </div>
                              <div className="voyage-info">
                                <Clock />
                                <span>{formatDate(voyage.dateDepartPrev)}</span>
                              </div>
                              <div className="voyage-info">
                                <Users />
                                <span>
                                  {voyage.nbrPlaceReservable} /{" "}
                                  {voyage.nbrPlaceRestante +
                                    voyage.nbrPlaceConfirm}{" "}
                                  places restantes
                                </span>
                              </div>
                              <div
                                className="voyage-price"
                                style={{ fontWeight: "bold" }}
                              >
                                <span>Classe: {voyage.nomClasseVoyage}</span>
                                <span className="price">
                                  {formatRevenue(voyage.prix)}
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedVoyageToDelete(voyage.idVoyage);
                                  setShowDeleteModal(true);
                                }}
                                className="btn btn-secondary"
                                style={{
                                  width: "fit-content",
                                  marginTop: "var(--spacing-sm)",
                                  color: "#dc2626",
                                  display: "flex",
                                  marginLeft: "auto",
                                }}
                              >
                                <Trash2 />
                                Supprimer
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {voyagesEffectues.length > 0 && (
                    <div>
                      <h2
                        className="content-title"
                        style={{ marginBottom: "var(--spacing-lg)" }}
                      >
                        <CheckCircle
                          style={{
                            width: "24px",
                            height: "24px",
                            color: "var(--color-success)",
                            display: "inline",
                            marginRight: "var(--spacing-xs)",
                          }}
                        />
                        Voyages effectués ({voyagesEffectues.length})
                      </h2>

                      <div className="voyages-grid">
                        {voyagesEffectues.map((voyage) => (
                          <div key={voyage.idVoyage} className="voyage-card">
                            <div className="voyage-content">
                              <div className="voyage-info">
                                <MapPin />
                                <h3>
                                  {voyage.lieuDepart} vers {voyage.lieuArrive}
                                </h3>
                              </div>
                              <div className="voyage-info">
                                <MapPin
                                  style={{ width: "14px", height: "14px" }}
                                />
                                <span
                                  style={{ fontSize: "var(--font-size-sm)" }}
                                >
                                  {voyage.pointDeDepart} vers{" "}
                                  {voyage.pointArrivee}
                                </span>
                              </div>
                              <div className="voyage-info">
                                <Clock />
                                <span>{formatDate(voyage.dateDepartPrev)}</span>
                              </div>
                              <div className="voyage-info">
                                <Users />
                                <span>{voyage.nbrPlaceConfirm} passagers</span>
                              </div>
                              <div
                                className="voyage-price"
                                style={{ fontWeight: "bold" }}
                              >
                                <span>Classe: {voyage.nomClasseVoyage}</span>
                                <span className="price">
                                  {formatRevenue(voyage.prix)}
                                </span>
                              </div>
                              <button
                                onClick={() =>
                                  fetchVoyageStatistics(voyage.idVoyage)
                                }
                                disabled={isLoadingStats}
                                className="btn btn-primary"
                                style={{
                                  width: "fit-content",
                                  marginTop: "var(--spacing-sm)",
                                  justifyContent: "center",
                                  display: "flex",
                                  marginLeft: "auto",
                                }}
                              >
                                Voir les stats
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {voyages.length === 0 && (
                    <div className="empty-state">
                      <Bus className="empty-icon" />
                      <h3 className="empty-title">Aucun voyage</h3>
                      <p className="empty-description">
                        Créez votre premier voyage pour commencer
                      </p>
                      <button
                        onClick={() => router.push("/user/agency/travel")}
                        className="btn btn-primary"
                      >
                        Créer un voyage
                      </button>
                    </div>
                  )}

                  {totalPages > 1 && (
                    <div
                      className="widget-pagination"
                      style={{
                        marginTop: "var(--spacing-2xl)",
                        justifyContent: "center",
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

      {/* Stats Modal */}
      {showStatsModal && selectedVoyageStats && (
        <div className="modal-overlay">
          <div className="stats-modal-content">
            <div className="stats-modal-header">
              <div>
                <h2 className="stats-modal-title">Statistiques du voyage</h2>
                <p className="stats-modal-subtitle">
                  {selectedVoyageStats.lieu_depart} vers{" "}
                  {selectedVoyageStats.lieu_arrive}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowStatsModal(false);
                  setSelectedVoyageStats(null);
                }}
                className="payment-modal-close"
              >
                <X />
              </button>
            </div>

            <div className="stats-modal-body">
              {/* Info principale */}
              <div className="stats-info-card">
                <h3 className="stats-info-title">
                  {selectedVoyageStats.titre}
                </h3>
                <div className="stats-info-grid">
                  <div className="stats-info-item">
                    <span className="stats-info-label">Chauffeur</span>
                    <span className="stats-info-value">
                      {selectedVoyageStats.nom_chauffeur}
                    </span>
                  </div>
                  <div className="stats-info-item">
                    <span className="stats-info-label">Véhicule</span>
                    <span className="stats-info-value">
                      {selectedVoyageStats.vehicule_nom}
                    </span>
                  </div>
                  <div className="stats-info-item">
                    <span className="stats-info-label">Plaque</span>
                    <span className="stats-info-value">
                      {selectedVoyageStats.vehicule_plaque}
                    </span>
                  </div>
                  <div className="stats-info-item">
                    <span className="stats-info-label">Statut</span>
                    <span className="stats-info-value">
                      {selectedVoyageStats.statut_voyage}
                    </span>
                  </div>
                </div>
              </div>

              {/* Statistiques principales */}
              <div className="stats-grid">
                <div className="stat-card">
                  <Users className="stat-card-icon" />
                  <div className="stat-card-value">
                    {selectedVoyageStats.total_passagers}
                  </div>
                  <div className="stat-card-label">Passagers</div>
                </div>
                <div className="stat-card">
                  <Calendar className="stat-card-icon" />
                  <div className="stat-card-value">
                    {selectedVoyageStats.total_reservations}
                  </div>
                  <div className="stat-card-label">Réservations</div>
                </div>
                <div className="stat-card">
                  <CheckCircle
                    className="stat-card-icon"
                    style={{ color: "var(--color-success)" }}
                  />
                  <div className="stat-card-value">
                    {selectedVoyageStats.places_confirmees}
                  </div>
                  <div className="stat-card-label">Places confirmées</div>
                </div>
                <div className="stat-card">
                  <BarChart3
                    className="stat-card-icon"
                    style={{ color: "var(--color-primary)" }}
                  />
                  <div className="stat-card-value">
                    {selectedVoyageStats.taux_occupation.toFixed(1)}%
                  </div>
                  <div className="stat-card-label">Taux d'occupation</div>
                </div>
                <div className="stat-card">
                  <Calendar className="stat-card-icon" />
                  <div className="stat-card-value">
                    {selectedVoyageStats.places_restantes}
                  </div>
                  <div className="stat-card-label">Places restantes</div>
                </div>
                <div className="stat-card">
                  <Calendar className="stat-card-icon" />
                  <div className="stat-card-value">
                    {selectedVoyageStats.total_places}
                  </div>
                  <div className="stat-card-label">Places totales</div>
                </div>
              </div>

              {/* Revenus */}
              <div className="stats-revenue-grid">
                <div className="stats-revenue-card">
                  <div className="stats-revenue-label">Revenus potentiels</div>
                  <div className="stats-revenue-value">
                    {formatRevenue(selectedVoyageStats.revenus_totaux)}
                  </div>
                </div>
                <div className="stats-revenue-card">
                  <div className="stats-revenue-label">Revenus confirmés</div>
                  <div className="stats-revenue-value">
                    {formatRevenue(selectedVoyageStats.revenus_confirmes)}
                  </div>
                </div>
              </div>

              {/* Graphiques en grille */}
              <div className="charts-row">
                {/* Réservations par statut */}
                {selectedVoyageStats.reservations_by_status &&
                  Object.keys(selectedVoyageStats.reservations_by_status)
                    .length > 0 &&
                  Object.values(
                    selectedVoyageStats.reservations_by_status,
                  ).some((v) => (v as number) > 0) && (
                    <div className="chart-card-small">
                      <div className="chart-header">
                        <h3>Réservations par statut</h3>
                      </div>
                      <div className="chart-container-small">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={Object.entries(
                                selectedVoyageStats.reservations_by_status,
                              )
                                .filter(([_, value]) => (value as number) > 0)
                                .map(([name, value], index) => ({
                                  name,
                                  value,
                                  color: PIE_COLORS[index % PIE_COLORS.length],
                                }))}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {Object.entries(
                                selectedVoyageStats.reservations_by_status,
                              )
                                .filter(([_, value]) => (value as number) > 0)
                                .map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                                  />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                {/* Passagers par genre */}
                {selectedVoyageStats.passengers_by_gender &&
                  Object.keys(selectedVoyageStats.passengers_by_gender).length >
                    0 &&
                  Object.values(selectedVoyageStats.passengers_by_gender).some(
                    (v) => (v as number) > 0,
                  ) && (
                    <div className="chart-card-small">
                      <div className="chart-header">
                        <h3>Passagers par genre</h3>
                      </div>
                      <div className="chart-container-small">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={Object.entries(
                                selectedVoyageStats.passengers_by_gender,
                              )
                                .filter(([_, value]) => (value as number) > 0)
                                .map(([name, value], index) => ({
                                  name,
                                  value,
                                  color: PIE_COLORS[index % PIE_COLORS.length],
                                }))}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {Object.entries(
                                selectedVoyageStats.passengers_by_gender,
                              )
                                .filter(([_, value]) => (value as number) > 0)
                                .map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                                  />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                {/* Passagers par tranche d'âge */}
                {(selectedVoyageStats as any).passengers_by_age_group &&
                  Object.keys(
                    (selectedVoyageStats as any).passengers_by_age_group,
                  ).length > 0 &&
                  Object.values(
                    (selectedVoyageStats as any).passengers_by_age_group,
                  ).some((v) => (v as number) > 0) && (
                    <div className="chart-card-small">
                      <div className="chart-header">
                        <h3>Passagers par tranche d'âge</h3>
                      </div>
                      <div className="chart-container-small">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={Object.entries(
                              (selectedVoyageStats as any)
                                .passengers_by_age_group,
                            )
                              .filter(([_, value]) => (value as number) > 0)
                              .map(([name, value]) => ({
                                name,
                                value,
                              }))}
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
                              fill="#7cab1b"
                              radius={[8, 8, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                {/* Distribution des bagages */}
                {(selectedVoyageStats as any).baggage_distribution &&
                  Object.keys((selectedVoyageStats as any).baggage_distribution)
                    .length > 0 &&
                  Object.values(
                    (selectedVoyageStats as any).baggage_distribution,
                  ).some((v) => (v as number) > 0) && (
                    <div className="chart-card-small">
                      <div className="chart-header">
                        <h3>Distribution des bagages</h3>
                      </div>
                      <div className="chart-container-small">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={Object.entries(
                              (selectedVoyageStats as any).baggage_distribution,
                            )
                              .filter(([_, value]) => (value as number) > 0)
                              .map(([name, value]) => ({
                                name,
                                value,
                              }))}
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
                              fill="#7cab1b"
                              radius={[8, 8, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                {/* Réservations par jour */}
                {(selectedVoyageStats as any).reservations_per_day &&
                  Object.keys((selectedVoyageStats as any).reservations_per_day)
                    .length > 0 && (
                    <div
                      className="chart-card-small"
                      style={{ gridColumn: "1 / -1" }}
                    >
                      <div className="chart-header">
                        <h3>Réservations par jour</h3>
                      </div>
                      <div className="chart-container-small">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={Object.entries(
                              (selectedVoyageStats as any).reservations_per_day,
                            )
                              .sort((a, b) => a[0].localeCompare(b[0]))
                              .map(([date, value]) => ({
                                date: new Date(date).toLocaleDateString(
                                  "fr-FR",
                                  {
                                    day: "numeric",
                                    month: "short",
                                  },
                                ),
                                value,
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
                            <Tooltip />
                            <Bar
                              dataKey="value"
                              fill="#7cab1b"
                              radius={[8, 8, 0, 0]}
                              name="Réservations"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                {/* Revenus par jour */}
                {(selectedVoyageStats as any).revenue_per_day &&
                  Object.keys((selectedVoyageStats as any).revenue_per_day)
                    .length > 0 && (
                    <div
                      className="chart-card-small"
                      style={{ gridColumn: "1 / -1" }}
                    >
                      <div className="chart-header">
                        <h3>Revenus par jour</h3>
                      </div>
                      <div className="chart-container-small">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={Object.entries(
                              (selectedVoyageStats as any).revenue_per_day,
                            )
                              .sort((a, b) => a[0].localeCompare(b[0]))
                              .map(([date, revenue]) => ({
                                date: new Date(date).toLocaleDateString(
                                  "fr-FR",
                                  {
                                    day: "numeric",
                                    month: "short",
                                  },
                                ),
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
                            />
                            <Line
                              type="monotone"
                              dataKey="revenue"
                              stroke="#7cab1b"
                              strokeWidth={2}
                              dot={{ fill: "#7cab1b", r: 4 }}
                              name="Revenu"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        show={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedVoyageToDelete(null);
        }}
        onConfirm={handleDeleteVoyage}
        title="Supprimer le voyage"
        message="Êtes-vous sûr de vouloir supprimer ce voyage ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        isLoading={isDeleting}
      />

      <SuccessModal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Voyage supprimé"
        message="Le voyage a été supprimé avec succès."
        buttonText="OK"
      />

      <ErrorModal
        show={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={errorMessage}
      />
    </div>
  );
}
