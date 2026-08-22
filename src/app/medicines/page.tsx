import { prisma } from "@/lib/prisma";
import MedicinesClient from "./MedicinesClient";

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

  const totalsMap = new Map(totals.map((t) => [t.medicineId, { quantity: Number(t._sum.quantity ?? 0), totalCost: Number(t._sum.totalCost ?? 0) }]));

  return <MedicinesClient medicines={medicines} totalsMap={Object.fromEntries(totalsMap)} />;
}