import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/ui";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Users,
  AlertTriangle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchDashboardStats } from "@/services/api";
import type { DashboardStatsResponse } from "@/services/api";
export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch((e) => setError(e.message ?? "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  const changePercent =
    stats && stats.reportsLastMonth > 0
      ? Math.round(
          ((stats.reportsThisMonth - stats.reportsLastMonth) /
            stats.reportsLastMonth) *
            100,
        )
      : 0;

  if (loading) {
    return (
      <div>
        <Header
          title="Dashboard"
          subtitle="Traffic incident management overview"
        />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "300px",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "3px solid var(--color-primary-500)",
              borderTopColor: "transparent",
              animation: "spin 0.7s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header
          title="Dashboard"
          subtitle="Traffic incident management overview"
        />
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
      <Header
        title="Dashboard"
        subtitle="Traffic incident management overview"
      />

      <div className="p-6 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Reports"
            value={stats!.total}
            change={changePercent}
            changeLabel="vs last month"
            icon={<FileText size={20} />}
          />
          <StatCard
            title="Pending Review"
            value={stats!.pending + stats!.under_review}
            icon={<Clock size={20} />}
          />
          <StatCard
            title="Resolved"
            value={stats!.resolved}
            icon={<CheckCircle2 size={20} />}
          />
          <StatCard
            title="Total Users"
            value={stats!.totalUsers}
            icon={<Users size={20} />}
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Monthly area chart */}
          <div className="lg:col-span-2 bg-surface rounded-2xl p-5 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-text-primary">
                  Monthly Reports
                </h3>
                <p className="text-xs text-text-tertiary mt-0.5">
                  Incident reports over the past 6 months
                </p>
              </div>
            </div>
            {stats!.monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={stats!.monthlyData}>
                  <defs>
                    <linearGradient
                      id="colorReports"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--color-primary-500)"
                        stopOpacity={0.15}
                      />
                      <stop offset="95%" stopColor="var(--color-primary-500)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-surface-tertiary)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "var(--color-text-tertiary)", fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "var(--color-text-tertiary)", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "12px",
                      fontSize: "13px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="reports"
                    stroke="var(--color-primary-500)"
                    strokeWidth={2.5}
                    fill="url(#colorReports)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-65 flex items-center justify-center text-text-tertiary text-sm">
                No data yet
              </div>
            )}
          </div>

          {/* Status breakdown bar chart */}
          <div className="bg-surface rounded-2xl p-5 shadow-card">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-text-primary">
                Status Breakdown
              </h3>
              <p className="text-xs text-text-tertiary mt-0.5">
                Reports by current status
              </p>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats!.statusBreakdown}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-surface-tertiary)"
                  vertical={false}
                />
                <XAxis
                  dataKey="status"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--color-text-tertiary)", fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--color-text-tertiary)", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "12px",
                    fontSize: "13px",
                  }}
                />
                <Bar dataKey="count" fill="var(--color-primary-500)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stat summary row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Pending",
              value: stats!.pending,
              color: "var(--color-warning)",
              bg: "var(--color-warning-bg)",
            },
            {
              label: "Under Review",
              value: stats!.under_review,
              color: "var(--color-info)",
              bg: "var(--color-info-bg)",
            },
            {
              label: "Resolved",
              value: stats!.resolved,
              color: "var(--color-primary-500)",
              bg: "var(--color-primary-50)",
            },
            {
              label: "Rejected",
              value: stats!.rejected,
              color: "var(--color-danger)",
              bg: "var(--color-danger-bg)",
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: item.bg,
                borderRadius: "16px",
                padding: "16px 20px",
              }}
            >
              <div
                style={{ fontSize: "24px", fontWeight: 700, color: item.color }}
              >
                {item.value}
              </div>
              <div
                style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginTop: "2px" }}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* Rejected stat */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Rejected"
            value={stats!.rejected}
            icon={<XCircle size={20} className="text-danger" />}
            iconBg="bg-danger-bg"
          />
          <StatCard
            title="Resolved"
            value={stats!.resolved}
            icon={<CheckCircle2 size={20} className="text-success" />}
            iconBg="bg-success-bg"
          />
          <StatCard
            title="This Month"
            value={stats!.reportsThisMonth}
            change={changePercent}
            changeLabel="vs last month"
            icon={<TrendingUp size={20} className="text-primary-500" />}
            iconBg="bg-primary-50"
          />
        </div>
      </div>
    </div>
  );
}

