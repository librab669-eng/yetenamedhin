"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exec } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { todayEth, ethDateString, startOfYearEth } from "@/lib/ethcal";

function num(v: FormDataEntryValue | null): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}

function nextFamilyCode(year: number): Promise<string> {
  return prisma.$transaction(async (tx) => {
    const setting = await tx.setting.findUnique({ where: { key: "family_seq" } });
    const seq = setting ? parseInt(setting.value, 10) + 1 : 1;
    await tx.setting.upsert({
      where: { key: "family_seq" },
      create: { key: "family_seq", value: String(seq) },
      update: { key: "family_seq", value: String(seq) },
    });
    return `YM-${year}-${String(seq).padStart(4, "0")}`;
  });
}

export async function createPatient(formData: FormData) {
  const year = num(formData.get("ethYear"));
  const headName = str(formData.get("headName"));
  const phone = str(formData.get("phone"));
  const address = str(formData.get("address"));
  const fullName = str(formData.get("fullName"));
  const gender = str(formData.get("gender"));
  const ageOrBirth = str(formData.get("ageOrBirth"));
  const cardNo = str(formData.get("cardNo"));
  const relationToHead = str(formData.get("relationToHead"));
  const familyIdRaw = str(formData.get("familyId"));

  let familyId: number;
  if (familyIdRaw) {
    familyId = parseInt(familyIdRaw, 10);
  } else {
    const code = await nextFamilyCode(year);
    const family = await prisma.family.create({
      data: { familyCode: code, headName, phone, address, ethYear: year },
    });
    familyId = family.id;
  }

  await prisma.patient.create({
    data: {
      familyId,
      fullName,
      gender: gender || null,
      ageOrBirth: ageOrBirth || null,
      cardNo: cardNo || null,
      relationToHead: relationToHead || null,
    },
  });

  revalidatePath("/patients");
  revalidatePath("/");
  redirect("/patients");
}

export async function updatePatient(id: number, formData: FormData) {
  const fullName = str(formData.get("fullName"));
  const gender = str(formData.get("gender"));
  const ageOrBirth = str(formData.get("ageOrBirth"));
  const cardNo = str(formData.get("cardNo"));
  const relationToHead = str(formData.get("relationToHead"));
  const notes = str(formData.get("notes"));

  await prisma.patient.update({
    where: { id },
    data: {
      fullName,
      gender: gender || null,
      ageOrBirth: ageOrBirth || null,
      cardNo: cardNo || null,
      relationToHead: relationToHead || null,
      notes: notes || null,
    },
  });

  revalidatePath(`/patients/${id}`);
  revalidatePath("/patients");
  revalidatePath("/");
  redirect(`/patients/${id}`);
}

export async function deletePatient(id: number) {
  await prisma.patient.delete({ where: { id } });
  revalidatePath("/patients");
  revalidatePath("/");
  redirect("/patients");
}

export async function createMedicine(formData: FormData) {
  const name = str(formData.get("name"));
  const nameAm = str(formData.get("nameAm"));
  const unit = str(formData.get("unit")) || "tab";
  const pricePerUnit = num(formData.get("pricePerUnit"));

  await prisma.medicine.create({
    data: { name, nameAm: nameAm || null, unit, pricePerUnit },
  });

  revalidatePath("/medicines");
  revalidatePath("/");
  redirect("/medicines");
}

export async function updateMedicine(id: number, formData: FormData) {
  const name = str(formData.get("name"));
  const nameAm = str(formData.get("nameAm"));
  const unit = str(formData.get("unit")) || "tab";
  const pricePerUnit = num(formData.get("pricePerUnit"));
  const isActive = formData.get("isActive") === "on" || formData.get("isActive") === "true";

  await prisma.medicine.update({
    where: { id },
    data: { name, nameAm: nameAm || null, unit, pricePerUnit, isActive },
  });

  revalidatePath("/medicines");
  revalidatePath("/");
  redirect("/medicines");
}

export async function deleteMedicine(id: number) {
  await prisma.medicine.delete({ where: { id } });
  revalidatePath("/medicines");
  revalidatePath("/");
  redirect("/medicines");
}

export async function createExpense(formData: FormData) {
  const patientId = parseInt(str(formData.get("patientId")), 10);
  const medicineId = parseInt(str(formData.get("medicineId")), 10);
  const quantity = num(formData.get("quantity")) || 1;
  const unitPrice = num(formData.get("unitPrice"));
  const year = num(formData.get("ethYear"));
  const month = num(formData.get("ethMonth"));
  const day = num(formData.get("ethDay"));
  const prescribedBy = str(formData.get("prescribedBy"));

  if (!medicineId || medicineId <= 0) throw new Error("Please select a medicine");
  const medicine = await prisma.medicine.findUnique({ where: { id: medicineId } });
  if (!medicine) throw new Error("Medicine not found");
  const price = unitPrice > 0 ? unitPrice : Number(medicine.pricePerUnit);

  await prisma.expense.create({
    data: {
      patientId,
      medicineId,
      quantity,
      unitPrice: price,
      totalCost: price * quantity,
      ethDate: ethDateString(year, month, day),
      ethYear: year,
      ethMonth: month,
      ethDay: day,
      prescribedBy: prescribedBy || null,
    },
  });

  revalidatePath(`/patients/${patientId}`);
  revalidatePath("/patients");
  revalidatePath("/expenses");
  revalidatePath("/reports");
  revalidatePath("/");
  redirect(`/patients/${patientId}`);
}

