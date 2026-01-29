"use client";

import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Check,
  X,
  Upload,
  User,
  Building2,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLanguage } from "../providers";

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
  const [gender, setGender] = useState("MALE");
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
  const [is_loading, setIsLoading] = useState(false);
  const [error_message, setErrorMessage] = useState("");
  const [success_message, setSuccessMessage] = useState("");
  const router = useRouter();
  const { t } = useLanguage();

  const CAROUSEL_IMAGES = [
    "/images/siege1.jpg",
    "/images/cameroun2___.jpg",
    "/images/siege4.jpg",
  ];
  const BUTTON_COLOR = "#6149CD";
  const TOTAL_SLIDES = CAROUSEL_IMAGES.length;
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleSubmit = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!isFormValid()) {
      setErrorMessage(t("Veuillez remplir tous les champs", "Please fill in all fields"));
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(t("Les mots de passe ne correspondent pas", "Passwords do not match"));
      return;
    }

    if (!acceptTerms) {
      setErrorMessage(t("Veuillez accepter les conditions d'utilisation", "Please accept the terms of use"));
      return;
    }

    setIsLoading(true);

    const role_map = {
      client: "USAGER",
      bsm: "BSM",
      company: "ORGANISATION",
    } as const;

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
          role: [role_map[accountType]],
          gender: gender,
        }),
      });

      if (!response.ok) {
        const error_data = await response.json();
        throw new Error(
          error_data.message || t("Une erreur est survenue lors de l'inscription", "An error occurred during signup"),
        );
      }

      await response.json();

      setSuccessMessage(
        t(
          "Compte créé avec succès ! Redirection dans quelques instants...",
          "Account created successfully! Redirecting shortly..."
        )
      );

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: any) {
      setErrorMessage(t("Une erreur est survenue lors de l'inscription", "An error occurred during signup"));
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
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
        prevSlide === TOTAL_SLIDES - 1 ? 0 : prevSlide + 1,
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
          gender &&
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
          <div className="relative w-full h-175 max-w-5xl overflow-hidden rounded-xl">
            {/* Carousel Images Container */}
            <div
              className="flex h-full transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {CAROUSEL_IMAGES.map((image_path, index) => (
                <div key={index} className="min-w-full h-full relative">
                  <Image
                    src={image_path}
                    alt={t(`Diapositive ${index + 1}`, `Slide ${index + 1}`)}
                    fill
                    style={{ objectFit: "cover" }}
                    quality={75}
                  />
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
                  aria-label={t(`Aller à la diapositive ${index + 1}`, `Go to slide ${index + 1}`)}
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
          <div className="mb-10 lg:mb-12">
            <img
              src="/images/busstation.png"
              alt="BusStation Logo"
              className="h-15 w-auto"
            />
          </div>

          {/* Title */}
          <h1 className="text-4xl lg:text-5xl font-normal text-gray-900 mb-3">
            {t("S'inscrire", "Sign up")}
          </h1>
          <p className="text-gray-600 mb-8 text-base">
            {t(
              "Choisissez votre type de compte et complétez les informations requises.",
              "Choose your account type and complete the required information."
            )}
          </p>

          {/* Account Type Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t("Type de compte", "Account type")}
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
                <div className="text-sm font-medium text-gray-900">
                  {t("Client", "Client")}
                </div>
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
                <div className="text-sm font-medium text-gray-900">
                  {t("Gérant de Gare", "Station manager")}
                </div>
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
                <div className="text-sm font-medium text-gray-900">
                  {t("Chef de Société", "Company manager")}
                </div>
              </button>
            </div>
          </div>

          {/* Signup Form */}
          <div className="space-y-5">
            {/* Error Message */}
            {error_message && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error_message}</p>
              </div>
            )}

            {/* Success Message */}
            {success_message && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">{success_message}</p>
              </div>
            )}

            {/* First Name and Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <fieldset className="h-15 border border-gray-500 rounded-lg px-4 pt-1 pb-3 hover:border-[#6149CD] focus-within:border-[#6149CD] transition-colors">
                <legend className="text-sm text-gray-700 px-2">
                  {t("Nom *", "Last name *")}
                </legend>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full outline-none text-base text-black"
                />
              </fieldset>

              <fieldset className="h-15 border border-gray-500 rounded-lg px-4 pt-1 pb-3 hover:border-[#6149CD] focus-within:border-[#6149CD] transition-colors">
                <legend className="text-sm text-gray-700 px-2">
                  {t("Prénom *", "First name *")}
                </legend>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full outline-none text-base text-black"
                />
              </fieldset>
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-2 gap-4">
              <fieldset className="h-15 border border-gray-500 rounded-lg px-4 pt-1 pb-3 hover:border-[#6149CD] focus-within:border-[#6149CD] transition-colors">
                <legend className="text-sm text-gray-700 px-2">
                  {t("Email *", "Email *")}
                </legend>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full outline-none text-base text-black"
                />
              </fieldset>

              <fieldset className="h-15 border border-gray-500 rounded-lg px-4 pt-1 pb-3 hover:border-[#6149CD] focus-within:border-[#6149CD] transition-colors">
                <legend className="text-sm text-gray-700 px-2">
                  {t("Numéro *", "Phone *")}
                </legend>
                <div className="flex items-center gap-2">
                  <span className="text-base text-gray-900 font-medium shrink-0">
                    +237 🇨🇲
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t("6XX XX XX XX", "6XX XX XX XX")}
                    maxLength={9}
                    className="w-full outline-none text-base text-black"
                  />
                </div>
              </fieldset>
            </div>

            {/* Username */}
            <fieldset className="h-15 border border-gray-500 rounded-lg px-4 pt-1 pb-3 hover:border-[#6149CD] focus-within:border-[#6149CD] transition-colors">
              <legend className="text-sm text-gray-700 px-2">
                {t("Nom d'utilisateur *", "Username *")}
              </legend>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full outline-none text-base text-black"
              />
            </fieldset>

            {/* Gender */}
            <div className="space-y-2">
              <label className="text-sm text-gray-700">
                {t("Genre *", "Gender *")}
              </label>
              <div className="flex gap-6">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="gender"
                    value="MALE"
                    checked={gender === "MALE"}
                    onChange={(e) => setGender(e.target.value)}
                    className="appearance-none w-5 h-5 border-2 border-gray-400 rounded-full cursor-pointer checked:bg-[#6149CD] checked:border-gray-400 outline-none"
                  />
                  <span className="text-base text-gray-900 group-hover:text-[#6149CD] transition-colors">
                    {t("Masculin", "Male")}
                  </span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="gender"
                    value="FEMALE"
                    checked={gender === "FEMALE"}
                    onChange={(e) => setGender(e.target.value)}
                    className="appearance-none w-5 h-5 border-2 border-gray-400 rounded-full cursor-pointer checked:bg-[#6149CD] checked:border-gray-400 outline-none"
                  />
                  <span className="text-base text-gray-900 group-hover:text-[#6149CD] transition-colors">
                    {t("Féminin", "Female")}
                  </span>
                </label>
              </div>
            </div>

            {/* Conditional Fields for Bus Station Manager */}
            {accountType === "bsm" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <fieldset className="h-15 border border-gray-500 rounded-lg px-4 pt-1 pb-3 hover:border-[#6149CD] focus-within:border-[#6149CD] transition-colors">
                    <legend className="text-sm text-gray-700 px-2">
                      {t("Numéro CNI", "National ID number")}
                    </legend>
                    <input
                      type="text"
                      value={cniNumber}
                      onChange={(e) => setCniNumber(e.target.value)}
                      className="w-full outline-none text-base text-black"
                    />
                  </fieldset>

                  <fieldset className="h-15 border border-gray-500 rounded-lg px-4 pt-1 pb-3 hover:border-[#6149CD] focus-within:border-[#6149CD] transition-colors">
                    <legend className="text-sm text-gray-700 px-2">
                      {t("Ville de résidence", "City of residence")}
                    </legend>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full outline-none text-base text-black"
                    />
                  </fieldset>
                </div>

                <fieldset className="h-15 border border-gray-500 rounded-lg px-4 pt-1 pb-3 hover:border-[#6149CD] focus-within:border-[#6149CD] transition-colors">
                  <legend className="text-sm text-gray-700 px-2">
                    {t("Nom de la gare routière", "Bus station name")}
                  </legend>
                  <input
                    type="text"
                    value={busStationName}
                    onChange={(e) => setBusStationName(e.target.value)}
                    className="w-full outline-none text-base text-black"
                  />
                </fieldset>

                <fieldset className="h-15 border border-gray-500 rounded-lg px-4 pt-1 pb-3 hover:border-[#6149CD] focus-within:border-[#6149CD] transition-colors">
                  <legend className="text-sm text-gray-700 px-2">
                    {t("Fonction/Poste", "Position/Role")}
                  </legend>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder={t("Ex: Gérant, Manager, Superviseur", "e.g. Manager, Supervisor")}
                    className="w-full outline-none text-base text-black placeholder:text-gray-400"
                  />
                </fieldset>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-[#6149CD] transition-colors">
                  <label className="flex flex-col items-center cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600 text-center mb-1">
                      {t("Document d'autorisation (optionnel)", "Authorization document (optional)")}
                    </span>
                    <span className="text-xs text-gray-500 text-center">
                      {t("Lettre de la gare ou attestation de travail", "Station letter or work certificate")}
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
                <legend className="text-sm text-gray-700 px-2">
                  {t("Nom de la société", "Company name")}
                </legend>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full outline-none text-base text-black"
                  />
                </fieldset>

                <div className="grid grid-cols-2 gap-4">
                  <fieldset className="h-15 border border-gray-500 rounded-lg px-4 pt-1 pb-3 hover:border-[#6149CD] focus-within:border-[#6149CD] transition-colors">
                    <legend className="text-sm text-gray-700 px-2">
                      {t("Numéro de contribuable", "Taxpayer number")}
                    </legend>
                    <input
                      type="text"
                      value={taxNumber}
                      onChange={(e) => setTaxNumber(e.target.value)}
                      className="w-full outline-none text-base text-black"
                    />
                  </fieldset>

                  <fieldset className="h-15 border border-gray-500 rounded-lg px-4 pt-1 pb-3 hover:border-[#6149CD] focus-within:border-[#6149CD] transition-colors">
                  <legend className="text-sm text-gray-700 px-2">
                    {t("Matricule d'entreprise", "Company registration number")}
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
                  <legend className="text-sm text-gray-700 px-2">
                    {t("Identité du chef de société", "Company manager ID")}
                  </legend>
                  <input
                    type="text"
                    value={managerIdentity}
                    onChange={(e) => setManagerIdentity(e.target.value)}
                    placeholder={t("CNI ou Passeport", "National ID or Passport")}
                    className="w-full outline-none text-base text-black placeholder:text-gray-400"
                  />
                </fieldset>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-[#6149CD] transition-colors">
                  <label className="flex flex-col items-center cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600 text-center mb-1">
                      {t("Document du Ministère des Transports *", "Ministry of Transport document *")}
                    </span>
                    <span className="text-xs text-gray-500 text-center">
                      {t("Attestation de reconnaissance officielle", "Official recognition certificate")}
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
                  {t("Mot de passe *", "Password *")}
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
                  {t("Confirmation", "Confirm")}
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
                      {t("Les mots de passe correspondent", "Passwords match")}
                    </span>
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 text-red-500 mr-2 shrink-0" />
                    <span className="text-red-600 whitespace-nowrap">
                      {t("Les mots de passe ne correspondent pas", "Passwords do not match")}
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
                className="appearance-none w-4 h-4 border border-gray-400 rounded focus:ring-[#6149CD] cursor-pointer checked:border-gray-400 checked:bg-[#6149CD] mt-1"
              />
              <label
                htmlFor="accept_terms"
                className="ml-2.5 text-sm text-gray-900 cursor-pointer select-none"
              >
                {t("J'accepte l'ensemble des", "I accept the")}{" "}
                <a href="#" className="font-bold text-gray-900 hover:underline">
                  {t("Conditions d'utilisation", "Terms of use")}
                </a>{" "}
                {t("et des", "and the")}{" "}
                <a href="#" className="font-bold text-gray-900 hover:underline">
                  {t("Politiques de confidentialité", "Privacy policies")}
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!isFormValid() || is_loading}
              style={{
                backgroundColor:
                  isFormValid() && !is_loading ? BUTTON_COLOR : "#D1D5DB",
                cursor:
                  isFormValid() && !is_loading ? "pointer" : "not-allowed",
              }}
              className="h-12 w-full text-white rounded-md font-bold hover:opacity-95 transition-opacity focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {is_loading ? t("Création du compte...", "Creating account...") : t("Créer votre compte", "Create your account")}
            </button>

            {/* Login Link */}
            <div className="text-center text-sm text-gray-600 pt-2">
              {t("Vous avez déjà un compte?", "Already have an account?")}{" "}
              <a
                href="/login"
                className="font-bold text-gray-900 hover:underline"
              >
                {t("Se connecter", "Sign in")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
