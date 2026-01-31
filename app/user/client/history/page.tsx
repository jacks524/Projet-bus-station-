"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  Calendar,
  FileText,
  Ticket,
  Gift,
  History as HistoryIcon,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Download,
  X,
} from "lucide-react";
import Sidebar from "@/app/components/Sidebar";
import MobileSidebar from "@/app/components/Mobilesidebar";
import Header from "@/app/components/Header";

/**
 * BusStation Client History Page
 * Display user's reservation history in a professional table
 *
 * @author Félix DJOTIO NDIE
 * @date 2025-01-30
 */

interface Historique {
  idHistorique: string;
  statusHistorique: string;
  dateReservation: string;
  dateConfirmation: string;
  dateAnnulation: string;
  causeAnnulation: string;
  origineAnnulation: string;
  tauxAnnulation: number;
  compensation: number;
  idReservation: string;
}

interface UserData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  userId: string;
}

export default function ClientHistoryPage() {
  const router = useRouter();
  const [historiques, setHistoriques] = useState<Historique[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Historique | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
      active: false,
    },
    {
      icon: HistoryIcon,
      label: "Historique",
      path: "/user/client/history",
      active: true,
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
      const parsedUser = JSON.parse(storedUserData);
      setUserData(parsedUser);
      fetchHistoriques(parsedUser.userId);
    }
  }, []);

  const fetchHistoriques = async (userId: string) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/historique/reservation/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Erreur lors du chargement de l'historique");
      }

      const data = await response.json();
      setHistoriques(data || []);
    } catch (error: any) {
      setErrorMessage("Impossible de charger votre historique");
      console.error("Fetch Historiques Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusInfo = (status: string) => {
    const statusMap: {
      [key: string]: { label: string; type: "success" | "warning" | "error" };
    } = {
      ANNULER_PAR_AGENCE_APRES_RESERVATION: {
        label: "Annulé (Agence)",
        type: "error",
      },
      ANNULER_PAR_USAGER_APRES_RESERVATION: {
        label: "Annulé (Vous)",
        type: "warning",
      },
      ANNULER_PAR_AGENCE_APRES_CONFIRMATION: {
        label: "Annulé (Agence)",
        type: "error",
      },
      ANNULER_PAR_USAGER_APRES_CONFIRMATION: {
        label: "Annulé (Vous)",
        type: "warning",
      },
      VALIDER: { label: "Validé", type: "success" },
    };
    return statusMap[status] || { label: status, type: "warning" as "warning" };
  };

  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const handleSort = (key: keyof Historique) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedHistoriques = React.useMemo(() => {
    let sortableItems = [...historiques];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [historiques, sortConfig]);

  const exportToCSV = () => {
    const headers = [
      "N° Réservation",
      "Statut",
      "Date Réservation",
      "Date Confirmation",
      "Date Annulation",
      "Compensation",
    ];

    const rows = historiques.map((item) => [
      item.idReservation,
      getStatusInfo(item.statusHistorique).label,
      formatDate(item.dateReservation),
      formatDate(item.dateConfirmation),
      formatDate(item.dateAnnulation),
      item.compensation > 0 ? `${(item.compensation * 100).toFixed(0)}%` : "-",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `historique_${Date.now()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar menuItems={MENU_ITEMS} activePath="/user/client/history" />
      <MobileSidebar
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        menuItems={MENU_ITEMS}
        activePath="/user/client/history"
      />

      <div className="dashboard-main">
        <Header
          title="Historique"
          userData={userData}
          onMenuClick={() => setShowMobileMenu(true)}
        />

        <main className="dashboard-content">
          <div className="container" style={{ maxWidth: "1200px" }}>
            {/* Section Header */}
            <div
              className="section-header"
              style={{ marginBottom: "var(--spacing-2xl)" }}
            >
              <div>
                <h2 className="section-title">Historique des réservations</h2>
                <p className="section-description">
                  Consultez l'ensemble de vos activités passées
                </p>
              </div>
              {!isLoading && historiques.length > 0 && (
                <button
                  onClick={exportToCSV}
                  className="btn btn-secondary"
                  style={{ marginTop: "20px" }}
                >
                  <Download />
                  Exporter CSV
                </button>
              )}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="loading-state">
                <RefreshCw className="spin" />
                <p>Chargement de l'historique...</p>
              </div>
            )}

            {/* Error State */}
            {!isLoading && errorMessage && (
              <div className="error-state">
                <X className="error-state-icon" />
                <p className="error-text">{errorMessage}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="btn modal-button modal-button-error"
                >
                  Réessayer
                </button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !errorMessage && historiques.length === 0 && (
              <div className="empty-state">
                <HistoryIcon className="empty-icon" />
                <h3 className="empty-title">Aucun historique</h3>
                <p className="empty-description">
                  Votre historique de réservations est vide
                </p>
                <button
                  onClick={() => router.push("/user/client/book")}
                  className="btn btn-primary"
                  style={{ marginTop: "var(--spacing-lg)" }}
                >
                  Réserver un voyage
                </button>
              </div>
            )}

            {/* History Table */}
            {!isLoading && !errorMessage && historiques.length > 0 && (
              <div className="history-table-container">
                <div className="history-table-wrapper">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th className="th-expand"></th>
                        <th
                          className="th-sortable"
                          onClick={() => handleSort("idReservation")}
                        >
                          <div className="th-content">
                            <span>N° Réservation</span>
                            {sortConfig.key === "idReservation" &&
                              (sortConfig.direction === "asc" ? (
                                <ChevronUp className="sort-icon" />
                              ) : (
                                <ChevronDown className="sort-icon" />
                              ))}
                          </div>
                        </th>
                        <th
                          className="th-sortable"
                          onClick={() => handleSort("statusHistorique")}
                        >
                          <div className="th-content">
                            <span>Statut</span>
                            {sortConfig.key === "statusHistorique" &&
                              (sortConfig.direction === "asc" ? (
                                <ChevronUp className="sort-icon" />
                              ) : (
                                <ChevronDown className="sort-icon" />
                              ))}
                          </div>
                        </th>
                        <th
                          className="th-sortable"
                          onClick={() => handleSort("dateReservation")}
                        >
                          <div className="th-content">
                            <span>Date Réservation</span>
                            {sortConfig.key === "dateReservation" &&
                              (sortConfig.direction === "asc" ? (
                                <ChevronUp className="sort-icon" />
                              ) : (
                                <ChevronDown className="sort-icon" />
                              ))}
                          </div>
                        </th>
                        <th
                          className="th-sortable"
                          onClick={() => handleSort("dateConfirmation")}
                        >
                          <div className="th-content">
                            <span>Date Confirmation</span>
                            {sortConfig.key === "dateConfirmation" &&
                              (sortConfig.direction === "asc" ? (
                                <ChevronUp className="sort-icon" />
                              ) : (
                                <ChevronDown className="sort-icon" />
                              ))}
                          </div>
                        </th>
                        <th>Compensation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedHistoriques.map((item) => {
                        const statusInfo = getStatusInfo(item.statusHistorique);
                        const isExpanded = expandedRows.has(item.idHistorique);

                        return (
                          <React.Fragment key={item.idHistorique}>
                            <tr className="table-row">
                              <td className="td-expand">
                                {(item.causeAnnulation ||
                                  item.dateAnnulation) && (
                                  <button
                                    onClick={() =>
                                      toggleRowExpansion(item.idHistorique)
                                    }
                                    className="expand-btn"
                                  >
                                    {isExpanded ? (
                                      <ChevronUp />
                                    ) : (
                                      <ChevronDown />
                                    )}
                                  </button>
                                )}
                              </td>
                              <td className="td-reservation">
                                <span className="reservation-id">
                                  {item.idReservation}
                                </span>
                              </td>
                              <td>
                                <span
                                  className={`status-badge-table status-${statusInfo.type}`}
                                >
                                  {statusInfo.type === "success" && (
                                    <CheckCircle />
                                  )}
                                  {statusInfo.type === "error" && <XCircle />}
                                  {statusInfo.type === "warning" && <Clock />}
                                  {statusInfo.label}
                                </span>
                              </td>
                              <td className="td-date">
                                {formatDate(item.dateReservation)}
                              </td>
                              <td className="td-date">
                                {formatDate(item.dateConfirmation)}
                              </td>
                              <td>
                                {item.compensation > 0 ? (
                                  <span className="compensation-badge">
                                    {(item.compensation * 100).toFixed(0)}%
                                  </span>
                                ) : (
                                  <span className="text-muted">-</span>
                                )}
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr className="expanded-row">
                                <td colSpan={6}>
                                  <div className="expanded-content">
                                    {item.dateAnnulation && (
                                      <div className="expanded-item">
                                        <span className="expanded-label">
                                          Date d'annulation:
                                        </span>
                                        <span className="expanded-value">
                                          {formatDate(item.dateAnnulation)}
                                        </span>
                                      </div>
                                    )}
                                    {item.causeAnnulation && (
                                      <div className="expanded-item">
                                        <span className="expanded-label">
                                          Motif d'annulation:
                                        </span>
                                        <span className="expanded-value">
                                          {item.causeAnnulation}
                                        </span>
                                      </div>
                                    )}
                                    {item.origineAnnulation && (
                                      <div className="expanded-item">
                                        <span className="expanded-label">
                                          Origine:
                                        </span>
                                        <span className="expanded-value">
                                          {item.origineAnnulation}
                                        </span>
                                      </div>
                                    )}
                                    {item.tauxAnnulation > 0 && (
                                      <div className="expanded-item">
                                        <span className="expanded-label">
                                          Taux d'annulation:
                                        </span>
                                        <span className="expanded-value">
                                          {(item.tauxAnnulation * 100).toFixed(
                                            0,
                                          )}
                                          %
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
