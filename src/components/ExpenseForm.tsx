"use client";

import { useMemo, useState, useEffect } from "react";
import { Plus, X, AlertCircle } from "lucide-react";
import { useLang } from "@/lib/lang-context";
import { todayEth, ethDateString } from "@/lib/ethcal";
import EthDatePicker from "./EthDatePicker";
import { createExpense, updateExpense } from "@/app/actions";

interface MedicineOption {
  id: number;
  name: string;
  nameAm: string | null;
  unit: string;
  pricePerUnit: number | { toString(): string };
}

interface ExpenseFormProps {
  patientId?: number;
  medicines: MedicineOption[];
  familyYear?: number;
  expense?: any;
}

export default function ExpenseForm({
  patientId,
  medicines,
  familyYear,
  expense,
}: ExpenseFormProps) {
  const { t } = useLang();
  const today = useMemo(() => todayEth(), []);
  const isEdit = !!expense;
  const [medicineId, setMedicineId] = useState<number>(expense?.medicineId || 0);
  const [year, setYear] = useState(expense?.ethYear ?? familyYear ?? today.year);
  const [month, setMonth] = useState(expense?.ethMonth || today.month);
  const [day, setDay] = useState(expense?.ethDay || today.day);
  const [quantity, setQuantity] = useState(expense ? Number(expense.quantity) : 1);
  const [unitPrice, setUnitPrice] = useState(expense ? Number(expense.unitPrice) : 0);
  const [prescribedBy, setPrescribedBy] = useState(expense?.prescribedBy || "");
  const [error, setError] = useState<string | null>(null);

  const medicine = medicines.find((m) => m.id === medicineId);
  const price = medicine ? Number(medicine.pricePerUnit) : 0;

  // Sync price when medicine changes
  useEffect(() => {
    if (medicine && !isEdit) setUnitPrice(Number(medicine.pricePerUnit));
  }, [medicineId, medicine, isEdit]);

  const validateForm = () => {
    if (!medicineId || medicineId <= 0) {
      setError(t("requiredField") + ": " + t("medicine"));
      return false;
    }
    if (!quantity || quantity <= 0) {
      setError(t("requiredField") + ": " + t("quantity"));
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (formData: FormData) => {
    if (!validateForm()) return;
    try {
      if (isEdit) {
        await updateExpense(expense.id, formData);
      } else {
        await createExpense(formData);
      }
    } catch (err: any) {
      setError(err.message || t("saveSuccess"));
    }
  };

  if (!medicines.length) return null;

  return (
    <div className="card">
      <div className="row-between mb-4">
        <h3 className="page-title" style={{ fontSize: 18, marginBottom: 16 }}>
          {isEdit ? t("editExpense") : t("logExpense")}
        </h3>
        {isEdit && (
          <button className="btn btn-sm btn-ghost" onClick={() => window.location.reload()}>
            <X size={14} /> {t("cancel")}
          </button>
        )}
      </div>

      {error && (
        <div className="card-sm" style={{ background: "rgba(235, 87, 87, 0.1)", border: "1px solid var(--danger)", color: "var(--danger)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <form action={handleSubmit}>
        {patientId ? <input type="hidden" name="patientId" value={patientId} /> : null}
        {isEdit && <input type="hidden" name="expenseId" value={expense.id} />}
        <input type="hidden" name="ethYear" value={year} />
        <input type="hidden" name="ethMonth" value={month} />
        <input type="hidden" name="ethDay" value={day} />

        <div className="field">
          <label className="label">{t("medicine")}</label>
          <select
            className="select"
            name="medicineId"
            value={medicineId}
            onChange={(e) => { setMedicineId(Number(e.target.value)); setError(null); }}
            required
          >
            <option value={0} disabled>
              {t("selectMedicine")}
            </option>
            {medicines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} — {Number(m.pricePerUnit).toLocaleString()} ETB/{m.unit}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-2">
          <div className="field">
            <label className="label">{t("quantity")}</label>
            <input className="input" name="quantity" type="number" min="0" step="any" defaultValue={quantity} required onChange={(e) => { setQuantity(Number(e.target.value)); setError(null); }} />
          </div>
          <div className="field">
            <label className="label">{t("unit")}</label>
            <input className="input" value={medicine?.unit ?? ""} readOnly style={{ opacity: 0.7 }} />
          </div>
        </div>

        <div className="field">
          <label className="label">{t("pricePerUnit")}</label>
          <input
            className="input"
            name="unitPrice"
            type="number"
            min="0"
            step="any"
            defaultValue={unitPrice}
            placeholder={price ? String(price) : "0.00"}
            onChange={(e) => { setUnitPrice(Number(e.target.value)); setError(null); }}
          />
        </div>

        <div className="field">
          <label className="label">{t("ethDate")}</label>
          <EthDatePicker year={year} month={month} day={day} onChange={(y, m, d) => { setYear(y); setMonth(m); setDay(d); setError(null); }} />
        </div>

        <div className="field">
          <label className="label">{t("prescribedBy")} ({t("optional")})</label>
          <input className="input" name="prescribedBy" defaultValue={prescribedBy} onChange={(e) => setPrescribedBy(e.target.value)} />
        </div>

        <div className="row-between">
          <div className="text-muted">
            Total: <b style={{ color: "var(--primary)" }}>{((medicineId ? price : 0) * quantity).toLocaleString()} ETB</b>
          </div>
          <button className="btn btn-primary" type="submit">
            <Plus size={18} /> {isEdit ? t("save") : t("addExpense")}
          </button>
        </div>
      </form>
    </div>
  );
}