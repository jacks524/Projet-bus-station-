"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  MapPin,
  Compass,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import MobileSidebar from "@/app/components/Mobilesidebar";
import Header from "@/app/components/Header";

interface Voyage {
  idVoyage: string;
  nomAgence: string;
  lieuDepart: string;
  lieuArrive: string;
  pointDeDepart: string;
  pointArrivee: string;
  nbrPlaceRestante: number;
  nbrPlaceReservable: number;
  nbrPlaceConfirm: number;
  dateDepartPrev: string;
  nomClasseVoyage: string;
  prix: number;
  smallImage: string;
  statusVoyage: string;
}

interface UserData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

/**
 * Client Reserve/Book Page Component
 *
 * Search and book trips with clean professional design
 *
 * @author Félix DJOTIO NDIE
 * @date 2025-01-29
 */
export default function ClientReservePage() {
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [is_loading, setIsLoading] = useState(false);
  const [error_message, setErrorMessage] = useState("");
  const [show_mobile_menu, setShowMobileMenu] = useState(false);
  const [user_data, setUserData] = useState<UserData | null>(null);
  const [current_page, setCurrentPage] = useState(0);
  const [total_pages, setTotalPages] = useState(0);
  const [has_searched, setHasSearched] = useState(false);

  const [ville_depart, setVilleDepart] = useState("");
  const [ville_arrive, setVilleArrive] = useState("");
  const [zone_depart, setZoneDepart] = useState("");
  const [zone_arrive, setZoneArrive] = useState("");
  const [date_depart, setDateDepart] = useState("");

  const router = useRouter();

  const resultsRef = useRef<HTMLDivElement>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const VOYAGES_PER_PAGE = 12;

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
  }, []);

  useEffect(() => {
    if (has_searched) {
      searchVoyages();
    }
  }, [current_page]);

  const searchVoyages = async () => {
    if (!ville_depart || !ville_arrive) {
      setErrorMessage(
        "Veuillez renseigner au moins la ville de départ et d'arrivée",
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/voyage/all?page=0&size=1000`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json; charset=UTF-8",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la recherche");
      }

      const data = await response.json();
      let filtered_voyages = data.content || [];

      const now = new Date();
      filtered_voyages = filtered_voyages.filter((voyage: Voyage) => {
        const voyage_date = new Date(voyage.dateDepartPrev);
        return voyage_date >= now;
      });

      filtered_voyages = filtered_voyages.filter((voyage: Voyage) => {
        const match_depart = voyage.lieuDepart
          .toLowerCase()
          .includes(ville_depart.toLowerCase());

        const match_arrive = voyage.lieuArrive
          .toLowerCase()
          .includes(ville_arrive.toLowerCase());

        const match_zone_depart = zone_depart
          ? voyage.pointDeDepart
              .toLowerCase()
              .includes(zone_depart.toLowerCase())
          : true;

        const match_zone_arrive = zone_arrive
          ? voyage.pointArrivee
              .toLowerCase()
              .includes(zone_arrive.toLowerCase())
          : true;

        let match_date = true;
        if (date_depart) {
          const search_date = new Date(date_depart);
          const voyage_date = new Date(voyage.dateDepartPrev);

          match_date =
            search_date.getFullYear() === voyage_date.getFullYear() &&
            search_date.getMonth() === voyage_date.getMonth() &&
            search_date.getDate() === voyage_date.getDate();
        }

        return (
          match_depart &&
          match_arrive &&
          match_zone_depart &&
          match_zone_arrive &&
          match_date
        );
      });

      const total_results = filtered_voyages.length;
      const total_pages_calculated = Math.ceil(
        total_results / VOYAGES_PER_PAGE,
      );
      const start_index = current_page * VOYAGES_PER_PAGE;
      const end_index = start_index + VOYAGES_PER_PAGE;
      const paginated_voyages = filtered_voyages.slice(start_index, end_index);

      setVoyages(paginated_voyages);
      setTotalPages(total_pages_calculated);
      setHasSearched(true);
    } catch (error: any) {
      setErrorMessage("Une erreur est survenue lors de la recherche");
      console.error("Search Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    searchVoyages();

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleReserver = (voyage_id: string) => {
    router.push(`/user/client/booking?voyage_id=${voyage_id}`);
  };

  const formatTime = (date_string: string) => {
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
    <div className="dashboard-layout">
      <Sidebar menuItems={MENU_ITEMS} activePath="/user/client/book" />
      <MobileSidebar
        isOpen={show_mobile_menu}
        onClose={() => setShowMobileMenu(false)}
        menuItems={MENU_ITEMS}
        activePath="/user/client/book"
      />

      <div className="dashboard-main">
        <Header
          title="Rechercher un voyage"
          userData={user_data}
          onMenuClick={() => setShowMobileMenu(true)}
        />

        <main className="dashboard-content">
          {/* Search Form Section */}
          <section className="section">
            <div className="container" style={{ maxWidth: "1000px" }}>
              <div className="section-header" style={{ marginTop: "-80px" }}>
                <h2 className="section-title">Trouvez votre prochain voyage</h2>
                <p className="section-description">
                  Remplissez les champs ci-dessous pour rechercher les voyages
                  disponibles
                </p>
              </div>

              <form onSubmit={handleSearch} className="search-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Ville de départ *</label>
                    <select
                      value={ville_depart}
                      onChange={(e) => {
                        setVilleDepart(e.target.value);
                        if (e.target.value === ville_arrive) {
                          setVilleArrive("");
                        }
                      }}
                      required
                      className="form-input"
                    >
                      <option value="">Choisir une ville de départ</option>
                      <option value="Yaoundé">Yaoundé</option>
                      <option value="Douala">Douala</option>
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
                    <label className="form-label">Ville d'arrivée *</label>
                    <select
                      value={ville_arrive}
                      onChange={(e) => {
                        setVilleArrive(e.target.value);
                        if (e.target.value === ville_depart) {
                          setVilleDepart("");
                        }
                      }}
                      required
                      className="form-input"
                    >
                      <option value="">Choisir une ville d’arrivée</option>
                      <option value="Yaoundé">Yaoundé</option>
                      <option value="Douala">Douala</option>
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
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Zone de départ</label>
                    <input
                      type="text"
                      value={zone_depart}
                      onChange={(e) => setZoneDepart(e.target.value)}
                      placeholder="Ex: Mvan (optionnel)"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Zone d'arrivée</label>
                    <input
                      type="text"
                      value={zone_arrive}
                      onChange={(e) => setZoneArrive(e.target.value)}
                      placeholder="Ex: Akwa (optionnel)"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Date de départ</label>
                  <input
                    type="date"
                    value={date_depart}
                    onChange={(e) => setDateDepart(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="form-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={is_loading}
                  className="btn btn-primary btn-full-width"
                >
                  {is_loading ? (
                    <>
                      <RefreshCw className="spin" />
                      <span>Recherche en cours...</span>
                    </>
                  ) : (
                    <>
                      <Search />
                      <span>Rechercher mon voyage</span>
                    </>
                  )}
                </button>

                {error_message && (
                  <>
                    <div className="error-state">
                      <X className="error-state-icon" />
                      <p className="error-text">{error_message}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setErrorMessage("");
                          setVilleDepart("");
                          setVilleArrive("");
                          setZoneDepart("");
                          setZoneArrive("");
                          setDateDepart("");
                        }}
                        className="btn modal-button modal-button-error"
                      >
                        Réessayer
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </section>

          {/* Results Section */}
          {has_searched && (
            <section className="section section-bg-gray">
              <div className="container">
                {is_loading && (
                  <div className="loading-state">
                    <RefreshCw className="spin" />
                    <p>Recherche en cours...</p>
                  </div>
                )}

                {!is_loading && voyages.length === 0 && (
                  <div ref={resultsRef} className="empty-state">
                    <Calendar className="empty-icon" />
                    <h3 className="empty-title">Aucun voyage trouvé</h3>
                    <p className="empty-description">
                      Essayez de modifier vos critères de recherche
                    </p>
                  </div>
                )}

                {!is_loading && voyages.length > 0 && (
                  <>
                    <div ref={resultsRef} className="section-header">
                      <h2 className="section-title">
                        {voyages.length} voyage{voyages.length > 1 ? "s" : ""}{" "}
                        trouvé
                        {voyages.length > 1 ? "s" : ""}
                      </h2>
                      <p className="section-description">
                        Cliquez sur un voyage pour le réserver
                      </p>
                    </div>

                    <div className="voyage-results-list">
                      {voyages.map((voyage) => (
                        <div
                          key={voyage.idVoyage}
                          className="voyage-result-item"
                        >
                          <div className="voyage-result-header">
                            <div className="voyage-result-agency">
                              <span className="voyage-result-label">
                                Agence
                              </span>
                              <h3 className="voyage-result-agency-name">
                                {voyage.nomAgence}
                              </h3>
                            </div>
                            <span className="voyage-result-id">
                              #{voyage.idVoyage.slice(0, 13)}
                            </span>
                          </div>

                          <div className="voyage-result-content">
                            <div className="voyage-result-route">
                              <div className="voyage-result-location">
                                <MapPin />
                                <div>
                                  <span className="voyage-result-location-label">
                                    Départ
                                  </span>
                                  <span className="voyage-result-location-value">
                                    {voyage.lieuDepart} - {voyage.pointDeDepart}
                                  </span>
                                </div>
                              </div>

                              <div className="voyage-result-location">
                                <MapPin />
                                <div>
                                  <span className="voyage-result-location-label">
                                    Arrivée
                                  </span>
                                  <span className="voyage-result-location-value">
                                    {voyage.lieuArrive} - {voyage.pointArrivee}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="voyage-result-details">
                              <div className="voyage-result-detail">
                                <Clock />
                                <span>{formatTime(voyage.dateDepartPrev)}</span>
                              </div>

                              <div className="voyage-result-detail">
                                <Users />
                                <span>
                                  {voyage.nbrPlaceReservable} /{" "}
                                  {voyage.nbrPlaceRestante +
                                    voyage.nbrPlaceConfirm}{" "}
                                  places
                                </span>
                              </div>

                              <div className="voyage-result-detail">
                                <span className="voyage-result-class">
                                  {voyage.nomClasseVoyage}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="voyage-result-footer">
                            <div className="voyage-result-price">
                              <span className="voyage-result-price-label">
                                Prix
                              </span>
                              <span className="voyage-result-price-value">
                                {voyage.prix} FCFA
                              </span>
                            </div>
                            <button
                              onClick={() => handleReserver(voyage.idVoyage)}
                              className="btn btn-primary"
                            >
                              Réserver
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {total_pages > 1 && (
                      <div
                        className="widget-pagination"
                        style={{
                          justifyContent: "center",
                          marginTop: "var(--spacing-2xl)",
                        }}
                      >
                        <button
                          onClick={() =>
                            setCurrentPage(Math.max(0, current_page - 1))
                          }
                          disabled={current_page === 0}
                          className="btn-icon"
                        >
                          <ChevronLeft />
                        </button>
                        <span>
                          Page {current_page + 1} / {total_pages}
                        </span>
                        <button
                          onClick={() =>
                            setCurrentPage(
                              Math.min(total_pages - 1, current_page + 1),
                            )
                          }
                          disabled={current_page === total_pages - 1}
                          className="btn-icon"
                        >
                          <ChevronRight />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
