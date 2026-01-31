"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  Calendar,
  FileText,
  Ticket,
  Gift,
  History,
  Settings,
} from "lucide-react";

interface MenuItem {
  icon: any;
  label: string;
  path: string;
  active: boolean;
}

interface SidebarProps {
  menuItems: MenuItem[];
  activePath: string;
}

export default function Sidebar({ menuItems, activePath }: SidebarProps) {
  const router = useRouter();

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <div className="sidebar-logo">
          <button onClick={() => window.location.reload()} className="logo-btn">
            <img src="/images/busstation.png" alt="BusStation" />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activePath === item.path;

            return (
              <button
                key={index}
                onClick={() =>
                  isActive ? window.location.reload() : router.push(item.path)
                }
                className={`sidebar-nav-item ${isActive ? "active" : ""}`}
              >
                <Icon className="sidebar-nav-icon" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
