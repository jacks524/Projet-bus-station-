"use client";

import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import Image from "next/image";

/**
 * Signup Page Component
 *
 * A responsive signup page with user registration form
 * Features an image carousel on the left side
 *
 * @author Thomas Djotio Ndié
 * @date 2025-12-16
 */
export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const CAROUSEL_IMAGES = [
    "/images/rectangle.png",
    "/images/rectangle.png",
    "/images/rectangle.png",
  ];
  const BUTTON_COLOR = "#6149CD";
  const TOTAL_SLIDES = CAROUSEL_IMAGES.length;

  const handleSubmit = () => {
    console.log("Signup attempt:", {
      firstName,
      lastName,
      email,
      username,
      acceptTerms,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) =>
        prevSlide === TOTAL_SLIDES - 1 ? 0 : prevSlide + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [TOTAL_SLIDES]);

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Image Carousel */}
      <div className="hidden lg:block lg:w-1/2 bg-white">
        <div className="h-screen flex items-center justify-center p-8">
          <div className="relative w-full h-[700px] max-w-5xl overflow-hidden rounded-xl">
            {/* Carousel Images Container */}
            <div
              className="flex h-full transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
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
                      currentSlide === index
                        ? BUTTON_COLOR
                        : "rgba(255, 255, 255, 255)",
                    width: currentSlide === index ? "32px" : "8px",
                  }}
                  className="h-2 rounded-full transition-all duration-300"
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-white">
        <div className="w-full max-w-lg">
          {/* Logo */}
          <div className="mb-10 lg:mb-12">
            <img
              src="/images/safaraplace.png"
              alt="SafaraPlace Logo"
              className="h-15 w-auto"
            />
          </div>

          {/* Title */}
          <h1 className="text-4xl lg:text-5xl font-normal text-gray-900 mb-3">
            S'inscrire
          </h1>
          <p className="text-gray-600 mb-8 text-base">
            Mettons tout en place pour que vous puissiez accéder à votre compte
            personnel.
          </p>

          {/* Signup Form */}
          <div className="space-y-5">
            {/* First Name and Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <fieldset className="h-15 border border-gray-500 rounded-lg px-4 pt-1 pb-3 hover:border-[#6149CD] focus-within:border-[#6149CD] transition-colors">
                <legend className="text-sm text-gray-700 px-2">Nom</legend>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full outline-none text-base text-black"
                />
              </fieldset>

              <fieldset className="h-15 border border-gray-500 rounded-lg px-4 pt-1 pb-3 hover:border-[#6149CD] focus-within:border-[#6149CD] transition-colors">
                <legend className="text-sm text-gray-700 px-2">Prénom</legend>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full outline-none text-base text-black"
                />
              </fieldset>
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-2 gap-4">
              <fieldset className="h-15 border border-gray-500 rounded-lg px-4 pt-1 pb-3 hover:border-[#6149CD] focus-within:border-[#6149CD] transition-colors">
                <legend className="text-sm text-gray-700 px-2">Email</legend>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full outline-none text-base text-black"
                />
              </fieldset>

              <fieldset className="h-15 border border-gray-500 rounded-lg px-4 pt-1 pb-3 hover:border-[#6149CD] focus-within:border-[#6149CD] transition-colors">
                <legend className="text-sm text-gray-700 px-2">
                  Numéro de téléphone
                </legend>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full outline-none text-base text-black"
                />
              </fieldset>
            </div>

            {/* Username */}
            <fieldset className="h-15 border border-gray-500 rounded-lg px-4 pt-1 pb-3 hover:border-[#6149CD] focus-within:border-[#6149CD] transition-colors">
              <legend className="text-sm text-gray-700 px-2">
                Nom d'utilisateur
              </legend>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full outline-none text-base text-black"
              />
            </fieldset>

            {/* Password and Confirm Password */}
            <div className="grid grid-cols-2 gap-4">
              <fieldset className="h-15 border border-gray-500 rounded-lg px-4 pt-1 pb-3 relative hover:border-[#6149CD] focus-within:border-[#6149CD] transition-colors">
                <legend className="text-sm text-gray-700 px-2">
                  Mot de passe
                </legend>
                <div className="flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full outline-none text-base pr-10 text-black"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="text-gray-600 hover:text-gray-800 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-6 h-6" />
                    ) : (
                      <Eye className="w-6 h-6" />
                    )}
                  </button>
                </div>
              </fieldset>

              <fieldset className="h-15 border border-gray-500 rounded-lg px-4 pt-1 pb-3 relative hover:border-[#6149CD] focus-within:border-[#6149CD] transition-colors">
                <legend className="text-sm text-gray-700 px-2">
                  Confirmer votre mot de passe
                </legend>
                <div className="flex items-center">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full outline-none text-base pr-10 text-black"
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="text-gray-600 hover:text-gray-800 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-6 h-6" />
                    ) : (
                      <Eye className="w-6 h-6" />
                    )}
                  </button>
                </div>
              </fieldset>

              {/* Password Match Indicator */}
              {password && confirmPassword && (
                <div className="flex items-center text-sm">
                  {password === confirmPassword ? (
                    <>
                      <Check className="w-4 h-4 text-green-500 mr-2 shrink-0" />
                      <span className="text-green-600 whitespace-nowrap">
                        Les mots de passe correspondent
                      </span>
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4 text-red-500 mr-2 shrink-0" />
                      <span className="text-red-600 whitespace-nowrap">
                        Les mots de passe ne correspondent pas
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start pt-2">
              <input
                id="accept_terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="w-4 h-4 border-2 border-gray-400 rounded focus:ring-[#6149CD] cursor-pointer checked:border-[#6149CD] checked:bg-[#6149CD] mt-1"
              />
              <label
                htmlFor="accept_terms"
                className="ml-2.5 text-sm text-gray-900 cursor-pointer select-none"
              >
                J'accepte l'ensemble des{" "}
                <a href="#" className="font-bold text-gray-900 hover:underline">
                  Conditions d'utilisation
                </a>{" "}
                et des{" "}
                <a href="#" className="font-bold text-gray-900 hover:underline">
                  Politiques de confidentialité
                </a>
              </label>
            </div>


            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              style={{
                backgroundColor: acceptTerms ? BUTTON_COLOR : "#D1D5DB",
                cursor: acceptTerms ? "pointer" : "not-allowed",
              }}
              disabled={!acceptTerms}
              className="h-12 w-full text-black rounded-md font-bold hover:opacity-95 transition-opacity focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              Créer votre compte
            </button>

            {/* Login Link */}
            <div className="text-center text-sm text-gray-600 pt-2">
              Vous avez déjà un compte?{" "}
              <a
                href="/login"
                className="font-bold text-gray-900 hover:underline"
              >
                Se connecter
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
