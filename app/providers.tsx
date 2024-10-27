"use client";

import { useEffect } from "react";
import { NextUIProvider } from "@nextui-org/system";
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
    // Function to add the script
    const addVoiceflowScript = () => {
      const script = document.createElement('script');
      script.src = 'https://cdn.voiceflow.com/widget/bundle.mjs';
      script.type = 'text/javascript';
      script.async = true; // Optional: makes the script load asynchronously
      script.onload = () => {
        if ((window as any).voiceflow?.chat) {
          (window as any).voiceflow.chat.load({
            verify: { projectID: '66d7fa2d94af3fd8206b4674' },
            url: 'https://general-runtime.voiceflow.com',
            versionID: 'production'
          });
        }
      };

      // Append the script to the document body (or head)
      document.body.appendChild(script);
    };

    // Call the function to add the script
    addVoiceflowScript();

    // Optional cleanup function in case the component unmounts
    return () => {
      const voiceflowScript = document.querySelector(`script[src="https://cdn.voiceflow.com/widget/bundle.mjs"]`);
      if (voiceflowScript) {
        voiceflowScript.remove();
      }
    };
  }, []);

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
    <NextUIProvider navigate={router.push}>
      <NextThemesProvider {...themeProps}>
        <AuthProvider>
          <GoogleOAuthProvider clientId="385572472945-folnm365fm1gr3nooesejvc7ceh16s5i.apps.googleusercontent.com">
            {children}
          </GoogleOAuthProvider>
        </AuthProvider>
      </NextThemesProvider>
    </NextUIProvider>
  );
}
