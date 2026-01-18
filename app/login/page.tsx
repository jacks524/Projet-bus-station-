"use client";

import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

/**
 * Login Page Component
 *
 * A responsive login page with username/password authentication
 * Features an image carousel on the right side
 *
 * @author Thomas Djotio Ndié
 * @date 2025-12-16
 */

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show_password, setShowPassword] = useState(false);
  const [remember_me, setRememberMe] = useState(false);
  const [current_slide, setCurrentSlide] = useState(0);
  const [is_loading, setIsLoading] = useState(false);
  const [error_message, setErrorMessage] = useState("");
  const router = useRouter();

  const CAROUSEL_IMAGES = [
    "/images/cameroun2___.jpg",
    "/images/cameroun3___.jpg",
    "/images/cameroun1___.jpg",
  ];
  const BUTTON_COLOR = "#6149CD";
  const TOTAL_SLIDES = CAROUSEL_IMAGES.length;
  const API_BASE_URL = "http://localhost:8081/api";

  const handleSubmit = async () => {
    setErrorMessage("");

    if (!username || !password) {
      setErrorMessage("Veuillez remplir tous les champs");
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

      if (response.status === 500) {
        setErrorMessage("Compte inexistant ou mot de passe incorrect");
        return;
      }

      if (!response.ok) {
        throw new Error("Identifiants incorrects");
      }

      const data = await response.json();

      if (remember_me) {
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("user_data", JSON.stringify(data));
      } else {
        sessionStorage.setItem("auth_token", data.token);
        sessionStorage.setItem("user_data", JSON.stringify(data));
      }

      const user_role = data.role[0];

      if (user_role == "BSM") {
        throw new Error("Une erreur est survenue lors de la connexion");
      }

      if (user_role === "USAGER") {
        router.push("/user/client/home");
      } else if (user_role === "AGENCE_VOYAGE") {
        router.push("/user/agency/dashboard");
      } else if (user_role === "ORGANISATION") {
        router.push("/user/organization/dashboard");
      } else {
        router.push("/");
      }
    } catch (error: any) {
      setErrorMessage("Une erreur est survenue lors de la connexion");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!show_password);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) =>
        prevSlide === TOTAL_SLIDES - 1 ? 0 : prevSlide + 1,
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [TOTAL_SLIDES]);

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-white">
        <div className="w-full max-w-lg">
          {/* Logo */}
          <div className="mb-16 lg:mb-20">
            <img
              src="/images/busstation.png"
              alt="SafaraPlace Logo"
              className="h-15 w-auto"
            />
          </div>

          {/* Title */}
          <h1 className="text-4xl lg:text-5xl font-normal text-gray-900 mb-3">
            Se connecter
          </h1>
          <p className="text-gray-600 mb-10 text-base">
            Accédez à votre espace personnel en toute sécurité
          </p>

          {/* Login Form */}
          <div className="space-y-5">
            {/* Error Message */}
            {error_message && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error_message}</p>
              </div>
            )}

            {/* username Field */}
            <fieldset className="h-15 border border-gray-500 rounded-lg px-4 pt-1 pb-3 hover:border-[#6149CD] focus-within:border-[#6149CD] transition-colors">
              <legend className="text-sm text-gray-700 px-2">
                Nom d'utilisateur *
              </legend>
              <input
                type="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full outline-none text-base text-black"
              />
            </fieldset>

            {/* Password Field */}
            <fieldset className="h-15 border border-gray-500 rounded-lg px-4 pt-1 pb-3 relative hover:border-[#6149CD] focus-within:border-[#6149CD] transition-colors">
              <legend className="text-sm text-gray-700 px-2">
                Mot de passe *
              </legend>
              <div className="flex items-center">
                <input
                  type={show_password ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full outline-none text-base pr-10 text-black"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="text-gray-600 hover:text-gray-800 focus:outline-none"
                >
                  {show_password ? (
                    <EyeOff className="w-6 h-6" />
                  ) : (
                    <Eye className="w-6 h-6" />
                  )}
                </button>
              </div>
            </fieldset>

            {/* Remember Me Checkbox */}
            <div className="flex items-center pt-1">
              <input
                id="remember_me"
                type="checkbox"
                checked={remember_me}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="appearance-none w-4 h-4 border border-gray-400 rounded focus:ring-[#6149CD] cursor-pointer checked:border-gray-400 checked:bg-[#6149CD]"
              />
              <label
                htmlFor="remember_me"
                className="ml-2.5 text-sm text-gray-900 cursor-pointer select-none"
              >
                Se souvenir de moi
              </label>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={is_loading}
              style={{ backgroundColor: BUTTON_COLOR }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="h-12 w-full text-black rounded-md font-bold hover:opacity-95 transition-opacity focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 mt-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {is_loading ? "Connexion en cours..." : "Se connecter"}
            </button>

            {/* Sign Up Link */}
            <div className="text-center text-sm text-gray-600 pt-2">
              Vous n'avez pas de compte?{" "}
              <a
                href="/signup"
                className="font-semibold text-gray-900 hover:underline"
              >
                S'inscrire
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Image Carousel */}
      <div className="hidden lg:block lg:w-1/2 bg-white">
        <div className="h-screen flex items-center justify-center p-8">
          <div className="relative w-full h-175 max-w-5xl overflow-hidden rounded-xl">
            {/* Carousel Images Container */}
            <div
              className="flex h-full transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${current_slide * 100}%)` }}
            >
              {CAROUSEL_IMAGES.map((image_path, index) => (
                <div key={index} className="min-w-full h-full relative">
                  <Image
                    src={image_path}
                    alt={`Slide ${index + 1}`}
                    fill
                    style={{ objectFit: "cover" }}
                    quality={75}
                  />
                </div>
              ))}
            </div>

            {/* Carousel Indicators */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {CAROUSEL_IMAGES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  style={{
                    backgroundColor:
                      current_slide === index
                        ? BUTTON_COLOR
                        : "rgba(255, 255, 255, 255)",
                    width: current_slide === index ? "32px" : "8px",
                  }}
                  className="h-2 rounded-full transition-all duration-300"
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
