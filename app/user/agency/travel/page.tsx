"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  Bus,
  Calendar,
  Users,
  Settings,
  MapPin,
  Clock,
  Building2,
  ChevronDown,
  Car,
  DollarSign,
  RefreshCw,
  X,
  Wifi,
  Package,
  Coffee,
  Music,
} from "lucide-react";
import Sidebar from "@/app/components/Sidebar";
import MobileSidebar from "@/app/components/Mobilesidebar";
import Header from "@/app/components/Header";
import SuccessModal from "@/app/components/SuccessModal";
import ErrorModal from "@/app/components/ErrorModal";
import { useLanguage } from "@/app/providers";

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
  first_name: string;
  last_name: string;
  email: string;
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
  const router = useRouter();

  const [agences, setAgences] = useState<AgenceValidee[]>([]);
  const [selectedAgence, setSelectedAgence] = useState<AgenceValidee | null>(
    null,
  );
  const [classesVoyage, setClassesVoyage] = useState<ClassVoyage[]>([]);
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);

  const [isLoadingAgences, setIsLoadingAgences] = useState(true);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isLoadingChauffeurs, setIsLoadingChauffeurs] = useState(false);
  const [isLoadingVehicules, setIsLoadingVehicules] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAgenceSelector, setShowAgenceSelector] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { t } = useLanguage();

  const [formData, setFormData] = useState<VoyageFormData>({
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
    statusVoyage: "PUBLIE",
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

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
      label: t("Réservations", "Reservations"),
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
      label: t("Mes paramètres", "My settings"),
      path: "/user/agency/settings",
      active: false,
    },
  ];

  const AMENITIES_OPTIONS = [
    { value: "WIFI", label: t("WiFi", "WiFi"), icon: Wifi },
    { value: "LUGGAGE_STORAGE", label: t("Bagages", "Luggage"), icon: Package },
    { value: "MEAL_SERVICE", label: t("Nourriture", "Meal"), icon: Coffee },
    { value: "MUSIC", label: t("Musique", "Music"), icon: Music },
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
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (userData?.userId) {
      fetchAgences();
    }
  }, [userData?.userId]);

  useEffect(() => {
    if (selectedAgence?.agency_id) {
      setFormData((prev) => ({
        ...prev,
        agenceVoyageId: selectedAgence.agency_id,
        lieuDepart: selectedAgence.ville,
        pointDeDepart: selectedAgence.location,
      }));
      fetchClassesVoyage();
      fetchChauffeurs(selectedAgence.agency_id);
      fetchVehicules(selectedAgence.agency_id);
    }
  }, [selectedAgence?.agency_id]);

  useEffect(() => {
    if (formData.vehiculeId && vehicules.length > 0) {
      const selectedVehicule = vehicules.find(
        (v) => v.idVehicule === formData.vehiculeId,
      );
      if (selectedVehicule) {
        setFormData((prev) => ({
          ...prev,
          nbrPlaceReservable: selectedVehicule.nbrPlaces,
        }));
      }
    }
  }, [formData.vehiculeId, vehicules]);

  const fetchAgences = async () => {
    setIsLoadingAgences(true);
    try {
      const authToken =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
      const response = await fetch(
        `${API_BASE_URL}/agence/validated?page=0&size=1000`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      if (!response.ok)
        throw new Error(
          t("Erreur lors du chargement des agences", "Failed to load agencies"),
        );

      const data = await response.json();
      const allAgences = data.content || data || [];
      const myAgences = allAgences.filter(
        (agence: AgenceValidee) => agence.user_id === userData?.userId,
      );

      setAgences(myAgences);
      if (myAgences.length > 0 && !selectedAgence) {
        setSelectedAgence(myAgences[0]);
      }
    } catch (error: any) {
      setErrorMessage(
        t("Impossible de charger vos agences", "Unable to load your agencies"),
      );
    } finally {
      setIsLoadingAgences(false);
    }
  };

  const fetchClassesVoyage = async () => {
    setIsLoadingClasses(true);
    try {
      const authToken =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
      const response = await fetch(
        `${API_BASE_URL}/class-voyage?page=0&size=100`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      if (!response.ok)
        throw new Error(
          t("Erreur lors du chargement des classes", "Failed to load classes"),
        );

      const data = await response.json();
      const content = data.content || data || [];
      const agenceClasses = content.filter(
        (classe: ClassVoyage) =>
          classe.idAgenceVoyage === selectedAgence?.agency_id,
      );
      setClassesVoyage(agenceClasses);
    } catch (error: any) {
      console.error("Fetch Classes Error:", error);
    } finally {
      setIsLoadingClasses(false);
    }
  };

  const fetchChauffeurs = async (agenceId: string) => {
    setIsLoadingChauffeurs(true);
    try {
      const authToken =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
      const response = await fetch(
        `${API_BASE_URL}/utilisateur/chauffeurs/${agenceId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      if (!response.ok)
        throw new Error(
          t("Erreur lors du chargement des chauffeurs", "Failed to load drivers"),
        );

      const data = await response.json();
      setChauffeurs(Array.isArray(data) ? data : [data]);
    } catch (error: any) {
      setChauffeurs([]);
    } finally {
      setIsLoadingChauffeurs(false);
    }
  };

  const fetchVehicules = async (agenceId: string) => {
    setIsLoadingVehicules(true);
    try {
      const authToken =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
      const response = await fetch(
        `${API_BASE_URL}/vehicule/agence/${agenceId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      if (!response.ok)
        throw new Error(
          t("Erreur lors du chargement des véhicules", "Failed to load vehicles"),
        );

      const data = await response.json();
      setVehicules(Array.isArray(data) ? data : [data]);
    } catch (error: any) {
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
      const authToken =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");

      const updatedFormData = {
        ...formData,
        nbrPlaceRestante: formData.nbrPlaceReservable,
      };

      const response = await fetch(`${API_BASE_URL}/voyage/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(updatedFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            t("Erreur lors de la création du voyage", "Failed to create trip"),
        );
      }

      setShowSuccessModal(true);
    } catch (error: any) {
      setErrorMessage(
        error.message ||
          t(
            "Une erreur est survenue lors de la création du voyage",
            "An error occurred while creating the trip",
          ),
      );
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.titre &&
      formData.description &&
      formData.dateDepartPrev &&
      formData.lieuDepart &&
      formData.lieuArrive &&
      formData.pointDeDepart &&
      formData.pointArrivee &&
      formData.nbrPlaceReservable > 0 &&
      formData.chauffeurId &&
      formData.vehiculeId &&
      formData.classVoyageId &&
      formData.agenceVoyageId
    );
  };

  return (
    <div className="dashboard-layout">
      <Sidebar menuItems={MENU_ITEMS} activePath="/user/agency/travels" />
      <MobileSidebar
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        menuItems={MENU_ITEMS}
        activePath="/user/agency/travels"
      />

      <div className="dashboard-main">
        <Header
          title={t("Créer un voyage", "Create a trip")}
          userData={userData}
          onMenuClick={() => setShowMobileMenu(true)}
          userType="agency"
        />

        <main className="dashboard-content">
          {isLoadingAgences ? (
            <div className="loading-state">
              <RefreshCw className="spin" />
              <p>{t("Chargement en cours...", "Loading...")}</p>
            </div>
          ) : agences.length === 0 ? (
            <div className="empty-state">
              <Building2 className="empty-icon" />
              <h3 className="empty-title">
                {t("Aucune agence validée", "No validated agency")}
              </h3>
              <p className="empty-description">
                {t(
                  "Vous devez avoir une agence pour créer des voyages",
                  "You need an agency to create trips",
                )}
              </p>
              <button
                className="btn btn-primary"
                onClick={() => router.push("/user/agency/dashboard")}
                style={{ marginTop: "20px" }}
              >
                {t("Retour au dashboard", "Back to dashboard")}
              </button>
            </div>
          ) : (
            <div className="container" style={{ maxWidth: "1200px" }}>
              <div className="section-header">
                <h2 className="section-title">
                  {t("Nouveau voyage", "New trip")}
                </h2>
                <p className="section-description">
                  {t(
                    "Programmer un nouveau voyage pour votre agence de voyage",
                    "Schedule a new trip for your agency",
                  )}
                </p>
              </div>

              {/* Agency Header */}
              <div className="agency-header-card">
                <div className="agency-info">
                  <h2 className="agency-name">
                    {t("Nom de votre organisation :", "Organization name:")}{" "}
                    {selectedAgence?.long_name}
                  </h2>
                  <p className="agency-location">
                    {t(
                      "Adresse de votre agence de voyage :",
                      "Agency address:",
                    )}{" "}
                    {selectedAgence?.ville} - {selectedAgence?.location}
                  </p>
                </div>

                {agences.length > 1 && (
                  <div className="agency-selector">
                    <button
                      onClick={() => setShowAgenceSelector(!showAgenceSelector)}
                      className="btn btn-secondary"
                    >
                      {t("Changer", "Change")}
                      <ChevronDown />
                    </button>

                    {showAgenceSelector && (
                      <>
                        <div
                          className="selector-overlay"
                          onClick={() => setShowAgenceSelector(false)}
                        ></div>
                        <div className="selector-dropdown">
                          {agences.map((agence) => (
                            <button
                              key={agence.agency_id}
                              onClick={() => handleSelectAgence(agence)}
                              className={`selector-item ${selectedAgence?.agency_id === agence.agency_id ? "active" : ""}`}
                            >
                              <div>
                                <p className="selector-item-name">
                                  {agence.long_name}
                                </p>
                                <p className="selector-item-city">
                                  {agence.ville}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="create-voyage-form">
                {/* Informations générales */}
                <div className="form-section">
                  <div className="form-section-header">
                    <Bus />
                    <h3>{t("Informations générales", "General information")}</h3>
                  </div>
                  <div className="form-section-content">
                    <div
                      className="form-group"
                      style={{ gridColumn: "1 / -1" }}
                    >
                      <label className="form-label">
                        {t("Titre du voyage *", "Trip title *")}
                      </label>
                      <input
                        type="text"
                        name="titre"
                        value={formData.titre}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                        style={{ width: "fit-content" }}
                        placeholder={t("Ex: Yaoundé Express", "e.g., Yaoundé Express")}
                      />
                    </div>

                    <div
                      className="form-group"
                      style={{ gridColumn: "1 / -1" }}
                    >
                      <label className="form-label">
                        {t("Description *", "Description *")}
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        className="form-textarea"
                        placeholder={t(
                          "Décrivez votre voyage...",
                          "Describe your trip...",
                        )}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">{t("Statut", "Status")}</label>
                      <input
                        type="text"
                        name="statusVoyage"
                        value={formData.statusVoyage}
                        disabled
                        className="form-input"
                        style={{
                          backgroundColor: "var(--gray-100)",
                          cursor: "not-allowed",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Itinéraire */}
                <div className="form-section">
                  <div className="form-section-header">
                    <MapPin />
                    <h3>{t("Itinéraire", "Itinerary")}</h3>
                  </div>
                  <div className="form-section-content">
                    <div className="form-group">
                      <label className="form-label">
                        {t("Ville de départ *", "Departure city *")}
                      </label>
                      <input
                        type="text"
                        name="lieuDepart"
                        value={formData.lieuDepart}
                        disabled
                        className="form-input"
                        style={{
                          backgroundColor: "var(--gray-100)",
                          cursor: "not-allowed",
                        }}
                      />
                      <p className="form-helper-text">
                        {t("Ville de votre agence", "Your agency city")}
                      </p>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        {t("Ville d'arrivée *", "Arrival city *")}
                      </label>
                      <select
                        name="lieuArrive"
                        value={formData.lieuArrive}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                      >
                        <option value="">
                          {t("Sélectionner une ville", "Select a city")}
                        </option>
                        <option value="Douala">Douala</option>
                        <option value="Yaoundé">Yaoundé</option>
                        <option value="Bafoussam">Bafoussam</option>
                        <option value="Bamenda">Bamenda</option>
                        <option value="Garoua">Garoua</option>
                        <option value="Maroua">Maroua</option>
                        <option value="Ngaoundéré">Ngaoundéré</option>
                        <option value="Bertoua">Bertoua</option>
                        <option value="Ebolowa">Ebolowa</option>
                        <option value="Kribi">Kribi</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        {t("Point de départ *", "Departure point *")}
                      </label>
                      <input
                        type="text"
                        name="pointDeDepart"
                        value={formData.pointDeDepart}
                        disabled
                        className="form-input"
                        style={{
                          backgroundColor: "var(--gray-100)",
                          cursor: "not-allowed",
                        }}
                      />
                      <p className="form-helper-text">
                        {t("Zone de votre agence", "Your agency area")}
                      </p>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        {t("Point d'arrivée *", "Arrival point *")}
                      </label>
                      <input
                        type="text"
                        name="pointArrivee"
                        value={formData.pointArrivee}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                        placeholder={t("Ex: Bonabéri", "e.g., Bonabéri")}
                      />
                    </div>
                  </div>
                </div>

                {/* Dates et horaires */}
                <div className="form-section">
                  <div className="form-section-header">
                    <Clock />
                    <h3>{t("Dates et horaires", "Dates and times")}</h3>
                  </div>
                  <div className="form-section-content">
                    <div className="form-group">
                      <label className="form-label">
                        {t("Date de départ prévue *", "Planned departure date *")}
                      </label>
                      <input
                        type="datetime-local"
                        name="dateDepartPrev"
                        value={formData.dateDepartPrev}
                        onChange={handleInputChange}
                        required
                        min={getMinDateTime()}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        {t("Heure de départ effectif", "Actual departure time")}
                      </label>
                      <input
                        type="datetime-local"
                        name="heureDepartEffectif"
                        value={formData.heureDepartEffectif}
                        onChange={handleInputChange}
                        min={getMinDateTime()}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        {t("Heure d'arrivée", "Arrival time")}
                      </label>
                      <input
                        type="datetime-local"
                        name="heureArrive"
                        value={formData.heureArrive}
                        onChange={handleInputChange}
                        min={getMinDateTime()}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        {t("Date limite réservation", "Booking deadline")}
                      </label>
                      <input
                        type="datetime-local"
                        name="dateLimiteReservation"
                        value={formData.dateLimiteReservation}
                        onChange={handleInputChange}
                        min={getMinDateTime()}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        {t("Date limite confirmation", "Confirmation deadline")}
                      </label>
                      <input
                        type="datetime-local"
                        name="dateLimiteConfirmation"
                        value={formData.dateLimiteConfirmation}
                        onChange={handleInputChange}
                        min={getMinDateTime()}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Ressources */}
                <div className="form-section">
                  <div className="form-section-header">
                    <Car />
                    <h3>{t("Ressources", "Resources")}</h3>
                  </div>
                  <div className="form-section-content">
                    <div className="form-group">
                      <label className="form-label">
                        {t("Chauffeur *", "Driver *")}
                      </label>
                      <select
                        name="chauffeurId"
                        value={formData.chauffeurId}
                        onChange={handleInputChange}
                        required
                        disabled={isLoadingChauffeurs}
                        className="form-select"
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

                    <div className="form-group">
                      <label className="form-label">
                        {t("Véhicule *", "Vehicle *")}
                      </label>
                      <select
                        name="vehiculeId"
                        value={formData.vehiculeId}
                        onChange={handleInputChange}
                        required
                        disabled={isLoadingVehicules}
                        className="form-select"
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

                    <div className="form-group">
                      <label className="form-label">
                        {t("Classe de voyage *", "Travel class *")}
                      </label>
                      <select
                        name="classVoyageId"
                        value={formData.classVoyageId}
                        onChange={handleInputChange}
                        required
                        disabled={isLoadingClasses}
                        className="form-select"
                      >
                        <option value="">
                          {t("Sélectionner une classe", "Select a class")}
                        </option>
                        {classesVoyage.map((classe) => (
                          <option
                            key={classe.idClassVoyage}
                            value={classe.idClassVoyage}
                          >
                            {classe.nom} - {classe.prix} FCFA
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        {t("Nombre de places *", "Number of seats *")}
                      </label>
                      <input
                        type="number"
                        name="nbrPlaceReservable"
                        value={formData.nbrPlaceReservable}
                        disabled
                        className="form-input"
                        style={{
                          backgroundColor: "var(--gray-100)",
                          cursor: "not-allowed",
                        }}
                      />
                      <p className="form-helper-text">
                        {t(
                          "Capacité du véhicule sélectionné",
                          "Selected vehicle capacity",
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Équipements */}
                <div className="form-section">
                  <div className="form-section-header">
                    <DollarSign />
                    <h3>{t("Équipements disponibles", "Available amenities")}</h3>
                  </div>
                  <div className="amenities-grid">
                    {AMENITIES_OPTIONS.map((amenity) => {
                      const Icon = amenity.icon;
                      const isSelected = formData.amenities.includes(
                        amenity.value,
                      );
                      return (
                        <button
                          key={amenity.value}
                          type="button"
                          onClick={() => handleAmenityToggle(amenity.value)}
                          className={`amenity-button ${isSelected ? "active" : ""}`}
                        >
                          <Icon className="amenity-icon" />
                          <span className="amenity-label">{amenity.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Images */}
                <div className="form-section">
                  <div className="form-section-header">
                    <MapPin />
                    <h3>{t("Images (optionnel)", "Images (optional)")}</h3>
                  </div>
                  <div className="form-section-content">
                    <div className="form-group">
                      <label className="form-label">
                        {t("URL petite image", "Small image URL")}
                      </label>
                      <input
                        type="url"
                        name="smallImage"
                        value={formData.smallImage}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder={t(
                          "https://example.com/image-small.jpg",
                          "https://example.com/image-small.jpg",
                        )}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        {t("URL grande image", "Large image URL")}
                      </label>
                      <input
                        type="url"
                        name="bigImage"
                        value={formData.bigImage}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder={t(
                          "https://example.com/image-big.jpg",
                          "https://example.com/image-big.jpg",
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => router.push("/user/agency/travels")}
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
                      <span>{t("Créer le voyage", "Create trip")}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      <SuccessModal
        show={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push("/user/agency/travels");
        }}
        title={t("Voyage créé !", "Trip created!")}
        message={t(
          "Votre voyage a été créé avec succès.",
          "Your trip has been created successfully.",
        )}
        buttonText={t("Voir mes voyages", "See my trips")}
      />

      <ErrorModal
        show={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={errorMessage}
      />
    </div>
  );
}
