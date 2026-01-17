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
  MapPin,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Clock,
  Users,
  Luggage,
  CreditCard,
  Check,
  Plus,
  Minus,
  User as UserIcon,
  Compass,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Agdasima } from "next/font/google";

interface Voyage {
  idVoyage: string;
  nomAgence: string;
  lieuDepart: string;
  lieuArrive: string;
  pointDeDepart: string;
  pointArrivee: string;
  nbrPlaceRestante: number;
  nbrPlaceReservable: number;
  dateDepartPrev: string;
  nomClasseVoyage: string;
  prix: number;
  placeReservees: number[];
}

interface Passager {
  numeroPieceIdentific: string;
  nom: string;
  genre: "MALE" | "FEMALE";
  age: string;
  nbrBaggage: number;
  placeChoisis: number;
}

interface UserData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  userId: string;
}

interface Reservation {
  idReservation: string;
  prixTotal: number;
  voyage: Voyage;
  placesReservees: number[];
}

const font = Agdasima({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  style: "normal",
});

/**
 * Client Voyage Reservation Page Component
 *
 * Allows users to select seats and make reservations for trips
 * Features interactive seat map and passenger information form
 *
 * @author Thomas Djotio Ndié
 * @date 2025-12-19
 */
export default function VoyageReservationPage() {
  const [voyage, setVoyage] = useState<Voyage | null>(null);
  const [places_reservees, setPlacesReservees] = useState<number[]>([]);
  const [places_selectionnees, setPlacesSelectionnees] = useState<number[]>([]);
  const [nombre_bagages, setNombreBagages] = useState(0);
  const [is_loading, setIsLoading] = useState(true);
  const [error_message, setErrorMessage] = useState("");

  const [show_profile_menu, setShowProfileMenu] = useState(false);
  const [show_mobile_menu, setShowMobileMenu] = useState(false);
  const [user_data, setUserData] = useState<UserData | null>(null);

  const [show_passagers_modal, setShowPassagersModal] = useState(false);
  const [show_post_reservation_modal, setShowPostReservationModal] =
    useState(false);
  const [show_paiement_modal, setShowPaiementModal] = useState(false);

  const [passagers, setPassagers] = useState<Passager[]>([]);
  const [reservation_courante, setReservationCourante] =
    useState<Reservation | null>(null);
  const [is_loading_reservation, setIsLoadingReservation] = useState(false);
  const [is_loading_paiement, setIsLoadingPaiement] = useState(false);

  const [mobile_phone, setMobilePhone] = useState("");
  const [mobile_phone_name, setMobilePhoneName] = useState("");

  const [total_capacity, setTotalCapacity] = useState(0);

  const router = useRouter();
  const searchParams = useSearchParams();
  const voyage_id = searchParams.get("voyage_id");

  const API_BASE_URL = "http://localhost:8081/api";
  const BUTTON_COLOR = "#6149CD";

  const MENU_ITEMS = [
    { icon: Home, label: "Accueil", path: "/user/client/home", active: false },
    {
      icon: Calendar,
      label: "Réserver",
      path: "/user/client/book",
      active: true,
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
      active: false,
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
      setUserData(JSON.parse(stored_user_data));
    }

    if (voyage_id) {
      fetchVoyageDetails(voyage_id);
    } else {
      router.push("/user/client/book");
    }
  }, [voyage_id]);

  const fetchVoyageDetails = async (id: string) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const auth_token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");

      const response = await fetch(`${API_BASE_URL}/voyage/byId/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth_token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors du chargement du voyage");
      }

      const data = await response.json();

      setTotalCapacity(data.vehicule.nbrPlaces);

      setVoyage(data);
      setPlacesReservees(data.placeReservees || []);
    } catch (error: any) {
      setErrorMessage("Impossible de charger les détails du voyage");
      console.error("Fetch Voyage Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeatClick = (seat_number: number) => {
    if (places_reservees.includes(seat_number)) return;

    if (places_selectionnees.includes(seat_number)) {
      setPlacesSelectionnees(
        places_selectionnees.filter((s) => s !== seat_number)
      );
    } else {
      setPlacesSelectionnees([...places_selectionnees, seat_number]);
    }
  };

  const initiateReservation = () => {
    if (places_selectionnees.length === 0) {
      return;
    }

    const nouveaux_passagers = places_selectionnees.map((place) => ({
      numeroPieceIdentific: "",
      nom: "",
      genre: "MALE" as "MALE" | "FEMALE",
      age: "",
      nbrBaggage: nombre_bagages,
      placeChoisis: place,
    }));

    setPassagers(nouveaux_passagers);
    setShowPassagersModal(true);
  };

  const updatePassager = (
    index: number,
    field: keyof Passager,
    value: string | number
  ) => {
    const nouveaux_passagers = [...passagers];
    nouveaux_passagers[index] = {
      ...nouveaux_passagers[index],
      [field]: value,
    };
    setPassagers(nouveaux_passagers);
  };

  const validerPassagers = () => {
    for (let i = 0; i < passagers.length; i++) {
      const passager = passagers[i];
      if (!passager.numeroPieceIdentific.trim()) {
        return false;
      }
      if (!passager.nom.trim()) {
        return false;
      }
      if (!passager.age || parseInt(passager.age) < 1) {
        return false;
      }
    }
    return true;
  };

  const effectuerReservation = async () => {
    if (!validerPassagers()) return;

    setIsLoadingReservation(true);

    try {
      const auth_token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");

      const reservation_data = {
        nbrPassager: places_selectionnees.length,
        montantPaye: 0,
        idUser: user_data?.userId || "",
        idVoyage: voyage?.idVoyage || "",
        passagerDTO: passagers.map((p) => ({
          ...p,
          age: parseInt(p.age),
        })),
      };

      const response = await fetch(`${API_BASE_URL}/reservation/reserver`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth_token}`,
        },
        body: JSON.stringify(reservation_data),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la réservation");
      }

      const reservation_result = await response.json();

      setReservationCourante({
        ...reservation_result,
        prixTotal: places_selectionnees.length * (voyage?.prix || 0),
        voyage: voyage!,
        placesReservees: [...places_selectionnees],
      });

      setShowPassagersModal(false);
      await fetchVoyageDetails(voyage_id!);
      setPlacesSelectionnees([]);
      setShowPostReservationModal(true);
    } catch (error: any) {
      console.error("Reservation Error:", error);
    } finally {
      setIsLoadingReservation(false);
    }
  };

  const ouvrirModalPaiement = () => {
    setShowPostReservationModal(false);
    setMobilePhone("");
    setMobilePhoneName("");
    setShowPaiementModal(true);
  };

  const effectuerPaiement = async () => {
    if (!mobile_phone.trim()) {
      return;
    }
    if (!mobile_phone_name.trim()) {
      return;
    }

    setIsLoadingPaiement(true);

    try {
      const auth_token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");

      const payment_data = {
        amount: reservation_courante?.prixTotal || 0,
        reservation_id: reservation_courante?.idReservation || "",
        simulate_success: true
      };

      const response = await fetch(`${API_BASE_URL}/reservation/simulate-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth_token}`,
        },
        body: JSON.stringify(payment_data),
      });

      if (!response.ok) {
        throw new Error("Erreur lors du paiement");
      }

      setShowPaiementModal(false);
      router.push("/user/client/tickets");
    } catch (error: any) {
      console.error("Payment Error:", error);
    } finally {
      setIsLoadingPaiement(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("user_data");
    router.push("/login");
  };

  const renderSeatMap = () => {
    if (!voyage) return null;

    const seats = [];

    for (let i = 1; i <= total_capacity; i++) {
      const is_reserved = places_reservees.includes(i);
      const is_selected = places_selectionnees.includes(i);

      seats.push(
        <button
          key={i}
          onClick={() => handleSeatClick(i)}
          disabled={is_reserved}
          className={`w-12 h-12 rounded-lg border-2 font-semibold text-sm transition-all flex items-center justify-center ${
            is_reserved
              ? "bg-red-500 border-red-500 text-white cursor-not-allowed"
              : is_selected
              ? "bg-green-500 border-green-500 text-white scale-110"
              : "bg-white border-gray-300 text-gray-700 hover:border-[#6149CD] hover:scale-105"
          }`}
        >
          {i}
        </button>
      );
    }

    const rows = [];
    for (let i = 0; i < seats.length; i += 4) {
      rows.push(
        <div key={i} className="flex justify-center gap-3 mb-3">
          {seats.slice(i, i + 4)}
        </div>
      );
    }

    return rows;
  };

  const formatDate = (date_string: string) => {
    const date = new Date(date_string);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isFormValid = () => {
    return passagers.every((passager) => {
      return (
        passager.numeroPieceIdentific.trim() !== "" &&
        passager.nom.trim() !== "" &&
        passager.age !== "" &&
        parseInt(passager.age) > 0
      );
    });
  };

  const isPaymentFormValid = () => {
    if (mobile_phone_name.trim() === "") return false;
    const cleaned_phone = mobile_phone.replace(/\s|-|\+/g, "");
    const phone_regex = /^\d{9}$/;
    return phone_regex.test(cleaned_phone);
  };

  if (is_loading) {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${font.className}`}>
        <div className="text-center">
          <Calendar className="w-16 h-16 text-[#6149CD] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement du voyage...</p>
        </div>
      </div>
    );
  }

  if (error_message || !voyage) {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${font.className}`}>
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <X className="w-16 h-16 text-white-500 mx-auto mb-4 bg-[#6149CD] rounded-full" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-6">
            {error_message || "Voyage introuvable"}
          </p>
          <button
            onClick={() => router.push("/user/client/book")}
            className="px-6 py-3 bg-[#6149CD] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Retour à la recherche
          </button>
        </div>
      </div>
    );
  }

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
                Réservation de voyage
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
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
              <button
                onClick={() => router.push("/user/client/home")}
                className="hover:text-[#6149CD]"
              >
                Accueil
              </button>
              <span>/</span>
              <button
                onClick={() => router.push("/user/client/book")}
                className="hover:text-[#6149CD]"
              >
                Rechercher
              </button>
              <span>/</span>
              <span className="text-gray-900 font-medium">Réservation</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Panel - Details */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-24">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Détails du voyage
                  </h2>

                  <div className="space-y-4">
                    {/* Agence */}
                    <div className="flex items-start space-x-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: BUTTON_COLOR }}
                      >
                        <Home className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Nom de l'agence
                        </p>
                        <p className="font-semibold text-gray-900">
                          {voyage.nomAgence}
                        </p>
                      </div>
                    </div>

                    {/* Trajet */}
                    <div className="flex items-start space-x-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: BUTTON_COLOR }}
                      >
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          De {voyage.lieuDepart} vers {voyage.lieuArrive}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          <Compass className="w-3 h-3 inline mr-1" />
                          Itinéaire : De {voyage.pointDeDepart} vers{" "}
                          {voyage.pointArrivee}
                        </p>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-start space-x-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: BUTTON_COLOR }}
                      >
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Date</p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(voyage.dateDepartPrev)}
                        </p>
                      </div>
                    </div>

                    {/* Prix unitaire */}
                    <div className="flex items-start space-x-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: BUTTON_COLOR }}
                      >
                        <CreditCard className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Prix unitaire (par place)
                        </p>
                        <p className="font-bold text-gray-900">
                          {voyage.prix} FCFA
                        </p>
                      </div>
                    </div>

                    {/* Classe */}
                    <div className="flex items-start space-x-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: BUTTON_COLOR }}
                      >
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Classe</p>
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {voyage.nomClasseVoyage}
                        </span>
                      </div>
                    </div>

                    {/* Bagages */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                          <Luggage className="w-4 h-4" />
                          <span>Bagages par passager</span>
                        </label>
                      </div>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() =>
                            setNombreBagages(Math.max(0, nombre_bagages - 1))
                          }
                          disabled={nombre_bagages === 0}
                          className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-[#6149CD] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="w-4 h-4 text-gray-700" />
                        </button>
                        <span className="text-xl font-bold text-gray-900 min-w-10 text-center">
                          {nombre_bagages}
                        </span>
                        <button
                          onClick={() => setNombreBagages(nombre_bagages + 1)}
                          className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-[#6149CD] transition-colors"
                        >
                          <Plus className="w-4 h-4 text-gray-700" />
                        </button>
                      </div>
                    </div>

                    {/* Places sélectionnées */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-semibold text-gray-700">
                          Places sélectionnées
                        </label>
                        <span className="text-lg font-bold text-[#6149CD]">
                          {places_selectionnees.length}
                        </span>
                      </div>
                      {places_selectionnees.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {places_selectionnees.map((place) => (
                            <span
                              key={place}
                              className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                            >
                              Place {place}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Prix total */}
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900">
                          Prix Total
                        </span>
                        <span className="text-2xl font-bold text-[#6149CD]">
                          {places_selectionnees.length * voyage.prix} FCFA
                        </span>
                      </div>
                    </div>

                    {/* Bouton Réserver */}
                    <button
                      onClick={initiateReservation}
                      disabled={places_selectionnees.length === 0}
                      style={{ backgroundColor: BUTTON_COLOR }}
                      className="w-full py-3 text-white rounded-xl font-semibold hover:opacity-90 active:opacity-80 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mt-6"
                    >
                      <span>Réserver maintenant</span>
                    </button>

                    <button
                      onClick={() => router.push("/user/client/book")}
                      className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 active:bg-gray-100 transition-all flex items-center justify-center space-x-2"
                    >
                      <span>Retour à la recherche</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Panel - Seat Map */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Sélection des places
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Cliquez sur les places disponibles pour les sélectionner
                  </p>

                  {/* Légende */}
                  <div className="flex flex-wrap gap-6 mb-8 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-white border-2 border-gray-300"></div>
                      <span className="text-sm font-medium text-gray-700">
                        Disponible
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-green-500 border-2 border-green-500"></div>
                      <span className="text-sm font-medium text-gray-700">
                        Sélectionnée
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-red-500 border-2 border-red-500"></div>
                      <span className="text-sm font-medium text-gray-700">
                        Réservée
                      </span>
                    </div>
                  </div>

                  {/* Plan des sièges */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex justify-center mb-2">
                      <div className="w-20 h-12 bg-[#6149CD] rounded-lg flex items-center justify-center text-white font-bold border-2 border-[#6149CD]">
                        Driver
                      </div>
                    </div>
                    {renderSeatMap()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Passagers */}
      {show_passagers_modal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden transform transition-all duration-300 scale-100 flex flex-col">
            {/* Header avec gradient */}
            <div className="bg-linear-to-r from-[#6149CD] to-[#8B7BE8] p-6 relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl flex items-center justify-center">
                    <UserIcon className="w-7 h-7 text-gray-700" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      Informations des passagers
                    </h2>
                  </div>
                </div>
                <button
                  onClick={() => setShowPassagersModal(false)}
                  className="w-12 h-12 bg-white bg-opacity-20 backdrop-blur-lg rounded-xl flex items-center justify-center hover:bg-opacity-30 transition-all"
                >
                  <X className="w-6 h-6 text-gray-700 hover:text-red-700 hover:scale-115 transition-transform" />
                </button>
              </div>
            </div>

            {/* Corps du modal */}
            <div className="flex-1 overflow-y-auto p-6 bg-linear-to-br from-gray-50 to-purple-50">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {passagers.map((passager, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    {/* En-tête de la carte passager */}
                    <div className="bg-linear-to-r from-[#6149CD] to-[#8B7BE8] p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-white bg-opacity-20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                          <UserIcon className="w-6 h-6 text-gray-700" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white">
                            Passager {index + 1}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                              <Users className="w-4 h-4 text-gray-700" />
                            </div>
                            <span className="text-white text-opacity-90 text-sm font-medium">
                              Place {passager.placeChoisis}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Corps de la carte */}
                    <div className="p-6 space-y-4">
                      {/* Numéro pièce */}
                      <div className="group">
                        <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-2">
                          <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center group-focus-within:bg-[#6149CD] transition-colors">
                            <CreditCard className="w-4 h-4 text-[#6149CD] group-focus-within:text-white" />
                          </div>
                          <span>Numéro pièce d'identité *</span>
                        </label>
                        <input
                          type="text"
                          value={passager.numeroPieceIdentific}
                          onChange={(e) =>
                            updatePassager(
                              index,
                              "numeroPieceIdentific",
                              e.target.value
                            )
                          }
                          placeholder="CNI, Récépissé"
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent focus:bg-white transition-all text-gray-800 placeholder:text-gray-400"
                        />
                      </div>

                      {/* Nom */}
                      <div className="group">
                        <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-2">
                          <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center group-focus-within:bg-[#6149CD] transition-colors">
                            <UserIcon className="w-4 h-4 text-[#6149CD] group-focus-within:text-white" />
                          </div>
                          <span>Nom complet *</span>
                        </label>
                        <input
                          type="text"
                          value={passager.nom}
                          onChange={(e) =>
                            updatePassager(index, "nom", e.target.value)
                          }
                          placeholder="Nom et prénom(s)"
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent focus:bg-white transition-all text-gray-800 placeholder:text-gray-400"
                        />
                      </div>

                      {/* Genre et Âge sur la même ligne */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Genre */}
                        <div>
                          <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-2">
                            <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Users className="w-4 h-4 text-[#6149CD]" />
                            </div>
                            <span>Genre *</span>
                          </label>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                updatePassager(index, "genre", "MALE")
                              }
                              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all transform ${
                                passager.genre === "MALE"
                                  ? "bg-linear-to-r from-[#6149CD] to-[#8B7BE8] text-white shadow-lg scale-105"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105"
                              }`}
                            >
                              Masculin
                            </button>
                            <button
                              onClick={() =>
                                updatePassager(index, "genre", "FEMALE")
                              }
                              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all transform ${
                                passager.genre === "FEMALE"
                                  ? "bg-linear-to-r from-[#6149CD] to-[#8B7BE8] text-white shadow-lg scale-105"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105"
                              }`}
                            >
                              Féminin
                            </button>
                          </div>
                        </div>

                        {/* Âge */}
                        <div className="group">
                          <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-2">
                            <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center group-focus-within:bg-[#6149CD] transition-colors">
                              <Calendar className="w-4 h-4 text-[#6149CD] group-focus-within:text-white" />
                            </div>
                            <span>Age *</span>
                          </label>
                          <input
                            type="number"
                            value={passager.age}
                            onChange={(e) =>
                              updatePassager(index, "age", e.target.value)
                            }
                            placeholder="Âge"
                            min="1"
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent focus:bg-white transition-all text-gray-800 placeholder:text-gray-400"
                          />
                        </div>
                      </div>

                      {/* Bagages */}
                      <div>
                        <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-2">
                          <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Luggage className="w-4 h-4 text-[#6149CD]" />
                          </div>
                          <span>Nombre de bagages</span>
                        </label>
                        <div className="flex items-center justify-center space-x-4 bg-linear-to-r from-purple-50 to-blue-50 rounded-xl p-3">
                          <button
                            onClick={() => {
                              const new_value = Math.max(
                                0,
                                passager.nbrBaggage - 1
                              );
                              updatePassager(index, "nbrBaggage", new_value);
                            }}
                            className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center hover:shadow-lg hover:scale-110 active:scale-95 transition-all border-2 border-purple-200"
                          >
                            <Minus className="w-4 h-4 text-[#6149CD]" />
                          </button>
                          <div className="flex flex-col items-center">
                            <span className="text-2xl font-bold text-[#6149CD]">
                              {passager.nbrBaggage}
                            </span>
                            <span className="text-xs text-gray-600 font-medium">
                              bagage{passager.nbrBaggage > 1 ? "s" : ""}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              const new_value = passager.nbrBaggage + 1;
                              updatePassager(index, "nbrBaggage", new_value);
                            }}
                            className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center hover:shadow-lg hover:scale-110 active:scale-95 transition-all border-2 border-purple-200"
                          >
                            <Plus className="w-4 h-4 text-[#6149CD]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer avec résumé et bouton - HAUTEUR FIXE */}
            <div className="bg-white border-t-2 border-purple-100 p-6 shrink-0">
              <div className="flex items-center justify-between mb-4 bg-linear-to-r from-purple-50 to-blue-50 rounded-2xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-linear-to-br from-[#6149CD] to-[#8B7BE8] rounded-xl flex items-center justify-center shadow-lg">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">
                      Prix total à payer
                    </p>
                    <p className="text-2xl font-bold text-[#6149CD]">
                      {places_selectionnees.length * voyage.prix} FCFA
                    </p>
                    <p className="text-xs text-gray-500">
                      {places_selectionnees.length} passager
                      {places_selectionnees.length > 1 ? "s" : ""} ×{" "}
                      {voyage.prix} FCFA
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600 font-medium mb-1">
                    Places réservées
                  </p>
                  <div className="flex flex-wrap gap-2 justify-end">
                    {places_selectionnees.map((place) => (
                      <span
                        key={place}
                        className="px-2.5 py-1 bg-linear-to-r from-green-400 to-green-500 text-white rounded-lg text-xs font-bold shadow-md"
                      >
                        {place}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={effectuerReservation}
                disabled={is_loading_reservation || !isFormValid()}
                className="w-full py-4 bg-linear-to-r from-[#6149CD] to-[#8B7BE8] text-white rounded-xl font-bold text-lg hover:shadow-2xl active:shadow-lg transition-all flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                {is_loading_reservation ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Réservation en cours...</span>
                  </>
                ) : (
                  <>
                    <span>Confirmer la réservation</span>
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-500 mt-3">
                En confirmant, vous acceptez nos conditions générales
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Post-Réservation */}
      {show_post_reservation_modal && reservation_courante && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-linear-to-br from-green-400 to-green-600 p-8 text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Réservation réussie !
              </h2>
              <p className="text-green-50">
                Votre réservation a été enregistrée avec succès
              </p>
            </div>

            <div className="p-6">
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  Résumé de la réservation
                </h3>
                <p className="text-sm text-gray-700 mb-2">
                  Nom agence : {reservation_courante.voyage.nomAgence}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  De {reservation_courante.voyage.lieuDepart} vers{" "}
                  {reservation_courante.voyage.lieuArrive}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Itinéaire : {reservation_courante.voyage.pointDeDepart} vers{" "}
                  {reservation_courante.voyage.pointArrivee}
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  Heure : Le{" "}
                  {formatDate(reservation_courante.voyage.dateDepartPrev)}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-sm font-semibold text-gray-700">
                    {reservation_courante.placesReservees.length} passager(s) -
                    Places: {reservation_courante.placesReservees.join(", ")}
                  </span>
                  <span className="text-lg font-bold text-[#6149CD]">
                    {reservation_courante.prixTotal} FCFA
                  </span>
                </div>
              </div>

              <p className="text-center text-gray-700 font-medium mb-6">
                Que souhaitez-vous faire maintenant ?
              </p>

              <div className="space-y-3">
                <button
                  onClick={ouvrirModalPaiement}
                  className="w-full py-4 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 active:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Payer maintenant</span>
                </button>

                <button
                  onClick={() => {
                    setShowPostReservationModal(false);
                    router.push("/user/client/reservations");
                  }}
                  className="w-full py-4 border-2 border-[#6149CD] text-[#6149CD] rounded-xl font-bold hover:bg-purple-100 active:bg-purple-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <Clock className="w-5 h-5" />
                  <span>Payer plus tard</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Paiement */}
      {show_paiement_modal && reservation_courante && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Paiement</h2>
              <button
                onClick={() => setShowPaiementModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  Résumé du paiement
                </h3>
                <p className="text-sm text-gray-700 mb-2">
                  Nom agence : {reservation_courante.voyage.nomAgence}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  De {reservation_courante.voyage.lieuDepart} vers{" "}
                  {reservation_courante.voyage.lieuArrive}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Itinéaire : {reservation_courante.voyage.pointDeDepart} vers{" "}
                  {reservation_courante.voyage.pointArrivee}
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  Heure : Le{" "}
                  {formatDate(reservation_courante.voyage.dateDepartPrev)}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-sm font-semibold text-gray-700">
                    Montant à payer
                  </span>
                  <span className="text-xl font-bold text-[#6149CD]">
                    {reservation_courante.prixTotal} FCFA
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Numéro de téléphone *
                  </label>
                  <input
                    type="tel"
                    value={mobile_phone}
                    onChange={(e) => setMobilePhone(e.target.value)}
                    placeholder="+237 🇨🇲"
                    className="w-full px-4 py-3 border-2 text-gray-700 placeholder:text-gray-400 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom du propriétaire *
                  </label>
                  <input
                    type="text"
                    value={mobile_phone_name}
                    onChange={(e) => setMobilePhoneName(e.target.value)}
                    placeholder="Nom complet"
                    className="w-full px-4 py-3 border-2 text-gray-700 placeholder:text-gray-400 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6149CD] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-800">
                  Une demande de paiement sera envoyée sur ce numéro pour
                  valider le paiement
                </p>
              </div>

              <button
                onClick={effectuerPaiement}
                disabled={is_loading_paiement || !isPaymentFormValid()}
                style={{ backgroundColor: BUTTON_COLOR }}
                className="w-full py-4 text-white rounded-xl font-bold text-lg hover:opacity-90 active:opacity-80 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {is_loading_paiement ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Paiement en cours...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-6 h-6" />
                    <span>Confirmer le paiement</span>
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
