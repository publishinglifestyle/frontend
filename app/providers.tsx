"use client";

import { useEffect } from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";
import { AuthProvider } from "./auth-context";
import { GoogleOAuthProvider } from '@react-oauth/google';

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  useEffect(() => {
    // Dynamically load the Post Affiliate Pro tracking script
    const script = document.createElement("script");
    script.src = "https://lowcontent.postaffiliatepro.com/scripts/trackjs.js";
    script.async = true;
    script.id = "pap_x2s6df8d";
    document.body.appendChild(script);

    // Set up tracking after the script loads
    script.onload = () => {
      if (window.PostAffTracker) {
        window.PostAffTracker.setAccountId('default1');
        try {
          window.PostAffTracker.track();
        } catch (err) {
          console.error("Post Affiliate Pro tracking error:", err);
        }
      }
    };

    // Clean up the script on unmount
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <HeroUIProvider navigate={router.push}>
      <NextThemesProvider {...themeProps}>
        <AuthProvider>
          <GoogleOAuthProvider clientId="385572472945-folnm365fm1gr3nooesejvc7ceh16s5i.apps.googleusercontent.com">
            {children}
          </GoogleOAuthProvider>
        </AuthProvider>
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
