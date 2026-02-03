"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  Building2,
  Settings,
  Users,
  Car,
  Bus,
  Calendar,
  RefreshCw,
  TrendingUp,
  BarChart3,
  ChevronDown,
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
import { useLanguage } from "@/app/providers";

interface GeneralStatistics {
  nombreEmployes: number;
  nombreChauffeurs: number;
  nombreVoyages: number;
  voyagesParStatut: Record<string, number>;
  nombreReservations: number;
  reservationsParStatut: Record<string, number>;
  revenus: number;
  nouveauxUtilisateurs: number;
  tauxOccupation: number;
  revenue_by_class: { [key: string]: number };
  top_destinations: { [key: string]: number };
  top_origins: { [key: string]: number };
  reservations_by_day_of_week: { [key: string]: number };
  trips_by_driver: { [key: string]: number };
}

interface EvolutionData {
  date: string;
  valeur: number;
  montant: number;
}

interface EvolutionStatistics {
  evolutionReservations: EvolutionData[];
  evolutionVoyages: EvolutionData[];
  evolutionRevenus: EvolutionData[];
  evolutionUtilisateurs: EvolutionData[];
  evolution_taux_occupation: EvolutionData[];
  evolution_annulations: EvolutionData[];
  revenue_per_month: { [key: string]: number };
  reservations_per_month: { [key: string]: number };
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
  greeting_message: string;
  social_network: string;
  statut_validation: string;
  date_validation: string;
}

interface UserData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  userId: string;
  role: string[];
}

