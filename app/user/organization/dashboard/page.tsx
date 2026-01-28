"use client";

import React, { useState, useEffect } from "react";
import {
  Home,
  Building2,
  Settings,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Briefcase,
  Users,
  Car,
  MapPin,
  TrendingUp,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Award,
  Eye,
  Trash2,
  AlertCircle,
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

/**
 * Login Page Component
 *
 * A responsive login page with username/password authentication
 * Features an image carousel on the right side
 *
 * @author Thomas Djotio Ndié
 * @date 2025-12-16
 */

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
  token: string;
}

export default function DGDashboardPage() {
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

  const [show_profile_menu, setShowProfileMenu] = useState(false);
  const [show_mobile_menu, setShowMobileMenu] = useState(false);
  const [user_data, setUserData] = useState<UserData | null>(null);

  const [agencies_search, setAgenciesSearch] = useState("");
  const [agencies_page, setAgenciesPage] = useState(1);
  const agencies_per_page = 5;

  const [orgs_search, setOrgsSearch] = useState("");
  const [orgs_page, setOrgsPage] = useState(1);
  const orgs_per_page = 5;

  const [show_delete_org_modal, setShowDeleteOrgModal] = useState(false);
  const [show_delete_agency_modal, setShowDeleteAgencyModal] = useState(false);
  const [delete_target_id, setDeleteTargetId] = useState("");
  const [delete_target_name, setDeleteTargetName] = useState("");
  const [is_deleting, setIsDeleting] = useState(false);

  const [show_org_selector, setShowOrgSelector] = useState(false);

  const [show_success_modal, setShowSuccessModal] = useState(false);
  const [show_error_modal, setShowErrorModal] = useState(false);
  const [success_message, setSuccessMessage] = useState("");
  const [error_modal_message, setErrorModalMessage] = useState("");
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const BUTTON_COLOR = "#6149CD";
  const CHART_COLORS = {
    primary: "#6149CD",
    secondary: "#8B7BE8",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#3B82F6",
  };

  const MENU_ITEMS = [
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
      const parsed_user = JSON.parse(stored_user_data);
      setUserData(parsed_user);
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

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des organisations");
      }

      const data = await response.json();

      console.log(data);

      const my_orgs = data.filter(
        (org: Organization) => org.created_by === user_data?.userId,
      );

      setOrganizations(my_orgs);

      if (my_orgs.length > 0 && !selected_organization) {
        setSelectedOrganization(my_orgs[0]);
      }

      if (my_orgs.length === 0) {
        setIsLoadingStats(false);
        setErrorMessage("Vous n'avez pas encore créé d'organisation");
      }
    } catch (error: any) {
      console.error("Fetch Organizations Error:", error);
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

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des statistiques");
      }

      const data = await response.json();
      setGeneralStats(data);
    } catch (error: any) {
      console.error("Fetch General Stats Error:", error);
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

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des agences");
      }

      const data = await response.json();

      console.log(data);
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

      fetchOrganizations();

      setSuccessMessage("Organisation supprimée avec succès !");
      setShowSuccessModal(true);
    } catch (error: any) {
      setErrorModalMessage("Erreur lors de la suppression de l'organisation, vérifiez qu'elle ne contient pas d'agences actives.");
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

      setSuccessMessage("Agence supprimée avec succès !");
      setShowSuccessModal(true);
    } catch (error: any) {
      setErrorModalMessage("Erreur lors de la suppression de l'agence");
      setShowErrorModal(true);
      console.error("Delete Agency Error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("user_data");
    router.push("/login");
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

  const getStatusBadge = (status: string) => {
    const styles = {
      VALIDEE: "bg-green-100 text-green-800",
      EN_ATTENTE: "bg-orange-100 text-orange-800",
      REJETEE: "bg-red-100 text-red-800",
    };
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800";
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

  const prepareMonthlyData = (data: { [key: string]: number }) => {
    return Object.entries(data).map(([month, value]) => ({
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

  const prepareAgencyData = (data: { [key: string]: number }) => {
    return Object.entries(data).map(([agency, value]) => ({
      agency,
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <>
        <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200 fixed h-full">
          <div className="p-6">
            <div className="mb-8">
              <button
                onClick={() => router.push("/user/organization/dashboard")}
                className="group relative transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-linear-to-r from-[#6149CD] to-[#8B7BE8] rounded-lg opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300"></div>
                <img
                  src="/images/busstation.png"
                  alt="BusStation Logo"
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
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setShowMobileMenu(false)}
            ></div>

            <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-2xl z-50 lg:hidden transform transition-transform duration-300">
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      router.push("/user/organization/dashboard");
                    }}
                    className="group relative transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    <img
                      src="/images/busstation.png"
                      alt="BusStation Logo"
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
      <div className="flex-1 lg:ml-64 min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => setShowMobileMenu(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
              </button>
              <h1 className="text-lg sm:text-2xl font-semibold text-gray-900">
                Dashboard
              </h1>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={handleRefresh}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Actualiser"
              >
                <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
              </button>

              <button
                onClick={() => router.push("/user/organization/settings")}
                className="hidden sm:block p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-6 h-6 text-gray-600" />
              </button>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!show_profile_menu)}
                  className="flex items-center space-x-2 sm:space-x-3 hover:bg-gray-100 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 transition-colors"
                >
                  <img
                    src="/images/user-icon.png"
                    alt="Profile"
                    className="w-7 h-7 sm:w-8.5 sm:h-8.5 rounded-full object-cover"
                  />
                  <span className="font-medium text-gray-900 hidden md:block text-sm sm:text-base">
                    {user_data?.username}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-600 hidden sm:block" />
                </button>

                {show_profile_menu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowProfileMenu(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          router.push("/user/organization/settings");
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
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-3 sm:p-4 md:p-6">
          {/* Loading State */}
          {(is_loading_orgs || is_loading_stats) &&
            organizations.length === 0 && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 text-[#6149CD] animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Chargement en cours...</p>
                </div>
              </div>
            )}

          {/* No Organizations State */}
          {!is_loading_orgs && organizations.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-12 text-center">
              <Briefcase className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Aucune organisation
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                Vous n'avez pas encore créé d'organisation
              </p>
              <button
                onClick={() => router.push("/user/organization/organisation")}
                style={{ backgroundColor: BUTTON_COLOR }}
                className="px-4 sm:px-6 py-2.5 sm:py-3 text-white rounded-lg hover:opacity-90 transition-opacity text-sm sm:text-base"
              >
                Créer une organisation
              </button>
            </div>
          )}

          {/* Main Dashboard Content */}
          {!is_loading_orgs && organizations.length > 0 && (
            <div className="space-y-4 sm:space-y-6">
              {/* Organization Selector */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 sm:p-3 bg-linear-to-br from-[#6149CD] to-[#8B7BE8] rounded-lg sm:rounded-xl">
                      <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-600">
                        Organisation sélectionnée
                      </p>
                      <h2 className="text-base sm:text-xl font-bold text-gray-900 truncate">
                        {selected_organization?.long_name || "Aucune"}
                      </h2>
                    </div>
                  </div>

                  {organizations.length > 1 && (
                    <div className="relative">
                      <button
                        onClick={() => setShowOrgSelector(!show_org_selector)}
                        className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-gray-700 text-sm sm:text-base">
                          Changer
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                      </button>

                      {show_org_selector && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowOrgSelector(false)}
                          ></div>
                          <div className="absolute right-0 sm:right-0 left-0 sm:left-auto mt-2 w-full sm:w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 max-h-60 overflow-y-auto">
                            {organizations.map((org) => (
                              <button
                                key={org.id}
                                onClick={() => handleSelectOrganization(org)}
                                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                                  selected_organization?.id === org.id
                                    ? "bg-purple-50 border-l-4 border-[#6149CD]"
                                    : ""
                                }`}
                              >
                                <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                                  {org.long_name}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-600">
                                  {org.short_name}
                                </p>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Loading Stats */}
              {is_loading_stats && (
                <div className="flex items-center justify-center py-10">
                  <RefreshCw className="w-8 h-8 text-[#6149CD] animate-spin" />
                </div>
              )}

              {/* Error Message */}
              {error_message && !is_loading_stats && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 text-center">
                  <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 text-sm sm:text-base">
                    {error_message}
                  </p>
                  <button
                    onClick={handleRefresh}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
                  >
                    Réessayer
                  </button>
                </div>
              )}

              {/* Stats Content */}
              {!is_loading_stats && !error_message && general_stats && (
                <>
                  {/* Top Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
                      <div className="flex items-center justify-between mb-2 sm:mb-4">
                        <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                          <Building2 className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
                        </div>
                      </div>
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                        {general_stats.total_agencies}
                      </h3>
                      <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">
                        Total des agences
                      </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
                      <div className="flex items-center justify-between mb-2 sm:mb-4">
                        <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                          <Users className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
                        </div>
                      </div>
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                        {general_stats.total_employees}
                      </h3>
                      <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">
                        Total des employés
                      </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
                      <div className="flex items-center justify-between mb-2 sm:mb-4">
                        <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
                          <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
                        </div>
                      </div>
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                        {general_stats.total_trips}
                      </h3>
                      <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">
                        Total des voyages
                      </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
                      <div className="flex items-center justify-between mb-2 sm:mb-4">
                        <div className="p-2 sm:p-3 bg-orange-100 rounded-lg">
                          <Car className="w-4 h-4 sm:w-6 sm:h-6 text-orange-600" />
                        </div>
                      </div>
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                        {general_stats.total_vehicles}
                      </h3>
                      <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">
                        Total des véhicules
                      </p>
                    </div>
                  </div>

                  {/* Additional Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                    <div className="bg-linear-to-br from-green-400 to-green-600 rounded-xl shadow-lg p-4 sm:p-6 text-white">
                      <div className="flex items-center justify-between mb-2 sm:mb-4">
                        <h3 className="text-sm sm:text-lg font-semibold">
                          Revenu total potentiel
                        </h3>
                        <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <p className="text-lg sm:text-2xl md:text-3xl font-bold break-all">
                        {formatRevenue(general_stats.total_revenue)}
                      </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                      <h3 className="text-gray-600 mb-2 text-xs sm:text-base">
                        Total réservations
                      </h3>
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                        {general_stats.total_reservations}
                      </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 sm:col-span-2 md:col-span-1">
                      <h3 className="text-gray-600 mb-2 text-xs sm:text-base">
                        Villes couvertes
                      </h3>
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                        {general_stats.cities_covered}
                      </p>
                    </div>
                  </div>

                  {/* Overview Card */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                      Aperçu général
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <p className="text-gray-600 mb-2 text-sm sm:text-base">
                          Conducteurs actifs
                        </p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900">
                          {general_stats.total_drivers}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-2 text-sm sm:text-base">
                          Taux d'occupation moyen
                        </p>
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                              <div
                                className="bg-[#6149CD] h-2 sm:h-3 rounded-full transition-all duration-300"
                                style={{
                                  width: `${general_stats.average_occupancy_rate}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-lg sm:text-2xl font-bold text-gray-900">
                            {general_stats.average_occupancy_rate.toFixed(3)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Best Performing Agency */}
                  {agencies_stats?.best_performing_agency_name && (
                    <div className="bg-linear-to-r from-yellow-400 to-orange-500 rounded-xl shadow-lg p-4 sm:p-6 text-white">
                      <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                        <Award className="w-5 h-5 sm:w-6 sm:h-6" />
                        <h3 className="text-sm sm:text-lg font-semibold">
                          Meilleure agence performante
                        </h3>
                      </div>
                      <p className="text-lg sm:text-2xl font-bold">
                        {agencies_stats.best_performing_agency_name}
                      </p>
                    </div>
                  )}

                  {/* Charts Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Réservations par mois */}
                    {general_stats.reservations_per_month && (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                          Réservations par mois
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart
                            data={prepareMonthlyData(
                              general_stats.reservations_per_month,
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

                    {/* Monthly Revenue */}
                    {general_stats.revenue_per_month && (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                          Revenu par mois
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart
                            data={prepareMonthlyData(
                              general_stats.revenue_per_month,
                            )}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip
                              formatter={(value: number | undefined) =>
                                value !== undefined
                                  ? formatRevenue(value)
                                  : "0 XAF"
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

                    {/* Reservations by Status
                    {general_stats.reservations_by_status && (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                          Réservations par statut
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={prepareStatusData(
                                general_stats.reservations_by_status
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
                                general_stats.reservations_by_status
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
                    {general_stats.trips_by_status && (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                          Voyages par statut
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={prepareStatusData(
                                general_stats.trips_by_status
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
                                general_stats.trips_by_status
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

                    {/* Revenue by Agency */}
                    {general_stats.revenue_by_agency && (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                          Revenu par agence
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart
                            data={prepareAgencyData(
                              general_stats.revenue_by_agency,
                            )}
                            layout="vertical"
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis
                              dataKey="agency"
                              type="category"
                              width={100}
                            />
                            <Tooltip
                              formatter={(value: number | undefined) =>
                                value !== undefined
                                  ? formatRevenue(value)
                                  : "0 XAF"
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

                    {/* Reservations by Agency */}
                    {general_stats.reservations_by_agency && (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                          Réservations par agence
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart
                            data={prepareAgencyData(
                              general_stats.reservations_by_agency,
                            )}
                            layout="vertical"
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis
                              dataKey="agency"
                              type="category"
                              width={100}
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

                  {/* Agencies List */}
                  {agencies_stats && agencies_stats.agencies.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                          Nos agences
                        </h3>
                        <div className="relative w-full sm:w-auto">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Rechercher..."
                            value={agencies_search}
                            onChange={(e) => {
                              setAgenciesSearch(e.target.value);
                              setAgenciesPage(1);
                            }}
                            className="w-full sm:w-auto pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent text-gray-800 placeholder:text-gray-400 text-sm sm:text-base"
                          />
                        </div>
                      </div>

                      <div className="space-y-3 sm:space-y-4">
                        {paginated_agencies.map((agency) => (
                          <div
                            key={agency.agency_id}
                            className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0 mb-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <h4 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                                    {agency.agency_name}
                                  </h4>
                                  <span className="text-xs sm:text-sm text-gray-600">
                                    ({agency.short_name})
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 text-gray-600">
                                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                                  <span className="text-sm sm:text-base truncate">
                                    {agency.ville}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <span
                                  className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${getStatusBadge(
                                    agency.statut_validation,
                                  )}`}
                                >
                                  {agency.statut_validation}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-3">
                              <div>
                                <p className="text-xs text-gray-600">
                                  Employés
                                </p>
                                <p className="text-base sm:text-lg font-semibold text-gray-900">
                                  {agency.number_of_employees}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">
                                  Véhicules
                                </p>
                                <p className="text-base sm:text-lg font-semibold text-gray-900">
                                  {agency.number_of_vehicles}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Voyages</p>
                                <p className="text-base sm:text-lg font-semibold text-gray-900">
                                  {agency.number_of_trips}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Revenu</p>
                                <p className="text-sm sm:text-lg font-semibold text-gray-900 break-all">
                                  {formatRevenue(agency.total_revenue)}
                                </p>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center space-x-2 pt-3 border-t border-gray-200">
                              <button
                                onClick={() =>
                                  router.push(
                                    `/user/organization/detail_agency?id=${agency.agency_id}`,
                                  )
                                }
                                style={{ backgroundColor: BUTTON_COLOR }}
                                className="p-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                                title="Voir détails"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteTargetId(agency.agency_id);
                                  setDeleteTargetName(agency.agency_name);
                                  setShowDeleteAgencyModal(true);
                                }}
                                className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pagination */}
                      {total_agencies_pages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 sm:mt-6">
                          <button
                            onClick={() =>
                              setAgenciesPage((p) => Math.max(1, p - 1))
                            }
                            disabled={agencies_page === 1}
                            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                          >
                            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>Précédent</span>
                          </button>

                          <span className="text-gray-600 text-sm sm:text-base order-first sm:order-0">
                            Page {agencies_page} sur {total_agencies_pages}
                          </span>

                          <button
                            onClick={() =>
                              setAgenciesPage((p) =>
                                Math.min(total_agencies_pages, p + 1),
                              )
                            }
                            disabled={agencies_page === total_agencies_pages}
                            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                          >
                            <span>Suivant</span>
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Organizations List */}
              {organizations.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                      Mes organisations ({organizations.length})
                    </h3>
                    <div className="relative w-full sm:w-auto">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher..."
                        value={orgs_search}
                        onChange={(e) => {
                          setOrgsSearch(e.target.value);
                          setOrgsPage(1);
                        }}
                        className="w-full sm:w-auto pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent text-gray-800 placeholder:text-gray-400 text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-gray-600 font-semibold text-sm">
                            Nom complet
                          </th>
                          <th className="text-left py-3 px-4 text-gray-600 font-semibold text-sm">
                            Abréviation
                          </th>
                          <th className="text-left py-3 px-4 text-gray-600 font-semibold text-sm">
                            Email
                          </th>
                          <th className="text-left py-3 px-4 text-gray-600 font-semibold text-sm">
                            Dirigeant
                          </th>
                          <th className="text-left py-3 px-4 text-gray-600 font-semibold text-sm">
                            Date création
                          </th>
                          <th className="text-left py-3 px-4 text-gray-600 font-semibold text-sm">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginated_orgs.map((org) => (
                          <tr
                            key={org.id}
                            className={`border-b border-gray-100 hover:bg-gray-50 ${
                              selected_organization?.id === org.id
                                ? "bg-purple-50"
                                : ""
                            }`}
                          >
                            <td className="py-3 px-4 text-gray-900 font-medium text-sm">
                              <span className="truncate block max-w-50">
                                {org.long_name}
                              </span>
                              {selected_organization?.id === org.id && (
                                <span className="ml-2 px-2 py-1 bg-[#6149CD] text-white text-xs rounded-full">
                                  Sélectionnée
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-gray-600 text-sm">
                              {org.short_name}
                            </td>
                            <td className="py-3 px-4 text-gray-600 text-sm">
                              <span className="truncate block max-w-37.5">
                                {org.email}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-600 text-sm">
                              {org.ceo_name}
                            </td>
                            <td className="py-3 px-4 text-gray-600 text-sm whitespace-nowrap">
                              {formatDate(org.created_at)}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() =>
                                    router.push(
                                      `/user/organization/detail_organization?id=${org.id}`,
                                    )
                                  }
                                  style={{ backgroundColor: BUTTON_COLOR }}
                                  className="p-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                                  title="Voir détails"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setDeleteTargetId(org.id);
                                    setDeleteTargetName(org.long_name);
                                    setShowDeleteOrgModal(true);
                                  }}
                                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-3">
                    {paginated_orgs.map((org) => (
                      <div
                        key={org.id}
                        className={`border border-gray-200 rounded-lg p-3 ${
                          selected_organization?.id === org.id
                            ? "bg-purple-50 border-purple-200"
                            : ""
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 text-sm truncate">
                              {org.long_name}
                            </h4>
                            <p className="text-xs text-gray-600">
                              {org.short_name}
                            </p>
                          </div>
                          {selected_organization?.id === org.id && (
                            <span className="px-2 py-1 bg-[#6149CD] text-white text-xs rounded-full shrink-0 ml-2">
                              Sélectionnée
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 mb-3 text-xs">
                          <p className="text-gray-600 truncate">
                            <span className="font-medium">Email:</span>{" "}
                            {org.email}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium">Dirigeant:</span>{" "}
                            {org.ceo_name}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium">Créée le:</span>{" "}
                            {formatDate(org.created_at)}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2 pt-2 border-t border-gray-200">
                          <button
                            onClick={() =>
                              router.push(
                                `/user/organization/detail_organization?id=${org.id}`,
                              )
                            }
                            style={{ backgroundColor: BUTTON_COLOR }}
                            className="flex-1 flex items-center justify-center space-x-1 p-2 text-white rounded-lg hover:opacity-90 transition-opacity text-xs"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Détails</span>
                          </button>
                          <button
                            onClick={() => {
                              setDeleteTargetId(org.organization_id);
                              setDeleteTargetName(org.long_name);
                              setShowDeleteOrgModal(true);
                            }}
                            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {total_orgs_pages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 sm:mt-6">
                      <button
                        onClick={() => setOrgsPage((p) => Math.max(1, p - 1))}
                        disabled={orgs_page === 1}
                        className="w-full sm:w-auto flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                      >
                        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Précédent</span>
                      </button>

                      <span className="text-gray-600 text-sm sm:text-base order-first sm:order-0">
                        Page {orgs_page} sur {total_orgs_pages}
                      </span>

                      <button
                        onClick={() =>
                          setOrgsPage((p) => Math.min(total_orgs_pages, p + 1))
                        }
                        disabled={orgs_page === total_orgs_pages}
                        className="w-full sm:w-auto flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                      >
                        <span>Suivant</span>
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Delete Organization Modal */}
      {show_delete_org_modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-600" />
            </div>

            <p className="text-gray-700 mb-6 text-sm sm:text-base text-center">
              Êtes-vous sûr de vouloir supprimer l'organisation{" "}
              <span className="font-bold">{delete_target_name}</span> ?
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => setShowDeleteOrgModal(false)}
                disabled={is_deleting}
                className="w-full sm:flex-1 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 text-sm sm:text-base"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteOrganization}
                disabled={is_deleting}
                className="w-full sm:flex-1 py-2.5 sm:py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
              >
                {is_deleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Agency Modal */}
      {show_delete_agency_modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-600" />
            </div>

            <p className="text-gray-700 mb-6 text-sm sm:text-base text-center">
              Êtes-vous sûr de vouloir supprimer l'agence{" "}
              <span className="font-bold">{delete_target_name}</span> ?
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => setShowDeleteAgencyModal(false)}
                disabled={is_deleting}
                className="w-full sm:flex-1 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 text-sm sm:text-base"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteAgency}
                disabled={is_deleting}
                className="w-full sm:flex-1 py-2.5 sm:py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
              >
                {is_deleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Success Modal */}
      {show_success_modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Succès !
              </h2>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                {success_message}
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-2.5 sm:py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors text-sm sm:text-base"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {show_error_modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Erreur
              </h2>
              <div className="bg-red-50 rounded-xl p-4 mb-6">
                <p className="text-sm sm:text-base text-red-800">
                  {error_modal_message}
                </p>
              </div>
              <button
                onClick={() => {setShowErrorModal(false); setShowDeleteAgencyModal(false); setShowDeleteOrgModal(false);}}
                className="w-full py-2.5 sm:py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors text-sm sm:text-base"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
