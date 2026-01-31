"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Home,
  Calendar,
  FileText,
  Ticket,
  Gift,
  History,
  Settings,
  RefreshCw,
  MapPin,
  Compass,
  Users,
  Group,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import Sidebar from "@/app/components/Sidebar";
import MobileSidebar from "@/app/components/Mobilesidebar";
import Header from "@/app/components/Header";

interface Voyage {
  idVoyage: string;
  titre: string;
  lieuDepart: string;
  lieuArrive: string;
  pointDeDepart: string;
  pointArrivee: string;
  dateDepartPrev: string;
  prix: number;
  smallImage: string;
  nomAgence: string;
  nbrPlaceRestante: number;
  nbrPlaceReservable: number;
  nbrPlaceConfirm: number;
  nbrPlaceReserve: number;
  nomClasseVoyage: string;
}

interface UserData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface AgenceValidee {
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

export default function ClientHomePage() {
  const router = useRouter();
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [agences, setAgences] = useState<AgenceValidee[]>([]);
  const [agencesPage, setAgencesPage] = useState(0);
  const [agencesTotalPages, setAgencesTotalPages] = useState(0);
  const [isLoadingAgences, setIsLoadingAgences] = useState(false);
  const [agencesSearch, setAgencesSearch] = useState("");

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const VOYAGES_PER_PAGE = 100;
  const AGENCES_PER_PAGE = 100;

  const menuItems = [
    { icon: Home, label: "Accueil", path: "/user/client/home", active: true },
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
    fetchVoyages();
    fetchAgences();
  }, [currentPage, agencesPage]);

