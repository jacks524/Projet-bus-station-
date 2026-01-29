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
  MapPin,
  Building,
  Globe,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Briefcase,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../../providers";

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
 * DG Agence Page Component
 *
 * Form to create a new agency for the organization
 * Features validation by BSM after submission
 *
 * @author Thomas Djotio Ndié
 * @date 2025-01-14
 */
export default function DGAgencePage() {
  const [form_data, setFormData] = useState<AgencyFormData>({
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

  const [is_loading, setIsLoading] = useState(false);
  const [show_success_modal, setShowSuccessModal] = useState(false);
  const [show_error_modal, setShowErrorModal] = useState(false);
  const [error_message, setErrorMessage] = useState("");
  const [agency_response, setAgencyResponse] = useState<any>(null);

  const [show_profile_menu, setShowProfileMenu] = useState(false);
  const [show_mobile_menu, setShowMobileMenu] = useState(false);
  const [user_data, setDgData] = useState<UserData | null>(null);

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selected_organization, setSelectedOrganization] =
    useState<Organization | null>(null);
  const [show_org_selector, setShowOrgSelector] = useState(false);
  const [is_loading_orgs, setIsLoadingOrgs] = useState(true);

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
      active: false,
    },
    {
      icon: Building2,
      label: t("Agence", "Agency"),
      path: "/user/organization/agencies",
      active: true,
    },
    {
      icon: Settings,
      label: t("Mes paramètres", "Settings"),
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

      setFormData((prev) => ({
        ...prev,
        user_id: parsed_user.userId || "",
      }));
    }
  }, []);

  useEffect(() => {
    if (user_data?.userId) {
      fetchOrganizations();
    }
  }, [user_data?.userId]);

  useEffect(() => {
    if (selected_organization?.id) {
      setFormData((prev) => ({
        ...prev,
        organisation_id: selected_organization.id,
      }));
    }
  }, [selected_organization?.id]);

  const fetchOrganizations = async () => {
    setIsLoadingOrgs(true);
    try {
      const auth_token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
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
        throw new Error(
          t(
            "Erreur lors du chargement des organisations",
            "Error loading organizations"
          ),
        );
      }

      const data = await response.json();

      // Filtrer les organisations créées par l'utilisateur ET qui ne sont pas supprimées
      const my_orgs = data.filter(
        (org: Organization) =>
          org.created_by === user_data?.userId && org.status !== "DELETED",
      );

      setOrganizations(my_orgs);

      if (my_orgs.length > 0 && !selected_organization) {
        setSelectedOrganization(my_orgs[0]);
      }
    } catch (error: any) {
      console.error("Fetch Organizations Error:", error);
    } finally {
      setIsLoadingOrgs(false);
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

  const validateForm = () => {
    if (!form_data.long_name.trim()) {
      setErrorMessage(
        t("Le nom complet de l'agence est requis", "Agency full name is required"),
      );
      return false;
    }
    if (!form_data.short_name.trim()) {
      setErrorMessage(
        t(
          "L'abréviation de l'agence est requise",
          "Agency abbreviation is required"
        ),
      );
      return false;
    }
    if (!form_data.location.trim()) {
      setErrorMessage(t("La localisation est requise", "Location is required"));
      return false;
    }
    if (!form_data.ville.trim()) {
      setErrorMessage(t("La ville est requise", "City is required"));
      return false;
    }
    if (!form_data.organisation_id.trim()) {
      setErrorMessage(
        t("L'ID de l'organisation est requis", "Organization ID is required"),
      );
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

    try {
      const auth_token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");

      const response = await fetch(`${API_BASE_URL}/agence`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth_token}`,
        },
        body: JSON.stringify(form_data),
      });

      if (!response.ok) {
        throw new Error(
          t("Erreur lors de la création de l'agence", "Error creating agency"),
        );
      }

      const data = await response.json();
      setAgencyResponse(data);
      setShowSuccessModal(true);

      // Réinitialiser le formulaire (sauf organisation_id et user_id)
      setFormData({
        organisation_id: form_data.organisation_id,
        user_id: form_data.user_id,
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
        t(
          "Une erreur est survenue lors de la création de l'agence",
          "An error occurred while creating the agency"
        ),
      );
      setShowErrorModal(true);
      console.error("Create Agency Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOrganization = (org: Organization) => {
    setSelectedOrganization(org);
    setShowOrgSelector(false);
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
                {t("Créer une agence", "Create an agency")}
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
            {/* Info Box Validation BSM */}
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">
                    {t("Validation BSM requise", "BSM validation required")}
                  </h3>
                  <p className="text-sm text-blue-800">
                    {t(
                      "Après la création, votre agence sera soumise à validation par le Bureau de Suivi et de Monitoring (BSM). Vous serez notifié une fois la validation effectuée.",
                      "After creation, your agency will be submitted for validation by the Monitoring and Follow-up Office (BSM). You will be notified once validation is completed."
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Organization Selector */}
            {is_loading_orgs ? (
              <div className="flex items-center justify-center py-10 mb-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6149CD]"></div>
              </div>
            ) : organizations.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center mb-6">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t("Aucune organisation", "No organization")}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t(
                    "Vous devez créer une organisation avant de créer une agence",
                    "You need to create an organization before creating an agency"
                  )}
                </p>
                <button
                  onClick={() => router.push("/user/organization/organization")}
                  style={{ backgroundColor: BUTTON_COLOR }}
                  className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  {t("Créer une organisation", "Create an organization")}
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-linear-to-br from-[#6149CD] to-[#8B7BE8] rounded-xl">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        {t("Organisation sélectionnée", "Selected organization")}
                      </p>
                      <h2 className="text-xl font-bold text-gray-900">
                        {selected_organization?.long_name || t("Aucune", "None")}
                      </h2>
                    </div>
                  </div>

                  {organizations.length > 1 && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowOrgSelector(!show_org_selector)}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <span className="text-gray-700">
                          {t("Changer", "Switch")}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                      </button>

                      {show_org_selector && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowOrgSelector(false)}
                          ></div>
                          <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 max-h-60 overflow-y-auto">
                            {organizations.map((org) => (
                              <button
                                key={org.id}
                                type="button"
                                onClick={() => handleSelectOrganization(org)}
                                className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${
                                  selected_organization?.id === org.id
                                    ? "bg-purple-50 border-l-4 border-[#6149CD]"
                                    : ""
                                }`}
                              >
                                <p className="font-medium text-gray-900">
                                  {org.long_name}
                                </p>
                                <p className="text-sm text-gray-600">
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
            )}

            {/* Formulaire (fusionné avec image en haut) */}
            {selected_organization && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div
                  className="relative h-64 bg-cover bg-center"
                  style={{ backgroundImage: "url('/images/agencyy.jpg')" }}
                >
                  <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/50 to-transparent"></div>
                  <div className="absolute inset-0 flex flex-col justify-center px-8">
                    <h2 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">
                      {t("Nouvelle agence", "New agency")}
                    </h2>
                    <p className="text-xl text-white/90 drop-shadow-md">
                      {t(
                        "Ajoutez une agence à votre organisation",
                        "Add an agency to your organization"
                      )}
                    </p>
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="p-8">
                  {/* Section 1 : Informations principales */}
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                      <Building className="w-6 h-6 text-[#6149CD]" />
                      <span>{t("Informations principales", "Main information")}</span>
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t("Nom complet de l'agence *", "Agency full name *")}
                        </label>
                        <input
                          type="text"
                          name="long_name"
                          value={form_data.long_name}
                          onChange={handleInputChange}
                          placeholder={t(
                            "Ex: Agence BusStation Yaoundé Centre",
                            "e.g., BusStation Agency Yaounde Center"
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
                          placeholder={t("Ex: SP-YDE-CTR", "e.g., SP-YDE-CTR")}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2 : Localisation */}
                  <div className="mb-8 pt-8 border-t border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                      <MapPin className="w-6 h-6 text-[#6149CD]" />
                      <span>{t("Localisation", "Location")}</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t("Ville *", "City *")}
                        </label>
                        <input
                          type="text"
                          name="ville"
                          value={form_data.ville}
                          onChange={handleInputChange}
                          placeholder={t("Ex: Yaoundé", "e.g., Yaounde")}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t("Zone/Quartier *", "Area/District *")}
                        </label>
                        <input
                          type="text"
                          name="location"
                          value={form_data.location}
                          onChange={handleInputChange}
                          placeholder={t(
                            "Ex: Mvan, Marché Central",
                            "e.g., Mvan, Central Market"
                          )}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3 : Informations supplémentaires */}
                  <div className="pt-8 border-t border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                      <Globe className="w-6 h-6 text-[#6149CD]" />
                      <span>{t("Informations supplémentaires", "Additional information")}</span>
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t("Réseau social", "Social network")}
                        </label>
                        <input
                          type="text"
                          name="social_network"
                          value={form_data.social_network}
                          onChange={handleInputChange}
                          placeholder={t("Ex: facebook.com", "e.g., facebook.com")}
                          className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                          <MessageSquare className="w-4 h-4 text-[#6149CD]" />
                          <span>{t("Message d'accueil", "Welcome message")}</span>
                        </label>
                        <textarea
                          name="greeting_message"
                          value={form_data.greeting_message}
                          onChange={handleInputChange}
                          placeholder={t(
                            "Message de bienvenue pour vos clients...",
                            "Welcome message for your customers..."
                          )}
                          rows={3}
                          className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t("Description", "Description")}
                        </label>
                        <textarea
                          name="description"
                          value={form_data.description}
                          onChange={handleInputChange}
                          placeholder={t(
                            "Description détaillée de l'agence...",
                            "Detailed agency description..."
                          )}
                          rows={4}
                          className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center justify-between mt-8 pt-8 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() =>
                        router.push("/user/organization/dashboard")
                      }
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
                          <Building2 className="w-5 h-5" />
                          <span>{t("Créer l'agence", "Create agency")}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
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
                  "Demande de création réussie avec succès, veuillez attendre la validation par le BSM.",
                  "Creation request successful. Please wait for BSM validation."
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
