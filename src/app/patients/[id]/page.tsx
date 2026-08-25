import Link from "next/link";
import { ArrowLeft, Pencil, Trash2, Plus, Pill } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Layout from "@/components/Layout";
import { deleteExpense } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const id = parseInt((await params).id, 10);
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      family: true,
      expenses: { include: { medicine: true }, orderBy: { ethDate: "desc" } },
    },
  });

  if (!patient) {
    return (
      <Layout>
        <div className="empty-state">
          <p>Patient not found</p>
          <Link href="/patients" className="btn mt-2">Back to patients</Link>
        </div>
      </Layout>
    );
  }

  const total = patient.expenses.reduce((sum, e) => sum + Number(e.totalCost), 0);

  return (
    <Layout>
      <div className="row-between mb-4">
        <Link href="/patients" className="btn btn-sm btn-ghost">
          <ArrowLeft size={16} /> Back
        </Link>
        <div className="row" style={{ gap: 8 }}>
          <Link href={`/patients/${id}/edit`} className="btn btn-sm">
            <Pencil size={16} /> Edit
          </Link>
          <Link href={`/expenses?patientId=${id}`} className="btn btn-sm btn-primary">
            <Pill size={16} /> Log Expense
          </Link>
        </div>
      </div>

      <div className="card mb-4">
        <h1 className="page-title">{patient.fullName}</h1>
        <div className="text-muted mb-4">
          Card: {patient.cardNo || "—"} · {patient.gender ? (patient.gender === "male" ? "Male" : "Female") : "—"} · {patient.ageOrBirth || "—"}
        </div>
        <div className="grid grid-2">
          <div className="card-sm">
            <div className="label">Family Code</div>
            <b>{patient.family.familyCode}</b>
            <div className="label mt-2">Head of Family</div>
            {patient.family.headName}
          </div>
          <div className="card-sm">
            <div className="label">Year Case File</div>
            <b>{patient.family.ethYear} EC</b>
            <div className="label mt-2">Total Expenses</div>
            <b style={{ color: "var(--primary)" }}>{total.toLocaleString()} ETB</b>
          </div>
        </div>
        {patient.notes ? <div className="text-muted mt-4">Notes: {patient.notes}</div> : null}
      </div>

      <div className="card">
        <div className="row-between mb-4">
          <h2 className="page-title" style={{ fontSize: 18 }}>Family Case File — Expense History</h2>
          <span className="badge badge-blue">{patient.expenses.length} records</span>
        </div>

        {patient.expenses.length === 0 ? (
          <div className="empty-state">
            <p>No expenses logged for this patient yet.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date (EC)</th>
                <th>Medicine</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
                <th>Prescribed By</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {patient.expenses.map((e) => (
                <tr key={e.id}>
                  <td style={{ whiteSpace: "nowrap" }}>{e.ethDate}</td>
                  <td style={{ fontWeight: 600 }}>{e.medicine.name}</td>
                  <td>{Number(e.quantity)} {e.medicine.unit}</td>
                  <td>{Number(e.unitPrice).toLocaleString()} ETB</td>
                  <td style={{ fontWeight: 800 }}>{Number(e.totalCost).toLocaleString()} ETB</td>
                  <td>{e.prescribedBy || "—"}</td>
                  <td>
                    <div className="row" style={{ gap: 4 }}>
                      <Link href={`/expenses?patientId=${id}&edit=${e.id}`} className="btn btn-sm btn-ghost">
                        <Pencil size={14} />
                      </Link>
                      <form action={async () => {
                        "use server";
                        if (window.confirm("Are you sure you want to delete this expense?")) {
                          await deleteExpense(e.id, patient.id);
                        }
                      }}>
                        <button className="btn btn-sm btn-danger" type="submit"><Trash2 size={14} /></button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="text-right" style={{ fontWeight: 800 }}>Total</td>
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
