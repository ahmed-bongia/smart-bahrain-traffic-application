import { Header } from "@/components/layout/Header";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, Shield } from "lucide-react";

export default function SettingsPage() {
  const { admin } = useAuth();

  const isAdmin = admin?.role === "admin";

  const fields = [
    {
      icon: <User size={16} className="text-text-tertiary" />,
      label: "Full Name",
      value: admin?.name ?? "—",
    },
    {
      icon: <Mail size={16} className="text-text-tertiary" />,
      label: "Email Address",
      value: admin?.email ?? "—",
    },
    {
      icon: <Shield size={16} className="text-text-tertiary" />,
      label: "Role",
      value: (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold capitalize ${
            isAdmin
              ? "bg-primary-50 text-primary-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          <Shield size={11} />
          {admin?.role ?? "—"}
        </span>
      ),
    },
  ];

  return (
    <div>
      <Header title="Settings" subtitle="Your account information" />

      <div className="p-6 max-w-2xl space-y-5">
        {/* Avatar + name hero */}
        <div className="bg-surface rounded-2xl p-6 shadow-card flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center shrink-0">
            <span className="text-3xl font-bold text-primary-700">
              {admin?.name?.charAt(0)?.toUpperCase() ?? "A"}
            </span>
          </div>
          <div>
            <p className="text-xl font-bold text-text-primary leading-tight">
              {admin?.name}
            </p>
            <p className="text-sm text-text-secondary mt-0.5">{admin?.email}</p>
            <span
              className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-lg text-xs font-semibold capitalize ${
                isAdmin
                  ? "bg-primary-50 text-primary-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              <Shield size={11} />
              {admin?.role}
            </span>
          </div>
        </div>

        {/* Info rows */}
        <div className="bg-surface rounded-2xl shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-text-primary">
              Account Details
            </h3>
          </div>
          {fields.map((f, i) => (
            <div
              key={i}
              className={`flex items-center gap-4 px-6 py-4 ${
                i < fields.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-surface-secondary flex items-center justify-center shrink-0">
                {f.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-tertiary font-medium mb-0.5">
                  {f.label}
                </p>
                {typeof f.value === "string" ? (
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {f.value}
                  </p>
                ) : (
                  f.value
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Permissions card */}
        <div className="bg-surface rounded-2xl shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-text-primary">
              Permissions
            </h3>
          </div>
          {[
            { label: "View & manage reports", granted: true },
            { label: "Review and assign reports", granted: true },
            { label: "Resolve / reject reports", granted: true },
            { label: "Manage moderator accounts", granted: isAdmin },
          ].map((p, i, arr) => (
            <div
              key={i}
              className={`flex items-center justify-between px-6 py-3.5 ${
                i < arr.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <span className="text-sm text-text-secondary">{p.label}</span>
              {p.granted ? (
                <span className="text-xs font-semibold text-success bg-success/10 px-2.5 py-0.5 rounded-lg">
                  Allowed
                </span>
              ) : (
                <span className="text-xs font-semibold text-text-tertiary bg-surface-secondary px-2.5 py-0.5 rounded-lg">
                  Restricted
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

