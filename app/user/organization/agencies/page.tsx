"use client";

import React, { useState, useEffect } from "react";
import {
  Home,
  Building2,
  Settings,
  Briefcase,
  Building,
  MapPin,
  Globe,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  X,
  ChevronDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import MobileSidebar from "@/app/components/Mobilesidebar";
import Header from "@/app/components/Header";
import SuccessModal from "@/app/components/SuccessModal";
import ErrorModal from "@/app/components/ErrorModal";

interface AgencyFormData {
  organisation_id: string;
  user_id: string;
  long_name: string;
  short_name: string;
  location: string;
  ville: string;
  social_network: string;
  description: string;
  greeting_message: string;
}

interface UserData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  userId: string;
}

interface Organization {
  id: string;
  organization_id: string;
  short_name: string;
  long_name: string;
  created_by: string;
  status: string;
}

/**
 * Agency Creation Page Component
 *
 * Create a new agency for the organization
 *
 * @author Félix DJOTIO NDIE
 * @date 2025-01-29
 */
export default function AgencyPage() {
  const router = useRouter();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);
  const [showOrgSelector, setShowOrgSelector] = useState(false);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState<AgencyFormData>({
    organisation_id: "",
    user_id: "",
    long_name: "",
    short_name: "",
    location: "",
    ville: "",
    social_network: "",
    description: "",
    greeting_message: "",
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const MENU_ITEMS = [
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
      const parsedUser = JSON.parse(storedUserData);
      setUserData(parsedUser);
      setFormData((prev) => ({
        ...prev,
        user_id: parsedUser.userId || "",
      }));
    }
  }, [router]);

  useEffect(() => {
    if (userData?.userId) {
      fetchOrganizations();
    }
  }, [userData?.userId]);

  useEffect(() => {
    if (selectedOrganization?.id) {
      setFormData((prev) => ({
        ...prev,
        organisation_id: selectedOrganization.id,
      }));
    }
  }, [selectedOrganization?.id]);

  const fetchOrganizations = async () => {
    setIsLoadingOrgs(true);
    try {
      const authToken =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
      const response = await fetch(
        `${API_BASE_URL}/organizations?page=0&size=1000`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      if (!response.ok)
        throw new Error("Erreur lors du chargement des organisations");

      const data = await response.json();
      const myOrgs = data.filter(
        (org: Organization) =>
          org.created_by === userData?.userId && org.status !== "DELETED",
      );

      setOrganizations(myOrgs);
      if (myOrgs.length > 0 && !selectedOrganization) {
        setSelectedOrganization(myOrgs[0]);
      }
    } catch (error: any) {
      console.error("Fetch Organizations Error:", error);
    } finally {
      setIsLoadingOrgs(false);
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

  const handleSelectOrganization = (org: Organization) => {
    setSelectedOrganization(org);
    setShowOrgSelector(false);
  };

  const validateForm = () => {
    if (!formData.long_name.trim()) {
      setErrorMessage("Le nom complet de l'agence est requis");
      return false;
    }
    if (!formData.short_name.trim()) {
      setErrorMessage("L'abréviation de l'agence est requise");
      return false;
    }
    if (!formData.location.trim()) {
      setErrorMessage("La localisation est requise");
      return false;
    }
    if (!formData.ville.trim()) {
      setErrorMessage("La ville est requise");
      return false;
    }
    if (!formData.organisation_id.trim()) {
      setErrorMessage("L'ID de l'organisation est requis");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setShowErrorModal(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const authToken =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");

      const response = await fetch(`${API_BASE_URL}/agence`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok)
        throw new Error("Erreur lors de la création de l'agence");

      setShowSuccessModal(true);
      setFormData({
        organisation_id: formData.organisation_id,
        user_id: formData.user_id,
        long_name: "",
        short_name: "",
        location: "",
        ville: "",
        social_network: "",
        description: "",
        greeting_message: "",
      });
    } catch (error: any) {
      setErrorMessage(
        "Une erreur est survenue lors de la création de l'agence",
      );
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.long_name &&
      formData.short_name &&
      formData.location &&
      formData.ville &&
      formData.organisation_id
    );
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        menuItems={MENU_ITEMS}
        activePath="/user/organization/agencies"
      />
      <MobileSidebar
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        menuItems={MENU_ITEMS}
        activePath="/user/organization/agencies"
      />

      <div className="dashboard-main">
        <Header
          title="Créer une agence"
          userData={userData}
          onMenuClick={() => setShowMobileMenu(true)}
          userType="organization"
        />

        <main className="dashboard-content">
          {/* Section Header */}
          <div className="section-header">
            <h2 className="section-title">Nouvelle agence</h2>
            <p className="section-description">
              Ajoutez une agence à votre organisation
            </p>
          </div>

          <div className="container" style={{ maxWidth: "1200px" }}>
            {/* Info Box Validation BSM */}
            <div
              style={{
                background: "#dbeafe",
                borderRadius: "var(--radius-lg)",
                padding: "var(--spacing-md)",
                marginBottom: "var(--spacing-xl)",
                display: "flex",
                gap: "var(--spacing-sm)",
                marginTop: "-30px",
              }}
            >
              <AlertCircle
                style={{
                  width: "20px",
                  height: "20px",
                  color: "#2563eb",
                  flexShrink: 0,
                }}
              />
              <div>
                <h3
                  style={{
                    fontWeight: "var(--font-weight-semibold)",
                    color: "#1e3a8a",
                    marginBottom: "4px",
                  }}
                >
                  Validation du Bus Station Manager requise
                </h3>
                <p
                  style={{ fontSize: "var(--font-size-sm)", color: "#1e40af" }}
                >
                  Après la création, votre agence sera soumise à validation par
                  le Bus Station Manager (BSM). Vous serez notifié une fois la
                  validation effectuée.
                </p>
              </div>
            </div>

            {/* Loading Organizations */}
            {isLoadingOrgs && (
              <div className="loading-state">
                <RefreshCw className="spin" />
                <p>Chargement des organisations...</p>
              </div>
            )}

            {/* No Organizations */}
            {!isLoadingOrgs && organizations.length === 0 && (
              <div className="empty-state">
                <Briefcase className="empty-icon" />
                <h3 className="empty-title">Aucune organisation</h3>
                <p className="empty-description">
                  Vous devez créer une organisation avant de créer une agence
                </p>
                <button
                  onClick={() => router.push("/user/organization/organization")}
                  className="btn btn-primary"
                  style={{ marginTop: "15px" }}
                >
                  Créer une organisation
                </button>
              </div>
            )}

            {/* Organization Selector & Form */}
            {!isLoadingOrgs && organizations.length > 0 && (
              <>
                {/* Organization Header */}
                <div className="agency-header-card">
                  <div className="agency-info">
                    <h2 className="agency-name">
                      Nom de l'organisation où vous voulez créer une agence :{" "}
                      {selectedOrganization?.long_name || "Aucune"}
                    </h2>
                    <p className="agency-location">
                      Abréviation du nom de l'organisation :{" "}
                      {selectedOrganization?.short_name}
                    </p>
                  </div>

                  {organizations.length > 1 && (
                    <div className="agency-selector">
                      <button
                        onClick={() => setShowOrgSelector(!showOrgSelector)}
                        className="btn btn-secondary"
                      >
                        Changer
                        <ChevronDown />
                      </button>

                      {showOrgSelector && (
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
                                className={`selector-item ${selectedOrganization?.id === org.id ? "active" : ""}`}
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
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="create-voyage-form">
                  {/* Informations principales */}
                  <div className="form-section">
                    <div className="form-section-header">
                      <Building />
                      <h3>Informations principales</h3>
                    </div>
                    <div className="form-section-content">
                      <div className="form-group">
                        <label className="form-label">
                          Nom complet de l'agence *
                        </label>
                        <input
                          type="text"
                          name="long_name"
                          value={formData.long_name}
                          onChange={handleInputChange}
                          required
                          className="form-input"
                          placeholder="Ex: Agence BusStation Yaoundé Centre"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Abréviation *</label>
                        <input
                          type="text"
                          name="short_name"
                          value={formData.short_name}
                          onChange={handleInputChange}
                          required
                          className="form-input"
                          placeholder="Ex: BST-YDE-CTR"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Localisation */}
                  <div className="form-section">
                    <div className="form-section-header">
                      <MapPin />
                      <h3>Localisation</h3>
                    </div>
                    <div className="form-section-content">
                      <div className="form-group">
                        <label className="form-label">Ville *</label>
                        <select
                          name="ville"
                          value={formData.ville}
                          onChange={handleInputChange}
                          required
                          className="form-input"
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
                      </div>

                      <div className="form-group">
                        <label className="form-label">Zone/Quartier *</label>
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          required
                          className="form-input"
                          placeholder="Ex: Mvan, Marché Central"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Informations supplémentaires */}
                  <div className="form-section">
                    <div className="form-section-header">
                      <Globe />
                      <h3>Informations supplémentaires</h3>
                    </div>
                    <div className="form-section-content">
                      <div className="form-group">
                        <label className="form-label">Réseau social</label>
                        <input
                          type="text"
                          name="social_network"
                          value={formData.social_network}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="Ex: facebook.com/votre-agence"
                        />
                      </div>

                      <div
                        className="form-group"
                        style={{ gridColumn: "1 / -1" }}
                      >
                        <label className="form-label">Message d'accueil</label>
                        <textarea
                          name="greeting_message"
                          value={formData.greeting_message}
                          onChange={handleInputChange}
                          className="form-textarea"
                          placeholder="Message de bienvenue pour vos clients..."
                          style={{ minHeight: "80px" }}
                        />
                      </div>

                      <div
                        className="form-group"
                        style={{ gridColumn: "1 / -1" }}
                      >
                        <label className="form-label">Description</label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          className="form-textarea"
                          placeholder="Description détaillée de l'agence..."
                          style={{ minHeight: "100px" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="form-actions">
                    <button
                      type="button"
                      onClick={() =>
                        router.push("/user/organization/dashboard")
                      }
                      className="btn btn-secondary"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !isFormValid()}
                      className="btn btn-primary"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="spin" />
                          <span>Création en cours...</span>
                        </>
                      ) : (
                        <>
                          <Building2 />
                          <span>Créer l'agence</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </main>
      </div>

      <SuccessModal
        show={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push("/user/organization/dashboard");
        }}
        title="Agence créée !"
        message="Demande de création réussie avec succès, veuillez attendre la validation par le BSM."
        buttonText="Retour au dashboard"
      />

      <ErrorModal
        show={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={errorMessage}
      />
    </div>
  );
}