  const fetchVoyages = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/voyage/all?page=${currentPage}&size=${VOYAGES_PER_PAGE}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des voyages");
      }

      const data = await response.json();
      const allVoyages = data.content || [];

      const dateActuelle = new Date();
      const voyagesFuturs = allVoyages.filter((voyage: Voyage) => {
        const dateDepart = new Date(voyage.dateDepartPrev);
        return dateDepart > dateActuelle;
      });

      setVoyages(voyagesFuturs);
    } catch (error: any) {
      setErrorMessage("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAgences = async () => {
    setIsLoadingAgences(true);

    try {
      const authToken =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");

      const response = await fetch(
        `${API_BASE_URL}/agence/validated?page=${agencesPage}&size=${AGENCES_PER_PAGE}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des agences");
      }

      const data = await response.json();
      setAgences(data.content || []);
      setAgencesTotalPages(data.totalPages || 0);
    } catch (error: any) {
      console.error("Fetch Agences Error:", error);
    } finally {
      setIsLoadingAgences(false);
    }
  };

  const handleReserver = (voyageId: string) => {
    router.push(`/user/client/booking?voyage_id=${voyageId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="dashboard-layout">
      <Sidebar menuItems={menuItems} activePath="/user/client/home" />
      <MobileSidebar
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        menuItems={menuItems}
        activePath="/user/client/home"
      />

      <div className="dashboard-main">
        <Header
          title="Voyages"
          userData={userData}
          onMenuClick={() => setShowMobileMenu(true)}
        />

        <main className="dashboard-content">
          <div className="content-header">
            <h2 className="content-title">
              {voyages.length === 0
                ? "Aucun voyage disponible"
                : "Voyages disponibles"}
            </h2>
            <div className="content-actions">
              <button
                onClick={fetchVoyages}
                disabled={isLoading}
                className="btn btn-secondary"
              >
                <RefreshCw className={isLoading ? "spin" : ""} />
                <span>Actualiser</span>
              </button>
              <button
                onClick={() => router.push("/user/client/book")}
                className="btn btn-primary"
              >
                <Calendar />
                <span>Réserver</span>
              </button>
            </div>
          </div>

          <div className="content-grid">
            <div className="content-main">
              {isLoading && (
                <div className="loading-state">
                  <RefreshCw className="spin" />
                  <p>Chargement des voyages...</p>
                </div>
              )}

              {errorMessage && (
                <>
                  <div className="error-state">
                    <X className="error-state-icon" />
                    <p className="error-text">{errorMessage}</p>
                    <button
                      type="button"
                      onClick={fetchVoyages}
                      className="btn modal-button modal-button-error"
                    >
                      Réessayer
                    </button>
                  </div>
                </>
              )}

              {!isLoading && !errorMessage && voyages.length === 0 && (
                <div className="empty-state">
                  <Calendar className="empty-icon" />
                  <h3
                    onClick={() => window.location.reload()}
                    className="empty-title"
                  >
                    Aucun voyage disponible
                  </h3>
                  <p className="empty-description">
                    Il n'y a pas de voyages disponibles pour le moment.
                  </p>
                  <button onClick={fetchVoyages} className="btn btn-primary">
                    Actualiser
                  </button>
                </div>
              )}

              {!isLoading && !errorMessage && voyages.length > 0 && (
                <div className="voyages-grid">
                  {voyages.map((voyage) => (
                    <div key={voyage.idVoyage} className="voyage-card">
                      <div className="voyage-image">
                        <Image
                          src={
                            voyage.smallImage ||
                            "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800"
                          }
                          alt={voyage.titre || "Voyage"}
                          fill
                          style={{ objectFit: "cover" }}
                          quality={75}
                        />
                        <div className="voyage-badge">
                          #{voyage.idVoyage.slice(0, 13)}
                        </div>
                      </div>
                      <div className="voyage-content">
                        <div className="voyage-info">
                          <MapPin />
                          <h3>
                            De {voyage.lieuDepart} vers {voyage.lieuArrive}
                          </h3>
                        </div>
                        <div className="voyage-info">
                          <Compass />
                          <span>
                            Itinéraire : {voyage.pointDeDepart} vers{" "}
                            {voyage.pointArrivee}
                          </span>
                        </div>
                        <div className="voyage-info">
                          <Users />
                          <span>
                            {voyage.nbrPlaceReservable} /{" "}
                            {voyage.nbrPlaceRestante + voyage.nbrPlaceConfirm}{" "}
                            Places restantes
                          </span>
                        </div>
                        <div className="voyage-info">
                          <Group />
                          <span>Classe : {voyage.nomClasseVoyage}</span>
                        </div>
                        <div className="voyage-price">
                          <span>Le {formatDate(voyage.dateDepartPrev)}</span>
                          <span className="price">{voyage.prix} FCFA</span>
                        </div>
                        <button
                          onClick={() => handleReserver(voyage.idVoyage)}
                          className="btn btn-outline-primary"
                        >
                          Réserver maintenant
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <aside className="content-sidebar">
              <div className="agences-widget">
                <h3 className="widget-title">Agences validées</h3>

                <div className="widget-search">
                  <div className="search-input-wrapper">
                    <Search />
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={agencesSearch}
                      onChange={(e) => setAgencesSearch(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={fetchAgences}
                    disabled={isLoadingAgences}
                    className="btn-icon"
                  >
                    <RefreshCw className={isLoadingAgences ? "spin" : ""} />
                  </button>
                </div>

                {isLoadingAgences ? (
                  <div className="widget-loading">
                    <RefreshCw className="spin" />
                  </div>
                ) : agences.length === 0 ? (
                  <p className="widget-empty">Aucune agence validée</p>
                ) : (
                  <>
                    <div className="agences-list">
                      {agences
                        .filter((agence) =>
                          agence.long_name
                            .toLowerCase()
                            .includes(agencesSearch.toLowerCase()),
                        )
                        .map((agence) => (
                          <div key={agence.agency_id} className="agence-item">
                            <h4>Nom : {agence.long_name}</h4>
                            <p>Abréviation : {agence.short_name}</p>
                            <p>Ville : {agence.ville}</p>
                            <p>Zone : {agence.location}</p>
                            <p>Réseau social : {agence.social_network}</p>
                          </div>
                        ))}
                    </div>

                    {agencesTotalPages > 1 && (
                      <div className="widget-pagination">
                        <button
                          onClick={() =>
                            setAgencesPage(Math.max(0, agencesPage - 1))
                          }
                          disabled={agencesPage === 0}
                          className="btn-icon"
                        >
                          <ChevronLeft />
                        </button>
                        <span>
                          {agencesPage + 1} / {agencesTotalPages}
                        </span>
                        <button
                          onClick={() =>
                            setAgencesPage(
                              Math.min(agencesTotalPages - 1, agencesPage + 1),
                            )
                          }
                          disabled={agencesPage === agencesTotalPages - 1}
                          className="btn-icon"
                        >
                          <ChevronRight />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
