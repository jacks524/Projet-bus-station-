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
  ArrowLeft,
  Edit,
  Save,
  XCircle as CancelIcon,
  Trash2,
  AlertCircle,
  CheckCircle,
  MapPin,
  Building,
  Globe,
  MessageSquare,
  RefreshCw,
  Users,
  Car,
  TrendingUp,
  Calendar,
  Bus,
  Ticket,
  UserPlus,
  BarChart3,
  PieChart,
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
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useRouter, useSearchParams } from "next/navigation";

interface AgencyData {
  agency_id: string;
  organisation_id: string;
  user_id: string;
  long_name: string;
  short_name: string;
  location: string;
  ville: string;
  social_network: string;
  description: string;
  greeting_message: string;
  statut_validation: string;
  date_validation: string;
  bsm_validator_id: string;
  motif_rejet: string;
  created_at: string;
}

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

interface UserData {
  username: string;
  userId: string;
}

export default function DetailAgencyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const agency_id = searchParams.get("id");

  const [agency, setAgency] = useState<AgencyData | null>(null);
  const [edit_mode, setEditMode] = useState(false);
  const [form_data, setFormData] = useState<Partial<AgencyData>>({});

  const [is_loading, setIsLoading] = useState(true);
  const [is_saving, setIsSaving] = useState(false);
  const [is_deleting, setIsDeleting] = useState(false);

  const [show_delete_modal, setShowDeleteModal] = useState(false);
  const [show_success_modal, setShowSuccessModal] = useState(false);
  const [show_error_modal, setShowErrorModal] = useState(false);
  const [error_message, setErrorMessage] = useState("");

  const [show_profile_menu, setShowProfileMenu] = useState(false);
  const [show_mobile_menu, setShowMobileMenu] = useState(false);
  const [user_data, setDgData] = useState<UserData | null>(null);

  const [general_stats, setGeneralStats] = useState<GeneralStatistics | null>(
    null,
  );
  const [evolution_stats, setEvolutionStats] =
    useState<EvolutionStatistics | null>(null);
  const [is_loading_stats, setIsLoadingStats] = useState(false);
  const [active_chart, setActiveChart] = useState<
    "reservations" | "voyages" | "revenus" | "utilisateurs"
  >("reservations");

  const API_BASE_URL = "http://localhost:8081/api";
  const BUTTON_COLOR = "#6149CD";
  const CHART_COLORS = ["#6149CD", "#8B7BE8", "#A594F9", "#C4B5FD", "#E9E3FF"];
  const PIE_COLORS = ["#10B981", "#F59E0B", "#EF4444", "#6366F1", "#8B5CF6"];

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
      setDgData(parsed_user);
    }

    if (agency_id) {
      fetchAgencyDetails();
    }
  }, [agency_id]);

  useEffect(() => {
    if (agency?.agency_id) {
      fetchGeneralStatistics(agency.agency_id);
      fetchEvolutionStatistics(agency.agency_id);
    }
  }, [agency?.agency_id]);

  const fetchAgencyDetails = async () => {
    setIsLoading(true);
    try {
      const auth_token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
      const response = await fetch(`${API_BASE_URL}/agence/${agency_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth_token}`,
        },
      });

      if (!response.ok) throw new Error("Erreur lors du chargement");

      const data = await response.json();
      setAgency(data);
      setFormData(data);
    } catch (error: any) {
      setErrorMessage("Impossible de charger les détails de l'agence");
      setShowErrorModal(true);
      console.error("Fetch Agency Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGeneralStatistics = async (agence_id: string) => {
    setIsLoadingStats(true);
    try {
      const auth_token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
      const response = await fetch(
        `${API_BASE_URL}/statistics/agence/${agence_id}/general`,
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
      console.error("Fetch General Stats Error:", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const fetchEvolutionStatistics = async (agence_id: string) => {
    try {
      const auth_token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
      const response = await fetch(
        `${API_BASE_URL}/statistics/agence/${agence_id}/evolution`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth_token}`,
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      const auth_token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");

      const update_body = {
        organisation_id: form_data.organisation_id,
        user_id: form_data.user_id,
        long_name: form_data.long_name,
        short_name: form_data.short_name,
        location: form_data.location,
        ville: form_data.ville,
        social_network: form_data.social_network,
        description: form_data.description,
        greeting_message: form_data.greeting_message,
      };

      const response = await fetch(`${API_BASE_URL}/agence/${agency_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth_token}`,
        },
        body: JSON.stringify(update_body),
      });

      if (!response.ok) throw new Error("Erreur lors de la mise à jour");

      setShowSuccessModal(true);
      setEditMode(false);
      fetchAgencyDetails();
    } catch (error: any) {
      setErrorMessage("Erreur lors de la mise à jour de l'agence");
      setShowErrorModal(true);
      console.error("Update Agency Error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const auth_token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
      const response = await fetch(`${API_BASE_URL}/agence/${agency_id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${auth_token}`,
        },
      });

      if (!response.ok) throw new Error("Erreur lors de la suppression");

      router.push("/user/organization/dashboard");
    } catch (error: any) {
      setErrorMessage("Erreur lors de la suppression de l'agence");
      setShowErrorModal(true);
      console.error("Delete Agency Error:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("user_data");
    router.push("/login");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Non renseigné";
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

  if (is_loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Settings className="w-12 h-12 text-[#6149CD] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Agence introuvable</p>
          <button
            onClick={() => router.push("/user/organization/dashboard")}
            style={{ backgroundColor: BUTTON_COLOR }}
            className="mt-4 px-6 py-2 text-white rounded-lg hover:opacity-90"
          >
            Retour au dashboard
          </button>
        </div>
      </div>
    );
  }

  const formatRevenue = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  };

  const getChartData = () => {
    if (!evolution_stats) return [];

    switch (active_chart) {
      case "reservations":
        return (
          evolution_stats.evolutionReservations?.map((item) => ({
            date: formatDateShort(item.date),
            valeur: item.valeur,
            montant: item.montant,
          })) || []
        );
      case "voyages":
        return (
          evolution_stats.evolutionVoyages?.map((item) => ({
            date: formatDateShort(item.date),
            valeur: item.valeur,
            montant: item.montant,
          })) || []
        );
      case "revenus":
        return (
          evolution_stats.evolutionRevenus?.map((item) => ({
            date: formatDateShort(item.date),
            valeur: item.valeur,
            montant: item.montant,
          })) || []
        );
      case "utilisateurs":
        return (
          evolution_stats.evolutionUtilisateurs?.map((item) => ({
            date: formatDateShort(item.date),
            valeur: item.valeur,
            montant: item.montant,
          })) || []
        );
      default:
        return [];
    }
  };

  const getChartTitle = () => {
    switch (active_chart) {
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
    const daysOrder = [
      "Lundi",
      "Mardi",
      "Mercredi",
      "Jeudi",
      "Vendredi",
      "Samedi",
      "Dimanche",
    ];
    return daysOrder
      .map((day) => ({
        day,
        value: data[day] || 0,
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200 fixed h-full">
        <div className="p-6">
          <div className="mb-8">
            <button
              onClick={() => router.push("/user/organization/dashboard")}
              className="group relative transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <img
                src="/images/busstation.png"
                alt="SafaraPlace Logo"
                className="h-12 w-auto"
              />
            </button>
          </div>

          <nav className="space-y-1">
            {MENU_ITEMS.map((item, index) => (
              <button
                key={index}
                onClick={() => router.push(item.path)}
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

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push("/user/organization/dashboard")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-900" />
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">
                Détails de l'agence
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {!edit_mode ? (
                <>
                  <button
                    onClick={() => {
                      if (agency?.agency_id) {
                        fetchGeneralStatistics(agency.agency_id);
                        fetchEvolutionStatistics(agency.agency_id);
                      }
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Actualiser les statistiques"
                  >
                    <RefreshCw className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => setEditMode(true)}
                    style={{ backgroundColor: BUTTON_COLOR }}
                    className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Modifier</span>
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Supprimer</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleUpdate}
                    disabled={is_saving}
                    style={{ backgroundColor: BUTTON_COLOR }}
                    className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>
                      {is_saving ? "Enregistrement..." : "Enregistrer"}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setFormData(agency);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <CancelIcon className="w-4 h-4" />
                    <span>Annuler</span>
                  </button>
                </>
              )}

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
                    {user_data?.username}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>

                {show_profile_menu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <button
                      onClick={() => router.push("/user/organization/settings")}
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
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Agency Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                    style={{ backgroundColor: BUTTON_COLOR }}
                  >
                    {agency.short_name?.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {agency.long_name}
                    </h2>
                    <p className="text-gray-600">{agency.short_name}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">{agency.ville}</span>
                    </div>
                  </div>
                </div>

                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadge(
                    agency.statut_validation,
                  )}`}
                >
                  {agency.statut_validation}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">ID Agence :</span>{" "}
                  {agency.agency_id}
                </p>
              </div>
            </div>

            {/* Section 1: Informations principales */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <Building className="w-6 h-6 text-[#6149CD]" />
                <span>Informations principales</span>
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      name="long_name"
                      value={form_data.long_name || ""}
                      onChange={handleInputChange}
                      disabled={!edit_mode}
                      className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Abréviation
                    </label>
                    <input
                      type="text"
                      name="short_name"
                      value={form_data.short_name || ""}
                      onChange={handleInputChange}
                      disabled={!edit_mode}
                      className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Localisation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <MapPin className="w-6 h-6 text-[#6149CD]" />
                <span>Localisation</span>
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ville
                    </label>
                    <input
                      type="text"
                      name="ville"
                      value={form_data.ville || ""}
                      onChange={handleInputChange}
                      disabled={!edit_mode}
                      className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Zone/Quartier
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={form_data.location || ""}
                      onChange={handleInputChange}
                      disabled={!edit_mode}
                      className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Informations supplémentaires */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <Globe className="w-6 h-6 text-[#6149CD]" />
                <span>Informations supplémentaires</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Réseau social
                  </label>
                  <input
                    type="text"
                    name="social_network"
                    value={form_data.social_network || ""}
                    onChange={handleInputChange}
                    disabled={!edit_mode}
                    placeholder="https://facebook.com/agence"
                    className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-[#6149CD]" />
                    <span>Message d'accueil</span>
                  </label>
                  <textarea
                    name="greeting_message"
                    value={form_data.greeting_message || ""}
                    onChange={handleInputChange}
                    disabled={!edit_mode}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] disabled:bg-gray-50 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form_data.description || ""}
                    onChange={handleInputChange}
                    disabled={!edit_mode}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] disabled:bg-gray-50 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Informations de validation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Informations de validation
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Statut de validation
                    </label>
                    <span
                      className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadge(
                        agency.statut_validation,
                      )}`}
                    >
                      {agency.statut_validation}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date de validation
                    </label>
                    <p className="text-gray-900">
                      {formatDate(agency.date_validation)}
                    </p>
                  </div>
                </div>

                {agency.motif_rejet && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Motif de rejet
                    </label>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800">{agency.motif_rejet}</p>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Date de création
                      </label>
                      <p className="text-gray-900">
                        {formatDate(agency.created_at)}
                      </p>
                    </div>

                    {agency.bsm_validator_id && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          ID Validateur BSM
                        </label>
                        <p className="text-gray-900 font-mono text-sm">
                          {agency.bsm_validator_id}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Statistics Section */}
            {agency && general_stats && (
              <>
                {/* Titre de la section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                    <BarChart3 className="w-7 h-7 text-[#6149CD]" />
                    <span>Statistiques de l'agence</span>
                  </h3>
                </div>

                {/* Top Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
                    <div className="flex items-center justify-between mb-2 sm:mb-4">
                      <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                        <Users className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
                      </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                      {general_stats.nombreEmployes}
                    </h3>
                    <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">
                      Employés
                    </p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
                    <div className="flex items-center justify-between mb-2 sm:mb-4">
                      <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                        <Car className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
                      </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                      {general_stats.nombreChauffeurs}
                    </h3>
                    <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">
                      Chauffeurs
                    </p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
                    <div className="flex items-center justify-between mb-2 sm:mb-4">
                      <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
                        <Bus className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
                      </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                      {general_stats.nombreVoyages}
                    </h3>
                    <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">
                      Voyages
                    </p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
                    <div className="flex items-center justify-between mb-2 sm:mb-4">
                      <div className="p-2 sm:p-3 bg-orange-100 rounded-lg">
                        <Ticket className="w-4 h-4 sm:w-6 sm:h-6 text-orange-600" />
                      </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                      {general_stats.nombreReservations}
                    </h3>
                    <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">
                      Réservations
                    </p>
                  </div>
                </div>

                {/* Revenue and Metrics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                  <div className="bg-linear-to-br from-green-400 to-green-600 rounded-xl shadow-lg p-4 sm:p-6 text-white">
                    <div className="flex items-center justify-between mb-2 sm:mb-4">
                      <h3 className="text-sm sm:text-lg Ffont-semibold">
                        Revenus totaux potentiels
                      </h3>
                      <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <p className="text-lg sm:text-2xl md:text-3xl font-bold break-all">
                      {formatRevenue(general_stats.revenus)}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-[#6149CD]" />
                      <h3 className="text-gray-600 text-xs sm:text-base">
                        Nouveaux utilisateurs
                      </h3>
                    </div>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                      {general_stats.nouveauxUtilisateurs}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 sm:col-span-2 md:col-span-1">
                    <h3 className="text-gray-600 mb-2 text-xs sm:text-base">
                      Taux d'occupation
                    </h3>
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                          <div
                            className="bg-[#6149CD] h-2 sm:h-3 rounded-full transition-all duration-300"
                            style={{
                              width: `${general_stats.tauxOccupation}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-lg sm:text-2xl font-bold text-gray-900">
                        {general_stats.tauxOccupation.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Evolution Chart Section */}
                {evolution_stats && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="w-5 h-5 text-[#6149CD]" />
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                          {getChartTitle()}
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setActiveChart("reservations")}
                          className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg transition-colors ${
                            active_chart === "reservations"
                              ? "bg-[#6149CD] text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          Réservations
                        </button>
                        <button
                          onClick={() => setActiveChart("voyages")}
                          className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg transition-colors ${
                            active_chart === "voyages"
                              ? "bg-[#6149CD] text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          Voyages
                        </button>
                        <button
                          onClick={() => setActiveChart("revenus")}
                          className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg transition-colors ${
                            active_chart === "revenus"
                              ? "bg-[#6149CD] text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          Revenus
                        </button>
                        <button
                          onClick={() => setActiveChart("utilisateurs")}
                          className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg transition-colors ${
                            active_chart === "utilisateurs"
                              ? "bg-[#6149CD] text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          Utilisateurs
                        </button>
                      </div>
                    </div>

                    <div className="h-64 sm:h-80">
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
                              tickLine={false}
                            />
                            <YAxis
                              stroke="#6B7280"
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#fff",
                                border: "1px solid #E5E7EB",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                              }}
                              labelStyle={{ color: "#374151" }}
                            />
                            <Line
                              type="monotone"
                              dataKey="valeur"
                              stroke="#6149CD"
                              strokeWidth={3}
                              dot={{ fill: "#6149CD", strokeWidth: 2, r: 4 }}
                              activeDot={{
                                r: 6,
                                fill: "#6149CD",
                                stroke: "#fff",
                                strokeWidth: 2,
                              }}
                            />
                            {active_chart === "revenus" && (
                              <Line
                                type="monotone"
                                dataKey="montant"
                                stroke="#10B981"
                                strokeWidth={2}
                                dot={{
                                  fill: "#10B981",
                                  strokeWidth: 2,
                                  r: 3,
                                }}
                              />
                            )}
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-gray-500">
                            Aucune donnée disponible
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Status Charts Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Voyages par statut
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <PieChart className="w-5 h-5 text-[#6149CD]" />
                        <h3 className="text-base sm:text-lg font-bold text-gray-900">
                          Voyages par statut
                        </h3>
                      </div>
                      <div className="h-48 sm:h-64">
                        {getVoyagesStatusData().length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={getVoyagesStatusData()}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={70}
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
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "#fff",
                                  border: "1px solid #E5E7EB",
                                  borderRadius: "8px",
                                }}
                              />
                              <Legend
                                verticalAlign="bottom"
                                height={36}
                                formatter={(value) => (
                                  <span className="text-xs sm:text-sm text-gray-700">
                                    {value}
                                  </span>
                                )}
                              />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500 text-sm">
                              Aucun voyage
                            </p>
                          </div>
                        )}
                      </div>
                    </div> */}

                  {/* Réservations par statut
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <PieChart className="w-5 h-5 text-[#6149CD]" />
                        <h3 className="text-base sm:text-lg font-bold text-gray-900">
                          Réservations par statut
                        </h3>
                      </div>
                      <div className="h-48 sm:h-64">
                        {getReservationsStatusData().length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={getReservationsStatusData()}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={70}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {getReservationsStatusData().map(
                                  (entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={entry.color}
                                    />
                                  )
                                )}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "#fff",
                                  border: "1px solid #E5E7EB",
                                  borderRadius: "8px",
                                }}
                              />
                              <Legend
                                verticalAlign="bottom"
                                height={36}
                                formatter={(value) => (
                                  <span className="text-xs sm:text-sm text-gray-700">
                                    {value}
                                  </span>
                                )}
                              />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500 text-sm">
                              Aucune réservation
                            </p>
                          </div>
                        )}
                      </div>
                    </div> */}
                </div>

                {/* New Charts Section - Statistiques avancées */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Revenus par classe */}
                  {general_stats.revenue_by_class &&
                    Object.keys(general_stats.revenue_by_class).length > 0 && (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                          Revenus par classe
                        </h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={prepareBarChartData(
                                general_stats.revenue_by_class,
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
                                contentStyle={{
                                  backgroundColor: "#fff",
                                  border: "1px solid #E5E7EB",
                                  borderRadius: "8px",
                                }}
                              />
                              <Legend />
                              <Bar
                                dataKey="value"
                                fill="#6149CD"
                                name="Revenu"
                                radius={[8, 8, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                  {/* Top destinations */}
                  {general_stats.top_destinations &&
                    Object.keys(general_stats.top_destinations).length > 0 && (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                          Top 10 destinations
                        </h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={prepareBarChartData(
                                general_stats.top_destinations,
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
                                contentStyle={{
                                  backgroundColor: "#fff",
                                  border: "1px solid #E5E7EB",
                                  borderRadius: "8px",
                                }}
                              />
                              <Legend />
                              <Bar
                                dataKey="value"
                                fill="#10B981"
                                name="Voyages"
                                radius={[0, 8, 8, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                  {/* Top origines */}
                  {general_stats.top_origins &&
                    Object.keys(general_stats.top_origins).length > 0 && (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                          Top 10 villes d'origine
                        </h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={prepareBarChartData(
                                general_stats.top_origins,
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
                                contentStyle={{
                                  backgroundColor: "#fff",
                                  border: "1px solid #E5E7EB",
                                  borderRadius: "8px",
                                }}
                              />
                              <Legend />
                              <Bar
                                dataKey="value"
                                fill="#F59E0B"
                                name="Voyages"
                                radius={[0, 8, 8, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                  {/* Réservations par jour de la semaine */}
                  {general_stats.reservations_by_day_of_week &&
                    Object.keys(general_stats.reservations_by_day_of_week)
                      .length > 0 && (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                          Réservations par jour
                        </h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={prepareDayOfWeekData(
                                general_stats.reservations_by_day_of_week,
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
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "#fff",
                                  border: "1px solid #E5E7EB",
                                  borderRadius: "8px",
                                }}
                              />
                              <Legend />
                              <Bar
                                dataKey="value"
                                fill="#8B5CF6"
                                name="Réservations"
                                radius={[8, 8, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                  {/* Voyages par chauffeur */}
                  {general_stats.trips_by_driver &&
                    Object.keys(general_stats.trips_by_driver).length > 0 && (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:col-span-2">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                          Top 10 chauffeurs (par nombre de voyages)
                        </h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={prepareBarChartData(
                                general_stats.trips_by_driver,
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
                                contentStyle={{
                                  backgroundColor: "#fff",
                                  border: "1px solid #E5E7EB",
                                  borderRadius: "8px",
                                }}
                              />
                              <Legend />
                              <Bar
                                dataKey="value"
                                fill="#EF4444"
                                name="Voyages"
                                radius={[0, 8, 8, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                </div>

                {/* Evolution Charts - Nouveaux graphiques */}
                {evolution_stats && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Evolution taux d'occupation */}
                    {evolution_stats.evolution_taux_occupation &&
                      evolution_stats.evolution_taux_occupation.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                            Évolution du taux d'occupation
                          </h3>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart
                                data={evolution_stats.evolution_taux_occupation.map(
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
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "#fff",
                                    border: "1px solid #E5E7EB",
                                    borderRadius: "8px",
                                  }}
                                />
                                <Legend />
                                <Line
                                  type="monotone"
                                  dataKey="valeur"
                                  stroke="#6149CD"
                                  strokeWidth={2}
                                  dot={{ fill: "#6149CD", r: 3 }}
                                  name="Taux (%)"
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}

                    {/* Evolution annulations */}
                    {evolution_stats.evolution_annulations &&
                      evolution_stats.evolution_annulations.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                            Évolution des annulations
                          </h3>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart
                                data={evolution_stats.evolution_annulations.map(
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
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "#fff",
                                    border: "1px solid #E5E7EB",
                                    borderRadius: "8px",
                                  }}
                                />
                                <Legend />
                                <Line
                                  type="monotone"
                                  dataKey="valeur"
                                  stroke="#EF4444"
                                  strokeWidth={2}
                                  dot={{ fill: "#EF4444", r: 3 }}
                                  name="Annulations"
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}

                    {/* Revenus par mois */}
                    {evolution_stats.revenue_per_month &&
                      Object.keys(evolution_stats.revenue_per_month).length >
                        0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                            Revenus par mois
                          </h3>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={prepareMonthlyData(
                                  evolution_stats.revenue_per_month,
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
                                  contentStyle={{
                                    backgroundColor: "#fff",
                                    border: "1px solid #E5E7EB",
                                    borderRadius: "8px",
                                  }}
                                />
                                <Legend />
                                <Bar
                                  dataKey="value"
                                  fill="#10B981"
                                  name="Revenu"
                                  radius={[8, 8, 0, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}

                    {/* Réservations par mois */}
                    {evolution_stats.reservations_per_month &&
                      Object.keys(evolution_stats.reservations_per_month)
                        .length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                            Réservations par mois
                          </h3>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={prepareMonthlyData(
                                  evolution_stats.reservations_per_month,
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
                                  contentStyle={{
                                    backgroundColor: "#fff",
                                    border: "1px solid #E5E7EB",
                                    borderRadius: "8px",
                                  }}
                                />
                                <Legend />
                                <Bar
                                  dataKey="value"
                                  fill="#6149CD"
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
              </>
            )}
          </div>
        </main>
      </div>

      {/* Delete Modal */}
      {show_delete_modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-linear-to-br from-red-400 to-red-600 p-8 text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-12 h-12 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Confirmer la suppression
              </h2>
              <p className="text-red-50">Cette action est irréversible</p>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-6">
                Êtes-vous sûr de vouloir supprimer l'agence{" "}
                <span className="font-bold">{agency.long_name}</span> ?
              </p>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={is_deleting}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  disabled={is_deleting}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {is_deleting ? "Suppression..." : "Supprimer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {show_success_modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-linear-to-br from-green-400 to-green-600 p-8 text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Succès !</h2>
              <p className="text-green-50">Agence mise à jour avec succès</p>
            </div>

            <div className="p-6">
              <button
                onClick={() => setShowSuccessModal(false)}
                style={{ backgroundColor: BUTTON_COLOR }}
                className="w-full py-3 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-linear-to-br from-red-400 to-red-600 p-8 text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-12 h-12 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Erreur</h2>
              <p className="text-red-50">Une erreur est survenue</p>
            </div>

            <div className="p-6">
              <div className="bg-red-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-red-800">{error_message}</p>
              </div>

              <button
                onClick={() => {
                  setShowErrorModal(false);
                  setErrorMessage("");
                }}
                className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
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
