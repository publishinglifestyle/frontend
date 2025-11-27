"use client";

import React, { useState, useMemo, useEffect } from "react";
import ErrorModal from "@/app/modals/errorModal";
import { initiatePasswordReset } from "@/managers/userManager";
import { getTranslations } from "../../managers/languageManager";
import { Translations } from "../../translations.d";

import SuccessModal from "../modals/successModal";

const ForgotPassword = ({ toggleToLogin }: { toggleToLogin: () => void }) => {
  const [translations, setTranslations] = useState<Translations | null>(null);

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState("");

  const validateEmail = (email: string): boolean =>
    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

  const isInvalidEmail = useMemo(
    () => (email === "" ? null : !validateEmail(email)),
    [email]
  );

  useEffect(() => {
    const detectLanguage = async () => {
      const browserLanguage = navigator.language;
      const translations = await getTranslations(browserLanguage);
      setTranslations(translations);
    };

    detectLanguage();
  }, []);

  const handleForgotPassword = async () => {
    try {
      setIsLoading(true);
      await initiatePasswordReset(email);
      setIsLoading(false);
      setEmail("");
      setIsSuccessModalOpen(true);
    } catch (e) {
      setIsLoading(false);
      const error = e as any;
      if (error.response) {
        setErrorModalMessage(error.response.data.response);
        setIsErrorModalOpen(true);
      }
    }
  };

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
        </div>
      ) : (
        <div className="bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-xl border border-purple-500/30 mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-400">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {translations?.reset_password || "Reset Password"}
            </h2>
            <p className="text-white/50 text-sm">
              {translations?.remember_your_password || "Remember your password?"}{" "}
              <button
                onClick={toggleToLogin}
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                Login
              </button>
            </p>
          </div>

          {/* Form */}
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

            <p className="text-white/40 text-xs">
              We'll send you a link to reset your password.
            </p>

            <button
              onClick={handleForgotPassword}
              disabled={!validateEmail(email)}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 disabled:from-zinc-600 disabled:to-zinc-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-200"
            >
              {translations?.reset_password || "Reset Password"}
            </button>

            <button
              onClick={toggleToLogin}
              className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl transition-all duration-200"
            >
              Back to Login
            </button>
          </div>
        </div>
      )}

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          toggleToLogin();
        }}
        message={translations?.password_reset_link_sent || "Password reset link sent to your email!"}
      />

      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        message={errorModalMessage}
      />
    </div>
  );
};

export default ForgotPassword;
