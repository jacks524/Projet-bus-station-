"use client";

import React, { useState, useEffect } from "react";
import {
  Home,
  Building2,
  Settings,
  Briefcase,
  Users,
  Car,
  RefreshCw,
  X,
  ChevronDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  MapPin,
  Mail,
  Phone,
  User,
  UserCheck,
  BadgeCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import MobileSidebar from "@/app/components/Mobilesidebar";
import Header from "@/app/components/Header";
import SuccessModal from "@/app/components/SuccessModal";
import ErrorModal from "@/app/components/ErrorModal";
import { useLanguage } from "@/app/providers";

/* ─────────────────────────── types ─────────────────────────── */

type Gender = "MALE" | "FEMALE";
type TabType = "employees" | "drivers";

interface Employee {
  userId: string;
  token: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phoneNumber: string;
  address: string;
  role: string[];
}

interface Driver {
  userId: string;
  token: string;
  last_name: string;
  first_name: string;
  email: string;
  username: string;
  phone_number: string;
  address: string;
  role: string[];
}

interface EmployeeFormData {
  last_name: string;
  first_name: string;
  email: string;
  username: string;
  password: string;
  phone_number: string;
  role: string[];
  gender: Gender;
  address: string;
  agenceVoyageId: string;
  poste: string;
  departement: string;
  salaire: number;
  managerId: string;
  userExist: boolean;
}

interface DriverFormData {
  last_name: string;
  first_name: string;
  email: string;
  username: string;
  password: string;
  phone_number: string;
  role: string[];
  gender: Gender;
  address: string;
  agenceVoyageId: string;
  userExist: boolean;
}

interface Agency {
  agency_id: string;
  agency_name: string;
  short_name: string;
  ville: string;
}

interface Organization {
  id: string;
  short_name: string;
  long_name: string;
  created_by: string;
  status: string;
}

interface AgenciesStatistics {
  agencies: Agency[];
}

interface UserData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  userId: string;
  role: string[];
}

/* ─────────────────────────── empty forms ─────────────────────────── */

const EMPTY_EMPLOYEE: EmployeeFormData = {
  last_name: "",
  first_name: "",
  email: "",
  username: "",
  password: "",
  phone_number: "",
  role: ["AGENCE_VOYAGE"],
  gender: "MALE",
  address: "",
  agenceVoyageId: "",
  poste: "",
  departement: "",
  salaire: 0,
  managerId: "",
  userExist: false,
};

const EMPTY_DRIVER: DriverFormData = {
  last_name: "",
  first_name: "",
  email: "",
  username: "",
  password: "",
  phone_number: "",
  role: ["USAGER"],
  gender: "MALE",
  address: "",
  agenceVoyageId: "",
  userExist: false,
};

/* ═══════════════════════════════════════════════════════════════
   PAGE COMPONENT
═══════════════════════════════════════════════════════════════ */

