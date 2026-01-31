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

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const MENU_ITEMS = [
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
      active: false,
    },
    {
      icon: Settings,
      label: "Mes paramètres",
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
        throw new Error("Erreur lors du chargement du profil");
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
      setErrorMessage("Impossible de charger les informations du profil");
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
      USAGER: "Client",
      AGENCE_VOYAGE: "Chef d'agence",
      ORGANISATION: "Directeur Général",
      BSM: "Administrateur BSM",
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
          title="Mes paramètres"
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
                <p>Chargement de votre profil...</p>
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
                    Réessayer
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
                        Informations personnelles
                      </h3>
                    </div>
                    <div className="settings-section-content">
                      <div className="settings-field">
                        <label className="settings-label">Prénom</label>
                        <div className="settings-value">
                          {userProfile.first_name}
                        </div>
                      </div>
                      <div className="settings-field">
                        <label className="settings-label">Nom</label>
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
                      <h3 className="settings-section-title">Coordonnées</h3>
                    </div>
                    <div className="settings-section-content">
                      <div className="settings-field">
                        <label className="settings-label">
                          <Phone style={{ width: "16px", height: "16px" }} />
                          Téléphone
                        </label>
                        <div className="settings-value">
                          {userProfile.phone_number || "Non renseigné"}
                        </div>
                      </div>
                      <div className="settings-field">
                        <label className="settings-label">
                          <Mail style={{ width: "16px", height: "16px" }} />
                          Email
                        </label>
                        <div className="settings-value">
                          {userProfile.email || "Non renseigné"}
                        </div>
                      </div>
                      {userProfile.address && (
                        <div className="settings-field">
                          <label className="settings-label">
                            <MapPin style={{ width: "16px", height: "16px" }} />
                            Adresse
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
                      <h3 className="settings-section-title">Compte</h3>
                    </div>
                    <div className="settings-section-content">
                      <div className="settings-field">
                        <label className="settings-label">
                          Nom d'utilisateur
                        </label>
                        <div className="settings-value">
                          {userProfile.username}
                        </div>
                      </div>
                      <div className="settings-field">
                        <label className="settings-label">Rôle</label>
                        <div className="settings-value">
                          {userProfile.role.map(getRoleLabel).join(", ")}
                        </div>
                      </div>
                      <div className="settings-field">
                        <label className="settings-label">ID utilisateur</label>
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
                    Retour au dashboard
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
                    <span>Se déconnecter</span>
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
