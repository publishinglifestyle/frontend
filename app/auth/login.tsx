"use client";

import ErrorModal from "@/app/modals/errorModal";
import { Button } from "@nextui-org/button";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Input } from "@nextui-org/input";
import { Spinner } from "@nextui-org/spinner";
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
      // Detect browser language
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
              <h1 className="text-4xl font-bold">Login</h1>
              <br />
              <div className="flex gap-2">
                <span>{translations?.login_1}</span>
                <span
                  style={{ cursor: "pointer", color: "#9353D3" }}
                  onClick={toggleToSignUp}
                >
                  {translations?.sign_up}
                </span>
              </div>
            </CardHeader>

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
              isInvalid={isInvalidEmail == null ? undefined : isInvalidEmail}
              errorMessage={isInvalidEmail && translations?.enter_valid_email}
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
              errorMessage={isInvalidPassword && translations?.enter_password}
              color={
                isInvalidPassword == null
                  ? undefined
                  : isInvalidPassword
                  ? "danger"
                  : "success"
              }
            />
            <a
              href="#"
              style={{ fontSize: "14px", color: "#9353D3" }}
              className="ml-2 mt-2"
              onClick={toggleToForgotPassword}
            >
              {translations?.forgot_password}
            </a>
            <Button
              fullWidth
              color="secondary"
              style={{ color: "white" }}
              radius="lg"
              className="mt-12 mb-4"
              onClick={async () => await handleLogin()}
              isDisabled={Boolean(
                !validateEmail(email) || !validatePassword(password)
              )}
            >
              Login
            </Button>
            <Button
              fullWidth
              style={{
                backgroundColor: "white",
                border: "0.5px solid gray",
                color: "black",
              }}
              className="rounded-lg mb-6"
              onClick={() => {
                googleLogin();
              }}
              startContent={<FaGoogle className="text-red-500" />}
            >
              Continue with Google
            </Button>
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

export default Login;
