import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { todayEth } from "@/lib/ethcal";
import Layout from "@/components/Layout";
import PatientForm from "@/components/PatientForm";

export const dynamic = "force-dynamic";

export default async function EditPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const id = parseInt((await params).id, 10);
  const today = todayEth();

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: { family: true },
  });

  if (!patient) {
    return (
      <Layout>
        <div className="empty-state">Patient not found</div>
      </Layout>
    );
  }

  const families = await prisma.family.findMany({
    where: { ethYear: patient.family.ethYear },
    orderBy: { createdAt: "desc" },
    include: { patients: true },
  });

  return (
    <Layout>
      <Link href={`/patients/${id}`} className="btn btn-sm btn-ghost mb-4">
        <ArrowLeft size={16} /> Back
      </Link>
      <h1 className="page-title">Edit Patient</h1>
      <p className="page-sub">Edit patient details for {patient.fullName}</p>

      <PatientForm
        mode="edit"
        families={families}
        defaultYear={patient.family.ethYear}
        patient={{
          id: patient.id,
          fullName: patient.fullName,
          gender: patient.gender,
          ageOrBirth: patient.ageOrBirth,
          cardNo: patient.cardNo,
          relationToHead: patient.relationToHead,
          familyId: patient.familyId,
        }}
      />
    </Layout>
  );
}