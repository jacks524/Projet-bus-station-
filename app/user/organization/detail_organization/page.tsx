"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Home,
  Building2,
  Settings,
  Briefcase,
  Mail,
  FileText,
  Globe,
  Hash,
  User,
  RefreshCw,
  ArrowLeft,
  Edit,
  Save,
  X,
  Trash2,
  DollarSign,
  Calendar,
} from "lucide-react";
import Sidebar from "@/app/components/Sidebar";
import MobileSidebar from "@/app/components/Mobilesidebar";
import Header from "@/app/components/Header";
import SuccessModal from "@/app/components/SuccessModal";
import ErrorModal from "@/app/components/ErrorModal";
import ConfirmModal from "@/app/components/ConfirmModal";

interface OrganizationData {
  id: string;
  organization_id: string;
  email: string;
  description: string;
  keywords: string[];
  long_name: string;
  short_name: string;
  business_domains: string[];
  logo_url: string;
  legal_form: string;
  website_url: string;
  social_network: string;
  business_registration_number: string;
  tax_number: string;
  capital_share: number;
  registration_date: string;
  ceo_name: string;
  year_founded: string;
  created_at: string;
  status: string;
}

interface UserData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  userId: string;
  role: string[];
}

const LEGAL_FORMS = [
  "SARL",
  "SA",
  "SAS",
  "Entreprise individuelle",
  "Association",
  "Coopérative",
  "GIE",
  "Autre",
];

function DetailOrganizationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const organizationId = searchParams.get("id");

  const [organization, setOrganization] = useState<OrganizationData | null>(
    null,
  );
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<OrganizationData>>({});

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
      active: true,
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

    if (organizationId) {
      fetchOrganizationDetails();
    }
  }, [organizationId]);

  const fetchOrganizationDetails = async () => {
    setIsLoading(true);
    try {
      const authToken =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      if (!response.ok) throw new Error("Erreur lors du chargement");

      const data = await response.json();
      setOrganization(data);
      setFormData(data);
    } catch (error: any) {
      setErrorMessage("Impossible de charger les détails de l'organisation");
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
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
        email: formData.email,
        description: formData.description,
        long_name: formData.long_name,
        short_name: formData.short_name,
        business_domains: formData.business_domains,
        legal_form: formData.legal_form,
        website_url: formData.website_url,
        social_network: formData.social_network,
        business_registration_number: formData.business_registration_number,
        tax_number: formData.tax_number,
        capital_share: formData.capital_share,
      };

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(updateBody),
        },
      );

      if (!response.ok) throw new Error("Erreur lors de la mise à jour");

      setShowSuccessModal(true);
      setEditMode(false);
      fetchOrganizationDetails();
    } catch (error: any) {
      setErrorMessage("Erreur lors de la mise à jour de l'organisation");
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
      const response = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      if (!response.ok) throw new Error("Erreur lors de la suppression");

      router.push("/user/organization/dashboard");
    } catch (error: any) {
      setErrorMessage(
        "Erreur lors de la suppression de l'organisation, vérifiez qu'aucune agence n'y est associée.",
      );
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

  if (isLoading) {
    return (
      <div className="dashboard-layout">
        <Sidebar
          menuItems={menuItems}
          activePath="/user/organization/organization"
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

  if (!organization) {
    return (
      <div className="dashboard-layout">
        <Sidebar
          menuItems={menuItems}
          activePath="/user/organization/organization"
        />
        <div className="dashboard-main">
          <div className="empty-state">
            <Briefcase className="empty-icon" />
            <h3 className="empty-title">Organisation introuvable</h3>
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
      <Sidebar
        menuItems={menuItems}
        activePath="/user/organization/organization"
      />
      <MobileSidebar
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        menuItems={menuItems}
        activePath="/user/organization/organization"
      />

      <div className="dashboard-main">
        <Header
          title="Détails de l'organisation"
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
                        setFormData(organization);
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

            {/* Organization Header Card */}
            <div className="agency-detail-header">
              <div className="agency-detail-avatar">
                {organization.short_name?.substring(0, 2).toUpperCase()}
              </div>
              <div className="agency-detail-info">
                <h2 className="agency-detail-name">{organization.long_name}</h2>
                <p className="agency-detail-short">{organization.short_name}</p>
                <div className="agency-detail-location">
                  <Hash />
                  <span>ID: {organization.organization_id}</span>
                </div>
              </div>
              <div className="agency-detail-status">
                <span className="status-badge status-validee">
                  {organization.status}
                </span>
              </div>
            </div>

            {/* Information Sections */}
            <div className="settings-sections">
              {/* Informations générales */}
              <div className="settings-section">
                <div className="settings-section-header">
                  <Briefcase style={{ width: "20px", height: "20px" }} />
                  <h3 className="settings-section-title">
                    Informations générales
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
                      <div className="settings-value">
                        {organization.long_name}
                      </div>
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
                      <div className="settings-value">
                        {organization.short_name}
                      </div>
                    )}
                  </div>
                  <div className="settings-field">
                    <label className="settings-label">
                      <Mail style={{ width: "16px", height: "16px" }} />
                      Email
                    </label>
                    {editMode ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ""}
                        onChange={handleInputChange}
                        className="form-input"
                        style={{ width: "fit-content" }}
                      />
                    ) : (
                      <div className="settings-value">{organization.email}</div>
                    )}
                  </div>
                  <div className="settings-field">
                    <label className="settings-label">
                      <User style={{ width: "16px", height: "16px" }} />
                      Nom du dirigeant
                    </label>
                    <div className="settings-value">
                      {organization.ceo_name || "Non renseigné"}
                    </div>
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
                        {organization.description || "Non renseignée"}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Informations légales */}
              <div className="settings-section">
                <div className="settings-section-header">
                  <FileText style={{ width: "20px", height: "20px" }} />
                  <h3 className="settings-section-title">
                    Informations légales
                  </h3>
                </div>
                <div className="settings-section-content">
                  <div className="settings-field">
                    <label className="settings-label">Forme juridique</label>
                    {editMode ? (
                      <select
                        name="legal_form"
                        value={formData.legal_form || ""}
                        onChange={handleInputChange}
                        className="form-select"
                        style={{ width: "fit-content" }}
                      >
                        <option value="">Sélectionner</option>
                        {LEGAL_FORMS.map((form) => (
                          <option key={form} value={form}>
                            {form}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="settings-value">
                        {organization.legal_form || "Non renseignée"}
                      </div>
                    )}
                  </div>
                  <div className="settings-field">
                    <label className="settings-label">
                      N° registre de commerce
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        name="business_registration_number"
                        value={formData.business_registration_number || ""}
                        onChange={handleInputChange}
                        className="form-input"
                        style={{ width: "fit-content" }}
                      />
                    ) : (
                      <div className="settings-value">
                        {organization.business_registration_number ||
                          "Non renseigné"}
                      </div>
                    )}
                  </div>
                  <div className="settings-field">
                    <label className="settings-label">Numéro fiscal</label>
                    {editMode ? (
                      <input
                        type="text"
                        name="tax_number"
                        value={formData.tax_number || ""}
                        onChange={handleInputChange}
                        className="form-input"
                        style={{ width: "fit-content" }}
                      />
                    ) : (
                      <div className="settings-value">
                        {organization.tax_number || "Non renseigné"}
                      </div>
                    )}
                  </div>
                  <div className="settings-field">
                    <label className="settings-label">
                      <DollarSign style={{ width: "16px", height: "16px" }} />
                      Capital social
                    </label>
                    {editMode ? (
                      <input
                        type="number"
                        name="capital_share"
                        value={formData.capital_share || ""}
                        onChange={handleInputChange}
                        className="form-input"
                        style={{ width: "fit-content" }}
                      />
                    ) : (
                      <div className="settings-value">
                        {organization.capital_share
                          ? `${organization.capital_share} FCFA`
                          : "Non renseigné"}
                      </div>
                    )}
                  </div>
                  <div className="settings-field">
                    <label className="settings-label">
                      <Calendar style={{ width: "16px", height: "16px" }} />
                      Date d'enregistrement
                    </label>
                    <div className="settings-value">
                      {formatDate(organization.registration_date)}
                    </div>
                  </div>
                  <div className="settings-field">
                    <label className="settings-label">Année de création</label>
                    <div className="settings-value">
                      {organization.year_founded || "Non renseignée"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations web */}
              <div className="settings-section">
                <div className="settings-section-header">
                  <Globe style={{ width: "20px", height: "20px" }} />
                  <h3 className="settings-section-title">Informations web</h3>
                </div>
                <div className="settings-section-content">
                  <div
                    className="settings-field"
                    style={{ gridColumn: "1 / -1" }}
                  >
                    <label className="settings-label">
                      <Globe style={{ width: "16px", height: "16px" }} />
                      Site web
                    </label>
                    {editMode ? (
                      <input
                        type="url"
                        name="website_url"
                        value={formData.website_url || ""}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="https://exemple.com"
                        style={{ width: "fit-content" }}
                      />
                    ) : organization.website_url ? (
                      <a
                        href={organization.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="detail-link"
                      >
                        {organization.website_url}
                      </a>
                    ) : (
                      <div className="settings-value">Non renseigné</div>
                    )}
                  </div>
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
                        placeholder="https://facebook.com/..."
                        style={{ width: "fit-content" }}
                      />
                    ) : organization.social_network ? (
                      <a
                        href={"https://" + organization.social_network}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="detail-link"
                      >
                        {organization.social_network}
                      </a>
                    ) : (
                      <div className="settings-value">Non renseigné</div>
                    )}
                  </div>
                  <div
                    className="settings-field"
                    style={{ gridColumn: "1 / -1" }}
                  >
                    <label className="settings-label">Logo URL</label>
                    <div className="settings-value">
                      {organization.logo_url || "Non renseigné"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations supplémentaires */}
              <div className="settings-section">
                <div className="settings-section-header">
                  <Hash style={{ width: "20px", height: "20px" }} />
                  <h3 className="settings-section-title">
                    Informations supplémentaires
                  </h3>
                </div>
                <div className="settings-section-content">
                  <div
                    className="settings-field"
                    style={{ gridColumn: "1 / -1" }}
                  >
                    <label className="settings-label">Mots-clés</label>
                    <div className="keywords-container">
                      {organization.keywords &&
                      organization.keywords.length > 0 ? (
                        organization.keywords.map((keyword, index) => (
                          <span key={index} className="keyword-badge">
                            <Hash style={{ width: "14px", height: "14px" }} />
                            {keyword}
                          </span>
                        ))
                      ) : (
                        <div className="settings-value">Aucun mot-clé</div>
                      )}
                    </div>
                  </div>
                  <div
                    className="settings-field"
                    style={{ gridColumn: "1 / -1" }}
                  >
                    <label className="settings-label">
                      Domaines d'activité
                    </label>
                    <div className="keywords-container">
                      {organization.business_domains &&
                      organization.business_domains.length > 0 ? (
                        organization.business_domains.map((domain, index) => (
                          <span key={index} className="domain-badge">
                            {domain}
                          </span>
                        ))
                      ) : (
                        <div className="settings-value">
                          Aucun domaine d'activité
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="settings-field">
                    <label className="settings-label">Date de création</label>
                    <div className="settings-value">
                      {formatDate(organization.created_at)}
                    </div>
                  </div>
                  <div className="settings-field">
                    <label className="settings-label">Statut</label>
                    <span className="status-badge status-validee">
                      {organization.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <ConfirmModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Supprimer l'organisation"
        message={`Êtes-vous sûr de vouloir supprimer l'organisation ${organization?.long_name} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        isLoading={isDeleting}
      />

      <SuccessModal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Organisation mise à jour !"
        message="Les informations de l'organisation ont été mises à jour avec succès."
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

export default function DetailOrganizationPage() {
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
      <DetailOrganizationContent />
    </Suspense>
  );
}
