"use client";

import React, { useState, useEffect } from "react";
import {
  Home,
  Building2,
  Settings,
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  LogOut,
  RefreshCw,
  X,
  Briefcase,
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
  organization_id?: string;
}

/**
 * DG Settings Page Component
 *
 * Displays user profile information
 *
 * @author Thomas Djotio Ndié
 * @date 2025-01-14
 */
export default function DGSettingsPage() {
  const [user_profile, setUserProfile] = useState<UserProfile | null>(null);
  const [is_loading, setIsLoading] = useState(true);
  const [error_message, setErrorMessage] = useState("");
  const [show_mobile_menu, setShowMobileMenu] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const MENU_ITEMS = [
    {
      icon: Home,
      label: t("Dashboard", "Dashboard"),
      path: "/user/organization/dashboard",
      active: false,
    },
    {
      icon: Briefcase,
      label: t("Organisation", "Organization"),
      path: "/user/organization/organization",
      active: false,
    },
    {
      icon: Building2,
      label: t("Agence", "Agency"),
      path: "/user/organization/agencies",
      active: false,
    },
    {
      icon: Settings,
      label: t("Mes paramètres", "My settings"),
      path: "/user/organization/settings",
      active: true,
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

    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const auth_token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");

      const response = await fetch(`${API_BASE_URL}/utilisateur/profil`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth_token}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          t("Erreur lors du chargement du profil", "Failed to load profile"),
        );
      }

      const data = await response.json();

      const stored_user_data =
        localStorage.getItem("user_data") ||
        sessionStorage.getItem("user_data");
      let email = "";
      let organization_id = "";

      if (stored_user_data) {
        const parsed_data = JSON.parse(stored_user_data);
        email = parsed_data.email || "";
        organization_id = parsed_data.organization_id || "";
      }

      setUserProfile({ ...data, email, organization_id });
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
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("user_data");
    router.push("/login");
  };

  const getRoleLabel = (role: string) => {
    const role_labels: { [key: string]: string } = {
      USAGER: t("Client", "Client"),
      AGENCE_VOYAGE: t("Chef d'agence", "Agency manager"),
      ORGANISATION: t("Directeur Général", "General Director"),
      BSM: t("Administrateur BSM", "BSM Administrator"),
    };
    return role_labels[role] || role;
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        menuItems={MENU_ITEMS}
        activePath="/user/organization/settings"
      />
      <MobileSidebar
        isOpen={show_mobile_menu}
        onClose={() => setShowMobileMenu(false)}
        menuItems={MENU_ITEMS}
        activePath="/user/organization/settings"
      />

      <div className="dashboard-main">
        <Header
          title={t("Mes paramètres", "My settings")}
          userData={user_profile}
          onMenuClick={() => setShowMobileMenu(true)}
          userType="organization"
        />

        <main className="dashboard-content">
          <div className="container" style={{ maxWidth: "900px" }}>
            {/* Loading State */}
            {is_loading && (
              <div className="loading-state">
                <RefreshCw className="spin" />
                <p>{t("Chargement de votre profil...", "Loading your profile...")}</p>
              </div>
            )}

            {/* Error State */}
            {!is_loading && error_message && (
              <>
                <div className="error-state">
                  <X className="error-state-icon" />
                  <p className="error-text">{error_message}</p>
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
            {!is_loading && !error_message && user_profile && (
              <div className="settings-container">
                {/* Profile Header */}
                <div className="settings-header">
                  <div className="settings-avatar">
                    {user_profile.first_name?.charAt(0).toUpperCase()}
                    {user_profile.last_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="settings-header-info">
                    <h2 className="settings-name">
                      {user_profile.first_name} {user_profile.last_name}
                    </h2>
                    <p className="settings-username">
                      @{user_profile.username}
                    </p>
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
                          {user_profile.first_name}
                        </div>
                      </div>
                      <div className="settings-field">
                        <label className="settings-label">{t("Nom", "Last name")}</label>
                        <div className="settings-value">
                          {user_profile.last_name}
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
                          {user_profile.phone_number ||
                            t("Non renseigné", "Not provided")}
                        </div>
                      </div>
                      <div className="settings-field">
                        <label className="settings-label">
                          <Mail style={{ width: "16px", height: "16px" }} />
                          Email
                        </label>
                        <div className="settings-value">
                          {user_profile.email || t("Non renseigné", "Not provided")}
                        </div>
                      </div>
                      {user_profile.address && (
                        <div className="settings-field">
                          <label className="settings-label">
                            <MapPin style={{ width: "16px", height: "16px" }} />
                            {t("Adresse", "Address")}
                          </label>
                          <div className="settings-value">
                            {user_profile.address}
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
                          {user_profile.username}
                        </div>
                      </div>
                      <div className="settings-field">
                        <label className="settings-label">{t("Rôle", "Role")}</label>
                        <div className="settings-value">
                          {user_profile.role.map(getRoleLabel).join(", ")}
                        </div>
                      </div>
                      <div className="settings-field">
                        <label className="settings-label">
                          {t("ID utilisateur", "User ID")}
                        </label>
                        <div className="settings-value settings-value-mono">
                          {user_profile.userId}
                        </div>
                      </div>
                      {user_profile.organization_id && (
                        <div className="settings-field">
                          <label className="settings-label">
                            <Briefcase
                              style={{ width: "16px", height: "16px" }}
                            />
                            {t("ID Organisation", "Organization ID")}
                          </label>
                          <div className="settings-value settings-value-mono">
                            {user_profile.organization_id}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="settings-actions">
                  <button
                    onClick={() => router.push("/user/organization/dashboard")}
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
