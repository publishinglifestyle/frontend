"use client";

import { useAuth } from "@/app/auth-context";
import { useRouter } from "next/navigation";

export const ImpersonationBanner = () => {
  const { isImpersonating, user, returnToAdmin } = useAuth();
  const router = useRouter();

  if (!isImpersonating || !user) return null;

  const handleReturn = () => {
    returnToAdmin();
    router.push("/admin");
  };

  return (
    <div className="sticky top-0 z-[60] w-full bg-amber-500 text-black px-4 py-2 flex items-center justify-between">
      <span className="text-sm font-medium">
        Logged in as: {user?.first_name} {user?.last_name} ({user?.email})
      </span>
      <button
        onClick={handleReturn}
        className="px-4 py-1.5 rounded-lg bg-black text-white text-sm font-medium hover:bg-zinc-800 transition-colors"
      >
        Return to Admin
      </button>
    </div>
  );
};
