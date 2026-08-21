import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

function Loading() {
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
      <div className="card" style={{ maxWidth: 380, width: "100%", padding: 36, textAlign: "center" }}>
        <div className="brand-logo" style={{ margin: "0 auto 16px", width: 64, height: 64, borderRadius: 20 }} />
        <div style={{ height: 24, background: "var(--bg-tertiary)", borderRadius: 8, margin: "0 auto 12px", maxWidth: 200 }} />
        <div style={{ height: 16, background: "var(--bg-tertiary)", borderRadius: 8, margin: "0 auto 8px", maxWidth: 150 }} />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Loading />}>
      <LoginForm />
    </Suspense>
  );
}