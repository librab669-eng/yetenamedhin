"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, Users, ArrowRight } from "lucide-react";
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

interface PatientsClientProps {
  initialPatients: PatientOption[];
  currentEthYear: number;
}

export default function PatientsClient({ initialPatients, currentEthYear }: PatientsClientProps) {
  const { t } = useLang();
  const [query, setQuery] = useState("");
  const [year, setYear] = useState("");

  // Dynamic year range: current year - 10 to current year + 2
  const yearOptions = useMemo(() => {
    const years = [];
    for (let y = currentEthYear + 2; y >= currentEthYear - 10; y--) {
      years.push(y);
    }
    return years;
  }, [currentEthYear]);

  // Local filtering - instant, no flicker
  const filteredPatients = useMemo(() => {
    return initialPatients.filter((p) => {
      const matchesQuery =
        !query ||
        p.fullName.toLowerCase().includes(query.toLowerCase()) ||
        p.cardNo?.toLowerCase().includes(query.toLowerCase()) ||
        p.familyCode.toLowerCase().includes(query.toLowerCase()) ||
        p.familyHead.toLowerCase().includes(query.toLowerCase());
      const matchesYear = !year || p.familyId === parseInt(year, 10);
      return matchesQuery && matchesYear;
    });
  }, [initialPatients, query, year]);

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
              {yearOptions.map((y) => (
                <option key={y} value={y}>{y} EC</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        {filteredPatients.length === 0 ? (
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
              {filteredPatients.map((p) => (
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