"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface MenuItem {
  icon: any;
  label: string;
  path: string;
  active: boolean;
}

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  activePath: string;
}

export default function MobileSidebar({
  isOpen,
  onClose,
  menuItems,
  activePath,
}: MobileSidebarProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <>
      <div className="mobile-sidebar-overlay" onClick={onClose}></div>

      <aside className="mobile-sidebar">
        <div className="mobile-sidebar-content">
          <div className="mobile-sidebar-header">
            <button
              onClick={() => {
                onClose();
                window.location.reload();
              }}
              className="logo-btn"
            >
              <img src="/images/busstation.png" alt="BusStation" />
            </button>
            <button onClick={onClose} className="mobile-sidebar-close">
              <X />
            </button>
          </div>

          <nav className="sidebar-nav">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activePath === item.path;

              return (
                <button
                  key={index}
                  onClick={() => {
                    onClose();
                    router.push(item.path);
                  }}
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
    </>
  );
}
