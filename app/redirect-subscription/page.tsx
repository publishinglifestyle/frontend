"use client";

import {
  FREE_CREDIT_KEY,
  FREE_CREDITS_NAME,
  FREE_TRIAL_NAME,
} from "@/constant/credits";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

const RedirectSubscription = () => {
  return (
    <Suspense fallback={null}>
      <RedirectHandler />
    </Suspense>
  );
};

const RedirectHandler = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const freeSubsGrant = searchParams.get(FREE_CREDIT_KEY);

    if (
      freeSubsGrant === FREE_TRIAL_NAME ||
      freeSubsGrant === FREE_CREDITS_NAME
    ) {
      localStorage.setItem("freeSubsGrant", freeSubsGrant);
    }

    router.push("/");
  }, [router, searchParams]);

  return null;
};

export default RedirectSubscription;
