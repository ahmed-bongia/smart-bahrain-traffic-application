import { useState, useMemo, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { SearchBar, StatusBadge } from "@/components/ui";
import { fetchAllReports } from "@/services/api";
import type { BackendReport } from "@/services/api";
import { MapPin, AlertTriangle } from "lucide-react";
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

export default function RejectedReportsPage() {
  const [allReports, setAllReports] = useState<BackendReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    fetchAllReports()
      .then((data) =>
        setAllReports(data.filter((r) => r.status === "rejected")),
      )
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Failed to load reports"),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const reports = useMemo(() => {
    return allReports
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
  }, [allReports, search]);

  return (
    <div>
      <Header
        title="Rejected Reports"
        subtitle="Reports that have been reviewed and rejected"
      />

      <div className="p-6 space-y-4">
        <div className="bg-surface rounded-2xl p-4 shadow-card flex items-center gap-4">
          <div className="w-80">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search rejected reports..."
            />
          </div>
          <span className="ml-auto text-sm text-text-tertiary">
            {reports.length} rejected reports
          </span>
        </div>

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

        {!loading && !error && (
          <div className="bg-surface rounded-2xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-3.5 font-semibold text-text-secondary text-xs uppercase tracking-wider">
                      Report ID
                    </th>
                    <th className="text-left px-5 py-3.5 font-semibold text-text-secondary text-xs uppercase tracking-wider">
                      Reporter
                    </th>
                    <th className="text-left px-5 py-3.5 font-semibold text-text-secondary text-xs uppercase tracking-wider">
                      CPR
                    </th>
                    <th className="text-left px-5 py-3.5 font-semibold text-text-secondary text-xs uppercase tracking-wider">
                      Category
                    </th>
                    <th className="text-left px-5 py-3.5 font-semibold text-text-secondary text-xs uppercase tracking-wider">
                      Description
                    </th>
                    <th className="text-left px-5 py-3.5 font-semibold text-text-secondary text-xs uppercase tracking-wider">
                      Coordinates
                    </th>
                    <th className="text-left px-5 py-3.5 font-semibold text-text-secondary text-xs uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="text-left px-5 py-3.5 font-semibold text-text-secondary text-xs uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="text-left px-5 py-3.5 font-semibold text-text-secondary text-xs uppercase tracking-wider">
                      Admin Notes
                    </th>
                    <th className="text-left px-5 py-3.5 font-semibold text-text-secondary text-xs uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr
                      key={report._id}
                      className="border-b border-border-light hover:bg-surface-secondary/50 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-medium text-primary-600">
                        #{report._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-5 py-3.5 text-text-primary">
                        {report.user?.name ?? "—"}
                      </td>
                      <td className="px-5 py-3.5 text-text-secondary font-mono text-xs">
                        {report.user?.cpr ?? "—"}
                      </td>
                      <td className="px-5 py-3.5 text-text-primary whitespace-nowrap">
                        {categoryLabel(report.category)}
                      </td>
                      <td className="px-5 py-3.5 text-text-primary max-w-xs truncate">
                        {report.description}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <MapPin
                            size={14}
                            className="text-text-tertiary shrink-0"
                          />
                          <span className="text-text-secondary font-mono text-xs">
                            {report.location.coordinates[1].toFixed(4)},{" "}
                            {report.location.coordinates[0].toFixed(4)}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-text-tertiary text-xs">
                        {formatDateTime(report.createdAt)}
                      </td>
                      <td className="px-5 py-3.5 text-text-secondary text-xs whitespace-nowrap">
                        {report.assignedTo?.name ?? "Unassigned"}
                      </td>
                      <td className="px-5 py-3.5 text-text-secondary text-xs max-w-xs truncate">
                        {report.adminNotes ?? "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={report.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {reports.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-text-tertiary text-sm">
                  No rejected reports found.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

