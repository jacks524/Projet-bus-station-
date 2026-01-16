"use client";

import React, { useState, useEffect } from "react";
import {
  Home,
  Calendar,
  FileText,
  Ticket,
  Gift,
  History,
  Settings,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Tag,
  CalendarCheck,
  CalendarX,
  Percent,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Agdasima } from "next/font/google";

interface Coupon {
  idCoupon: string;
  dateDebut: string;
  dateFin: string;
  statusCoupon: string;
  valeur: number;
  idHistorique: string;
  idSoldeIndemnisation: string;
}

interface UserData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  userId: string;
}

const font = Agdasima({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  style: "normal",
});

/**
 * Client Vouchers Page Component
 *
 * Display user's valid coupons/vouchers
 * Fetches from GET /coupon/user/{userId}
 * Shows only coupons with status "VALIDE"
 *
 * @author Thomas Djotio Ndié
 * @date 2025-12-20
 */
export default function ClientVouchersPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [is_loading, setIsLoading] = useState(true);
  const [error_message, setErrorMessage] = useState("");

  const [show_profile_menu, setShowProfileMenu] = useState(false);
  const [show_mobile_menu, setShowMobileMenu] = useState(false);
  const [user_data, setUserData] = useState<UserData | null>(null);

  const router = useRouter();

  const API_BASE_URL = "http://localhost:8081/api";
  const BUTTON_COLOR = "#6149CD";

  const MENU_ITEMS = [
    { icon: Home, label: "Accueil", path: "/user/client/home", active: false },
    {
      icon: Calendar,
      label: "Réserver",
      path: "/user/client/book",
      active: false,
    },
    {
      icon: FileText,
      label: "Réservations",
      path: "/user/client/reservations",
      active: false,
    },
    {
      icon: Ticket,
      label: "Billets",
      path: "/user/client/tickets",
      active: false,
    },
    {
      icon: Gift,
      label: "Coupons",
      path: "/user/client/vouchers",
      active: true,
    },
    {
      icon: History,
      label: "Historique",
      path: "/user/client/history",
      active: false,
    },
    {
      icon: Settings,
      label: "Mes paramètres",
      path: "/user/client/settings",
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
      setUserData(parsed_user);
      fetchCoupons(parsed_user.userId);
    }
  }, []);

  const fetchCoupons = async (user_id: string) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/coupon/user/${user_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des coupons");
      }

      const data = await response.json();

      const valid_coupons = (data || []).filter(
        (coupon: Coupon) => coupon.statusCoupon === "VALIDE"
      );

      setCoupons(valid_coupons);
    } catch (error: any) {
      setErrorMessage("Impossible de charger vos coupons");
      console.error("Fetch Coupons Error:", error);
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

  const formatDate = (date_string: string) => {
    const date = new Date(date_string);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className={`min-h-screen bg-gray-50 flex ${font.className}`}>
      {/* Sidebar */}
      <>
        <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200 fixed h-full">
          <div className="p-6">
            <div className="mb-8">
              <button
                onClick={() => router.push("/user/client/home")}
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
                      router.push("/user/client/home");
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
                Mes coupons
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/user/client/settings")}
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
                        router.push("/user/client/settings");
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
            {/* Carte fusionnée : Coupons en haut + Image en bas */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Partie haute - Liste des coupons */}
              <div className="p-8 bg-linear-to-br from-white">
                {is_loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <Gift className="w-16 h-16 text-[#6149CD] animate-spin mx-auto mb-4" />
                      <p className="text-gray-600">
                        Chargement de vos coupons...
                      </p>
                    </div>
                  </div>
                ) : error_message ? (
                  <div
                    onClick={() => window.location.reload()}
                    className="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
                  >
                    <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600">{error_message}</p>
                  </div>
                ) : coupons.length === 0 ? (
                  <div className="bg-white rounded-xl p-12 text-center">
                    <Gift
                      onClick={() => window.location.reload()}
                      className="w-16 h-16 text-gray-400 mx-auto mb-4 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                    />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Aucun coupon disponible
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Vous n'avez pas encore de coupons de réduction valides
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-3 mb-6">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg"
                        style={{ backgroundColor: BUTTON_COLOR }}
                      >
                        <Gift className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          Vos coupons de réduction
                        </h3>
                        <p className="text-sm text-gray-600">
                          {coupons.length} coupon{coupons.length > 1 ? "s" : ""}{" "}
                          valide{coupons.length > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {coupons.map((coupon) => (
                        <div
                          key={coupon.idCoupon}
                          className="relative rounded-xl shadow-sm border-2 p-6 transition-all hover:shadow-md bg-linear-to-br from-amber-50 to-yellow-50 border-amber-300"
                        >
                          {/* Badge de statut */}
                          <div className="absolute top-4 right-4">
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                              ✓ Valide
                            </span>
                          </div>

                          {/* Icône coupon */}
                          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-amber-200">
                            <Tag className="w-8 h-8 text-amber-700" />
                          </div>

                          {/* Valeur du coupon */}
                          <div className="mb-4">
                            <div className="flex items-baseline space-x-1 mb-1">
                              <span className="text-4xl font-bold text-amber-700">
                                {(coupon.valeur * 100).toFixed(0)}
                              </span>
                              <Percent className="w-6 h-6 text-amber-700" />
                            </div>
                            <p className="text-sm text-gray-600">
                              de réduction
                            </p>
                          </div>

                          {/* Dates de validité */}
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center space-x-2 text-xs text-gray-600">
                              <CalendarCheck className="w-3.5 h-3.5 text-green-600" />
                              <span>
                                Début : {formatDate(coupon.dateDebut)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-600">
                              <CalendarX className="w-3.5 h-3.5 text-red-600" />
                              <span>Fin : {formatDate(coupon.dateFin)}</span>
                            </div>
                          </div>

                          {/* Code coupon */}
                          <div className="bg-white rounded-lg p-2 border border-dashed border-gray-300">
                            <p className="text-xs text-gray-500 mb-1">
                              Code coupon
                            </p>
                            <p className="text-xs font-mono font-semibold text-gray-800 truncate">
                              {coupon.idCoupon}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Partie basse - Image avec overlay */}
              <div className="relative h-80">
                <img
                  src="/images/cameroun7.jpg"
                  alt="Coupons"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop";
                  }}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/50 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
                      Économisez sur vos voyages
                    </h2>
                    <p className="text-white/90 text-lg mb-6 drop-shadow-md">
                      Utilisez vos coupons lors de vos prochaines réservations
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                        <Gift className="w-5 h-5 text-white" />
                        <span className="text-white font-medium">
                          {coupons.length} coupon{coupons.length > 1 ? "s" : ""}{" "}
                          valide{coupons.length > 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                        <Tag className="w-5 h-5 text-white" />
                        <span className="text-white font-medium">
                          Réductions exclusives
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
