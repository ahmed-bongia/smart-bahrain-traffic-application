import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  User,
  LogOut,
  Car,
  Shield,
  Users,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";

const NAV_ITEMS = [
  {
    to: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    roles: ["admin", "moderator"],
  },
  {
    to: "/reports",
    icon: FileText,
    label: "Reports",
    roles: ["admin", "moderator"],
  },
  {
    to: "/review",
    icon: ClipboardCheck,
    label: "Review Reports",
    roles: ["admin", "moderator"],
  },
  {
    to: "/verified",
    icon: CheckCircle2,
    label: "Verified Reports",
    roles: ["admin", "moderator"],
  },
  {
    to: "/rejected",
    icon: XCircle,
    label: "Rejected Reports",
    roles: ["admin", "moderator"],
  },
  { to: "/users", icon: Users, label: "Users", roles: ["admin"] },
  { to: "/moderators", icon: Shield, label: "Moderators", roles: ["admin"] },
  {
    to: "/settings",
    icon: User,
    label: "Settings",
    roles: ["admin", "moderator"],
  },
];

export function Sidebar() {
  const { admin, logout } = useAuth();
  const { shouldCollapse } = useSidebar();

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-62.5 bg-primary-900 border-r border-white/10 flex flex-col z-20 transition-all duration-300"
    >
      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Logo & Pin Button Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <div className="h-16 border-b border-white/10 flex items-center gap-3 px-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
            <Car size={18} className="text-white" />
          </div>
          <div className="min-w-0">
            <span className="text-base font-bold text-white block truncate">
              Smart Bahrain
            </span>
            <span className="block text-[10px] text-teal-100/70 font-medium -mt-0.5 truncate">
              {admin?.role === "moderator"
                ? "Moderator Dashboard"
                : "Admin Dashboard"}
            </span>
          </div>
        </div>
      </div>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Nav links Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.filter(({ roles }) =>
          roles.includes(admin?.role ?? "moderator"),
        ).map(({ to, icon: Icon, label }) => {
          return (
            <NavLink
              key={to}
              to={to}
              title={shouldCollapse ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  shouldCollapse ? "justify-center" : ""
                } ${
                  isActive
                    ? "bg-white/15 text-white shadow-md shadow-black/10"
                    : "text-teal-100/80 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              {!shouldCollapse && <span>{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Bottom Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <div className="px-3 pb-4 space-y-2">
        <div className="border-t border-white/10 pt-3 mx-1" />
        <Link
          to="/settings"
          title={shouldCollapse ? admin?.name ?? "Admin" : undefined}
          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 transition-all"
        >
          <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-white">
              {admin?.name?.charAt(0) ?? "A"}
            </span>
          </div>
          {!shouldCollapse && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {admin?.name ?? "Admin"}
              </p>
              <p className="text-xs text-teal-100/60 truncate">
                {admin?.email ?? "admin@test.com"}
              </p>
            </div>
          )}
        </Link>
        <button
          onClick={logout}
          title={shouldCollapse ? "Log Out" : undefined}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-teal-100/80 hover:bg-red-500/15 hover:text-red-100 transition-all ${
            shouldCollapse ? "justify-center" : ""
          }`}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!shouldCollapse && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  );
}



