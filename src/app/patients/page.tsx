"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Users, ArrowRight, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import { useLang } from "@/lib/lang-context";

interface PatientOption {
  id: number;
  fullName: string;
  cardNo: string | null;
  familyCode: string;
  familyHead: string;
  familyId: number;
}

export default function PatientsPage() {
  const { t } = useLang();
  const [query, setQuery] = useState("");
  const [year, setYear] = useState("");
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial load
  useEffect(() => {
    fetch("/api/patients/search", { credentials: "include" })
      .then((r) => r.json())
      .then(setPatients)
      .catch(() => setPatients([]))
      .finally(() => setLoading(false));
  }, []);

  // Search filter
  useEffect(() => {
    if (!query && !year) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (year) params.set("year", year);
    fetch(`/api/patients/search?${params}`, { credentials: "include" })
      .then((r) => r.json())
      .then(setPatients)
      .catch(() => setPatients([]))
      .finally(() => setLoading(false));
  }, [query, year]);

  return (
    <Layout>
      <div className="row-between mb-4">
        <div>
          <h1 className="page-title">{t("patients")}</h1>
          <p className="page-sub">{t("patientList")}</p>
        </div>
        <Link href="/patients/new" className="btn btn-primary">
          <Plus size={18} /> {t("registerPatient")}
        </Link>
      </div>

      <div className="card mb-4" style={{ padding: 16 }}>
        <div className="grid grid-3" style={{ gap: 12, alignItems: "flex-end" }}>
          <div className="field" style={{ flex: 1, minWidth: 250 }}>
            <label className="label">{t("search")}</label>
            <div style={{ position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: 12, top: 12, color: "var(--text-muted)" }} />
              <input
                className="input"
                placeholder={t("selectPatient")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ paddingLeft: 36 }}
              />
            </div>
          </div>
          <div className="field" style={{ minWidth: 140 }}>
            <label className="label">{t("year")}</label>
            <select className="select" value={year} onChange={(e) => setYear(e.target.value)}>
              <option value="">{t("allYears")}</option>
              {Array.from({ length: 5 }, (_, i) => 2015 + i)
                .reverse()
                .map((y) => (
                  <option key={y} value={y}>{y} EC</option>
                ))}
            </select>
          </div>
          {loading ? <div className="row" style={{ alignItems: "center" }}><Loader2 size={18} className="spin" /> Searching...</div> : null}
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }} suppressHydrationWarning>
        {loading ? (
          <div className="empty-state" style={{ padding: 32 }} suppressHydrationWarning>
            <Loader2 size={48} className="spin" />
            <p>Loading patients...</p>
          </div>
        ) : patients.length === 0 ? (
          <div className="empty-state" style={{ padding: 32 }}>
            <Users size={48} />
            <p>{t("noData")}</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>{t("name")}</th>
                <th>{t("cardNo")}</th>
                <th>{t("familyCode")}</th>
                <th>{t("familyHead")}</th>
                <th>{t("year")}</th>
                <th>{t("expenses")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 700 }}>{p.fullName}</td>
                  <td>{p.cardNo || "—"}</td>
                  <td>{p.familyCode}</td>
                  <td>{p.familyHead}</td>
                  <td>{p.familyId} EC</td>
                  <td>
                    <span className="badge badge-blue">—</span>
                  </td>
                  <td>
                    <Link href={`/patients/${p.id}`} className="btn btn-sm btn-ghost">
                      Open <ArrowRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}