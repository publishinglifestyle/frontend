import { Button } from "@heroui/button";
import { Card, CardHeader } from "@heroui/card";
import { Switch } from "@heroui/switch";

import { getTranslations } from "@/managers/languageManager";
import { getSubscriptions } from "@/managers/subscriptionManager";
import { Translations } from "@/translations";
import { Subscription } from "@/types/user.types";
import { useEffect, useState } from "react";

interface SubscriptionOptionsProps {
  setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  onClickOnSelectedSubscription: (subscription: Subscription) => void;
}

const SubscriptionOptions = ({
  onClickOnSelectedSubscription,
}: SubscriptionOptionsProps) => {
  const [isAnnual, setIsAnnual] = useState(true);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const [translations, setTranslations] = useState<Translations | null>(null);

  useEffect(() => {
    const detectLanguage = async () => {
      const browserLanguage = navigator.language;
      const translations = await getTranslations(browserLanguage);
      setTranslations(translations);
    };

    (async () => {
      const subscriptions = await getSubscriptions();
      setSubscriptions(subscriptions);
    })();

    detectLanguage();
  }, []);

  const subscriptionToDisplay = subscriptions.filter(
    (subscription: Subscription) =>
      isAnnual ? subscription.type === "year" : subscription.type === "month"
  );

  return (
    <div className="flex flex-col">
      <Switch
        isSelected={isAnnual}
        color="secondary"
        className="mt-8"
        size="sm"
        onChange={async () => {
          setIsAnnual(!isAnnual);
        }}
      >
        {translations?.save_annually}
      </Switch>
      <div className="flex flex-col md:flex-row md:space-x-4 mt-8 mb-8">
        {subscriptionToDisplay.map((sub) => (
          <Card
            key={sub.id}
            isPressable
            isHoverable
            onPress={() => setSelectedSubscription(sub)}
            className={`w-full md:w-1/3 mb-4 md:mb-0 ${
              selectedSubscription === sub
                ? "border-4 border-purple-500 shadow-lg shadow-purple-500/50"
                : ""
            }`} // Full width on mobile, one-third width on desktop
            style={{ height: "200px" }}
          >
            <CardHeader
              className="flex flex-col items-center justify-center"
              style={{ height: "100%" }}
            >
              <h2 className="text-3xl">{sub.name}</h2>
              {isAnnual ? (
                <p style={{ color: "#9353D3" }}>
                  <del>€ {(sub.price * 1.2).toFixed(2)}</del> € {sub.price} /{" "}
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

      {selectedSubscription && (
        <Button
          fullWidth
          color="secondary"
          style={{ color: "white" }}
          radius="lg"
          className="mt-12 mb-6"
          onPress={async () =>
            onClickOnSelectedSubscription(selectedSubscription)
          }
        >
          {translations?.start_free_trial}
        </Button>
      )}
    </div>
  );
};

export default SubscriptionOptions;
