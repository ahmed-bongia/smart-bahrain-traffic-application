import { useState, useMemo, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { SearchBar, StatusBadge, Modal } from "@/components/ui";
import {
  fetchAllReports,
  updateReportStatus,
  assignReport,
} from "@/services/api";
import type { BackendReport } from "@/services/api";
import {
  MapPin,
  Clock,
  User,
  Phone,
  CheckCircle2,
  XCircle,
  Image,
  AlertTriangle,
  Tag,
  UserCheck,
  Shield,
  ChevronLeft,
  ChevronRight,
  X as XIcon,
  Play,
} from "lucide-react";
import { categoryLabel } from "@/lib/utils";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ReviewReportsPage() {
  const [reports, setReports] = useState<BackendReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedReport, setSelectedReport] = useState<BackendReport | null>(
    null,
  );
  const [adminNotes, setAdminNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  // Lightbox state
  const [lightbox, setLightbox] = useState<{
    media: BackendReport["media"];
    index: number;
  } | null>(null);

  const openLightbox = (media: BackendReport["media"], index: number) =>
    setLightbox({ media, index });
  const closeLightbox = () => setLightbox(null);
  const lightboxPrev = () =>
    setLightbox((lb) =>
      lb
        ? { ...lb, index: (lb.index - 1 + lb.media.length) % lb.media.length }
        : null,
    );
  const lightboxNext = () =>
    setLightbox((lb) =>
      lb ? { ...lb, index: (lb.index + 1) % lb.media.length } : null,
    );

  const load = useCallback(() => {
    setLoading(true);
    fetchAllReports()
      .then((data) =>
        setReports(
          data.filter(
            (r) => r.status === "pending" || r.status === "under_review",
          ),
        ),
      )
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Failed to load reports"),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pendingReports = useMemo(() => {
    return reports
      .filter(
        (r) =>
          !search ||
          r.description.toLowerCase().includes(search.toLowerCase()) ||
          r._id.toLowerCase().includes(search.toLowerCase()) ||
          r.user?.name?.toLowerCase().includes(search.toLowerCase()),
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [reports, search]);

  const handleAction = async (action: "rejected" | "resolved") => {
    if (!selectedReport) return;
    setActionLoading(true);
    setActionError("");
    try {
      const updated = await updateReportStatus(selectedReport._id, {
        status: action,
        adminNotes: adminNotes || undefined,
      });
      // Remove from pending list (it left pending/under_review)
      setReports((prev) => prev.filter((r) => r._id !== updated._id));
      setSelectedReport(null);
      setAdminNotes("");
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedReport) return;
    setActionLoading(true);
    setActionError("");
    try {
      const updated = await assignReport(selectedReport._id);
      // Update in list (now under_review with assignedTo)
      setReports((prev) =>
        prev.map((r) => (r._id === updated._id ? updated : r)),
      );
      setSelectedReport(updated);
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : "Assignment failed");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <Header
        title="Review Reports"
        subtitle="Review and take action on pending reports"
      />

      <div className="p-6 space-y-4">
        {/* Toolbar */}
        <div className="bg-surface rounded-2xl p-4 shadow-card flex items-center gap-4">
          <div className="w-80">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search pending reports..."
            />
          </div>
          <span className="ml-auto text-sm text-text-tertiary">
            {pendingReports.length} reports pending review
          </span>
        </div>

        {/* Loading / error */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        )}
        {!loading && error && (
          <div className="bg-surface rounded-2xl p-8 shadow-card flex items-center gap-3 text-danger">
            <AlertTriangle size={20} />
            <span className="text-sm font-medium">{error}</span>
            <button onClick={load} className="ml-auto text-xs underline">
              Retry
            </button>
          </div>
        )}

        {/* Report cards */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pendingReports.map((report) => (
              <div
                key={report._id}
                onClick={() => {
                  setSelectedReport(report);
                  setAdminNotes("");
                  setActionError("");
                }}
                className="bg-surface rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-semibold text-primary-500">
                    #{report._id.slice(-6).toUpperCase()}
                  </span>
                  <StatusBadge status={report.status} />
                </div>

                <p className="text-sm font-medium text-text-primary line-clamp-2 mb-3 group-hover:text-primary-600 transition-colors">
                  {report.description}
                </p>

                <div className="space-y-2">
                  {report.category && (
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <Tag size={13} className="text-text-tertiary" />
                      <span>{categoryLabel(report.category)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <MapPin size={13} className="text-text-tertiary" />
                    <span className="truncate font-mono">
                      {report.location.coordinates[1].toFixed(5)},{" "}
                      {report.location.coordinates[0].toFixed(5)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <Clock size={13} className="text-text-tertiary" />
                    <span>{formatDateTime(report.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <User size={13} className="text-text-tertiary" />
                    <span>{report.user?.name ?? "Unknown"}</span>
                  </div>
                  {report.assignedTo && (
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <Shield size={13} className="text-text-tertiary" />
                      <span>Assigned to {report.assignedTo.name}</span>
                    </div>
                  )}
                </div>

                {report.media.length > 0 && (
                  <div className="flex items-center justify-end mt-4 pt-3 border-t border-border-light">
                    <div className="flex items-center gap-1 text-xs text-text-tertiary">
                      <Image size={13} />
                      {report.media.length}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && !error && pendingReports.length === 0 && (
          <div className="bg-surface rounded-2xl p-16 shadow-card text-center">
            <CheckCircle2
              size={48}
              className="text-success mx-auto mb-3 opacity-50"
            />
            <p className="text-text-secondary font-medium">
              All caught up! No pending reports to review.
            </p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Modal
        open={selectedReport !== null}
        onClose={() => {
          setSelectedReport(null);
          setAdminNotes("");
          setActionError("");
        }}
        title={`Review Report #${selectedReport?._id.slice(-6).toUpperCase() ?? ""}`}
        maxWidth="max-w-3xl"
      >
        {selectedReport && (
          <div className="space-y-5">
            {/* Status */}
            <div className="flex items-center gap-3">
              <StatusBadge status={selectedReport.status} />
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1">
                Description
              </h4>
              <p className="text-sm text-text-primary leading-relaxed">
                {selectedReport.description}
              </p>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-4">
              {selectedReport.category && (
                <div className="bg-surface-secondary rounded-xl p-3 col-span-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Tag size={14} className="text-text-tertiary" />
                    <span className="text-xs font-medium text-text-tertiary">
                      Category
                    </span>
                  </div>
                  <p className="text-sm text-text-primary font-semibold">
                    {categoryLabel(selectedReport.category)}
                  </p>
                </div>
              )}
              <div className="bg-surface-secondary rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={14} className="text-text-tertiary" />
                  <span className="text-xs font-medium text-text-tertiary">
                    Coordinates
                  </span>
                </div>
                <p className="text-sm text-text-primary font-mono">
                  {selectedReport.location.coordinates[1].toFixed(5)},{" "}
                  {selectedReport.location.coordinates[0].toFixed(5)}
                </p>
              </div>
              <div className="bg-surface-secondary rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={14} className="text-text-tertiary" />
                  <span className="text-xs font-medium text-text-tertiary">
                    Submitted
                  </span>
                </div>
                <p className="text-sm text-text-primary">
                  {formatDateTime(selectedReport.createdAt)}
                </p>
              </div>
              <div className="bg-surface-secondary rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <User size={14} className="text-text-tertiary" />
                  <span className="text-xs font-medium text-text-tertiary">
                    Reporter
                  </span>
                </div>
                <p className="text-sm text-text-primary">
                  {selectedReport.user?.name ?? "Unknown"}
                </p>
                {selectedReport.user?.cpr && (
                  <p className="text-xs text-text-tertiary mt-0.5">
                    CPR: {selectedReport.user.cpr}
                  </p>
                )}
              </div>
              <div className="bg-surface-secondary rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Phone size={14} className="text-text-tertiary" />
                  <span className="text-xs font-medium text-text-tertiary">
                    Contact
                  </span>
                </div>
                <p className="text-sm text-text-primary">
                  {selectedReport.user?.phone ?? "—"}
                </p>
              </div>
              {selectedReport.assignedTo && (
                <div className="bg-surface-secondary rounded-xl p-3 col-span-2">
                  <div className="flex items-center gap-2 mb-1">
                    <UserCheck size={14} className="text-text-tertiary" />
                    <span className="text-xs font-medium text-text-tertiary">
                      Assigned To
                    </span>
                  </div>
                  <p className="text-sm text-text-primary font-semibold">
                    {selectedReport.assignedTo.name}
                  </p>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    {selectedReport.assignedTo.email}
                  </p>
                </div>
              )}
            </div>

            {/* Evidence */}
            {selectedReport.media.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">
                  Evidence ({selectedReport.media.length})
                </h4>
                <div className="flex gap-3 flex-wrap">
                  {selectedReport.media.map((m, i) => (
                    <button
                      key={i}
                      onClick={() => openLightbox(selectedReport.media, i)}
                      className="relative w-32 h-24 rounded-xl bg-surface-tertiary flex items-center justify-center overflow-hidden group hover:ring-2 hover:ring-primary-400 transition-all"
                    >
                      {m.mimetype?.startsWith("image") ? (
                        <>
                          <img
                            src={m.url}
                            alt="evidence"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-semibold transition-opacity">
                              View
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <video
                            src={m.url}
                            className="w-full h-full object-cover"
                            muted
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <Play
                              size={22}
                              className="text-white"
                              fill="white"
                            />
                          </div>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Admin notes */}
            <div>
              <h4 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">
                Admin Notes
              </h4>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                placeholder="Add notes about your decision..."
                className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-xl text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 resize-none"
              />
            </div>

            {/* Action error */}
            {actionError && (
              <div className="flex items-center gap-2 text-sm text-danger bg-danger/10 rounded-xl px-4 py-2">
                <AlertTriangle size={15} />
                {actionError}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2 border-t border-border flex-wrap">
              {/* Show "Assign to Me" only for pending reports */}
              {selectedReport.status === "pending" && (
                <button
                  onClick={handleAssign}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-info hover:bg-info/90 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  <UserCheck size={16} />
                  Assign to Me
                </button>
              )}
              {/* Show resolve/reject/confirm only for under_review reports */}
              {selectedReport.status === "under_review" && (
                <>
                  <button
                    onClick={() => handleAction("resolved")}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-success hover:bg-success/90 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 size={16} />
                    Resolve
                  </button>
                  <button
                    onClick={() => handleAction("rejected")}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-danger hover:bg-danger/90 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/90"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <XIcon size={20} className="text-white" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
            {lightbox.index + 1} / {lightbox.media.length}
          </div>

          {/* Prev */}
          {lightbox.media.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                lightboxPrev();
              }}
              className="absolute left-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <ChevronLeft size={22} className="text-white" />
            </button>
          )}

          {/* Media */}
          <div
            className="max-w-5xl max-h-[85vh] flex items-center justify-center px-16"
            onClick={(e) => e.stopPropagation()}
          >
            {lightbox.media[lightbox.index].mimetype?.startsWith("image") ? (
              <img
                src={lightbox.media[lightbox.index].url}
                alt="evidence fullscreen"
                className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl"
              />
            ) : (
              <video
                src={lightbox.media[lightbox.index].url}
                controls
                autoPlay
                className="max-w-full max-h-[85vh] rounded-xl shadow-2xl"
              />
            )}
          </div>

          {/* Next */}
          {lightbox.media.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                lightboxNext();
              }}
              className="absolute right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <ChevronRight size={22} className="text-white" />
            </button>
          )}

          {/* Thumbnail strip */}
          {lightbox.media.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
              {lightbox.media.map((m, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightbox((lb) => (lb ? { ...lb, index: i } : null));
                  }}
                  className={`w-12 h-9 rounded-lg overflow-hidden border-2 transition-all ${
                    i === lightbox.index
                      ? "border-white"
                      : "border-transparent opacity-50 hover:opacity-80"
                  }`}
                >
                  {m.mimetype?.startsWith("image") ? (
                    <img src={m.url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-white/20 flex items-center justify-center">
                      <Play size={12} className="text-white" fill="white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

