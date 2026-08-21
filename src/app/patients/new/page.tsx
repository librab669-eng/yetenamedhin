import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { todayEth } from "@/lib/ethcal";
import Layout from "@/components/Layout";
import PatientForm from "@/components/PatientForm";

export const dynamic = "force-dynamic";

export default async function NewPatientPage() {
  const today = todayEth();
  const families = await prisma.family.findMany({
    where: { ethYear: today.year, status: "active" },
    orderBy: { createdAt: "desc" },
    include: { patients: true },
  });

  return (
    <Layout>
      <Link href="/patients" className="btn btn-sm btn-ghost mb-4">
        <ArrowLeft size={16} /> Back
      </Link>
      <h1 className="page-title">Register Patient</h1>
      <p className="page-sub">Create a family case file for the year {today.year} EC</p>

      <PatientForm mode="create" families={families} defaultYear={today.year} />
    </Layout>
  );
}