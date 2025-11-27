"use client";

import { getTranslations } from "@/managers/languageManager";
import { getSubscriptions } from "@/managers/subscriptionManager";
import { Translations } from "@/translations";
import { Subscription } from "@/types/user.types";
import { useEffect, useState } from "react";

interface SubscriptionOptionsProps {
  setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  onClickOnSelectedSubscription: (subscription: Subscription) => void;
}

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const StarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const SubscriptionOptions = ({
  onClickOnSelectedSubscription,
}: SubscriptionOptionsProps) => {
  const [isAnnual, setIsAnnual] = useState(true);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [translations, setTranslations] = useState<Translations | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectLanguage = async () => {
      const browserLanguage = navigator.language;
      const translations = await getTranslations(browserLanguage);
      setTranslations(translations);
    };

    (async () => {
      const subscriptions = await getSubscriptions();
      setSubscriptions(subscriptions);
      setIsLoading(false);
    })();

    detectLanguage();
  }, []);

  const subscriptionToDisplay = subscriptions.filter(
    (subscription: Subscription) =>
      isAnnual ? subscription.type === "year" : subscription.type === "month"
  );

  // Sort subscriptions by price
  const sortedSubscriptions = [...subscriptionToDisplay].sort(
    (a, b) => a.price - b.price
  );

  // Find the middle tier (Pro) to mark as popular
  const getPopularIndex = () => {
    if (sortedSubscriptions.length === 3) return 1;
    return -1;
  };

  const getFeatures = (sub: Subscription) => {
    const baseFeatures = [
      "AI Image Generation",
      "AI Text Generation",
      `${sub.credits.toLocaleString("en-US")} credits${isAnnual ? "/year" : "/month"}`,
    ];

    if (sub.name.toLowerCase().includes("pro")) {
      return [...baseFeatures, "Priority Generation", "Advanced Templates"];
    } else if (sub.name.toLowerCase().includes("star")) {
      return [...baseFeatures, "Priority Generation", "Advanced Templates", "API Access"];
    }
    return [...baseFeatures, "Basic Templates"];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Billing Toggle */}
      <div className="flex items-center justify-center mb-6">
        <div className="inline-flex items-center p-1 bg-white/5 border border-white/10 rounded-full">
          <button
            onClick={() => setIsAnnual(false)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              !isAnnual
                ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white"
                : "text-white/60 hover:text-white"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              isAnnual
                ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white"
                : "text-white/60 hover:text-white"
            }`}
          >
            Yearly
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
              Save 17%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {sortedSubscriptions.map((sub, index) => {
          const isPopular = index === getPopularIndex();
          const isSelected = selectedSubscription?.id === sub.id;
          const features = getFeatures(sub);

          return (
            <button
              key={sub.id}
              onClick={() => setSelectedSubscription(sub)}
              className={`relative w-full text-left p-5 rounded-xl border transition-all duration-200 flex flex-col ${
                isSelected
                  ? "bg-purple-500/10 border-purple-500/50 ring-2 ring-purple-500/30"
                  : "bg-white/5 border-white/10 hover:border-purple-500/30 hover:bg-white/[0.07]"
              } ${isPopular ? "md:scale-105 md:shadow-xl md:shadow-purple-500/10 mt-4" : ""}`}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-600 to-violet-600 text-white text-xs font-semibold rounded-full whitespace-nowrap">
                    <StarIcon />
                    Most Popular
                  </span>
                </div>
              )}

              {/* Selection Indicator - Top Right */}
              <div className="absolute top-4 right-4">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? "bg-purple-500 border-purple-500"
                      : "border-white/20"
                  }`}
                >
                  {isSelected && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Plan Name */}
              <h3 className="text-lg font-bold text-white mb-1">{sub.name}</h3>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-3">
                {isAnnual && (
                  <span className="text-white/40 text-xs line-through">
                    €{(sub.price * 1.2).toFixed(0)}
                  </span>
                )}
                <span className="text-lg font-semibold text-white">€{sub.price}</span>
                <span className="text-white/50 text-xs">
                  /{isAnnual ? "year" : "month"}
                </span>
              </div>

              {/* Credits Highlight */}
              <div className="flex flex-col items-start px-3 py-2 bg-purple-500/10 rounded-lg mb-4">
                <span className="text-purple-400 font-bold text-xl leading-tight">
                  {sub.credits.toLocaleString("en-US")}
                </span>
                <span className="text-purple-400/70 text-xs">credits</span>
              </div>

              {/* Features */}
              <div className="flex flex-col gap-2 mt-auto">
                {features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-white/60 text-sm">
                    <span className="text-green-400 flex-shrink-0">
                      <CheckIcon />
                    </span>
                    <span className="truncate">{feature}</span>
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Continue Button */}
      <button
        onClick={() => selectedSubscription && onClickOnSelectedSubscription(selectedSubscription)}
        disabled={!selectedSubscription}
        className="w-full mt-6 py-3.5 px-4 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 disabled:from-zinc-600 disabled:to-zinc-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-200"
      >
        {translations?.start_free_trial || "Start Free Trial"}
      </button>

      {/* Trust Badges */}
      <div className="flex items-center justify-center gap-4 mt-4 text-white/40 text-xs">
        <span className="flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Secure Payment
        </span>
        <span>•</span>
        <span>Cancel Anytime</span>
        <span>•</span>
        <span>2-Day Free Trial</span>
      </div>
    </div>
  );
};

export default SubscriptionOptions;
