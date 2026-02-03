"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/providers";

export default function LoginBSMPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { t } = useLanguage();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const CAROUSEL_IMAGES = [
    "/images/landing2.jpg",
    "/images/landing3.jpg",
    "/images/siege3.jpg",
  ];

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage("");

    if (!username || !password) {
      setErrorMessage(
        t("Veuillez remplir tous les champs", "Please fill in all fields"),
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/utilisateur/connexion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      if (!response.ok) {
        throw new Error(t("Identifiants incorrects", "Invalid credentials"));
      }

      const data = await response.json();

      if (!data.role.includes("BSM")) {
        throw new Error(
          t("Accès réservé aux administrateurs", "Access restricted to administrators"),
        );
      }

      sessionStorage.setItem("bsm_token", data.token);
      sessionStorage.setItem("bsm_data", JSON.stringify(data));

      router.push("/user/bsm/dashboard");
    } catch (error: any) {
      setErrorMessage(
        t(
          "Une erreur est survenue lors de la connexion",
          "An error occurred during login"
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === CAROUSEL_IMAGES.length - 1 ? 0 : prev + 1,
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="auth-page">
      {/* Form Section */}
      <div className="auth-form-section">
        <div className="auth-form-container">
          <div className="auth-logo">
            <img src="/images/busstation.png" alt="BusStation" />
          </div>

          <h1 className="auth-title">{t("Connexion BSM", "BSM sign in")}</h1>
          <p className="auth-subtitle">
            {t(
              "Accédez à votre espace administrateur",
              "Access your admin space"
            )}
          </p>

          {errorMessage && <p className="error-text">{errorMessage}</p>}

          <form onSubmit={handleSubmit} className="auth-form">
            <fieldset className="auth-fieldset">
              <legend>{t("Nom d'utilisateur *", "Username *")}</legend>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="auth-input"
              />
            </fieldset>

            <fieldset className="auth-fieldset">
              <legend>{t("Mot de passe *", "Password *")}</legend>
              <div className="auth-password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-password-toggle"
                >
                  {showPassword ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </fieldset>

            <button
              type="submit"
              disabled={isLoading}
              className="auth-submit-btn"
            >
              {isLoading ? t("Connexion...", "Signing in...") : t("Se connecter", "Sign in")}
            </button>
          </form>
        </div>
      </div>

      {/* Image Carousel Section */}
      <div className="auth-image-section">
        <div className="auth-carousel">
          <div
            className="auth-carousel-track"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {CAROUSEL_IMAGES.map((image, index) => (
              <div key={index} className="auth-carousel-slide">
                <Image
                  src={image}
                  alt={`Slide ${index + 1}`}
                  fill
                  style={{ objectFit: "cover" }}
                  quality={75}
                />
              </div>
            ))}
          </div>

          <div className="auth-carousel-dots">
            {CAROUSEL_IMAGES.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`auth-carousel-dot ${currentSlide === index ? "active" : ""}`}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
