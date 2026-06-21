import { useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { Car, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Network request failed";
      setError(errorMsg || "Invalid email or password");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-surface-secondary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* Logo */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "var(--color-primary-500)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "16px",
              boxShadow: "0 8px 20px var(--shadow-primary-soft)",
            }}
          >
            <Car size={28} color="white" />
          </div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              margin: 0,
            }}
          >
            Smart Bahrain
          </h1>
        </div>

        {/* Card */}
        <div
          style={{
            background: "var(--color-surface)",
            borderRadius: "16px",
            border: "1px solid var(--color-border)",
            padding: "32px",
            boxShadow:
              "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "var(--color-text-primary)",
              margin: "0 0 4px 0",
            }}
          >
            Welcome Back
          </h2>
          <p
            style={{ fontSize: "14px", color: "var(--color-text-secondary)", margin: "0 0 24px 0" }}
          >
            Sign in to manage traffic incident reports
          </p>

          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "var(--color-danger-bg)",
                border: "1px solid var(--border-danger-soft)",
                borderRadius: "12px",
                padding: "12px 16px",
                marginBottom: "20px",
              }}
            >
              <AlertCircle
                size={16}
                color="var(--color-danger)"
                style={{ flexShrink: 0 }}
              />
              <span
                style={{ fontSize: "14px", color: "var(--color-danger)", fontWeight: 500 }}
              >
                {error}
              </span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {/* Email */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "var(--color-text-primary)",
                  marginBottom: "6px",
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@test.com"
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  background: "var(--color-surface-secondary)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "10px",
                  fontSize: "14px",
                  color: "var(--color-text-primary)",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.15s",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--color-primary-500)";
                  e.target.style.boxShadow = "0 0 0 3px var(--shadow-primary-focus)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--color-border)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "var(--color-text-primary)",
                  marginBottom: "6px",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{
                    width: "100%",
                    padding: "10px 44px 10px 16px",
                    background: "var(--color-surface-secondary)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "10px",
                    fontSize: "14px",
                    color: "var(--color-text-primary)",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.15s",
                    fontFamily: "inherit",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--color-primary-500)";
                    e.target.style.boxShadow = "0 0 0 3px var(--shadow-primary-focus)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--color-border)";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--color-text-tertiary)",
                    display: "flex",
                    alignItems: "center",
                    padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "11px",
                background: loading ? "var(--color-primary-400)" : "var(--color-primary-500)",
                color: "white",
                fontSize: "14px",
                fontWeight: 600,
                borderRadius: "10px",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 12px var(--shadow-primary-soft)",
                transition: "background 0.15s",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => {
                if (!loading)
                  (e.target as HTMLButtonElement).style.background = "var(--color-primary-600)";
              }}
              onMouseLeave={(e) => {
                if (!loading)
                  (e.target as HTMLButtonElement).style.background = "var(--color-primary-500)";
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: "12px",
            color: "var(--color-text-tertiary)",
            marginTop: "12px",
          }}
        >
          Smart Bahrain Traffic Management System v1.0
        </p>
      </div>
    </div>
  );
}


