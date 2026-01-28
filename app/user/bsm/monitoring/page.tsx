"use client";

import React, { useState, useEffect } from "react";
import {
  Home,
  Eye,
  Settings,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Building2,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Check,
  XCircle,
  Globe,
  MessageSquare,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Agence {
  agency_id: string;
  organisation_id: string;
  long_name: string;
  short_name: string;
  location: string;
  ville: string;
  description: string;
  greeting_message: string;
  social_network: string;
  statut_validation: string;
  date_validation: string;
}

interface UserData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  address: string;
  userId: string;
}

/**
 * BSM Monitoring Page Component
 *
 * Display pending agencies for validation with detailed view and approval/rejection actions
 * Features modal for agency details, validation and rejection with required reason
 *
 * @author Thomas Djotio Ndié
 * @date 2025-12-21
 */
export default function BSMMonitoringPage() {
  const [agences, setAgences] = useState<Agence[]>([]);
  const [is_loading, setIsLoading] = useState(true);
  const [error_message, setErrorMessage] = useState("");
  const [success_message, setSuccessMessage] = useState("");
  const [validation_error, setValidationError] = useState("");

  const [show_profile_menu, setShowProfileMenu] = useState(false);
  const [show_mobile_menu, setShowMobileMenu] = useState(false);
  const [bsm_data, setUserData] = useState<UserData | null>(null);

  const [show_detail_modal, setShowDetailModal] = useState(false);
  const [selected_agence, setSelectedAgence] = useState<Agence | null>(null);
  const [is_loading_validation, setIsLoadingValidation] = useState(false);
  const [motif_rejet, setMotifRejet] = useState("");

  const [current_page, setCurrentPage] = useState(0);
  const [total_pages, setTotalPages] = useState(0);
  const [total_elements, setTotalElements] = useState(0);

  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const BUTTON_COLOR = "#6149CD";
  const AGENCES_PER_PAGE = 5;

  const MENU_ITEMS = [
    {
      icon: Home,
      label: "Dashboard",
      path: "/user/bsm/dashboard",
      active: false,
    },
    {
      icon: Eye,
      label: "Surveillance",
      path: "/user/bsm/monitoring",
      active: true,
    },
    {
      icon: Settings,
      label: "Mes paramètres",
      path: "/user/bsm/settings",
      active: false,
    },
  ];

  useEffect(() => {
    const bsm_token = sessionStorage.getItem("bsm_token");

    if (!bsm_token) {
      router.push("/bsm/login");
      return;
    }

    const stored_bsm_data = sessionStorage.getItem("bsm_data");
    if (stored_bsm_data) {
      const parsed_user = JSON.parse(stored_bsm_data);
      setUserData(parsed_user);
    }
    fetchAgences();
  }, []);

  useEffect(() => {
    fetchAgences();
  }, [current_page]);

  useEffect(() => {
    if (success_message) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success_message]);

  useEffect(() => {
    if (validation_error) {
      const timer = setTimeout(() => {
        setValidationError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [validation_error]);

  const fetchAgences = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const bsm_token = sessionStorage.getItem("bsm_token");

      const response = await fetch(
        `${API_BASE_URL}/agence/pending-validation?page=${current_page}&size=${AGENCES_PER_PAGE}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${bsm_token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des agences");
      }

      const data = await response.json();

      let filtered_agences = data.content || [];
      if (bsm_data?.address) {
        filtered_agences = filtered_agences.filter(
          (agence: Agence) => agence.ville === bsm_data.address,
        );
      }

      setAgences(filtered_agences);
      setTotalPages(data.page?.totalPages || 0);
      setTotalElements(filtered_agences.length);
    } catch (error: any) {
      setErrorMessage("Impossible de charger les agences en attente");
      console.error("Fetch Agences Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("bsm_token");
    sessionStorage.removeItem("bsm_data");
    router.push("/bsm/login");
  };

  const ouvrirModalDetail = (agence: Agence) => {
    setSelectedAgence(agence);
    setMotifRejet("");
    setValidationError("");
    setShowDetailModal(true);
  };

  const handleValidation = async (action: "approve" | "reject") => {
    if (!selected_agence) return;

    if (action === "reject" && !motif_rejet.trim()) {
      setValidationError("Veuillez renseigner le motif de rejet");
      return;
    }

    if (action === "reject" && motif_rejet.trim().length < 10) {
      setValidationError(
        "Le motif de rejet doit contenir au moins 10 caractères",
      );
      return;
    }

    setIsLoadingValidation(true);
    setValidationError("");

    try {
      const bsm_token = sessionStorage.getItem("bsm_token");

      const endpoint =
        action === "approve"
          ? `${API_BASE_URL}/agence/${selected_agence.agency_id}/validate`
          : `${API_BASE_URL}/agence/${selected_agence.agency_id}/reject`;

      const body =
        action === "approve"
          ? { bsm_id: bsm_data?.userId }
          : { bsm_id: bsm_data?.userId, motif_rejet: motif_rejet.trim() };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${bsm_token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(
          `Erreur lors de la ${
            action === "approve" ? "validation" : "rejection"
          }`,
        );
      }

      setShowDetailModal(false);
      setMotifRejet("");
      fetchAgences();
      setSuccessMessage(
        `Agence ${action === "approve" ? "validée" : "rejetée"} avec succès!`,
      );
    } catch (error: any) {
      setValidationError(
        `Une erreur est survenue lors de la ${
          action === "approve" ? "validation" : "rejection"
        }. Veuillez réessayer.`,
      );
      console.error("Validation Error:", error);
    } finally {
      setIsLoadingValidation(false);
    }
  };

  const formatDate = (date_string: string) => {
    if (!date_string) return "N/A";
    const date = new Date(date_string);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <>
        <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200 fixed h-full">
          <div className="p-6">
            <div className="mb-8">
              <button
                onClick={() => router.push("/user/bsm/dashboard")}
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
                      router.push("/user/bsm/dashboard");
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
                Surveillance des agences
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/user/bsm/settings")}
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
                    {bsm_data?.username}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>

                {show_profile_menu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        router.push("/user/bsm/settings");
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
            {/* Success Message */}
            {success_message && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
                <p className="text-green-800 font-medium">{success_message}</p>
                <button
                  onClick={() => setSuccessMessage("")}
                  className="ml-auto p-1 hover:bg-green-100 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-green-600" />
                </button>
              </div>
            )}

            {/* Carte fusionnée */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-3">
                {/* Partie gauche - Image avec overlay */}
                <div className="lg:col-span-1 relative min-h-125">
                  <img
                    src="/images/monitoring.jpg"
                    alt="Surveillance"
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=800&fit=crop";
                    }}
                  />
                  <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/50 to-black/70"></div>
                  <div className="absolute inset-0 flex flex-col justify-between p-8">
                    <div>
                      <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
                        Surveillance
                      </h2>
                      <p className="text-white/90 text-lg mb-6 drop-shadow-md">
                        Validez ou rejetez les agences en attente
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <Building2 className="w-6 h-6 text-white" />
                          <span className="text-white font-semibold">
                            Nombre d'agences en attente
                          </span>
                        </div>
                        <p className="text-3xl font-bold text-white">
                          Nombre par page : {total_elements}
                        </p>
                      </div>

                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                        <p className="text-sm text-white/90">
                          Examinez chaque agence avant validation
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Partie droite - Liste des agences */}
                <div className="lg:col-span-2 p-8 bg-linear-to-br from-white to-blue-50">
                  {is_loading ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="text-center">
                        <Building2 className="w-16 h-16 text-[#6149CD] animate-pulse mx-auto mb-4" />
                        <p className="text-gray-600">
                          Chargement des agences...
                        </p>
                      </div>
                    </div>
                  ) : error_message ? (
                    <div
                      onClick={() => window.location.reload()}
                      className="bg-red-50 border border-red-200 rounded-lg p-6 text-center cursor-pointer hover:bg-red-100 transition-colors"
                    >
                      <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
                      <p className="text-red-600">{error_message}</p>
                    </div>
                  ) : agences.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center">
                      <Building2
                        onClick={() => window.location.reload()}
                        className="w-16 h-16 text-gray-400 mx-auto mb-4 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                      />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Aucune agence en attente
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Toutes les agences ont été traitées
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center space-x-3 mb-6">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg"
                          style={{ backgroundColor: BUTTON_COLOR }}
                        >
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            Agences à valider
                          </h3>
                          <p className="text-sm text-gray-600">
                            {agences.length} agence
                            {agences.length > 1 ? "s" : ""} sur cette page
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4 mb-6">
                        {agences.map((agence) => (
                          <div
                            key={agence.agency_id}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                  {agence.long_name}
                                </h3>
                                <p className="text-sm text-gray-400  mb-2">
                                  ID: {agence.agency_id}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {agence.short_name}
                                </p>
                              </div>
                              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                                En attente
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2 text-sm">
                                  <MapPin className="w-4 h-4 text-gray-500" />
                                  <span className="text-gray-700">
                                    <span className="font-semibold">
                                      Ville : {agence.ville}
                                    </span>
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 text-xs text-gray-600">
                                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                  <span>Zone : {agence.location}</span>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center space-x-2 text-xs text-gray-600">
                                  <Globe className="w-3.5 h-3.5 text-gray-400" />
                                  <span className="truncate">
                                    {agence.social_network ||
                                      "Réseau social non renseigné"}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 text-xs text-gray-600">
                                  <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                                  <span className="line-clamp-1">
                                    {agence.greeting_message ||
                                      "Greeting non renseigné"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-end pt-4 border-t border-gray-200">
                              <button
                                onClick={() => ouvrirModalDetail(agence)}
                                style={{ backgroundColor: BUTTON_COLOR }}
                                className="px-6 py-3 text-white rounded-lg hover:opacity-90 active:opacity-80 transition-all font-semibold flex items-center space-x-2"
                              >
                                <Eye className="w-5 h-5" />
                                <span>Voir les détails</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pagination */}
                      {total_pages > 1 && (
                        <div className="flex items-center justify-center space-x-4">
                          <button
                            onClick={() =>
                              setCurrentPage(Math.max(0, current_page - 1))
                            }
                            disabled={current_page === 0}
                            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Précédent</span>
                          </button>

                          <span className="text-sm text-gray-600">
                            Page {current_page + 1} sur {total_pages}
                          </span>

                          <button
                            onClick={() =>
                              setCurrentPage(
                                Math.min(total_pages - 1, current_page + 1),
                              )
                            }
                            disabled={current_page === total_pages - 1}
                            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <span>Suivant</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Détails */}
      {show_detail_modal && selected_agence && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Détails de l'agence
              </h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setMotifRejet("");
                  setValidationError("");
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6 max-h-[50vh] overflow-y-auto">
              <div className="space-y-4">
                {/* Informations générales */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-bold text-gray-900 mb-3">
                    Informations générales
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-semibold text-gray-700">
                        Nom complet :
                      </span>
                      <span className="text-sm text-gray-600">
                        {selected_agence.long_name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-semibold text-gray-700">
                        Abréviation :
                      </span>
                      <span className="text-sm text-gray-600">
                        {selected_agence.short_name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-semibold text-gray-700">
                        ID Agence :
                      </span>
                      <span className="text-sm text-gray-500">
                        {selected_agence.agency_id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-semibold text-gray-700">
                        ID Organisation :
                      </span>
                      <span className="text-sm text-gray-500">
                        {selected_agence.organisation_id}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Localisation */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-bold text-gray-900 mb-3">Localisation</h3>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-700">
                          Ville : {selected_agence.ville}
                        </p>
                        <p className="text-sm text-gray-600">
                          Zone : {selected_agence.location}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact et communication */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-bold text-gray-900 mb-3">
                    Contact et communication
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <Globe className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-700">
                          Réseau social
                        </p>
                        <p className="text-sm text-gray-600 break-all">
                          {selected_agence.social_network || "Non renseigné"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-700">
                          Message d'accueil
                        </p>
                        <p className="text-sm text-gray-600">
                          {selected_agence.greeting_message || "Non renseigné"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {selected_agence.description && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-bold text-gray-900 mb-3">
                      Description
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selected_agence.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Champ motif de rejet */}
            <div className="px-6 pb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Motif de rejet (obligatoire pour rejeter)
              </label>
              <textarea
                value={motif_rejet}
                onChange={(e) => {
                  setMotifRejet(e.target.value);
                  setValidationError("");
                }}
                placeholder="Entrez le motif de rejet de l'agence (minimum 10 caractères)..."
                rows={3}
                className="w-full px-4 py-3 border-2 text-gray-700 placeholder:text-gray-400 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent resize-none"
              />
              {validation_error && (
                <div className="mt-2 flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm">{validation_error}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-t border-gray-200 flex items-center justify-between space-x-4">
              <button
                onClick={() => handleValidation("reject")}
                disabled={is_loading_validation || !motif_rejet.trim()}
                className="flex-1 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 active:bg-red-700 transition-colors font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {is_loading_validation ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Traitement...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    <span>Rejeter</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleValidation("approve")}
                disabled={is_loading_validation}
                className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 active:bg-green-700 transition-colors font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {is_loading_validation ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Traitement...</span>
                  </>
                ) : (
                  <>
                    <span>Valider</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
