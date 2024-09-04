"use client";

import { useEffect } from "react";
import { NextUIProvider } from "@nextui-org/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";
import { AuthProvider } from "./auth-context";


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

  return (
    <NextUIProvider navigate={router.push}>
      <NextThemesProvider {...themeProps}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </NextThemesProvider>
    </NextUIProvider>
  );
}
