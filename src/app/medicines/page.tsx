import { prisma } from "@/lib/prisma";
import Layout from "@/components/Layout";
import MedicineForm from "@/components/MedicineForm";

export const dynamic = "force-dynamic";

export default async function MedicinesPage() {
  const medicines = (await prisma.medicine.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { expenses: true } } },
  })).map(m => ({
    ...m,
    pricePerUnit: Number(m.pricePerUnit),
  }));

  const totals = await prisma.expense.groupBy({
    by: ["medicineId"],
    _sum: { quantity: true, totalCost: true },
  });

  const totalsMap = new Map(totals.map((t) => [t.medicineId, t._sum]));

  return (
    <Layout>
      <div className="row-between mb-4">
        <div>
          <h1 className="page-title">Medicines</h1>
          <p className="page-sub">Medicine inventory and dispensing prices</p>
        </div>
        <MedicineForm mode="create" />
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table className="table">
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Unit Price</th>
              <th>Unit</th>
              <th>Total Dispensed</th>
              <th>Total Value</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((m) => {
              const t = totalsMap.get(m.id);
              return (
                <tr key={m.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{m.name}</div>
                    {m.nameAm ? <div className="text-muted" style={{ fontSize: 12 }}>{m.nameAm}</div> : null}
                  </td>
                  <td>{Number(m.pricePerUnit).toLocaleString()} ETB</td>
                  <td>{m.unit}</td>
                  <td>
                    {t ? `${Number(t.quantity).toLocaleString()} ${m.unit}` : "0"}
                  </td>
                  <td style={{ fontWeight: 700 }}>
                    {t ? Number(t.totalCost).toLocaleString() : 0} ETB
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
      </div>
    </Layout>
  );
}