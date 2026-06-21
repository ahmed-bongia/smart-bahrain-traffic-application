import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Users,
  Mail,
  Calendar,
  AlertTriangle,
  Search,
  Shield,
} from "lucide-react";
import {
  fetchModerators,
  createModerator,
  updateModerator,
  deleteModerator,
} from "@/services/api";
import type { BackendModerator } from "@/services/api";

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
export default function ModeratorsPage() {
  const [moderators, setModerators] = useState<BackendModerator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState<BackendModerator | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BackendModerator | null>(
    null,
  );

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const load = () => {
    setLoading(true);
    fetchModerators()
      .then(setModerators)
      .catch((e) => setError(e.message ?? "Failed to load moderators"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormError("");
  };

  const openAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEdit = (mod: BackendModerator) => {
    resetForm();
    setFormName(mod.name);
    setFormEmail(mod.email);
    setEditTarget(mod);
  };

  const handleCreate = async () => {
    if (!formName.trim() || !formEmail.trim() || !formPassword.trim()) {
      setFormError("All fields are required");
      return;
    }
    setFormLoading(true);
    setFormError("");
    try {
      await createModerator({
        name: formName.trim(),
        email: formEmail.trim(),
        password: formPassword,
      });
      setShowAddModal(false);
      load();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Creation failed");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editTarget) return;
    if (!formName.trim() || !formEmail.trim()) {
      setFormError("Name and email are required");
      return;
    }
    setFormLoading(true);
    setFormError("");
    try {
      const payload: { name?: string; email?: string; password?: string } = {};
      if (formName.trim() !== editTarget.name) payload.name = formName.trim();
      if (formEmail.trim() !== editTarget.email)
        payload.email = formEmail.trim();
      if (formPassword.trim()) payload.password = formPassword;

      if (Object.keys(payload).length === 0) {
        setEditTarget(null);
        return;
      }

      await updateModerator(editTarget._id, payload);
      setEditTarget(null);
      load();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setFormLoading(true);
    try {
      await deleteModerator(deleteTarget._id);
      setDeleteTarget(null);
      load();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setFormLoading(false);
    }
  };

  const filtered = searchQuery
    ? moderators.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : moderators;

  // Render
  if (loading) {
    return (
      <div>
        <Header title="Moderators" subtitle="Manage moderator accounts" />
        <div className="flex justify-center items-center h-[300px]">
          <div className="w-8 h-8 rounded-full border-3 border-[var(--color-primary-500)] border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header title="Moderators" subtitle="Manage moderator accounts" />
        <div className="p-6">
          <div className="bg-danger-bg border border-danger/20 rounded-2xl p-6 flex items-center gap-3">
            <AlertTriangle size={20} className="text-danger" />
            <p className="text-sm text-danger font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Moderators" subtitle="Manage moderator accounts" />

      <div className="p-6 space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary"
            />
            <input
              type="text"
              placeholder="Search moderators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-border text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
            />
          </div>

          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-primary-500)] text-white text-sm font-semibold hover:bg-[var(--color-primary-600)] transition shadow-md shadow-[var(--color-primary-500)]/20"
          >
            <Plus size={16} />
            Add Moderator
          </button>
        </div>

        {/* Stat card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface rounded-2xl p-5 shadow-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-500)]/10 flex items-center justify-center">
              <Shield size={22} className="text-[var(--color-primary-500)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {moderators.length}
              </p>
              <p className="text-xs text-text-tertiary">Total Moderators</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-surface rounded-2xl shadow-card overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-text-tertiary">
              <Users size={40} className="mb-3 opacity-40" />
              <p className="text-sm font-medium">
                {searchQuery
                  ? "No moderators match your search"
                  : "No moderators yet"}
              </p>
              {!searchQuery && (
                <p className="text-xs mt-1">
                  Click "Add Moderator" to create the first one
                </p>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                    Name
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                    Created
                  </th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((mod) => (
                  <tr
                    key={mod._id}
                    className="border-b border-border/50 last:border-0 hover:bg-surface-secondary/50 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[var(--color-primary-500)]/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-[var(--color-primary-500)]">
                            {mod.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-text-primary">
                          {mod.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <Mail size={14} className="text-text-tertiary" />
                        {mod.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <Calendar size={14} className="text-text-tertiary" />
                        {formatDate(mod.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(mod)}
                          className="p-2 rounded-lg hover:bg-primary-50 text-text-secondary hover:text-[var(--color-primary-500)] transition"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setFormError("");
                            setDeleteTarget(mod);
                          }}
                          className="p-2 rounded-lg hover:bg-danger-bg text-text-secondary hover:text-danger transition"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-text-primary">
              Add Moderator
            </h2>
            <button
              onClick={() => setShowAddModal(false)}
              className="p-1.5 rounded-lg hover:bg-surface-tertiary transition"
            >
              <X size={18} className="text-text-tertiary" />
            </button>
          </div>

          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-danger-bg text-danger text-sm font-medium">
              {formError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Name
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Full name"
                className="w-full px-4 py-2.5 rounded-xl bg-surface-secondary border border-border text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-4 py-2.5 rounded-xl bg-surface-secondary border border-border text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-4 py-2.5 rounded-xl bg-surface-secondary border border-border text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={() => setShowAddModal(false)}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-text-secondary hover:bg-surface-tertiary transition"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={formLoading}
              className="flex-1 py-2.5 rounded-xl bg-[var(--color-primary-500)] text-white text-sm font-semibold hover:bg-[var(--color-primary-600)] transition disabled:opacity-50"
            >
              {formLoading ? "Creating…" : "Create Moderator"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-text-primary">
              Edit Moderator
            </h2>
            <button
              onClick={() => setEditTarget(null)}
              className="p-1.5 rounded-lg hover:bg-surface-tertiary transition"
            >
              <X size={18} className="text-text-tertiary" />
            </button>
          </div>

          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-danger-bg text-danger text-sm font-medium">
              {formError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Name
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-secondary border border-border text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-secondary border border-border text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                New Password{" "}
                <span className="text-text-tertiary font-normal">
                  (leave blank to keep current)
                </span>
              </label>
              <input
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-surface-secondary border border-border text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={() => setEditTarget(null)}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-text-secondary hover:bg-surface-tertiary transition"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={formLoading}
              className="flex-1 py-2.5 rounded-xl bg-[var(--color-primary-500)] text-white text-sm font-semibold hover:bg-[var(--color-primary-600)] transition disabled:opacity-50"
            >
              {formLoading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-danger">Delete Moderator</h2>
            <button
              onClick={() => setDeleteTarget(null)}
              className="p-1.5 rounded-lg hover:bg-surface-tertiary transition"
            >
              <X size={18} className="text-text-tertiary" />
            </button>
          </div>

          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-danger-bg text-danger text-sm font-medium">
              {formError}
            </div>
          )}

          <div className="bg-danger-bg rounded-xl p-4 mb-6">
            <p className="text-sm text-text-primary">
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.name}</strong>? This action cannot be
              undone.
            </p>
            <p className="text-xs text-text-tertiary mt-1">
              {deleteTarget?.email}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setDeleteTarget(null)}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-text-secondary hover:bg-surface-tertiary transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={formLoading}
              className="flex-1 py-2.5 rounded-xl bg-danger text-white text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50"
            >
              {formLoading ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


