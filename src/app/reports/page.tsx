"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, Printer, FileSpreadsheet, Filter, RefreshCw } from "lucide-react";
import { useLang } from "@/lib/lang-context";
import { todayEth, ethMonthName } from "@/lib/ethcal";
import EthDatePicker from "@/components/EthDatePicker";
import ExpenseChart from "@/components/ExpenseChart";
import Layout from "@/components/Layout";

interface ReportData {
  type: string;
  from: string | null;
  to: string | null;
  summary: { count: number; quantity: number; total: number };
  byMedicine: { medicineId: number; name: string; unit: string; quantity: number; total: number }[];
  byPatient: { patientId: number; name: string; familyCode: string; quantity: number; total: number }[];
  monthly: { ethYear: number; ethMonth: number; total: number }[];
}

const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2 });

export default function ReportsPage() {
  const { t, lang } = useLang();
  const today = useMemo(() => todayEth(), []);
  const [type, setType] = useState("monthly");
  const [from, setFrom] = useState({ year: today.year, month: today.month, day: 1 });
  const [to, setTo] = useState({ year: today.year, month: today.month, day: today.day });
  const [patientId, setPatientId] = useState("");
  const [medicineId, setMedicineId] = useState("");
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [patientQuery, setPatientQuery] = useState("");
  const [patientResults, setPatientResults] = useState<{ id: number; fullName: string; familyCode: string }[]>([]);
  const [medicines, setMedicines] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    fetch("/api/medicines")
      .then((r) => r.json())
      .then(setMedicines)
      .catch(() => {});
  }, []);

  const loadReport = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ type, from: `${from.year}-${String(from.month).padStart(2, "0")}-${String(from.day).padStart(2, "0")}`, to: `${to.year}-${String(to.month).padStart(2, "0")}-${String(to.day).padStart(2, "0")}` });
    if (patientId) params.set("patientId", patientId);
    if (medicineId) params.set("medicineId", medicineId);
    const res = await fetch(`/api/reports?${params}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, [type, from, to, patientId, medicineId]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  useEffect(() => {
    const delay = setTimeout(async () => {
      const q = patientQuery.trim();
      if (q.length < 2) {
        setPatientResults([]);
        return;
      }
      const res = await fetch(`/api/patients/search?q=${encodeURIComponent(q)}`);
      if (res.ok) setPatientResults(await res.json());
    }, 300);
    return () => clearTimeout(delay);
  }, [patientQuery]);

  const exportExcel = async () => {
    const params = new URLSearchParams({ type, from: `${from.year}-${String(from.month).padStart(2, "0")}-${String(from.day).padStart(2, "0")}`, to: `${to.year}-${String(to.month).padStart(2, "0")}-${String(to.day).padStart(2, "0")}` });
    if (patientId) params.set("patientId", patientId);
    if (medicineId) params.set("medicineId", medicineId);
    const res = await fetch(`/api/export?${params}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `yetena_report_${Date.now()}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const periodLabel = (() => {
    if (type === "daily") return `${to.day} ${ethMonthName(to.year, to.month, lang)} ${to.year}`;
    if (type === "weekly") return `${from.day} ${ethMonthName(from.year, from.month, lang)} ${from.year} — ${to.day} ${ethMonthName(to.year, to.month, lang)} ${to.year}`;
    if (type === "yearly") return `${to.year} EC`;
    return `${from.day} ${ethMonthName(from.year, from.month, lang)} ${from.year} — ${to.day} ${ethMonthName(to.year, to.month, lang)} ${to.year}`;
  })();

  const chartData = data?.monthly.map((m) => ({
    name: `${ethMonthName(m.ethYear, m.ethMonth, "en").slice(0, 3)} ${m.ethYear}`,
    total: Math.round(m.total),
  })) ?? [];

  return (
    <Layout>
      <div className="row-between mb-4">
        <div>
          <h1 className="page-title">{t("reportBuilder")}</h1>
          <p className="page-sub">Generate deep reports for government reporting</p>
        </div>
        <div className="row">
          <button className="btn btn-primary" onClick={loadReport}>
            <RefreshCw size={18} /> {t("generate")}
          </button>
          <button className="btn" onClick={exportExcel}>
            <Download size={18} /> {t("export")}
          </button>
          <button className="btn" onClick={() => window.print()}>
            <Printer size={18} /> {t("print")}
          </button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="grid grid-2">
          <div className="field">
            <label className="label">{t("period")}</label>
            <div className="row" style={{ gap: 8 }}>
              {(["daily", "weekly", "monthly", "yearly", "custom"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`btn btn-sm ${type === p ? "btn-primary" : ""}`}
                  onClick={() => setType(p)}
                >
                  {t(p)}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label className="label">{t("from")} / {t("to")}</label>
            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <EthDatePicker
                  year={from.year}
                  month={from.month}
                  day={from.day}
                  onChange={(y, m, d) => setFrom({ year: y, month: m, day: d })}
                />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <EthDatePicker
                  year={to.year}
                  month={to.month}
                  day={to.day}
                  onChange={(y, m, d) => setTo({ year: y, month: m, day: d })}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-2">
          <div className="field">
            <label className="label">{t("patient")} ({t("optional")})</label>
            <input className="input" value={patientQuery} onChange={(e) => setPatientQuery(e.target.value)} placeholder="Search patient..." />
            {patientResults.length > 0 && !patientId ? (
              <div className="card-sm" style={{ position: "absolute", zIndex: 50, width: "100%", marginTop: 4, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}>
                {patientResults.map((p) => (
                  <button
                    key={p.id}
                    className="btn w-100"
                    style={{ justifyContent: "flex-start", background: "transparent", boxShadow: "none" }}
                    onClick={() => {
                      setPatientId(String(p.id));
                      setPatientResults([]);
                    }}
                  >
                    <b>{p.fullName}</b> <span className="text-muted">({p.familyCode})</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="field">
            <label className="label">{t("medicine")} ({t("optional")})</label>
            <select className="select" value={medicineId} onChange={(e) => setMedicineId(e.target.value)}>
              <option value="">{t("all")}</option>
              {medicines.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>
        {patientId ? (
          <button className="btn btn-sm btn-ghost" onClick={() => { setPatientId(""); setPatientQuery(""); }}>
            <Filter size={14} /> Clear patient filter
          </button>
        ) : null}
      </div>

      {loading ? (
        <div className="empty-state">Loading...</div>
      ) : data ? (
        <div id="report-area">
          <div className="print-only mb-4" style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: 22 }}>{t("printTitle")}</h1>
            <p>{t("reportGeneratedOn")}: {periodLabel} ({data.from} — {data.to})</p>
            <hr style={{ margin: "16px 0", border: "none borderTop: 1px solid #000" }} />
          </div>

          <div className="grid grid-stats mb-4">
            <div className="card stat-card">
              <div className="stat-label">{t("totalRecords")}</div>
              <div className="stat-value">{fmt(data.summary.count)}</div>
            </div>
            <div className="card stat-card">
              <div className="stat-label">{t("totalDispensed")}</div>
              <div className="stat-value">{fmt(data.summary.quantity)}</div>
            </div>
            <div className="card stat-card">
              <div className="stat-label">{t("totalExpenses")}</div>
              <div className="stat-value">{fmt(data.summary.total)} ETB</div>
            </div>
          </div>

          <div className="grid grid-2 mb-4">
            <div className="card">
              <h3 className="page-title" style={{ fontSize: 18, marginBottom: 16 }}>{t("medicineConsumption")}</h3>
              {data.byMedicine.length === 0 ? (
                <div className="empty-state">{t("noData")}</div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>{t("medicine")}</th>
                      <th>{t("quantity")}</th>
                      <th>{t("totalCost")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.byMedicine.map((m, i) => (
                      <tr key={m.medicineId}>
                        <td>{i + 1}</td>
                        <td style={{ fontWeight: 600 }}>{m.name}</td>
                        <td>{fmt(m.quantity)} {m.unit}</td>
                        <td style={{ fontWeight: 700 }}>{fmt(m.total)} ETB</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="text-right" style={{ fontWeight: 800 }}>{t("total")}</td>
                      <td style={{ fontWeight: 800, color: "var(--primary)" }}>{fmt(data.summary.total)} ETB</td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>

            <div className="card">
              <h3 className="page-title" style={{ fontSize: 18, marginBottom: 16 }}>{t("charts")}</h3>
              {chartData.length === 0 ? (
                <div className="empty-state">{t("noData")}</div>
              ) : (
                <div className="chart-box">
                  <ExpenseChart data={chartData} />
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="page-title" style={{ fontSize: 18, marginBottom: 16 }}>{t("patientTotals")}</h3>
            {data.byPatient.length === 0 ? (
              <div className="empty-state">{t("noData")}</div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{t("patient")}</th>
                    <th>{t("familyCode")}</th>
                    <th>{t("quantity")}</th>
                    <th>{t("totalCost")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.byPatient.map((p, i) => (
                    <tr key={p.patientId}>
                      <td>{i + 1}</td>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td>{p.familyCode}</td>
                      <td>{fmt(p.quantity)}</td>
                      <td style={{ fontWeight: 700 }}>{fmt(p.total)} ETB</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div style={{ marginTop: 32, display: "flex", justifyContent: "space-between" }}>
              <div style={{ width: "40%" }}>
                <p className="text-muted">{t("signatureArea")} 1</p>
              </div>
              <div style={{ width: "40%", textAlign: "right" }}>
                <p className="text-muted">{t("signatureArea")} 2</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <p className="text-muted mt-4" style={{ fontSize: 12 }}>
        <FileSpreadsheet size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />
        {t("pageTitle")} — {periodLabel}
      </p>
    </Layout>
  );
}