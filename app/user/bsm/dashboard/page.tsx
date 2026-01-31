"use client";

import React, { useState, useEffect } from "react";
import {
  Home,
  Eye,
  Settings,
  Building2,
  Briefcase,
  Bus,
  Calendar,
  MapPin,
  RefreshCw,
  TrendingUp,
  BarChart3,
  Users,
  Car,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import MobileSidebar from "@/app/components/Mobilesidebar";
import Header from "@/app/components/Header";

interface StatisticsOverview {
  ville: string;
  total_agencies: number;
  agencies_by_status: { [key: string]: number };
  pending_validation_count: number;
  validated_agencies_count: number;
  rejected_agencies_count: number;
  total_organizations: number;
  total_trips_in_city: number;
  total_reservations_in_city: number;
  total_vehicles_in_city: number;
  total_drivers_in_city: number;
  average_occupancy_rate: number;
  reservations_per_month: { [key: string]: number };
  revenue_per_month: { [key: string]: number };
  reservations_by_status: { [key: string]: number };
  trips_by_status: { [key: string]: number };
  top_agencies_by_revenue: { [key: string]: number };
  top_agencies_by_reservations: { [key: string]: number };
  agencies_per_organization: { [key: string]: number };
}

interface Agence {
  agency_id: string;
  organisation_id: string;
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

interface Organization {
  organization_id: string;
  short_name: string;
  long_name: string;
  email: string;
  description: string;
  status: string;
  logo_url: string;
  is_individual_business: boolean;
  legal_form: string;
  website_url: string;
  social_network: string;
  ceo_name: string;
  created_at: string;
  business_registration_number: string;
}

interface UserData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  address: string;
  userId: string;
}

export default function BSMDashboardPage() {
  const [statistics, setStatistics] = useState<StatisticsOverview | null>(null);
  const [agences, setAgences] = useState<Agence[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingAgences, setIsLoadingAgences] = useState(true);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [agencesPage, setAgencesPage] = useState(0);
  const [agencesTotalPages, setAgencesTotalPages] = useState(0);
  const [agencesSearch, setAgencesSearch] = useState("");
  const [orgsPage, setOrgsPage] = useState(0);
  const [orgsTotalPages, setOrgsTotalPages] = useState(0);
  const [orgsSearch, setOrgsSearch] = useState("");

  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const ITEMS_PER_PAGE = 5;
  const CHART_COLORS = {
    primary: "#7cab1b",
    secondary: "#679419",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#3B82F6",
    purple: "#A855F7",
  };
  const PIE_COLORS = ["#10B981", "#F59E0B", "#EF4444", "#6366F1", "#8B5CF6"];

  const menuItems = [
    {
      icon: Home,
      label: "Dashboard",
      path: "/user/bsm/dashboard",
      active: true,
    },
    {
      icon: Eye,
      label: "Surveillance",
      path: "/user/bsm/monitoring",
      active: false,
    },
    {
      icon: Settings,
      label: "Mes paramètres",
      path: "/user/bsm/settings",
      active: false,
    },
  ];

  useEffect(() => {
    const bsmToken = sessionStorage.getItem("bsm_token");
    if (!bsmToken) {
      router.push("/bsm/login");
      return;
    }

    const storedBsmData = sessionStorage.getItem("bsm_data");
    if (storedBsmData) {
      const parsedUser = JSON.parse(storedBsmData);
      setUserData(parsedUser);
      if (parsedUser.address) {
        fetchStatistics(parsedUser.address);
        fetchAgences(parsedUser.address);
      }
    }
    fetchOrganizations();
  }, [router]);

  useEffect(() => {
    if (userData?.address) {
      fetchAgences(userData.address);
    }
  }, [agencesPage]);

  useEffect(() => {
    fetchOrganizations();
  }, [orgsPage]);

  const fetchStatistics = async (ville: string) => {
    setIsLoadingStats(true);
    setErrorMessage("");

    try {
      const bsmToken = sessionStorage.getItem("bsm_token");
      const response = await fetch(
        `${API_BASE_URL}/statistics/bsm/${ville}/overview`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${bsmToken}`,
          },
        },
      );

      if (!response.ok)
        throw new Error("Erreur lors du chargement des statistiques");
      const data = await response.json();
      setStatistics(data);
    } catch (error: any) {
      setErrorMessage("Impossible de charger les statistiques");
      console.error("Fetch Statistics Error:", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const fetchAgences = async (ville: string) => {
    setIsLoadingAgences(true);

    try {
      const bsmToken = sessionStorage.getItem("bsm_token");
      const response = await fetch(
        `${API_BASE_URL}/agence/by-city/${ville}?page=${agencesPage}&size=${ITEMS_PER_PAGE}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${bsmToken}`,
          },
        },
      );

      if (!response.ok)
        throw new Error("Erreur lors du chargement des agences");
      const data = await response.json();
      const allAgences = data.content || [];
      const validatedAgences = allAgences.filter(
        (agence: Agence) => agence.statut_validation === "VALIDEE",
      );

      setAgences(validatedAgences);
      setAgencesTotalPages(data.page?.totalPages || 0);
    } catch (error: any) {
      console.error("Fetch Agences Error:", error);
    } finally {
      setIsLoadingAgences(false);
    }
  };

  const fetchOrganizations = async () => {
    setIsLoadingOrgs(true);

    try {
      const bsmToken = sessionStorage.getItem("bsm_token");
      const response = await fetch(
        `${API_BASE_URL}/organizations?page=${orgsPage}&size=${ITEMS_PER_PAGE}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${bsmToken}`,
          },
        },
      );

      if (!response.ok)
        throw new Error("Erreur lors du chargement des organisations");
      const data = await response.json();
      setOrganizations(data);
      setOrgsTotalPages(Math.ceil(data.length / ITEMS_PER_PAGE));
    } catch (error: any) {
      console.error("Fetch Organizations Error:", error);
    } finally {
      setIsLoadingOrgs(false);
    }
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
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const prepareMonthlyData = (data: { [key: string]: number }) => {
    return Object.entries(data)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, value]) => ({ month, value }));
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

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      VALIDEE: CHART_COLORS.success,
      EN_ATTENTE: CHART_COLORS.warning,
      REJETEE: CHART_COLORS.danger,
      CONFIRMEE: CHART_COLORS.info,
      ANNULEE: CHART_COLORS.danger,
      EN_COURS: CHART_COLORS.warning,
      TERMINEE: CHART_COLORS.success,
    };
    return colors[status] || CHART_COLORS.primary;
  };

  const getVoyagesStatusData = () => {
    if (!statistics?.trips_by_status) return [];
    return Object.entries(statistics.trips_by_status).map(
      ([name, value], index) => ({
        name: name,
        value: value,
        color: PIE_COLORS[index % PIE_COLORS.length],
      }),
    );
  };

  const getReservationsStatusData = () => {
    if (!statistics?.reservations_by_status) return [];
    return Object.entries(statistics.reservations_by_status).map(
      ([name, value], index) => ({
        name: name,
        value: value,
        color: PIE_COLORS[index % PIE_COLORS.length],
      }),
    );
  };

  return (
    <div className="dashboard-layout">
      <Sidebar menuItems={menuItems} activePath="/user/bsm/dashboard" />
      <MobileSidebar
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        menuItems={menuItems}
        activePath="/user/bsm/dashboard"
      />

      <div className="dashboard-main">
        <Header
          title="Dashboard BSM"
          userData={userData}
          onMenuClick={() => setShowMobileMenu(true)}
          userType="bsm"
        />

        <main className="dashboard-content">
          {userData?.address && (
            <div
              className="section-header"
              style={{ marginBottom: "var(--spacing-2xl)" }}
            >
              <h2 className="section-title">
                Ville de surveillance : {userData.address}
              </h2>
              <p className="section-description">
                Examinez les statistiques des organisations de votre gare
                routière
              </p>
            </div>
          )}

          {isLoadingStats && (
            <div className="loading-state">
              <RefreshCw className="spin" />
              <p>Chargement des statistiques...</p>
            </div>
          )}

          {!isLoadingStats && errorMessage && (
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

          {!isLoadingStats && !errorMessage && statistics && (
            <>
              <div className="stats-card">
                <div className="stats-header">
                  <h3>Statistiques principales</h3>
                </div>
                <div className="stats-grid-main">
                  <div className="stat-item">
                    <div className="stat-content">
                      <p className="stat-label">Agences totales</p>
                      <p className="stat-value">{statistics.total_agencies}</p>
                    </div>
                  </div>

                  <div className="stat-item">
                    <div className="stat-content">
                      <p className="stat-label">Organisations</p>
                      <p className="stat-value">
                        {statistics.total_organizations}
                      </p>
                    </div>
                  </div>

                  <div className="stat-item">
                    <div className="stat-content">
                      <p className="stat-label">Voyages actifs</p>
                      <p className="stat-value">
                        {statistics.total_trips_in_city}
                      </p>
                    </div>
                  </div>

                  <div className="stat-item">
                    <div className="stat-content">
                      <p className="stat-label">Réservations</p>
                      <p className="stat-value">
                        {statistics.total_reservations_in_city}
                      </p>
                    </div>
                  </div>

                  <div className="stat-item">
                    <div className="stat-content">
                      <p className="stat-label">Véhicules</p>
                      <p className="stat-value">
                        {statistics.total_vehicles_in_city}
                      </p>
                    </div>
                  </div>

                  <div className="stat-item">
                    <div className="stat-content">
                      <p className="stat-label">Chauffeurs</p>
                      <p className="stat-value">
                        {statistics.total_drivers_in_city}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "var(--spacing-md)",
                    marginTop: "var(--spacing-xl)",
                    paddingTop: "var(--spacing-xl)",
                    borderTop: "1px solid var(--gray-200)",
                  }}
                >
                  <div
                    style={{
                      padding: "var(--spacing-md)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--gray-200)",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "var(--font-size-sm)",
                        marginBottom: "4px",
                      }}
                    >
                      Agences validées
                    </p>
                    <p
                      style={{
                        fontSize: "var(--font-size-2xl)",
                        fontWeight: "var(--font-weight-bold)",
                      }}
                    >
                      {statistics.validated_agencies_count}
                    </p>
                  </div>

                  <div
                    style={{
                      padding: "var(--spacing-md)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--gray-200)",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "var(--font-size-sm)",
                        marginBottom: "4px",
                      }}
                    >
                      En attente
                    </p>
                    <p
                      style={{
                        fontSize: "var(--font-size-2xl)",
                        fontWeight: "var(--font-weight-bold)",
                      }}
                    >
                      {statistics.pending_validation_count}
                    </p>
                  </div>

                  <div
                    style={{
                      padding: "var(--spacing-md)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--gray-200)",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "var(--font-size-sm)",
                        marginBottom: "4px",
                      }}
                    >
                      Rejetées
                    </p>
                    <p
                      style={{
                        fontSize: "var(--font-size-2xl)",
                        fontWeight: "var(--font-weight-bold)",
                      }}
                    >
                      {statistics.rejected_agencies_count}
                    </p>
                  </div>
                </div>

                <div className="occupation-rate">
                  <p className="occupation-label">Taux d'occupation moyen</p>
                  <div className="occupation-bar-wrapper">
                    <div className="occupation-bar">
                      <div
                        className="occupation-fill"
                        style={{
                          width: `${statistics.average_occupancy_rate * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="occupation-value">
                      {(statistics.average_occupancy_rate * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {statistics.agencies_per_organization &&
                Object.keys(statistics.agencies_per_organization).length >
                  0 && (
                  <div className="chart-card">
                    <div className="chart-header">
                      <h3>Répartition des agences par organisation</h3>
                    </div>
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={prepareBarChartData(
                            statistics.agencies_per_organization,
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
                          <Tooltip />
                          <Legend />
                          <Bar
                            dataKey="value"
                            fill={CHART_COLORS.primary}
                            name="Nombre d'agences"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

              <div className="charts-row">
                {statistics.top_agencies_by_revenue &&
                  Object.keys(statistics.top_agencies_by_revenue).length >
                    0 && (
                    <div className="chart-card-small">
                      <div className="chart-header">
                        <h3>Top 10 agences par revenu</h3>
                      </div>
                      <div className="chart-container-small">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={prepareBarChartData(
                              statistics.top_agencies_by_revenue,
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
                            <Tooltip
                              formatter={(value) =>
                                formatRevenue(value as number)
                              }
                            />
                            <Legend />
                            <Bar
                              dataKey="value"
                              fill={CHART_COLORS.primary}
                              name="Revenu"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                {statistics.top_agencies_by_reservations &&
                  Object.keys(statistics.top_agencies_by_reservations).length >
                    0 && (
                    <div className="chart-card-small">
                      <div className="chart-header">
                        <h3>Top 10 agences par réservations</h3>
                      </div>
                      <div className="chart-container-small">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={prepareBarChartData(
                              statistics.top_agencies_by_reservations,
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
                            <Legend />
                            <Bar
                              dataKey="value"
                              fill={CHART_COLORS.secondary}
                              name="Réservations"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
              </div>

              <div className="charts-row">
                {statistics.reservations_per_month &&
                  Object.keys(statistics.reservations_per_month).length > 0 && (
                    <div className="chart-card-small">
                      <div className="chart-header">
                        <h3>Réservations par mois</h3>
                      </div>
                      <div className="chart-container-small">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={prepareMonthlyData(
                              statistics.reservations_per_month,
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
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke={CHART_COLORS.primary}
                              strokeWidth={2}
                              name="Réservations"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                {statistics.revenue_per_month &&
                  Object.keys(statistics.revenue_per_month).length > 0 && (
                    <div className="chart-card-small">
                      <div className="chart-header">
                        <h3>Revenu par mois</h3>
                      </div>
                      <div className="chart-container-small">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={prepareMonthlyData(
                              statistics.revenue_per_month,
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
                            <Legend />
                            <Bar
                              dataKey="value"
                              fill={CHART_COLORS.primary}
                              name="Revenu"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
              </div>

              {/* Réservations et Voyages par statut */}
              <div className="charts-row">
                {/* Réservations par statut */}
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
                            {getReservationsStatusData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Voyages par statut */}
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
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>

              {/* Agences par statut */}
              {statistics.agencies_by_status &&
                Object.keys(statistics.agencies_by_status).length > 0 && (
                  <div className="chart-card">
                    <div className="chart-header">
                      <h3>Répartition des agences par statut de validation</h3>
                    </div>
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={Object.entries(statistics.agencies_by_status)
                            .filter(([_, value]) => value > 0)
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
                          <Legend />
                          <Bar dataKey="value" name="Nombre d'agences">
                            {Object.entries(statistics.agencies_by_status)
                              .filter(([_, value]) => value > 0)
                              .map(([name], index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={CHART_COLORS.primary}
                                />
                              ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
            </>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "var(--spacing-xl)",
              marginTop: "var(--spacing-xl)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
                gap: "var(--spacing-xl)",
              }}
            >
              {/* Agences Card */}
              <div
                style={{
                  background: "white",
                  border: "1px solid var(--gray-200)",
                  borderRadius: "var(--radius-lg)",
                  padding: "var(--spacing-xl)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "var(--spacing-lg)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--spacing-sm)",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "var(--font-size-lg)",
                        fontWeight: "var(--font-weight-semibold)",
                        color: "var(--gray-900)",
                      }}
                    >
                      Agences validées
                    </h3>
                  </div>
                  <button
                    onClick={() =>
                      userData?.address && fetchAgences(userData.address)
                    }
                    disabled={isLoadingAgences}
                    style={{
                      padding: "var(--spacing-xs)",
                      background: "transparent",
                      border: "none",
                      borderRadius: "var(--radius-md)",
                      cursor: "pointer",
                      transition: "background var(--transition-base)",
                    }}
                  >
                    <RefreshCw
                      style={{
                        width: "16px",
                        height: "16px",
                        color: "var(--gray-600)",
                      }}
                      className={isLoadingAgences ? "spin" : ""}
                    />
                  </button>
                </div>

                <div style={{ marginBottom: "var(--spacing-md)" }}>
                  <div style={{ position: "relative" }}>
                    <Search
                      style={{
                        position: "absolute",
                        left: "var(--spacing-sm)",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "16px",
                        height: "16px",
                        color: "var(--gray-400)",
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Rechercher"
                      value={agencesSearch}
                      onChange={(e) => setAgencesSearch(e.target.value)}
                      style={{
                        width: "100%",
                        paddingLeft: "40px",
                        paddingRight: "var(--spacing-md)",
                        paddingTop: "var(--spacing-xs)",
                        paddingBottom: "var(--spacing-xs)",
                        border: "1px solid var(--gray-300)",
                        borderRadius: "var(--radius-md)",
                        fontSize: "var(--font-size-sm)",
                        color: "var(--gray-900)",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>

                {isLoadingAgences ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "var(--spacing-2xl)",
                    }}
                  >
                    <RefreshCw
                      style={{
                        width: "24px",
                        height: "24px",
                        color: "var(--color-primary)",
                      }}
                      className="spin"
                    />
                  </div>
                ) : agences.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "var(--spacing-2xl)",
                    }}
                  >
                    <Building2
                      style={{
                        width: "40px",
                        height: "40px",
                        color: "var(--gray-400)",
                        margin: "0 auto var(--spacing-md)",
                      }}
                    />
                    <p style={{ color: "var(--gray-500)" }}>
                      Aucune agence trouvée
                    </p>
                  </div>
                ) : (
                  <>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "var(--spacing-sm)",
                        marginBottom: "var(--spacing-md)",
                      }}
                    >
                      {agences
                        .filter(
                          (agence) =>
                            agence.long_name
                              .toLowerCase()
                              .includes(agencesSearch.toLowerCase()) ||
                            agence.short_name
                              .toLowerCase()
                              .includes(agencesSearch.toLowerCase()),
                        )
                        .map((agence) => (
                          <div
                            key={agence.agency_id}
                            style={{
                              border: "1px solid var(--gray-200)",
                              borderRadius: "var(--radius-md)",
                              padding: "var(--spacing-md)",
                              transition: "box-shadow var(--transition-base)",
                            }}
                          >
                            <h4
                              style={{
                                fontSize: "var(--font-size-sm)",
                                fontWeight: "var(--font-weight-semibold)",
                                color: "var(--gray-900)",
                                marginBottom: "4px",
                              }}
                            >
                              {agence.long_name}
                            </h4>
                            <p
                              style={{
                                fontSize: "var(--font-size-xs)",
                                color: "var(--gray-600)",
                                marginBottom: "2px",
                              }}
                            >
                              {agence.short_name}
                            </p>
                            <p
                              style={{
                                fontSize: "var(--font-size-xs)",
                                color: "var(--gray-500)",
                              }}
                            >
                              {agence.ville} - {agence.location}
                            </p>
                          </div>
                        ))}
                    </div>

                    {agencesTotalPages > 1 && (
                      <div className="widget-pagination">
                        <button
                          onClick={() =>
                            setAgencesPage(Math.max(0, agencesPage - 1))
                          }
                          disabled={agencesPage === 0}
                          className="btn-icon"
                        >
                          <ChevronLeft />
                        </button>
                        <span>
                          {agencesPage + 1} / {agencesTotalPages}
                        </span>
                        <button
                          onClick={() =>
                            setAgencesPage(
                              Math.min(agencesTotalPages - 1, agencesPage + 1),
                            )
                          }
                          disabled={agencesPage === agencesTotalPages - 1}
                          className="btn-icon"
                        >
                          <ChevronRight />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Organizations Card */}
              <div
                style={{
                  background: "white",
                  border: "1px solid var(--gray-200)",
                  borderRadius: "var(--radius-lg)",
                  padding: "var(--spacing-xl)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "var(--spacing-lg)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--spacing-sm)",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "var(--font-size-lg)",
                        fontWeight: "var(--font-weight-semibold)",
                        color: "var(--gray-900)",
                      }}
                    >
                      Organisations
                    </h3>
                  </div>
                  <button
                    onClick={fetchOrganizations}
                    disabled={isLoadingOrgs}
                    style={{
                      padding: "var(--spacing-xs)",
                      background: "transparent",
                      border: "none",
                      borderRadius: "var(--radius-md)",
                      cursor: "pointer",
                    }}
                  >
                    <RefreshCw
                      style={{
                        width: "16px",
                        height: "16px",
                        color: "var(--gray-600)",
                      }}
                      className={isLoadingOrgs ? "spin" : ""}
                    />
                  </button>
                </div>

                <div style={{ marginBottom: "var(--spacing-md)" }}>
                  <div style={{ position: "relative" }}>
                    <Search
                      style={{
                        position: "absolute",
                        left: "var(--spacing-sm)",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "16px",
                        height: "16px",
                        color: "var(--gray-400)",
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Rechercher"
                      value={orgsSearch}
                      onChange={(e) => setOrgsSearch(e.target.value)}
                      style={{
                        width: "100%",
                        paddingLeft: "40px",
                        paddingRight: "var(--spacing-md)",
                        paddingTop: "var(--spacing-xs)",
                        paddingBottom: "var(--spacing-xs)",
                        border: "1px solid var(--gray-300)",
                        borderRadius: "var(--radius-md)",
                        fontSize: "var(--font-size-sm)",
                        color: "var(--gray-900)",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>

                {isLoadingOrgs ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "var(--spacing-2xl)",
                    }}
                  >
                    <RefreshCw
                      style={{
                        width: "24px",
                        height: "24px",
                        color: "var(--color-primary)",
                      }}
                      className="spin"
                    />
                  </div>
                ) : organizations.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "var(--spacing-2xl)",
                    }}
                  >
                    <Briefcase
                      style={{
                        width: "40px",
                        height: "40px",
                        color: "var(--gray-400)",
                        margin: "0 auto var(--spacing-md)",
                      }}
                    />
                    <p style={{ color: "var(--gray-500)" }}>
                      Aucune organisation trouvée
                    </p>
                  </div>
                ) : (
                  <>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "var(--spacing-sm)",
                        marginBottom: "var(--spacing-md)",
                      }}
                    >
                      {organizations
                        .filter(
                          (org) =>
                            org.long_name
                              .toLowerCase()
                              .includes(orgsSearch.toLowerCase()) ||
                            org.short_name
                              .toLowerCase()
                              .includes(orgsSearch.toLowerCase()),
                        )
                        .slice(
                          orgsPage * ITEMS_PER_PAGE,
                          (orgsPage + 1) * ITEMS_PER_PAGE,
                        )
                        .map((org) => (
                          <div
                            key={org.organization_id}
                            style={{
                              border: "1px solid var(--gray-200)",
                              borderRadius: "var(--radius-md)",
                              padding: "var(--spacing-md)",
                            }}
                          >
                            <h4
                              style={{
                                fontSize: "var(--font-size-sm)",
                                fontWeight: "var(--font-weight-semibold)",
                                color: "var(--gray-900)",
                                marginBottom: "4px",
                              }}
                            >
                              {org.long_name}
                            </h4>
                            <p
                              style={{
                                fontSize: "var(--font-size-xs)",
                                color: "var(--gray-600)",
                                marginBottom: "2px",
                              }}
                            >
                              {org.short_name}
                            </p>
                            <p
                              style={{
                                fontSize: "var(--font-size-xs)",
                                color: "var(--gray-500)",
                              }}
                            >
                              {org.email}
                            </p>
                          </div>
                        ))}
                    </div>

                    {orgsTotalPages > 1 && (
                      <div className="widget-pagination">
                        <button
                          onClick={() => setOrgsPage(Math.max(0, orgsPage - 1))}
                          disabled={orgsPage === 0}
                          className="btn-icon"
                        >
                          <ChevronLeft />
                        </button>
                        <span>
                          {orgsPage + 1} / {orgsTotalPages}
                        </span>
                        <button
                          onClick={() =>
                            setOrgsPage(
                              Math.min(orgsTotalPages - 1, orgsPage + 1),
                            )
                          }
                          disabled={orgsPage === orgsTotalPages - 1}
                          className="btn-icon"
                        >
                          <ChevronRight />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
