"use client";

import ErrorModal from "@/app/modals/errorModal";
import Cookies from "js-cookie";
import { useEffect, useMemo, useState } from "react";

declare global {
  interface Window {
    PostAffTracker: any;
    endorsely_referral?: string;
  }
}

import { getTranslations } from "../../managers/languageManager";
import {
  getSubscriptions,
  startSubscription,
} from "../../managers/subscriptionManager";
import { logInGoogle, signUp } from "../../managers/userManager";
import { Translations } from "../../translations.d";
import { useAuth } from "../auth-context";
import { useRouter } from "next/navigation";

import SubscriptionOptions from "@/components/subscription-options";
import { Subscription } from "@/types/user.types";
import { useGoogleLogin } from "@react-oauth/google";
import { FaGoogle } from "react-icons/fa";
import { getEndorselyReferral } from "../../utils/endorsely";
import { getUtmData } from "../../utils/utm";

const SignUp = ({ toggleToLogin }: { toggleToLogin: () => void }) => {
  const router = useRouter();
  const [language, setLanguage] = useState("");
  const [translations, setTranslations] = useState<Translations | null>(null);
  const [affiliateId, setAffiliateId] = useState("");

  const { isAuthenticated: isAuthenticatedClient } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password_2, setPassword_2] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState("");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subscriptionsFetched, setSubscriptionsFetched] = useState(false);
  const [step, setStep] = useState(1);
  const [googleAuthToken, setGoogleAuthToken] = useState("");
  const { login } = useAuth();

  const validateEmail = (email: string): boolean =>
    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);
  const isInvalidEmail = useMemo(
    () => (email === "" ? null : !validateEmail(email)),
    [email]
  );

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const isInvalidPassword = useMemo(
    () => (password === "" ? null : !validatePassword(password)),
    [password]
  );

  const isInvalidPassword_2 = useMemo(() => {
    if (password_2 === "") return null;
    return password !== password_2 || !validatePassword(password_2)
      ? true
      : false;
  }, [password, password_2]);

  useEffect(() => {
    const detectLanguage = async () => {
      const browserLanguage = navigator.language;
      setLanguage(browserLanguage);
      const translations = await getTranslations(browserLanguage);
      setTranslations(translations);
    };

    detectLanguage();
  }, []);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://lowcontent.postaffiliatepro.com/scripts/lv5w3ke4j";
    script.async = true;
    script.id = "pap_x2s6df8d";
    document.body.appendChild(script);

    script.onload = () => {
      if (window.PostAffTracker) {
        try {
          window.PostAffTracker.setAccountId("default1");
          window.PostAffTracker.track();
          const papCookie =
            window.PostAffTracker._getAccountId() +
            window.PostAffTracker._cmanager.getVisitorIdOrSaleCookieValue();
          localStorage.setItem("affiliate_id", papCookie);
          setAffiliateId(papCookie);
        } catch (err) {
          console.error("Error capturing Post Affiliate Pro cookie:", err);
        }
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticatedClient) {
      window.location.href = "/chat";
    } else if (!subscriptionsFetched) {
      const fetchSubscriptions = async () => {
        try {
          const all_subscriptions = await getSubscriptions();
          const filteredSubscriptions = all_subscriptions.filter(
            (subscription: { type: string }) => subscription.type === "year"
          );
          setSubscriptions(filteredSubscriptions);
          setSubscriptionsFetched(true);
        } catch (error) {
          console.error("Failed to fetch subscriptions:", error);
        }
      };

      fetchSubscriptions();
    }
  }, [isAuthenticatedClient, subscriptionsFetched]);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        await signInWithGoogle(tokenResponse.access_token);
      } catch (error) {
        console.error("Failed to sign in with Google:", error);
      }
    },
  });

  const signInWithGoogle = async (access_token: string) => {
    try {
      setIsLoading(true);
      const { token, userExists } = await logInGoogle(access_token, "sign_up");

      if (userExists) {
        login(token);
        router.push("/chat");
        return;
      }
      setGoogleAuthToken(token);
      setStep(2);
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
      const error = e as any;
      console.log(error);
      if (error.response) {
        setErrorModalMessage(error.response.data.response);
        setIsErrorModalOpen(true);
      }
    }
  };

  const handleSignUp = async (price_id: string) => {
    try {
      let token;
      setIsLoading(true);

      if (!googleAuthToken) {
        const response = await signUp(
          firstName,
          lastName,
          email,
          password,
          password_2
        );
        token = response.token;
      } else {
        token = googleAuthToken;
      }

      Cookies.set("authToken", token, { expires: 1 });

      const affiliateId = localStorage.getItem("affiliate_id");
      console.log("affiliateId", affiliateId);

      const endorselyReferral = getEndorselyReferral();
      const utmData = getUtmData();
      console.log("utmData", utmData);

      const url = await startSubscription(token, price_id, affiliateId, endorselyReferral, utmData);
      window.location.href = url;
    } catch (e) {
      setIsLoading(false);
      const error = e as any;
      if (error.response) {
        setErrorModalMessage(error.response.data.response);
        setIsErrorModalOpen(true);
      }
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return translations?.sign_up || "Sign Up";
      case 2:
        return "Your Details";
      case 3:
        return "Choose Your Plan";
      default:
        return translations?.sign_up || "Sign Up";
    }
  };

  return (
    <div className={`w-full transition-all duration-300 ${step === 3 ? "max-w-4xl" : "max-w-md"}`}>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
        </div>
      ) : (
        <div className={`bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 backdrop-blur-xl rounded-2xl border border-white/10 ${step === 3 ? "p-6" : "p-8"}`}>
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">{getStepTitle()}</h2>
            {step === 1 && (
              <p className="text-white/50 text-sm">
                {translations?.already_have_an_account}{" "}
                <button
                  onClick={toggleToLogin}
                  className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  Login
                </button>
              </p>
            )}
            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2 mt-4">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-2 h-2 rounded-full transition-all ${
                    s === step
                      ? "w-6 bg-purple-500"
                      : s < step
                      ? "bg-purple-500/50"
                      : "bg-white/20"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Step 1: Email & Password */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  {translations?.enter_email || "Email"}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${
                    isInvalidEmail === true
                      ? "border-red-500/50"
                      : isInvalidEmail === false
                      ? "border-green-500/50"
                      : "border-white/10"
                  }`}
                  placeholder="Enter your email"
                />
                {isInvalidEmail && (
                  <p className="text-red-400 text-xs mt-1">
                    {translations?.enter_valid_email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  {translations?.enter_password || "Password"}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${
                    isInvalidPassword === true
                      ? "border-red-500/50"
                      : isInvalidPassword === false
                      ? "border-green-500/50"
                      : "border-white/10"
                  }`}
                  placeholder="Min. 8 characters"
                />
                {isInvalidPassword && (
                  <p className="text-red-400 text-xs mt-1">
                    {translations?.password_invalid_format_2}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  {translations?.re_enter_password || "Confirm Password"}
                </label>
                <input
                  type="password"
                  value={password_2}
                  onChange={(e) => setPassword_2(e.target.value)}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${
                    isInvalidPassword_2 === true
                      ? "border-red-500/50"
                      : isInvalidPassword_2 === false
                      ? "border-green-500/50"
                      : "border-white/10"
                  }`}
                  placeholder="Re-enter your password"
                />
                {isInvalidPassword_2 && (
                  <p className="text-red-400 text-xs mt-1">
                    {translations?.password_mismatch}
                  </p>
                )}
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={
                  !validateEmail(email) ||
                  !validatePassword(password) ||
                  !validatePassword(password_2) ||
                  password !== password_2
                }
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 disabled:from-zinc-600 disabled:to-zinc-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-200"
              >
                {translations?.next || "Next"}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-zinc-900 text-white/40">or</span>
                </div>
              </div>

              {/* Google Login */}
              <button
                onClick={() => googleLogin()}
                className="w-full py-3 px-4 bg-white hover:bg-gray-100 text-gray-800 font-medium rounded-xl flex items-center justify-center gap-3 transition-all duration-200"
              >
                <FaGoogle className="text-red-500" />
                Continue with Google
              </button>
            </div>
          )}

          {/* Step 2: Name */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Welcome Icon */}
              <div className="flex justify-center mb-2">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-400">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              </div>

              <p className="text-center text-white/50 text-sm mb-4">
                Let us know what to call you
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    {translations?.enter_first_name || "First Name"}
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${
                      firstName ? "border-green-500/50" : "border-white/10"
                    }`}
                    placeholder="John"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    {translations?.enter_last_name || "Last Name"}
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${
                      lastName ? "border-green-500/50" : "border-white/10"
                    }`}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={firstName === "" || lastName === ""}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 disabled:from-zinc-600 disabled:to-zinc-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {translations?.next || "Continue"}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Subscription */}
          {step === 3 && (
            <div>
              <button
                onClick={() => setStep(2)}
                className="mb-4 text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <SubscriptionOptions
                setIsLoading={setIsLoading}
                onClickOnSelectedSubscription={async (selectedSubscription) => {
                  await handleSignUp(selectedSubscription.price_id);
                }}
              />
            </div>
          )}
        </div>
      )}
      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        message={errorModalMessage}
      />
    </div>
  );
};

export default SignUp;