export default function AgenceDashboardPage() {
  const router = useRouter();
  const [generalStats, setGeneralStats] = useState<GeneralStatistics | null>(
    null,
  );
  const [evolutionStats, setEvolutionStats] =
    useState<EvolutionStatistics | null>(null);
  const [agences, setAgences] = useState<AgenceValidee[]>([]);
  const [selectedAgence, setSelectedAgence] = useState<AgenceValidee | null>(
    null,
  );
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingAgences, setIsLoadingAgences] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showAgenceSelector, setShowAgenceSelector] = useState(false);
  const [activeChart, setActiveChart] = useState<
    "reservations" | "voyages" | "revenus" | "utilisateurs"
  >("reservations");
  const { t, language } = useLanguage();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const PIE_COLORS = ["#10B981", "#F59E0B", "#EF4444", "#6366F1", "#8B5CF6"];

  const menuItems = [
    {
      icon: Home,
      label: t("Dashboard", "Dashboard"),
      path: "/user/agency/dashboard",
      active: true,
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
      active: false,
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
      fetchGeneralStatistics(selectedAgence.agency_id);
      fetchEvolutionStatistics(selectedAgence.agency_id);
    }
  }, [selectedAgence?.agency_id]);

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
        setIsLoadingStats(false);
      }
    } catch (error: any) {
      setErrorMessage(
        t("Impossible de charger vos agences", "Unable to load your agencies"),
      );
      setIsLoadingStats(false);
    } finally {
      setIsLoadingAgences(false);
    }
  };

  const fetchGeneralStatistics = async (agenceId: string) => {
    setIsLoadingStats(true);
    setErrorMessage("");

    try {
      const authToken = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/statistics/agence/${agenceId}/general`,
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
            "Erreur lors du chargement des statistiques",
            "Failed to load statistics",
          ),
        );
      const data = await response.json();
      setGeneralStats(data);
    } catch (error: any) {
      setErrorMessage(
        t(
          "Impossible de charger les statistiques générales",
          "Unable to load general statistics",
        ),
      );
    } finally {
      setIsLoadingStats(false);
    }
  };

  const fetchEvolutionStatistics = async (agenceId: string) => {
    try {
      const authToken = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/statistics/agence/${agenceId}/evolution`,
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
            "Erreur lors du chargement des évolutions",
            "Failed to load trends",
          ),
        );
      const data = await response.json();
      setEvolutionStats(data);
    } catch (error: any) {
      console.error("Fetch Evolution Stats Error:", error);
    }
  };

  const handleSelectAgence = (agence: AgenceValidee) => {
    setSelectedAgence(agence);
    setShowAgenceSelector(false);
  };

  const handleRefresh = () => {
    if (selectedAgence?.agency_id) {
      fetchGeneralStatistics(selectedAgence.agency_id);
      fetchEvolutionStatistics(selectedAgence.agency_id);
    }
    fetchAgences();
  };

  const formatRevenue = (amount: number) => {
    const locale = language === "fr" ? "fr-FR" : "en-US";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const locale = language === "fr" ? "fr-FR" : "en-US";
    return new Date(dateString).toLocaleDateString(locale, {
      month: "numeric",
      year: "numeric",
    });
  };

  const formatDateFull = (dateString: string) => {
    const locale = language === "fr" ? "fr-FR" : "en-US";
    return new Date(dateString).toLocaleDateString(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getChartData = () => {
    if (!evolutionStats) return [];

    switch (activeChart) {
      case "reservations":
        return (
          evolutionStats.evolutionReservations?.map((item) => ({
            date: formatDate(item.date),
            valeur: item.valeur,
          })) || []
        );
      case "voyages":
        return (
          evolutionStats.evolutionVoyages?.map((item) => ({
            date: formatDate(item.date),
            valeur: item.valeur,
          })) || []
        );
      case "revenus":
        return (
          evolutionStats.evolutionRevenus?.map((item) => ({
            date: formatDate(item.date),
            valeur: item.montant,
          })) || []
        );
      case "utilisateurs":
        return (
          evolutionStats.evolutionUtilisateurs?.map((item) => ({
            date: formatDate(item.date),
            valeur: item.valeur,
          })) || []
        );
      default:
        return [];
    }
  };

  const getChartTitle = () => {
    switch (activeChart) {
      case "reservations":
        return t("Évolution des réservations", "Reservation trends");
      case "voyages":
        return t("Évolution des voyages", "Trip trends");
      case "revenus":
        return t("Évolution des revenus", "Revenue trends");
      case "utilisateurs":
        return t("Évolution des utilisateurs", "User trends");
      default:
        return "";
    }
  };

  const getVoyagesStatusData = () => {
    if (!generalStats?.voyagesParStatut) return [];
    return Object.entries(generalStats.voyagesParStatut).map(
      ([name, value], index) => ({
        name: name,
        value: value,
        color: PIE_COLORS[index % PIE_COLORS.length],
      }),
    );
  };

  const getReservationsStatusData = () => {
    if (!generalStats?.reservationsParStatut) return [];
    return Object.entries(generalStats.reservationsParStatut).map(
      ([name, value], index) => ({
        name: name,
        value: value,
        color: PIE_COLORS[index % PIE_COLORS.length],
      }),
    );
  };

  const prepareBarChartData = (data: { [key: string]: number }) => {
    return Object.entries(data)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({
        name: name.length > 15 ? name.substring(0, 15) + "..." : name,
        value,
      }));
  };

  const prepareDayOfWeekData = (data: { [key: string]: number }) => {
    const dayMapping: { [key: string]: string } = {
      MONDAY: t("Lundi", "Monday"),
      TUESDAY: t("Mardi", "Tuesday"),
      WEDNESDAY: t("Mercredi", "Wednesday"),
      THURSDAY: t("Jeudi", "Thursday"),
      FRIDAY: t("Vendredi", "Friday"),
      SATURDAY: t("Samedi", "Saturday"),
      SUNDAY: t("Dimanche", "Sunday"),
    };

    const daysOrder = [
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
      "SUNDAY",
    ];

    return daysOrder
      .map((dayKey) => ({
        day: dayMapping[dayKey],
        value: data[dayKey] || 0,
      }))
      .filter((item) => item.value > 0);
  };

  const prepareMonthlyData = (data: { [key: string]: number }) => {
    return Object.entries(data)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, value]) => ({
        month,
        value,
      }));
  };

  return (
    <div className="dashboard-layout">
      <Sidebar menuItems={menuItems} activePath="/user/agency/dashboard" />
      <MobileSidebar
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        menuItems={menuItems}
        activePath="/user/agency/dashboard"
      />

      <div className="dashboard-main">
        <Header
          title={t("Dashboard", "Dashboard")}
          userData={userData}
          onMenuClick={() => setShowMobileMenu(true)}
          showSettingsButton={true}
          userType="agency"
        />

        <main className="dashboard-content">
          {(isLoadingAgences || isLoadingStats) && agences.length === 0 && (
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
                  onClick={() => router.push("/user/agency/create")}
                  className="btn btn-primary"
                >
                  {t("Créer une agence", "Create an agency")}
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
                  {t("Votre tableau de bord", "Your dashboard")}
                </h2>
                <p className="section-description">
                  {t(
                    "Examinez les statistiques générales de votre agence et gérez votre agence en quelques clics",
                    "Review your agency’s general statistics and manage everything in a few clicks",
                  )}
                </p>
              </div>

              <div className="agency-header-card">
                <div className="agency-info">
                  <h2 className="agency-name">
                    {t("Nom de votre agence de voyage :", "Agency name:")}{" "}
                    {selectedAgence?.long_name}
                  </h2>
                  <p className="agency-location">
                    {t(
                      "Abréviation du nom de votre agence de voyage :",
                      "Agency short name:",
                    )}{" "}
                    {selectedAgence?.short_name}
                  </p>
                  <p className="agency-location">
                    {t(
                      "Addresse de votre agence de voyage :",
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
                  onClick={handleRefresh}
                  className="btn-icon"
                  title={t("Actualiser", "Refresh")}
                >
                  <RefreshCw />
                </button>
              </div>

              {isLoadingStats && (
                <div className="loading-state">
                  <RefreshCw className="spin" />
                  <p>{t("Chargement des statistiques...", "Loading statistics...")}</p>
                </div>
              )}

              {!isLoadingStats && !errorMessage && generalStats && (
                <>
                  <div className="stats-card">
                    <div className="stats-header">
                      <h3>{t("Statistiques principales", "Key statistics")}</h3>
                    </div>
                    <div className="stats-grid-main">
                      <div className="stat-item">
                        <div className="stat-content">
                          <p className="stat-label">{t("Employés", "Employees")}</p>
                          <p className="stat-value">
                            {generalStats.nombreEmployes}
                          </p>
                        </div>
                      </div>

                      <div className="stat-item">
                        <div className="stat-content">
                          <p className="stat-label">{t("Chauffeurs", "Drivers")}</p>
                          <p className="stat-value">
                            {generalStats.nombreChauffeurs}
                          </p>
                        </div>
                      </div>

                      <div className="stat-item">
                        <div className="stat-content">
                          <p className="stat-label">{t("Voyages", "Trips")}</p>
                          <p className="stat-value">
                            {generalStats.nombreVoyages}
                          </p>
                        </div>
                      </div>

                      <div className="stat-item">
                        <div className="stat-content">
                          <p className="stat-label">
                            {t("Réservations", "Reservations")}
                          </p>
                          <p className="stat-value">
                            {generalStats.nombreReservations}
                          </p>
                        </div>
                      </div>

                      <div className="stat-item">
                        <div className="stat-content">
                          <p className="stat-label">
                            {t("Revenus totaux", "Total revenue")}
                          </p>
                          <p className="stat-value revenue">
                            {formatRevenue(generalStats.revenus)}
                          </p>
                        </div>
                      </div>

                      <div className="stat-item">
                        <div className="stat-content">
                          <p className="stat-label">
                            {t("Nouveaux utilisateurs", "New users")}
                          </p>
                          <p className="stat-value">
                            {generalStats.nouveauxUtilisateurs}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="occupation-rate">
                      <p className="occupation-label">
                        {t("Taux d'occupation", "Occupancy rate")}
                      </p>
                      <div className="occupation-bar-wrapper">
                        <div className="occupation-bar">
                          <div
                            className="occupation-fill"
                            style={{ width: `${generalStats.tauxOccupation}%` }}
                          ></div>
                        </div>
                        <span className="occupation-value">
                          {generalStats.tauxOccupation.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {evolutionStats && (
                    <div className="chart-card">
                      <div className="chart-header">
                        <h3>{getChartTitle()}</h3>
                      </div>
                      <div className="chart-tabs">
                        <button
                          onClick={() => setActiveChart("reservations")}
                          className={`chart-tab ${activeChart === "reservations" ? "active" : ""}`}
                        >
                          {t("Réservations", "Reservations")}
                        </button>
                        <button
                          onClick={() => setActiveChart("voyages")}
                          className={`chart-tab ${activeChart === "voyages" ? "active" : ""}`}
                        >
                          {t("Voyages", "Trips")}
                        </button>
                        <button
                          onClick={() => setActiveChart("revenus")}
                          className={`chart-tab ${activeChart === "revenus" ? "active" : ""}`}
                        >
                          {t("Revenus", "Revenue")}
                        </button>
                        <button
                          onClick={() => setActiveChart("utilisateurs")}
                          className={`chart-tab ${activeChart === "utilisateurs" ? "active" : ""}`}
                        >
                          {t("Utilisateurs", "Users")}
                        </button>
                      </div>

                      <div className="chart-container">
                        {getChartData().length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={getChartData()}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#525252"
                              />
                              <XAxis
                                dataKey="date"
                                stroke="#6B7280"
                                fontSize={12}
                              />
                              <YAxis stroke="#6B7280" fontSize={12} />
                              <Tooltip />
                              <Line
                                type="monotone"
                                dataKey="valeur"
                                stroke="#7cab1b"
                                strokeWidth={2}
                                dot={{ fill: "#7cab1b", r: 4 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="chart-empty">
                            <p>{t("Aucune donnée disponible", "No data available")}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="charts-row">
                    {getVoyagesStatusData().length > 0 && (
                      <div className="chart-card-small">
                        <div className="chart-header">
                          <h3>{t("Voyages par statut", "Trips by status")}</h3>
                        </div>
                        <div className="chart-container-small">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={getVoyagesStatusData()}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {getVoyagesStatusData().map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
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

                    {getReservationsStatusData().length > 0 && (
                      <div className="chart-card-small">
                        <div className="chart-header">
                          <h3>
                            {t("Réservations par statut", "Reservations by status")}
                          </h3>
                        </div>
                        <div className="chart-container-small">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={getReservationsStatusData()}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {getReservationsStatusData().map(
                                  (entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={entry.color}
                                    />
                                  ),
                                )}
                              </Pie>
                              <Tooltip />
                              <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="charts-row">
                    {/* Revenus par classe */}
                    {generalStats.revenue_by_class &&
                      Object.keys(generalStats.revenue_by_class).length > 0 && (
                        <div className="chart-card-small">
                          <div className="chart-header">
                            <h3>{t("Revenus par classe", "Revenue by class")}</h3>
                          </div>
                          <div className="chart-container-small">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={prepareBarChartData(
                                  generalStats.revenue_by_class,
                                )}
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke="#525252"
                                />
                                <XAxis
                                  dataKey="name"
                                  stroke="#6B7280"
                                  fontSize={12}
                                />
                                <YAxis stroke="#6B7280" fontSize={12} />
                                <Tooltip
                                  formatter={(value) =>
                                    formatRevenue(value as number)
                                  }
                                />
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

                    {/* Top 10 destinations */}
                    {generalStats.top_destinations &&
                      Object.keys(generalStats.top_destinations).length > 0 && (
                        <div className="chart-card-small">
                          <div className="chart-header">
                            <h3>{t("Top 10 destinations", "Top 10 destinations")}</h3>
                          </div>
                          <div className="chart-container-small">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={prepareBarChartData(
                                  generalStats.top_destinations,
                                )}
                                layout="vertical"
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke="#525252"
                                />
                                <XAxis
                                  type="number"
                                  stroke="#6B7280"
                                  fontSize={12}
                                />
                                <YAxis
                                  dataKey="name"
                                  type="category"
                                  width={100}
                                  stroke="#6B7280"
                                  fontSize={12}
                                />
                                <Tooltip />
                                <Bar
                                  dataKey="value"
                                  fill="#7cab1b"
                                  radius={[0, 8, 8, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Réservations par jour de la semaine et Voyages par chauffeur */}
                  {(generalStats?.reservations_by_day_of_week ||
                    generalStats?.trips_by_driver) && (
                    <div className="charts-row">
                      {/* Réservations par jour de la semaine */}
                      {generalStats?.reservations_by_day_of_week &&
                        Object.keys(generalStats.reservations_by_day_of_week)
                          .length > 0 && (
                          <div className="chart-card-small">
                            <div className="chart-header">
                              <h3>{t("Réservations par jour", "Reservations by day")}</h3>
                            </div>
                            <div className="chart-container-small">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={prepareDayOfWeekData(
                                    generalStats.reservations_by_day_of_week,
                                  )}
                                >
                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#525252"
                                  />
                                  <XAxis
                                    dataKey="day"
                                    stroke="#6B7280"
                                    fontSize={12}
                                  />
                                  <YAxis stroke="#6B7280" fontSize={12} />
                                  <Tooltip />
                                  <Bar
                                    dataKey="value"
                                    fill="#7cab1b"
                                    name={t("Réservations", "Reservations")}
                                    radius={[8, 8, 0, 0]}
                                  />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}

                      {/* Voyages par chauffeur */}
                      {generalStats?.trips_by_driver &&
                        Object.keys(generalStats.trips_by_driver).length >
                          0 && (
                          <div className="chart-card-small">
                            <div className="chart-header">
                              <h3>{t("Top 10 chauffeurs", "Top 10 drivers")}</h3>
                            </div>
                            <div className="chart-container-small">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={prepareBarChartData(
                                    generalStats.trips_by_driver,
                                  )}
                                  layout="vertical"
                                >
                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#525252"
                                  />
                                  <XAxis
                                    type="number"
                                    stroke="#6B7280"
                                    fontSize={12}
                                  />
                                  <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={120}
                                    stroke="#6B7280"
                                    fontSize={12}
                                  />
                                  <Tooltip />
                                  <Bar
                                    dataKey="value"
                                    fill="#7cab1b"
                                    name={t("Voyages", "Trips")}
                                    radius={[0, 8, 8, 0]}
                                  />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                  {/* Evolution Charts - Première paire */}
                  {evolutionStats && (
                    <div className="charts-row">
                      {/* Evolution taux d'occupation */}
                      {evolutionStats.evolution_taux_occupation &&
                        evolutionStats.evolution_taux_occupation.length > 0 && (
                          <div className="chart-card-small">
                            <div className="chart-header">
                              <h3>
                                {t("Évolution taux d'occupation", "Occupancy trend")}
                              </h3>
                            </div>
                            <div className="chart-container-small">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                  data={evolutionStats.evolution_taux_occupation.map(
                                    (item) => ({
                                      date: formatDate(item.date),
                                      valeur: item.valeur,
                                    }),
                                  )}
                                >
                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#525252"
                                  />
                                  <XAxis
                                    dataKey="date"
                                    stroke="#6B7280"
                                    fontSize={12}
                                  />
                                  <YAxis stroke="#6B7280" fontSize={12} />
                                  <Tooltip />
                                  <Line
                                    type="monotone"
                                    dataKey="valeur"
                                    stroke="#7cab1b"
                                    strokeWidth={2}
                                    dot={{ fill: "#7cab1b", r: 3 }}
                                    name={t("Taux (%)", "Rate (%)")}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}

                      {/* Evolution annulations */}
                      {evolutionStats.evolution_annulations &&
                        evolutionStats.evolution_annulations.length > 0 && (
                          <div className="chart-card-small">
                            <div className="chart-header">
                              <h3>
                                {t("Évolution des annulations", "Cancellation trend")}
                              </h3>
                            </div>
                            <div className="chart-container-small">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                  data={evolutionStats.evolution_annulations.map(
                                    (item) => ({
                                      date: formatDate(item.date),
                                      valeur: item.valeur,
                                    }),
                                  )}
                                >
                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#525252"
                                  />
                                  <XAxis
                                    dataKey="date"
                                    stroke="#6B7280"
                                    fontSize={12}
                                  />
                                  <YAxis stroke="#6B7280" fontSize={12} />
                                  <Tooltip />
                                  <Line
                                    type="monotone"
                                    dataKey="valeur"
                                    stroke="#7cab1b"
                                    strokeWidth={2}
                                    dot={{ fill: "#7cab1b", r: 3 }}
                                    name={t("Annulations", "Cancellations")}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                  {/* Evolution Charts - Deuxième paire */}
                  {evolutionStats && (
                    <div className="charts-row">
                      {/* Revenus par mois */}
                      {evolutionStats.revenue_per_month &&
                        Object.keys(evolutionStats.revenue_per_month).length >
                          0 && (
                          <div className="chart-card-small">
                            <div className="chart-header">
                              <h3>{t("Revenus par mois", "Revenue by month")}</h3>
                            </div>
                            <div className="chart-container-small">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={prepareMonthlyData(
                                    evolutionStats.revenue_per_month,
                                  )}
                                >
                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#525252"
                                  />
                                  <XAxis
                                    dataKey="month"
                                    stroke="#6B7280"
                                    fontSize={12}
                                  />
                                  <YAxis stroke="#6B7280" fontSize={12} />
                                  <Tooltip
                                    formatter={(value) =>
                                      formatRevenue(value as number)
                                    }
                                  />
                                  <Bar
                                    dataKey="value"
                                    fill="#7cab1b"
                                    name={t("Revenu", "Revenue")}
                                    radius={[8, 8, 0, 0]}
                                  />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}

                      {/* Réservations par mois */}
                      {evolutionStats.reservations_per_month &&
                        Object.keys(evolutionStats.reservations_per_month)
                          .length > 0 && (
                          <div className="chart-card-small">
                            <div className="chart-header">
                              <h3>{t("Réservations par mois", "Reservations by month")}</h3>
                            </div>
                            <div className="chart-container-small">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={prepareMonthlyData(
                                    evolutionStats.reservations_per_month,
                                  )}
                                >
                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#525252"
                                  />
                                  <XAxis
                                    dataKey="month"
                                    stroke="#6B7280"
                                    fontSize={12}
                                  />
                                  <YAxis stroke="#6B7280" fontSize={12} />
                                  <Tooltip />
                                  <Bar
                                    dataKey="value"
                                    fill="#7cab1b"
                                    name={t("Réservations", "Reservations")}
                                    radius={[8, 8, 0, 0]}
                                  />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                  {selectedAgence && (
                    <div className="agency-details-card">
                      <div className="agency-details-header">
                        <h3>{t("Informations de l'agence", "Agency details")}</h3>
                      </div>
                      <div className="agency-details-grid">
                        <div className="detail-field">
                          <p className="detail-label">{t("Nom complet", "Full name")}</p>
                          <p className="detail-value">
                            {selectedAgence.long_name}
                          </p>
                        </div>
                        <div className="detail-field">
                          <p className="detail-label">{t("Abréviation", "Abbreviation")}</p>
                          <p className="detail-value">
                            {selectedAgence.short_name}
                          </p>
                        </div>
                        <div className="detail-field">
                          <p className="detail-label">{t("Ville", "City")}</p>
                          <p className="detail-value">{selectedAgence.ville}</p>
                        </div>
                        <div className="detail-field">
                          <p className="detail-label">{t("Localisation", "Location")}</p>
                          <p className="detail-value">
                            {selectedAgence.location}
                          </p>
                        </div>
                        <div className="detail-field">
                          <p className="detail-label">{t("Statut", "Status")}</p>
                          <span className="status-badge">
                            {selectedAgence.statut_validation}
                          </span>
                        </div>
                        <div className="detail-field">
                          <p className="detail-label">
                            {t("Date de validation", "Validation date")}
                          </p>
                          <p className="detail-value">
                            {formatDateFull(selectedAgence.date_validation)}
                          </p>
                        </div>
                      </div>
                      {selectedAgence.description && (
                        <div className="detail-field-full">
                          <p className="detail-label">{t("Description", "Description")}</p>
                          <p className="detail-value">
                            {selectedAgence.description}
                          </p>
                        </div>
                      )}
                      {selectedAgence.social_network && (
                        <div className="detail-field-full">
                          <p className="detail-label">
                            {t("Réseau social", "Social network")}
                          </p>
                          <a
                            href={"https://" + selectedAgence.social_network}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="detail-link"
                          >
                            {selectedAgence.social_network}
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="quick-actions">
                    <button
                      onClick={() => router.push("/user/agency/travels")}
                      className="btn btn-secondary"
                    >
                      <Bus />
                      {t("Gérer les voyages", "Manage trips")}
                    </button>
                    <button
                      onClick={() => router.push("/user/agency/reservations")}
                      className="btn btn-secondary"
                    >
                      <Calendar />
                      {t("Réservations", "Reservations")}
                    </button>
                    <button
                      onClick={() => router.push("/user/agency/drivers")}
                      className="btn btn-secondary"
                    >
                      <Users />
                      {t("Chauffeurs", "Drivers")}
                    </button>
                    <button
                      onClick={() => router.push("/user/agency/settings")}
                      className="btn btn-secondary"
                    >
                      <Settings />
                      {t("Paramètres", "Settings")}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
