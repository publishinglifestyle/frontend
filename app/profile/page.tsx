"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "../auth-context";
import { getTranslations } from "../../managers/languageManager";
import { Translations } from "../../translations.d";
import { buyCredits } from "@/managers/creditsManager";
import { getPortal, getSubscription } from "@/managers/subscriptionManager";
import {
  deleteUser,
  getUser,
  updateProfile,
  uploadProfilePic,
} from "@/managers/userManager";

import ConfirmModal from "@/app/modals/confirmModal";
import CreditsModal from "@/app/modals/creditsModal";
import ErrorModal from "@/app/modals/errorModal";
import PasswordModal from "@/app/modals/passwordModal";
import SubscriptionModal from "../modals/subscriptionModal";
import SuccessModal from "../modals/successModal";

// Icons
const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CreditCardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const LockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const CameraIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const SparklesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
  </svg>
);

const ProfileIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// Loading Spinner
const LoadingSpinner = () => (
  <div className="h-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
      <p className="text-white/50 text-sm">Loading profile...</p>
    </div>
  </div>
);

// Custom Input Component
const CustomInput = ({ label, disabled, ...props }: { label: string; disabled?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-white/70">{label}</label>
    <input
      {...props}
      disabled={disabled}
      className={`
        w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40
        focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all duration-200
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    />
  </div>
);

export default function ProfilePage() {
  const [translations, setTranslations] = useState<Translations | null>(null);
  const router = useRouter();
  const { isAuthenticated: isAuthenticatedClient, logout, user, profilePic, setProfilePic } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [subscriptionActive, setSubscriptionActive] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [credits, setCredits] = useState("");

  const [initialFirstName, setInitialFirstName] = useState("");
  const [initialLastName, setInitialLastName] = useState("");
  const [initialEmail, setInitialEmail] = useState("");

  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCreditsModalOpen, setIsCreditsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  useEffect(() => {
    const detectLanguage = async () => {
      const browserLanguage = navigator.language;
      const translations = await getTranslations(browserLanguage);

      setTranslations(translations);
    };

    detectLanguage();
  }, []);

  useEffect(() => {
    if (!user) return;
    setInitialEmail(user.email);
    setInitialFirstName(user.first_name);
    setInitialLastName(user.last_name);
  }, [user]);

  useEffect(() => {
    if (!isAuthenticatedClient) {
      router.push("/");
    }

    if (window.location.href.includes("session_id")) {
      setIsSuccessModalOpen(true);
    }
  }, [isAuthenticatedClient, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const result = await getUser();

        setFirstName(result.first_name);
        setLastName(result.last_name);
        setEmail(result.email);

        setInitialFirstName(result.first_name);
        setInitialLastName(result.last_name);
        setInitialEmail(result.email);

        const current_subscription = await getSubscription();

        setSubscriptionActive(current_subscription.is_active);
        setCredits(current_subscription.credits);

        setIsLoading(false);
      } catch {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateUserProfile = async () => {
    try {
      await updateProfile(firstName, lastName, email);
      setIsEdit(false);
      window.location.reload();
    } catch (e) {
      setIsLoading(false);
      const error = e as { response?: { data: string } };

      if (error.response) {
        setErrorModalMessage(error.response.data);
        setIsErrorModalOpen(true);
      }
    }
  };

  const deleteUserProfile = async () => {
    setIsConfirmModalOpen(false);

    try {
      setIsLoading(true);
      await deleteUser();
      logout();
      router.push("/");
    } catch (e) {
      setIsLoading(false);
      const error = e as { response?: { data: string } };

      if (error.response) {
        setErrorModalMessage(error.response.data);
        setIsErrorModalOpen(true);
      }
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();

        reader.onloadend = () => {
          setProfilePic(reader.result as string);
        };
        reader.readAsDataURL(file);

        try {
          setIsLoading(true);
          await uploadProfilePic(file);
          setIsEdit(false);
          window.location.reload();
        } catch (err) {
          setIsLoading(false);
          const error = err as { response?: { data: string } };

          if (error.response) {
            setErrorModalMessage(error.response.data);
            setIsErrorModalOpen(true);
          }
        }
      }
    }
  };

  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  const handleCancel = () => {
    setIsEdit(false);
    setFirstName(initialFirstName);
    setLastName(initialLastName);
    setEmail(initialEmail);
  };

  const handlePurchase = async (selectedOption: string) => {
    const url = await buyCredits(parseInt(selectedOption));

    window.open(url, "_blank");
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="h-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-black px-4 py-4 md:px-6 overflow-auto">
      {/* Background Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mb-5"
          initial={{ opacity: 0, y: -20 }}
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30 text-purple-400">
              <ProfileIcon />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {translations?.my_profile || "My Profile"}
              </h1>
              <p className="text-white/60">
                Manage your account settings and subscription
              </p>
            </div>
          </div>
        </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Card */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.1 }}
        >
          {/* Card Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-xl flex items-center justify-center border border-purple-500/30 text-purple-400">
                <UserIcon />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Account</h2>
                <p className="text-sm text-white/50">Personal information</p>
              </div>
            </div>
            {!isEdit && (
              <button
                className="p-2 rounded-xl hover:bg-white/10 transition-colors text-purple-400"
                onClick={() => setIsEdit(true)}
              >
                <EditIcon />
              </button>
            )}
          </div>

          {/* Card Body */}
          <div className="p-6 space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center gap-4">
              <div
                className="relative group"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="Profile"
                    className="w-full h-full object-cover"
                    src={profilePic ?? "/profile.png"}
                  />
                </div>
                {isEdit && isHovering && (
                  <button
                    className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl transition-opacity"
                    onClick={handleIconClick}
                  >
                    <CameraIcon />
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  type="file"
                />
              </div>
              <div>
                <p className="text-white font-medium">{firstName} {lastName}</p>
                <p className="text-white/50 text-sm">{email}</p>
              </div>
            </div>

            {/* Form Fields */}
            {isEdit ? (
              <div className="space-y-4">
                <CustomInput
                  label={translations?.first_name || "First Name"}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={translations?.enter_first_name || "Enter first name"}
                  type="text"
                  value={firstName}
                />
                <CustomInput
                  label={translations?.last_name || "Last Name"}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={translations?.enter_last_name || "Enter last name"}
                  type="text"
                  value={lastName}
                />
                <CustomInput
                  disabled
                  label="Email"
                  placeholder="Email address"
                  type="email"
                  value={email}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-white/50 text-sm">{translations?.first_name || "First Name"}</span>
                  <span className="text-white font-medium">{firstName}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-white/50 text-sm">{translations?.last_name || "Last Name"}</span>
                  <span className="text-white font-medium">{lastName}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-white/50 text-sm">Email</span>
                  <span className="text-white font-medium">{email}</span>
                </div>
              </div>
            )}
          </div>

          {/* Card Footer */}
          {isEdit && (
            <div className="p-6 border-t border-white/10 flex gap-3">
              <button
                className="flex-1 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all duration-200"
                onClick={handleCancel}
              >
                {translations?.cancel || "Cancel"}
              </button>
              <button
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-medium transition-all duration-200 shadow-lg shadow-purple-500/25"
                onClick={updateUserProfile}
              >
                {translations?.update || "Update"}
              </button>
            </div>
          )}
        </motion.div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Subscription Card */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.2 }}
          >
            {/* Card Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-xl flex items-center justify-center border border-purple-500/30 text-purple-400">
                  <CreditCardIcon />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">{translations?.my_plan || "My Plan"}</h2>
                  <p className="text-sm text-white/50">Subscription & credits</p>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${subscriptionActive ? 'bg-green-500' : 'bg-orange-500'}`} />
                  <span className="text-white/70">{translations?.status || "Status"}</span>
                </div>
                <span className={`font-semibold ${subscriptionActive ? 'text-green-400' : 'text-orange-400'}`}>
                  {subscriptionActive ? (translations?.active || "Active") : (translations?.inactive || "Inactive")}
                </span>
              </div>

              {/* Credits */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/10 to-violet-500/10 rounded-xl border border-purple-500/20">
                <div className="flex items-center gap-3">
                  <SparklesIcon />
                  <span className="text-white/70">{translations?.credits || "Credits"}</span>
                </div>
                <span className="text-2xl font-bold text-purple-400">{credits}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {subscriptionActive ? (
                  <>
                    <button
                      className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-medium transition-all duration-200 shadow-lg shadow-purple-500/25 text-sm"
                      onClick={async () => {
                        setIsLoading(true);
                        const url = await getPortal();

                        if (url) {
                          window.location.href = url;
                        }
                        setIsLoading(false);
                      }}
                    >
                      {translations?.manage_subscription || "Manage"}
                    </button>
                    <button
                      className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all duration-200 text-sm"
                      onClick={() => setIsCreditsModalOpen(true)}
                    >
                      {translations?.buy_credits || "Buy Credits"}
                    </button>
                  </>
                ) : (
                  <button
                    className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-medium transition-all duration-200 shadow-lg shadow-purple-500/25"
                    onClick={() => setIsSubscriptionModalOpen(true)}
                  >
                    {translations?.start_subscription || "Start Subscription"}
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Password Card */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.3 }}
          >
            {/* Card Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-xl flex items-center justify-center border border-purple-500/30 text-purple-400">
                  <LockIcon />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Password</h2>
                  <p className="text-sm text-white/50">Security settings</p>
                </div>
              </div>
              <button
                className="p-2 rounded-xl hover:bg-white/10 transition-colors text-purple-400"
                onClick={() => setIsModalOpen(true)}
              >
                <EditIcon />
              </button>
            </div>

            {/* Card Body */}
            <div className="p-6">
              <div className="flex items-center gap-3 p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                <div className="text-green-400">
                  <CheckIcon />
                </div>
                <div>
                  <p className="text-white font-medium">{translations?.password_set || "Password Set"}</p>
                  <p className="text-white/50 text-sm">{translations?.choose_password || "Your password is securely configured"}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      <PasswordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <ErrorModal
        isOpen={isErrorModalOpen}
        message={errorModalMessage}
        onClose={() => setIsErrorModalOpen(false)}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        message="Are you sure you want to close your account?"
        onClose={() => setIsConfirmModalOpen(false)}
        onSuccess={deleteUserProfile}
      />

      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
      />

      <CreditsModal
        isOpen={isCreditsModalOpen}
        onClose={() => setIsCreditsModalOpen(false)}
        onPurchase={handlePurchase}
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        message={translations?.credits_purchased || "Credits purchased successfully!"}
        onClose={() => setIsSuccessModalOpen(false)}
      />
      </div>
    </div>
  );
}