export async function deleteExpense(id: number, patientId: number) {
  await prisma.expense.delete({ where: { id } });
  revalidatePath(`/patients/${patientId}`);
  revalidatePath("/patients");
  revalidatePath("/expenses");
  revalidatePath("/reports");
  revalidatePath("/");
  redirect(`/patients/${patientId}`);
}

export async function updateExpense(id: number, formData: FormData) {
  const medicineId = parseInt(str(formData.get("medicineId")), 10);
  const quantity = num(formData.get("quantity")) || 1;
  const unitPrice = num(formData.get("unitPrice"));
  const year = num(formData.get("ethYear"));
  const month = num(formData.get("ethMonth"));
  const day = num(formData.get("ethDay"));
  const prescribedBy = str(formData.get("prescribedBy"));

  if (!medicineId || medicineId <= 0) throw new Error("Please select a medicine");
  const medicine = await prisma.medicine.findUnique({ where: { id: medicineId } });
  if (!medicine) throw new Error("Medicine not found");
  const price = unitPrice > 0 ? unitPrice : Number(medicine.pricePerUnit);

  const expense = await prisma.expense.findUnique({ where: { id } });
  if (!expense) throw new Error("Expense not found");

  await prisma.expense.update({
    where: { id },
    data: {
      medicineId,
      quantity,
      unitPrice: price,
      totalCost: price * quantity,
      ethDate: ethDateString(year, month, day),
      ethYear: year,
      ethMonth: month,
      ethDay: day,
      prescribedBy: prescribedBy || null,
    },
  });

  revalidatePath(`/patients/${expense.patientId}`);
  revalidatePath("/patients");
  revalidatePath("/expenses");
  revalidatePath("/reports");
  revalidatePath("/");
  redirect(`/patients/${expense.patientId}`);
}

export async function updateSettings(formData: FormData) {
  const hospitalName = str(formData.get("hospitalName"));
  const backupInterval = num(formData.get("backupInterval"));
  const backupDir = str(formData.get("backupDir"));
  const logoFile = formData.get("hospitalLogo") as File | null;

  const upserts: { key: string; value: string }[] = [
    { key: "hospitalName", value: hospitalName },
    { key: "backupInterval", value: String(backupInterval) },
    { key: "backupDir", value: backupDir },
  ];

  if (logoFile && logoFile.size > 0) {
    const buffer = await logoFile.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mime = logoFile.type || "image/png";
    upserts.push({ key: "hospitalLogo", value: `data:${mime};base64,${base64}` });
  } else if (formData.get("hospitalLogo") === "") {
    // Explicit removal
    upserts.push({ key: "hospitalLogo", value: "" });
  }

  await prisma.$transaction(
    upserts.map((u) =>
      prisma.setting.upsert({
        where: { key: u.key },
        create: u,
        update: { value: u.value },
      })
    )
  );

  revalidatePath("/settings");
  revalidatePath("/");
  redirect("/settings");
}

export async function changePin(formData: FormData) {
  const current = str(formData.get("currentPin"));
  const next = str(formData.get("newPin"));
  const currentSetting = await prisma.setting.findUnique({ where: { key: "pin" } });
  const currentValid = currentSetting?.value ?? "0000";
  if (current !== currentValid) throw new Error("Current PIN incorrect");

  await prisma.setting.upsert({
    where: { key: "pin" },
    create: { key: "pin", value: next },
    update: { value: next },
  });

  revalidatePath("/settings");
  redirect("/settings");
}

export async function runBackup(formData: FormData) {
  const pgDump = process.env.BACKUP_PG_DUMP;
  const dir = str(formData.get("backupDir")) || process.env.BACKUP_DIR || "C:\\YetenaBackups";
  const dbUrl = process.env.DATABASE_URL || "";

  await fs.mkdir(dir, { recursive: true });

  const today = todayEth();
  const fileName = `yetena_${today.year}-${String(today.month).padStart(2, "0")}-${String(today.day).padStart(2, "0")}_${Date.now()}.dump`;
  const filePath = path.join(/*turbopackIgnore: true*/ dir, fileName);

  const url = new URL(dbUrl);
  const host = url.hostname;
  const port = url.port;
  const db = url.pathname.slice(1);
  const user = decodeURIComponent(url.username);

  const env = { ...process.env, PGPASSWORD: decodeURIComponent(url.password || "") };

  await new Promise<void>((resolve, reject) => {
    exec(
      `"${pgDump}" -h ${host} -p ${port} -U ${user} -Fc -f "${filePath}" ${db}`,
      { env },
      (err) => (err ? reject(err) : resolve())
    );
  });

  const stat = await fs.stat(filePath);
  await prisma.backupLog.create({
    data: { fileName, sizeBytes: BigInt(stat.size), kind: "manual" },
  });

  revalidatePath("/settings");
  redirect("/settings");
}

export async function cleanupBackupHistory(formData: FormData) {
  const keep = Math.max(1, num(formData.get("keep")) || 20);
  const logs = await prisma.backupLog.findMany({ orderBy: { createdAt: "desc" }, skip: keep });
  for (const log of logs) {
    const dir = process.env.BACKUP_DIR || "C:\\YetenaBackups";
    await fs.unlink(path.join(/*turbopackIgnore: true*/ dir, log.fileName)).catch(() => {});
    await prisma.backupLog.delete({ where: { id: log.id } });
  }
  revalidatePath("/settings");
  redirect("/settings");
}