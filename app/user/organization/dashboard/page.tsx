"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  Building2,
  Settings,
  Briefcase,
  Users,
  Car,
  Bus,
  TrendingUp,
  RefreshCw,
  ChevronDown,
  BarChart3,
  MapPin,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
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
import Sidebar from "@/app/components/Sidebar";
import MobileSidebar from "@/app/components/Mobilesidebar";
import Header from "@/app/components/Header";
import SuccessModal from "@/app/components/SuccessModal";
import ErrorModal from "@/app/components/ErrorModal";
import ConfirmModal from "@/app/components/ConfirmModal";

interface GeneralStatistics {
  organization_id: string;
  organization_name: string;
  total_agencies: number;
  agencies_by_status: {
    VALIDEE: number;
    EN_ATTENTE: number;
    REJETEE: number;
  };
  total_employees: number;
  total_drivers: number;
  total_vehicles: number;
  total_trips: number;
  total_reservations: number;
  total_revenue: number;
  average_occupancy_rate: number;
  cities_covered: number;
  reservations_per_month: { [key: string]: number };
  revenue_per_month: { [key: string]: number };
  reservations_by_status: { [key: string]: number };
  trips_by_status: { [key: string]: number };
  revenue_by_agency: { [key: string]: number };
  reservations_by_agency: { [key: string]: number };
}

interface AgencyStats {
  ville: string;
  agency_id: string;
  agency_name: string;
  short_name: string;
  statut_validation: string;
  number_of_employees: number;
  number_of_drivers: number;
  number_of_vehicles: number;
  number_of_trips: number;
  number_of_reservations: number;
  total_revenue: number;
  average_occupancy_rate: number;
}

interface AgenciesStatistics {
  organization_id: string;
  organization_name: string;
  total_agencies: number;
  agencies: AgencyStats[];
  best_performing_agency_id: string;
  best_performing_agency_name: string;
}

interface Organization {
  id: string;
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
  created_by: string;
  business_registration_number: string;
}

interface UserData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  userId: string;
  role: string[];
}

