"use client";

import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Check, X, Upload, User, Building2, MapPin } from "lucide-react";

/**
 * Signup Page Component with Multi-Role Support
 *
 * A responsive signup page supporting 3 user types:
 * - Client (default)
 * - Bus Station Manager
 * - Transport Company Manager
 *
 * @author Thomas Djotio Ndié
 * @date 2024-12-24
 */
export default function SignupPage() {
  // Account Type
  const [accountType, setAccountType] = useState<"client" | "bsm" | "company">(
    "client"
  );

  // Common Fields
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

  // Bus Station Manager Fields
  const [cniNumber, setCniNumber] = useState("");
  const [city, setCity] = useState("");
  const [busStationName, setBusStationName] = useState("");
  const [position, setPosition] = useState("");
  const [bsmDocument, setBsmDocument] = useState<File | null>(null);

  // Transport Company Manager Fields
  const [companyName, setCompanyName] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [companyRegistration, setCompanyRegistration] = useState("");
  const [managerIdentity, setManagerIdentity] = useState("");
  const [companyDocument, setCompanyDocument] = useState<File | null>(null);

  // Carousel
  const [currentSlide, setCurrentSlide] = useState(0);

  const CAROUSEL_IMAGES = [
    "/images/rectangle.png",
    "/images/rectangle.png",
    "/images/rectangle.png",
  ];
  const BUTTON_COLOR = "#6149CD";
  const TOTAL_SLIDES = CAROUSEL_IMAGES.length;

  const handleSubmit = () => {
    const baseData = {
      accountType,
      firstName,
      lastName,
      email,
      phone,
      username,
      acceptTerms,
    };

    let specificData = {};

    if (accountType === "bsm") {
      specificData = {
        cniNumber,
        city,
        busStationName,
        position,
        bsmDocument: bsmDocument?.name,
      };
    } else if (accountType === "company") {
      specificData = {
        companyName,
        taxNumber,
        companyRegistration,
        managerIdentity,
        companyDocument: companyDocument?.name,
      };
    }

    console.log("Signup attempt:", { ...baseData, ...specificData });
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "bsm" | "company"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === "bsm") {
        setBsmDocument(file);
      } else if (type === "company") {
        setCompanyDocument(file);
      }
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);
  const goToSlide = (index: number) => setCurrentSlide(index);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) =>
        prevSlide === TOTAL_SLIDES - 1 ? 0 : prevSlide + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [TOTAL_SLIDES]);

  const isFormValid = () => {
    const baseValid =
      Boolean(
        firstName &&
          lastName &&
          email &&
          phone &&
          username &&
          password &&
          confirmPassword &&
          acceptTerms
      ) && password === confirmPassword;
    
    if (accountType === "client") return baseValid;
    if (accountType === "bsm") {
      return (
        baseValid && Boolean(cniNumber && city && busStationName && position)
      );
    }
    if (accountType === "company") {
      return (
        baseValid &&
        Boolean(
          companyName && taxNumber && companyRegistration && managerIdentity
        ) &&
        Boolean(companyDocument)
      );
    }
    
    return false;
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Image Carousel */}
      <div className="hidden lg:block lg:w-1/2 bg-white">
        <div className="h-screen flex items-center justify-center p-8">
          <div className="relative w-full h-[700px] max-w-5xl overflow-hidden rounded-xl">
            <div
              className="flex h-full transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {CAROUSEL_IMAGES.map((image_path, index) => (
                <div key={index} className="min-w-full h-full relative bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">Image {index + 1}</span>
                </div>
              ))}
            </div>

            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {CAROUSEL_IMAGES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  style={{
                    backgroundColor: currentSlide === index ? BUTTON_COLOR : "rgba(255, 255, 255, 255)",
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-white overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Logo */}
          <div className="mb-8 lg:mb-10">  
              <img
                src="/images/safaraplace.png"
                alt="SafaraPlace Logo"
                className="h-15 w-auto"
              />
          </div>

          {/* Title */}
          <h1 className="text-4xl lg:text-5xl font-normal text-gray-900 mb-3">
            S&apos;inscrire
          </h1>
          <p className="text-gray-600 mb-8 text-base">
            Choisissez votre type de compte et complétez les informations requises.
          </p>

          {/* Account Type Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Type de compte
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => setAccountType("client")}
                className={`p-4 border-2 rounded-lg transition-all ${
                  accountType === "client"
                    ? "border-[#6149CD] bg-purple-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <User className={`w-6 h-6 mx-auto mb-2 ${accountType === "client" ? "text-[#6149CD]" : "text-gray-600"}`} />
                <div className="text-sm font-medium text-gray-900">Client</div>
              </button>

              <button
                onClick={() => setAccountType("bsm")}
                className={`p-4 border-2 rounded-lg transition-all ${
                  accountType === "bsm"
                    ? "border-[#6149CD] bg-purple-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <MapPin className={`w-6 h-6 mx-auto mb-2 ${accountType === "bsm" ? "text-[#6149CD]" : "text-gray-600"}`} />
                <div className="text-sm font-medium text-gray-900">Gérant de Gare</div>
              </button>

              <button
                onClick={() => setAccountType("company")}
                className={`p-4 border-2 rounded-lg transition-all ${
                  accountType === "company"
                    ? "border-[#6149CD] bg-purple-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <Building2 className={`w-6 h-6 mx-auto mb-2 ${accountType === "company" ? "text-[#6149CD]" : "text-gray-600"}`} />
                <div className="text-sm font-medium text-gray-900">Chef de Société</div>
              </button>
            </div>
          </div>

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
                Nom d&apos;utilisateur
              </legend>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full outline-none text-base text-black"
              />
            </fieldset>

            {/* Conditional Fields for Bus Station Manager */}
            {accountType === "bsm" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <fieldset className="h-15 border border-gray-500 rounded-lg px-4 pt-1 pb-3 hover:border-[#6149CD] focus-within:border-[#6149CD] transition-colors">
                    <legend className="text-sm text-gray-700 px-2">Numéro CNI</legend>
                    <input
                      type="text"
                      value={cniNumber}
                      onChange={(e) => setCniNumber(e.target.value)}
                      className="w-full outline-none text-base text-black"
                    />
                  </fieldset>

                  <fieldset className="h-15 border border-gray-500 rounded-lg px-4 pt-1 pb-3 hover:border-[#6149CD] focus-within:border-[#6149CD] transition-colors">
                    <legend className="text-sm text-gray-700 px-2">Ville de résidence</legend>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full outline-none text-base text-black"
                    />
                  </fieldset>
                </div>

                <fieldset className="h-15 border border-gray-500 rounded-lg px-4 pt-1 pb-3 hover:border-[#6149CD] focus-within:border-[#6149CD] transition-colors">
                  <legend className="text-sm text-gray-700 px-2">Nom de la gare routière</legend>
                  <input
                    type="text"
                    value={busStationName}
                    onChange={(e) => setBusStationName(e.target.value)}
                    className="w-full outline-none text-base text-black"
                  />
                </fieldset>

                <fieldset className="h-15 border border-gray-500 rounded-lg px-4 pt-1 pb-3 hover:border-[#6149CD] focus-within:border-[#6149CD] transition-colors">
                  <legend className="text-sm text-gray-700 px-2">Fonction/Poste</legend>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Ex: Gérant, Manager, Superviseur"
                    className="w-full outline-none text-base text-black placeholder:text-gray-400"
                  />
                </fieldset>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-[#6149CD] transition-colors">
                  <label className="flex flex-col items-center cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600 text-center mb-1">
                      Document d&apos;autorisation (optionnel)
                    </span>
                    <span className="text-xs text-gray-500 text-center">
                      Lettre de la gare ou attestation de travail
                    </span>
                    <input
                      type="file"
                      onChange={(e) => handleFileUpload(e, "bsm")}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                    />
                  </label>
                  {bsmDocument && (
                    <div className="mt-3 text-sm text-green-600 text-center">
                      ✓ {bsmDocument.name}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Conditional Fields for Transport Company Manager */}
            {accountType === "company" && (
              <>
                <fieldset className="h-15 border border-gray-500 rounded-lg px-4 pt-1 pb-3 hover:border-[#6149CD] focus-within:border-[#6149CD] transition-colors">
                  <legend className="text-sm text-gray-700 px-2">Nom de la société</legend>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full outline-none text-base text-black"
                  />
                </fieldset>

                <div className="grid grid-cols-2 gap-4">
                  <fieldset className="h-15 border border-gray-500 rounded-lg px-4 pt-1 pb-3 hover:border-[#6149CD] focus-within:border-[#6149CD] transition-colors">
                    <legend className="text-sm text-gray-700 px-2">Numéro de contribuable</legend>
                    <input
                      type="text"
                      value={taxNumber}
                      onChange={(e) => setTaxNumber(e.target.value)}
                      className="w-full outline-none text-base text-black"
                    />
                  </fieldset>

                  <fieldset className="h-15 border border-gray-500 rounded-lg px-4 pt-1 pb-3 hover:border-[#6149CD] focus-within:border-[#6149CD] transition-colors">
                  <legend className="text-sm text-gray-700 px-2">
                    Matricule d&apos;entreprise
                  </legend>
                    <input
                      type="text"
                      value={companyRegistration}
                      onChange={(e) => setCompanyRegistration(e.target.value)}
                      className="w-full outline-none text-base text-black"
                    />
                  </fieldset>
                </div>

                <fieldset className="h-15 border border-gray-500 rounded-lg px-4 pt-1 pb-3 hover:border-[#6149CD] focus-within:border-[#6149CD] transition-colors">
                  <legend className="text-sm text-gray-700 px-2">Identité du chef de société</legend>
                  <input
                    type="text"
                    value={managerIdentity}
                    onChange={(e) => setManagerIdentity(e.target.value)}
                    placeholder="CNI ou Passeport"
                    className="w-full outline-none text-base text-black placeholder:text-gray-400"
                  />
                </fieldset>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-[#6149CD] transition-colors">
                  <label className="flex flex-col items-center cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600 text-center mb-1">
                      Document du Ministère des Transports *
                    </span>
                    <span className="text-xs text-gray-500 text-center">
                      Attestation de reconnaissance officielle
                    </span>
                    <input
                      type="file"
                      onChange={(e) => handleFileUpload(e, "company")}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                    />
                  </label>
                  {companyDocument && (
                    <div className="mt-3 text-sm text-green-600 text-center">
                      ✓ {companyDocument.name}
                    </div>
                  )}
                </div>
              </>
            )}

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
            </div>

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
                J&apos;accepte l&apos;ensemble des{" "}
                <a href="#" className="font-bold text-gray-900 hover:underline">
                  Conditions d&apos;utilisation
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
                backgroundColor: isFormValid() ? BUTTON_COLOR : "#D1D5DB",
                cursor: isFormValid() ? "pointer" : "not-allowed",
              }}
              disabled={!isFormValid()}
              className="h-12 w-full text-white rounded-md font-bold hover:opacity-95 transition-opacity focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
