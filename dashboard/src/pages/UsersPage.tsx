import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { User, KeyRound, X, Search } from "lucide-react";
import {
  fetchAllUsers,
  resetUserPassword,
} from "@/services/api";
import type { BackendUser } from "@/services/api";

// Helpers
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Modal wrapper
function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md mx-4 bg-surface rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-200">
        {children}
      </div>
    </div>
  );
}

// Page
export default function UsersPage() {
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state
  const [passwordTarget, setPasswordTarget] = useState<BackendUser | null>(null);

  // Form state
  const [newPassword, setNewPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  const load = () => {
    setLoading(true);
    fetchAllUsers()
      .then(setUsers)
      .catch((e) => setError(e.message ?? "Failed to load users"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = searchQuery
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.cpr.includes(searchQuery) ||
          u.phone?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : users;

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordTarget || !newPassword) return;

    if (newPassword.length < 6) {
      setFormError("Password must be at least 6 characters");
      return;
    }

    setFormLoading(true);
    setFormError("");
    setFormSuccess(false);

    try {
      await resetUserPassword(passwordTarget._id, newPassword);
      setFormSuccess(true);
      setNewPassword("");
      setTimeout(() => {
        setPasswordTarget(null);
        setFormSuccess(false);
      }, 1500);
    } catch (e: unknown) {
      setFormError((e as Error).message ?? "Failed to reset password");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      <Header title="Users" subtitle="Manage registered user accounts" />

      <main className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-surface rounded-2xl p-5 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <User size={20} className="text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {users.length}
                </p>
                <p className="text-xs text-text-tertiary">Total Users</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
            />
            <input
              type="text"
              placeholder="Search by name, CPR, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-danger-bg text-danger rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-text-tertiary">
              Loading users...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-text-tertiary">
                {searchQuery
                  ? "No users match your search"
                  : "No users yet"}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-surface-tertiary">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">
                    Name
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">
                    CPR
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">
                    Phone
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">
                    Balance
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">
                    Joined
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-text-tertiary uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-surface-tertiary/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-xs font-semibold text-primary-700">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium text-text-primary">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary font-mono">
                      {user.cpr}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {user.phone || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {user.balance ?? 0} BHD
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setPasswordTarget(user)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                      >
                        <KeyRound size={14} />
                        Reset Password
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Password Reset Modal */}
      <Modal open={!!passwordTarget} onClose={() => setPasswordTarget(null)}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-primary">
              Reset Password
            </h2>
            <button
              onClick={() => setPasswordTarget(null)}
              className="p-1.5 rounded-lg hover:bg-surface-tertiary transition-colors"
            >
              <X size={18} className="text-text-tertiary" />
            </button>
          </div>

          {passwordTarget && (
            <div className="mb-4 p-3 bg-surface-tertiary rounded-xl">
              <p className="text-sm font-medium text-text-primary">
                {passwordTarget.name}
              </p>
              <p className="text-xs text-text-tertiary">
                CPR: {passwordTarget.cpr}
              </p>
            </div>
          )}

          <form onSubmit={handleResetPassword}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 chars)"
                className="w-full px-3 py-2.5 bg-surface-secondary border border-border rounded-xl text-sm placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-200"
                required
                minLength={6}
              />
            </div>

            {formError && (
              <div className="mb-3 p-2.5 bg-danger-bg text-danger text-xs rounded-lg">
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="mb-3 p-2.5 bg-success-bg text-success text-xs rounded-lg">
                Password updated successfully!
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPasswordTarget(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-text-secondary bg-surface-tertiary hover:bg-border rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-xl transition-colors disabled:opacity-50"
              >
                {formLoading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
