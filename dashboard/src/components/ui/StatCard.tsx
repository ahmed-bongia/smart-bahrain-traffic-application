import { type ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: ReactNode;
  iconBg?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  iconBg = "bg-primary-50",
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="bg-surface rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <span className="text-sm font-medium text-text-secondary">{title}</span>
        <div
          className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}
        >
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-text-primary tracking-tight">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {change !== undefined && (
        <div className="flex items-center gap-1.5 mt-2">
          {isPositive ? (
            <TrendingUp size={14} className="text-success" />
          ) : (
            <TrendingDown size={14} className="text-danger" />
          )}
          <span
            className={`text-xs font-semibold ${isPositive ? "text-success" : "text-danger"}`}
          >
            {isPositive ? "+" : ""}
            {change}%
          </span>
          <span className="text-xs text-text-tertiary">{changeLabel}</span>
        </div>
      )}
    </div>
  );
}

