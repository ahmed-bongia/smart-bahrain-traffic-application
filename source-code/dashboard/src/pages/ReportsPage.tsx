import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { SearchBar, StatusBadge } from "@/components/ui";
import { fetchAllReports } from "@/services/api";
import type { BackendReport } from "@/services/api";
import type { ReportStatus } from "@/types";
import { MapPin, Filter, AlertTriangle } from "lucide-react";
import { categoryLabel } from "@/lib/utils";

const STATUS_FILTERS: { label: string; value: ReportStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Under Review", value: "under_review" },
  { label: "Rejected", value: "rejected" },
  { label: "Resolved", value: "resolved" },
];

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ReportsPage() {
  const [reports, setReports] = useState<BackendReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "all">("all");

  useEffect(() => {
    fetchAllReports()
      .then(setReports)
      .catch((e) => setError(e.message ?? "Failed to load reports"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return reports
      .filter((r) => statusFilter === "all" || r.status === statusFilter)
      .filter(
        (r) =>
          !search ||
          r.description.toLowerCase().includes(search.toLowerCase()) ||
          r._id.toLowerCase().includes(search.toLowerCase()) ||
          r.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
          r.user?.cpr?.includes(search) ||
          (r.category &&
            categoryLabel(r.category)
              .toLowerCase()
              .includes(search.toLowerCase())),
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [reports, search, statusFilter]);

  return (
    <div>
      <Header
        title="All Reports"
        subtitle="View and manage all submitted traffic reports"
      />

      <div className="p-6 space-y-4">
        <div className="bg-surface rounded-2xl p-4 shadow-card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="w-full sm:w-80">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search reports, reporters, CPR..."
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={16} className="text-text-tertiary" />
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === f.value
                      ? "bg-primary-500 text-white"
                      : "bg-surface-tertiary text-text-secondary hover:bg-surface-secondary"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <span className="ml-auto text-sm text-text-tertiary whitespace-nowrap">
              {loading ? "Loading…" : `${filtered.length} reports`}
            </span>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-danger-bg border border-danger/20 rounded-2xl px-5 py-4">
            <AlertTriangle size={18} className="text-danger" />
            <p className="text-sm text-danger font-medium">{error}</p>
          </div>
        )}

        <div className="bg-surface rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {[
                    "Report ID",
                    "Reporter",
                    "CPR",
                    "Category",
                    "Description",
                    "Coordinates",
                    "Submitted",
                    "Assigned To",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3.5 font-semibold text-text-secondary text-xs uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((report) => (
                  <tr
                    key={report._id}
                    className="border-b border-border-light hover:bg-surface-secondary/50 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-mono text-xs text-primary-600 whitespace-nowrap">
                      #{report._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-5 py-3.5 text-text-primary whitespace-nowrap">
                      {report.user?.name ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-text-secondary font-mono text-xs whitespace-nowrap">
                      {report.user?.cpr ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-text-primary whitespace-nowrap">
                      {categoryLabel(report.category)}
                    </td>
                    <td className="px-5 py-3.5 max-w-55">
                      <p className="truncate text-text-primary">
                        {report.description}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-text-tertiary text-xs whitespace-nowrap">
                      {report.location?.coordinates ? (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {report.location.coordinates[1].toFixed(4)},{" "}
                          {report.location.coordinates[0].toFixed(4)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-text-tertiary text-xs whitespace-nowrap">
                      {formatDateTime(report.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-text-secondary text-xs whitespace-nowrap">
                      {report.assignedTo?.name ?? "Unassigned"}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={report.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && filtered.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-text-tertiary text-sm">No reports found.</p>
            </div>
          )}
          {loading && (
            <div className="py-16 flex items-center justify-center gap-3">
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  border: "2px solid var(--color-primary-500)",
                  borderTopColor: "transparent",
                  animation: "spin 0.7s linear infinite",
                }}
              />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <p className="text-sm text-text-tertiary">Loading reports…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

