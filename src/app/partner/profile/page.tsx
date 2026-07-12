"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/services";
import { UserProfile } from "@/lib/interfaces/auth";

export default function PartnerProfile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser || currentUser.role !== "partner") {
        router.push("/login");
      } else {
        setUser(currentUser);
        setBio(currentUser.bio || "");
        setAvatarUrl(currentUser.avatarUrl || "");
      }
      setLoading(false);
    }
    loadUser();
  }, [router]);

  // Auto-save bio (description) with a 1-second debounce
  useEffect(() => {
    if (!user || bio === (user.bio || "")) return;
    const timer = setTimeout(() => {
      authService.updateProfile({ bio }).catch(console.error);
      setUser({ ...user, bio });
    }, 1000);
    return () => clearTimeout(timer);
  }, [bio, user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    const file = e.target.files[0];
    setUploadingAvatar(true);
    try {
      const newAvatarUrl = await authService.uploadAvatar(user.id, file);
      setAvatarUrl(newAvatarUrl);
      await authService.updateProfile({ avatarUrl: newAvatarUrl });
    } catch (err) {
      alert("Error uploading avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading)
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-gradient)",
        color: "var(--foreground)",
        padding: "3rem 2rem",
      }}
    >
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <a
          href="/partner"
          style={{
            color: "var(--primary)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "2rem",
            fontWeight: 700,
          }}
        >
          ← Назад
        </a>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <h2 style={{ fontSize: "2.2rem", fontWeight: 800 }}>
            Профиль Агента
          </h2>
        </div>

        <div
          className="panel"
          style={{
            padding: "1.8rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            border: "1px solid var(--surface-border)",
            background: "var(--glass-bg)",
            borderRadius: "20px",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "flex-start", gap: "1.5rem" }}
          >
            <div style={{ position: "relative", flexShrink: 0 }}>
              <img
                src={
                  avatarUrl ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`
                }
                alt="Avatar"
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid var(--primary)",
                }}
              />
              <label
                style={{
                  position: "absolute",
                  bottom: -4,
                  right: -4,
                  background: "var(--primary)",
                  color: "#000",
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  opacity: uploadingAvatar ? 0.5 : 1,
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
                <span style={{ fontSize: "14px" }}>
                  {uploadingAvatar ? "⏳" : "📷"}
                </span>
              </label>
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "0.6rem",
                }}
              >
                <label
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    opacity: 0.7,
                    letterSpacing: "0.5px",
                  }}
                >
                  О себе (Bio) / Имя
                </label>
                {user?.isVerified && (
                  <span
                    title="Верифицировано"
                    style={{ color: "var(--primary)", fontSize: "1rem" }}
                  >
                    ✓
                  </span>
                )}
              </div>
              <textarea
                className="input-field"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Кратко о себе..."
                style={{
                  width: "100%",
                  minHeight: "80px",
                  resize: "vertical",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--surface-border)",
                  color: "var(--foreground)",
                  padding: "10px",
                  borderRadius: "8px",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
