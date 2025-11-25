"use client";

import ErrorModal from "@/app/modals/errorModal";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
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
  //   const [isAnnual, setIsAnnual] = useState(true);
  const [step, setStep] = useState(1);
  const [googleAuthToken, setGoogleAuthToken] = useState("");
  const { login } = useAuth();

  const validateEmail = (email: string): boolean =>
    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);
  const isInvalidEmail = useMemo(
    () => (email === "" ? null : !validateEmail(email)),
    [email]
  );

  //const validatePassword = (password: string): boolean => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

  const validatePassword = (password: string): boolean => {
    // You can add specific criteria here, for now, we're just checking length
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
      // Detect browser language
      const browserLanguage = navigator.language;
      setLanguage(browserLanguage);

      // Get translations for the detected language
      const translations = await getTranslations(browserLanguage);
      setTranslations(translations);
    };

    detectLanguage();
  }, []);

  useEffect(() => {
    // Load the Post Affiliate Pro script dynamically
    const script = document.createElement("script");
    script.src = "https://lowcontent.postaffiliatepro.com/scripts/lv5w3ke4j";
    script.async = true;
    script.id = "pap_x2s6df8d";
    document.body.appendChild(script);

    // After the script loads, capture the tracking cookie
    script.onload = () => {
      if (window.PostAffTracker) {
        try {
          window.PostAffTracker.setAccountId("default1");
          window.PostAffTracker.track();
          const papCookie =
            window.PostAffTracker._getAccountId() +
            window.PostAffTracker._cmanager.getVisitorIdOrSaleCookieValue();

          // Store papCookie in local storage
          localStorage.setItem("affiliate_id", papCookie);
          setAffiliateId(papCookie);
        } catch (err) {
          console.error("Error capturing Post Affiliate Pro cookie:", err);
        }
      }
    };

    // Clean up the script on unmount
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

      // Get the referral ID from Endorsely
      const endorselyReferral = getEndorselyReferral();

      // Get UTM tracking data
      const utmData = getUtmData();
      console.log("utmData", utmData);

      const url = await startSubscription(token, price_id, affiliateId, endorselyReferral, utmData);
      window.location.href = url;
      // Add success modal logic if needed
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
    <div style={{ height: "100%", width: "100%" }}>
      {isLoading ? (
        <div
          className="flex flex-col md:flex-row items-center justify-center gap-8 py-8 md:py-10"
          style={{ marginTop: "10%" }}
        >
          <Spinner color="secondary" />
        </div>
      ) : (
        <Card>
          <CardBody>
            <CardHeader className="flex flex-col">
              <h1 className="text-4xl font-bold">{translations?.sign_up}</h1>
              <br />
              <div className="flex gap-2">
                <span>{translations?.already_have_an_account}</span>
                <span
                  style={{ cursor: "pointer", color: "#9353D3" }}
                  onClick={toggleToLogin}
                >
                  Login
                </span>
              </div>
            </CardHeader>
            {step === 1 && (
              <>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  label={translations?.enter_email}
                  type="email"
                  isRequired
                  size="sm"
                  radius="lg"
                  variant="bordered"
                  className="mt-16"
                  isInvalid={
                    isInvalidEmail == null ? undefined : isInvalidEmail
                  }
                  errorMessage={
                    isInvalidEmail && translations?.enter_valid_email
                  }
                  color={
                    isInvalidEmail == null
                      ? undefined
                      : isInvalidEmail
                        ? "danger"
                        : "success"
                  }
                />
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  label={translations?.enter_password}
                  type="password"
                  isRequired
                  size="sm"
                  radius="lg"
                  variant="bordered"
                  className="mt-4"
                  isInvalid={
                    isInvalidPassword == null ? undefined : isInvalidPassword
                  }
                  errorMessage={
                    isInvalidPassword && translations?.password_invalid_format_2
                  }
                  color={
                    isInvalidPassword == null
                      ? undefined
                      : isInvalidPassword
                        ? "danger"
                        : "success"
                  }
                />
                <Input
                  value={password_2}
                  onChange={(e) => setPassword_2(e.target.value)}
                  fullWidth
                  label={translations?.re_enter_password}
                  type="password"
                  isRequired
                  size="sm"
                  radius="lg"
                  variant="bordered"
                  className="mt-4"
                  isInvalid={
                    isInvalidPassword_2 == null
                      ? undefined
                      : isInvalidPassword_2
                  }
                  errorMessage={
                    isInvalidPassword_2 && translations?.password_mismatch
                  }
                  color={
                    isInvalidPassword_2 == null
                      ? undefined
                      : isInvalidPassword_2
                        ? "danger"
                        : "success"
                  }
                />
                <Button
                  fullWidth
                  color="secondary"
                  style={{ color: "white" }}
                  radius="lg"
                  className="mt-12 mb-6"
                  onPress={() => setStep(2)}
                  isDisabled={Boolean(
                    !validateEmail(email) ||
                    !validatePassword(password) ||
                    !validatePassword(password_2) ||
                    password !== password_2
                  )}
                >
                  {translations?.next}
                </Button>
                <Button
                  fullWidth
                  style={{
                    backgroundColor: "white",
                    border: "0.5px solid gray",
                    color: "black",
                  }}
                  className="rounded-lg mb-6"
                  onPress={() => {
                    googleLogin();
                  }}
                  startContent={FaGoogle({ className: "text-red-500" })}
                >
                  Continue with Google
                </Button>
              </>
            )}
            {step === 2 && (
              <>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  fullWidth
                  label={translations?.enter_first_name}
                  type="text"
                  isRequired
                  size="sm"
                  radius="lg"
                  variant="bordered"
                  className="mt-16"
                />
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  fullWidth
                  label={translations?.enter_last_name}
                  type="text"
                  isRequired
                  size="sm"
                  radius="lg"
                  variant="bordered"
                  className="mt-4"
                />
                <Button
                  fullWidth
                  color="secondary"
                  style={{ color: "white" }}
                  radius="lg"
                  className="mt-12 mb-6"
                  onPress={() => setStep(3)}
                  isDisabled={Boolean(firstName === "" || lastName === "")}
                >
                  {translations?.next}
                </Button>
              </>
            )}
            {step === 3 && (
              <SubscriptionOptions
                setIsLoading={setIsLoading}
                onClickOnSelectedSubscription={async (selectedSubscription) => {
                  await handleSignUp(selectedSubscription.price_id);
                }}
              />
            )}
          </CardBody>
        </Card>
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
