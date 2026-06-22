import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";

function DashboardContent() {
  const { shouldCollapse } = useSidebar();

  return (
    <div className="min-h-screen bg-[var(--color-surface-secondary)]">
      <Sidebar />
      <main
        className={`min-h-screen transition-all duration-300 ${
          shouldCollapse ? "ml-20" : "ml-62.5"
        }`}
      >
        <div className="w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export function DashboardLayout() {
  return (
    <SidebarProvider>
      <DashboardContent />
    </SidebarProvider>
  );
}

