"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, Pill, Receipt, BarChart3, Settings, LogOut, Languages, Hospital } from "lucide-react";
import { useLang } from "@/lib/lang-context";

const navItems = [
  { href: "/", key: "dashboard", icon: LayoutDashboard },
  { href: "/patients", key: "patients", icon: Users },
  { href: "/medicines", key: "medicines", icon: Pill },
  { href: "/expenses", key: "expenses", icon: Receipt },
  { href: "/reports", key: "reports", icon: BarChart3 },
  { href: "/settings", key: "settings", icon: Settings },
] as const;

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { lang, setLang, t } = useLang();
  const [hospitalName, setHospitalName] = useState(t("appName"));
  const [subtitle, setSubtitle] = useState(t("appSubtitle"));
  const [hospitalLogo, setHospitalLogo] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings/hospital-name")
      .then((r) => r.json())
      .then((data) => {
        if (data.hospitalName) {
          setHospitalName(data.hospitalName);
          setSubtitle(t("appSubtitle"));
        }
        if (data.hospitalLogo) {
          setHospitalLogo(data.hospitalLogo);
        }
      })
      .catch(() => {});
  }, [t]);

  const logout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <div className="app-shell">
      <aside className="sidebar no-print">
        <div className="sidebar-brand">
          <div className="brand-logo">
            {hospitalLogo ? (
              <img src={hospitalLogo} alt={hospitalName} style={{ width: 40, height: 40, borderRadius: 10, objectFit: "cover" }} />
            ) : (
              <Hospital size={22} />
            )}
          </div>
          <div>
            <div className="brand-name">{hospitalName}</div>
            <div className="brand-sub">{subtitle}</div>
          </div>
        </div>

        <nav>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className={`nav-item ${active ? "active" : ""}`}>
                <Icon size={18} />
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="btn w-100 mb-4" onClick={() => setLang(lang === "en" ? "am" : "en")}>
            <Languages size={18} />
            {lang === "en" ? "አማርኛ" : "English"}
          </button>
          <button className="btn w-100" onClick={logout}>
            <LogOut size={18} />
            {t("logout")}
          </button>
        </div>
      </aside>

      <main className="main">{children}</main>
    </div>
  );
}