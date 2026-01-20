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
} from "lucide-react";
import { useRouter } from "next/navigation";

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
}

interface UserData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  organization_id: string;
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

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const BUTTON_COLOR = "#6149CD";

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

      setFormData((prev) => ({
        ...prev,
        email: parsed_user.email || "",
        user_id: parsed_user.userId || "",
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
      setErrorMessage("Le nom complet de l'organisation est requis");
      return false;
    }
    if (!form_data.short_name.trim()) {
      setErrorMessage("L'abréviation est requise");
      return false;
    }
    if (!form_data.ceo_name.trim()) {
      setErrorMessage("Le nom du dirigeant est requis");
      return false;
    }
    if (!form_data.email.trim()) {
      setErrorMessage("L'email est requis");
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

      const response = await fetch(`${API_BASE_URL}/organizations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth_token}`,
        },
        body: JSON.stringify(form_data),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création de l'organisation");
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
      });
    } catch (error: any) {
      setErrorMessage(
        "Une erreur est survenue lors de la création de l'organisation",
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
                  alt="SafaraPlace Logo"
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
                      alt="SafaraPlace Logo"
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
                Créer une organisation
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
          <div className="max-w-7xl mx-auto">
            {/* Carte fusionnée : formulaire + image */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Image de fond en haut de la carte */}
              <div className="relative h-64">
                <img
                  src="/images/orga.jpg"
                  alt="Organisation"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=400&fit=crop";
                  }}
                />
                <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/50 to-transparent"></div>
                <div className="absolute inset-0 flex flex-col justify-center px-8">
                  <h2 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">
                    Nouvelle organisation
                  </h2>
                  <p className="text-xl text-white/90 drop-shadow-md">
                    Créez votre organisation de voyage
                  </p>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="p-8">
                {/* Section 1 : Informations générales */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <Building className="w-6 h-6 text-[#6149CD]" />
                    <span>Informations générales</span>
                  </h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nom complet *
                        </label>
                        <input
                          type="text"
                          name="long_name"
                          value={form_data.long_name}
                          onChange={handleInputChange}
                          placeholder="Ex: SafaraPlace Travel & Tours"
                          required
                          className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Abréviation *
                        </label>
                        <input
                          type="text"
                          name="short_name"
                          value={form_data.short_name}
                          onChange={handleInputChange}
                          placeholder="Ex: SPT"
                          required
                          className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email *
                        </label>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            name="email"
                            value={form_data.email}
                            onChange={handleInputChange}
                            placeholder="contact@organisation.com"
                            required
                            className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nom du dirigeant *
                        </label>
                        <div className="flex items-center space-x-2">
                          <User className="w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="ceo_name"
                            value={form_data.ceo_name}
                            onChange={handleInputChange}
                            placeholder="Ex: Jean Dupont"
                            required
                            className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description
                      </label>
                      <div className="flex items-start space-x-2">
                        <FileText className="w-5 h-5 text-gray-400 mt-3" />
                        <textarea
                          name="description"
                          value={form_data.description}
                          onChange={handleInputChange}
                          placeholder="Description de l'organisation..."
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
                          value={form_data.legal_form}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all"
                        >
                          <option value="">Sélectionner une forme</option>
                          {LEGAL_FORMS.map((form) => (
                            <option key={form} value={form}>
                              {form}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          N° de registre de commerce
                        </label>
                        <input
                          type="text"
                          name="business_registration_number"
                          value={form_data.business_registration_number}
                          onChange={handleInputChange}
                          placeholder="Ex: RC/YAO/2024/B/1234"
                          className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all"
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
                          value={form_data.tax_number}
                          onChange={handleInputChange}
                          placeholder="Ex: M012345678901X"
                          className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Capital social
                        </label>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="capital_share"
                            value={form_data.capital_share}
                            onChange={handleInputChange}
                            placeholder="Ex: 5000000 XAF"
                            className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Date d'enregistrement
                        </label>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <input
                            type="date"
                            name="registration_date"
                            value={form_data.registration_date}
                            onChange={handleInputChange}
                            className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Année de création
                        </label>
                        <input
                          type="text"
                          name="year_founded"
                          value={form_data.year_founded}
                          onChange={handleInputChange}
                          placeholder="Ex: 2024"
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
                    <span>Informations opérationnelles</span>
                  </h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nombre d'employés
                        </label>
                        <input
                          type="number"
                          name="number_of_employees"
                          value={form_data.number_of_employees}
                          onChange={handleInputChange}
                          placeholder="Ex: 50"
                          min="0"
                          className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          URL du logo
                        </label>
                        <div className="flex items-center space-x-2">
                          <Globe className="w-5 h-5 text-gray-400" />
                          <input
                            type="url"
                            name="logo_url"
                            value={form_data.logo_url}
                            onChange={handleInputChange}
                            placeholder="https://exemple.com/logo.png"
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
                    <span>Domaines d'activité</span>
                  </h3>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ajouter un domaine
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
                        placeholder="Ex: Transport interurbain"
                        className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={handleAddBusinessDomain}
                        style={{ backgroundColor: BUTTON_COLOR }}
                        className="px-6 py-3 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                      >
                        Ajouter
                      </button>
                    </div>

                    {form_data.business_domains.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {form_data.business_domains.map((domain, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center space-x-2 px-3 py-2 bg-[#6149CD] bg-opacity-10 text-[#6149CD] rounded-lg"
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
                    <span>Mots-clés</span>
                  </h3>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ajouter un mot-clé
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
                        placeholder="Ex: voyage, transport, tourisme"
                        className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={handleAddKeyword}
                        style={{ backgroundColor: BUTTON_COLOR }}
                        className="px-6 py-3 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                      >
                        Ajouter
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
                    Annuler
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
                        <span>Création en cours...</span>
                      </>
                    ) : (
                      <>
                        <Building className="w-5 h-5" />
                        <span>Créer l'organisation</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Success */}
      {show_success_modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-linear-to-br from-green-400 to-green-600 p-8 text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Organisation créée avec succès !
              </h2>
              <p className="text-green-50">
                Votre organisation est maintenant active
              </p>
            </div>

            <div className="p-6">
              {organization_response && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <h3 className="font-bold text-gray-900 mb-2">
                    Informations de l'organisation
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID Organisation :</span>
                      <span className="font-semibold text-gray-900">
                        {organization_response.organization_id ||
                          organization_response.id}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    window.location.reload();
                  }}
                  style={{ backgroundColor: BUTTON_COLOR }}
                  className="w-full py-3 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                >
                  Créer une autre organisation
                </button>

                <button
                  onClick={() => router.push("/user/organization/dashboard")}
                  className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                >
                  Retour au dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Error */}
      {show_error_modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-linear-to-br from-red-400 to-red-600 p-8 text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-12 h-12 text-red-600" />
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
