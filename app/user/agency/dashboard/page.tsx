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

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const PIE_COLORS = ["#10B981", "#F59E0B", "#EF4444", "#6366F1", "#8B5CF6"];

  const menuItems = [
    {
      icon: Home,
      label: "Dashboard",
      path: "/user/agency/dashboard",
      active: true,
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
        setIsLoadingStats(false);
      }
    } catch (error: any) {
      setErrorMessage("Impossible de charger vos agences");
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
        throw new Error("Erreur lors du chargement des statistiques");
      const data = await response.json();
      setGeneralStats(data);
    } catch (error: any) {
      setErrorMessage("Impossible de charger les statistiques générales");
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
        throw new Error("Erreur lors du chargement des évolutions");
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
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      month: "numeric",
      year: "numeric",
    });
  };

  const formatDateFull = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
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
        return "Évolution des réservations";
      case "voyages":
        return "Évolution des voyages";
      case "revenus":
        return "Évolution des revenus";
      case "utilisateurs":
        return "Évolution des utilisateurs";
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
      MONDAY: "Lundi",
      TUESDAY: "Mardi",
      WEDNESDAY: "Mercredi",
      THURSDAY: "Jeudi",
      FRIDAY: "Vendredi",
      SATURDAY: "Samedi",
      SUNDAY: "Dimanche",
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
          title="Dashboard"
          userData={userData}
          onMenuClick={() => setShowMobileMenu(true)}
          showSettingsButton={true}
          userType="agency"
        />

        <main className="dashboard-content">
          {(isLoadingAgences || isLoadingStats) && agences.length === 0 && (
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
                  onClick={() => router.push("/user/agency/create")}
                  className="btn btn-primary"
                >
                  Créer une agence
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
                <h2 className="section-title">Votre tableau de bord</h2>
                <p className="section-description">
                  Examinez les statistiques générales de votre agence et gérez
                  votre agence en quelques clics
                </p>
              </div>

              <div className="agency-header-card">
                <div className="agency-info">
                  <h2 className="agency-name">
                    Nom de votre agence de voyage : {selectedAgence?.long_name}
                  </h2>
                  <p className="agency-location">
                    Abréviation du nom de votre agence de voyage :{" "}
                    {selectedAgence?.short_name}
                  </p>
                  <p className="agency-location">
                    Addresse de votre agence de voyage : {selectedAgence?.ville}{" "}
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
                  onClick={handleRefresh}
                  className="btn-icon"
                  title="Actualiser"
                >
                  <RefreshCw />
                </button>
              </div>

              {isLoadingStats && (
                <div className="loading-state">
                  <RefreshCw className="spin" />
                  <p>Chargement des statistiques...</p>
                </div>
              )}

              {!isLoadingStats && !errorMessage && generalStats && (
                <>
                  <div className="stats-card">
                    <div className="stats-header">
                      <h3>Statistiques principales</h3>
                    </div>
                    <div className="stats-grid-main">
                      <div className="stat-item">
                        <div className="stat-content">
                          <p className="stat-label">Employés</p>
                          <p className="stat-value">
                            {generalStats.nombreEmployes}
                          </p>
                        </div>
                      </div>

                      <div className="stat-item">
                        <div className="stat-content">
                          <p className="stat-label">Chauffeurs</p>
                          <p className="stat-value">
                            {generalStats.nombreChauffeurs}
                          </p>
                        </div>
                      </div>

                      <div className="stat-item">
                        <div className="stat-content">
                          <p className="stat-label">Voyages</p>
                          <p className="stat-value">
                            {generalStats.nombreVoyages}
                          </p>
                        </div>
                      </div>

                      <div className="stat-item">
                        <div className="stat-content">
                          <p className="stat-label">Réservations</p>
                          <p className="stat-value">
                            {generalStats.nombreReservations}
                          </p>
                        </div>
                      </div>

                      <div className="stat-item">
                        <div className="stat-content">
                          <p className="stat-label">Revenus totaux</p>
                          <p className="stat-value revenue">
                            {formatRevenue(generalStats.revenus)}
                          </p>
                        </div>
                      </div>

                      <div className="stat-item">
                        <div className="stat-content">
                          <p className="stat-label">Nouveaux utilisateurs</p>
                          <p className="stat-value">
                            {generalStats.nouveauxUtilisateurs}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="occupation-rate">
                      <p className="occupation-label">Taux d'occupation</p>
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
                          Réservations
                        </button>
                        <button
                          onClick={() => setActiveChart("voyages")}
                          className={`chart-tab ${activeChart === "voyages" ? "active" : ""}`}
                        >
                          Voyages
                        </button>
                        <button
                          onClick={() => setActiveChart("revenus")}
                          className={`chart-tab ${activeChart === "revenus" ? "active" : ""}`}
                        >
                          Revenus
                        </button>
                        <button
                          onClick={() => setActiveChart("utilisateurs")}
                          className={`chart-tab ${activeChart === "utilisateurs" ? "active" : ""}`}
                        >
                          Utilisateurs
                        </button>
                      </div>

                      <div className="chart-container">
                        {getChartData().length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={getChartData()}>
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
                            <p>Aucune donnée disponible</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="charts-row">
                    {getVoyagesStatusData().length > 0 && (
                      <div className="chart-card-small">
                        <div className="chart-header">
                          <h3>Voyages par statut</h3>
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
                          <h3>Réservations par statut</h3>
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
                            <h3>Revenus par classe</h3>
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
                                  stroke="#E5E7EB"
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
                            <h3>Top 10 destinations</h3>
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
                                  stroke="#E5E7EB"
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
                              <h3>Réservations par jour</h3>
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
                                    stroke="#E5E7EB"
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
                                    name="Réservations"
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
                              <h3>Top 10 chauffeurs</h3>
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
                                    stroke="#E5E7EB"
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
                                    name="Voyages"
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
                              <h3>Évolution taux d'occupation</h3>
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
                                    stroke="#E5E7EB"
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
                                    name="Taux (%)"
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
                              <h3>Évolution des annulations</h3>
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
                                    stroke="#E5E7EB"
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
                                    name="Annulations"
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
                              <h3>Revenus par mois</h3>
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
                                    stroke="#E5E7EB"
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
                                    name="Revenu"
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
                              <h3>Réservations par mois</h3>
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
                                    stroke="#E5E7EB"
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
                                    name="Réservations"
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
                        <h3>Informations de l'agence</h3>
                      </div>
                      <div className="agency-details-grid">
                        <div className="detail-field">
                          <p className="detail-label">Nom complet</p>
                          <p className="detail-value">
                            {selectedAgence.long_name}
                          </p>
                        </div>
                        <div className="detail-field">
                          <p className="detail-label">Abréviation</p>
                          <p className="detail-value">
                            {selectedAgence.short_name}
                          </p>
                        </div>
                        <div className="detail-field">
                          <p className="detail-label">Ville</p>
                          <p className="detail-value">{selectedAgence.ville}</p>
                        </div>
                        <div className="detail-field">
                          <p className="detail-label">Localisation</p>
                          <p className="detail-value">
                            {selectedAgence.location}
                          </p>
                        </div>
                        <div className="detail-field">
                          <p className="detail-label">Statut</p>
                          <span className="status-badge">
                            {selectedAgence.statut_validation}
                          </span>
                        </div>
                        <div className="detail-field">
                          <p className="detail-label">Date de validation</p>
                          <p className="detail-value">
                            {formatDateFull(selectedAgence.date_validation)}
                          </p>
                        </div>
                      </div>
                      {selectedAgence.description && (
                        <div className="detail-field-full">
                          <p className="detail-label">Description</p>
                          <p className="detail-value">
                            {selectedAgence.description}
                          </p>
                        </div>
                      )}
                      {selectedAgence.social_network && (
                        <div className="detail-field-full">
                          <p className="detail-label">Réseau social</p>
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
                      Gérer les voyages
                    </button>
                    <button
                      onClick={() => router.push("/user/agency/reservations")}
                      className="btn btn-secondary"
                    >
                      <Calendar />
                      Réservations
                    </button>
                    <button
                      onClick={() => router.push("/user/agency/drivers")}
                      className="btn btn-secondary"
                    >
                      <Users />
                      Chauffeurs
                    </button>
                    <button
                      onClick={() => router.push("/user/agency/settings")}
                      className="btn btn-secondary"
                    >
                      <Settings />
                      Paramètres
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
