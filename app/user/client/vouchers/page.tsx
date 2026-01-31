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
  Tag,
  CalendarCheck,
  CalendarX,
  Percent,
  RefreshCw,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import MobileSidebar from "@/app/components/Mobilesidebar";
import Header from "@/app/components/Header";

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

/**
 * Client Vouchers Page Component
 *
 * Display user's valid coupons/vouchers
 *
 * @author Félix DJOTIO NDIE
 * @date 2025-01-29
 */
export default function ClientVouchersPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [is_loading, setIsLoading] = useState(true);
  const [error_message, setErrorMessage] = useState("");
  const [show_mobile_menu, setShowMobileMenu] = useState(false);
  const [user_data, setUserData] = useState<UserData | null>(null);

  const router = useRouter();

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
        (coupon: Coupon) => coupon.statusCoupon === "VALIDE",
      );

      setCoupons(valid_coupons);
    } catch (error: any) {
      setErrorMessage("Impossible de charger vos coupons");
      console.error("Fetch Coupons Error:", error);
    } finally {
      setIsLoading(false);
    }
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
    <div className="dashboard-layout">
      <Sidebar menuItems={MENU_ITEMS} activePath="/user/client/vouchers" />
      <MobileSidebar
        isOpen={show_mobile_menu}
        onClose={() => setShowMobileMenu(false)}
        menuItems={MENU_ITEMS}
        activePath="/user/client/vouchers"
      />

      <div className="dashboard-main">
        <Header
          title="Mes coupons"
          userData={user_data}
          onMenuClick={() => setShowMobileMenu(true)}
        />

        <main className="dashboard-content">
          <div className="container" style={{ maxWidth: "1200px" }}>
            {/* Section Header */}
            <div
              className="section-header"
              style={{ marginBottom: "var(--spacing-2xl)" }}
            >
              <h2 className="section-title">Vos coupons de réduction</h2>
              <p className="section-description">
                Utilisez vos coupons lors de vos prochaines réservations pour
                bénéficier de réductions
              </p>
            </div>

            {/* Loading State */}
            {is_loading && (
              <div className="loading-state">
                <RefreshCw className="spin" />
                <p>Chargement de vos coupons...</p>
              </div>
            )}

            {/* Error State */}
            {!is_loading && error_message && (
              <div className="error-state">
                <X className="error-state-icon" />
                <p className="error-text">{error_message}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="btn modal-button modal-button-error"
                >
                  Réessayer
                </button>
              </div>
            )}

            {/* Empty State */}
            {!is_loading && !error_message && coupons.length === 0 && (
              <div className="empty-state">
                <Gift className="empty-icon" />
                <h3 className="empty-title">Aucun coupon disponible</h3>
                <p className="empty-description">
                  Vous n'avez pas encore de coupons de réduction valides
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

            {/* Coupons Grid */}
            {!is_loading && !error_message && coupons.length > 0 && (
              <div className="coupons-grid">
                {coupons.map((coupon) => (
                  <div key={coupon.idCoupon} className="coupon-card">
                    <div className="coupon-card-header">
                      <div className="coupon-icon">
                        <Tag />
                      </div>
                      <span className="coupon-badge">Valide</span>
                    </div>

                    <div className="coupon-card-body">
                      <div className="coupon-value">
                        <span className="coupon-value-number">
                          {(coupon.valeur * 100).toFixed(0)}
                        </span>
                        <Percent className="coupon-value-percent" />
                      </div>
                      <p className="coupon-value-label">de réduction</p>
                    </div>

                    <div className="coupon-card-dates">
                      <div className="coupon-date">
                        <CalendarCheck
                          style={{ width: "16px", height: "16px" }}
                        />
                        <div>
                          <span className="coupon-date-label">Début</span>
                          <span className="coupon-date-value">
                            {formatDate(coupon.dateDebut)}
                          </span>
                        </div>
                      </div>
                      <div className="coupon-date">
                        <CalendarX style={{ width: "16px", height: "16px" }} />
                        <div>
                          <span className="coupon-date-label">Fin</span>
                          <span className="coupon-date-value">
                            {formatDate(coupon.dateFin)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="coupon-card-footer">
                      <div className="coupon-code-container">
                        <span className="coupon-code-label">Code coupon</span>
                        <span className="coupon-code-value">
                          {coupon.idCoupon}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
