"use client";

import React, { useState, useEffect } from "react";
import {
  Home,
  Building2,
  Settings,
  Briefcase,
  Building,
  Mail,
  FileText,
  Users,
  Calendar,
  DollarSign,
  Hash,
  Globe,
  User,
  Tag,
  RefreshCw,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import MobileSidebar from "@/app/components/Mobilesidebar";
import Header from "@/app/components/Header";
import SuccessModal from "@/app/components/SuccessModal";
import ErrorModal from "@/app/components/ErrorModal";
import { useLanguage } from "@/app/providers";

interface OrganizationFormData {
  email: string;
  description: string;
  keywords: string[];
  user_id: string;
  long_name: string;
  short_name: string;
  business_domains: string[];
  logo_url: string;
  legal_form: string;
  business_registration_number: string;
  tax_number: string;
  capital_share: string;
  registration_date: string;
  ceo_name: string;
  year_founded: string;
  number_of_employees: string;
  web_site_url: string;
}

interface UserData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  userId: string;
}

/**
 * Organization Creation Page Component
 *
 * Create a new organization with professional form
 *
 * @author Félix DJOTIO NDIE
 * @date 2025-01-29
 */
export default function OrganizationPage() {
  const router = useRouter();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [keywordsInput, setKeywordsInput] = useState("");
  const [businessDomainsInput, setBusinessDomainsInput] = useState("");
  const { t } = useLanguage();

  const [formData, setFormData] = useState<OrganizationFormData>({
    email: "",
    description: "",
    keywords: [],
    user_id: "",
    long_name: "",
    short_name: "",
    business_domains: [],
    logo_url: "",
    legal_form: "",
    business_registration_number: "",
    tax_number: "",
    capital_share: "",
    registration_date: "",
    ceo_name: "",
    year_founded: "",
    number_of_employees: "",
    web_site_url: "",
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const MENU_ITEMS = [
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
      active: true,
    },
    {
      icon: Building2,
      label: t("Agence", "Agency"),
      path: "/user/organization/agencies",
      active: false,
    },
    {
      icon: Settings,
      label: t("Mes paramètres", "My settings"),
      path: "/user/organization/settings",
      active: false,
    },
  ];

  const LEGAL_FORMS = [
    "SARL",
    "SA",
    "SAS",
    t("Entreprise individuelle", "Sole proprietorship"),
    t("Association", "Association"),
    t("Coopérative", "Cooperative"),
    "GIE",
    t("Autre", "Other"),
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
        ceo_name: parsedUser.last_name || "",
      }));
    }
  }, [router]);

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

  const handleAddKeyword = () => {
    if (
      keywordsInput.trim() &&
      !formData.keywords.includes(keywordsInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        keywords: [...prev.keywords, keywordsInput.trim()],
      }));
      setKeywordsInput("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k !== keyword),
    }));
  };

  const handleAddBusinessDomain = () => {
    if (
      businessDomainsInput.trim() &&
      !formData.business_domains.includes(businessDomainsInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        business_domains: [
          ...prev.business_domains,
          businessDomainsInput.trim(),
        ],
      }));
      setBusinessDomainsInput("");
    }
  };

  const handleRemoveBusinessDomain = (domain: string) => {
    setFormData((prev) => ({
      ...prev,
      business_domains: prev.business_domains.filter((d) => d !== domain),
    }));
  };

  const validateForm = () => {
    if (!formData.long_name.trim()) {
      setErrorMessage(
        t(
          "Le nom complet de l'organisation est requis",
          "Organization full name is required",
        ),
      );
      return false;
    }
    if (!formData.short_name.trim()) {
      setErrorMessage(t("L'abréviation est requise", "Abbreviation is required"));
      return false;
    }
    if (!formData.ceo_name.trim()) {
      setErrorMessage(
        t("Le nom du dirigeant est requis", "Executive name is required"),
      );
      return false;
    }
    if (!formData.email.trim()) {
      setErrorMessage(t("L'email est requis", "Email is required"));
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

      const response = await fetch(`${API_BASE_URL}/organizations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(
          t(
            "Erreur lors de la création de l'organisation",
            "Failed to create organization",
          ),
        );
      }

      setShowSuccessModal(true);
      setFormData({
        email: formData.email,
        user_id: formData.user_id,
        description: "",
        keywords: [],
        long_name: "",
        short_name: "",
        business_domains: [],
        logo_url: "",
        legal_form: "",
        business_registration_number: "",
        tax_number: "",
        capital_share: "",
        registration_date: "",
        ceo_name: "",
        year_founded: "",
        number_of_employees: "",
        web_site_url: "",
      });
    } catch (error: any) {
      setErrorMessage(
        t(
          "Une erreur est survenue lors de la création de l'organisation",
          "An error occurred while creating the organization",
        ),
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
      formData.ceo_name &&
      formData.email
    );
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        menuItems={MENU_ITEMS}
        activePath="/user/organization/organization"
      />
      <MobileSidebar
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        menuItems={MENU_ITEMS}
        activePath="/user/organization/organization"
      />

      <div className="dashboard-main">
        <Header
          title={t("Créer une organisation", "Create an organization")}
          userData={userData}
          onMenuClick={() => setShowMobileMenu(true)}
          userType="organization"
        />

        <main className="dashboard-content">
          <div className="container" style={{ maxWidth: "1200px" }}>
            <div className="section-header">
              <h2 className="section-title">
                {t("Nouvelle organisation", "New organization")}
              </h2>
              <p className="section-description">
                {t("Créez votre organisation de voyage", "Create your travel organization")}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="create-voyage-form">
              {/* Informations générales */}
              <div className="form-section">
                <div className="form-section-header">
                  <Building />
                  <h3>{t("Informations générales", "General information")}</h3>
                </div>
                <div className="form-section-content">
                  <div className="form-group">
                    <label className="form-label">{t("Nom complet *", "Full name *")}</label>
                    <input
                      type="text"
                      name="long_name"
                      value={formData.long_name}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder={t(
                        "Ex: BusStation Travel & Tours",
                        "e.g., BusStation Travel & Tours",
                      )}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {t("Abréviation *", "Abbreviation *")}
                    </label>
                    <input
                      type="text"
                      name="short_name"
                      value={formData.short_name}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder={t("Ex: BTT", "e.g., BTT")}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t("Email *", "Email *")}</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder={t(
                        "contact@organisation.com",
                        "contact@organization.com",
                      )}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {t("Nom du dirigeant *", "Executive name *")}
                    </label>
                    <input
                      type="text"
                      name="ceo_name"
                      value={formData.ceo_name}
                      onChange={handleInputChange}
                      required
                      disabled
                      className="form-input"
                      style={{
                        backgroundColor: "var(--gray-100)",
                        cursor: "not-allowed",
                      }}
                    />
                    <p className="form-helper-text">
                      {t(
                        "Rempli automatiquement avec votre nom",
                        "Automatically filled with your name",
                      )}
                    </p>
                  </div>

                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label className="form-label">
                      {t("Description", "Description")}
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="form-textarea"
                      placeholder={t(
                        "Description de l'organisation...",
                        "Organization description...",
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Informations légales */}
              <div className="form-section">
                <div className="form-section-header">
                  <FileText />
                  <h3>{t("Informations légales", "Legal information")}</h3>
                </div>
                <div className="form-section-content">
                  <div className="form-group">
                    <label className="form-label">
                      {t("Forme juridique", "Legal form")}
                    </label>
                    <select
                      name="legal_form"
                      value={formData.legal_form}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="">
                        {t("Sélectionner une forme", "Select a form")}
                      </option>
                      {LEGAL_FORMS.map((form) => (
                        <option key={form} value={form}>
                          {form}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {t("N° de registre de commerce", "Business registration number")}
                    </label>
                    <input
                      type="text"
                      name="business_registration_number"
                      value={formData.business_registration_number}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder={t("Ex: RC/YAO/2024/B/1234", "e.g., RC/YAO/2024/B/1234")}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {t("Numéro fiscal", "Tax number")}
                    </label>
                    <input
                      type="text"
                      name="tax_number"
                      value={formData.tax_number}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder={t("Ex: M012345678901X", "e.g., M012345678901X")}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {t("Capital social", "Share capital")}
                    </label>
                    <input
                      type="text"
                      name="capital_share"
                      value={formData.capital_share}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder={t("Ex: 5000000 XAF", "e.g., 5000000 XAF")}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {t("Date d'enregistrement", "Registration date")}
                    </label>
                    <input
                      type="datetime-local"
                      name="registration_date"
                      value={formData.registration_date}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {t("Date de création", "Founding date")}
                    </label>
                    <input
                      type="datetime-local"
                      name="year_founded"
                      value={formData.year_founded}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Informations opérationnelles */}
              <div className="form-section">
                <div className="form-section-header">
                  <Users />
                  <h3>{t("Informations opérationnelles", "Operational information")}</h3>
                </div>
                <div className="form-section-content">
                  <div className="form-group">
                    <label className="form-label">
                      {t("Nombre d'employés", "Number of employees")}
                    </label>
                    <input
                      type="number"
                      name="number_of_employees"
                      value={formData.number_of_employees}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder={t("Ex: 50", "e.g., 50")}
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t("Site web", "Website")}</label>
                    <input
                      type="text"
                      name="web_site_url"
                      value={formData.web_site_url}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder={t("exemple.com", "example.com")}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {t("URL du logo", "Logo URL")}
                    </label>
                    <input
                      type="url"
                      name="logo_url"
                      value={formData.logo_url}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder={t(
                        "https://exemple.com/logo.png",
                        "https://example.com/logo.png",
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Mots-clés */}
              <div className="form-section">
                <div className="form-section-header">
                  <Tag />
                  <h3>{t("Mots-clés", "Keywords")}</h3>
                </div>
                <div
                  className="form-section-content"
                  style={{ gridColumn: "1 / -1" }}
                >
                  <div className="tag-input-container">
                    <input
                      type="text"
                      value={keywordsInput}
                      onChange={(e) => setKeywordsInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddKeyword();
                        }
                      }}
                      className="form-input"
                      placeholder={t("Ex: voyage, tourisme", "e.g., travel, tourism")}
                      style={{ width: "fit-content" }}
                    />
                    <button
                      type="button"
                      onClick={handleAddKeyword}
                      className="btn btn-secondary"
                    >
                      {t("Ajouter", "Add")}
                    </button>
                  </div>

                  {formData.keywords.length > 0 && (
                    <div
                      className="tags-display"
                      style={{ marginLeft: "auto", display: "flex" }}
                    >
                      {formData.keywords.map((keyword, index) => (
                        <span key={index} className="tag-item tag-item-keyword">
                          <Hash style={{ width: "14px", height: "14px" }} />
                          <span>{keyword}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveKeyword(keyword)}
                            className="tag-remove"
                          >
                            <X style={{ width: "14px", height: "14px" }} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => router.push("/user/organization/dashboard")}
                  className="btn btn-secondary"
                >
                  {t("Annuler", "Cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !isFormValid()}
                  className="btn btn-primary"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="spin" />
                      <span>{t("Création en cours...", "Creating...")}</span>
                    </>
                  ) : (
                    <>
                      <Building />
                      <span>{t("Créer l'organisation", "Create organization")}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>

      <SuccessModal
        show={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push("/user/organization/dashboard");
        }}
        title={t("Organisation créée !", "Organization created!")}
        message={t("Organisation créée avec succès", "Organization created successfully")}
        buttonText={t("Retour au dashboard", "Back to dashboard")}
      />

      <ErrorModal
        show={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={errorMessage}
      />
    </div>
  );
}
