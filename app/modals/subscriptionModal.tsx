"use client";

declare global {
  interface Window {
    endorsely_referral?: string;
  }
}

import { Button } from "@heroui/button";
import { Card, CardHeader } from "@heroui/card";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { Switch } from "@heroui/switch";
import Cookie from "js-cookie";
import React, { useEffect, useState } from "react";
import { getTranslations } from "../../managers/languageManager";
import {
  getSubscriptions,
  startSubscription,
} from "../../managers/subscriptionManager";
import { Translations } from "../../translations.d";
import { getEndorselyReferral } from "../../utils/endorsely";

interface Subscription {
  id: string;
  name: string;
  price_id: string;
  price: number;
  credits: number;
}

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnnual, setIsAnnual] = useState(true);
  const [translations, setTranslations] = useState<Translations | null>(null);

  useEffect(() => {
    const detectLanguage = async () => {
      const browserLanguage = navigator.language;
      const translations = await getTranslations(browserLanguage);

      setTranslations(translations);
    };

    detectLanguage();
  }, []);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setIsLoading(true);
        const all_subscriptions = await getSubscriptions();
        const filteredSubscriptions = all_subscriptions.filter(
          (subscription: { type: string }) => subscription.type === "year"
        );
        setSubscriptions(filteredSubscriptions);
      } catch (error) {
        console.error("Failed to fetch subscriptions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchSubscriptions();
    }
  }, [isOpen]);

  const handleSubscriptionSelect = async () => {
    if (selectedSubscription) {
      setIsLoading(true);
      
      // Get the referral ID from Endorsely
      const endorselyReferral = getEndorselyReferral();
      
      const url = await startSubscription(
        Cookie.get("authToken"),
        selectedSubscription.price_id,
        undefined, // affiliateId
        endorselyReferral
      );

      window.location.href = url;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader className="modal-header justify-center">
          <h1 style={{ fontSize: "26px", textAlign: "center" }}>
            {translations?.select_subscription}
          </h1>
        </ModalHeader>
        <ModalBody
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="flex flex-col">
              <Switch
                isSelected={isAnnual}
                color="secondary"
                className="mt-8"
                size="sm"
                onChange={async () => {
                  setIsLoading(true);
                  let filteredSubscriptions = await getSubscriptions();
                  if (isAnnual) {
                    filteredSubscriptions = filteredSubscriptions.filter(
                      (subscription: { type: string }) =>
                        subscription.type === "month"
                    );
                    setSubscriptions(filteredSubscriptions);
                  } else {
                    filteredSubscriptions = filteredSubscriptions.filter(
                      (subscription: { type: string }) =>
                        subscription.type === "year"
                    );
                    setSubscriptions(filteredSubscriptions);
                  }
                  setIsLoading(false);
                  setIsAnnual(!isAnnual);
                }}
              >
                {translations?.save_annually}
              </Switch>
              <div className="flex flex-col md:flex-row md:space-x-4 mt-8 mb-8 w-full">
                {subscriptions.map((sub) => (
                  <Card
                    key={sub.id}
                    isPressable
                    isHoverable
                    onPress={() => setSelectedSubscription(sub)}
                    className={`w-full mb-4 md:mb-0 ${selectedSubscription === sub
                      ? "border-4 border-purple-500 shadow-lg shadow-purple-500/50"
                      : ""
                      }`}
                    style={{ height: "200px" }}
                  >
                    <CardHeader
                      className="flex flex-col items-center justify-center"
                      style={{ height: "100%" }}
                    >
                      <h2 className="text-3xl">{sub.name}</h2>
                      {isAnnual ? (
                        <p style={{ color: "#9353D3" }}>
                          <del>€ {(sub.price * 1.20).toFixed(2)}</del> € {sub.price}/{" "}
                          {translations?.yearly}
                        </p>
                      ) : (
                        <p style={{ color: "#9353D3" }}>
                          € {sub.price}&nbsp;
                          {translations?.monthly}
                        </p>
                      )}

                      {/* Credits Section */}
                      <div className="flex flex-col items-center space-x-2 mt-4">
                        <span className="text-2xl font-bold">
                          {sub.credits.toLocaleString("en-US")}
                        </span>
                        <span className="text-gray-500 text-lg">credits</span>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter className="mt-4 mb-2 justify-center">
          <Button
            color="secondary"
            style={{ color: "white", width: "150px" }}
            onPress={handleSubscriptionSelect}
            isDisabled={!selectedSubscription}
          >
            {translations?.next}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SubscriptionModal;
