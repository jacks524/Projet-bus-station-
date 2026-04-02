"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Home,
  Building2,
  Settings,
  Briefcase,
  Users,
  Car,
  Bus,
  RefreshCw,
  X,
  ChevronDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  Hash,
  MapPin,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import MobileSidebar from "@/app/components/Mobilesidebar";
import Header from "@/app/components/Header";
import SuccessModal from "@/app/components/SuccessModal";
import ErrorModal from "@/app/components/ErrorModal";
import ConfirmModal from "@/app/components/ConfirmModal";
import { useLanguage } from "@/app/providers";

interface Vehicle {
  idVehicule: string;
  nom: string;
  modele: string;
  description: string;
  nbrPlaces: number;
  plaqueMatricule: string;
  lienPhoto: string;
  idAgenceVoyage: string;
}

interface VehicleFormData {
  nom: string;
  modele: string;
  description: string;
  nbrPlaces: number;
  plaqueMatricule: string;
  lienPhoto: string;
  idAgenceVoyage: string;
}

interface Agency {
  agency_id: string;
  agency_name: string;
  short_name: string;
  ville: string;
}

interface Organization {
  id: string;
  short_name: string;
  long_name: string;
  created_by: string;
  status: string;
}

interface AgenciesStatistics {
  agencies: Agency[];
}

interface UserData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  userId: string;
  role: string[];
}

const EMPTY_FORM: VehicleFormData = {
  nom: "",
  modele: "",
  description: "",
  nbrPlaces: 0,
  plaqueMatricule: "",
  lienPhoto: "",
  idAgenceVoyage: "",
};

