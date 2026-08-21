import ExcelJS from "exceljs";
import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "monthly";
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const patientId = searchParams.get("patientId");
  const medicineId = searchParams.get("medicineId");

  const where: Prisma.ExpenseWhereInput = {};
  if (from || to) {
    where.ethDate = {};
    if (from) where.ethDate.gte = from;
    if (to) where.ethDate.lte = to;
  }
  if (patientId) where.patientId = parseInt(patientId, 10);
  if (medicineId) where.medicineId = parseInt(medicineId, 10);

  const [expenses, hospitalName] = await Promise.all([
    prisma.expense.findMany({
      where,
      include: { patient: { include: { family: true } }, medicine: true },
      orderBy: { ethDate: "asc" },
    }),
    prisma.setting.findUnique({ where: { key: "hospitalName" } }),
  ]);

  const wb = new ExcelJS.Workbook();
  wb.creator = "Yetena Medhin";
  wb.created = new Date();

  const title = hospitalName?.value || "Yetena Medhin Hospital";

  // Summary sheet
  const summarySheet = wb.addWorksheet("Summary");
  summarySheet.columns = [
    { header: "Metric", key: "metric", width: 30 },
    { header: "Value", key: "value", width: 30 },
  ];
  const total = expenses.reduce((s, e) => s + Number(e.totalCost), 0);
  const totalQty = expenses.reduce((s, e) => s + Number(e.quantity), 0);
  summarySheet.addRows([
    { metric: "Period", value: `${from} to ${to}` },
    { metric: "Type", value: type },
    { metric: "Total Records", value: expenses.length },
    { metric: "Total Quantity Dispensed", value: totalQty },
    { metric: "Total Cost (ETB)", value: total },
  ]);
  summarySheet.getColumn("A").font = { bold: true };

  // Medicine consumption sheet
  const medMap = new Map<number, { name: string; unit: string; qty: number; total: number }>();
  for (const e of expenses) {
    const cur = medMap.get(e.medicineId) || { name: e.medicine.name, unit: e.medicine.unit, qty: 0, total: 0 };
    cur.qty += Number(e.quantity);
    cur.total += Number(e.totalCost);
    medMap.set(e.medicineId, cur);
  }
  const medSheet = wb.addWorksheet("Medicine Consumption");
  medSheet.columns = [
    { header: "Medicine", key: "name", width: 35 },
    { header: "Unit", key: "unit", width: 12 },
    { header: "Quantity", key: "qty", width: 15 },
    { header: "Total Cost (ETB)", key: "total", width: 18 },
  ];
  medSheet.addRows(
    [...medMap.values()].map((m) => ({ name: m.name, unit: m.unit, qty: m.qty, total: m.total }))
  );
  medSheet.getRow(1).font = { bold: true };

  // Patient totals sheet
  const patMap = new Map<number, { name: string; familyCode: string; qty: number; total: number }>();
  for (const e of expenses) {
    const cur = patMap.get(e.patientId) || {
      name: e.patient.fullName,
      familyCode: e.patient.family.familyCode,
      qty: 0,
      total: 0,
    };
    cur.qty += Number(e.quantity);
    cur.total += Number(e.totalCost);
    patMap.set(e.patientId, cur);
  }
  const patSheet = wb.addWorksheet("Patient Totals");
  patSheet.columns = [
    { header: "Patient", key: "name", width: 35 },
    { header: "Family Code", key: "familyCode", width: 20 },
    { header: "Quantity", key: "qty", width: 15 },
    { header: "Total Cost (ETB)", key: "total", width: 18 },
  ];
  patSheet.addRows(
    [...patMap.values()].map((p) => ({ name: p.name, familyCode: p.familyCode, qty: p.qty, total: p.total }))
  );
  patSheet.getRow(1).font = { bold: true };

  // Details sheet
  const detailSheet = wb.addWorksheet("Details");
  detailSheet.columns = [
    { header: "Date (EC)", key: "date", width: 14 },
    { header: "Patient", key: "patient", width: 30 },
    { header: "Card No", key: "card", width: 20 },
    { header: "Family Code", key: "family", width: 16 },
    { header: "Medicine", key: "medicine", width: 30 },
    { header: "Qty", key: "qty", width: 10 },
    { header: "Unit", key: "unit", width: 10 },
    { header: "Unit Price", key: "price", width: 14 },
    { header: "Total (ETB)", key: "total", width: 14 },
    { header: "Prescribed By", key: "doctor", width: 20 },
  ];
  detailSheet.addRows(
    expenses.map((e) => ({
      date: e.ethDate,
      patient: e.patient.fullName,
      card: e.patient.cardNo || "",
      family: e.patient.family.familyCode,
      medicine: e.medicine.name,
      qty: Number(e.quantity),
      unit: e.medicine.unit,
      price: Number(e.unitPrice),
      total: Number(e.totalCost),
      doctor: e.prescribedBy || "",
    }))
  );
  detailSheet.getRow(1).font = { bold: true };

  const buffer = await wb.xlsx.writeBuffer();

  return new Response(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="yetena_report_${Date.now()}.xlsx"`,
    },
  });
}