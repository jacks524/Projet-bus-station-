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
  Users,
  Bus,
  Calendar,
  ArrowLeft,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  DollarSign,
  User,
  Car,
  Wifi,
  Coffee,
  Package,
  Music,
  Toilet,
  ChefHat,
  ConciergeBell,
  Usb,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../../providers";

interface AgenceValidee {
  agency_id: string;
  user_id: string;
  long_name: string;
  short_name: string;
  ville: string;
  location: string;
}

interface ClassVoyage {
  idClassVoyage: string;
  nom: string;
  prix: number;
  tauxAnnulation: number;
  idAgenceVoyage: string;
}

interface Chauffeur {
  userId: string;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  phone_number: string;
}

interface Vehicule {
  idVehicule: string;
  nom: string;
  plaqueMatricule: string;
  nbrPlaces: number;
  marque: string;
  modele: string;
}

interface UserData {
  username: string;
  userId: string;
}

interface VoyageFormData {
  titre: string;
  description: string;
  dateDepartPrev: string;
  lieuDepart: string;
  lieuArrive: string;
  heureArrive: string;
  pointDeDepart: string;
  pointArrivee: string;
  nbrPlaceReservable: number;
  heureDepartEffectif: string;
  nbrPlaceReserve: number;
  nbrPlaceConfirm: number;
  statusVoyage: string;
  nbrPlaceRestante: number;
  dateLimiteReservation: string;
  dateLimiteConfirmation: string;
  smallImage: string;
  bigImage: string;
  chauffeurId: string;
  vehiculeId: string;
  classVoyageId: string;
  agenceVoyageId: string;
  amenities: string[];
}

