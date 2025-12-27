"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import React, { createContext, useContext, ReactNode } from 'react';
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
  const [savedConfig] = useLocalStorage<AdminConfig>("admin-config", { backend: 'none', enabled: false });

  const isFirebaseEnabled = savedConfig.backend === 'firebase' && savedConfig.enabled;

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