export default function BusPage() {
  const router = useRouter();
  const { t, language } = useLanguage();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Organizations & Agencies
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);
  const [showOrgSelector, setShowOrgSelector] = useState(false);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [showAgencySelector, setShowAgencySelector] = useState(false);

  // Vehicles
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);

  // Search & Pagination
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 8;

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState<VehicleFormData>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const menuItems = [
    {
      icon: Home,
      label: t("Dashboard", "Dashboard"),
      path: "/user/organization/dashboard",
      active: false,
    },
    {
      icon: Briefcase,
      label: t("Organisation", "Organization"),
      path: "/user/organization/organization",
      active: false,
    },
    {
      icon: Building2,
      label: t("Agence", "Agency"),
      path: "/user/organization/agencies",
      active: false,
    },
    {
      icon: Users,
      label: t("Employés", "Employees"),
      path: "/user/organization/employees",
      active: false,
    },
    {
      icon: Car,
      label: t("Bus", "Bus"),
      path: "/user/organization/bus",
      active: true,
    },
    {
      icon: Settings,
      label: t("Mes paramètres", "My settings"),
      path: "/user/organization/settings",
      active: false,
    },
  ];

  const getAuthToken = () =>
    localStorage.getItem("auth_token") ||
    sessionStorage.getItem("auth_token") ||
    "";

  useEffect(() => {
    const authToken = getAuthToken();
    if (!authToken) {
      router.push("/login");
      return;
    }
    const stored =
      localStorage.getItem("user_data") || sessionStorage.getItem("user_data");
    if (stored) {
      setUserData(JSON.parse(stored));
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (userData?.userId) fetchOrganizations();
  }, [userData?.userId]);

  useEffect(() => {
    if (selectedOrganization?.id) fetchAgencies(selectedOrganization.id);
  }, [selectedOrganization?.id]);

  useEffect(() => {
    if (selectedAgency?.agency_id) fetchVehicles(selectedAgency.agency_id);
  }, [selectedAgency?.agency_id]);

  const fetchOrganizations = async () => {
    setIsLoadingOrgs(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/organizations?page=0&size=1000`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
        },
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      const myOrgs = data.filter(
        (o: Organization) =>
          o.created_by === userData?.userId && o.status !== "DELETED",
      );
      setOrganizations(myOrgs);
      if (myOrgs.length > 0) setSelectedOrganization(myOrgs[0]);
    } catch {
      setErrorMessage(
        t(
          "Impossible de charger les organisations",
          "Unable to load organizations",
        ),
      );
    } finally {
      setIsLoadingOrgs(false);
    }
  };

  const fetchAgencies = async (orgId: string) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/statistics/organisation/${orgId}/agencies`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
        },
      );
      if (!res.ok) throw new Error();
      const data: AgenciesStatistics = await res.json();
      setAgencies(data.agencies || []);
      if (data.agencies && data.agencies.length > 0) {
        setSelectedAgency(data.agencies[0]);
      } else {
        setSelectedAgency(null);
        setVehicles([]);
      }
    } catch {
      setAgencies([]);
    }
  };

  const fetchVehicles = async (agencyId: string) => {
    setIsLoadingVehicles(true);
    try {
      const res = await fetch(`${API_BASE_URL}/vehicule/agence/${agencyId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      if (!res.ok) throw new Error();
      const data: Vehicle[] = await res.json();
      setVehicles(data);
    } catch {
      setVehicles([]);
    } finally {
      setIsLoadingVehicles(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingVehicle(null);
    setFormData({
      ...EMPTY_FORM,
      idAgenceVoyage: selectedAgency?.agency_id || "",
    });
    setShowFormModal(true);
  };

  const handleOpenEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setFormData({
      nom: v.nom,
      modele: v.modele,
      description: v.description,
      nbrPlaces: v.nbrPlaces,
      plaqueMatricule: v.plaqueMatricule,
      lienPhoto: v.lienPhoto,
      idAgenceVoyage: v.idAgenceVoyage,
    });
    setShowFormModal(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.nom.trim() ||
      !formData.modele.trim() ||
      !formData.plaqueMatricule.trim()
    ) {
      setErrorMessage(
        t(
          "Veuillez remplir tous les champs obligatoires",
          "Please fill in all required fields",
        ),
      );
      setShowErrorModal(true);
      return;
    }
    setIsSubmitting(true);
    try {
      const url = editingVehicle
        ? `${API_BASE_URL}/vehicule/${editingVehicle.idVehicule}`
        : `${API_BASE_URL}/vehicule`;
      const method = editingVehicle ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error();
      setShowFormModal(false);
      setSuccessMessage(
        editingVehicle
          ? t("Véhicule modifié avec succès", "Vehicle updated successfully")
          : t("Véhicule ajouté avec succès", "Vehicle added successfully"),
      );
      setShowSuccessModal(true);
      if (selectedAgency?.agency_id) fetchVehicles(selectedAgency.agency_id);
    } catch {
      setErrorMessage(
        editingVehicle
          ? t("Erreur lors de la modification", "Error updating vehicle")
          : t("Erreur lors de la création", "Error creating vehicle"),
      );
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVehicle = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/vehicule/${deleteTarget.idVehicule}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        },
      );
      if (!res.ok) throw new Error();
      setShowDeleteModal(false);
      setSuccessMessage(
        t("Véhicule supprimé avec succès", "Vehicle deleted successfully"),
      );
      setShowSuccessModal(true);
      if (selectedAgency?.agency_id) fetchVehicles(selectedAgency.agency_id);
    } catch {
      setErrorMessage(
        t("Erreur lors de la suppression", "Error deleting vehicle"),
      );
      setShowErrorModal(true);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered & paginated vehicles
  const filteredVehicles = vehicles.filter(
    (v) =>
      v.nom.toLowerCase().includes(search.toLowerCase()) ||
      v.modele.toLowerCase().includes(search.toLowerCase()) ||
      v.plaqueMatricule.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.ceil(filteredVehicles.length / perPage);
  const paginatedVehicles = filteredVehicles.slice(
    (page - 1) * perPage,
    page * perPage,
  );

  return (
    <div className="dashboard-layout">
      <Sidebar menuItems={menuItems} activePath="/user/organization/bus" />
      <MobileSidebar
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        menuItems={menuItems}
        activePath="/user/organization/bus"
      />

      <div className="dashboard-main">
        <Header
          title={t("Gestion des bus", "Bus Management")}
          userData={userData}
          onMenuClick={() => setShowMobileMenu(true)}
          showSettingsButton={true}
          userType="organization"
        />

        <main className="dashboard-content">
          {/* Section Header */}
          <div
            className="section-header"
            style={{ marginBottom: "var(--spacing-2xl)" }}
          >
            <h2 className="section-title">
              {t("Vos véhicules", "Your vehicles")}
            </h2>
            <p className="section-description">
              {t(
                "Gérez les bus et véhicules de vos agences",
                "Manage the buses and vehicles of your agencies",
              )}
            </p>
          </div>

          {/* Loading organizations */}
          {isLoadingOrgs && (
            <div className="loading-state">
              <RefreshCw className="spin" />
              <p>{t("Chargement...", "Loading...")}</p>
            </div>
          )}

          {/* No organizations */}
          {!isLoadingOrgs && organizations.length === 0 && (
            <div className="empty-state">
              <Briefcase className="empty-icon" />
              <h3 className="empty-title">
                {t("Aucune organisation", "No organization")}
              </h3>
              <p className="empty-description">
                {t(
                  "Créez une organisation pour gérer vos bus",
                  "Create an organization to manage your buses",
                )}
              </p>
              <button
                onClick={() => router.push("/user/organization/organization")}
                className="btn btn-primary"
                style={{ marginTop: "15px" }}
              >
                {t("Créer une organisation", "Create an organization")}
              </button>
            </div>
          )}

          {!isLoadingOrgs && organizations.length > 0 && (
            <>
              {/* Org + Agency selectors */}
              <div className="agency-header-card">
                <div className="agency-info">
                  <h2 className="agency-name">
                    {t("Organisation :", "Organization:")}{" "}
                    {selectedOrganization?.long_name}
                  </h2>
                  {selectedAgency && (
                    <p className="agency-location">
                      <MapPin
                        style={{
                          display: "inline",
                          width: 14,
                          height: 14,
                          marginRight: 4,
                        }}
                      />
                      {t("Agence :", "Agency:")} {selectedAgency.agency_name} —{" "}
                      {selectedAgency.ville}
                    </p>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "var(--spacing-sm)",
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  {/* Org selector */}
                  {organizations.length > 1 && (
                    <div className="agency-selector">
                      <button
                        onClick={() => setShowOrgSelector(!showOrgSelector)}
                        className="btn btn-secondary"
                      >
                        {t("Changer organisation", "Change org")}
                        <ChevronDown />
                      </button>
                      {showOrgSelector && (
                        <>
                          <div
                            className="selector-overlay"
                            onClick={() => setShowOrgSelector(false)}
                          />
                          <div className="selector-dropdown">
                            {organizations.map((org) => (
                              <button
                                key={org.id}
                                onClick={() => {
                                  setSelectedOrganization(org);
                                  setShowOrgSelector(false);
                                }}
                                className={`selector-item ${selectedOrganization?.id === org.id ? "active" : ""}`}
                              >
                                <p className="selector-item-name">
                                  {org.long_name}
                                </p>
                                <p className="selector-item-city">
                                  {org.short_name}
                                </p>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Agency selector */}
                  {agencies.length > 1 && (
                    <div className="agency-selector">
                      <button
                        onClick={() =>
                          setShowAgencySelector(!showAgencySelector)
                        }
                        className="btn btn-secondary"
                      >
                        {t("Changer agence", "Change agency")}
                        <ChevronDown />
                      </button>
                      {showAgencySelector && (
                        <>
                          <div
                            className="selector-overlay"
                            onClick={() => setShowAgencySelector(false)}
                          />
                          <div className="selector-dropdown">
                            {agencies.map((ag) => (
                              <button
                                key={ag.agency_id}
                                onClick={() => {
                                  setSelectedAgency(ag);
                                  setShowAgencySelector(false);
                                  setPage(1);
                                }}
                                className={`selector-item ${selectedAgency?.agency_id === ag.agency_id ? "active" : ""}`}
                              >
                                <p className="selector-item-name">
                                  {ag.agency_name}
                                </p>
                                <p className="selector-item-city">{ag.ville}</p>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Refresh */}
                  <button
                    className="btn-icon"
                    onClick={() =>
                      selectedAgency && fetchVehicles(selectedAgency.agency_id)
                    }
                    title={t("Actualiser", "Refresh")}
                  >
                    <RefreshCw />
                  </button>
                </div>
              </div>

              {/* No agencies */}
              {agencies.length === 0 && !isLoadingVehicles && (
                <div className="empty-state">
                  <Building2 className="empty-icon" />
                  <h3 className="empty-title">
                    {t("Aucune agence", "No agency")}
                  </h3>
                  <p className="empty-description">
                    {t(
                      "Créez une agence pour commencer à gérer vos bus",
                      "Create an agency to start managing your buses",
                    )}
                  </p>
                  <button
                    onClick={() => router.push("/user/organization/agencies")}
                    className="btn btn-primary"
                    style={{ marginTop: "15px" }}
                  >
                    {t("Créer une agence", "Create an agency")}
                  </button>
                </div>
              )}

              {/* Vehicles section */}
              {selectedAgency && (
                <div className="org-agencies-section">
                  {/* Header */}
                  <div className="content-header">
                    <h3 className="content-title">
                      <Bus
                        style={{
                          display: "inline",
                          width: 20,
                          height: 20,
                          marginRight: 8,
                          color: "var(--color-primary)",
                        }}
                      />
                      {t("Véhicules", "Vehicles")} ({filteredVehicles.length})
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        gap: "var(--spacing-sm)",
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <div className="search-input-wrapper">
                        <Search />
                        <input
                          type="text"
                          placeholder={t(
                            "Rechercher un véhicule...",
                            "Search a vehicle...",
                          )}
                          value={search}
                          onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                          }}
                        />
                      </div>
                      <button
                        className="btn btn-primary"
                        onClick={handleOpenCreate}
                      >
                        <Plus style={{ width: 18, height: 18 }} />
                        {t("Ajouter un bus", "Add a bus")}
                      </button>
                    </div>
                  </div>

                  {/* Loading vehicles */}
                  {isLoadingVehicles && (
                    <div className="loading-state">
                      <RefreshCw className="spin" />
                      <p>
                        {t(
                          "Chargement des véhicules...",
                          "Loading vehicles...",
                        )}
                      </p>
                    </div>
                  )}

                  {/* Empty vehicles */}
                  {!isLoadingVehicles && filteredVehicles.length === 0 && (
                    <div className="empty-state">
                      <Bus className="empty-icon" />
                      <h3 className="empty-title">
                        {search
                          ? t("Aucun résultat", "No results")
                          : t("Aucun véhicule", "No vehicles")}
                      </h3>
                      <p className="empty-description">
                        {search
                          ? t(
                              "Aucun véhicule ne correspond à votre recherche",
                              "No vehicle matches your search",
                            )
                          : t(
                              "Ajoutez votre premier bus pour cette agence",
                              "Add your first bus for this agency",
                            )}
                      </p>
                      {!search && (
                        <button
                          className="btn btn-primary"
                          onClick={handleOpenCreate}
                          style={{ marginTop: 15 }}
                        >
                          <Plus style={{ width: 16, height: 16 }} />
                          {t("Ajouter un bus", "Add a bus")}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Vehicles Grid */}
                  {!isLoadingVehicles && paginatedVehicles.length > 0 && (
                    <div className="bus-vehicles-grid">
                      {paginatedVehicles.map((vehicle) => (
                        <div
                          key={vehicle.idVehicule}
                          className="bus-vehicle-card"
                        >
                          {/* Photo */}
                          <div className="bus-vehicle-photo">
                            {vehicle.lienPhoto ? (
                              <Image
                                src={vehicle.lienPhoto}
                                alt={vehicle.nom}
                                fill
                                style={{ objectFit: "cover" }}
                                quality={75}
                                unoptimized
                              />
                            ) : (
                              <div className="bus-vehicle-photo-placeholder">
                                <Bus
                                  style={{
                                    width: 40,
                                    height: 40,
                                    color: "var(--gray-400)",
                                  }}
                                />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="bus-vehicle-content">
                            <div className="bus-vehicle-header">
                              <div className="bus-vehicle-title-group">
                                <h4 className="bus-vehicle-name">
                                  {vehicle.nom}
                                </h4>
                                <span className="bus-vehicle-model">
                                  {vehicle.modele}
                                </span>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  gap: "var(--spacing-xs)",
                                }}
                              >
                                <button
                                  className="btn-icon"
                                  onClick={() => handleOpenEdit(vehicle)}
                                  title={t("Modifier", "Edit")}
                                  style={{ width: 36, height: 36 }}
                                >
                                  <Edit2 style={{ width: 15, height: 15 }} />
                                </button>
                                <button
                                  className="btn-icon-danger"
                                  style={{ width: 36, height: 36 }}
                                  onClick={() => {
                                    setDeleteTarget(vehicle);
                                    setShowDeleteModal(true);
                                  }}
                                  title={t("Supprimer", "Delete")}
                                >
                                  <Trash2 style={{ width: 15, height: 15 }} />
                                </button>
                              </div>
                            </div>

                            <div className="bus-vehicle-stats">
                              <div className="bus-vehicle-stat">
                                <Hash
                                  style={{
                                    width: 13,
                                    height: 13,
                                    color: "var(--color-primary)",
                                  }}
                                />
                                <span className="bus-vehicle-stat-label">
                                  {t("Plaque", "Plate")}
                                </span>
                                <span className="bus-vehicle-stat-value">
                                  {vehicle.plaqueMatricule}
                                </span>
                              </div>
                              <div className="bus-vehicle-stat">
                                <Users
                                  style={{
                                    width: 13,
                                    height: 13,
                                    color: "var(--color-primary)",
                                  }}
                                />
                                <span className="bus-vehicle-stat-label">
                                  {t("Places", "Seats")}
                                </span>
                                <span className="bus-vehicle-stat-value">
                                  {vehicle.nbrPlaces}
                                </span>
                              </div>
                            </div>

                            {vehicle.description && (
                              <p className="bus-vehicle-description">
                                {vehicle.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="widget-pagination">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="btn-icon"
                      >
                        <ChevronLeft />
                      </button>
                      <span>
                        {t("Page", "Page")} {page} {t("sur", "of")} {totalPages}
                      </span>
                      <button
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page === totalPages}
                        className="btn-icon"
                      >
                        <ChevronRight />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ==================== Create / Edit Modal ==================== */}
      {showFormModal && (
        <div
          className="modal-overlay"
          style={{ alignItems: "flex-start", paddingTop: "3rem" }}
        >
          <div
            className="payment-modal-content"
            style={{ borderRadius: "var(--radius-lg)", maxWidth: 620 }}
          >
            {/* Modal Header */}
            <div className="payment-modal-header">
              <h2 className="payment-modal-title">
                {editingVehicle
                  ? t("Modifier le véhicule", "Edit vehicle")
                  : t("Ajouter un véhicule", "Add a vehicle")}
              </h2>
              <button
                className="payment-modal-close"
                onClick={() => setShowFormModal(false)}
              >
                <X />
              </button>
            </div>

            {/* Modal Body */}
            <div className="payment-modal-body">
              <form
                onSubmit={handleSubmitForm}
                className="create-voyage-form"
                style={{ marginTop: 0, gap: "var(--spacing-lg)" }}
              >
                {/* Main info */}
                <div className="form-section">
                  <div className="form-section-header">
                    <Bus style={{ width: 18, height: 18 }} />
                    <h3>
                      {t("Informations du véhicule", "Vehicle information")}
                    </h3>
                  </div>
                  <div className="form-section-content">
                    <div className="form-group">
                      <label className="form-label">
                        {t("Nom du véhicule *", "Vehicle name *")}
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder={t("Ex: Bus Express", "e.g., Express Bus")}
                        value={formData.nom}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, nom: e.target.value }))
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        {t("Modèle *", "Model *")}
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder={t(
                          "Ex: Toyota Coaster",
                          "e.g., Toyota Coaster",
                        )}
                        value={formData.modele}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, modele: e.target.value }))
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        {t("Plaque matricule *", "License plate *")}
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder={t("Ex: LT 1234 A", "e.g., LT 1234 A")}
                        value={formData.plaqueMatricule}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            plaqueMatricule: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        {t("Nombre de places *", "Number of seats *")}
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="70"
                        min={1}
                        value={formData.nbrPlaces || ""}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            nbrPlaces: parseInt(e.target.value) || 0,
                          }))
                        }
                        required
                      />
                    </div>
                    <div
                      className="form-group"
                      style={{ gridColumn: "1 / -1" }}
                    >
                      <label className="form-label">
                        {t("Lien photo", "Photo URL")}
                      </label>
                      <input
                        type="url"
                        className="form-input"
                        placeholder="https://example.com/photo.jpg"
                        value={formData.lienPhoto}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            lienPhoto: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div
                      className="form-group"
                      style={{ gridColumn: "1 / -1" }}
                    >
                      <label className="form-label">
                        {t("Description", "Description")}
                      </label>
                      <textarea
                        className="form-textarea"
                        placeholder={t(
                          "Description du véhicule...",
                          "Vehicle description...",
                        )}
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            description: e.target.value,
                          }))
                        }
                        style={{ minHeight: 80 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div
                  className="form-actions"
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    paddingTop: "var(--spacing-sm)",
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowFormModal(false)}
                  >
                    {t("Annuler", "Cancel")}
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw
                          className="spin"
                          style={{ width: 16, height: 16 }}
                        />
                        {t("En cours...", "Processing...")}
                      </>
                    ) : editingVehicle ? (
                      <>
                        <Edit2 style={{ width: 16, height: 16 }} />
                        {t("Modifier", "Update")}
                      </>
                    ) : (
                      <>
                        <Plus style={{ width: 16, height: 16 }} />
                        {t("Ajouter", "Add")}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ==================== Modals ==================== */}
      <ConfirmModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteVehicle}
        title={t("Supprimer le véhicule", "Delete vehicle")}
        message={t(
          `Êtes-vous sûr de vouloir supprimer "${deleteTarget?.nom}" ? Cette action est irréversible.`,
          `Are you sure you want to delete "${deleteTarget?.nom}"? This action cannot be undone.`,
        )}
        confirmText={t("Supprimer", "Delete")}
        cancelText={t("Annuler", "Cancel")}
        isLoading={isDeleting}
      />

      <SuccessModal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={t("Succès", "Success")}
        message={successMessage}
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