export default function CreateVoyagePage() {
  const [agences, setAgences] = useState<AgenceValidee[]>([]);
  const [selected_agence, setSelectedAgence] = useState<AgenceValidee | null>(
    null,
  );
  const [classes_voyage, setClassesVoyage] = useState<ClassVoyage[]>([]);
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);

  const [is_loading_agences, setIsLoadingAgences] = useState(true);
  const [is_loading_classes, setIsLoadingClasses] = useState(false);
  const [is_loading_chauffeurs, setIsLoadingChauffeurs] = useState(false);
  const [is_loading_vehicules, setIsLoadingVehicules] = useState(false);
  const [is_submitting, setIsSubmitting] = useState(false);

  const [show_profile_menu, setShowProfileMenu] = useState(false);
  const [show_mobile_menu, setShowMobileMenu] = useState(false);
  const [show_agence_selector, setShowAgenceSelector] = useState(false);
  const [user_data, setUserData] = useState<UserData | null>(null);

  const [show_success_modal, setShowSuccessModal] = useState(false);
  const [show_error_modal, setShowErrorModal] = useState(false);
  const [error_message, setErrorMessage] = useState("");

  const [form_data, setFormData] = useState<VoyageFormData>({
    titre: "",
    description: "",
    dateDepartPrev: "",
    lieuDepart: "",
    lieuArrive: "",
    heureArrive: "",
    pointDeDepart: "",
    pointArrivee: "",
    nbrPlaceReservable: 0,
    heureDepartEffectif: "",
    nbrPlaceReserve: 0,
    nbrPlaceConfirm: 0,
    statusVoyage: "EN_ATTENTE",
    nbrPlaceRestante: 0,
    dateLimiteReservation: "",
    dateLimiteConfirmation: "",
    smallImage: "",
    bigImage: "",
    chauffeurId: "",
    vehiculeId: "",
    classVoyageId: "",
    agenceVoyageId: "",
    amenities: [],
  });

  const router = useRouter();
  const { t } = useLanguage();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const BUTTON_COLOR = "#6149CD";

  const MENU_ITEMS = [
    {
      icon: Home,
      label: t("Dashboard", "Dashboard"),
      path: "/user/agency/dashboard",
      active: false,
    },
    {
      icon: Bus,
      label: t("Voyages", "Trips"),
      path: "/user/agency/travels",
      active: false,
    },
    {
      icon: Calendar,
      label: t("Réservations", "Bookings"),
      path: "/user/agency/reservations",
      active: false,
    },
    {
      icon: Users,
      label: t("Chauffeurs", "Drivers"),
      path: "/user/agency/drivers",
      active: false,
    },
    {
      icon: Settings,
      label: t("Mes paramètres", "Settings"),
      path: "/user/agency/settings",
      active: false,
    },
  ];

  const AMENITIES_OPTIONS = [
    { value: "WIFI", label: t("WiFi", "WiFi"), icon: Wifi },
    { value: "RESTROOMS", label: t("Toilette", "Restroom"), icon: Toilet },
    { value: "LUGGAGE_STORAGE", label: t("Bagages", "Luggage"), icon: Package },
    { value: "MEAL_SERVICE", label: t("Nourriture", "Meals"), icon: ChefHat },
    { value: "ONBOARD_GUIDE", label: t("Hôtesse", "Hostess"), icon: ConciergeBell },
    { value: "USB", label: t("Port USB", "USB port"), icon: Usb },
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
      setUserData(parsed_user);
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (user_data?.userId) {
      fetchAgences();
    }
  }, [user_data?.userId]);

  useEffect(() => {
    if (selected_agence?.agency_id) {
      setFormData((prev) => ({
        ...prev,
        agenceVoyageId: selected_agence.agency_id,
        lieuDepart: selected_agence.ville,
        pointDeDepart: selected_agence.location,
      }));
      fetchClassesVoyage();
      fetchChauffeurs(selected_agence.agency_id);
      fetchVehicules(selected_agence.agency_id);
    }
  }, [selected_agence?.agency_id]);

  useEffect(() => {
    if (form_data.vehiculeId && vehicules.length > 0) {
      const selected_vehicule = vehicules.find(
        (v) => v.idVehicule === form_data.vehiculeId,
      );

      if (selected_vehicule) {
        setFormData((prev) => ({
          ...prev,
          nbrPlaceReservable: selected_vehicule.nbrPlaces,
        }));
      }
    }
  }, [form_data.vehiculeId, vehicules]);

  const fetchAgences = async () => {
    setIsLoadingAgences(true);
    try {
      const auth_token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
      const response = await fetch(
        `${API_BASE_URL}/agence/validated?page=0&size=1000`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth_token}`,
          },
        },
      );

      if (!response.ok)
        throw new Error(
          t("Erreur lors du chargement des agences", "Error loading agencies"),
        );

      const data = await response.json();
      const all_agences = data.content || data || [];
      const my_agences = all_agences.filter(
        (agence: AgenceValidee) => agence.user_id === user_data?.userId,
      );

      setAgences(my_agences);
      if (my_agences.length > 0 && !selected_agence) {
        setSelectedAgence(my_agences[0]);
      }
    } catch (error: any) {
      console.error("Fetch Agences Error:", error);
    } finally {
      setIsLoadingAgences(false);
    }
  };

  const fetchClassesVoyage = async () => {
    setIsLoadingClasses(true);
    try {
      const auth_token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
      const response = await fetch(
        `${API_BASE_URL}/class-voyage?page=0&size=100`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth_token}`,
          },
        },
      );

      if (!response.ok)
        throw new Error(
          t("Erreur lors du chargement des classes", "Error loading classes"),
        );

      const data = await response.json();
      const content = data.content || data || [];
      const agence_classes = content.filter(
        (classe: ClassVoyage) =>
          classe.idAgenceVoyage === selected_agence?.agency_id,
      );
      setClassesVoyage(agence_classes);
    } catch (error: any) {
      console.error("Fetch Classes Error:", error);
    } finally {
      setIsLoadingClasses(false);
    }
  };

  const fetchChauffeurs = async (agence_id: string) => {
    setIsLoadingChauffeurs(true);
    try {
      const auth_token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
      const response = await fetch(
        `${API_BASE_URL}/utilisateur/chauffeurs/${agence_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth_token}`,
          },
        },
      );

      if (!response.ok)
        throw new Error(
          t("Erreur lors du chargement des chauffeurs", "Error loading drivers"),
        );

      const data = await response.json();
      setChauffeurs(Array.isArray(data) ? data : [data]);
    } catch (error: any) {
      console.error("Fetch Chauffeurs Error:", error);
      setChauffeurs([]);
    } finally {
      setIsLoadingChauffeurs(false);
    }
  };

  const fetchVehicules = async (agence_id: string) => {
    setIsLoadingVehicules(true);
    try {
      const auth_token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
      const response = await fetch(
        `${API_BASE_URL}/vehicule/agence/${agence_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth_token}`,
          },
        },
      );

      if (!response.ok)
        throw new Error(
          t("Erreur lors du chargement des véhicules", "Error loading vehicles"),
        );

      const data = await response.json();
      setVehicules(Array.isArray(data) ? data : [data]);
    } catch (error: any) {
      console.error("Fetch Vehicules Error:", error);
      setVehicules([]);
    } finally {
      setIsLoadingVehicules(false);
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
      [name]:
        name.includes("nbr") || name.includes("Nbr")
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleSelectAgence = (agence: AgenceValidee) => {
    setSelectedAgence(agence);
    setShowAgenceSelector(false);
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const auth_token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");

      const updated_form_data = {
        ...form_data,
        nbrPlaceRestante: form_data.nbrPlaceReservable,
      };
      console.log(updated_form_data);
      const response = await fetch(`${API_BASE_URL}/voyage/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth_token}`,
        },
        body: JSON.stringify(updated_form_data),
      });

      if (!response.ok) {
        const error_data = await response.json();
        throw new Error(
          error_data.message ||
            t("Erreur lors de la création du voyage", "Error creating the trip"),
        );
      }

      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("Create Voyage Error:", error);
      setErrorMessage(
        error.message ||
          t(
            "Une erreur est survenue lors de la création du voyage",
            "An error occurred while creating the trip"
          ),
      );
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("user_data");
    router.push("/login");
  };

  const isFormValid = () => {
    return (
      form_data.titre &&
      form_data.description &&
      form_data.dateDepartPrev &&
      form_data.lieuDepart &&
      form_data.lieuArrive &&
      form_data.pointDeDepart &&
      form_data.pointArrivee &&
      form_data.nbrPlaceReservable > 0 &&
      form_data.chauffeurId &&
      form_data.vehiculeId &&
      form_data.classVoyageId &&
      form_data.agenceVoyageId
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200 fixed h-full">
        <div className="p-6">
          <div className="mb-8">
            <button
              onClick={() => router.push("/user/agency/dashboard")}
              className="hover:scale-105 transition-transform"
            >
              <img
                src="/images/busstation.png"
                alt="BusStation Logo"
                className="h-12 w-auto"
              />
            </button>
          </div>

          <nav className="space-y-1">
            {MENU_ITEMS.map((item, index) => (
              <button
                key={index}
                onClick={() => router.push(item.path)}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-100"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile Menu */}
      {show_mobile_menu && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setShowMobileMenu(false)}
          ></div>
          <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-2xl z-50 lg:hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <button onClick={() => router.push("/user/agency/dashboard")}>
                  <img
                    src="/images/busstation.png"
                    alt="Logo"
                    className="h-9.5 w-auto"
                  />
                </button>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
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
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-100"
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

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => setShowMobileMenu(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
              </button>
              <h1 className="text-lg sm:text-2xl font-semibold text-gray-900">
                {t("Créer un voyage", "Create a trip")}
              </h1>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!show_profile_menu)}
                className="flex items-center space-x-2 sm:space-x-3 hover:bg-gray-100 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 transition-colors"
              >
                <img
                  src="/images/user-icon.png"
                  alt="Profile"
                  className="w-7 h-7 sm:w-8.5 sm:h-8.5 rounded-full"
                />
                <span className="font-medium text-gray-900 hidden md:block text-sm sm:text-base">
                  {user_data?.username}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-600 hidden sm:block" />
              </button>

              {show_profile_menu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowProfileMenu(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                    <button
                      onClick={() => router.push("/user/agency/settings")}
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
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-3 sm:p-4 md:p-6">
          {is_loading_agences ? (
            <div className="flex items-center justify-center py-20">
              <Bus className="w-8 h-8 text-[#6149CD] animate-spin" />
            </div>
          ) : agences.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t("Aucune agence validée", "No validated agency")}
              </h3>
              <p className="text-gray-600">
                {t(
                  "Vous devez avoir une agence pour créer des voyages",
                  "You need an agency to create trips"
                )}
              </p>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Agency Selector */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-linear-to-br from-[#6149CD] to-[#8B7BE8] rounded-xl">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        {t("Agence sélectionnée", "Selected agency")}
                      </p>
                      <h2 className="text-xl font-bold text-gray-900">
                        {selected_agence?.long_name}
                      </h2>
                    </div>
                  </div>

                  {agences.length > 1 && (
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowAgenceSelector(!show_agence_selector)
                        }
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <span className="text-gray-700">
                          {t("Changer", "Switch")}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                      </button>

                      {show_agence_selector && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowAgenceSelector(false)}
                          ></div>
                          <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 max-h-60 overflow-y-auto">
                            {agences.map((agence) => (
                              <button
                                key={agence.agency_id}
                                onClick={() => handleSelectAgence(agence)}
                                className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${
                                  selected_agence?.agency_id ===
                                  agence.agency_id
                                    ? "bg-purple-50 border-l-4 border-[#6149CD]"
                                    : ""
                                }`}
                              >
                                <p className="font-medium text-gray-900">
                                  {agence.long_name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {agence.ville}
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

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* General Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <Bus className="w-6 h-6 text-[#6149CD]" />
                    <span>{t("Informations générales", "General information")}</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("Titre du voyage *", "Trip title *")}
                      </label>
                      <input
                        type="text"
                        name="titre"
                        value={form_data.titre}
                        onChange={handleInputChange}
                        required
                        className="w-full placeholder:text-gray-450 text-gray-950 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent"
                        placeholder={t(
                          "Ex: Yaoundé - Douala Express",
                          "e.g., Yaounde - Douala Express"
                        )}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("Description *", "Description *")}
                      </label>
                      <textarea
                        name="description"
                        value={form_data.description}
                        onChange={handleInputChange}
                        required
                        rows={4}
                        className="w-full placeholder:text-gray-450 text-gray-950 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent resize-none"
                        placeholder={t(
                          "Décrivez votre voyage...",
                          "Describe your trip..."
                        )}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("Statut", "Status")}
                      </label>
                      <input
                        type="text"
                        name="statusVoyage"
                        value={form_data.statusVoyage}
                        onChange={handleInputChange}
                        disabled
                        className="w-full placeholder:text-gray-450 text-gray-950 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Itinerary */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <MapPin className="w-6 h-6 text-[#6149CD]" />
                    <span>{t("Itinéraire", "Itinerary")}</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("Lieu de départ *", "Departure location *")}
                      </label>
                      <input
                        type="text"
                        name="lieuDepart"
                        value={form_data.lieuDepart}
                        onChange={handleInputChange}
                        required
                        disabled
                        className="w-full placeholder:text-gray-450 text-gray-950 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] bg-gray-100 cursor-not-allowed"
                        placeholder={t("Ex: Yaoundé", "e.g., Yaounde")}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {t("Ville de votre agence", "Your agency's city")}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("Lieu d'arrivée *", "Arrival location *")}
                      </label>
                      <input
                        type="text"
                        name="lieuArrive"
                        value={form_data.lieuArrive}
                        onChange={handleInputChange}
                        required
                        className="w-full placeholder:text-gray-450 text-gray-950 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD]"
                        placeholder={t("Ex: Douala", "e.g., Douala")}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("Point de départ *", "Departure point *")}
                      </label>
                      <input
                        type="text"
                        name="pointDeDepart"
                        value={form_data.pointDeDepart}
                        onChange={handleInputChange}
                        required
                        disabled
                        className="w-full placeholder:text-gray-450 text-gray-950 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] bg-gray-100 cursor-not-allowed"
                        placeholder={t("Ex: Mvan", "e.g., Mvan")}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {t("Zone de votre agence", "Your agency's area")}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("Point d'arrivée *", "Arrival point *")}
                      </label>
                      <input
                        type="text"
                        name="pointArrivee"
                        value={form_data.pointArrivee}
                        onChange={handleInputChange}
                        required
                        className="w-full placeholder:text-gray-450 text-gray-950 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD]"
                        placeholder={t("Ex: Bonabéri", "e.g., Bonaberi")}
                      />
                    </div>
                  </div>
                </div>

                {/* Dates and Times */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <Clock className="w-6 h-6 text-[#6149CD]" />
                    <span>{t("Dates et horaires", "Dates and times")}</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("Date de départ prévue *", "Planned departure date *")}
                      </label>
                      <input
                        type="datetime-local"
                        name="dateDepartPrev"
                        value={form_data.dateDepartPrev}
                        onChange={handleInputChange}
                        required
                        min={getMinDateTime()}
                        className="w-full placeholder:text-gray-450 text-gray-950 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("Heure de départ effectif", "Actual departure time")}
                      </label>
                      <input
                        type="datetime-local"
                        name="heureDepartEffectif"
                        value={form_data.heureDepartEffectif}
                        onChange={handleInputChange}
                        min={getMinDateTime()}
                        className="w-full placeholder:text-gray-450 text-gray-950 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("Heure d'arrivée", "Arrival time")}
                      </label>
                      <input
                        type="datetime-local"
                        name="heureArrive"
                        value={form_data.heureArrive}
                        onChange={handleInputChange}
                        min={getMinDateTime()}
                        className="w-full placeholder:text-gray-450 text-gray-950 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("Date limite de réservation", "Booking deadline")}
                      </label>
                      <input
                        type="datetime-local"
                        name="dateLimiteReservation"
                        value={form_data.dateLimiteReservation}
                        onChange={handleInputChange}
                        min={getMinDateTime()}
                        className="w-full placeholder:text-gray-450 text-gray-950 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("Date limite de confirmation", "Confirmation deadline")}
                      </label>
                      <input
                        type="datetime-local"
                        name="dateLimiteConfirmation"
                        value={form_data.dateLimiteConfirmation}
                        onChange={handleInputChange}
                        min={getMinDateTime()}
                        className="w-full placeholder:text-gray-450 text-gray-950 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD]"
                      />
                    </div>
                  </div>
                </div>

                {/* Seat Management */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <Users className="w-6 h-6 text-[#6149CD]" />
                    <span>{t("Gestion des places", "Seat management")}</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("Nombre de places *", "Number of seats *")}
                      </label>
                      <input
                        type="number"
                        name="nbrPlaceReservable"
                        value={form_data.nbrPlaceReservable}
                        onChange={handleInputChange}
                        required
                        min="1"
                        disabled
                        className="w-full placeholder:text-gray-450 text-gray-950 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] bg-gray-100 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {t(
                          "Capacité du véhicule sélectionné",
                          "Capacity of the selected vehicle"
                        )}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("Places réservées", "Reserved seats")}
                      </label>
                      <input
                        type="number"
                        name="nbrPlaceReserve"
                        value={form_data.nbrPlaceReserve}
                        onChange={handleInputChange}
                        min="0"
                        disabled
                        className="w-full placeholder:text-gray-450 text-gray-950 cursor-not-allowed px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("Places confirmées", "Confirmed seats")}
                      </label>
                      <input
                        type="number"
                        name="nbrPlaceConfirm"
                        value={form_data.nbrPlaceConfirm}
                        onChange={handleInputChange}
                        min="0"
                        disabled
                        className="w-full bg-gray-100 placeholder:text-gray-450 text-gray-950 cursor-not-allowed px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD]"
                      />
                    </div>
                  </div>
                </div>

                {/* Resources */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <Car className="w-6 h-6 text-[#6149CD]" />
                    <span>{t("Ressources", "Resources")}</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("Chauffeur *", "Driver *")}
                      </label>
                      <select
                        name="chauffeurId"
                        value={form_data.chauffeurId}
                        onChange={handleInputChange}
                        required
                        disabled={is_loading_chauffeurs}
                        className="w-full placeholder:text-gray-450 text-gray-950 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] disabled:opacity-50"
                      >
                        <option value="">
                          {t("Sélectionner un chauffeur", "Select a driver")}
                        </option>
                        {chauffeurs.map((chauffeur) => (
                          <option
                            key={chauffeur.userId}
                            value={chauffeur.userId}
                          >
                            {chauffeur.first_name} {chauffeur.last_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("Véhicule *", "Vehicle *")}
                      </label>
                      <select
                        name="vehiculeId"
                        value={form_data.vehiculeId}
                        onChange={handleInputChange}
                        required
                        disabled={is_loading_vehicules}
                        className="w-full placeholder:text-gray-450 text-gray-950 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] disabled:opacity-50"
                      >
                        <option value="">
                          {t("Sélectionner un véhicule", "Select a vehicle")}
                        </option>
                        {vehicules.map((vehicule) => (
                          <option
                            key={vehicule.idVehicule}
                            value={vehicule.idVehicule}
                          >
                            {vehicule.nom} - {vehicule.plaqueMatricule}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("Classe de voyage *", "Travel class *")}
                      </label>
                      <select
                        name="classVoyageId"
                        value={form_data.classVoyageId}
                        onChange={handleInputChange}
                        required
                        disabled={is_loading_classes}
                        className="w-full placeholder:text-gray-450 text-gray-950 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] disabled:opacity-50"
                      >
                        <option value="">
                          {t("Sélectionner une classe", "Select a class")}
                        </option>
                        {classes_voyage.map((classe) => (
                          <option
                            key={classe.idClassVoyage}
                            value={classe.idClassVoyage}
                          >
                            {classe.nom} - {classe.prix} FCFA
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Images */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <ImageIcon className="w-6 h-6 text-[#6149CD]" />
                    <span>{t("Images", "Images")}</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("URL petite image", "Small image URL")}
                      </label>
                      <input
                        type="url"
                        name="smallImage"
                        value={form_data.smallImage}
                        onChange={handleInputChange}
                        className="w-full placeholder:text-gray-450 text-gray-950 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD]"
                        placeholder="https://example.com/image-small.jpg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("URL grande image", "Large image URL")}
                      </label>
                      <input
                        type="url"
                        name="bigImage"
                        value={form_data.bigImage}
                        onChange={handleInputChange}
                        className="w-full placeholder:text-gray-450 text-gray-950 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD]"
                        placeholder="https://example.com/image-big.jpg"
                      />
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    {t("Équipements disponibles", "Available amenities")}
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {AMENITIES_OPTIONS.map((amenity) => {
                      const Icon = amenity.icon;
                      const is_selected = form_data.amenities.includes(
                        amenity.value,
                      );
                      return (
                        <button
                          key={amenity.value}
                          type="button"
                          onClick={() => handleAmenityToggle(amenity.value)}
                          className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                            is_selected
                              ? "border-[#6149CD] bg-purple-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <Icon
                            className={`w-8 h-8 mb-2 ${is_selected ? "text-[#6149CD]" : "text-gray-600"}`}
                          />
                          <span
                            className={`text-sm font-medium ${is_selected ? "text-[#6149CD]" : "text-gray-700"}`}
                          >
                            {amenity.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => router.push("/user/agency/travels")}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                  >
                    {t("Annuler", "Cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={is_submitting || !isFormValid()}
                    style={{ backgroundColor: BUTTON_COLOR }}
                    className="px-6 py-3 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {is_submitting
                      ? t("Création en cours...", "Creating...")
                      : t("Créer le voyage", "Create trip")}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>

        {/* Success Modal */}
        {show_success_modal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-linear-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {t("Voyage créé avec succès !", "Trip created successfully!")}
                </h2>
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    router.push("/user/agency/travels");
                  }}
                  className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                >
                  {t("Voir mes voyages", "View my trips")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Modal */}
        {show_error_modal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-linear-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {t("Erreur lors de la création", "Error during creation")}
                </h2>
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
                  {t("Fermer", "Close")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
