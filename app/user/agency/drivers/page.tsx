"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Home, Users, Car, Calendar, Bus, Settings } from "lucide-react";
import Sidebar from "@/app/components/Sidebar";
import MobileSidebar from "@/app/components/Mobilesidebar";
import Header from "@/app/components/Header";
import { useLanguage } from "@/app/providers";

interface UserData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  userId: string;
  role: string[];
  token: string;
}

export default function AgenceDriversPage() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const router = useRouter();
  const { t } = useLanguage();

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
      active: true,
    },
    {
      icon: Settings,
      label: t("Mes paramètres", "My settings"),
      path: "/user/agency/settings",
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
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="dashboard-layout">
      <Sidebar menuItems={MENU_ITEMS} activePath="/user/agency/drivers" />

      <MobileSidebar
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        menuItems={MENU_ITEMS}
        activePath="/user/agency/drivers"
      />

      <div className="dashboard-main">
        <Header
          title={t("Gestion des Chauffeurs", "Driver management")}
          userData={userData}
          onMenuClick={() => setShowMobileMenu(true)}
          showSettingsButton={true}
          userType="agency"
        />

        <main className="dashboard-content">
          <div className="container">
            {/* Main Content Card */}
            <div className="empty-state">
              <div
                className="section-header"
                style={{
                  marginBottom: "var(--spacing-2xl)",
                  marginTop: "-80px",
                }}
              >
                <h2 className="section-title">
                  {t("Gestion des chauffeurs", "Driver management")}
                </h2>
                <p className="section-description">
                  {t(
                    "Gérer vos véhicules et chauffeurs en quelques clics",
                    "Manage your vehicles and drivers in a few clicks",
                  )}
                </p>
              </div>

              <div style={{ marginBottom: "6px" }}>
                <div className="empty-icon">
                  <Bus style={{ width: "50", height: "50" }} />
                </div>
              </div>

              <h2 className="empty-title">
                {t("Gestion des Chauffeurs", "Driver management")}
              </h2>

              <p className="empty-description">
                {t(
                  "Cette fonctionnalité n'est pas encore disponible.",
                  "This feature is not available yet.",
                )}
                <br />
                {t(
                  "Elle sera bientôt accessible pour gérer vos chauffeurs et véhicules.",
                  "It will be available soon to manage your drivers and vehicles.",
                )}
              </p>

              <div className="cta-buttons">
                <button
                  onClick={() => router.push("/user/agency/dashboard")}
                  className="btn btn-primary"
                >
                  {t("Retour au Dashboard", "Back to dashboard")}
                </button>

                <button
                  onClick={() => router.push("/user/agency/travels")}
                  className="btn btn-secondary"
                >
                  {t("Voir les Voyages", "View trips")}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
