import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface SidebarContextType {
  isCollapsed: boolean;
  isPinned: boolean;
  setIsCollapsed: (value: boolean) => void;
  setIsPinned: (value: boolean) => void;
  shouldCollapse: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const shouldCollapse = false;

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        isPinned,
        setIsCollapsed,
        setIsPinned,
        shouldCollapse,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

