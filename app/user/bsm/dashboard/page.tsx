"use client";

import React, { useState, useEffect } from "react";
import {
  Home,
  Eye,
  Settings,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Building2,
  MapPin,
  Bus,
  Calendar,
  TrendingUp,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Building,
  Briefcase,
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


/**
 * BSM Dashboard Page Component
 *
 * Dashboard for BSM (Bureau de Suivi et de Monitoring) users
 * Displays city statistics, agencies, and organizations
 *
 * @author Thomas Djotio Ndié
 * @date 2025-12-21
 */
export default function BSMDashboardPage() {
  const [statistics, setStatistics] = useState<StatisticsOverview | null>(null);
  const [agences, setAgences] = useState<Agence[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  const [is_loading_stats, setIsLoadingStats] = useState(true);
  const [is_loading_agences, setIsLoadingAgences] = useState(true);
  const [is_loading_orgs, setIsLoadingOrgs] = useState(true);

  const [error_message, setErrorMessage] = useState("");

  const [show_profile_menu, setShowProfileMenu] = useState(false);
  const [show_mobile_menu, setShowMobileMenu] = useState(false);
  const [bsm_data, setUserData] = useState<UserData | null>(null);

  const [agences_page, setAgencesPage] = useState(0);
  const [agences_total_pages, setAgencesTotalPages] = useState(0);
  const [agences_search, setAgencesSearch] = useState("");

  const [orgs_page, setOrgsPage] = useState(0);
  const [orgs_total_pages, setOrgsTotalPages] = useState(0);
  const [orgs_search, setOrgsSearch] = useState("");

  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const BUTTON_COLOR = "#6149CD";
  const ITEMS_PER_PAGE = 5;
  const CHART_COLORS = {
    primary: "#6149CD",
    secondary: "#8B7BE8",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#3B82F6",
    purple: "#A855F7",
    cyan: "#06B6D4",
  };

  const MENU_ITEMS = [
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
    const bsm_token = sessionStorage.getItem("bsm_token");

    if (!bsm_token) {
      router.push("/bsm/login");
      return;
    }

    const stored_bsm_data = sessionStorage.getItem("bsm_data");
    if (stored_bsm_data) {
      const parsed_user = JSON.parse(stored_bsm_data);
      setUserData(parsed_user);
      if (parsed_user.address) {
        fetchStatistics(parsed_user.address);
        fetchAgences(parsed_user.address);
      }
    }
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (bsm_data?.address) {
      fetchAgences(bsm_data.address);
    }
  }, [agences_page]);

  useEffect(() => {
    fetchOrganizations();
  }, [orgs_page]);

  const fetchStatistics = async (ville: string) => {
    setIsLoadingStats(true);
    setErrorMessage("");

    try {
      const bsm_token = sessionStorage.getItem("bsm_token");

      const response = await fetch(
        `${API_BASE_URL}/statistics/bsm/${ville}/overview`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${bsm_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des statistiques");
      }

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
      const bsm_token = sessionStorage.getItem("bsm_token");

      const response = await fetch(
        `${API_BASE_URL}/agence/by-city/${ville}?page=${agences_page}&size=${ITEMS_PER_PAGE}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${bsm_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des agences");
      }

      const data = await response.json();
      const all_agences = data.content || [];

      const validated_agences = all_agences.filter(
        (agence: Agence) => agence.statut_validation === "VALIDEE"
      );

      setAgences(validated_agences);
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
      const bsm_token = sessionStorage.getItem("bsm_token");

      const response = await fetch(
        `${API_BASE_URL}/organizations?page=${orgs_page}&size=${ITEMS_PER_PAGE}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${bsm_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des organisations");
      }

      const data = await response.json();
      setOrganizations(data);
      setOrgsTotalPages(Math.ceil(data.length / ITEMS_PER_PAGE));
    } catch (error: any) {
      console.error("Fetch Organizations Error:", error);
    } finally {
      setIsLoadingOrgs(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("bsm_token");
    sessionStorage.removeItem("bsm_data");
    router.push("/bsm/login");
  };

  const formatDate = (date_string: string) => {
    const date = new Date(date_string);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
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

  const prepareStatusData = (data: { [key: string]: number }) => {
    return Object.entries(data).map(([status, value]) => ({
      name: status,
      value,
    }));
  };

  const prepareTopAgenciesData = (data: { [key: string]: number }) => {
    return Object.entries(data)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([agency, value]) => ({
        agency: agency.length > 20 ? agency.substring(0, 20) + "..." : agency,
        value,
      }));
  };

  const prepareOrganizationData = (data: { [key: string]: number }) => {
    return Object.entries(data).map(([org, value]) => ({
      org: org.length > 15 ? org.substring(0, 15) + "..." : org,
      value,
    }));
  };

  const formatRevenue = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount);
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <>
        <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200 fixed h-full">
          <div className="p-6">
            <div className="mb-8">
              <button
                onClick={() => window.location.reload()}
                className="group relative transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-linear-to-r from-[#6149CD] to-[#8B7BE8] rounded-lg opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300"></div>
                <img
                  src="/images/busstation.png"
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
                      router.push("/user/bsm/dashboard");
                    }}
                    className="group relative transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    <img
                      src="/images/busstation.png"
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
                Dashboard BSM
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/user/bsm/settings")}
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
                    {bsm_data?.username}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>

                {show_profile_menu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        router.push("/user/bsm/settings");
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
            {/* Ville Badge */}
            {bsm_data?.address && (
              <div className="flex items-center space-x-2 mb-6 bg-white border border-gray-200 rounded-lg p-4 w-fit">
                <MapPin className="w-5 h-5 text-[#6149CD]" />
                <span className="font-semibold text-gray-900">
                  Ville : {bsm_data.address}
                </span>
              </div>
            )}

            {/* Statistics Cards */}
            {is_loading_stats ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 text-[#6149CD] animate-spin" />
              </div>
            ) : error_message ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center mb-6">
                <p className="text-red-600">{error_message}</p>
              </div>
            ) : statistics ? (
              <>
                {/* Top Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Building2 className="w-8 h-8 text-blue-600" />
                      <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        Total
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {statistics.total_agencies}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Agences</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Briefcase className="w-8 h-8 text-purple-600" />
                      <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded">
                        Total
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {statistics.total_organizations}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Organisations</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Calendar className="w-8 h-8 text-green-600" />
                      <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">
                        Actifs
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {statistics.total_trips_in_city}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Voyages</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Bus className="w-8 h-8 text-orange-600" />
                      <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded">
                        Total
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {statistics.total_vehicles_in_city}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Véhicules</p>
                  </div>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-linear-to-br from-green-50 to-green-100 rounded-xl border border-green-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-800 font-semibold mb-1">
                          Agences validées
                        </p>
                        <p className="text-2xl font-bold text-green-900">
                          {statistics.validated_agencies_count}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-green-700" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-linear-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-orange-800 font-semibold mb-1">
                          Agences en attente
                        </p>
                        <p className="text-2xl font-bold text-orange-900">
                          {statistics.pending_validation_count}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-orange-700" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-linear-to-br from-red-50 to-red-100 rounded-xl border border-red-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-red-800 font-semibold mb-1">
                          Agences rejetées
                        </p>
                        <p className="text-2xl font-bold text-red-900">
                          {statistics.rejected_agencies_count}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-red-700" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chart Placeholder */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">
                      Vue d'ensemble
                    </h3>
                    <TrendingUp className="w-5 h-5 text-[#6149CD]" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">
                          Réservations totales
                        </span>
                        <span className="text-lg font-bold text-[#6149CD]">
                          {statistics.total_reservations_in_city}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">
                          Conducteurs actifs
                        </span>
                        <span className="text-lg font-bold text-[#6149CD]">
                          {statistics.total_drivers_in_city}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">
                          Taux d'occupation moyen
                        </span>
                        <span className="text-lg font-bold text-[#6149CD]">
                          {(statistics.average_occupancy_rate * 100).toFixed(1)}
                          %
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <div className="relative inline-flex items-center justify-center w-40 h-40 rounded-full bg-linear-to-br from-[#6149CD] to-[#8B7BE8]">
                          <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                            <div>
                              <p className="text-3xl font-bold text-[#6149CD]">
                                {(
                                  statistics.average_occupancy_rate * 100
                                ).toFixed(0)}
                                %
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                Occupation
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Reservations by month */}
                  {statistics.reservations_per_month &&
                    Object.keys(statistics.reservations_per_month).length >
                      0 && (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                          Réservations par mois
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart
                            data={prepareMonthlyData(
                              statistics.reservations_per_month
                            )}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
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
                    )}

                  {/* Revenue by month */}
                  {statistics.revenue_per_month &&
                    Object.keys(statistics.revenue_per_month).length > 0 && (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                          Revenu par mois
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart
                            data={prepareMonthlyData(
                              statistics.revenue_per_month
                            )}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip
                              formatter={(value) =>
                                formatRevenue(value as number)
                              }
                            />
                            <Legend />
                            <Bar
                              dataKey="value"
                              fill={CHART_COLORS.success}
                              name="Revenu"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                  {/* Réservations par statut
                  {statistics.reservations_by_status &&
                    Object.keys(statistics.reservations_by_status).length >
                      0 && (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                          Réservations par statut
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={prepareStatusData(
                                statistics.reservations_by_status
                              )}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={(entry) => `${entry.name}: ${entry.value}`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {prepareStatusData(
                                statistics.reservations_by_status
                              ).map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={getStatusColor(entry.name)}
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )} */}

                  {/* Voyages par statut
                  {statistics.trips_by_status &&
                    Object.keys(statistics.trips_by_status).length > 0 && (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                          Voyages par statut
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={prepareStatusData(
                                statistics.trips_by_status
                              )}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={(entry) => `${entry.name}: ${entry.value}`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {prepareStatusData(
                                statistics.trips_by_status
                              ).map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={getStatusColor(entry.name)}
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )} */}

                  {/* Agencies by organization */}
                  {statistics.agencies_per_organization &&
                    Object.keys(statistics.agencies_per_organization).length >
                      0 && (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                          Répartition des agences par organisation
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart
                            data={prepareOrganizationData(
                              statistics.agencies_per_organization
                            )}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="org" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar
                              dataKey="value"
                              fill={CHART_COLORS.purple}
                              name="Nombre d'agences"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                  {/* Top agencies by revenues */}
                  {statistics.top_agencies_by_revenue &&
                    Object.keys(statistics.top_agencies_by_revenue).length >
                      0 && (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                          Top 10 agences par revenu
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart
                            data={prepareTopAgenciesData(
                              statistics.top_agencies_by_revenue
                            )}
                            layout="vertical"
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis
                              dataKey="agency"
                              type="category"
                              width={150}
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
                    )}

                  {/* Top agencies by reservations */}
                  {statistics.top_agencies_by_reservations &&
                    Object.keys(statistics.top_agencies_by_reservations)
                      .length > 0 && (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                          Top 10 agences par réservations
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart
                            data={prepareTopAgenciesData(
                              statistics.top_agencies_by_reservations
                            )}
                            layout="vertical"
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis
                              dataKey="agency"
                              type="category"
                              width={150}
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
                    )}
                </div>
              </>
            ) : null}

            {/* Bottom Cards - Agences and Organizations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Agences Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Building className="w-5 h-5 text-[#6149CD]" />
                    <h3 className="text-lg font-bold text-gray-900">
                      Agences validées
                    </h3>
                  </div>
                  <button
                    onClick={() =>
                      bsm_data?.address && fetchAgences(bsm_data.address)
                    }
                    disabled={is_loading_agences}
                    className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
                  >
                    <RefreshCw
                      className={`w-4 h-4 text-gray-600 ${
                        is_loading_agences ? "animate-spin" : ""
                      }`}
                    />
                  </button>
                </div>

                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher"
                      value={agences_search}
                      onChange={(e) => setAgencesSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 placeholder:text-gray-600 text-black border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent"
                    />
                  </div>
                </div>

                {is_loading_agences ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 text-[#6149CD] animate-spin" />
                  </div>
                ) : (
                  <>
                    {agences.length === 0 ? (
                      <div className="text-center py-8">
                        <Building className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Aucune agence trouvée</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3 mb-4">
                          {agences
                            .filter(
                              (agence) =>
                                agence.long_name
                                  .toLowerCase()
                                  .includes(agences_search.toLowerCase()) ||
                                agence.short_name
                                  .toLowerCase()
                                  .includes(agences_search.toLowerCase())
                            )
                            .map((agence) => (
                              <div
                                key={agence.agency_id}
                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                              >
                                <h4 className="font-semibold text-sm text-gray-900 mb-1">
                                  Nom de l'agence : {agence.long_name}
                                </h4>
                                <p className="text-xs text-gray-600 mb-1">
                                  Abriévation : {agence.short_name}
                                </p>
                                <p className="text-xs text-gray-500 mb-1">
                                  Ville : {agence.ville}
                                </p>
                                <p className="text-xs text-gray-500 mb-1">
                                  Zone dans la ville : {agence.location}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Réseau social : {agence.social_network}
                                </p>
                              </div>
                            ))}
                        </div>
                      </>
                    )}

                    {agences_total_pages > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <button
                          onClick={() =>
                            setAgencesPage(Math.max(0, agences_page - 1))
                          }
                          disabled={agences_page === 0}
                          className="p-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-gray-600">
                          {agences_page + 1} / {agences_total_pages}
                        </span>
                        <button
                          onClick={() =>
                            setAgencesPage(
                              Math.min(
                                agences_total_pages - 1,
                                agences_page + 1
                              )
                            )
                          }
                          disabled={agences_page === agences_total_pages - 1}
                          className="p-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Organizations Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-5 h-5 text-[#6149CD]" />
                    <h3 className="text-lg font-bold text-gray-900">
                      Organisations
                    </h3>
                  </div>
                  <button
                    onClick={fetchOrganizations}
                    disabled={is_loading_orgs}
                    className="p-2 hover:bg-gray-100 active:bg-gray-200  rounded-lg transition-colors"
                  >
                    <RefreshCw
                      className={`w-4 h-4 text-gray-600 ${
                        is_loading_orgs ? "animate-spin" : ""
                      }`}
                    />
                  </button>
                </div>

                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher"
                      value={orgs_search}
                      onChange={(e) => setOrgsSearch(e.target.value)}
                      className="w-full pl-10 pr-4 placeholder:text-gray-600 text-black py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent"
                    />
                  </div>
                </div>

                {is_loading_orgs ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 text-[#6149CD] animate-spin" />
                  </div>
                ) : (
                  <>
                    {organizations.length === 0 ? (
                      <div className="text-center py-8">
                        <Briefcase className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">
                          Aucune organisation trouvée
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3 mb-4">
                          {organizations
                            .filter(
                              (org) =>
                                org.long_name
                                  .toLowerCase()
                                  .includes(orgs_search.toLowerCase()) ||
                                org.short_name
                                  .toLowerCase()
                                  .includes(orgs_search.toLowerCase())
                            )
                            .slice(
                              orgs_page * ITEMS_PER_PAGE,
                              (orgs_page + 1) * ITEMS_PER_PAGE
                            )
                            .map((org) => (
                              <div
                                key={org.organization_id}
                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                              >
                                <h4 className="font-semibold text-sm text-gray-900 mb-1">
                                  Nom de l'organisation : {org.long_name}
                                </h4>
                                <p className="text-xs text-gray-600 mb-1">
                                  Abreviation : {org.short_name}
                                </p>
                                <p className="text-xs text-gray-500 mb-1">
                                  Contact : {org.email}
                                </p>
                                <p className="text-xs text-gray-500 mb-1">
                                  Nom du fondateur :{" "}
                                  {org.ceo_name || "Non renseigné"}
                                </p>
                                <p className="text-xs text-gray-500 mb-1">
                                  Réseau social :{" "}
                                  {org.social_network || "Non renseigné"}
                                </p>
                                <p className="text-xs text-gray-500 mb-1">
                                  Numéro d'enregistrement de l'entreprises :{" "}
                                  {org.business_registration_number}
                                </p>
                                <p className="text-xs text-gray-500 mb-1">
                                  Date de création : Le{" "}
                                  {formatDate(org.created_at)}
                                </p>
                              </div>
                            ))}
                        </div>
                      </>
                    )}
                    {orgs_total_pages > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <button
                          onClick={() =>
                            setOrgsPage(Math.max(0, orgs_page - 1))
                          }
                          disabled={orgs_page === 0}
                          className="p-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-gray-600">
                          {orgs_page + 1} / {orgs_total_pages}
                        </span>
                        <button
                          onClick={() =>
                            setOrgsPage(
                              Math.min(orgs_total_pages - 1, orgs_page + 1)
                            )
                          }
                          disabled={orgs_page === orgs_total_pages - 1}
                          className="p-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-4 h-4" />
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
