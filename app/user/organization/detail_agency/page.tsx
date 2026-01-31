"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Home,
  Building2,
  Settings,
  Briefcase,
  MapPin,
  Globe,
  MessageSquare,
  RefreshCw,
  Users,
  Car,
  Bus,
  Calendar,
  TrendingUp,
  BarChart3,
  ArrowLeft,
  Edit,
  Save,
  X,
  Trash2,
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
  first_name: string;
  last_name: string;
  email: string;
  userId: string;
  role: string[];
}

function DetailAgencyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const agencyId = searchParams.get("id");

  const [agency, setAgency] = useState<AgencyData | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<AgencyData>>({});

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  const [generalStats, setGeneralStats] = useState<GeneralStatistics | null>(
    null,
  );
  const [evolutionStats, setEvolutionStats] =
    useState<EvolutionStatistics | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [activeChart, setActiveChart] = useState<
    "reservations" | "voyages" | "revenus" | "utilisateurs"
  >("reservations");

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const PIE_COLORS = ["#10B981", "#F59E0B", "#EF4444", "#6366F1", "#8B5CF6"];

  const menuItems = [
    {
      icon: Home,
      label: "Dashboard",
      path: "/user/organization/dashboard",
      active: false,
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
      active: true,
    },
    {
      icon: Settings,
      label: "Mes paramètres",
      path: "/user/organization/settings",
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
    }

    if (agencyId) {
      fetchAgencyDetails();
    }
  }, [agencyId]);

  useEffect(() => {
    if (agency?.agency_id) {
      fetchGeneralStatistics(agency.agency_id);
      fetchEvolutionStatistics(agency.agency_id);
    }
  }, [agency?.agency_id]);

  const fetchAgencyDetails = async () => {
    setIsLoading(true);
    try {
      const authToken =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
      const response = await fetch(`${API_BASE_URL}/agence/${agencyId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) throw new Error("Erreur lors du chargement");

      const data = await response.json();
      setAgency(data);
      setFormData(data);
    } catch (error: any) {
      setErrorMessage("Impossible de charger les détails de l'agence");
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGeneralStatistics = async (agenceId: string) => {
    setIsLoadingStats(true);
    try {
      const authToken =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
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
      console.error("Fetch General Stats Error:", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const fetchEvolutionStatistics = async (agenceId: string) => {
    try {
      const authToken =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
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

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
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
      const authToken =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");

      const updateBody = {
        organisation_id: formData.organisation_id,
        user_id: formData.user_id,
        long_name: formData.long_name,
        short_name: formData.short_name,
        location: formData.location,
        ville: formData.ville,
        social_network: formData.social_network,
        description: formData.description,
        greeting_message: formData.greeting_message,
      };

      const response = await fetch(`${API_BASE_URL}/agence/${agencyId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(updateBody),
      });

      if (!response.ok) throw new Error("Erreur lors de la mise à jour");

      setShowSuccessModal(true);
      setEditMode(false);
      fetchAgencyDetails();
    } catch (error: any) {
      setErrorMessage("Erreur lors de la mise à jour de l'agence");
      setShowErrorModal(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const authToken =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
      const response = await fetch(`${API_BASE_URL}/agence/${agencyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) throw new Error("Erreur lors de la suppression");

      router.push("/user/organization/dashboard");
    } catch (error: any) {
      setErrorMessage("Erreur lors de la suppression de l'agence");
      setShowErrorModal(true);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Non renseigné";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      month: "numeric",
      year: "numeric",
    });
  };

  const formatRevenue = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getChartData = () => {
    if (!evolutionStats) return [];

    switch (activeChart) {
      case "reservations":
        return (
          evolutionStats.evolutionReservations?.map((item) => ({
            date: formatDateShort(item.date),
            valeur: item.valeur,
          })) || []
        );
      case "voyages":
        return (
          evolutionStats.evolutionVoyages?.map((item) => ({
            date: formatDateShort(item.date),
            valeur: item.valeur,
          })) || []
        );
      case "revenus":
        return (
          evolutionStats.evolutionRevenus?.map((item) => ({
            date: formatDateShort(item.date),
            valeur: item.montant,
          })) || []
        );
      case "utilisateurs":
        return (
          evolutionStats.evolutionUtilisateurs?.map((item) => ({
            date: formatDateShort(item.date),
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
        name,
        value,
        color: PIE_COLORS[index % PIE_COLORS.length],
      }),
    );
  };

  const getReservationsStatusData = () => {
    if (!generalStats?.reservationsParStatut) return [];
    return Object.entries(generalStats.reservationsParStatut).map(
      ([name, value], index) => ({
        name,
        value,
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

  if (isLoading) {
    return (
      <div className="dashboard-layout">
        <Sidebar
          menuItems={menuItems}
          activePath="/user/organization/agencies"
        />
        <div className="dashboard-main">
          <div className="loading-state">
            <RefreshCw className="spin" />
            <p>Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="dashboard-layout">
        <Sidebar
          menuItems={menuItems}
          activePath="/user/organization/agencies"
        />
        <div className="dashboard-main">
          <div className="empty-state">
            <Building2 className="empty-icon" />
            <h3 className="empty-title">Agence introuvable</h3>
            <button
              onClick={() => router.push("/user/organization/dashboard")}
              className="btn btn-primary"
            >
              Retour au dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar menuItems={menuItems} activePath="/user/organization/agencies" />
      <MobileSidebar
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        menuItems={menuItems}
        activePath="/user/organization/agencies"
      />

      <div className="dashboard-main">
        <Header
          title="Détails de l'agence"
          userData={userData}
          onMenuClick={() => setShowMobileMenu(true)}
        />

        <main className="dashboard-content">
          <div className="container" style={{ maxWidth: "1200px" }}>
            {/* Action Buttons */}
            <div className="detail-actions">
              <button
                onClick={() => router.push("/user/organization/dashboard")}
                className="btn btn-secondary"
              >
                <ArrowLeft />
                Retour
              </button>

              <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
                <button
                  onClick={() => {
                    if (agency?.agency_id) {
                      fetchGeneralStatistics(agency.agency_id);
                      fetchEvolutionStatistics(agency.agency_id);
                    }
                  }}
                  className="btn-icon"
                  title="Actualiser"
                >
                  <RefreshCw />
                </button>

                {!editMode ? (
                  <>
                    <button
                      onClick={() => setEditMode(true)}
                      className="btn btn-primary"
                    >
                      <Edit />
                      Modifier
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="btn btn-danger"
                    >
                      <Trash2 />
                      Supprimer
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleUpdate}
                      disabled={isSaving}
                      className="btn btn-primary"
                    >
                      <Save />
                      {isSaving ? "Enregistrement..." : "Enregistrer"}
                    </button>
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setFormData(agency);
                      }}
                      className="btn btn-secondary"
                    >
                      <X />
                      Annuler
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Agency Header Card */}
            <div className="agency-detail-header">
              <div className="agency-detail-avatar">
                {agency.short_name?.substring(0, 2).toUpperCase()}
              </div>
              <div className="agency-detail-info">
                <h2 className="agency-detail-name">{agency.long_name}</h2>
                <p className="agency-detail-short">{agency.short_name}</p>
                <div className="agency-detail-location">
                  <MapPin />
                  <span>{agency.ville}</span>
                </div>
              </div>
              <div className="agency-detail-status">
                <span
                  className={`status-badge status-${agency.statut_validation.toLowerCase()}`}
                >
                  {agency.statut_validation}
                </span>
              </div>
            </div>

            {/* Information Sections */}
            <div className="settings-sections">
              {/* Informations principales */}
              <div className="settings-section">
                <div className="settings-section-header">
                  <Building2 style={{ width: "20px", height: "20px" }} />
                  <h3 className="settings-section-title">
                    Informations principales
                  </h3>
                </div>
                <div className="settings-section-content">
                  <div className="settings-field">
                    <label className="settings-label">Nom complet</label>
                    {editMode ? (
                      <input
                        type="text"
                        name="long_name"
                        value={formData.long_name || ""}
                        onChange={handleInputChange}
                        className="form-input"
                        style={{ width: "fit-content" }}
                      />
                    ) : (
                      <div className="settings-value">{agency.long_name}</div>
                    )}
                  </div>
                  <div className="settings-field">
                    <label className="settings-label">Abréviation</label>
                    {editMode ? (
                      <input
                        type="text"
                        name="short_name"
                        value={formData.short_name || ""}
                        onChange={handleInputChange}
                        className="form-input"
                        style={{ width: "fit-content" }}
                      />
                    ) : (
                      <div className="settings-value">{agency.short_name}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Localisation */}
              <div className="settings-section">
                <div className="settings-section-header">
                  <MapPin style={{ width: "20px", height: "20px" }} />
                  <h3 className="settings-section-title">Localisation</h3>
                </div>
                <div className="settings-section-content">
                  <div className="settings-field">
                    <label className="settings-label">Ville</label>
                    {editMode ? (
                      <select
                        name="ville"
                        value={formData.ville || ""}
                        onChange={handleInputChange}
                        className="form-input"
                        style={{ width: "fit-content" }}
                      >
                        <option value="">Sélectionner une ville</option>
                        <option value="Yaoundé">Yaoundé</option>
                        <option value="Douala">Douala</option>
                        <option value="Bafoussam">Bafoussam</option>
                        <option value="Bamenda">Bamenda</option>
                        <option value="Garoua">Garoua</option>
                        <option value="Maroua">Maroua</option>
                        <option value="Ngaoundéré">Ngaoundéré</option>
                        <option value="Bertoua">Bertoua</option>
                        <option value="Ebolowa">Ebolowa</option>
                        <option value="Kribi">Kribi</option>
                      </select>
                    ) : (
                      <div className="settings-value">{agency.ville}</div>
                    )}
                  </div>
                  <div className="settings-field">
                    <label className="settings-label">Zone/Quartier</label>
                    {editMode ? (
                      <input
                        type="text"
                        name="location"
                        value={formData.location || ""}
                        onChange={handleInputChange}
                        className="form-input"
                        style={{ width: "fit-content" }}
                      />
                    ) : (
                      <div className="settings-value">{agency.location}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Informations supplémentaires */}
              <div className="settings-section">
                <div className="settings-section-header">
                  <Globe style={{ width: "20px", height: "20px" }} />
                  <h3 className="settings-section-title">
                    Informations supplémentaires
                  </h3>
                </div>
                <div className="settings-section-content">
                  <div
                    className="settings-field"
                    style={{ gridColumn: "1 / -1" }}
                  >
                    <label className="settings-label">
                      <Globe style={{ width: "16px", height: "16px" }} />
                      Réseau social
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        name="social_network"
                        value={formData.social_network || ""}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="https://facebook.com/agence"
                        style={{ width: "fit-content" }}
                      />
                    ) : (
                      <div className="settings-value">
                        {agency.social_network || "Non renseigné"}
                      </div>
                    )}
                  </div>
                  <div
                    className="settings-field"
                    style={{ gridColumn: "1 / -1" }}
                  >
                    <label className="settings-label">
                      <MessageSquare
                        style={{ width: "16px", height: "16px" }}
                      />
                      Message d'accueil
                    </label>
                    {editMode ? (
                      <textarea
                        name="greeting_message"
                        value={formData.greeting_message || ""}
                        onChange={handleInputChange}
                        className="form-textarea"
                        rows={3}
                      />
                    ) : (
                      <div className="settings-value">
                        {agency.greeting_message || "Non renseigné"}
                      </div>
                    )}
                  </div>
                  <div
                    className="settings-field"
                    style={{ gridColumn: "1 / -1" }}
                  >
                    <label className="settings-label">Description</label>
                    {editMode ? (
                      <textarea
                        name="description"
                        value={formData.description || ""}
                        onChange={handleInputChange}
                        className="form-textarea"
                        rows={4}
                      />
                    ) : (
                      <div className="settings-value">
                        {agency.description || "Non renseignée"}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Informations de validation */}
              <div className="settings-section">
                <div className="settings-section-header">
                  <Building2 style={{ width: "20px", height: "20px" }} />
                  <h3 className="settings-section-title">
                    Informations de validation
                  </h3>
                </div>
                <div className="settings-section-content">
                  <div className="settings-field">
                    <label className="settings-label">Statut</label>
                    <span
                      className={`status-badge status-${agency.statut_validation.toLowerCase()}`}
                    >
                      {agency.statut_validation}
                    </span>
                  </div>
                  <div className="settings-field">
                    <label className="settings-label">Date de validation</label>
                    <div className="settings-value">
                      {formatDate(agency.date_validation)}
                    </div>
                  </div>
                  <div className="settings-field">
                    <label className="settings-label">Date de création</label>
                    <div className="settings-value">
                      {formatDate(agency.created_at)}
                    </div>
                  </div>
                  {agency.bsm_validator_id && (
                    <div className="settings-field">
                      <label className="settings-label">
                        ID Validateur BSM
                      </label>
                      <div className="settings-value settings-value-mono">
                        {agency.bsm_validator_id}
                      </div>
                    </div>
                  )}
                  {agency.motif_rejet && (
                    <div
                      className="settings-field"
                      style={{ gridColumn: "1 / -1" }}
                    >
                      <label className="settings-label">Motif de rejet</label>
                      <div className="rejection-message">
                        {agency.motif_rejet}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Statistics Section */}
            {generalStats && !isLoadingStats && (
              <>
                <div className="stats-divider">
                  <h3>Statistiques de l'agence</h3>
                </div>

                <div className="stats-card">
                  <div className="stats-header">
                    <h3>Statistiques principales</h3>
                  </div>
                  <div className="stats-grid-main">
                    <div className="stat-item">
                      <div className="stat-content">
                        <Users style={{ width: 20, height: 20 }} />
                        <p className="stat-label">Employés</p>
                        <p className="stat-value">
                          {generalStats.nombreEmployes}
                        </p>
                      </div>
                    </div>

                    <div className="stat-item">
                      <div className="stat-content">
                        <Car style={{ width: 20, height: 20 }} />
                        <p className="stat-label">Chauffeurs</p>
                        <p className="stat-value">
                          {generalStats.nombreChauffeurs}
                        </p>
                      </div>
                    </div>

                    <div className="stat-item">
                      <div className="stat-content">
                        <Bus style={{ width: 20, height: 20 }} />
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
                  {generalStats.revenue_by_class &&
                    Object.keys(generalStats.revenue_by_class).length > 0 && (
                      <div className="chart-card-small">
                        <div className="chart-header">
                          <BarChart3 />
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

                {(generalStats?.reservations_by_day_of_week ||
                  generalStats?.trips_by_driver) && (
                  <div className="charts-row">
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

                    {generalStats?.trips_by_driver &&
                      Object.keys(generalStats.trips_by_driver).length > 0 && (
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

                {evolutionStats && (
                  <div className="charts-row">
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
                                    date: formatDateShort(item.date),
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
                                    date: formatDateShort(item.date),
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

                {evolutionStats && (
                  <div className="charts-row">
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
              </>
            )}

            {isLoadingStats && (
              <div className="loading-state">
                <RefreshCw className="spin" />
                <p>Chargement des statistiques...</p>
              </div>
            )}
          </div>
        </main>
      </div>

      <ConfirmModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Supprimer l'agence"
        message={`Êtes-vous sûr de vouloir supprimer l'agence ${agency?.long_name} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        isLoading={isDeleting}
      />

      <SuccessModal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Agence mise à jour !"
        message="Les informations de l'agence ont été mises à jour avec succès."
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

export default function DetailAgencyPage() {
  return (
    <Suspense
      fallback={
        <div className="dashboard-layout">
          <div className="loading-state">
            <RefreshCw className="spin" />
            <p>Chargement...</p>
          </div>
        </div>
      }
    >
      <DetailAgencyContent />
    </Suspense>
  );
}
