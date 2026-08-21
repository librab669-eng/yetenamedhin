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
  const familyId = searchParams.get("familyId");

  const where: Prisma.ExpenseWhereInput = {};
  if (from || to) {
    where.ethDate = {};
    if (from) where.ethDate.gte = from;
    if (to) where.ethDate.lte = to;
  }
  if (patientId) where.patientId = parseInt(patientId, 10);
  if (medicineId) where.medicineId = parseInt(medicineId, 10);
  if (familyId) where.patient = { familyId: parseInt(familyId, 10) };

  const [summary, byMedicine, byPatient, byMonth] = await Promise.all([
    prisma.expense.aggregate({
      where,
      _sum: { quantity: true, totalCost: true },
      _count: true,
    }),
    prisma.expense.groupBy({
      by: ["medicineId"],
      where,
      _sum: { quantity: true, totalCost: true },
      orderBy: { _sum: { totalCost: "desc" } },
    }),
    prisma.expense.groupBy({
      by: ["patientId"],
      where,
      _sum: { totalCost: true, quantity: true },
      orderBy: { _sum: { totalCost: "desc" } },
    }),
    prisma.expense.groupBy({
      by: ["ethYear", "ethMonth"],
      where,
      _sum: { totalCost: true },
      orderBy: [{ ethYear: "asc" }, { ethMonth: "asc" }],
    }),
  ]);

  const medicines = await prisma.medicine.findMany({
    where: { id: { in: byMedicine.map((b) => b.medicineId) } },
  });
  const medicineMap = new Map(medicines.map((m) => [m.id, m]));

  const patients = await prisma.patient.findMany({
    where: { id: { in: byPatient.map((b) => b.patientId) } },
    include: { family: true },
  });
  const patientMap = new Map(patients.map((p) => [p.id, p]));

  return Response.json({
    type,
    from,
    to,
    summary: {
      count: summary._count,
      quantity: Number(summary._sum.quantity ?? 0),
      total: Number(summary._sum.totalCost ?? 0),
    },
    byMedicine: byMedicine.map((b) => ({
      medicineId: b.medicineId,
      name: medicineMap.get(b.medicineId)?.name ?? "Unknown",
      unit: medicineMap.get(b.medicineId)?.unit ?? "",
      quantity: Number(b._sum.quantity ?? 0),
      total: Number(b._sum.totalCost ?? 0),
    })),
    byPatient: byPatient.map((b) => {
      const p = patientMap.get(b.patientId);
      return {
        patientId: b.patientId,
        name: p?.fullName ?? "Unknown",
        familyCode: p?.family.familyCode ?? "",
        quantity: Number(b._sum.quantity ?? 0),
        total: Number(b._sum.totalCost ?? 0),
      };
    }),
    monthly: byMonth.map((b) => ({
      ethYear: b.ethYear,
      ethMonth: b.ethMonth,
      total: Number(b._sum.totalCost ?? 0),
    })),
  });
}