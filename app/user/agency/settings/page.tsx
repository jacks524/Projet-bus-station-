"use client";

import React, { useState, useEffect } from "react";
import {
  Home,
  Settings,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Mail,
  Phone,
  MapPin,
  Shield,
  User,
  Bus,
  Calendar,
  Users,
  Building2,
  RefreshCw,
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
  agency_id: string;
}

/**
 * Agence Settings Page Component
 *
 * Displays user profile information for Chef d'agence
 * Features readonly form with user details
 *
 * @author Thomas Djotio Ndié
 * @date 2025-01-14
 * @updated 2024-01-29 - Adapté pour utiliser la structure du dashboard
 */
export default function AgenceSettingsPage() {
  const [user_profile, setUserProfile] = useState<UserProfile | null>(null);
  const [is_loading, setIsLoading] = useState(true);
  const [error_message, setErrorMessage] = useState("");
  const [show_mobile_menu, setShowMobileMenu] = useState(false);
  const router = useRouter();

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
  }, [router]);

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
        throw new Error("Erreur lors du chargement du profil");
      }

      const data = await response.json();

      const stored_user_data =
        localStorage.getItem("user_data") ||
        sessionStorage.getItem("user_data");
      let email = "";
      let agency_id = "";
      if (stored_user_data) {
        const parsed_data = JSON.parse(stored_user_data);
        email = parsed_data.email || "";
        agency_id = parsed_data.agency_id || "";
      }

      setUserProfile({ ...data, email, agency_id });
    } catch (error: any) {
      setErrorMessage("Impossible de charger les informations du profil");
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
      USAGER: "Client",
      AGENCE_VOYAGE: "Chef d'agence",
      ORGANISATION: "Directeur Général",
      BSM: "Administrateur BSM",
    };
    return role_labels[role] || role;
  };

  return (
    <div className="dashboard-layout">
      <Sidebar menuItems={MENU_ITEMS} activePath="/user/agency/settings" />
      <MobileSidebar
        isOpen={show_mobile_menu}
        onClose={() => setShowMobileMenu(false)}
        menuItems={MENU_ITEMS}
        activePath="/user/agency/settings"
      />

      <div className="dashboard-main">
        <Header
          title="Mes paramètres"
          userData={user_profile}
          onMenuClick={() => setShowMobileMenu(true)}
          userType="agency"
        />

        <main className="dashboard-content">
          <div className="container" style={{ maxWidth: "900px" }}>
            {/* Loading State */}
            {is_loading && (
              <div className="loading-state">
                <RefreshCw className="spin" />
                <p>Chargement de votre profil...</p>
              </div>
            )}

            {/* Error State */}
            {!is_loading && error_message && (
              <>
                <div className="error-state">
                  <X className="error-state-icon" />
                  <p className="error-text">{error_message}</p>
                  <button
                    onClick={fetchUserProfile}
                    className="btn modal-button modal-button-error"
                  >
                    Réessayer
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
                        {user_profile.role.map(getRoleLabel).join(", ")}
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
                          {user_profile.first_name}
                        </div>
                      </div>
                      <div className="settings-field">
                        <label className="settings-label">Nom</label>
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
                      <h3 className="settings-section-title">Coordonnées</h3>
                    </div>
                    <div className="settings-section-content">
                      <div className="settings-field">
                        <label className="settings-label">
                          <Phone style={{ width: "16px", height: "16px" }} />
                          Téléphone
                        </label>
                        <div className="settings-value">
                          {user_profile.phone_number || "Non renseigné"}
                        </div>
                      </div>
                      <div className="settings-field">
                        <label className="settings-label">
                          <Mail style={{ width: "16px", height: "16px" }} />
                          Email
                        </label>
                        <div className="settings-value">
                          {user_profile.email || "Non renseigné"}
                        </div>
                      </div>
                      {user_profile.address && (
                        <div className="settings-field">
                          <label className="settings-label">
                            <MapPin style={{ width: "16px", height: "16px" }} />
                            Adresse
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
                      <h3 className="settings-section-title">Compte</h3>
                    </div>
                    <div className="settings-section-content">
                      <div className="settings-field">
                        <label className="settings-label">
                          Nom d'utilisateur
                        </label>
                        <div className="settings-value">
                          {user_profile.username}
                        </div>
                      </div>
                      <div className="settings-field">
                        <label className="settings-label">Rôle</label>
                        <div className="settings-value">
                          {user_profile.role.map(getRoleLabel).join(", ")}
                        </div>
                      </div>
                      <div className="settings-field">
                        <label className="settings-label">ID utilisateur</label>
                        <div className="settings-value settings-value-mono">
                          {user_profile.userId}
                        </div>
                      </div>
                      {user_profile.agency_id && (
                        <div className="settings-field">
                          <label className="settings-label">
                            <Building2
                              style={{ width: "16px", height: "16px" }}
                            />
                            ID Agence
                          </label>
                          <div className="settings-value settings-value-mono">
                            {user_profile.agency_id}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="settings-actions">
                  <button
                    onClick={() => router.push("/user/agency/dashboard")}
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
