import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
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

  const expenses = await prisma.expense.findMany({
    where,
    include: { patient: { include: { family: true } }, medicine: true },
    orderBy: { ethDate: "desc" },
    take: 1000,
  });

  return Response.json(
    expenses.map((e) => ({
      id: e.id,
      ethDate: e.ethDate,
      ethYear: e.ethYear,
      ethMonth: e.ethMonth,
      ethDay: e.ethDay,
      quantity: Number(e.quantity),
      unitPrice: Number(e.unitPrice),
      totalCost: Number(e.totalCost),
      prescribedBy: e.prescribedBy,
      medicine: { name: e.medicine.name, unit: e.medicine.unit, id: e.medicineId },
      patient: {
        id: e.patient.id,
        fullName: e.patient.fullName,
        family: { familyCode: e.patient.family.familyCode },
      },
    }))
  );
}