"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Home,
  Calendar,
  FileText,
  Ticket,
  Gift,
  History,
  Settings,
  MapPin,
  Clock,
  Users,
  Luggage,
  CreditCard,
  Plus,
  Minus,
  User as UserIcon,
  RefreshCw,
  X,
} from "lucide-react";
import Sidebar from "@/app/components/Sidebar";
import MobileSidebar from "@/app/components/Mobilesidebar";
import Header from "@/app/components/Header";
import SuccessModal from "@/app/components/SuccessModal";
import ErrorModal from "@/app/components/ErrorModal";

/**
 * BusStation Client Booking Page
 * Seat selection and reservation system
 *
 * @author Félix DJOTIO NDIE
 * @date 2025-01-29
 */

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

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const voyageId = searchParams.get("voyage_id");

  const [voyage, setVoyage] = useState<Voyage | null>(null);
  const [placesReservees, setPlacesReservees] = useState<number[]>([]);
  const [placesSelectionnees, setPlacesSelectionnees] = useState<number[]>([]);
  const [nombreBagages, setNombreBagages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  const [showPassagersModal, setShowPassagersModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const [passagers, setPassagers] = useState<Passager[]>([]);
  const [reservationCourante, setReservationCourante] =
    useState<Reservation | null>(null);
  const [isLoadingReservation, setIsLoadingReservation] = useState(false);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);

  const [mobilePhone, setMobilePhone] = useState("");
  const [mobilePhoneName, setMobilePhoneName] = useState("");
  const [totalCapacity, setTotalCapacity] = useState(0);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
    if (voyageId) {
      fetchVoyageDetails(voyageId);
    } else {
      router.push("/user/client/book");
    }
  }, [voyageId]);

  const fetchVoyageDetails = async (id: string) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const authToken =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");

      const response = await fetch(`${API_BASE_URL}/voyage/byId/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
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

  const handleSeatClick = (seatNumber: number) => {
    if (placesReservees.includes(seatNumber)) return;

    if (placesSelectionnees.includes(seatNumber)) {
      setPlacesSelectionnees(
        placesSelectionnees.filter((s) => s !== seatNumber),
      );
    } else {
      setPlacesSelectionnees([...placesSelectionnees, seatNumber]);
    }
  };

  const initiateReservation = () => {
    if (placesSelectionnees.length === 0) return;

    const nouveauxPassagers = placesSelectionnees.map((place) => ({
      numeroPieceIdentific: "",
      nom: "",
      genre: "MALE" as "MALE" | "FEMALE",
      age: "",
      nbrBaggage: nombreBagages,
      placeChoisis: place,
    }));

    setPassagers(nouveauxPassagers);
    setShowPassagersModal(true);
  };

  const updatePassager = (
    index: number,
    field: keyof Passager,
    value: string | number,
  ) => {
    const nouveauxPassagers = [...passagers];
    nouveauxPassagers[index] = {
      ...nouveauxPassagers[index],
      [field]: value,
    };
    setPassagers(nouveauxPassagers);
  };

  const isFormValid = () => {
    return passagers.every(
      (p) =>
        p.numeroPieceIdentific.trim() &&
        p.nom.trim() &&
        p.age &&
        parseInt(p.age) > 0,
    );
  };

  const effectuerReservation = async () => {
    if (!isFormValid()) return;

    setIsLoadingReservation(true);

    try {
      const authToken =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");

      const reservationData = {
        nbrPassager: placesSelectionnees.length,
        montantPaye: 0,
        idUser: userData?.userId || "",
        idVoyage: voyage?.idVoyage || "",
        passagerDTO: passagers.map((p) => ({ ...p, age: parseInt(p.age) })),
      };

      const response = await fetch(`${API_BASE_URL}/reservation/reserver`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(reservationData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la réservation");
      }

      const reservationResult = await response.json();

      setReservationCourante({
        ...reservationResult,
        prixTotal: placesSelectionnees.length * (voyage?.prix || 0),
        voyage: voyage!,
        placesReservees: [...placesSelectionnees],
      });

      setShowPassagersModal(false);
      await fetchVoyageDetails(voyageId!);
      setPlacesSelectionnees([]);
      setShowSuccessModal(true);
    } catch (error: any) {
      setErrorMessage("Erreur lors de la réservation");
      setShowErrorModal(true);
      console.error("Reservation Error:", error);
    } finally {
      setIsLoadingReservation(false);
    }
  };

  const openPaymentModal = () => {
    setShowSuccessModal(false);
    setMobilePhone("");
    setMobilePhoneName("");
    setShowPaymentModal(true);
  };

  const effectuerPaiement = async () => {
    if (!mobilePhone.trim() || !mobilePhoneName.trim()) return;

    setIsLoadingPayment(true);

    try {
      const authToken =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");

      const paymentData = {
        amount: reservationCourante?.prixTotal || 0,
        reservation_id: reservationCourante?.idReservation || "",
        simulate_success: true,
      };

      const response = await fetch(
        `${API_BASE_URL}/reservation/simulate-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(paymentData),
        },
      );

      if (!response.ok) {
        throw new Error("Erreur lors du paiement");
      }

      setShowPaymentModal(false);
      router.push("/user/client/tickets");
    } catch (error: any) {
      setErrorMessage("Erreur lors du paiement");
      setShowErrorModal(true);
      console.error("Payment Error:", error);
    } finally {
      setIsLoadingPayment(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderSeat = (
    seatNumber: number,
    isSpecial: boolean = false,
    label: string | number | null = null,
  ) => {
    const isReserved = placesReservees.includes(seatNumber);
    const isSelected = placesSelectionnees.includes(seatNumber);

    if (isSpecial) {
      return (
        <div
          key={seatNumber}
          className="seat disabled"
          style={{ fontSize: "10px" }}
        >
          {label || seatNumber}
        </div>
      );
    }

    return (
      <button
        key={seatNumber}
        onClick={() => handleSeatClick(seatNumber)}
        disabled={isReserved}
        className={`seat ${isReserved ? "reserved" : isSelected ? "selected" : ""}`}
      >
        {seatNumber}
      </button>
    );
  };

  const renderSeatMap = () => {
    if (!voyage) return null;

    // Disposition pour 56 places
    if (totalCapacity === 56) {
      return (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--spacing-2xl)",
            width: "fit-content",
          }}
        >
          {/* Première rangée */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--spacing-xs)",
              padding: "var(--spacing-xs)",
              width: "fit-content",
            }}
          >
            <div
              style={{
                gridColumn: "1 / -1",
                border: "2px solid var(--color-primary)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: "var(--radius-md)",
                fontWeight: "var(--font-weight-bold)",
                height: "40px",
                marginTop: "4px",
                background: "var(--color-primary)",
                color: "white",
                fontSize: "var(--font-size-sm)",
              }}
            >
              Driver
            </div>
            {Array.from({ length: 30 }, (_, i) => renderSeat(i + 1))}
          </div>

          {/* Deuxième rangée */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--spacing-xs)",
              padding: "var(--spacing-xs)",
              width: "fit-content",
            }}
          >
            <div
              style={{
                gridColumn: "1 / -1",
                border: "2px solid var(--color-primary)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: "var(--radius-md)",
                fontWeight: "var(--font-weight-bold)",
                height: "40px",
                marginTop: "4px",
                background: "var(--color-primary)",
                color: "white",
                fontSize: "var(--font-size-sm)",
              }}
            >
              Hôtesse
            </div>
            {Array.from({ length: 4 }, (_, i) => renderSeat(i + 31))}
            {renderSeat(35, true, "Toilette")}
            {renderSeat(36, true, "Toilette")}
            {renderSeat(37, true, "Porte")}
            {renderSeat(38, true, "Porte")}
            {Array.from({ length: 4 }, (_, i) => renderSeat(i + 35))}
            {Array.from({ length: 10 }, (_, i) => renderSeat(i + 39))}
            {renderSeat(49, true, "Porte")}
            {renderSeat(50, true, "Porte")}
            {Array.from({ length: 8 }, (_, i) => renderSeat(i + 49))}
          </div>
        </div>
      );
    }

    // Disposition pour 70 places
    if (totalCapacity === 70) {
      return (
        <div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--spacing-2xl)",
              width: "fit-content",
            }}
          >
            {/* Première rangée */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "var(--spacing-xs)",
                padding: "var(--spacing-xs)",
                width: "fit-content",
              }}
            >
              <div
                style={{
                  gridColumn: "1 / -1",
                  border: "2px solid var(--color-primary)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "var(--radius-md)",
                  fontWeight: "var(--font-weight-bold)",
                  height: "40px",
                  marginTop: "4px",
                  background: "var(--color-primary)",
                  color: "white",
                  fontSize: "var(--font-size-sm)",
                }}
              >
                Driver
              </div>
              {Array.from({ length: 42 }, (_, i) => renderSeat(i + 1))}
            </div>

            {/* Deuxième rangée */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "var(--spacing-xs)",
                padding: "var(--spacing-xs)",
                width: "fit-content",
              }}
            >
              {Array.from({ length: 4 }, (_, i) => renderSeat(i + 43))}
              {renderSeat(900, true, "Porte")}
              {renderSeat(901, true, "Porte")}
              {Array.from({ length: 6 }, (_, i) => renderSeat(i + 47))}
              {Array.from({ length: 8 }, (_, i) => renderSeat(i + 53))}
              {renderSeat(902, true, "Porte")}
              {renderSeat(903, true, "Porte")}
              {Array.from({ length: 4 }, (_, i) => renderSeat(i + 61))}
            </div>
          </div>

          {/* Dernier banc */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "var(--spacing-2xl)",
              width: "fit-content",
              marginTop: "0",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(6, 1fr)",
                gap: "var(--spacing-xs)",
                padding: "var(--spacing-xs)",
              }}
            >
              {Array.from({ length: 6 }, (_, i) => renderSeat(i + 65))}
            </div>
          </div>
        </div>
      );
    }

    // Disposition pour 75 places
    if (totalCapacity === 75) {
      return (
        <div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--spacing-2xl)",
              width: "fit-content",
            }}
          >
            {/* Première rangée */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "var(--spacing-xs)",
                padding: "var(--spacing-xs)",
                width: "fit-content",
              }}
            >
              <div
                style={{
                  gridColumn: "1 / -1",
                  border: "2px solid var(--color-primary)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "var(--radius-md)",
                  fontWeight: "var(--font-weight-bold)",
                  height: "40px",
                  marginTop: "4px",
                  background: "var(--color-primary)",
                  color: "white",
                  fontSize: "var(--font-size-sm)",
                }}
              >
                Driver
              </div>
              {Array.from({ length: 45 }, (_, i) => renderSeat(i + 1))}
            </div>

            {/* Deuxième rangée */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "var(--spacing-xs)",
                padding: "var(--spacing-xs)",
                width: "fit-content",
              }}
            >
              {Array.from({ length: 4 }, (_, i) => renderSeat(i + 46))}
              {renderSeat(904, true, "Porte")}
              {renderSeat(905, true, "Porte")}
              {Array.from({ length: 6 }, (_, i) => renderSeat(i + 50))}
              {Array.from({ length: 8 }, (_, i) => renderSeat(i + 56))}
              {renderSeat(906, true, "Porte")}
              {renderSeat(907, true, "Porte")}
              {Array.from({ length: 6 }, (_, i) => renderSeat(i + 64))}
            </div>
          </div>

          {/* Dernier banc */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "var(--spacing-2xl)",
              width: "fit-content",
              marginTop: "0",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(6, 1fr)",
                gap: "var(--spacing-xs)",
                padding: "var(--spacing-xs)",
              }}
            >
              {Array.from({ length: 6 }, (_, i) => renderSeat(i + 70))}
            </div>
          </div>
        </div>
      );
    }

    // Disposition pour 80 places
    if (totalCapacity === 80) {
      return (
        <div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--spacing-2xl)",
              width: "fit-content",
            }}
          >
            {/* Première rangée */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "var(--spacing-xs)",
                padding: "var(--spacing-xs)",
                width: "fit-content",
              }}
            >
              <div
                style={{
                  gridColumn: "1 / -1",
                  border: "2px solid var(--color-primary)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "var(--radius-md)",
                  fontWeight: "var(--font-weight-bold)",
                  height: "40px",
                  marginTop: "4px",
                  background: "var(--color-primary)",
                  color: "white",
                  fontSize: "var(--font-size-sm)",
                }}
              >
                Driver
              </div>
              {Array.from({ length: 48 }, (_, i) => renderSeat(i + 1))}
            </div>

            {/* Deuxième rangée */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "var(--spacing-xs)",
                padding: "var(--spacing-xs)",
                width: "fit-content",
              }}
            >
              {Array.from({ length: 4 }, (_, i) => renderSeat(i + 49))}
              {renderSeat(908, true, "Porte")}
              {renderSeat(909, true, "Porte")}
              {Array.from({ length: 6 }, (_, i) => renderSeat(i + 53))}
              {Array.from({ length: 12 }, (_, i) => renderSeat(i + 59))}
              {renderSeat(910, true, "Porte")}
              {renderSeat(911, true, "Porte")}
              {Array.from({ length: 4 }, (_, i) => renderSeat(i + 71))}
            </div>
          </div>

          {/* Dernier banc */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "var(--spacing-2xl)",
              width: "fit-content",
              marginTop: "0",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(6, 1fr)",
                gap: "var(--spacing-xs)",
                padding: "var(--spacing-xs)",
              }}
            >
              {Array.from({ length: 6 }, (_, i) => renderSeat(i + 75))}
            </div>
          </div>
        </div>
      );
    }

    // Disposition par défaut (grille simple de 4 colonnes)
    const seats = [];
    for (let i = 1; i <= totalCapacity; i++) {
      seats.push(renderSeat(i));
    }

    const rows = [];
    for (let i = 0; i < seats.length; i += 4) {
      rows.push(
        <div
          key={i}
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "var(--spacing-sm)",
            marginBottom: "var(--spacing-sm)",
          }}
        >
          {seats.slice(i, i + 4)}
        </div>,
      );
    }

    return rows;
  };

  if (isLoading) {
    return (
      <div className="loading-state">
        <RefreshCw className="spin" />
        <p>Chargement du voyage...</p>
      </div>
    );
  }

  if (errorMessage || !voyage) {
    return (
      <div className="error-state">
        <X className="error-state-icon" />
        <p className="error-text">{errorMessage || "Voyage introuvable"}</p>
        <button
          onClick={() => router.push("/user/client/book")}
          className="btn btn-primary"
        >
          Retour à la recherche
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar menuItems={MENU_ITEMS} activePath="/user/client/book" />
      <MobileSidebar
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        menuItems={MENU_ITEMS}
        activePath="/user/client/book"
      />

      <div className="dashboard-main">
        <Header
          title="Réservation"
          userData={userData}
          onMenuClick={() => setShowMobileMenu(true)}
        />

        <main className="dashboard-content">
          <div className="container" style={{ maxWidth: "1400px" }}>
            {/* Breadcrumb */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--spacing-xs)",
                fontSize: "var(--font-size-sm)",
                color: "var(--gray-600)",
                marginBottom: "var(--spacing-xl)",
              }}
            >
              <button
                onClick={() => router.push("/user/client/home")}
                style={{ background: "none", padding: 0, color: "inherit" }}
              >
                Accueil
              </button>
              <span>/</span>
              <button
                onClick={() => router.push("/user/client/book")}
                style={{ background: "none", padding: 0, color: "inherit" }}
              >
                Rechercher
              </button>
              <span>/</span>
              <span
                style={{
                  color: "var(--gray-900)",
                  fontWeight: "var(--font-weight-medium)",
                }}
              >
                Réservation
              </span>
            </div>

            <div className="booking-container">
              {/* Details Panel */}
              <div className="booking-details">
                <h2
                  style={{
                    fontSize: "var(--font-size-xl)",
                    fontWeight: "var(--font-weight-bold)",
                    color: "var(--gray-900)",
                    marginBottom: "var(--spacing-lg)",
                  }}
                >
                  Détails du voyage
                </h2>

                {/* Agence */}
                <div className="booking-detail-item">
                  <Home className="booking-detail-icon" />
                  <div className="booking-detail-content">
                    <div className="booking-detail-label">Agence</div>
                    <div className="booking-detail-value">
                      {voyage.nomAgence}
                    </div>
                  </div>
                </div>

                {/* Trajet */}
                <div className="booking-detail-item">
                  <MapPin className="booking-detail-icon" />
                  <div className="booking-detail-content">
                    <div className="booking-detail-label">Trajet</div>
                    <div className="booking-detail-value">
                      {voyage.lieuDepart} vers {voyage.lieuArrive}
                    </div>
                    <div
                      style={{
                        fontSize: "var(--font-size-xs)",
                        color: "var(--gray-600)",
                        marginTop: "4px",
                      }}
                    >
                      {voyage.pointDeDepart} vers {voyage.pointArrivee}
                    </div>
                  </div>
                </div>

                {/* Date */}
                <div className="booking-detail-item">
                  <Clock className="booking-detail-icon" />
                  <div className="booking-detail-content">
                    <div className="booking-detail-label">Date</div>
                    <div className="booking-detail-value">
                      {formatDate(voyage.dateDepartPrev)}
                    </div>
                  </div>
                </div>

                {/* Prix */}
                <div className="booking-detail-item">
                  <CreditCard className="booking-detail-icon" />
                  <div className="booking-detail-content">
                    <div className="booking-detail-label">Prix par place</div>
                    <div className="booking-detail-value">
                      {voyage.prix} FCFA
                    </div>
                  </div>
                </div>

                {/* Classe */}
                <div className="booking-detail-item">
                  <Users className="booking-detail-icon" />
                  <div className="booking-detail-content">
                    <div className="booking-detail-label">Classe</div>
                    <span className="booking-class-badge">
                      {voyage.nomClasseVoyage}
                    </span>
                  </div>
                </div>

                {/* Bagages */}
                <div
                  className="booking-detail-item"
                  style={{ borderBottom: "none", paddingBottom: 0 }}
                >
                  <Luggage className="booking-detail-icon" />
                  <div className="booking-detail-content">
                    <div className="booking-detail-label">
                      Bagages par passager
                    </div>
                    <div className="baggage-counter">
                      <button
                        onClick={() =>
                          setNombreBagages(Math.max(0, nombreBagages - 1))
                        }
                        disabled={nombreBagages === 0}
                      >
                        <Minus style={{ width: "16px", height: "16px" }} />
                      </button>
                      <span className="baggage-counter-value">
                        {nombreBagages}
                      </span>
                      <button
                        onClick={() => setNombreBagages(nombreBagages + 1)}
                      >
                        <Plus style={{ width: "16px", height: "16px" }} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Places sélectionnées */}
                {placesSelectionnees.length > 0 && (
                  <div className="selected-seats">
                    <div className="selected-seats-header">
                      <span
                        style={{
                          fontSize: "var(--font-size-sm)",
                          fontWeight: "var(--font-weight-medium)",
                          color: "var(--gray-700)",
                        }}
                      >
                        Places sélectionnées
                      </span>
                      <span className="selected-seats-count">
                        {placesSelectionnees.length}
                      </span>
                    </div>
                    <div className="selected-seats-list">
                      {placesSelectionnees.map((place) => (
                        <span key={place} className="seat-badge">
                          Place {place}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prix total */}
                <div className="price-summary">
                  <div className="price-summary-row">
                    <span className="price-summary-label">Total</span>
                    <span className="price-summary-value">
                      {placesSelectionnees.length * voyage.prix} FCFA
                    </span>
                  </div>
                </div>

                {/* Boutons */}
                <button
                  onClick={initiateReservation}
                  disabled={placesSelectionnees.length === 0}
                  className="btn btn-primary"
                  style={{
                    width: "fit-content",
                    marginTop: "var(--spacing-lg)",
                    marginRight: "10px",
                  }}
                >
                  Réserver
                </button>

                <button
                  onClick={() => router.push("/user/client/book")}
                  className="btn btn-secondary"
                  style={{
                    width: "fit-content",
                    marginTop: "var(--spacing-sm)",
                  }}
                >
                  Retour
                </button>
              </div>

              {/* Seat Map Panel */}
              <div className="seat-map-container">
                <h2
                  style={{
                    fontSize: "var(--font-size-xl)",
                    fontWeight: "var(--font-weight-bold)",
                    color: "var(--gray-900)",
                    marginBottom: "var(--spacing-sm)",
                  }}
                >
                  Sélection des places
                </h2>
                <p
                  style={{
                    fontSize: "var(--font-size-sm)",
                    color: "var(--gray-600)",
                    marginBottom: "var(--spacing-lg)",
                  }}
                >
                  Cliquez sur les places disponibles
                </p>

                {/* Légende */}
                <div className="seat-map-legend">
                  <div className="legend-item">
                    <div className="legend-box available" />
                    <span className="legend-label">Disponible</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-box selected" />
                    <span className="legend-label">Sélectionnée</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-box reserved" />
                    <span className="legend-label">Réservée</span>
                  </div>
                </div>

                {/* Plan des sièges */}
                <div className="seat-grid">{renderSeatMap()}</div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Passagers */}
      {showPassagersModal && (
        <div className="modal-overlay">
          <div className="payment-modal-content">
            <div className="payment-modal-header">
              <h2 className="payment-modal-title">
                Informations des passagers
              </h2>
              <button
                onClick={() => setShowPassagersModal(false)}
                className="payment-modal-close"
              >
                <X />
              </button>
            </div>

            <div className="payment-modal-body">
              <div className="passenger-form-grid">
                {passagers.map((passager, index) => (
                  <div key={index} className="passenger-card">
                    <div className="passenger-card-header">
                      <div className="passenger-card-icon">
                        <UserIcon style={{ width: "16px", height: "16px" }} />
                      </div>
                      <div>
                        <div className="passenger-card-title">
                          Passager {index + 1}
                        </div>
                        <div className="passenger-card-seat">
                          <Users style={{ width: "12px", height: "12px" }} />
                          <span>Place {passager.placeChoisis}</span>
                        </div>
                      </div>
                    </div>

                    <div className="passenger-card-body">
                      <div className="passenger-field">
                        <label className="passenger-field-label">
                          N° Pièce d'identité *
                        </label>
                        <input
                          type="text"
                          value={passager.numeroPieceIdentific}
                          onChange={(e) =>
                            updatePassager(
                              index,
                              "numeroPieceIdentific",
                              e.target.value,
                            )
                          }
                          placeholder="CNI, Passeport..."
                        />
                      </div>

                      <div className="passenger-field">
                        <label className="passenger-field-label">
                          Nom complet *
                        </label>
                        <input
                          type="text"
                          value={passager.nom}
                          onChange={(e) =>
                            updatePassager(index, "nom", e.target.value)
                          }
                          placeholder="Nom et prénom(s)"
                        />
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "var(--spacing-md)",
                        }}
                      >
                        <div className="passenger-field">
                          <label className="passenger-field-label">
                            Genre *
                          </label>
                          <div className="gender-buttons">
                            <button
                              type="button"
                              onClick={() =>
                                updatePassager(index, "genre", "MALE")
                              }
                              className={`gender-button ${passager.genre === "MALE" ? "active" : ""}`}
                            >
                              M
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updatePassager(index, "genre", "FEMALE")
                              }
                              className={`gender-button ${passager.genre === "FEMALE" ? "active" : ""}`}
                            >
                              F
                            </button>
                          </div>
                        </div>

                        <div className="passenger-field">
                          <label className="passenger-field-label">Âge *</label>
                          <input
                            type="number"
                            value={passager.age}
                            onChange={(e) =>
                              updatePassager(index, "age", e.target.value)
                            }
                            placeholder="Âge"
                            min="1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={effectuerReservation}
                disabled={isLoadingReservation || !isFormValid()}
                className="btn btn-primary btn-full-width"
                style={{ marginTop: "var(--spacing-xl)" }}
              >
                {isLoadingReservation ? (
                  <>
                    <RefreshCw className="spin" />
                    <span>Réservation en cours...</span>
                  </>
                ) : (
                  <span>Confirmer la réservation</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Paiement */}
      {showPaymentModal && reservationCourante && (
        <div className="modal-overlay">
          <div className="payment-modal-content">
            <div className="payment-modal-header">
              <h2 className="payment-modal-title">Paiement</h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="payment-modal-close"
              >
                <X />
              </button>
            </div>

            <div className="payment-modal-body">
              <div className="payment-summary-modal">
                <h3 className="payment-summary-title">Résumé</h3>
                <div className="payment-summary-item">
                  <span className="payment-summary-item-label">Agence</span>
                  <span className="payment-summary-item-value">
                    {reservationCourante.voyage.nomAgence}
                  </span>
                </div>
                <div className="payment-summary-item">
                  <span className="payment-summary-item-label">Départ</span>
                  <span className="payment-summary-item-value">
                    {reservationCourante.voyage.lieuDepart} -{" "}
                    {reservationCourante.voyage.pointDeDepart}
                  </span>
                </div>
                <div className="payment-summary-item">
                  <span className="payment-summary-item-label">
                    Destination
                  </span>
                  <span className="payment-summary-item-value">
                    {reservationCourante.voyage.lieuArrive} -{" "}
                    {reservationCourante.voyage.pointArrivee}
                  </span>
                </div>
                <div className="payment-summary-item">
                  <span className="payment-summary-label">Date de départ</span>
                  <span className="payment-summary-value">
                    {formatDate(reservationCourante.voyage.dateDepartPrev)}
                  </span>
                </div>
                <div className="payment-summary-item-end payment-summary-item">
                  <span className="payment-summary-item-label">Passagers</span>
                  <span className="payment-summary-item-value">
                    {reservationCourante.placesReservees.length}
                  </span>
                </div>
                <div className="payment-total">
                  <span className="payment-total-label">Total</span>
                  <span className="payment-total-value">
                    {reservationCourante.prixTotal} FCFA
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Numéro de téléphone *</label>
                <input
                  type="tel"
                  value={mobilePhone}
                  onChange={(e) => setMobilePhone(e.target.value)}
                  placeholder="(+237) 6XX XXX XXX"
                  className="form-input"
                  maxLength={9}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nom du propriétaire *</label>
                <input
                  type="text"
                  value={mobilePhoneName}
                  onChange={(e) => setMobilePhoneName(e.target.value)}
                  placeholder="Nom complet"
                  className="form-input"
                />
              </div>

              <div className="payment-info-box">
                Une demande de paiement sera envoyée sur ce numéro.
              </div>

              <button
                onClick={effectuerPaiement}
                disabled={
                  isLoadingPayment ||
                  !mobilePhone.trim() ||
                  !mobilePhoneName.trim()
                }
                className="btn btn-primary btn-full-width"
                style={{ marginLeft: "auto", display: "flex" }}
              >
                {isLoadingPayment ? (
                  <>
                    <RefreshCw className="spin" />
                    <span>Paiement en cours...</span>
                  </>
                ) : (
                  <>
                    <CreditCard />
                    <span>Confirmer le paiement</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <SuccessModal
        show={showSuccessModal}
        onClose={openPaymentModal}
        title="Réservation effectuée"
        message="Votre réservation a été enregistrée avec succès."
        buttonText="Payer maintenant"
      />

      {/* Error Modal */}
      <ErrorModal
        show={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={errorMessage}
      />
    </div>
  );
}

export default function VoyageReservationPage() {
  return (
    <Suspense
      fallback={
        <div className="loading-state">
          <RefreshCw className="spin" />
          <p>Chargement...</p>
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}