export default function OrganizationDashboardPage() {
  const router = useRouter();
  const [general_stats, setGeneralStats] = useState<GeneralStatistics | null>(
    null,
  );
  const [agencies_stats, setAgenciesStats] =
    useState<AgenciesStatistics | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selected_organization, setSelectedOrganization] =
    useState<Organization | null>(null);

  const [is_loading_stats, setIsLoadingStats] = useState(true);
  const [is_loading_orgs, setIsLoadingOrgs] = useState(true);
  const [error_message, setErrorMessage] = useState("");

  const [show_mobile_menu, setShowMobileMenu] = useState(false);
  const [user_data, setUserData] = useState<UserData | null>(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const [agencies_search, setAgenciesSearch] = useState("");
  const [agencies_page, setAgenciesPage] = useState(1);
  const agencies_per_page = 6;

  const [orgs_search, setOrgsSearch] = useState("");
  const [orgs_page, setOrgsPage] = useState(1);
  const orgs_per_page = 6;

  const [show_delete_org_modal, setShowDeleteOrgModal] = useState(false);
  const [show_delete_agency_modal, setShowDeleteAgencyModal] = useState(false);
  const [delete_target_id, setDeleteTargetId] = useState("");
  const [delete_target_name, setDeleteTargetName] = useState("");
  const [is_deleting, setIsDeleting] = useState(false);

  const [show_org_selector, setShowOrgSelector] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const PIE_COLORS = ["#10B981", "#F59E0B", "#EF4444", "#6366F1", "#8B5CF6"];

  const menuItems = [
    {
      icon: Home,
      label: "Dashboard",
      path: "/user/organization/dashboard",
      active: true,
    },
    {
      icon: Briefcase,
      label: "Organisation",
      path: "/user/organization/organization",
      active: false,
    },
    {
      icon: Building2,
      label: "Agence",
      path: "/user/organization/agencies",
      active: false,
    },
    {
      icon: Settings,
      label: "Mes paramètres",
      path: "/user/organization/settings",
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
      setUserData(JSON.parse(stored_user_data));
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (user_data?.userId) {
      fetchOrganizations();
    }
  }, [user_data?.userId]);

  useEffect(() => {
    if (selected_organization?.id) {
      fetchGeneralStatistics(selected_organization.id);
      fetchAgenciesStatistics(selected_organization.id);
    }
  }, [selected_organization?.id]);

  const getAuthToken = () => {
    return (
      localStorage.getItem("auth_token") ||
      sessionStorage.getItem("auth_token") ||
      ""
    );
  };

  const fetchOrganizations = async () => {
    setIsLoadingOrgs(true);
    setErrorMessage("");

    try {
      const auth_token = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/organizations?page=0&size=1000`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth_token}`,
          },
        },
      );

      if (!response.ok)
        throw new Error("Erreur lors du chargement des organisations");

      const data = await response.json();
      const my_orgs = data.filter(
        (org: Organization) =>
          org.created_by === user_data?.userId && org.status !== "DELETED",
      );

      setOrganizations(my_orgs);

      if (my_orgs.length > 0 && !selected_organization) {
        setSelectedOrganization(my_orgs[0]);
      }

      if (my_orgs.length === 0) {
        setIsLoadingStats(false);
      }
    } catch (error: any) {
      setErrorMessage("Impossible de charger vos organisations");
      setIsLoadingStats(false);
    } finally {
      setIsLoadingOrgs(false);
    }
  };

  const fetchGeneralStatistics = async (organization_id: string) => {
    setIsLoadingStats(true);
    setErrorMessage("");

    try {
      const auth_token = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/statistics/organisation/${organization_id}/general`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth_token}`,
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

  const fetchAgenciesStatistics = async (organization_id: string) => {
    try {
      const auth_token = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/statistics/organisation/${organization_id}/agencies`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth_token}`,
          },
        },
      );

      if (!response.ok)
        throw new Error("Erreur lors du chargement des agences");
      const data = await response.json();
      setAgenciesStats(data);
    } catch (error: any) {
      console.error("Fetch Agencies Stats Error:", error);
    }
  };

  const handleSelectOrganization = (org: Organization) => {
    setSelectedOrganization(org);
    setShowOrgSelector(false);
    setAgenciesPage(1);
  };

  const handleDeleteOrganization = async () => {
    setIsDeleting(true);
    try {
      const auth_token = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/organizations/${delete_target_id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${auth_token}`,
          },
        },
      );

      if (!response.ok) throw new Error("Erreur lors de la suppression");

      setShowDeleteOrgModal(false);

      if (delete_target_id === selected_organization?.id) {
        const remaining_orgs = organizations.filter(
          (org) => org.id !== delete_target_id,
        );
        setSelectedOrganization(
          remaining_orgs.length > 0 ? remaining_orgs[0] : null,
        );
      }

      setShowSuccessModal(true);
      fetchOrganizations();
    } catch (error: any) {
      setErrorMessage("Erreur lors de la suppression de l'organisation");
      setShowErrorModal(true);
      console.error("Delete Organization Error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAgency = async () => {
    setIsDeleting(true);
    try {
      const auth_token = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/agence/${delete_target_id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${auth_token}`,
          },
        },
      );

      if (!response.ok) throw new Error("Erreur lors de la suppression");

      setShowDeleteAgencyModal(false);

      if (selected_organization?.id) {
        fetchAgenciesStatistics(selected_organization.id);
      }
      setShowSuccessModal(true);
    } catch (error: any) {
      setErrorMessage("Erreur lors de la suppression de l'agence");
      setShowErrorModal(true);
      console.error("Delete Agency Error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefresh = () => {
    if (selected_organization?.id) {
      fetchGeneralStatistics(selected_organization.id);
      fetchAgenciesStatistics(selected_organization.id);
    }
    fetchOrganizations();
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
    });
  };

  const prepareMonthlyData = (data: { [key: string]: number }) => {
    return Object.entries(data)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, value]) => ({
        month,
        value,
      }));
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

  const getStatusData = () => {
    if (!general_stats?.agencies_by_status) return [];
    return Object.entries(general_stats.agencies_by_status).map(
      ([name, value], index) => ({
        name,
        value,
        color: PIE_COLORS[index % PIE_COLORS.length],
      }),
    );
  };

  const filtered_agencies =
    agencies_stats?.agencies.filter(
      (agency) =>
        agency.agency_name
          .toLowerCase()
          .includes(agencies_search.toLowerCase()) ||
        agency.short_name.toLowerCase().includes(agencies_search.toLowerCase()),
    ) || [];

  const total_agencies_pages = Math.ceil(
    filtered_agencies.length / agencies_per_page,
  );
  const paginated_agencies = filtered_agencies.slice(
    (agencies_page - 1) * agencies_per_page,
    agencies_page * agencies_per_page,
  );

  const filtered_orgs = organizations.filter(
    (org) =>
      org.long_name.toLowerCase().includes(orgs_search.toLowerCase()) ||
      org.short_name.toLowerCase().includes(orgs_search.toLowerCase()),
  );

  const total_orgs_pages = Math.ceil(filtered_orgs.length / orgs_per_page);
  const paginated_orgs = filtered_orgs.slice(
    (orgs_page - 1) * orgs_per_page,
    orgs_page * orgs_per_page,
  );

  return (
    <div className="dashboard-layout">
      <Sidebar
        menuItems={menuItems}
        activePath="/user/organization/dashboard"
      />
      <MobileSidebar
        isOpen={show_mobile_menu}
        onClose={() => setShowMobileMenu(false)}
        menuItems={menuItems}
        activePath="/user/organization/dashboard"
      />

      <div className="dashboard-main">
        <Header
          title="Dashboard"
          userData={user_data}
          onMenuClick={() => setShowMobileMenu(true)}
          showSettingsButton={true}
          userType="organization"
        />

        <main className="dashboard-content">
          {(is_loading_orgs || is_loading_stats) &&
            organizations.length === 0 && (
              <div className="loading-state">
                <RefreshCw className="spin" />
                <p>Chargement en cours...</p>
              </div>
            )}

          {!is_loading_orgs && error_message && (
            <>
              <div className="error-state">
                <X className="error-state-icon" />
                <p className="error-text">{error_message}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="btn btn-primary"
                >
                  Réessayer
                </button>
              </div>
            </>
          )}

          {!is_loading_orgs && organizations.length === 0 && !error_message && (
            <>
              <div className="empty-state">
                <Briefcase className="empty-icon" />
                <h3 className="empty-title">Aucune organisation</h3>
                <p className="empty-description">
                  Vous n'avez pas encore créé d'organisation
                </p>
                <button
                  onClick={() => router.push("/user/organization/organization")}
                  className="btn btn-primary"
                >
                  Créer une organisation
                </button>
              </div>
            </>
          )}

          {!is_loading_orgs && organizations.length > 0 && (
            <>
              <div
                className="section-header"
                style={{ marginBottom: "var(--spacing-2xl)" }}
              >
                <h2 className="section-title">Votre tableau de bord</h2>
                <p className="section-description">
                  Examinez les statistiques générales de votre organisation et
                  gérez votre organisation en quelques clics
                </p>
              </div>

              <div className="agency-header-card">
                <div className="agency-info">
                  <h2 className="agency-name">
                    Nom de votre organisation :{" "}
                    {selected_organization?.long_name}
                  </h2>
                  <p className="agency-location">
                    Abréviation du nom de votre organisation :{" "}
                    {selected_organization?.short_name}
                  </p>
                </div>

                {organizations.length > 1 && (
                  <div className="agency-selector">
                    <button
                      onClick={() => setShowOrgSelector(!show_org_selector)}
                      className="btn btn-secondary"
                    >
                      Changer
                      <ChevronDown />
                    </button>

                    {show_org_selector && (
                      <>
                        <div
                          className="selector-overlay"
                          onClick={() => setShowOrgSelector(false)}
                        ></div>
                        <div className="selector-dropdown">
                          {organizations.map((org) => (
                            <button
                              key={org.id}
                              onClick={() => handleSelectOrganization(org)}
                              className={`selector-item ${selected_organization?.id === org.id ? "active" : ""}`}
                            >
                              <div>
                                <p className="selector-item-name">
                                  {org.long_name}
                                </p>
                                <p className="selector-item-city">
                                  {org.short_name}
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

              {is_loading_stats && (
                <div className="loading-state">
                  <RefreshCw className="spin" />
                  <p>Chargement des statistiques...</p>
                </div>
              )}

              {!is_loading_stats && error_message && (
                <div className="error-state">
                  <p className="error-text">{error_message}</p>
                  <button
                    onClick={fetchOrganizations}
                    className="btn btn-primary"
                  >
                    Réessayer
                  </button>
                </div>
              )}

              {!is_loading_stats && !error_message && general_stats && (
                <>
                  <div className="stats-card">
                    <div className="stats-header">
                      <h3>Statistiques principales</h3>
                    </div>
                    <div className="stats-grid-main">
                      <div className="stat-item">
                        <div className="stat-content">
                          <p className="stat-label">Total agences</p>
                          <p className="stat-value">
                            {general_stats.total_agencies}
                          </p>
                        </div>
                      </div>

                      <div className="stat-item">
                        <div className="stat-content">
                          <p className="stat-label">Total employés</p>
                          <p className="stat-value">
                            {general_stats.total_employees}
                          </p>
                        </div>
                      </div>

                      <div className="stat-item">
                        <div className="stat-content">
                          <p className="stat-label">Conducteurs</p>
                          <p className="stat-value">
                            {general_stats.total_drivers}
                          </p>
                        </div>
                      </div>

                      <div className="stat-item">
                        <div className="stat-content">
                          <p className="stat-label">Véhicules</p>
                          <p className="stat-value">
                            {general_stats.total_vehicles}
                          </p>
                        </div>
                      </div>

                      <div className="stat-item">
                        <div className="stat-content">
                          <p className="stat-label">Total voyages</p>
                          <p className="stat-value">
                            {general_stats.total_trips}
                          </p>
                        </div>
                      </div>

                      <div className="stat-item">
                        <div className="stat-content">
                          <p className="stat-label">Revenus totaux</p>
                          <p className="stat-value revenue">
                            {formatRevenue(general_stats.total_revenue)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="occupation-rate">
                      <p className="occupation-label">
                        Taux d'occupation moyen
                      </p>
                      <div className="occupation-bar-wrapper">
                        <div className="occupation-bar">
                          <div
                            className="occupation-fill"
                            style={{
                              width: `${general_stats.average_occupancy_rate}%`,
                            }}
                          ></div>
                        </div>
                        <span className="occupation-value">
                          {general_stats.average_occupancy_rate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="charts-row">
                    {general_stats.reservations_per_month &&
                      Object.keys(general_stats.reservations_per_month).length >
                        0 && (
                        <div className="chart-card-small">
                          <div className="chart-header">
                            <h3>Réservations par mois</h3>
                          </div>
                          <div className="chart-container-small">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart
                                data={prepareMonthlyData(
                                  general_stats.reservations_per_month,
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
                                <Line
                                  type="monotone"
                                  dataKey="value"
                                  stroke="#7cab1b"
                                  strokeWidth={2}
                                  dot={{ fill: "#7cab1b", r: 4 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}

                    {general_stats.revenue_per_month &&
                      Object.keys(general_stats.revenue_per_month).length >
                        0 && (
                        <div className="chart-card-small">
                          <div className="chart-header">
                            <h3>Revenus par mois</h3>
                          </div>
                          <div className="chart-container-small">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={prepareMonthlyData(
                                  general_stats.revenue_per_month,
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
                                  radius={[8, 8, 0, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}
                  </div>

                  <div className="charts-row">
                    {getStatusData().length > 0 && (
                      <div className="chart-card-small">
                        <div className="chart-header">
                          <h3>Agences par statut</h3>
                        </div>
                        <div className="chart-container-small">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={getStatusData()}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {getStatusData().map((entry, index) => (
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

                    {general_stats.revenue_by_agency &&
                      Object.keys(general_stats.revenue_by_agency).length >
                        0 && (
                        <div className="chart-card-small">
                          <div className="chart-header">
                            <h3>Top 10 revenus par agence</h3>
                          </div>
                          <div className="chart-container-small">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={prepareBarChartData(
                                  general_stats.revenue_by_agency,
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
                                <Tooltip
                                  formatter={(value) =>
                                    formatRevenue(value as number)
                                  }
                                />
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

                  {/* Réservations et Voyages par statut */}
                  <div className="charts-row">
                    {general_stats.reservations_by_status &&
                      Object.keys(general_stats.reservations_by_status).length >
                        0 && (
                        <div className="chart-card-small">
                          <div className="chart-header">
                            <h3>Réservations par statut</h3>
                          </div>
                          <div className="chart-container-small">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={Object.entries(
                                    general_stats.reservations_by_status,
                                  ).map(([name, value], index) => ({
                                    name,
                                    value,
                                    color:
                                      PIE_COLORS[index % PIE_COLORS.length],
                                  }))}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={40}
                                  outerRadius={80}
                                  paddingAngle={5}
                                  dataKey="value"
                                >
                                  {Object.entries(
                                    general_stats.reservations_by_status,
                                  ).map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={
                                        PIE_COLORS[index % PIE_COLORS.length]
                                      }
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

                    {general_stats.trips_by_status &&
                      Object.keys(general_stats.trips_by_status).length > 0 && (
                        <div className="chart-card-small">
                          <div className="chart-header">
                            <h3>Voyages par statut</h3>
                          </div>
                          <div className="chart-container-small">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={Object.entries(
                                    general_stats.trips_by_status,
                                  ).map(([name, value], index) => ({
                                    name,
                                    value,
                                    color:
                                      PIE_COLORS[index % PIE_COLORS.length],
                                  }))}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={40}
                                  outerRadius={80}
                                  paddingAngle={5}
                                  dataKey="value"
                                >
                                  {Object.entries(
                                    general_stats.trips_by_status,
                                  ).map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={
                                        PIE_COLORS[index % PIE_COLORS.length]
                                      }
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
                  </div>

                  {/* Réservations par agence */}
                  {general_stats.reservations_by_agency &&
                    Object.keys(general_stats.reservations_by_agency).length >
                      0 && (
                      <div className="charts-row">
                        <div className="chart-card-small">
                          <div className="chart-header">
                            <h3>Top 10 réservations par agence</h3>
                          </div>
                          <div className="chart-container-small">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={prepareBarChartData(
                                  general_stats.reservations_by_agency,
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
                      </div>
                    )}

                  {agencies_stats && agencies_stats.agencies.length > 0 && (
                    <div className="org-agencies-section">
                      <div className="content-header">
                        <h3 className="content-title">
                          Nos agences ({agencies_stats.total_agencies})
                        </h3>
                        <div className="search-input-wrapper">
                          <Search />
                          <input
                            type="text"
                            placeholder="Rechercher une agence..."
                            value={agencies_search}
                            onChange={(e) => {
                              setAgenciesSearch(e.target.value);
                              setAgenciesPage(1);
                            }}
                          />
                        </div>
                      </div>

                      <div className="org-agencies-grid">
                        {paginated_agencies.map((agency) => (
                          <div
                            key={agency.agency_id}
                            className="org-agency-card"
                            onClick={() =>
                              router.push(
                                `/user/organization/detail_agency?id=${agency.agency_id}`,
                              )
                            }
                          >
                            <div className="org-agency-header">
                              <div className="org-agency-info">
                                <h4 className="org-agency-name">
                                  {agency.agency_name}
                                </h4>
                                <p className="org-agency-short">
                                  {agency.short_name}
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteTargetId(agency.agency_id);
                                  setDeleteTargetName(agency.agency_name);
                                  setShowDeleteAgencyModal(true);
                                }}
                                className="btn-icon-danger"
                              >
                                <Trash2 />
                              </button>
                            </div>

                            <div className="org-agency-location">
                              <MapPin />
                              <span>{agency.ville}</span>
                            </div>

                            <div className="org-agency-stats">
                              <div className="org-agency-stat">
                                <span className="org-agency-stat-label">
                                  Employés
                                </span>
                                <span className="org-agency-stat-value">
                                  {agency.number_of_employees}
                                </span>
                              </div>
                              <div className="org-agency-stat">
                                <span className="org-agency-stat-label">
                                  Voyages
                                </span>
                                <span className="org-agency-stat-value">
                                  {agency.number_of_trips}
                                </span>
                              </div>
                              <div className="org-agency-stat">
                                <span className="org-agency-stat-label">
                                  Revenu
                                </span>
                                <span className="org-agency-stat-value">
                                  {formatRevenue(agency.total_revenue)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {total_agencies_pages > 1 && (
                        <div className="widget-pagination">
                          <button
                            onClick={() =>
                              setAgenciesPage((p) => Math.max(1, p - 1))
                            }
                            disabled={agencies_page === 1}
                            className="btn-icon"
                          >
                            <ChevronLeft />
                          </button>
                          <span>
                            Page {agencies_page} sur {total_agencies_pages}
                          </span>
                          <button
                            onClick={() =>
                              setAgenciesPage((p) =>
                                Math.min(total_agencies_pages, p + 1),
                              )
                            }
                            disabled={agencies_page === total_agencies_pages}
                            className="btn-icon"
                          >
                            <ChevronRight />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="org-list-section">
                    <div className="content-header">
                      <h3 className="content-title">
                        Mes organisations ({organizations.length})
                      </h3>
                      <div className="search-input-wrapper">
                        <Search />
                        <input
                          type="text"
                          placeholder="Rechercher une organisation..."
                          value={orgs_search}
                          onChange={(e) => {
                            setOrgsSearch(e.target.value);
                            setOrgsPage(1);
                          }}
                        />
                      </div>
                    </div>

                    <div className="org-cards-grid">
                      {paginated_orgs.map((org) => (
                        <div
                          key={org.id}
                          className="org-list-card"
                          onClick={() =>
                            router.push(
                              `/user/organization/detail_organization?id=${org.id}`,
                            )
                          }
                        >
                          <div className="org-list-header">
                            <div className="org-list-info">
                              <h4 className="org-list-name">{org.long_name}</h4>
                              <p className="org-list-short">{org.short_name}</p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTargetId(org.id);
                                setDeleteTargetName(org.long_name);
                                setShowDeleteOrgModal(true);
                              }}
                              className="btn-icon-danger"
                            >
                              <Trash2 />
                            </button>
                          </div>

                          <div className="org-list-details">
                            <div className="org-list-detail">
                              <span className="org-list-detail-label">
                                Email
                              </span>
                              <span className="org-list-detail-value">
                                {org.email}
                              </span>
                            </div>
                            <div className="org-list-detail">
                              <span className="org-list-detail-label">
                                Dirigeant
                              </span>
                              <span className="org-list-detail-value">
                                {org.ceo_name}
                              </span>
                            </div>
                            <div className="org-list-detail">
                              <span className="org-list-detail-label">
                                Créée le
                              </span>
                              <span className="org-list-detail-value">
                                {formatDate(org.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {total_orgs_pages > 1 && (
                      <div className="widget-pagination">
                        <button
                          onClick={() => setOrgsPage((p) => Math.max(1, p - 1))}
                          disabled={orgs_page === 1}
                          className="btn-icon"
                        >
                          <ChevronLeft />
                        </button>
                        <span>
                          Page {orgs_page} sur {total_orgs_pages}
                        </span>
                        <button
                          onClick={() =>
                            setOrgsPage((p) =>
                              Math.min(total_orgs_pages, p + 1),
                            )
                          }
                          disabled={orgs_page === total_orgs_pages}
                          className="btn-icon"
                        >
                          <ChevronRight />
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </main>
      </div>

      <ConfirmModal
        show={show_delete_org_modal}
        onClose={() => {
          setShowDeleteOrgModal(false);
        }}
        onConfirm={handleDeleteOrganization}
        title="Supprimer l'organisation"
        message="Êtes-vous sûr de vouloir supprimer cette voyage ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        isLoading={is_deleting}
      />

      <ConfirmModal
        show={show_delete_agency_modal}
        onClose={() => {
          setShowDeleteAgencyModal(false);
        }}
        onConfirm={handleDeleteAgency}
        title="Supprimer l'agence"
        message="Êtes-vous sûr de vouloir supprimer cette agence ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        isLoading={is_deleting}
      />

      <SuccessModal
        show={showSuccessModal}
        onClose={() => window.location.reload()}
        title="Génial"
        message="Le suppression a réussie avec succès."
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
