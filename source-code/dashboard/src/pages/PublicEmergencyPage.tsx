import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  fetchPublicEmergencyProfile,
  type PublicEmergencyProfile,
} from "@/services/api";

export default function PublicEmergencyPage() {
  const { token } = useParams();
  const [data, setData] = useState<PublicEmergencyProfile | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setError("Invalid link");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetchPublicEmergencyProfile(token);
        setData(res);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Profile not found");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-surface-secondary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "560px",
          background: "var(--color-surface)",
          borderRadius: "18px",
          border: "1px solid var(--color-border)",
          padding: "28px",
          boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
        }}
      >
        {loading ? (
          <div style={{ textAlign: "center", color: "var(--color-text-tertiary)" }}>
            Loading emergency information...
          </div>
        ) : error ? (
          <div style={{ textAlign: "center" }}>
            <h2 style={{ margin: "0 0 6px 0", color: "var(--color-danger)" }}>
              Unable to load profile
            </h2>
            <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>{error}</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: "18px" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 10px",
                  borderRadius: "999px",
                  background: "var(--color-success-bg)",
                  color: "var(--color-success)",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                Emergency Contacts
              </div>
              <h1
                style={{
                  margin: "12px 0 4px 0",
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                }}
              >
                {data?.name}
              </h1>
              <p style={{ margin: 0, color: "var(--color-text-tertiary)", fontSize: "13px" }}>
                Last updated: {data?.updatedAt ? new Date(data.updatedAt).toLocaleString() : "-"}
              </p>
            </div>

            <div style={{ display: "grid", gap: "12px" }}>
              {data?.emergencyContacts?.map((contact, index) => (
                <div
                  key={`${contact.name}-${index}`}
                  style={{
                    border: "1px solid var(--color-border)",
                    borderRadius: "14px",
                    padding: "14px",
                    background: "var(--color-surface-secondary)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "var(--color-text-primary)",
                      marginBottom: "4px",
                    }}
                  >
                    {contact.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--color-text-tertiary)" }}>
                    {contact.relationship || "Relationship not specified"}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "var(--color-primary-500)",
                      marginTop: "8px",
                    }}
                  >
                    {contact.phone}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Link to="/" style={{ fontSize: "12px", color: "var(--color-text-tertiary)" }}>
            Powered by Smart Bahrain
          </Link>
        </div>
      </div>
    </div>
  );
}