export default function DriversPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  /* ── orgs & agencies ── */
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [showOrgSelector, setShowOrgSelector] = useState(false);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [showAgencySelector, setShowAgencySelector] = useState(false);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);

  /* ── tabs ── */
  const [activeTab, setActiveTab] = useState<TabType>("employees");

  /* ── data ── */
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(false);

  /* ── search & pagination ── */
  const [searchEmp, setSearchEmp] = useState("");
  const [searchDrv, setSearchDrv] = useState("");
  const [pageEmp, setPageEmp] = useState(1);
  const [pageDrv, setPageDrv] = useState(1);
  const PER_PAGE = 8;

  /* ── modals ── */
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [showDrvModal, setShowDrvModal] = useState(false);
  const [empForm, setEmpForm] = useState<EmployeeFormData>(EMPTY_EMPLOYEE);
  const [drvForm, setDrvForm] = useState<DriverFormData>(EMPTY_DRIVER);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  const menuItems = [
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
      icon: Users,
      label: t("Employés", "Employees"),
      path: "/user/organization/employees",
      active: true,
    },
    {
      icon: Car,
      label: t("Bus", "Bus"),
      path: "/user/organization/bus",
      active: false,
    },
    {
      icon: Settings,
      label: t("Mes paramètres", "My settings"),
      path: "/user/organization/settings",
      active: false,
    },
  ];

  const token = () =>
    localStorage.getItem("auth_token") ||
    sessionStorage.getItem("auth_token") ||
    "";

  /* ── init ── */
  useEffect(() => {
    if (!token()) {
      router.push("/login");
      return;
    }
    const s =
      localStorage.getItem("user_data") || sessionStorage.getItem("user_data");
    if (s) setUserData(JSON.parse(s));
    else router.push("/login");
  }, [router]);

  useEffect(() => {
    if (userData?.userId) fetchOrgs();
  }, [userData?.userId]);
  useEffect(() => {
    if (selectedOrg?.id) fetchAgencies(selectedOrg.id);
  }, [selectedOrg?.id]);
  useEffect(() => {
    if (selectedAgency?.agency_id) {
      fetchEmployees(selectedAgency.agency_id);
      fetchDrivers(selectedAgency.agency_id);
    }
  }, [selectedAgency?.agency_id]);

  /* ── fetchers ── */
  const fetchOrgs = async () => {
    setIsLoadingOrgs(true);
    try {
      const res = await fetch(`${API}/organizations?page=0&size=1000`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      const mine = data.filter(
        (o: Organization) =>
          o.created_by === userData?.userId && o.status !== "DELETED",
      );
      setOrganizations(mine);
      if (mine.length > 0) setSelectedOrg(mine[0]);
    } catch {
      /* silent */
    } finally {
      setIsLoadingOrgs(false);
    }
  };

  const fetchAgencies = async (orgId: string) => {
    try {
      const res = await fetch(
        `${API}/statistics/organisation/${orgId}/agencies`,
        {
          headers: { Authorization: `Bearer ${token()}` },
        },
      );
      const data: AgenciesStatistics = await res.json();
      setAgencies(data.agencies || []);
      if (data.agencies?.length > 0) setSelectedAgency(data.agencies[0]);
      else {
        setSelectedAgency(null);
        setEmployees([]);
        setDrivers([]);
      }
    } catch {
      setAgencies([]);
    }
  };

  const fetchEmployees = async (agencyId: string) => {
    setIsLoadingEmployees(true);
    try {
      const res = await fetch(`${API}/utilisateur/employes/${agencyId}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setEmployees(Array.isArray(data) ? data : []);
      console.log(data);
    } catch {
      setEmployees([]);
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  const fetchDrivers = async (agencyId: string) => {
    setIsLoadingDrivers(true);
    try {
      const res = await fetch(`${API}/utilisateur/chauffeurs/${agencyId}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDrivers(Array.isArray(data) ? data : [data].filter(Boolean));
      console.log(data);
    } catch {
      setDrivers([]);
    } finally {
      setIsLoadingDrivers(false);
    }
  };

  /* ── submit employee ── */
  const handleSubmitEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !empForm.last_name ||
      !empForm.first_name ||
      !empForm.email ||
      !empForm.username ||
      !empForm.password
    ) {
      setErrorMessage(
        t(
          "Veuillez remplir tous les champs obligatoires",
          "Please fill in all required fields",
        ),
      );
      setShowErrorModal(true);
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API}/utilisateur/employe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify(empForm),
      });
      if (!res.ok) throw new Error();
      setShowEmpModal(false);
      setSuccessMessage(
        t("Employé ajouté avec succès", "Employee added successfully"),
      );
      setShowSuccessModal(true);
      if (selectedAgency) fetchEmployees(selectedAgency.agency_id);
    } catch {
      setErrorMessage(
        t("Erreur lors de la création de l'employé", "Error creating employee"),
      );
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── submit driver ── */
  const handleSubmitDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !drvForm.last_name ||
      !drvForm.first_name ||
      !drvForm.email ||
      !drvForm.username ||
      !drvForm.password
    ) {
      setErrorMessage(
        t(
          "Veuillez remplir tous les champs obligatoires",
          "Please fill in all required fields",
        ),
      );
      setShowErrorModal(true);
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API}/utilisateur/chauffeur`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify(drvForm),
      });
      if (!res.ok) throw new Error();
      setShowDrvModal(false);
      setSuccessMessage(
        t("Chauffeur ajouté avec succès", "Driver added successfully"),
      );
      setShowSuccessModal(true);
      if (selectedAgency) fetchDrivers(selectedAgency.agency_id);
    } catch {
      setErrorMessage(
        t("Erreur lors de la création du chauffeur", "Error creating driver"),
      );
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEmpModal = () => {
    setEmpForm({
      ...EMPTY_EMPLOYEE,
      agenceVoyageId: selectedAgency?.agency_id || "",
    });
    setShowPassword(false);
    setShowEmpModal(true);
  };

  const openDrvModal = () => {
    setDrvForm({
      ...EMPTY_DRIVER,
      agenceVoyageId: selectedAgency?.agency_id || "",
    });
    setShowPassword(false);
    setShowDrvModal(true);
  };

  /* ── filtered lists ── */
  const filteredEmp = employees.filter(
    (u) =>
      `${u.firstName} ${u.lastName}`
        .toLowerCase()
        .includes(searchEmp.toLowerCase()) ||
      u.email.toLowerCase().includes(searchEmp.toLowerCase()) ||
      u.username.toLowerCase().includes(searchEmp.toLowerCase()),
  );

  const filteredDrv = drivers.filter(
    (u) =>
      `${u.first_name} ${u.last_name}`
        .toLowerCase()
        .includes(searchDrv.toLowerCase()) ||
      u.email.toLowerCase().includes(searchDrv.toLowerCase()) ||
      u.username.toLowerCase().includes(searchDrv.toLowerCase()),
  );

  const totalEmpPages = Math.ceil(filteredEmp.length / PER_PAGE);
  const totalDrvPages = Math.ceil(filteredDrv.length / PER_PAGE);
  const pagedEmp = filteredEmp.slice(
    (pageEmp - 1) * PER_PAGE,
    pageEmp * PER_PAGE,
  );
  const pagedDrv = filteredDrv.slice(
    (pageDrv - 1) * PER_PAGE,
    pageDrv * PER_PAGE,
  );

  /* ── helpers ── */
  const initialsEmp = (u: Employee) =>
    `${u.firstName?.[0] || ""}${u.lastName?.[0] || ""}`.toUpperCase() || "?";

  const initialsDrv = (u: Driver) =>
    `${u.first_name?.[0] || ""}${u.last_name?.[0] || ""}`.toUpperCase() || "?";

  /* ═══════════════════ SHARED FORM FIELDS ═══════════════════ */
  const renderCommonFields = (
    form: EmployeeFormData | DriverFormData,
    setForm: (f: any) => void,
  ) => (
    <>
      <div className="form-group">
        <label className="form-label">{t("Prénom *", "First name *")}</label>
        <input
          type="text"
          className="form-input"
          placeholder={t("Ex: Jean", "e.g., John")}
          value={form.first_name}
          onChange={(e) =>
            setForm((p: any) => ({ ...p, first_name: e.target.value }))
          }
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label">{t("Nom *", "Last name *")}</label>
        <input
          type="text"
          className="form-input"
          placeholder={t("Ex: Dupont", "e.g., Doe")}
          value={form.last_name}
          onChange={(e) =>
            setForm((p: any) => ({ ...p, last_name: e.target.value }))
          }
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label">{t("Email *", "Email *")}</label>
        <input
          type="email"
          className="form-input"
          placeholder="email@exemple.com"
          value={form.email}
          onChange={(e) =>
            setForm((p: any) => ({ ...p, email: e.target.value }))
          }
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label">
          {t("Nom d'utilisateur *", "Username *")}
        </label>
        <input
          type="text"
          className="form-input"
          placeholder="jean_dupont"
          value={form.username}
          onChange={(e) =>
            setForm((p: any) => ({ ...p, username: e.target.value }))
          }
          required
        />
      </div>
      <div className="form-group" style={{ position: "relative" }}>
        <label className="form-label">
          {t("Mot de passe *", "Password *")}
        </label>
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            className="form-input"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) =>
              setForm((p: any) => ({ ...p, password: e.target.value }))
            }
            required
            style={{ paddingRight: "2.5rem" }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            style={{
              position: "absolute",
              right: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--gray-500)",
              padding: 0,
            }}
          >
            {showPassword ? (
              <EyeOff style={{ width: 16, height: 16 }} />
            ) : (
              <Eye style={{ width: 16, height: 16 }} />
            )}
          </button>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">{t("Téléphone", "Phone")}</label>
        <input
          type="tel"
          className="form-input"
          placeholder="+237 6XX XXX XXX"
          value={form.phone_number}
          onChange={(e) =>
            setForm((p: any) => ({ ...p, phone_number: e.target.value }))
          }
        />
      </div>
      <div className="form-group" style={{ gridColumn: "1 / -1" }}>
        <label className="form-label">{t("Adresse", "Address")}</label>
        <input
          type="text"
          className="form-input"
          placeholder={t(
            "Ex: Quartier Bastos, Yaoundé",
            "e.g., Bastos district, Yaounde",
          )}
          value={form.address}
          onChange={(e) =>
            setForm((p: any) => ({ ...p, address: e.target.value }))
          }
        />
      </div>
      <div className="form-group" style={{ gridColumn: "1 / -1" }}>
        <label className="form-label">{t("Genre", "Gender")}</label>
        <div className="gender-buttons">
          <button
            type="button"
            className={`gender-button ${form.gender === "MALE" ? "active" : ""}`}
            onClick={() => setForm((p: any) => ({ ...p, gender: "MALE" }))}
          >
            {t("Homme", "Male")}
          </button>
          <button
            type="button"
            className={`gender-button ${form.gender === "FEMALE" ? "active" : ""}`}
            onClick={() => setForm((p: any) => ({ ...p, gender: "FEMALE" }))}
          >
            {t("Femme", "Female")}
          </button>
        </div>
      </div>
    </>
  );

  /* ═══════════════════════════ RENDER ═══════════════════════════ */
  return (
    <div className="dashboard-layout">
      <Sidebar menuItems={menuItems} activePath="/user/organization/drivers" />
      <MobileSidebar
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        menuItems={menuItems}
        activePath="/user/organization/drivers"
      />

      <div className="dashboard-main">
        <Header
          title={t("Chauffeurs & Employés", "Drivers & Employees")}
          userData={userData}
          onMenuClick={() => setShowMobileMenu(true)}
          showSettingsButton={true}
          userType="organization"
        />

        <main className="dashboard-content">
          {/* Section header */}
          <div
            className="section-header"
            style={{ marginBottom: "var(--spacing-2xl)" }}
          >
            <h2 className="section-title">{t("Votre équipe", "Your team")}</h2>
            <p className="section-description">
              {t(
                "Gérez les employés et chauffeurs de vos agences",
                "Manage the employees and drivers of your agencies",
              )}
            </p>
          </div>

          {isLoadingOrgs && (
            <div className="loading-state">
              <RefreshCw className="spin" />
              <p>{t("Chargement...", "Loading...")}</p>
            </div>
          )}

          {!isLoadingOrgs && organizations.length === 0 && (
            <div className="empty-state">
              <Briefcase className="empty-icon" />
              <h3 className="empty-title">
                {t("Aucune organisation", "No organization")}
              </h3>
              <p className="empty-description">
                {t(
                  "Créez une organisation pour gérer votre équipe",
                  "Create an organization to manage your team",
                )}
              </p>
              <button
                onClick={() => router.push("/user/organization/organization")}
                className="btn btn-primary"
                style={{ marginTop: 15 }}
              >
                {t("Créer une organisation", "Create an organization")}
              </button>
            </div>
          )}

          {!isLoadingOrgs && organizations.length > 0 && (
            <>
              {/* Org + Agency header card */}
              <div className="agency-header-card">
                <div className="agency-info">
                  <h2 className="agency-name">
                    {t("Organisation :", "Organization:")}{" "}
                    {selectedOrg?.long_name}
                  </h2>
                  {selectedAgency && (
                    <p className="agency-location">
                      <MapPin
                        style={{
                          display: "inline",
                          width: 14,
                          height: 14,
                          marginRight: 4,
                        }}
                      />
                      {t("Agence :", "Agency:")} {selectedAgency.agency_name} —{" "}
                      {selectedAgency.ville}
                    </p>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "var(--spacing-sm)",
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  {organizations.length > 1 && (
                    <div className="agency-selector">
                      <button
                        onClick={() => setShowOrgSelector(!showOrgSelector)}
                        className="btn btn-secondary"
                      >
                        {t("Changer org", "Change org")} <ChevronDown />
                      </button>
                      {showOrgSelector && (
                        <>
                          <div
                            className="selector-overlay"
                            onClick={() => setShowOrgSelector(false)}
                          />
                          <div className="selector-dropdown">
                            {organizations.map((o) => (
                              <button
                                key={o.id}
                                onClick={() => {
                                  setSelectedOrg(o);
                                  setShowOrgSelector(false);
                                }}
                                className={`selector-item ${selectedOrg?.id === o.id ? "active" : ""}`}
                              >
                                <p className="selector-item-name">
                                  {o.long_name}
                                </p>
                                <p className="selector-item-city">
                                  {o.short_name}
                                </p>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {agencies.length > 1 && (
                    <div className="agency-selector">
                      <button
                        onClick={() =>
                          setShowAgencySelector(!showAgencySelector)
                        }
                        className="btn btn-secondary"
                      >
                        {t("Changer agence", "Change agency")} <ChevronDown />
                      </button>
                      {showAgencySelector && (
                        <>
                          <div
                            className="selector-overlay"
                            onClick={() => setShowAgencySelector(false)}
                          />
                          <div className="selector-dropdown">
                            {agencies.map((ag) => (
                              <button
                                key={ag.agency_id}
                                onClick={() => {
                                  setSelectedAgency(ag);
                                  setShowAgencySelector(false);
                                  setPageEmp(1);
                                  setPageDrv(1);
                                }}
                                className={`selector-item ${selectedAgency?.agency_id === ag.agency_id ? "active" : ""}`}
                              >
                                <p className="selector-item-name">
                                  {ag.agency_name}
                                </p>
                                <p className="selector-item-city">{ag.ville}</p>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  <button
                    className="btn-icon"
                    title={t("Actualiser", "Refresh")}
                    onClick={() => {
                      if (selectedAgency) {
                        fetchEmployees(selectedAgency.agency_id);
                        fetchDrivers(selectedAgency.agency_id);
                      }
                    }}
                  >
                    <RefreshCw />
                  </button>
                </div>
              </div>

              {/* No agencies */}
              {agencies.length === 0 && (
                <div className="empty-state">
                  <Building2 className="empty-icon" />
                  <h3 className="empty-title">
                    {t("Aucune agence", "No agency")}
                  </h3>
                  <p className="empty-description">
                    {t(
                      "Créez une agence pour gérer votre équipe",
                      "Create an agency to manage your team",
                    )}
                  </p>
                  <button
                    onClick={() => router.push("/user/organization/agencies")}
                    className="btn btn-primary"
                    style={{ marginTop: 15 }}
                  >
                    {t("Créer une agence", "Create an agency")}
                  </button>
                </div>
              )}

              {selectedAgency && (
                <>
                  {/* Summary counters */}
                  <div className="staff-summary-row">
                    <div className="staff-summary-card">
                      <div>
                        <p className="staff-summary-value">
                          {employees.length}
                        </p>
                        <p className="staff-summary-label">
                          {t("Employés", "Employees")}
                        </p>
                      </div>
                    </div>
                    <div className="staff-summary-card">
                      <div>
                        <p className="staff-summary-value">{drivers.length}</p>
                        <p className="staff-summary-label">
                          {t("Chauffeurs", "Drivers")}
                        </p>
                      </div>
                    </div>
                    <div className="staff-summary-card">
                      <div>
                        <p className="staff-summary-value">
                          {employees.length + drivers.length}
                        </p>
                        <p className="staff-summary-label">
                          {t("Total équipe", "Total team")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="staff-tabs">
                    <button
                      className={`staff-tab ${activeTab === "employees" ? "active" : ""}`}
                      onClick={() => setActiveTab("employees")}
                    >
                      <UserCheck style={{ width: 16, height: 16 }} />
                      {t("Employés", "Employees")}
                      <span className="staff-tab-count">
                        {employees.length}
                      </span>
                    </button>
                    <button
                      className={`staff-tab ${activeTab === "drivers" ? "active" : ""}`}
                      onClick={() => setActiveTab("drivers")}
                    >
                      <Car style={{ width: 16, height: 16 }} />
                      {t("Chauffeurs", "Drivers")}
                      <span className="staff-tab-count">{drivers.length}</span>
                    </button>
                  </div>

                  {/* ── EMPLOYEES TAB ── */}
                  {activeTab === "employees" && (
                    <div className="org-agencies-section">
                      <div className="content-header">
                        <h3 className="content-title">
                          {t("Employés de l'agence", "Agency employees")}
                        </h3>
                        <div
                          style={{
                            display: "flex",
                            gap: "var(--spacing-sm)",
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <div className="search-input-wrapper">
                            <Search />
                            <input
                              type="text"
                              placeholder={t(
                                "Rechercher un employé...",
                                "Search employee...",
                              )}
                              value={searchEmp}
                              onChange={(e) => {
                                setSearchEmp(e.target.value);
                                setPageEmp(1);
                              }}
                            />
                          </div>
                          <button
                            className="btn btn-primary"
                            onClick={openEmpModal}
                          >
                            <Plus style={{ width: 16, height: 16 }} />
                            {t("Ajouter un employé", "Add employee")}
                          </button>
                        </div>
                      </div>

                      {isLoadingEmployees && (
                        <div className="loading-state">
                          <RefreshCw className="spin" />
                          <p>
                            {t(
                              "Chargement des employés...",
                              "Loading employees...",
                            )}
                          </p>
                        </div>
                      )}

                      {!isLoadingEmployees && filteredEmp.length === 0 && (
                        <div className="empty-state">
                          <UserCheck className="empty-icon" />
                          <h3 className="empty-title">
                            {searchEmp
                              ? t("Aucun résultat", "No results")
                              : t("Aucun employé", "No employees")}
                          </h3>
                          <p className="empty-description">
                            {searchEmp
                              ? t(
                                  "Aucun employé ne correspond",
                                  "No employee matches",
                                )
                              : t(
                                  "Ajoutez votre premier employé",
                                  "Add your first employee",
                                )}
                          </p>
                          {!searchEmp && (
                            <button
                              className="btn btn-primary"
                              onClick={openEmpModal}
                              style={{ marginTop: 15 }}
                            >
                              <Plus style={{ width: 16, height: 16 }} />
                              {t("Ajouter", "Add")}
                            </button>
                          )}
                        </div>
                      )}

                      {!isLoadingEmployees && pagedEmp.length > 0 && (
                        <>
                          <div className="staff-cards-grid">
                            {pagedEmp.map((u) => (
                              <EmployeeCard
                                key={u.userId}
                                user={u}
                                initials={initialsEmp(u)}
                                t={t}
                              />
                            ))}
                          </div>
                          {totalEmpPages > 1 && (
                            <div className="widget-pagination">
                              <button
                                onClick={() =>
                                  setPageEmp((p) => Math.max(1, p - 1))
                                }
                                disabled={pageEmp === 1}
                                className="btn-icon"
                              >
                                <ChevronLeft />
                              </button>
                              <span>
                                {t("Page", "Page")} {pageEmp} {t("sur", "of")}{" "}
                                {totalEmpPages}
                              </span>
                              <button
                                onClick={() =>
                                  setPageEmp((p) =>
                                    Math.min(totalEmpPages, p + 1),
                                  )
                                }
                                disabled={pageEmp === totalEmpPages}
                                className="btn-icon"
                              >
                                <ChevronRight />
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* ── DRIVERS TAB ── */}
                  {activeTab === "drivers" && (
                    <div className="org-agencies-section">
                      <div className="content-header">
                        <h3 className="content-title">
                          {t("Chauffeurs de l'agence", "Agency drivers")}
                        </h3>
                        <div
                          style={{
                            display: "flex",
                            gap: "var(--spacing-sm)",
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <div className="search-input-wrapper">
                            <Search />
                            <input
                              type="text"
                              placeholder={t(
                                "Rechercher un chauffeur...",
                                "Search driver...",
                              )}
                              value={searchDrv}
                              onChange={(e) => {
                                setSearchDrv(e.target.value);
                                setPageDrv(1);
                              }}
                            />
                          </div>
                          <button
                            className="btn btn-primary"
                            onClick={openDrvModal}
                          >
                            <Plus style={{ width: 16, height: 16 }} />
                            {t("Ajouter un chauffeur", "Add driver")}
                          </button>
                        </div>
                      </div>

                      {isLoadingDrivers && (
                        <div className="loading-state">
                          <RefreshCw className="spin" />
                          <p>
                            {t(
                              "Chargement des chauffeurs...",
                              "Loading drivers...",
                            )}
                          </p>
                        </div>
                      )}

                      {!isLoadingDrivers && filteredDrv.length === 0 && (
                        <div className="empty-state">
                          <Car className="empty-icon" />
                          <h3 className="empty-title">
                            {searchDrv
                              ? t("Aucun résultat", "No results")
                              : t("Aucun chauffeur", "No drivers")}
                          </h3>
                          <p className="empty-description">
                            {searchDrv
                              ? t(
                                  "Aucun chauffeur ne correspond",
                                  "No driver matches",
                                )
                              : t(
                                  "Ajoutez votre premier chauffeur",
                                  "Add your first driver",
                                )}
                          </p>
                          {!searchDrv && (
                            <button
                              className="btn btn-primary"
                              onClick={openDrvModal}
                              style={{ marginTop: 15 }}
                            >
                              <Plus style={{ width: 16, height: 16 }} />
                              {t("Ajouter", "Add")}
                            </button>
                          )}
                        </div>
                      )}

                      {!isLoadingDrivers && pagedDrv.length > 0 && (
                        <>
                          <div className="staff-cards-grid">
                            {pagedDrv.map((u) => (
                              <DriverCard
                                key={u.userId}
                                user={u}
                                initials={initialsDrv(u)}
                                t={t}
                              />
                            ))}
                          </div>
                          {totalDrvPages > 1 && (
                            <div className="widget-pagination">
                              <button
                                onClick={() =>
                                  setPageDrv((p) => Math.max(1, p - 1))
                                }
                                disabled={pageDrv === 1}
                                className="btn-icon"
                              >
                                <ChevronLeft />
                              </button>
                              <span>
                                {t("Page", "Page")} {pageDrv} {t("sur", "of")}{" "}
                                {totalDrvPages}
                              </span>
                              <button
                                onClick={() =>
                                  setPageDrv((p) =>
                                    Math.min(totalDrvPages, p + 1),
                                  )
                                }
                                disabled={pageDrv === totalDrvPages}
                                className="btn-icon"
                              >
                                <ChevronRight />
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </main>
      </div>

      {/* ══════════════ EMPLOYEE MODAL ══════════════ */}
      {showEmpModal && (
        <div
          className="modal-overlay"
          style={{ alignItems: "flex-start", paddingTop: "3rem" }}
        >
          <div
            className="payment-modal-content"
            style={{ borderRadius: "var(--radius-lg)", maxWidth: 660 }}
          >
            <div className="payment-modal-header">
              <h2 className="payment-modal-title">
                <UserCheck
                  style={{
                    display: "inline",
                    width: 18,
                    height: 18,
                    marginRight: 8,
                  }}
                />
                {t("Ajouter un employé", "Add an employee")}
              </h2>
              <button
                className="payment-modal-close"
                onClick={() => setShowEmpModal(false)}
              >
                <X />
              </button>
            </div>
            <div className="payment-modal-body">
              <form
                onSubmit={handleSubmitEmployee}
                className="create-voyage-form"
                style={{ marginTop: 0, gap: "var(--spacing-lg)" }}
              >
                <div className="form-section">
                  <div className="form-section-header">
                    <User style={{ width: 18, height: 18 }} />
                    <h3>
                      {t("Informations personnelles", "Personal information")}
                    </h3>
                  </div>
                  <div className="form-section-content">
                    {renderCommonFields(empForm, setEmpForm)}
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-header">
                    <BadgeCheck style={{ width: 18, height: 18 }} />
                    <h3>
                      {t(
                        "Informations professionnelles",
                        "Professional information",
                      )}
                    </h3>
                  </div>
                  <div className="form-section-content">
                    <div className="form-group">
                      <label className="form-label">
                        {t("Poste", "Position")}
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder={t(
                          "Ex: Responsable billetterie",
                          "e.g., Ticketing manager",
                        )}
                        value={empForm.poste}
                        onChange={(e) =>
                          setEmpForm((p) => ({ ...p, poste: e.target.value }))
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        {t("Département", "Department")}
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder={t(
                          "Ex: Administration",
                          "e.g., Administration",
                        )}
                        value={empForm.departement}
                        onChange={(e) =>
                          setEmpForm((p) => ({
                            ...p,
                            departement: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        {t("Salaire (XAF)", "Salary (XAF)")}
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="150000"
                        min={0}
                        value={empForm.salaire || ""}
                        onChange={(e) =>
                          setEmpForm((p) => ({
                            ...p,
                            salaire: parseFloat(e.target.value) || 0,
                          }))
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t("Rôle", "Role")}</label>
                      <input
                        type="text"
                        className="form-input"
                        value="AGENCE_VOYAGE"
                        disabled
                        style={{
                          background: "var(--gray-100)",
                          cursor: "not-allowed",
                        }}
                      />
                      <p className="form-helper-text">
                        {t(
                          "Chef d'agence (seul rôle disponible)",
                          "Agency manager (only available role)",
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="form-actions"
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    paddingTop: "var(--spacing-sm)",
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEmpModal(false)}
                  >
                    {t("Annuler", "Cancel")}
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw
                          className="spin"
                          style={{ width: 16, height: 16 }}
                        />
                        {t("En cours...", "Processing...")}
                      </>
                    ) : (
                      <>
                        <Plus style={{ width: 16, height: 16 }} />
                        {t("Ajouter l'employé", "Add employee")}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ DRIVER MODAL ══════════════ */}
      {showDrvModal && (
        <div
          className="modal-overlay"
          style={{ alignItems: "flex-start", paddingTop: "3rem" }}
        >
          <div
            className="payment-modal-content"
            style={{ borderRadius: "var(--radius-lg)", maxWidth: 660 }}
          >
            <div className="payment-modal-header">
              <h2 className="payment-modal-title">
                <Car
                  style={{
                    display: "inline",
                    width: 18,
                    height: 18,
                    marginRight: 8,
                  }}
                />
                {t("Ajouter un chauffeur", "Add a driver")}
              </h2>
              <button
                className="payment-modal-close"
                onClick={() => setShowDrvModal(false)}
              >
                <X />
              </button>
            </div>
            <div className="payment-modal-body">
              <form
                onSubmit={handleSubmitDriver}
                className="create-voyage-form"
                style={{ marginTop: 0, gap: "var(--spacing-lg)" }}
              >
                <div className="form-section">
                  <div className="form-section-header">
                    <User style={{ width: 18, height: 18 }} />
                    <h3>
                      {t("Informations personnelles", "Personal information")}
                    </h3>
                  </div>
                  <div className="form-section-content">
                    {renderCommonFields(drvForm, setDrvForm)}
                  </div>
                </div>

                <div
                  className="form-actions"
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    paddingTop: "var(--spacing-sm)",
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowDrvModal(false)}
                  >
                    {t("Annuler", "Cancel")}
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw
                          className="spin"
                          style={{ width: 16, height: 16 }}
                        />
                        {t("En cours...", "Processing...")}
                      </>
                    ) : (
                      <>
                        <Plus style={{ width: 16, height: 16 }} />
                        {t("Ajouter le chauffeur", "Add driver")}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <SuccessModal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={t("Succès", "Success")}
        message={successMessage}
        buttonText="OK"
      />
      <ErrorModal
        show={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={errorMessage}
      />
    </div>
  );
}

/* ════════════════════════════════════════
   STAFF CARD SUB-COMPONENT
════════════════════════════════════════ */
function EmployeeCard({
  user,
  initials,
  t,
}: {
  user: Employee;
  initials: string;
  t: (fr: string, en: string) => string;
}) {
  return (
    <div className="staff-card">
      <div className="staff-card-header">
        <div className="staff-card-avatar staff-card-avatar--employee">
          {initials}
        </div>
        <div className="staff-card-title-group">
          <h4 className="staff-card-name">
            {user.firstName} {user.lastName}
          </h4>
        </div>
      </div>
      <div className="staff-card-details">
        <div className="staff-card-detail">
          <Mail
            style={{
              width: 13,
              height: 13,
              color: "var(--gray-400)",
              flexShrink: 0,
            }}
          />
          <span>{user.email}</span>
        </div>
        {user.phoneNumber && (
          <div className="staff-card-detail">
            <Phone
              style={{
                width: 13,
                height: 13,
                color: "var(--gray-400)",
                flexShrink: 0,
              }}
            />
            <span>{user.phoneNumber}</span>
          </div>
        )}
        {user.username && (
          <div className="staff-card-detail">
            <User
              style={{
                width: 13,
                height: 13,
                color: "var(--gray-400)",
                flexShrink: 0,
              }}
            />
            <span>@{user.username}</span>
          </div>
        )}
        {user.address && (
          <div className="staff-card-detail">
            <MapPin
              style={{
                width: 13,
                height: 13,
                color: "var(--gray-400)",
                flexShrink: 0,
              }}
            />
            <span>{user.address}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function DriverCard({
  user,
  initials,
  t,
}: {
  user: Driver;
  initials: string;
  t: (fr: string, en: string) => string;
}) {
  return (
    <div className="staff-card">
      <div className="staff-card-header">
        <div className="staff-card-avatar staff-card-avatar--driver">
          {initials}
        </div>
        <div className="staff-card-title-group">
          <h4 className="staff-card-name">
            {user.first_name} {user.last_name}
          </h4>
        </div>
      </div>
      <div className="staff-card-details">
        <div className="staff-card-detail">
          <Mail
            style={{
              width: 13,
              height: 13,
              color: "var(--gray-400)",
              flexShrink: 0,
            }}
          />
          <span>{user.email}</span>
        </div>
        {user.phone_number && (
          <div className="staff-card-detail">
            <Phone
              style={{
                width: 13,
                height: 13,
                color: "var(--gray-400)",
                flexShrink: 0,
              }}
            />
            <span>{user.phone_number}</span>
          </div>
        )}
        {user.username && (
          <div className="staff-card-detail">
            <User
              style={{
                width: 13,
                height: 13,
                color: "var(--gray-400)",
                flexShrink: 0,
              }}
            />
            <span>@{user.username}</span>
          </div>
        )}
        {user.address && (
          <div className="staff-card-detail">
            <MapPin
              style={{
                width: 13,
                height: 13,
                color: "var(--gray-400)",
                flexShrink: 0,
              }}
            />
            <span>{user.address}</span>
          </div>
        )}
      </div>
    </div>
  );
}
