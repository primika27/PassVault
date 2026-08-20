import { createContext, useContext, useState, type ReactNode } from "react";

interface VaultContextType {
  masterKey: Uint8Array | null;
  setMasterKey: (key: Uint8Array | null) => void;
  lockVault: () => void;
}

const VaultContext = createContext<VaultContextType | null>(null);

//sits at the top of your app so it never unmounts when you change pages
export function VaultProvider({ children }: { children: ReactNode }) {
  const [masterKey, setMasterKey] = useState<Uint8Array | null>(null);

  const lockVault = () => {
    setMasterKey(null); 
  };

  return (
    <VaultContext.Provider value={{masterKey, setMasterKey, lockVault }}>
      {children}
    </VaultContext.Provider>
  );
}
//helper that lets any child component read from or write to the context
export const useVault = () => {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error("useVault must be used within a VaultProvider");
  return ctx;
};