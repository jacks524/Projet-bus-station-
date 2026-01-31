"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  Settings,
  ChevronDown,
  LogOut,
  Headphones,
  BookOpen,
  HelpCircle,
} from "lucide-react";

interface UserData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role?: string[];
}

interface HeaderProps {
  title: string;
  userData: UserData | null;
  onMenuClick: () => void;
  showSettingsButton?: boolean;
  userType?: "client" | "organization" | "bsm" | "agency";
}

export default function Header({
  title,
  userData,
  onMenuClick,
  showSettingsButton = true,
  userType = "client",
}: HeaderProps) {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const getSettingsRoute = () => {
    switch (userType) {
      case "organization":
        return "/user/organization/settings";
      case "bsm":
        return "/user/bsm/settings";
      case "agency":
        return "/user/agency/settings";
      default:
        return "/user/client/settings";
    }
  };

  const getLoginRoute = () => {
    if (userType === "bsm") {
      return "/bsm/login";
    }
    return "/login";
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("user_data");

    const loginRoute = getLoginRoute();
    router.push(loginRoute);
  };

  const handleSettingsClick = () => {
    const settingsRoute = getSettingsRoute();
    router.push(settingsRoute);
  };

  return (
    <header className="dashboard-header">
      <div className="dashboard-header-content">
        <div className="dashboard-header-left">
          <button onClick={onMenuClick} className="mobile-menu-trigger">
            <Menu />
          </button>
          <h1 className="dashboard-title">{title}</h1>
        </div>

        <div className="dashboard-header-right">
          {showSettingsButton && (
            <button onClick={handleSettingsClick} className="header-icon-btn">
              <Settings />
            </button>
          )}

          <div className="profile-menu-wrapper">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="profile-menu-trigger"
            >
              <img src="/images/user-icon.png" alt="Profile" />
              <span className="profile-username">{userData?.username}</span>
              <ChevronDown className="profile-chevron" />
            </button>

            {showProfileMenu && (
              <div className="profile-menu-dropdown">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    handleSettingsClick();
                  }}
                  className="profile-menu-item"
                >
                  <Settings />
                  <span>Paramètres</span>
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    window.open("/contact", "_blank");
                  }}
                  className="profile-menu-item"
                >
                  <Headphones />
                  <span>Service client</span>
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    window.open(
                      "https://drive.google.com/file/d/1Iutmua2a-BlsRm43J2Gsyz59aN6ab1ln/view?usp=sharing",
                      "_blank",
                    );
                  }}
                  className="profile-menu-item"
                >
                  <BookOpen />
                  <span>Guide d’utilisation</span>
                </button>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    window.open("/help", "_blank")
                  }}
                  className="profile-menu-item"
                >
                  <HelpCircle />
                  <span>Centre d’aide</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="profile-menu-item logout"
                >
                  <LogOut />
                  <span>Se déconnecter</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
