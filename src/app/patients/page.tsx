import { prisma } from "@/lib/prisma";
import PatientsClient from "./PatientsClient";

export const dynamic = "force-dynamic";

export default async function PatientsPage() {
  // Fetch all patients on server
  const allPatients = await prisma.patient.findMany({
    include: { family: true },
    orderBy: { createdAt: "desc" },
  });

  const patients = allPatients.map((p) => ({
    id: p.id,
    fullName: p.fullName,
    cardNo: p.cardNo,
    familyCode: p.family.familyCode,
    familyHead: p.family.headName,
    familyId: p.family.ethYear,
  }));

  return <PatientsClient initialPatients={patients} />;
}