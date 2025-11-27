"use client";

import ErrorModal from "@/app/modals/errorModal";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { getTranslations } from "../../managers/languageManager";
import { logIn, logInGoogle } from "../../managers/userManager";
import { Translations } from "../../translations.d";
import { useAuth } from "../auth-context";

import { useGoogleLogin } from "@react-oauth/google";
import { FaGoogle } from "react-icons/fa";

type LoginProps = {
  toggleToSignUp: () => void;
  toggleToForgotPassword: () => void;
};

const Login: React.FC<LoginProps> = ({
  toggleToSignUp,
  toggleToForgotPassword,
}) => {
  const [translations, setTranslations] = useState<Translations | null>(null);

  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState("");

  const validateEmail = (email: string): boolean =>
    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

  const validatePassword = (password: string): boolean => password.length > 0;

  const isInvalidEmail = useMemo(
    () => (email === "" ? null : !validateEmail(email)),
    [email]
  );
  const isInvalidPassword = useMemo(
    () => (password === "" ? null : !validatePassword(password)),
    [password]
  );

  useEffect(() => {
    const detectLanguage = async () => {
      const browserLanguage = navigator.language;
      const translations = await getTranslations(browserLanguage);
      setTranslations(translations);
    };

    detectLanguage();
  }, []);

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
      const { token } = await logInGoogle(access_token, "login");
      login(token);
      router.push("/chat");
    } catch (e) {
      setIsLoading(false);
      const error = e as any;
      if (error.response) {
        setErrorModalMessage(error.response.data.response);
        setIsErrorModalOpen(true);
      }
    }
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const authToken = await logIn(email, password);
      login(authToken);
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
            <h2 className="text-2xl font-bold text-white mb-2">Login</h2>
            <p className="text-white/50 text-sm">
              {translations?.login_1}{" "}
              <button
                onClick={toggleToSignUp}
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                {translations?.sign_up}
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
                placeholder="Enter your password"
              />
            </div>

            <div className="text-right">
              <button
                onClick={toggleToForgotPassword}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                {translations?.forgot_password || "Forgot password?"}
              </button>
            </div>

            <button
              onClick={handleLogin}
              disabled={!validateEmail(email) || !validatePassword(password)}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 disabled:from-zinc-600 disabled:to-zinc-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-200"
            >
              Login
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

export default Login;
