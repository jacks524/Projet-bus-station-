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
  Building,
  Mail,
  FileText,
  Briefcase,
  Users,
  Calendar,
  DollarSign,
  Hash,
  Globe,
  CheckCircle,
  XCircle,
  User,
  Tag,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../../providers";

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
 * DG Organisation Page Component
 *
 * Form to create a new organization
 * Features comprehensive organization details with validation
 *
 * @author Thomas Djotio Ndié
 * @date 2025-01-14
 */
export default function DGOrganisationPage() {
  const [form_data, setFormData] = useState<OrganizationFormData>({
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

  const [keywords_input, setKeywordsInput] = useState("");
  const [business_domains_input, setBusinessDomainsInput] = useState("");

  const [is_loading, setIsLoading] = useState(false);
  const [show_success_modal, setShowSuccessModal] = useState(false);
  const [show_error_modal, setShowErrorModal] = useState(false);
  const [error_message, setErrorMessage] = useState("");
  const [organization_response, setOrganizationResponse] = useState<any>(null);

  const [show_profile_menu, setShowProfileMenu] = useState(false);
  const [show_mobile_menu, setShowMobileMenu] = useState(false);
  const [user_data, setDgData] = useState<UserData | null>(null);

  const router = useRouter();
  const { t } = useLanguage();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const BUTTON_COLOR = "#6149CD";

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
      label: t("Mes paramètres", "Settings"),
      path: "/user/organization/settings",
      active: false,
    },
  ];

  const LEGAL_FORMS = [
    { value: "SARL", label: t("SARL", "SARL") },
    { value: "SA", label: t("SA", "SA") },
    { value: "SAS", label: t("SAS", "SAS") },
    {
      value: "Entreprise individuelle",
      label: t("Entreprise individuelle", "Sole proprietorship"),
    },
    { value: "Association", label: t("Association", "Association") },
    { value: "Coopérative", label: t("Coopérative", "Cooperative") },
    { value: "GIE", label: t("GIE", "GIE") },
    { value: "Autre", label: t("Autre", "Other") },
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

      setFormData((prev) => ({
        ...prev,
        user_id: parsed_user.userId || "",
        ceo_name: parsed_user.last_name || "",
      }));
    }
  }, []);

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
      keywords_input.trim() &&
      !form_data.keywords.includes(keywords_input.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        keywords: [...prev.keywords, keywords_input.trim()],
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
      business_domains_input.trim() &&
      !form_data.business_domains.includes(business_domains_input.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        business_domains: [
          ...prev.business_domains,
          business_domains_input.trim(),
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
    if (!form_data.long_name.trim()) {
      setErrorMessage(
        t(
          "Le nom complet de l'organisation est requis",
          "The organization's full name is required"
        ),
      );
      return false;
    }
    if (!form_data.short_name.trim()) {
      setErrorMessage(t("L'abréviation est requise", "The abbreviation is required"));
      return false;
    }
    if (!form_data.ceo_name.trim()) {
      setErrorMessage(
        t("Le nom du dirigeant est requis", "The leader's name is required"),
      );
      return false;
    }
    if (!form_data.email.trim()) {
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

    setIsLoading(true);
    setErrorMessage("");
    console.log(form_data);
    try {
      const auth_token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");

      const response = await fetch(`${API_BASE_URL}/organizations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth_token}`,
        },
        body: JSON.stringify(form_data),
      });

      if (!response.ok) {
        throw new Error(
          t("Erreur lors de la création de l'organisation", "Error creating organization"),
        );
      }

      const data = await response.json();
      setOrganizationResponse(data);
      setShowSuccessModal(true);

      setFormData({
        email: form_data.email,
        user_id: form_data.user_id,
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
          "An error occurred while creating the organization"
        ),
      );
      setShowErrorModal(true);
      console.error("Create Organization Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("user_data");
    router.push("/login");
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
              className="fixed inset-0 z-40 lg:hidden"
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
                {t("Créer une organisation", "Create an organization")}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/user/organization/settings")}
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
                    {user_data?.username}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>

                {show_profile_menu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        router.push("/user/organization/settings");
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">
                        {t("Paramètres", "Settings")}
                      </span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 transition-colors text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t("Se déconnecter", "Sign out")}</span>
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
            {/* Carte fusionnée : formulaire + image */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Image de fond en haut de la carte */}
              <div className="relative h-64">
                <img
                  src="/images/orga.jpg"
                  alt={t("Organisation", "Organization")}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=400&fit=crop";
                  }}
                />
                <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/50 to-transparent"></div>
                <div className="absolute inset-0 flex flex-col justify-center px-8">
                  <h2 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">
                    {t("Nouvelle organisation", "New organization")}
                  </h2>
                  <p className="text-xl text-white/90 drop-shadow-md">
                    {t(
                      "Créez votre organisation de voyage",
                      "Create your travel organization"
                    )}
                  </p>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="p-8">
                {/* Section 1 : Informations générales */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <Building className="w-6 h-6 text-[#6149CD]" />
                    <span>{t("Informations générales", "General information")}</span>
                  </h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t("Nom complet *", "Full name *")}
                        </label>
                        <input
                          type="text"
                          name="long_name"
                          value={form_data.long_name}
                          onChange={handleInputChange}
                          placeholder={t(
                            "Ex: BusStation Travel & Tours",
                            "e.g., BusStation Travel & Tours"
                          )}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t("Abréviation *", "Abbreviation *")}
                        </label>
                        <input
                          type="text"
                          name="short_name"
                          value={form_data.short_name}
                          onChange={handleInputChange}
                          placeholder={t("Ex: SPT", "e.g., SPT")}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t("Email *", "Email *")}
                        </label>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            name="email"
                            value={form_data.email}
                            onChange={handleInputChange}
                            placeholder={t(
                              "contact@organisation.com",
                              "contact@organization.com"
                            )}
                            required
                            className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t("Nom du dirigeant *", "Leader name *")}
                        </label>
                        <div className="flex items-center space-x-2">
                          <User className="w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="ceo_name"
                            value={form_data.ceo_name}
                            onChange={handleInputChange}
                            placeholder={t("Ex: Jean Dupont", "e.g., Jean Dupont")}
                            required
                            disabled
                            className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all bg-gray-100 cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("Description", "Description")}
                      </label>
                      <div className="flex items-start space-x-2">
                        <FileText className="w-5 h-5 text-gray-400 mt-3" />
                        <textarea
                          name="description"
                          value={form_data.description}
                          onChange={handleInputChange}
                          placeholder={t(
                            "Description de l'organisation...",
                            "Organization description..."
                          )}
                          rows={4}
                          className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2 : Informations légales */}
                <div className="mb-8 pt-8 border-t border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <FileText className="w-6 h-6 text-[#6149CD]" />
                    <span>{t("Informations légales", "Legal information")}</span>
                  </h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t("Forme juridique", "Legal form")}
                        </label>
                        <select
                          name="legal_form"
                          value={form_data.legal_form}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all"
                        >
                          <option value="">
                            {t("Sélectionner une forme", "Select a form")}
                          </option>
                          {LEGAL_FORMS.map((form) => (
                            <option key={form.value} value={form.value}>
                              {form.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t(
                            "N° de registre de commerce",
                            "Business registration number"
                          )}
                        </label>
                        <input
                          type="text"
                          name="business_registration_number"
                          value={form_data.business_registration_number}
                          onChange={handleInputChange}
                          placeholder={t(
                            "Ex: RC/YAO/2024/B/1234",
                            "e.g., RC/YAO/2024/B/1234"
                          )}
                          className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t("Numéro fiscal", "Tax number")}
                        </label>
                        <input
                          type="text"
                          name="tax_number"
                          value={form_data.tax_number}
                          onChange={handleInputChange}
                          placeholder={t(
                            "Ex: M012345678901X",
                            "e.g., M012345678901X"
                          )}
                          className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t("Capital social", "Share capital")}
                        </label>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="capital_share"
                            value={form_data.capital_share}
                            onChange={handleInputChange}
                            placeholder={t("Ex: 5000000 XAF", "e.g., 5000000 XAF")}
                            className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t("Date d'enregistrement", "Registration date")}
                        </label>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <input
                            type="datetime-local"
                            name="registration_date"
                            value={form_data.registration_date}
                            onChange={handleInputChange}
                            className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t("Date de création", "Creation date")}
                        </label>
                        <input
                          type="datetime-local"
                          name="year_founded"
                          value={form_data.year_founded}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3 : Informations opérationnelles */}
                <div className="mb-8 pt-8 border-t border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <Users className="w-6 h-6 text-[#6149CD]" />
                    <span>
                      {t("Informations opérationnelles", "Operational information")}
                    </span>
                  </h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t("Nombre d'employés", "Number of employees")}
                        </label>
                        <input
                          type="number"
                          name="number_of_employees"
                          value={form_data.number_of_employees}
                          onChange={handleInputChange}
                          placeholder={t("Ex: 50", "e.g., 50")}
                          min="0"
                          className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t("Site web", "Website")}
                        </label>
                        <div className="flex items-center space-x-2">
                          <Globe className="w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="web_site_url"
                            value={form_data.web_site_url}
                            onChange={handleInputChange}
                            placeholder={t("exemple.com", "example.com")}
                            className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t("URL du logo", "Logo URL")}
                        </label>
                        <div className="flex items-center space-x-2">
                          <Globe className="w-5 h-5 text-gray-400" />
                          <input
                            type="url"
                            name="logo_url"
                            value={form_data.logo_url}
                            onChange={handleInputChange}
                            placeholder={t(
                              "https://exemple.com/logo.png",
                              "https://example.com/logo.png"
                            )}
                            className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 4 : Domaines d'activité */}
                <div className="mb-8 pt-8 border-t border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <Briefcase className="w-6 h-6 text-[#6149CD]" />
                    <span>{t("Domaines d'activité", "Business domains")}</span>
                  </h3>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("Ajouter un domaine", "Add a domain")}
                    </label>
                    <div className="flex items-center space-x-2 mb-3">
                      <input
                        type="text"
                        value={business_domains_input}
                        onChange={(e) =>
                          setBusinessDomainsInput(e.target.value)
                        }
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddBusinessDomain();
                          }
                        }}
                        placeholder={t(
                          "Ex: Transport interurbain",
                          "e.g., Intercity transport"
                        )}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={handleAddBusinessDomain}
                        style={{ backgroundColor: BUTTON_COLOR }}
                        className="px-6 py-3 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                      >
                        {t("Ajouter", "Add")}
                      </button>
                    </div>

                    {form_data.business_domains.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {form_data.business_domains.map((domain, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center space-x-2 px-3 py-2 bg-[#6149CD] bg-opacity-10 text-white rounded-lg"
                          >
                            <span>{domain}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveBusinessDomain(domain)}
                              className="hover:text-red-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 5 : Mots-clés */}
                <div className="pt-8 border-t border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <Tag className="w-6 h-6 text-[#6149CD]" />
                    <span>{t("Mots-clés", "Keywords")}</span>
                  </h3>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("Ajouter un mot-clé", "Add a keyword")}
                    </label>
                    <div className="flex items-center space-x-2 mb-3">
                      <input
                        type="text"
                        value={keywords_input}
                        onChange={(e) => setKeywordsInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddKeyword();
                          }
                        }}
                        placeholder={t(
                          "Ex: voyage, transport, tourisme",
                          "e.g., travel, transport, tourism"
                        )}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={handleAddKeyword}
                        style={{ backgroundColor: BUTTON_COLOR }}
                        className="px-6 py-3 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                      >
                        {t("Ajouter", "Add")}
                      </button>
                    </div>

                    {form_data.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {form_data.keywords.map((keyword, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg"
                          >
                            <Hash className="w-4 h-4" />
                            <span>{keyword}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveKeyword(keyword)}
                              className="hover:text-red-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-between mt-8 pt-8 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => router.push("/user/organization/dashboard")}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 active:bg-gray-200 transition-colors"
                  >
                    {t("Annuler", "Cancel")}
                  </button>

                  <button
                    type="submit"
                    disabled={is_loading}
                    style={{ backgroundColor: BUTTON_COLOR }}
                    className="px-8 py-3 text-white rounded-xl font-semibold hover:opacity-90 active:opacity-80 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {is_loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{t("Création en cours...", "Creating...")}</span>
                      </>
                    ) : (
                      <>
                        <Building className="w-5 h-5" />
                        <span>{t("Créer l'organisation", "Create organization")}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>

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
                {t("Succès !", "Success!")}
              </h2>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                {t(
                  "Organisation créée avec succès",
                  "Organization created successfully"
                )}
              </p>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push("/user/organization/dashboard");
                }}
                className="w-full py-2.5 sm:py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors text-sm sm:text-base"
              >
                {t("Fermer", "Close")}
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
                {t("Erreur", "Error")}
              </h2>
              <div className="bg-red-50 rounded-xl p-4 mb-6">
                <p className="text-sm sm:text-base text-red-800">
                  {error_message}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowErrorModal(false);
                }}
                className="w-full py-2.5 sm:py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors text-sm sm:text-base"
              >
                {t("Fermer", "Close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
