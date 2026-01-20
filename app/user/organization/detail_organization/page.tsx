"use client";

import React, { useState, useEffect, Suspense } from "react";
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
  Mail,
  FileText,
  Globe,
  Hash,
  Users,
  Calendar,
  DollarSign,
  User,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

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
  userId: string;
}

/**
 * DG Organisation Page Component
 *
 * Form to see an organization
 *
 * @author Thomas Djotio Ndié
 * @date 2025-01-14
 */
function DetailOrganizationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const organization_id = searchParams.get("id");

  const [organization, setOrganization] = useState<OrganizationData | null>(
    null,
  );
  const [edit_mode, setEditMode] = useState(false);
  const [form_data, setFormData] = useState<Partial<OrganizationData>>({});

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

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const BUTTON_COLOR = "#6149CD";

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

    if (organization_id) {
      fetchOrganizationDetails();
    }
  }, [organization_id]);

  const fetchOrganizationDetails = async () => {
    setIsLoading(true);
    try {
      const auth_token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
      const response = await fetch(
        `${API_BASE_URL}/organizations/${organization_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth_token}`,
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
      console.error("Fetch Organization Error:", error);
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
      const auth_token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");

      const update_body = {
        email: form_data.email,
        description: form_data.description,
        long_name: form_data.long_name,
        short_name: form_data.short_name,
        business_domains: form_data.business_domains,
        legal_form: form_data.legal_form,
        website_url: form_data.website_url,
        social_network: form_data.social_network,
        business_registration_number: form_data.business_registration_number,
        tax_number: form_data.tax_number,
        capital_share: form_data.capital_share,
      };

      const response = await fetch(
        `${API_BASE_URL}/organizations/${organization_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth_token}`,
          },
          body: JSON.stringify(update_body),
        },
      );

      if (!response.ok) throw new Error("Erreur lors de la mise à jour");

      setShowSuccessModal(true);
      setEditMode(false);
      fetchOrganizationDetails();
    } catch (error: any) {
      setErrorMessage("Erreur lors de la mise à jour de l'organisation");
      setShowErrorModal(true);
      console.error("Update Organization Error:", error);
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
      const response = await fetch(
        `${API_BASE_URL}/organizations/${organization_id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${auth_token}`,
          },
        },
      );

      if (!response.ok) throw new Error("Erreur lors de la suppression");

      router.push("/user/organization/dashboard");
    } catch (error: any) {
      setErrorMessage("Erreur lors de la suppression de l'organisation");
      setShowErrorModal(true);
      console.error("Delete Organization Error:", error);
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
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
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

  if (!organization) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Organisation introuvable</p>
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar (identique au dashboard) */}
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
                Détails de l'organisation
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {!edit_mode ? (
                <>
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
                      setFormData(organization);
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
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Organization Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                  style={{ backgroundColor: BUTTON_COLOR }}
                >
                  {organization.short_name?.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {organization.long_name}
                  </h2>
                  <p className="text-gray-600">{organization.short_name}</p>
                  <p className="text-sm text-gray-500">
                    ID: {organization.organization_id}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 1: Informations générales */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <Briefcase className="w-6 h-6 text-[#6149CD]" />
                <span>Informations générales</span>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form_data.email || ""}
                      onChange={handleInputChange}
                      disabled={!edit_mode}
                      className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nom du dirigeant (non modifiable)
                    </label>
                    <input
                      type="text"
                      value={organization.ceo_name || ""}
                      disabled
                      className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 rounded-xl bg-gray-100"
                    />
                  </div>
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

            {/* Section 2: Informations légales */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <FileText className="w-6 h-6 text-[#6149CD]" />
                <span>Informations légales</span>
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Forme juridique
                    </label>
                    <select
                      name="legal_form"
                      value={form_data.legal_form || ""}
                      onChange={handleInputChange}
                      disabled={!edit_mode}
                      className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] disabled:bg-gray-50"
                    >
                      <option value="">Sélectionner</option>
                      {LEGAL_FORMS.map((form) => (
                        <option key={form} value={form}>
                          {form}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      N° registre de commerce
                    </label>
                    <input
                      type="text"
                      name="business_registration_number"
                      value={form_data.business_registration_number || ""}
                      onChange={handleInputChange}
                      disabled={!edit_mode}
                      className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] disabled:bg-gray-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Numéro fiscal
                    </label>
                    <input
                      type="text"
                      name="tax_number"
                      value={form_data.tax_number || ""}
                      onChange={handleInputChange}
                      disabled={!edit_mode}
                      className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Capital social
                    </label>
                    <input
                      type="number"
                      name="capital_share"
                      value={form_data.capital_share || ""}
                      onChange={handleInputChange}
                      disabled={!edit_mode}
                      className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] disabled:bg-gray-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date d'enregistrement (non modifiable)
                    </label>
                    <input
                      type="text"
                      value={
                        organization.registration_date
                          ? formatDate(organization.registration_date)
                          : "Non renseigné"
                      }
                      disabled
                      className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 rounded-xl bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Année de création (non modifiable)
                    </label>
                    <input
                      type="text"
                      value={organization.year_founded || "Non renseigné"}
                      disabled
                      className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 rounded-xl bg-gray-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Informations web */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <Globe className="w-6 h-6 text-[#6149CD]" />
                <span>Informations web</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Site web
                  </label>
                  <input
                    type="url"
                    name="website_url"
                    value={form_data.website_url || ""}
                    onChange={handleInputChange}
                    disabled={!edit_mode}
                    placeholder="https://exemple.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] disabled:bg-gray-50"
                  />
                </div>

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
                    placeholder="https://facebook.com/..."
                    className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Logo URL (non modifiable)
                  </label>
                  <input
                    type="text"
                    value={organization.logo_url || "Non renseigné"}
                    disabled
                    className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 rounded-xl bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Informations supplémentaires */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Informations supplémentaires
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mots-clés (non modifiables)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {organization.keywords &&
                    organization.keywords.length > 0 ? (
                      organization.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg"
                        >
                          <Hash className="w-4 h-4" />
                          <span>{keyword}</span>
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">Aucun mot-clé</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Domaines d'activité
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {organization.business_domains &&
                    organization.business_domains.length > 0 ? (
                      organization.business_domains.map((domain, index) => (
                        <span
                          key={index}
                          className="px-3 py-2 bg-[#6149CD] bg-opacity-10 text-[#6149CD] rounded-lg"
                        >
                          {domain}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">Aucun domaine d'activité</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date de création
                    </label>
                    <p className="text-gray-900">
                      {formatDate(organization.created_at)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Statut
                    </label>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                      {organization.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
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
                Êtes-vous sûr de vouloir supprimer l'organisation{" "}
                <span className="font-bold">{organization.long_name}</span> ?
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
              <p className="text-green-50">
                Organisation mise à jour avec succès
              </p>
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

export default function DetailOrganizationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-[#6149CD] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      }
    >
      <DetailOrganizationContent />
    </Suspense>
  );
}
