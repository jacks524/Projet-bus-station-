"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/providers";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState("USAGER");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("MALE");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { t } = useLanguage();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const CAROUSEL_IMAGES = [
    "/images/landing2.jpg",
    "/images/landing3.jpg",
    "/images/landing.jpg",
  ];

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !username ||
      !password ||
      !confirmPassword
    ) {
      setErrorMessage(
        t("Veuillez remplir tous les champs", "Please fill in all fields"),
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(
        t("Les mots de passe ne correspondent pas", "Passwords do not match"),
      );
      return;
    }

    if (!acceptTerms) {
      setErrorMessage(
        t(
          "Veuillez accepter les conditions d'utilisation",
          "Please accept the terms of use"
        ),
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/utilisateur/inscription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
          email: email,
          last_name: lastName,
          first_name: firstName,
          phone_number: phone,
          role: [role],
          gender: gender,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.message || t("Une erreur est survenue", "An error occurred"),
        );
      }

      setSuccessMessage(
        t(
          "Compte créé avec succès ! Redirection...",
          "Account created successfully! Redirecting..."
        ),
      );
      setTimeout(() => router.push("/login"), 2000);
    } catch (error: any) {
      setErrorMessage(
        error.message ||
          t(
            "Une erreur est survenue lors de l'inscription",
            "An error occurred during signup"
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

  const passwordMatch =
    password && confirmPassword && password === confirmPassword;
  const passwordMismatch =
    password && confirmPassword && password !== confirmPassword;

  return (
    <div className="auth-page">
      {/* Form Section */}
      <div className="auth-form-section">
        <div className="auth-form-container">
          <div className="auth-logo">
            <img src="/images/busstation.png" alt="BusStation" />
          </div>

          <h1 className="auth-title">{t("S'inscrire", "Sign up")}</h1>
          <p className="auth-subtitle">
            {t(
              "Créez votre compte pour réserver vos voyages en ligne",
              "Create your account to book your trips online"
            )}
          </p>

          {errorMessage && <p className="error-text">{errorMessage}</p>}
          {successMessage && <p className="success-text">{successMessage}</p>}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Type de compte */}
            <div className="role-group">
              <label className="role-label">
                {t("Type de compte *", "Account type *")}
              </label>
              <div className="role-options">
                <label className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value="USAGER"
                    checked={role === "USAGER"}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  <span>{t("Client", "Customer")}</span>
                </label>

                <label className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value="AGENCE_VOYAGE"
                    checked={role === "AGENCE_VOYAGE"}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  <span>{t("Agence", "Agency")}</span>
                </label>

                <label className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value="ORGANISATION"
                    checked={role === "ORGANISATION"}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  <span>{t("Organisation", "Organization")}</span>
                </label>
              </div>
            </div>

            {/* Nom et Prénom */}
            <div className="form-row-2">
              <fieldset className="auth-fieldset">
                <legend>{t("Nom *", "Last name *")}</legend>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="auth-input"
                />
              </fieldset>

              <fieldset className="auth-fieldset">
                <legend>{t("Prénom *", "First name *")}</legend>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="auth-input"
                />
              </fieldset>
            </div>

            {/* Email et Téléphone */}
            <div className="form-row-2">
              <fieldset className="auth-fieldset">
                <legend>{t("Email *", "Email *")}</legend>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                />
              </fieldset>

              <fieldset className="auth-fieldset">
                <legend>{t("Téléphone *", "Phone *")}</legend>
                <div className="phone-input">
                  <span>{t("+237 🇨🇲", "+237 🇨🇲")}</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t("6XX XX XX XX", "6XX XX XX XX")}
                    maxLength={9}
                    className="auth-input"
                  />
                </div>
              </fieldset>
            </div>

            {/* Username */}
            <fieldset className="auth-fieldset">
              <legend>{t("Nom d'utilisateur *", "Username *")}</legend>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="auth-input"
              />
            </fieldset>

            {/* Genre */}
            <div className="gender-group">
              <label className="gender-label">{t("Genre *", "Gender *")}</label>
              <div className="gender-options">
                <label className="gender-option">
                  <input
                    type="radio"
                    name="gender"
                    value="MALE"
                    checked={gender === "MALE"}
                    onChange={(e) => setGender(e.target.value)}
                    className="gender-radio"
                  />
                  <span>{t("Masculin", "Male")}</span>
                </label>

                <label className="gender-option">
                  <input
                    type="radio"
                    name="gender"
                    value="FEMALE"
                    checked={gender === "FEMALE"}
                    onChange={(e) => setGender(e.target.value)}
                    className="gender-radio"
                  />
                  <span>{t("Féminin", "Female")}</span>
                </label>
              </div>
            </div>

            {/* Mots de passe */}
            <div className="form-row-2">
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

              <fieldset className="auth-fieldset">
                <legend>{t("Confirmation *", "Confirmation *")}</legend>
                <div className="auth-password-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="auth-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="auth-password-toggle"
                  >
                    {showConfirmPassword ? (
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
            </div>

            {/* Password match indicator */}
            {passwordMatch && (
              <p className="password-match">
                {t("Les mots de passe correspondent", "Passwords match")}
              </p>
            )}
            {passwordMismatch && (
              <p className="password-mismatch">
                {t("Les mots de passe ne correspondent pas", "Passwords do not match")}
              </p>
            )}

            {/* Terms */}
            <div className="auth-checkbox-wrapper">
              <input
                id="terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="auth-checkbox"
              />
              <label htmlFor="terms" className="auth-checkbox-label">
                {t("J'accepte les", "I accept the")}{" "}
                <a
                  onClick={() =>
                    window.open(
                      "https://www.termsfeed.com/live/2b6bd548-23a3-47e6-aee9-0e5dd0edb278",
                      "_blank",
                    )
                  }
                >
                  {t("Conditions d'utilisation", "Terms of use")}
                </a>{" "}
                {t("et la", "and the")}{" "}
                <a
                  onClick={() =>
                    window.open(
                      "https://www.termsfeed.com/live/2b6bd548-23a3-47e6-aee9-0e5dd0edb278",
                      "_blank",
                    )
                  }
                >
                  {t("Politique de confidentialité", "Privacy policy")}
                </a>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !acceptTerms}
              className="auth-submit-btn"
            >
              {isLoading
                ? t("Création du compte...", "Creating account...")
                : t("Créer votre compte", "Create your account")}
            </button>

            <p className="auth-link-text">
              {t("Vous avez déjà un compte ?", "Already have an account?")}{" "}
              <a href="/login">{t("Se connecter", "Sign in")}</a>
            </p>
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
