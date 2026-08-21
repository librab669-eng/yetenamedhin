"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Hospital, Lock, Loader2 } from "lucide-react";
import { useLang } from "@/lib/lang-context";

export default function LoginForm() {
  const { t, lang, setLang } = useLang();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hospitalName, setHospitalName] = useState(t("appName"));
  const [hospitalLogo, setHospitalLogo] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings/hospital-name")
      .then((r) => r.json())
      .then((data) => {
        if (data.hospitalName) setHospitalName(data.hospitalName);
        if (data.hospitalLogo) setHospitalLogo(data.hospitalLogo);
      })
      .catch(() => {});
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    if (res.ok) {
      const next = searchParams.get("next") || "/";
      router.push(next);
      router.refresh();
    } else {
      setError(t("invalidPin"));
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div className="card" style={{ maxWidth: 380, width: "100%", padding: 36 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            className="brand-logo"
            style={{ margin: "0 auto 16px", width: 64, height: 64, borderRadius: 20 }}
          >
            {hospitalLogo ? (
              <img src={hospitalLogo} alt={hospitalName} style={{ width: "100%", height: "100%", borderRadius: 20, objectFit: "cover" }} />
            ) : (
              <Hospital size={30} />
            )}
          </div>
          <h1 className="page-title" style={{ fontSize: 22 }}>
            {t("loginTitle")}
          </h1>
          <p className="page-sub" style={{ marginBottom: 0 }}>
            {hospitalName} — {t("appSubtitle")}
          </p>
        </div>

        <form onSubmit={submit}>
          <div className="field">
            <label className="label" htmlFor="pin">
              {t("enterPin")}
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: 12, top: 13, color: "var(--text-muted)" }} />
              <input
                id="pin"
                className="input"
                type="password"
                inputMode="numeric"
                maxLength={10}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                style={{ paddingLeft: 38 }}
                autoFocus
              />
            </div>
          </div>

          {error && (
            <div className="badge badge-red" style={{ display: "block", textAlign: "center", padding: "8px" }}>
              {error}
            </div>
          )}

          <button className="btn btn-primary w-100 btn-lg" type="submit" disabled={loading} style={{ marginTop: 16 }}>
            {loading ? <Loader2 size={18} className="spin" /> : null}
            {t("loginTitle")}
          </button>
        </form>

        <button
          className="btn w-100"
          style={{ marginTop: 16, background: "transparent", boxShadow: "none", color: "var(--primary)" }}
          onClick={() => setLang(lang === "en" ? "am" : "en")}
        >
          {lang === "en" ? "በአማርኛ ቀጥል" : "Continue in English"}
        </button>

        <p className="text-muted text-center" style={{ marginTop: 16, fontSize: 12 }}>
          {hospitalName} — {t("appSubtitle")}
        </p>
      </div>
    </div>
  );
}