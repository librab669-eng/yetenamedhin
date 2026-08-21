import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const medicines = await prisma.medicine.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
  return Response.json(
    medicines.map((m) => ({
      id: m.id,
      name: m.name,
      nameAm: m.nameAm,
      unit: m.unit,
      pricePerUnit: Number(m.pricePerUnit),
    }))
  );
}