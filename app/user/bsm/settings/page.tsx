"use client";

import React, { useState, useEffect } from "react";
import {
  Home,
  Eye,
  Settings,
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  LogOut,
  RefreshCw,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import MobileSidebar from "@/app/components/Mobilesidebar";
import Header from "@/app/components/Header";
import { useLanguage } from "@/app/providers";

interface UserProfile {
  userId: string;
  first_name: string;
  last_name: string;
  username: string;
  phone_number: string;
  role: string[];
  address: string;
  idcoordonneeGPS: string;
  email: string;
}

/**
 * BSM Settings Page Component
 *
 * Displays BSM user profile information
 *
 * @author Thomas Djotio Ndié
 * @date 2025-12-19
 * @updated 2024-01-29 - Adapté pour utiliser la structure du dashboard
 */
export default function BSMSettingsPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const MENU_ITEMS = [
    {
      icon: Home,
      label: t("Dashboard", "Dashboard"),
      path: "/user/bsm/dashboard",
      active: false,
    },
    {
      icon: Eye,
      label: t("Surveillance", "Monitoring"),
      path: "/user/bsm/monitoring",
      active: false,
    },
    {
      icon: Settings,
      label: t("Mes paramètres", "My settings"),
      path: "/user/bsm/settings",
      active: true,
    },
  ];

  useEffect(() => {
    const bsmToken = sessionStorage.getItem("bsm_token");

    if (!bsmToken) {
      router.push("/bsm/login");
      return;
    }

    fetchUserProfile();
  }, [router]);

  const fetchUserProfile = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const bsmToken = sessionStorage.getItem("bsm_token");

      const response = await fetch(`${API_BASE_URL}/utilisateur/profil`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${bsmToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          t("Erreur lors du chargement du profil", "Failed to load profile"),
        );
      }

      const data = await response.json();

      const storedBsmData = sessionStorage.getItem("bsm_data");
      let email = "";
      let address = "";
      if (storedBsmData) {
        const parsedData = JSON.parse(storedBsmData);
        email = parsedData.email || "";
        address = parsedData.address || "";
      }

      setUserProfile({ ...data, email, address });
    } catch (error: any) {
      setErrorMessage(
        t(
          "Impossible de charger les informations du profil",
          "Unable to load profile information",
        ),
      );
      console.error("Fetch Profile Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("bsm_token");
    sessionStorage.removeItem("bsm_data");
    router.push("/bsm/login");
  };

  const getRoleLabel = (role: string) => {
    const roleLabels: { [key: string]: string } = {
      USAGER: t("Client", "Client"),
      AGENCE_VOYAGE: t("Chef d'agence", "Agency manager"),
      ORGANISATION: t("Directeur Général", "General Director"),
      BSM: t("Administrateur BSM", "BSM Administrator"),
    };
    return roleLabels[role] || role;
  };

  return (
    <div className="dashboard-layout">
      <Sidebar menuItems={MENU_ITEMS} activePath="/user/bsm/settings" />
      <MobileSidebar
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        menuItems={MENU_ITEMS}
        activePath="/user/bsm/settings"
      />

      <div className="dashboard-main">
        <Header
          title={t("Mes paramètres", "My settings")}
          userData={userProfile}
          onMenuClick={() => setShowMobileMenu(true)}
          userType="bsm"
        />

        <main className="dashboard-content">
          <div className="container" style={{ maxWidth: "900px" }}>
            {/* Loading State */}
            {isLoading && (
              <div className="loading-state">
                <RefreshCw className="spin" />
                <p>{t("Chargement de votre profil...", "Loading your profile...")}</p>
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
                    onClick={fetchUserProfile}
                    className="btn modal-button modal-button-error"
                  >
                    {t("Réessayer", "Try again")}
                  </button>
                </div>
              </>
            )}

            {/* Profile Content */}
            {!isLoading && !errorMessage && userProfile && (
              <div className="settings-container">
                {/* Profile Header */}
                <div className="settings-header">
                  <div className="settings-avatar">
                    {userProfile.first_name?.charAt(0).toUpperCase()}
                    {userProfile.last_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="settings-header-info">
                    <h2 className="settings-name">
                      {userProfile.first_name} {userProfile.last_name}
                    </h2>
                    <p className="settings-username">@{userProfile.username}</p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--spacing-xs)",
                        marginTop: "var(--spacing-xs)",
                      }}
                    >
                      <Shield
                        style={{
                          width: "16px",
                          height: "16px",
                          color: "var(--color-primary)",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "var(--font-size-sm)",
                          color: "var(--gray-600)",
                        }}
                      >
                        {userProfile.role.map(getRoleLabel).join(", ")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Settings Sections */}
                <div className="settings-sections">
                  {/* Personal Information */}
                  <div className="settings-section">
                    <div className="settings-section-header">
                      <User style={{ width: "20px", height: "20px" }} />
                      <h3 className="settings-section-title">
                        {t("Informations personnelles", "Personal information")}
                      </h3>
                    </div>
                    <div className="settings-section-content">
                      <div className="settings-field">
                        <label className="settings-label">{t("Prénom", "First name")}</label>
                        <div className="settings-value">
                          {userProfile.first_name}
                        </div>
                      </div>
                      <div className="settings-field">
                        <label className="settings-label">{t("Nom", "Last name")}</label>
                        <div className="settings-value">
                          {userProfile.last_name}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="settings-section">
                    <div className="settings-section-header">
                      <Mail style={{ width: "20px", height: "20px" }} />
                      <h3 className="settings-section-title">
                        {t("Coordonnées", "Contact details")}
                      </h3>
                    </div>
                    <div className="settings-section-content">
                      <div className="settings-field">
                        <label className="settings-label">
                          <Phone style={{ width: "16px", height: "16px" }} />
                          {t("Téléphone", "Phone")}
                        </label>
                        <div className="settings-value">
                          {userProfile.phone_number ||
                            t("Non renseigné", "Not provided")}
                        </div>
                      </div>
                      <div className="settings-field">
                        <label className="settings-label">
                          <Mail style={{ width: "16px", height: "16px" }} />
                          Email
                        </label>
                        <div className="settings-value">
                          {userProfile.email || t("Non renseigné", "Not provided")}
                        </div>
                      </div>
                      {userProfile.address && (
                        <div className="settings-field">
                          <label className="settings-label">
                            <MapPin style={{ width: "16px", height: "16px" }} />
                            {t("Adresse", "Address")}
                          </label>
                          <div className="settings-value">
                            {userProfile.address}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="settings-section">
                    <div className="settings-section-header">
                      <Shield style={{ width: "20px", height: "20px" }} />
                      <h3 className="settings-section-title">
                        {t("Compte", "Account")}
                      </h3>
                    </div>
                    <div className="settings-section-content">
                      <div className="settings-field">
                        <label className="settings-label">
                          {t("Nom d'utilisateur", "Username")}
                        </label>
                        <div className="settings-value">
                          {userProfile.username}
                        </div>
                      </div>
                      <div className="settings-field">
                        <label className="settings-label">{t("Rôle", "Role")}</label>
                        <div className="settings-value">
                          {userProfile.role.map(getRoleLabel).join(", ")}
                        </div>
                      </div>
                      <div className="settings-field">
                        <label className="settings-label">
                          {t("ID utilisateur", "User ID")}
                        </label>
                        <div className="settings-value settings-value-mono">
                          {userProfile.userId}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="settings-actions">
                  <button
                    onClick={() => router.push("/user/bsm/dashboard")}
                    className="btn btn-secondary"
                  >
                    {t("Retour au dashboard", "Back to dashboard")}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="btn btn-danger"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--spacing-xs)",
                    }}
                  >
                    <LogOut style={{ width: "20px", height: "20px" }} />
                    <span>{t("Se déconnecter", "Sign out")}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
