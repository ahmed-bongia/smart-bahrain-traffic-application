import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Car, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirm) {
      setError("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await register(name, email, password);
      // AuthContext sets admin state Ã¢â€ â€™ App.tsx redirects to /dashboard
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 16px",
    background: "var(--color-surface-secondary)",
    border: "1px solid var(--color-border)",
    borderRadius: "10px",
    fontSize: "14px",
    color: "var(--color-text-primary)",
    outline: "none",
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
    transition: "border-color 0.15s",
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "var(--color-primary-500)";
    e.target.style.boxShadow = "0 0 0 3px var(--shadow-primary-focus)";
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "var(--color-border)";
    e.target.style.boxShadow = "none";
  };

  // Password strength indicator
  const strength =
    password.length === 0
      ? 0
      : password.length < 6
        ? 1
        : password.length < 10
          ? 2
          : 3;
  const strengthColors = ["var(--color-border)", "var(--color-danger)", "var(--color-warning)", "var(--color-success)"];
  const strengthLabels = ["", "Weak", "Fair", "Strong"];

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
          <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginTop: "4px" }}>
            Admin Dashboard
          </p>
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
            Create Admin Account
          </h2>
          <p
            style={{ fontSize: "14px", color: "var(--color-text-secondary)", margin: "0 0 24px 0" }}
          >
            Register a new administrator account
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
            {/* Full Name */}
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
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Smith"
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

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
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
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
                  placeholder="Min. 6 characters"
                  style={{ ...inputStyle, padding: "10px 44px 10px 16px" }}
                  onFocus={onFocus}
                  onBlur={onBlur}
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
              {/* Strength bar */}
              {password.length > 0 && (
                <div style={{ marginTop: "8px" }}>
                  <div
                    style={{
                      display: "flex",
                      gap: "4px",
                      marginBottom: "4px",
                    }}
                  >
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: "3px",
                          borderRadius: "4px",
                          background:
                            i <= strength
                              ? strengthColors[strength]
                              : "var(--color-border)",
                          transition: "background 0.2s",
                        }}
                      />
                    ))}
                  </div>
                  <span
                    style={{
                      fontSize: "12px",
                      color: strengthColors[strength],
                      fontWeight: 500,
                    }}
                  >
                    {strengthLabels[strength]}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
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
                Confirm Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter password"
                  style={{ ...inputStyle, padding: "10px 44px 10px 16px" }}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
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
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {/* Match check icon */}
                {confirm.length > 0 && password === confirm && (
                  <CheckCircle2
                    size={16}
                    color="var(--color-success)"
                    style={{
                      position: "absolute",
                      right: "40px",
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  />
                )}
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
                marginTop: "4px",
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
              {loading ? "Creating accountÃ¢â‚¬Â¦" : "Create Account"}
            </button>
          </form>
        </div>

        {/* Link to login */}
        <p
          style={{
            textAlign: "center",
            fontSize: "14px",
            color: "var(--color-text-secondary)",
            marginTop: "20px",
          }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "var(--color-primary-500)",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Sign in
          </Link>
        </p>

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


