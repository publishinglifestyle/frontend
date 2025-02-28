"use client";
import ConfirmModal from "@/app/modals/confirmModal";
import CreditsModal from "@/app/modals/creditsModal";
import ErrorModal from "@/app/modals/errorModal";
import PasswordModal from "@/app/modals/passwordModal";
import { buyCredits } from "@/managers/creditsManager";
import { getPortal, getSubscription } from "@/managers/subscriptionManager";
import {
  deleteUser,
  getUser,
  updateProfile,
  uploadProfilePic,
} from "@/managers/userManager";
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Image } from "@heroui/image";
import { Input } from "@heroui/input";
import { Spacer } from "@heroui/spacer";
import { Spinner } from "@heroui/spinner";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../auth-context";
import SubscriptionModal from "../modals/subscriptionModal";
import SuccessModal from "../modals/successModal";

import { getTranslations } from "../../managers/languageManager";
import { Translations } from "../../translations.d";

import {
  CheckCircleIcon,
  PencilIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";

const defaultPic = "./profile.png";

export default function ProfilePage() {
  const [translations, setTranslations] = useState<Translations | null>(null);
  const router = useRouter();

  const { isAuthenticated: isAuthenticatedClient, logout } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
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

  const { user, profilePic, setProfilePic } = useAuth();

  useEffect(() => {
    const detectLanguage = async () => {
      // Detect browser language
      const browserLanguage = navigator.language;

      // Get translations for the detected language
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
  }, [isAuthenticatedClient]);

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
      } catch (e) {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateUserProfile = async () => {
    try {
      //setIsLoading(true);
      await updateProfile(firstName, lastName, email);
      setIsEdit(false);
      window.location.reload();
    } catch (e) {
      setIsLoading(false);
      const error = e as any;
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
      const error = e as any;
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
        } catch (error) {
          setIsLoading(false);
          const err = error as any;
          if (err.response) {
            setErrorModalMessage(err.response.data);
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
    return <Spinner aria-label="Loading..." color="secondary" />;
  }

  return (
    <div className="flex flex-col md:flex-row w-full gap-4">
      <div className="md:w-1/2">
        <Card className="w-full md:w-[500px] lg:w-[500px]">
          <CardHeader className="flex gap-3 justify-between px-2 md:px-6">
            <div className="flex flex-col items-start">
              <p className="text-lg">Account</p>
            </div>
            {!isEdit && (
              <Button
                isIconOnly
                variant="light"
                color="primary"
                size="sm"
                onPress={() => setIsEdit(true)}
              >
                <PencilSquareIcon style={{ width: "70%", color: "#9353D3" }} />
              </Button>
            )}
          </CardHeader>
          <Divider />
          <CardBody className="pl-6">
            <Spacer y={4} />
            <div
              className="relative"
              style={{ width: 60, height: 60 }}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <Image
                alt="Profile picture"
                height={60}
                radius="sm"
                src={profilePic ?? ""}
                width={60}
              />
              {isEdit && isHovering && (
                <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center">
                  <PencilIcon
                    style={{ width: "40%", color: "#9353D3", zIndex: 9999 }}
                    className="cursor-pointer"
                    onClick={handleIconClick}
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
            </div>
            <Spacer y={6} />
            <p style={{ fontSize: "14px" }}>
              <b style={{ fontSize: "14px" }}>{translations?.first_name}</b>
              <Spacer y={2} />
              {isEdit ? (
                <Input
                  size="sm"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  type="text"
                  placeholder={translations?.enter_first_name}
                />
              ) : (
                <span style={{ fontSize: "14px" }}>{firstName}</span>
              )}
            </p>
            <Spacer y={4} />
            <p style={{ fontSize: "14px" }}>
              <b style={{ fontSize: "14px" }}>{translations?.last_name}</b>
              <Spacer y={2} />
              {isEdit ? (
                <Input
                  size="sm"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  type="text"
                  placeholder={translations?.enter_last_name}
                />
              ) : (
                <span style={{ fontSize: "14px" }}>{lastName}</span>
              )}
            </p>
            <Spacer y={4} />
            <p style={{ fontSize: "14px" }}>
              <b style={{ fontSize: "14px" }}>Email</b>
              <Spacer y={2} />
              {isEdit ? (
                <Input
                  size="sm"
                  value={email}
                  disabled
                  className="cursor-not-allowed "
                  type="email"
                  placeholder="Enter your email"
                />
              ) : (
                <span style={{ fontSize: "14px" }}>{email}</span>
              )}
            </p>
            <Spacer y={2} />
          </CardBody>
          <CardFooter className="pl-6 justify-end">
            {isEdit && (
              <div className="flex gap-4">
                <Button
                  color="secondary"
                  variant="ghost"
                  style={{ width: "150px" }}
                  radius="lg"
                  size="md"
                  onPress={handleCancel}
                >
                  {translations?.cancel}
                </Button>
                <Button
                  color="secondary"
                  style={{ color: "white", width: "150px" }}
                  radius="lg"
                  size="md"
                  onPress={async () => await updateUserProfile()}
                >
                  {translations?.update}
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>

      <div className="md:w-1/2 flex flex-col">
        <div>
          <Card className="w-full md:w-[500px] lg:w-[500px]">
            <CardHeader>
              <div className="flex flex-col items-start">
                <p className="text-lg">{translations?.my_plan}</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="flex flex-col">
                <div className="flex flex-row gap-4">
                  <b>{translations?.status}:&nbsp;</b>
                  {subscriptionActive ? (
                    <span style={{ color: "#9353D3" }}>
                      {translations?.active}
                    </span>
                  ) : (
                    <span style={{ color: "#9353D3" }}>
                      {translations?.inactive}
                    </span>
                  )}
                </div>
                <div className="flex flex-row gap-4">
                  <b>{translations?.credits}:&nbsp;</b>
                  {credits}
                </div>
              </div>
              <Spacer y={8} />
              {subscriptionActive ? (
                <div className="flex gap-2">
                  <Button
                    color="secondary"
                    style={{ color: "white" }}
                    onPress={async () => {
                      setIsLoading(true);
                      const url = await getPortal();
                      if (url) {
                        //window.open(url, "_blank");
                        window.location.href = url;
                      }
                      setIsLoading(false);
                    }}
                  >
                    {translations?.manage_subscription}
                  </Button>
                  <Button
                    color="secondary"
                    variant="ghost"
                    onPress={async () => {
                      setIsCreditsModalOpen(true);
                    }}
                  >
                    {translations?.buy_credits}
                  </Button>
                </div>
              ) : (
                <Button
                  color="secondary"
                  style={{ color: "white" }}
                  onPress={async () => {
                    setIsSubscriptionModalOpen(true);
                  }}
                >
                  {translations?.start_subscription}
                </Button>
              )}

              <Spacer y={4} />
            </CardBody>
          </Card>
        </div>
        <Spacer y={4} />
        <div>
          <Card className="w-full md:w-[500px] lg:w-[500px]">
            <CardHeader className="flex gap-3 justify-between">
              <div className="flex flex-col items-start">
                <p className="text-lg">Password</p>
              </div>
              <Button
                isIconOnly
                variant="light"
                color="primary"
                size="sm"
                onPress={() => setIsModalOpen(true)}
              >
                <PencilSquareIcon style={{ width: "70%", color: "#9353D3" }} />
              </Button>
            </CardHeader>
            <Divider />
            <CardBody className="pl-6">
              <Spacer y={4} />
              <p style={{ fontSize: "14px" }}>
                <b style={{ fontSize: "14px" }} className="flex">
                  <CheckCircleIcon
                    style={{ width: "5%", marginRight: "1%", color: "#9353D3" }}
                  />
                  {translations?.password_set}
                </b>
                <Spacer y={2} />
                <span style={{ fontSize: "14px" }}>
                  {translations?.choose_password}
                </span>
              </p>
              <Spacer y={4} />

              <Spacer y={2} />
            </CardBody>
            <Divider />
          </Card>
        </div>
      </div>

      <PasswordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        message={errorModalMessage}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onSuccess={deleteUserProfile}
        message="Are you sure you want to close your account?"
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
        onClose={() => setIsSuccessModalOpen(false)}
        message={
          translations?.credits_purchased || "Credits purchased successfully!"
        }
      />
    </div>
  );
}
