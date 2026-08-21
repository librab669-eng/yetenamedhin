import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const familyId = searchParams.get("familyId");

  const patients = await prisma.patient.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { fullName: { contains: q, mode: "insensitive" } },
                { cardNo: { contains: q, mode: "insensitive" } },
                { family: { familyCode: { contains: q, mode: "insensitive" } } },
                { family: { headName: { contains: q, mode: "insensitive" } } },
              ],
            }
          : {},
        familyId ? { familyId: parseInt(familyId, 10) } : {},
      ],
    },
    include: { family: true },
    orderBy: { fullName: "asc" },
    take: 30,
  });

  return Response.json(
    patients.map((p) => ({
      id: p.id,
      fullName: p.fullName,
      cardNo: p.cardNo,
      familyCode: p.family.familyCode,
      familyHead: p.family.headName,
      familyId: p.familyId,
    }))
  );
}