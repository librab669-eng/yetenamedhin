"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import Layout from "@/components/Layout";
import MedicineForm from "@/components/MedicineForm";
import { useLang } from "@/lib/lang-context";

interface Medicine {
  id: number;
  name: string;
  nameAm: string | null;
  pricePerUnit: number;
  unit: string;
  isActive: boolean;
  _count: { expenses: number };
}

interface Totals {
  quantity: number;
  totalCost: number;
}

interface MedicinesClientProps {
  medicines: Medicine[];
  totalsMap: Record<string, Totals>;
}

export default function MedicinesClient({ medicines, totalsMap }: MedicinesClientProps) {
  const { t } = useLang();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return medicines;
    const q = query.toLowerCase();
    return medicines.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.nameAm?.toLowerCase().includes(q)
    );
  }, [medicines, query]);

  return (
    <Layout>
      <div className="row-between mb-4">
        <div>
          <h1 className="page-title">{t("medicines")}</h1>
          <p className="page-sub">Medicine inventory and dispensing prices</p>
        </div>
        <MedicineForm mode="create" />
      </div>

      <div className="card mb-4" style={{ padding: 16 }}>
        <div className="field" style={{ maxWidth: 400 }}>
          <label className="label">{t("search")}</label>
          <div style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: 12, color: "var(--text-muted)" }} />
            <input
              className="input"
              placeholder="Search medicines..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ paddingLeft: 36 }}
            />
          </div>
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: 32 }}>
            <p>{t("noData")}</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>{t("medicine")}</th>
                <th>Unit Price</th>
                <th>Unit</th>
                <th>Total Dispensed</th>
                <th>Total Value</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => {
                const mt = totalsMap[m.id];
                return (
                  <tr key={m.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{m.name}</div>
                      {m.nameAm ? <div className="text-muted" style={{ fontSize: 12 }}>{m.nameAm}</div> : null}
                    </td>
                    <td>{m.pricePerUnit.toLocaleString()} ETB</td>
                    <td>{m.unit}</td>
                    <td>
                      {mt ? `${Number(mt.quantity).toLocaleString()} ${m.unit}` : "0"}
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {mt ? Number(mt.totalCost).toLocaleString() : 0} ETB
                    </td>
                    <td>
                      {m.isActive ? (
                        <span className="badge badge-green">Active</span>
                      ) : (
                        <span className="badge badge-red">Inactive</span>
                      )}
                    </td>
                    <td>
                      <MedicineForm mode="edit" medicine={m} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
