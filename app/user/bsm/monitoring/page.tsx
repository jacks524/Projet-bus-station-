"use client";

import React, { useState, useEffect } from "react";
import {
  Home,
  Eye,
  Settings,
  Building2,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Check,
  XCircle,
  Globe,
  MessageSquare,
  CheckCircle,
  RefreshCw,
  X,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import MobileSidebar from "@/app/components/Mobilesidebar";
import Header from "@/app/components/Header";

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
 * Display pending agencies for validation
 *
 * @author Félix DJOTIO NDIE
 * @date 2025-01-29
 */
export default function BSMMonitoringPage() {
  const [agences, setAgences] = useState<Agence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [validationError, setValidationError] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAgence, setSelectedAgence] = useState<Agence | null>(null);
  const [isLoadingValidation, setIsLoadingValidation] = useState(false);
  const [motifRejet, setMotifRejet] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const AGENCES_PER_PAGE = 6;

  const menuItems = [
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
    const bsmToken = sessionStorage.getItem("bsm_token");
    if (!bsmToken) {
      router.push("/bsm/login");
      return;
    }

    const storedBsmData = sessionStorage.getItem("bsm_data");
    if (storedBsmData) {
      setUserData(JSON.parse(storedBsmData));
    }
    fetchAgences();
  }, [router]);

  useEffect(() => {
    fetchAgences();
  }, [currentPage]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchAgences = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const bsmToken = sessionStorage.getItem("bsm_token");
      const response = await fetch(
        `${API_BASE_URL}/agence/pending-validation?page=${currentPage}&size=${AGENCES_PER_PAGE}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${bsmToken}`,
          },
        },
      );

      if (!response.ok)
        throw new Error("Erreur lors du chargement des agences");

      const data = await response.json();
      let filteredAgences = data.content || [];

      if (userData?.address) {
        filteredAgences = filteredAgences.filter(
          (agence: Agence) => agence.ville === userData.address,
        );
      }

      setAgences(filteredAgences);
      setTotalPages(data.page?.totalPages || 0);
    } catch (error: any) {
      setErrorMessage("Impossible de charger les agences en attente");
      console.error("Fetch Agences Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const ouvrirModalDetail = (agence: Agence) => {
    setSelectedAgence(agence);
    setMotifRejet("");
    setValidationError("");
    setShowDetailModal(true);
  };

  const handleValidation = async (action: "approve" | "reject") => {
    if (!selectedAgence) return;

    if (action === "reject" && !motifRejet.trim()) {
      setValidationError("Veuillez renseigner le motif de rejet");
      return;
    }

    if (action === "reject" && motifRejet.trim().length < 10) {
      setValidationError(
        "Le motif de rejet doit contenir au moins 10 caractères",
      );
      return;
    }

    setIsLoadingValidation(true);
    setValidationError("");

    try {
      const bsmToken = sessionStorage.getItem("bsm_token");
      const endpoint =
        action === "approve"
          ? `${API_BASE_URL}/agence/${selectedAgence.agency_id}/validate`
          : `${API_BASE_URL}/agence/${selectedAgence.agency_id}/reject`;

      const body =
        action === "approve"
          ? { bsm_id: userData?.userId }
          : { bsm_id: userData?.userId, motif_rejet: motifRejet.trim() };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${bsmToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok)
        throw new Error(
          `Erreur lors de la ${action === "approve" ? "validation" : "rejection"}`,
        );

      setShowDetailModal(false);
      setMotifRejet("");
      fetchAgences();
      setSuccessMessage(
        `Agence ${action === "approve" ? "validée" : "rejetée"} avec succès!`,
      );
    } catch (error: any) {
      setValidationError(`Une erreur est survenue. Veuillez réessayer.`);
      console.error("Validation Error:", error);
    } finally {
      setIsLoadingValidation(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
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
      <Sidebar menuItems={menuItems} activePath="/user/bsm/monitoring" />
      <MobileSidebar
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        menuItems={menuItems}
        activePath="/user/bsm/monitoring"
      />

      <div className="dashboard-main">
        <Header
          title="Surveillance des agences"
          userData={userData}
          onMenuClick={() => setShowMobileMenu(true)}
          userType="bsm"
        />

        <main className="dashboard-content">
          <div className="container" style={{ maxWidth: "1200px" }}>
            {/* Success Message */}
            {successMessage && (
              <div
                style={{
                  marginBottom: "var(--spacing-xl)",
                  background: "#d1fae5",
                  border: "1px solid #a7f3d0",
                  borderRadius: "var(--radius-lg)",
                  padding: "var(--spacing-md)",
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--spacing-sm)",
                }}
              >
                <CheckCircle
                  style={{
                    width: "24px",
                    height: "24px",
                    color: "#065f46",
                    flexShrink: 0,
                  }}
                />
                <p
                  style={{
                    color: "#065f46",
                    fontWeight: "var(--font-weight-medium)",
                    flex: 1,
                  }}
                >
                  {successMessage}
                </p>
                <button
                  onClick={() => setSuccessMessage("")}
                  style={{
                    padding: "var(--spacing-xs)",
                    background: "transparent",
                    border: "none",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                  }}
                >
                  <X
                    style={{ width: "16px", height: "16px", color: "#065f46" }}
                  />
                </button>
              </div>
            )}

            {/* Section Header */}
            <div
              className="section-header"
              style={{ marginBottom: "var(--spacing-2xl)" }}
            >
              <h2 className="section-title">
                Agences en attente de validation
              </h2>
              <p className="section-description">
                Examinez et validez les demandes de création d'agence
              </p>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="loading-state">
                <RefreshCw className="spin" />
                <p>Chargement des agences...</p>
              </div>
            )}

            {/* Error State */}
            {!isLoading && errorMessage && (
              <>
                <div className="error-state">
                  <X className="error-state-icon" />
                  <p className="error-text">{errorMessage}</p>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="btn modal-button modal-button-error"
                  >
                    Réessayer
                  </button>
                </div>
              </>
            )}

            {/* Empty State */}
            {!isLoading && !errorMessage && agences.length === 0 && (
              <>
                <div className="empty-state">
                  <Building2 className="empty-icon" />
                  <h3 className="empty-title">Aucune agence en attente</h3>
                  <p className="empty-description">
                    Toutes les agences ont été traitées
                  </p>
                  <button
                    className="btn btn-primary"
                    style={{ marginTop: "20px" }}
                    onClick={fetchAgences}
                  >
                    Actualiser la liste
                  </button>
                </div>
              </>
            )}

            {/* Agences List */}
            {!isLoading && !errorMessage && agences.length > 0 && (
              <>
                <div className="voyage-results-list">
                  {agences.map((agence) => (
                    <div key={agence.agency_id} className="voyage-result-item">
                      <div className="voyage-result-header">
                        <div className="voyage-result-agency">
                          <span className="voyage-result-label">
                            Nom de l'agence de voyage
                          </span>
                          <h3 className="voyage-result-agency-name">
                            {agence.long_name}
                          </h3>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "var(--spacing-md)",
                          }}
                        >
                          <span className="voyage-result-id">
                            #{agence.agency_id.slice(0, 13)}
                          </span>
                          <span
                            style={{
                              padding: "4px 12px",
                              background: "#fef3c7",
                              color: "#92400e",
                              borderRadius: "var(--radius-full)",
                              fontSize: "var(--font-size-xs)",
                              fontWeight: "var(--font-weight-semibold)",
                            }}
                          >
                            En attente
                          </span>
                        </div>
                      </div>

                      <div className="voyage-result-content">
                        <div className="voyage-result-route">
                          <div className="voyage-result-location">
                            <Building2 />
                            <div>
                              <span className="voyage-result-location-label">
                                Nom court
                              </span>
                              <span className="voyage-result-location-value">
                                {agence.short_name}
                              </span>
                            </div>
                          </div>

                          <div className="voyage-result-location">
                            <MapPin />
                            <div>
                              <span className="voyage-result-location-label">
                                Localisation
                              </span>
                              <span className="voyage-result-location-value">
                                {agence.ville} - {agence.location}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="voyage-result-details">
                          <div className="voyage-result-detail">
                            <Globe />
                            <span>
                              {agence.social_network ||
                                "Réseau social non renseigné"}
                            </span>
                          </div>

                          <div className="voyage-result-detail">
                            <MessageSquare />
                            <span>
                              {agence.greeting_message ||
                                "Message non renseigné"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="voyage-result-footer">
                        <div className="voyage-result-price">
                          <span className="voyage-result-price-label">
                            Organisation
                          </span>
                          <span
                            className="voyage-result-price-value"
                            style={{ fontSize: "var(--font-size-sm)" }}
                          >
                            {agence.organisation_id}
                          </span>
                        </div>
                        <button
                          onClick={() => ouvrirModalDetail(agence)}
                          className="btn btn-primary"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "var(--spacing-xs)",
                          }}
                        >
                          <span>Voir détails</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div
                    className="widget-pagination"
                    style={{
                      justifyContent: "center",
                      marginTop: "var(--spacing-2xl)",
                    }}
                  >
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(0, currentPage - 1))
                      }
                      disabled={currentPage === 0}
                      className="btn-icon"
                    >
                      <ChevronLeft />
                    </button>
                    <span>
                      Page {currentPage + 1} / {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage(
                          Math.min(totalPages - 1, currentPage + 1),
                        )
                      }
                      disabled={currentPage === totalPages - 1}
                      className="btn-icon"
                    >
                      <ChevronRight />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Modal Détails */}
      {showDetailModal && selectedAgence && (
        <div className="modal-overlay">
          <div className="payment-modal-content">
            <div className="payment-modal-header">
              <h2 className="payment-modal-title">Détails de l'agence</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setMotifRejet("");
                  setValidationError("");
                }}
                className="payment-modal-close"
              >
                <X />
              </button>
            </div>

            <div className="payment-modal-body">
              {/* Informations */}
              <div className="payment-summary">
                <h3 className="payment-summary-title">
                  Informations générales
                </h3>
                <div className="payment-summary-item">
                  <span className="payment-summary-label">Nom complet</span>
                  <span className="payment-summary-value">
                    {selectedAgence.long_name}
                  </span>
                </div>
                <div className="payment-summary-item">
                  <span className="payment-summary-label">Abréviation</span>
                  <span className="payment-summary-value">
                    {selectedAgence.short_name}
                  </span>
                </div>
                <div className="payment-summary-item">
                  <span className="payment-summary-label">ID Agence</span>
                  <span
                    className="payment-summary-value"
                    style={{
                      fontSize: "var(--font-size-xs)",
                      fontFamily: "monospace",
                    }}
                  >
                    {selectedAgence.agency_id}
                  </span>
                </div>
                <div className="payment-summary-item">
                  <span className="payment-summary-label">ID Organisation</span>
                  <span
                    className="payment-summary-value"
                    style={{
                      fontSize: "var(--font-size-xs)",
                      fontFamily: "monospace",
                    }}
                  >
                    {selectedAgence.organisation_id}
                  </span>
                </div>
              </div>

              <div
                className="payment-summary"
                style={{ marginTop: "var(--spacing-lg)" }}
              >
                <h3 className="payment-summary-title">Localisation</h3>
                <div className="payment-summary-item">
                  <span className="payment-summary-label">Ville</span>
                  <span className="payment-summary-value">
                    {selectedAgence.ville}
                  </span>
                </div>
                <div className="payment-summary-item">
                  <span className="payment-summary-label">Zone</span>
                  <span className="payment-summary-value">
                    {selectedAgence.location}
                  </span>
                </div>
              </div>

              <div
                className="payment-summary"
                style={{ marginTop: "var(--spacing-lg)" }}
              >
                <h3 className="payment-summary-title">
                  Contact et communication
                </h3>
                <div className="payment-summary-item">
                  <span className="payment-summary-label">Réseau social</span>
                  <span
                    className="payment-summary-value"
                    style={{
                      fontSize: "var(--font-size-sm)",
                      wordBreak: "break-all",
                    }}
                  >
                    {selectedAgence.social_network || "Non renseigné"}
                  </span>
                </div>
                <div className="payment-summary-item">
                  <span className="payment-summary-label">
                    Message d'accueil
                  </span>
                  <span
                    className="payment-summary-value"
                    style={{ fontSize: "var(--font-size-sm)" }}
                  >
                    {selectedAgence.greeting_message || "Non renseigné"}
                  </span>
                </div>
              </div>

              {selectedAgence.description && (
                <div
                  className="payment-summary"
                  style={{ marginTop: "var(--spacing-lg)" }}
                >
                  <h3 className="payment-summary-title">Description</h3>
                  <p
                    style={{
                      fontSize: "var(--font-size-sm)",
                      color: "var(--gray-600)",
                      lineHeight: "var(--line-height-relaxed)",
                    }}
                  >
                    {selectedAgence.description}
                  </p>
                </div>
              )}

              {/* Motif de rejet */}
              <div
                className="form-group"
                style={{ marginTop: "var(--spacing-xl)" }}
              >
                <label className="form-label">
                  Motif de rejet (obligatoire pour rejeter)
                </label>
                <textarea
                  value={motifRejet}
                  onChange={(e) => {
                    setMotifRejet(e.target.value);
                    setValidationError("");
                  }}
                  placeholder="Entrez le motif de rejet (minimum 10 caractères)..."
                  className="form-textarea"
                  style={{ minHeight: "100px" }}
                />
                {validationError && (
                  <div
                    style={{
                      marginTop: "var(--spacing-sm)",
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--spacing-xs)",
                      color: "#dc2626",
                    }}
                  >
                    <AlertCircle style={{ width: "16px", height: "16px" }} />
                    <span style={{ fontSize: "var(--font-size-sm)" }}>
                      {validationError}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  gap: "var(--spacing-md)",
                  marginTop: "var(--spacing-xl)",
                }}
              >
                <button
                  onClick={() => handleValidation("reject")}
                  disabled={isLoadingValidation || !motifRejet.trim()}
                  className="btn btn-full-width"
                  style={{
                    background: "#dc2626",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "var(--spacing-xs)",
                  }}
                >
                  {isLoadingValidation ? (
                    <>
                      <RefreshCw
                        className="spin"
                        style={{ width: "20px", height: "20px" }}
                      />
                      <span>Traitement...</span>
                    </>
                  ) : (
                    <>
                      <span>Rejeter</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleValidation("approve")}
                  disabled={isLoadingValidation}
                  className="btn btn-primary btn-full-width"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "var(--spacing-xs)",
                  }}
                >
                  {isLoadingValidation ? (
                    <>
                      <RefreshCw
                        className="spin"
                        style={{ width: "20px", height: "20px" }}
                      />
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
        </div>
      )}
    </div>
  );
}
