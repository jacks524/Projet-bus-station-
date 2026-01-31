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
      label: "Dashboard",
      path: "/user/agency/dashboard",
      active: false,
    },
    {
      icon: Bus,
      label: "Voyages",
      path: "/user/agency/travels",
      active: false,
    },
    {
      icon: Calendar,
      label: "Réservations",
      path: "/user/agency/reservations",
      active: false,
    },
    {
      icon: Users,
      label: "Chauffeurs",
      path: "/user/agency/drivers",
      active: false,
    },
    {
      icon: Settings,
      label: "Mes paramètres",
      path: "/user/agency/settings",
      active: false,
    },
  ];

  const AMENITIES_OPTIONS = [
    { value: "WIFI", label: "WiFi", icon: Wifi },
    { value: "LUGGAGE_STORAGE", label: "Bagages", icon: Package },
    { value: "MEAL_SERVICE", label: "Nourriture", icon: Coffee },
    { value: "MUSIC", label: "Musique", icon: Music },
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
        throw new Error("Erreur lors du chargement des agences");

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
      setErrorMessage("Impossible de charger vos agences");
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
        throw new Error("Erreur lors du chargement des classes");

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
        throw new Error("Erreur lors du chargement des chauffeurs");

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
        throw new Error("Erreur lors du chargement des véhicules");

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
          errorData.message || "Erreur lors de la création du voyage",
        );
      }

      setShowSuccessModal(true);
    } catch (error: any) {
      setErrorMessage(
        error.message ||
          "Une erreur est survenue lors de la création du voyage",
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
          title="Créer un voyage"
          userData={userData}
          onMenuClick={() => setShowMobileMenu(true)}
          userType="agency"
        />

        <main className="dashboard-content">
          {isLoadingAgences ? (
            <div className="loading-state">
              <RefreshCw className="spin" />
              <p>Chargement en cours...</p>
            </div>
          ) : agences.length === 0 ? (
            <div className="empty-state">
              <Building2 className="empty-icon" />
              <h3 className="empty-title">Aucune agence validée</h3>
              <p className="empty-description">
                Vous devez avoir une agence pour créer des voyages
              </p>
              <button
                className="btn btn-primary"
                onClick={() => router.push("/user/agency/dashboard")}
                style={{ marginTop: "20px" }}
              >
                Retour au dashboard
              </button>
            </div>
          ) : (
            <div className="container" style={{ maxWidth: "1200px" }}>
              <div className="section-header">
                <h2 className="section-title">Nouveau voyage</h2>
                <p className="section-description">
                  Programmmer un nouveau voyage pour votre agence de voyage
                </p>
              </div>

              {/* Agency Header */}
              <div className="agency-header-card">
                <div className="agency-info">
                  <h2 className="agency-name">
                    Nom de votre organisation : {selectedAgence?.long_name}
                  </h2>
                  <p className="agency-location">
                    Adresse de votre agence de voyage : {selectedAgence?.ville}{" "}
                    - {selectedAgence?.location}
                  </p>
                </div>

                {agences.length > 1 && (
                  <div className="agency-selector">
                    <button
                      onClick={() => setShowAgenceSelector(!showAgenceSelector)}
                      className="btn btn-secondary"
                    >
                      Changer
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
                    <h3>Informations générales</h3>
                  </div>
                  <div className="form-section-content">
                    <div
                      className="form-group"
                      style={{ gridColumn: "1 / -1" }}
                    >
                      <label className="form-label">Titre du voyage *</label>
                      <input
                        type="text"
                        name="titre"
                        value={formData.titre}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                        style={{ width: "fit-content" }}
                        placeholder="Ex: Yaoundé Express"
                      />
                    </div>

                    <div
                      className="form-group"
                      style={{ gridColumn: "1 / -1" }}
                    >
                      <label className="form-label">Description *</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        className="form-textarea"
                        placeholder="Décrivez votre voyage..."
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Statut</label>
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
                    <h3>Itinéraire</h3>
                  </div>
                  <div className="form-section-content">
                    <div className="form-group">
                      <label className="form-label">Ville de départ *</label>
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
                      <p className="form-helper-text">Ville de votre agence</p>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Ville d'arrivée *</label>
                      <select
                        name="lieuArrive"
                        value={formData.lieuArrive}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                      >
                        <option value="">Sélectionner une ville</option>
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
                      <label className="form-label">Point de départ *</label>
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
                      <p className="form-helper-text">Zone de votre agence</p>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Point d'arrivée *</label>
                      <input
                        type="text"
                        name="pointArrivee"
                        value={formData.pointArrivee}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                        placeholder="Ex: Bonabéri"
                      />
                    </div>
                  </div>
                </div>

                {/* Dates et horaires */}
                <div className="form-section">
                  <div className="form-section-header">
                    <Clock />
                    <h3>Dates et horaires</h3>
                  </div>
                  <div className="form-section-content">
                    <div className="form-group">
                      <label className="form-label">
                        Date de départ prévue *
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
                        Heure de départ effectif
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
                      <label className="form-label">Heure d'arrivée</label>
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
                        Date limite réservation
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
                        Date limite confirmation
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
                    <h3>Ressources</h3>
                  </div>
                  <div className="form-section-content">
                    <div className="form-group">
                      <label className="form-label">Chauffeur *</label>
                      <select
                        name="chauffeurId"
                        value={formData.chauffeurId}
                        onChange={handleInputChange}
                        required
                        disabled={isLoadingChauffeurs}
                        className="form-select"
                      >
                        <option value="">Sélectionner un chauffeur</option>
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
                      <label className="form-label">Véhicule *</label>
                      <select
                        name="vehiculeId"
                        value={formData.vehiculeId}
                        onChange={handleInputChange}
                        required
                        disabled={isLoadingVehicules}
                        className="form-select"
                      >
                        <option value="">Sélectionner un véhicule</option>
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
                      <label className="form-label">Classe de voyage *</label>
                      <select
                        name="classVoyageId"
                        value={formData.classVoyageId}
                        onChange={handleInputChange}
                        required
                        disabled={isLoadingClasses}
                        className="form-select"
                      >
                        <option value="">Sélectionner une classe</option>
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
                      <label className="form-label">Nombre de places *</label>
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
                        Capacité du véhicule sélectionné
                      </p>
                    </div>
                  </div>
                </div>

                {/* Équipements */}
                <div className="form-section">
                  <div className="form-section-header">
                    <DollarSign />
                    <h3>Équipements disponibles</h3>
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
                    <h3>Images (optionnel)</h3>
                  </div>
                  <div className="form-section-content">
                    <div className="form-group">
                      <label className="form-label">URL petite image</label>
                      <input
                        type="url"
                        name="smallImage"
                        value={formData.smallImage}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="https://example.com/image-small.jpg"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">URL grande image</label>
                      <input
                        type="url"
                        name="bigImage"
                        value={formData.bigImage}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="https://example.com/image-big.jpg"
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
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !isFormValid()}
                    className="btn btn-primary"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="spin" />
                        <span>Création en cours...</span>
                      </>
                    ) : (
                      <span>Créer le voyage</span>
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
        title="Voyage créé !"
        message="Votre voyage a été créé avec succès."
        buttonText="Voir mes voyages"
      />

      <ErrorModal
        show={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={errorMessage}
      />
    </div>
  );
}
