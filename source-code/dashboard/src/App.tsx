import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import ReportsPage from "@/pages/ReportsPage";
import ReviewReportsPage from "@/pages/ReviewReportsPage";
import VerifiedReportsPage from "@/pages/VerifiedReportsPage";
import RejectedReportsPage from "@/pages/RejectedReportsPage";
import ModeratorsPage from "@/pages/ModeratorsPage";
import UsersPage from "@/pages/UsersPage";
import SettingsPage from "@/pages/SettingsPage";
import PublicEmergencyPage from "@/pages/PublicEmergencyPage";

// Auth guard wrappers

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-surface-secondary)",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "3px solid var(--color-primary-500)",
            borderTopColor: "transparent",
            animation: "spin 0.7s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function GuestOnly({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <>{children}</>
  );
}

function RequireRole({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: Array<"admin" | "moderator">;
}) {
  const { admin, isLoading } = useAuth();

  if (isLoading) return null;

  return admin && allowedRoles.includes(admin.role) ? (
    <>{children}</>
  ) : (
    <Navigate to="/dashboard" replace />
  );
}

// App

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={
          <GuestOnly>
            <LoginPage />
          </GuestOnly>
        }
      />
      <Route
        path="/register"
        element={
          <GuestOnly>
            <RegisterPage />
          </GuestOnly>
        }
      />
      <Route
        path="/public/emergency/:token"
        element={<PublicEmergencyPage />}
      />

      {/* Protected - wrapped by DashboardLayout */}
      <Route
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="review" element={<ReviewReportsPage />} />
        <Route path="verified" element={<VerifiedReportsPage />} />
        <Route path="rejected" element={<RejectedReportsPage />} />
        <Route
          path="moderators"
          element={
            <RequireRole allowedRoles={["admin"]}>
              <ModeratorsPage />
            </RequireRole>
          }
        />
        <Route
          path="users"
          element={
            <RequireRole allowedRoles={["admin"]}>
              <UsersPage />
            </RequireRole>
          }
        />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

