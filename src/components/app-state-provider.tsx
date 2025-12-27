"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { FirebaseClientProvider } from "@/firebase/client-provider";

type AdminConfig = {
  backend: string;
  enabled: boolean;
};

type AppStateContextType = {
  isFirebaseEnabled: boolean;
};

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AdminConfig>({ backend: 'none', enabled: false });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin-config')
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to load admin config:", err);
        setIsLoading(false);
      });
  }, []);

  const isFirebaseEnabled = config.backend === 'firebase' && config.enabled;

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-screen bg-background">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
        </div>
    );
  }

  return (
    <AppStateContext.Provider value={{ isFirebaseEnabled }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}

function FirebaseProviderWrapper({ children }: { children: ReactNode }) {
  const { isFirebaseEnabled } = useAppState();

  return isFirebaseEnabled ? (
    <FirebaseClientProvider>{children}</FirebaseClientProvider>
  ) : (
    <>{children}</>
  );
}

export const AppContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppStateProvider>
      <FirebaseProviderWrapper>{children}</FirebaseProviderWrapper>
    </AppStateProvider>
  );
};
