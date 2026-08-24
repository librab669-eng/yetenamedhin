"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Search, X, Trash2 } from "lucide-react";
import { useLang } from "@/lib/lang-context";
import { todayEth } from "@/lib/ethcal";
import EthDatePicker from "@/components/EthDatePicker";
import ExpenseForm from "@/components/ExpenseForm";
import { deleteExpense, updateExpense } from "@/app/actions";
import Layout from "@/components/Layout";

interface PatientOption {
  id: number;
  fullName: string;
  cardNo: string | null;
  familyCode: string;
  familyHead: string;
  familyId: number;
}

interface ExpenseRow {
  id: number;
  ethDate: string;
  quantity: number | { toString(): string };
  unitPrice: number | { toString(): string };
  totalCost: number | { toString(): string };
  prescribedBy: string | null;
  medicine: { name: string; unit: string };
  patient: { id: number; fullName: string; family: { familyCode: string } };
}

export default function ExpensesPage() {
  const { t } = useLang();
  const today = useMemo(() => todayEth(), []);
  const [patientSearch, setPatientSearch] = useState("");
  const [patientResults, setPatientResults] = useState<PatientOption[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null);
  const [dateFrom, setDateFrom] = useState(`${today.year}-${String(today.month).padStart(2, "0")}-01`);
  const [dateTo, setDateTo] = useState(`${today.year}-${String(today.month).padStart(2, "0")}-${String(today.day).padStart(2, "0")}`);
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseRow | null>(null);

  const searchPatients = useCallback(
    async (q: string) => {
      const res = await fetch(`/api/patients/search?q=${encodeURIComponent(q)}`);
      if (res.ok) setPatientResults(await res.json());
    },
    []
  );

  useEffect(() => {
    const delay = setTimeout(() => searchPatients(patientSearch), 250);
    return () => clearTimeout(delay);
  }, [patientSearch, searchPatients]);

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ from: dateFrom, to: dateTo });
    if (selectedPatient) params.set("patientId", String(selectedPatient.id));
    const res = await fetch(`/api/expenses?${params}`);
    if (res.ok) setExpenses(await res.json());
    setLoading(false);
  }, [dateFrom, dateTo, selectedPatient]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  // Handle edit from URL param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const editId = params.get("edit");
    if (editId) {
      const found = expenses.find(e => e.id === parseInt(editId, 10));
      if (found) setEditingExpense(found);
    }
  }, [expenses]);

  useEffect(() => {
    fetch("/api/medicines")
      .then((r) => r.json())
      .then(setMedicines)
      .catch(() => {});
  }, []);

  const total = expenses.reduce((s, e) => s + Number(e.totalCost), 0);

  const handleDelete = async (id: number, patientId: number) => {
    await deleteExpense(id, patientId);
    loadExpenses();
  };

  const handleEdit = (expense: ExpenseRow) => {
    setEditingExpense(expense);
    const url = new URL(window.location.href);
    url.searchParams.set("edit", String(expense.id));
    window.history.pushState({}, "", url);
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("edit");
    window.history.pushState({}, "", url);
  };

  return (
    <Layout>
      <h1 className="page-title">{t("expenseList")}</h1>
      <p className="page-sub">{t("dailyExpenses")}</p>

      <div className="card mb-4">
        <div className="grid grid-2" style={{ marginBottom: 16 }}>
          <div className="field">
            <label className="label">{t("patient")}</label>
            <div style={{ position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: 12, top: 12, color: "var(--text-muted)" }} />
              <input
                className="input"
                style={{ paddingLeft: 36 }}
                placeholder="Search patient..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
              />
            </div>
            {patientResults.length > 0 && !selectedPatient ? (
              <div className="card-sm" style={{ position: "absolute", zIndex: 50, width: "100%", marginTop: 4, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}>
                {patientResults.map((p) => (
                  <button
                    key={p.id}
                    className="btn w-100"
                    style={{ justifyContent: "flex-start", background: "transparent", boxShadow: "none" }}
                    onClick={() => {
                      setSelectedPatient(p);
                      setPatientResults([]);
                    }}
                  >
                    <div>
                      <b>{p.fullName}</b>
                      <div className="text-muted" style={{ fontSize: 12 }}>
                        {p.cardNo || "—"} · {p.familyCode} · {p.familyHead}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="row" style={{ alignItems: "flex-end" }}>
            <div className="field flex-1">
              <label className="label">{t("from")}</label>
              <input
                className="input"
                type="text"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="YYYY-MM-DD"
              />
            </div>
            <div className="field flex-1">
              <label className="label">{t("to")}</label>
              <input
                className="input"
                type="text"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="YYYY-MM-DD"
              />
            </div>
            <button className="btn btn-primary" onClick={loadExpenses}>
              {t("search")}
            </button>
          </div>
        </div>

        {selectedPatient ? (
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div className="badge badge-blue">
              {selectedPatient.fullName} — {selectedPatient.familyCode}
            </div>
            <button className="btn btn-sm btn-ghost" onClick={() => setSelectedPatient(null)}>
              <X size={14} /> Clear
            </button>
          </div>
        ) : null}
      </div>

      <div className="grid grid-2 mb-4">
        {editingExpense ? (
          <ExpenseForm
            patientId={selectedPatient?.id}
            medicines={medicines}
            expense={editingExpense}
          />
        ) : (
          <ExpenseForm
            patientId={selectedPatient?.id}
            medicines={medicines}
          />
        )}
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div className="row-between mb-4">
          <h2 className="page-title" style={{ fontSize: 18 }}>{t("expenseList")}</h2>
          <span className="badge badge-blue">{expenses.length} records</span>
        </div>

        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : expenses.length === 0 ? (
          <div className="empty-state">
            <p>{t("noData")}</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>{t("date")}</th>
                <th>{t("patient")}</th>
                <th>{t("medicine")}</th>
                <th>{t("quantity")}</th>
                <th>{t("totalCost")}</th>
                <th>{t("prescribedBy")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id}>
                  <td style={{ whiteSpace: "nowrap" }}>{e.ethDate}</td>
                  <td style={{ fontWeight: 600 }}>{e.patient.fullName}</td>
                  <td>{e.medicine.name}</td>
                  <td>{Number(e.quantity)} {e.medicine.unit}</td>
                  <td style={{ fontWeight: 800 }}>{Number(e.totalCost).toLocaleString()} ETB</td>
                  <td>{e.prescribedBy || "—"}</td>
                  <td>
                    <div className="row" style={{ gap: 4 }}>
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => handleEdit(e)}
                      >
                        <Search size={14} /> Edit
                      </button>
                      <form action={async () => {
                        await handleDelete(e.id, e.patient.id);
                      }}>
                        <button className="btn btn-sm btn-danger" type="submit">
                          <Trash2 size={14} />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="text-right" style={{ fontWeight: 800 }}>{t("total")}</td>
                <td style={{ fontWeight: 800, color: "var(--primary)" }}>{total.toLocaleString()} ETB</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </Layout>
  );
}